import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GameState } from '../../game/model/models';
import type { Difficulty, FactionId } from '../../game/model/enums';
import type { Route } from '../../navigation/Routes';
import { NEW_GAME } from '../../navigation/Routes';
import { startGame } from '../../game/engine/setup';
import { systemRandom } from '../../game/engine/gameRandom';
import type { AchievementRepository } from '../../data/AchievementRepository';
import type { Analytics } from '../../analytics/Analytics';
import { Events } from '../../analytics/AnalyticsEvents';
import type { MooseGuide } from '../../moose/MooseGuide';
import { MooseButton, MooseDialog } from '../moose/MooseChat';
import { SaveRepository, type SaveMeta } from '../../data/SaveRepository';
import { SettingsRepository, type Settings } from '../../data/SettingsRepository';
import { GameMusic } from '../../audio/GameMusic';
import { Ads } from '../../ads/Ads';
import { AdBanner } from '../../ads/AdBanner';
import { AdUnits } from '../../ads/adUnits';
import { useStore, createStore } from '../../lib/store';
import { useLocale, t } from '../../i18n';
import { attackPower } from '../../game/engine/combat';
import { useGameViewModel } from './GameViewModel';
import { useCardTexts } from './cards/CardResources';
import { CardDetailDialog, CardTray } from './cards/CardViews';
import { TopBar, type PanelTab } from './hud/TopBar';
import { useMapCamera } from './map/mapCamera';
import { GameMap } from './map/GameMap';
import { SidePanel } from './panels/SidePanel';
import { ProvincePanel } from './panels/ProvincePanel';
import { ChroniclePanel, RealmPanel } from './panels/RealmPanels';
import { DiplomacyPanel } from './panels/DiplomacyPanel';
import { AiTurnOverlay, ArmyBanner, GameOverDialog, IncomeToast, MessageToast, PauseMenuDialog, type PauseActions, EngagementLayer } from './overlays/GameOverlays';
import { BattleDialog } from './overlays/BattleDialog';
import { TributeButton, TributeDialog } from './overlays/Tribute';
import { GameButton } from '../components/GameButton';
import { RoundIconButton } from '../components/RoundIconButton';
import { GameIcon } from '../icons/GameIcons';
import './game.css';

