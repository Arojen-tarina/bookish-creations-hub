import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { LoadingScreen } from './ui/screens/splash/LoadingScreen';
import { MainMenuScreen } from './ui/screens/menu/MainMenuScreen';
import { AnalyticsConsentDialog } from './ui/screens/menu/AnalyticsConsentDialog';
import { FactionSelectScreen } from './ui/screens/faction/FactionSelectScreen';
import { LoadGameScreen } from './ui/screens/saves/LoadGameScreen';
import { SettingsScreen } from './ui/screens/settings/SettingsScreen';
import { AchievementsScreen } from './ui/achievements/AchievementsScreen';
import { BookScreen } from './ui/book/BookScreen';
import { MooseDialog } from './ui/moose/MooseChat';
import { GameScreen } from './ui/game/GameScreen';
import { startGame } from './game/engine/setup';
import { systemRandom } from './game/engine/gameRandom';
import { AchievementToast } from './ui/achievements/AchievementsScreen';
import { useStore } from './lib/store';
import { detectLocale, setLocale, t } from './i18n';
import { Navigation } from './navigation/navigation';
import { CodexRoute, GameRoute, MenuRoute, NEW_GAME, RulebookRoute } from './navigation/Routes';
import { SaveRepository } from './data/SaveRepository';
import { AchievementRepository } from './data/AchievementRepository';
import { SettingsRepository } from './data/SettingsRepository';
import { Ads } from './ads/Ads';
import { AdBanner } from './ads/AdBanner';
import { AdOverlayHost } from './ads/AdOverlayHost';
import { ConsentBanner } from './ads/ConsentBanner';
import { GameMusic } from './audio/GameMusic';
import { Analytics, Events } from './analytics/Analytics';
import { MooseGuide } from './moose/MooseGuide';
import { MooseRemote } from './moose/MooseRemote';
import { ACHIEVEMENTS } from './game/achievements/achievementCatalog';
import { StatsTracker } from './game/achievements/statsTracker';
import type { AchievementCategory } from './ui/achievements/AchievementText';
interface AchievementDefinition { id: string; category: AchievementCategory; points: number; hidden?: boolean; legendary?: boolean; reward?: string | null; progress?: { current: number; target: number } | null }
import type { AchievementDef } from './game/achievements/achievementModel';
import type { Difficulty, FactionId } from './game/model/enums';

export const appServices = (() => {
  const settings = new SettingsRepository();
  const saves = new SaveRepository();
  const achievements = new AchievementRepository();
  const ads = new Ads();
  const music = new GameMusic(settings);
  const analytics = new Analytics(settings);
  const moose = new MooseGuide(new MooseRemote());
  return { settings, saves, achievements, ads, music, analytics, moose };
})();
if (typeof document !== 'undefined') setLocale(detectLocale());
const navigation = new Navigation();
const trackedFactionRoutes = new WeakSet<object>();