const emptySaveSlots = createStore<Record<number, SaveMeta>>({});
const emptySettings = createStore<Settings>({ musicVolume: 0.5, musicMuted: false, analyticsConsent: 'UNDECIDED' });
const emptyRewardReady = createStore(true);
export interface GameScreenProps {
  initialGame?: GameState;
  route?: Route;
  faction?: FactionId;
  difficulty?: Difficulty;
  loadSlot?: number;
  saves?: SaveRepository;
  settings?: SettingsRepository;
  music?: GameMusic;
  ads?: Ads;
  achievements?: AchievementRepository;
  analytics?: Analytics;
  moose?: MooseGuide;
  onExit: () => void;
  onNewGame: () => void;
  onLoadGame: () => void;
  onRulebook: () => void;
  onSettings: () => void;
}
/** Campaign board, HUD, side drawer, hand and all in-game dialogs. */
export function GameScreen(rawProps: Record<string, unknown>) {
  const props = rawProps as unknown as GameScreenProps;
  const { initialGame: suppliedGame, route, faction: factionProp, difficulty: difficultyProp, loadSlot: loadSlotProp, saves, settings, music, ads, achievements, analytics, moose, onExit, onNewGame, onLoadGame, onRulebook, onSettings } = props;
  useLocale();
  const gameRoute = route?.screen === 'Game' ? route : null;
  const faction = factionProp ?? gameRoute?.faction ?? 'mongol';
  const difficulty = difficultyProp ?? gameRoute?.difficulty ?? 'normal';
  const loadSlot = loadSlotProp ?? gameRoute?.loadSlot ?? NEW_GAME;
  const initialGame = useMemo(() => suppliedGame ?? (loadSlot !== NEW_GAME ? saves?.takeOrLoad(loadSlot) : null) ?? startGame(faction, difficulty, systemRandom), [suppliedGame, saves, loadSlot, faction, difficulty]);
  const ui = useGameViewModel(initialGame, { saves, achievements, analytics });
  useEffect(() => { analytics?.track(Events.gameStart(initialGame, loadSlot !== NEW_GAME)); }, [analytics, initialGame, loadSlot]);
  const cardTexts = useCardTexts();
  const camera = useMapCamera();
  const [panel, setPanel] = useState<PanelTab | null>(null), [lastPanel, setLastPanel] = useState<PanelTab>('Province');
  const [trayOpen, setTrayOpen] = useState(false), [detailCardId, setDetailCardId] = useState<string | null>(null);
  const [pauseOpen, setPauseOpen] = useState(false), [saveOpen, setSaveOpen] = useState(false), [tributeOpen, setTributeOpen] = useState(false), [mooseOpen, setMooseOpen] = useState(false);
  const [incomeVisible, setIncomeVisible] = useState(false);
  const [incomeShownTurn, setIncomeShownTurn] = useState(-1);
  const [combatTurn, setCombatTurn] = useState(-1);
  const game = ui.game;
  const slots = useStore(saves?.slots ?? emptySaveSlots);
  useEffect(() => { saves?.refresh(); }, [saves]);
  const muted = useStore(settings?.settings ?? emptySettings).musicMuted;
  const rewardEarnedReady = useStore(ads?.rewardReady ?? emptyRewardReady);
  const adsReady = useStore(ads?.ready ?? emptyRewardReady);
  const rewardReady = rewardEarnedReady && adsReady;
  const togglePanel = (tab: PanelTab) => { setPanel((current) => { const next = current === tab ? null : tab; if (next) setLastPanel(next); return next; }); };

  useEffect(() => { camera.topInset = 68; }, [camera]);
  useEffect(() => {
    camera.setRightInset(panel ? 356 : 0);
    if (panel && ui.selectedProvinceId) {
      const province = game.provinces.find((p) => p.id === ui.selectedProvinceId);
      if (province) camera.intoView(province.center);
    }
  }, [camera, panel, ui.selectedProvinceId, game.provinces]);
  useEffect(() => { if (ui.lastBattle) setCombatTurn(game.turn); }, [ui.lastBattle, game.turn]);
  useEffect(() => { music?.setMood(combatTurn === game.turn ? 'COMBAT' : 'CALM'); return () => music?.setMood('CALM'); }, [music, combatTurn, game.turn]);
  useEffect(() => {
    if (incomeShownTurn === game.turn) return;
    if (ads?.fullScreenShowing.get()) return;
    setIncomeShownTurn(game.turn); setIncomeVisible(true);
    const timer = window.setTimeout(() => setIncomeVisible(false), 4000); return () => window.clearTimeout(timer);
  }, [game.turn, incomeShownTurn, ads]);
  useEffect(() => {
    if (!ads) return;
    return ads.fullScreenShowing.subscribe(() => { if (!ads.fullScreenShowing.get() && incomeShownTurn !== game.turn) { setIncomeShownTurn(game.turn); setIncomeVisible(true); window.setTimeout(() => setIncomeVisible(false), 4000); } });
  }, [ads, game.turn, incomeShownTurn]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (detailCardId) setDetailCardId(null); else if (mooseOpen) setMooseOpen(false); else if (tributeOpen) setTributeOpen(false); else if (saveOpen) setSaveOpen(false); else if (pauseOpen) setPauseOpen(false); else if (panel) setPanel(null); else if (ui.selectedArmyId) ui.clearSelection(); else if (!game.gameOver) setPauseOpen(true);
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [detailCardId, mooseOpen, tributeOpen, saveOpen, pauseOpen, panel, ui, game.gameOver]);

  const pickProvince = useCallback((id: string) => { if (!ui.onProvinceTap(id)) { setPanel('Province'); setLastPanel('Province'); } }, [ui]);
  const playReward = (kind: 'GOLD' | 'CARD' | 'SECOND_CHANCE') => {
    if (!ads || !rewardReady) return;
    void ads.showReward().then((earned) => { if (!earned) return; if (kind === 'SECOND_CHANCE') ui.takeSecondChance(); else ui.takeTribute(kind); });
  };
  const askAdBreak = (moment: 'TURN_END' | 'EXIT_TO_MENU' | 'GAME_OVER') => ads ? ads.interstitialBreak(moment, game.turn) : Promise.resolve();
  const onEndTurn = () => { const turn = game.turn; ui.endTurn(); if (ads) void ads.interstitialBreak('TURN_END', turn); };
  const panelAction = useMemo(() => ({
    onSelectArmy: ui.onArmyTap, onMergeInto: ui.mergeSelectedInto,
    onRecruit: (type: 'infantry' | 'cavalry') => { if (ui.selectedProvinceId) ui.recruit(ui.selectedProvinceId, type); },
    onRepair: (artisan: boolean) => { if (ui.selectedProvinceId) ui.repair(ui.selectedProvinceId, artisan); },
    onBuild: (type: import('../../game/model/enums').BuildingType) => { if (ui.selectedProvinceId) ui.build(ui.selectedProvinceId, type); },
  }), [ui]);
  const pauseActions: PauseActions = {
    onToggleMusic: () => settings?.setMusicMuted(!muted), onResume: () => setPauseOpen(false),
    onSave: () => { setPauseOpen(false); setSaveOpen(true); }, onLoad: () => { setPauseOpen(false); saves?.autosave(game); onLoadGame(); },
    onRulebook: () => { setPauseOpen(false); onRulebook(); }, onSettings: () => { setPauseOpen(false); onSettings(); },
    onExit: () => { setPauseOpen(false); saves?.autosave(game); void askAdBreak('EXIT_TO_MENU').then(onExit); },
  };
  const messages = ui.messages;
  const message = messages[0] ?? null;
  const tributeAvailable = !!ads && rewardReady && ui.canTakeTribute && !ui.processingTurn;
  const secondChanceAvailable = !!ads && rewardReady && game.gameOver && game.winnerId !== game.playerFactionId && !game.secondChanceUsed;
  const selectedArmy = game.armies.find((a) => a.id === ui.selectedArmyId);
  const victory = game.gameOver && game.winnerId === game.playerFactionId;

  return <main className="game-screen">
    <GameMap state={game} selectedProvinceId={ui.selectedProvinceId} selectedArmyId={ui.selectedArmyId} moveTargets={ui.moveTargets} attackTargets={ui.attackTargets} onProvinceTap={pickProvince} onArmyTap={ui.onArmyTap} camera={camera} />
    <EngagementLayer game={game} />
    <TopBar game={game} openTab={panel} endTurnEnabled={!ui.processingTurn && !game.gameOver} onMenu={() => setPauseOpen(true)} onTab={togglePanel} onEndTurn={onEndTurn} />
    <div className="game-main">
      <div className="game-map-column"><div className="game-toast-stack">
        <IncomeToast game={game} visible={incomeVisible} />
        <MessageToast message={message?.message ?? null} cardTexts={cardTexts} onDone={() => message && ui.dismissMessage(message.id)} />
        {selectedArmy && <ArmyBanner army={selectedArmy} attackPower={attackPower(selectedArmy, selectedArmy.ownerId === game.playerFactionId ? game.attackBonus : 0)} />}
      </div>
      <div className="game-overlay-tools">
        {tributeAvailable && <TributeButton onClick={() => setTributeOpen(true)} size={44} />}
        <RoundIconButton icon={<GameIcon name="ZoomIn" width={20} />} contentDescription={t('map_zoom_in')} onClick={() => camera.animateZoomBy(1.6)} size={40} />
        <RoundIconButton icon={<GameIcon name="ZoomOut" width={20} />} contentDescription={t('map_zoom_out')} onClick={() => camera.animateZoomBy(1 / 1.6)} size={40} />
        <RoundIconButton icon={<GameIcon name="FitMap" width={20} />} contentDescription={t('map_show_all')} onClick={() => camera.fit()} size={40} />
        <MooseButton className="game-moose-button" onClick={() => setMooseOpen(true)} />
      </div>
      <CardTray game={game} texts={cardTexts} expanded={trayOpen} onToggle={() => setTrayOpen((x) => !x)} onCardClick={(card) => setDetailCardId(card.id)} />
      </div>
      {panel && <SidePanel tab={lastPanel} onTab={(tab) => { setLastPanel(tab); setPanel(tab); }} onClose={() => setPanel(null)} footer={ads ? <AdBanner ads={ads} slot={AdUnits.BANNER_GAME} /> : null}>
        {lastPanel === 'Province' && <ProvincePanel game={game} province={game.provinces.find((p) => p.id === ui.selectedProvinceId) ?? null} selectedArmyId={ui.selectedArmyId} actions={panelAction} />}
        {lastPanel === 'Realm' && <RealmPanel game={game} cardTexts={cardTexts} />}
        {lastPanel === 'Chronicle' && <ChroniclePanel game={game} />}
        {lastPanel === 'Diplomacy' && <DiplomacyPanel game={game} onPropose={ui.propose} onBreak={ui.breakTreaty} />}
      </SidePanel>}
    </div>
    <AiTurnOverlay visible={ui.processingTurn} />
    {ui.lastBattle && <BattleDialog battle={ui.lastBattle} provinceName={game.provinces.find((p) => p.id === ui.lastBattle?.provinceId)?.name ?? ''} captured={game.provinces.find((p) => p.id === ui.lastBattle?.provinceId)?.ownerId === ui.lastBattle.attackerFaction} onClose={ui.dismissBattle} />}
    {detailCardId && game.hand.find((card) => card.id === detailCardId) && <CardDetailDialog card={game.hand.find((card) => card.id === detailCardId)!} text={cardTexts[detailCardId]} onPlay={() => { ui.playCard(detailCardId); setDetailCardId(null); }} onDismiss={() => setDetailCardId(null)} />}
    {game.gameOver && !ui.lastBattle && <GameOverDialog game={game} onPlayAgain={() => { analytics?.track(Events.campaignRestart(game)); onNewGame(); }} onMainMenu={() => { if (victory) onExit(); else void askAdBreak('GAME_OVER').then(onExit); }} onSecondChance={secondChanceAvailable ? () => playReward('SECOND_CHANCE') : null} />}
    {tributeOpen && <TributeDialog gold={ui.tributeGold} canDrawCard={ui.canDrawTributeCard} onGold={() => { setTributeOpen(false); playReward('GOLD'); }} onCard={() => { setTributeOpen(false); playReward('CARD'); }} onDismiss={() => setTributeOpen(false)} />}
    {pauseOpen && <PauseMenuDialog musicMuted={muted} actions={pauseActions} />}
    {mooseOpen && moose && <MooseDialog guide={moose} onDismiss={() => setMooseOpen(false)} />}
    {saveOpen && <div className="game-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setSaveOpen(false); }}><section className="game-dialog" role="dialog" aria-modal="true"><h2>{t('pause_save')}</h2><p>{t('save_choose_slot')}</p><div className="save-slots">{[1, 2, 3, 4, 5].map((slot) => <GameButton key={slot} variant="Secondary" onClick={() => { ui.saveToSlot(slot); setSaveOpen(false); }}>{slots[slot] ? `#${slot} · ${t('log_turn_header', slots[slot].turn, slots[slot].year)}` : `#${slot} · ${t('save_empty_slot')}`}</GameButton>)}</div><GameButton variant="Secondary" onClick={() => setSaveOpen(false)} style={{ marginTop: 10 }}>{t('common_close')}</GameButton></section></div>}
  </main>;
}
export default GameScreen;