export default function App() {
  const route = useStore(navigation.route);
  const settings = useStore(appServices.settings.settings);
  const adsConsentDone = useStore(appServices.ads.consentFlowDone);
  const privacyOptionsRequired = useStore(appServices.ads.privacyOptionsRequired);
  const slots = useStore(appServices.saves.slots);
  const unlocked = useStore(appServices.achievements.unlocked);
  const playerStats = useStore(appServices.achievements.stats);
  const [mooseOpen, setMooseOpen] = useState(false);
  const [continueFailed, setContinueFailed] = useState(false);
  useEffect(() => {
    const lifecycle = () => { if (document.visibilityState === 'hidden') appServices.analytics.onBackground(); else appServices.analytics.onForeground(); };
    const pageHide = () => appServices.analytics.onBackground();
    document.addEventListener('visibilitychange', lifecycle);
    window.addEventListener('pagehide', pageHide);
    return () => { document.removeEventListener('visibilitychange', lifecycle); window.removeEventListener('pagehide', pageHide); };
  }, []);

  const onBack = useCallback(() => navigation.back(), []);
  const openSave = useCallback((slot: number) => {
    const meta = appServices.saves.slots.get()[slot];
    const state = appServices.saves.load(slot);
    if (!state || !meta) return false;
    appServices.saves.handOff(slot, state);
    navigation.navigate(GameRoute(meta.faction, meta.difficulty, slot), { popTo: 'Menu' });
    appServices.analytics.track(Events.gameLoaded(slot));
    return true;
  }, []);
  const preload = useCallback(async () => {
    appServices.saves.refresh();
    appServices.achievements.load();
    appServices.achievements.record(stats => { const now = new Date(); return StatsTracker.onAppOpened(stats, new Date(now.getTime() - now.getTimezoneOffset() * 60_000)); });
    appServices.analytics.onForeground();
    await appServices.ads.awaitAppOpen();
  }, []);
  const finishSplash = useCallback(() => navigation.navigate(MenuRoute, { replace: true }), []);
  const menuBanner = useCallback(() => <AdBanner ads={appServices.ads} slot="3145662729" />, []);

  const achievementDefinitions = useMemo<AchievementDefinition[]>(() => ACHIEVEMENTS.map((def: AchievementDef) => ({
    id: def.id,
    category: String(def.category).toLowerCase() as AchievementDefinition['category'],
    points: def.points,
    hidden: def.hidden,
    legendary: def.legendary,
    reward: def.reward ? String(def.reward).toLowerCase() : null,
    progress: def.check.progress?.(playerStats) ?? null,
  })), [unlocked, playerStats]);

  const initialGame = useMemo(() => route.screen !== 'Game' ? null : route.loadSlot === NEW_GAME ? startGame(route.faction, route.difficulty, systemRandom) : appServices.saves.takeOrLoad(route.loadSlot), [route.screen, route.screen === 'Game' ? route.faction : null, route.screen === 'Game' ? route.difficulty : null, route.screen === 'Game' ? route.loadSlot : null]);
  useEffect(() => {
    if (route.screen === 'FactionSelect' && !trackedFactionRoutes.has(route)) {
      trackedFactionRoutes.add(route);
      appServices.analytics.track(Events.onboarding('FACTION_SELECT_VIEWED'));
    }
  }, [route, initialGame]);

  const onStartGame = useCallback((faction: FactionId, difficulty: Difficulty) => {
    appServices.analytics.track(Events.onboarding('FACTION_CHOSEN'));
    navigation.navigate(GameRoute(faction, difficulty, NEW_GAME), { popTo: 'Menu' });
  }, []);

  const currentSlot = appServices.saves.continueSlot();
  const continueMeta = currentSlot === null ? undefined : slots[currentSlot];

  let screen;
  switch (route.screen) {
    case 'Splash':
      screen = <LoadingScreen preload={preload} onFinished={finishSplash} />;
      break;
    case 'Menu':
      screen = <MainMenuScreen
        continueInfo={continueMeta ? t('menu_continue_desc', continueMeta.turn, t(`faction_name_${continueMeta.faction}`)) : null}
        continueFailed={continueFailed}
        onContinue={() => {
          appServices.analytics.track(Events.menuInteraction('continue'));
          if (currentSlot === null) return;
          if (!openSave(currentSlot)) setContinueFailed(true);
          else setContinueFailed(false);
        }}
        onNewGame={() => { appServices.analytics.track(Events.menuInteraction('new_game')); navigation.navigate({ screen: 'FactionSelect' }); }}
        onLoadGame={() => { appServices.analytics.track(Events.menuInteraction('load_game')); navigation.navigate({ screen: 'Load' }); }}
        onAchievements={() => { appServices.analytics.track(Events.menuInteraction('achievements')); navigation.navigate({ screen: 'Achievements' }); }}
        onCodex={() => { appServices.analytics.track(Events.menuInteraction('codex')); navigation.navigate(CodexRoute); }}
        onRulebook={() => { appServices.analytics.track(Events.menuInteraction('rulebook')); navigation.navigate(RulebookRoute); }}
        onSettings={() => { appServices.analytics.track(Events.menuInteraction('settings')); navigation.navigate({ screen: 'Settings' }); }}
        onMoose={() => { appServices.analytics.track(Events.menuInteraction('moose')); setMooseOpen(true); }}
        banner={menuBanner}
      />;
      break;
    case 'FactionSelect':
      screen = <FactionSelectScreen replaces={continueMeta ? `Turn ${continueMeta.turn} · ${continueMeta.faction}` : null} onStart={onStartGame} onBack={onBack} />;
      break;
    case 'Game': {
      if (!initialGame) {
        screen = <main className="screen-root" style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}><section><p>{t('save_load_failed')}</p><button className="screen-button" onClick={() => navigation.navigate({ screen: 'Load' }, { replace: true })}>{t('menu_load_game')}</button></section></main>;
        break;
      }
      const GameScreenComponent = GameScreen as unknown as ComponentType<Record<string, unknown>>;
      screen = <GameScreenComponent
        initialGame={initialGame}
        saves={appServices.saves}
        achievements={appServices.achievements}
        analytics={appServices.analytics}
        moose={appServices.moose}
        music={appServices.music}
        settings={appServices.settings}
        ads={appServices.ads}
        onMoose={() => { appServices.analytics.track(Events.menuInteraction('moose')); setMooseOpen(true); }}
        onExit={() => navigation.navigate(MenuRoute, { popTo: 'Menu' })}
        onNewGame={() => navigation.navigate({ screen: 'FactionSelect' }, { popTo: 'Menu' })}
        onLoadGame={() => navigation.navigate({ screen: 'Load' })}
        onRulebook={() => navigation.navigate(RulebookRoute)}
        onSettings={() => navigation.navigate({ screen: 'Settings' })}
      />;
      break;
    }
    case 'Load':
      screen = <LoadGameScreen slots={slots} onLoad={(slot) => openSave(slot)} onDelete={(slot) => appServices.saves.delete(slot)} onBack={onBack} />;
      break;
    case 'Achievements':
      screen = <AchievementsScreen achievements={achievementDefinitions} unlocked={unlocked} stats={playerStats} onBack={onBack} />;
      break;
    case 'Codex':
      screen = <BookScreen kind="codex" onBack={onBack} onOpenOther={() => navigation.navigate(RulebookRoute, { replace: true })} banner={menuBanner} />;
      break;
    case 'Rulebook':
      screen = <BookScreen kind="rulebook" onBack={onBack} onOpenOther={() => navigation.navigate(CodexRoute, { replace: true })} banner={menuBanner} />;
      break;
    case 'Settings':
      screen = <SettingsScreen
        musicVolume={settings.musicVolume}
        musicMuted={settings.musicMuted}
        analyticsConsent={settings.analyticsConsent}
        privacyOptionsRequired={privacyOptionsRequired}
        onBack={onBack}
        onMusicVolumeChange={(volume) => appServices.settings.setMusicVolume(volume)}
        onMusicVolumePreview={(volume) => appServices.music.previewVolume(volume)}
        onMusicMutedChange={(muted) => appServices.settings.setMusicMuted(muted)}
        onAnalyticsConsentChange={(granted) => appServices.settings.setAnalyticsConsent(granted ? 'GRANTED' : 'DENIED')}
        onAdPrivacyOptions={() => appServices.ads.showPrivacyOptions()}
      />;
      break;
    default:
      screen = null;
  }

  const askAnalyticsConsent = route.screen === 'Menu' && settings.analyticsConsent === 'UNDECIDED' && adsConsentDone;
  return <div className="arojen-app">{screen}{mooseOpen && <MooseDialog guide={appServices.moose} onDismiss={() => setMooseOpen(false)} />}<AchievementToast repo={appServices.achievements} /><ConsentBanner ads={appServices.ads} /><AdOverlayHost ads={appServices.ads} music={appServices.music} />{askAnalyticsConsent && <AnalyticsConsentDialog onAccept={() => appServices.settings.setAnalyticsConsent('GRANTED')} onDecline={() => appServices.settings.setAnalyticsConsent('DENIED')} />}</div>;
}
