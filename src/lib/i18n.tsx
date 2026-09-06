/**
 * i18n.tsx — Kevyt kaksikielinen käännösjärjestelmä (suomi / englanti)
 *
 * Ei ulkoista riippuvuutta — pelkkä Context + sanakirja + t()-funktio.
 * Kieli tallennetaan localStorageen ja säilyy istuntojen välillä.
 */
import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';

export type Language = 'fi' | 'en';

const LANGUAGE_STORAGE_KEY = 'arojen_tarinat_language';

const detectDefaultLanguage = (): Language => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'fi' || stored === 'en') return stored;
  } catch {
    // ignore
  }
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('fi')) {
    return 'fi';
  }
  return 'en';
};

// Käännösavaimet: fi = alkuperäinen suomenkielinen teksti (oletus),
// en = englanninkielinen vastine. Lisää uusia avaimia tähän sitä mukaa
// kun komponentteja käännetään.
export const translations: Record<Language, Record<string, string>> = {
  fi: {
    'lang.switch': 'Kieli',
    'lang.fi': 'Suomi',
    'lang.en': 'English',

    'common.back': 'Takaisin',
    'common.close': 'Sulje',
    'common.loading': 'Ladataan...',

    'faction.title': 'Arojen Tarinat',
    'faction.subtitle': 'Vuosi 1206 — Valitse valtakuntasi',
    'faction.tagline': 'Suuri Hirvas lauloi tämän maailman olemaan — nyt sen kohtalo lauletaan teräksellä, kullalla ja liitoilla.',
    'faction.openCodex': 'Avaa Rajaseudun Kronikka — maailmankirja & kodeksi',
    'faction.howToPlay': '📜 Näin pelaat',
    'faction.howToPlayHint': 'Joka vuoro käyt läpi 6 vaihetta järjestyksessä. Paina "Seuraava" siirtyäksesi vaiheesta toiseen.',
    'faction.step1.title': 'Resurssit',
    'faction.step1.desc': 'Saat automaattisesti kultaa ja miehiä omilta alueilta.',
    'faction.step2.title': 'Kortit',
    'faction.step2.desc': 'Nosta kortti pakasta. Pelaa kortteja kädestäsi bonusten saamiseksi.',
    'faction.step3.title': 'Liikuta',
    'faction.step3.desc': 'Klikkaa omaa aluettasi → valitse armeija → klikkaa viereistä aluetta.',
    'faction.step4.title': 'Taistelu',
    'faction.step4.desc': 'Liiku vihollisen alueelle hyökätäksesi. Nopat ratkaisevat voittajan.',
    'faction.step5.title': 'Rakenna',
    'faction.step5.desc': 'Rakenna leiri, markkina tai linnoitus omille alueillesi.',
    'faction.step6.title': 'Lopeta vuoro',
    'faction.step6.desc': 'AI-vastustajat tekevät omat siirtonsa. Uusi vuoro alkaa.',
    'faction.goal.military.title': 'Valtaa pääkaupungit',
    'faction.goal.military.sub': 'Sotilasvoitto',
    'faction.goal.economic.title': '500 kultaa + Silkkitie',
    'faction.goal.economic.sub': 'Talousvoitto',
    'faction.goal.tech.title': '5 teknologiaa',
    'faction.goal.tech.sub': 'Teknologiavoitto',
    'faction.goal.diplomatic.title': '100 vaikutusvaltaa',
    'faction.goal.diplomatic.sub': 'Diplomatiavoitto',
    'faction.goal.cultural.title': '60 arvovaltaa (Ihmeet)',
    'faction.goal.cultural.sub': 'Kulttuurivoitto',
    'faction.rulebook': 'Sääntökirja (ohjeet)',
    'faction.worldChronicle': 'Maailman kronikka',
    'faction.difficulty': 'Vaikeustaso',
    'faction.select': 'Valitse',
    'difficulty.easy': 'Helppo',
    'difficulty.easyDesc': 'Tekoäly kerää vähemmän resursseja — hyvä aloitus uusille pelaajille.',
    'difficulty.normal': 'Normaali',
    'difficulty.normalDesc': 'Tasapainoinen haaste.',
    'difficulty.hard': 'Vaikea',
    'difficulty.hardDesc': 'Tekoäly kerää enemmän resursseja ja kasvaa nopeammin.',
    'faction.continueTitle': '💾 Jatka edellistä pelia',
    'faction.continueDesc': 'Tallennettu peli löytyi: vuoro {{turn}}, {{faction}}.',
    'faction.continueButton': 'Jatka peliä',
    'faction.newGameBelow': 'Tai aloita uusi peli alla',

    'stat.cavalry': 'Ratsuväki',
    'stat.economy': 'Talous',
    'stat.defense': 'Puolustus',
    'faction.specialAbility': 'Erityiskyky:',
    'faction.leadPrompt': 'Johda {{name}} ▶',
    'faction.clickToStart': 'Klikkaa valtakuntaa aloittaaksesi pelin',
    'ability.mongol': '🐴 +30% ratsuväen hyökkäys, nopea liike',
    'ability.jin': '🏯 +20% verot, vahvat linnoitukset',
    'ability.song': '💰 +30% verot, vahva talous',
    'ability.xixia': '⚖️ Tasapainoinen, +10% kaikki',
    'ability.khwarezm': '🛤️ +20% Silkkitien tulot',
    'ability.rus': '❄️ +10% puolustus, metsäbonus',
    'ability.kipchak': '🐎 +20% ratsuväki, nopea liike',

    'hud.gold': 'Kulta',
    'hud.food': 'Ruoka',
    'hud.horses': 'Hevoset',
    'hud.manpower': 'Miesvoima',
    'hud.artisans': 'Käsityöläiset',
    'hud.influence': 'Vaikutusvalta (diplomatiavoitto)',
    'hud.prestige': 'Arvovalta (kulttuurivoitto)',
    'hud.goalsButton': 'Voittotavoitteet & valtakuntien tilanne (kulta, alueet, Silkkitie)',
    'hud.muteOn': 'Musiikki pois päältä — klikkaa soittaaksesi',
    'hud.muteOff': 'Musiikki päällä — klikkaa mykistääksesi',
    'hud.codex': 'Rajaseudun Kronikka — maailmankirja & kodeksi',
    'hud.hide': '◀ Piilota',
    'hud.menu': '▶ Valikko',
    'hud.backToHome': 'Etusivulle',
    'hud.armySelected': 'Armeija valittu',
    'hud.movement': 'Liikettä',
    'hud.clickTarget': 'Klikkaa kohdealuetta kartalla',

    'resource.collected': '✅ Resurssit kerätty!',
    'resource.gold': 'kultaa',
    'resource.men': 'miehiä',
    'resource.food': 'ruokaa',
    'resource.silkRoad': 'Silkkitie',
    'resource.market': 'Markkinat',
    'resource.influence': 'Vaikutusvalta',
    'resource.prestige': 'Arvovalta',
    'resource.continue': 'Jatka seuraavaan vaiheeseen →',
    'resource.close': 'Sulje ilmoitus',

    'sidebar.tab.province': 'Alue',
    'sidebar.tab.goals': 'Tavoite',
    'sidebar.tab.log': 'Loki',
    'sidebar.tab.diplomacy': 'Dipl.',
    'sidebar.reset': 'Aloita alusta',

    'cards.none': 'Ei kortteja kädessä',
    'cards.deckLabel': 'pakassa',
    'cards.play': '▶ Pelaa',
    'cards.dragHint': 'Raahaa muuttaaksesi korttien kokoa — kaksoisklikkaa palauttaaksesi',

    'gameOver.victory': 'Voitto!',
    'gameOver.defeat': 'Tappio!',
    'gameOver.victory.military': 'Olet valloittanut tarpeeksi alueita hallitaksesi Euraasian!',
    'gameOver.victory.economic': 'Silkkitien solmukohdat ja aarrekammiosi ovat vertaansa vailla — kauppa on sinun!',
    'gameOver.victory.technology': 'Olet saavuttanut teknologisen ylivertaisuuden!',
    'gameOver.victory.diplomatic': 'Vaikutusvaltasi ja liittosi hallitsevat arojen politiikkaa — diplomatia voitti!',
    'gameOver.victory.cultural': 'Ihmeesi ja arvovaltasi loistavat yli aroja — kulttuurivoitto on sinun!',
    'gameOver.victory.generic': 'Olet voittanut pelin!',
    'gameOver.defeatText': 'Heimosi on tuhottu. Kaikki armeijat ja alueet on menetetty.',
    'gameOver.turnYear': 'Vuoro {{turn}} • Vuosi {{year}}',
    'gameOver.playAgain': 'Pelaa uudestaan',

    'phase.resource.label': 'Resurssit',
    'phase.resource.hint': 'Kerää resurssit hallituilta alueilta.',
    'phase.cards.label': 'Kortit',
    'phase.cards.hint': 'Nosta kortti ja pelaa kortteja kädestäsi.',
    'phase.move.label': 'Liike',
    'phase.move.hint': 'Valitse armeija ja liikuta sitä viereiseen alueeseen.',
    'phase.battle.label': 'Taistelu',
    'phase.battle.hint': 'Hyökkää viereistä vihollista vastaan.',
    'phase.build.label': 'Rakenna',
    'phase.build.hint': 'Rakenna leiri, markkina tai linnoitus.',
    'phase.end.label': 'Lopeta',
    'phase.end.hint': 'Lopeta vuoro ja anna AI-pelaajien toimia.',
    'phase.next': 'Seuraava',
    'phase.endTurn': 'Lopeta vuoro',
    'phase.aiActing': '⏳ AI-pelaajat toimivat...',

    'device.title': 'Käyttöliittymä',
    'device.desktop': 'Tietokone',
    'device.desktopDesc': 'Tiheämpi asettelu, sivupalkki aina näkyvissä, näppäimistö/hiiri-ohjaus.',
    'device.mobile': 'Puhelin',
    'device.mobileDesc': 'Suuremmat kosketuspainikkeet, alavalikko, yksinkertaistettu näkymä.',

    'moose.title': 'Hirvi-avustaja',
    'moose.greeting': 'Hei! Olen Hirvi, oppaasi Arojen Tarinoissa. Kysy minulta mitä tahansa pelistä! 🫎',
    'moose.placeholder': 'Kysy jotain pelistä...',
    'moose.send': 'Lähetä',
    'moose.thinking': 'Hirvi miettii...',
    'moose.fallback': 'Hmm, en ole varma tuosta — mutta kokeile Sääntökirjaa (📖) tai kysy toisin!',
    'moose.openAria': 'Avaa Hirvi-avustaja',

    'save.title': 'Tallenna / Lataa peli',
    'save.saveButton': 'Tallenna',
    'save.loadButton': 'Lataa',
    'save.deleteButton': 'Poista',
    'save.emptySlot': 'Tyhjä paikka',
    'save.slot': 'Paikka {{n}}',
    'save.turn': 'Vuoro {{turn}}',
    'save.confirmDelete': 'Poistetaanko tämä tallennus?',
    'save.saved': 'Peli tallennettu paikkaan {{n}}',
    'save.saveFailed': 'Tallennus epäonnistui (tallennustila voi olla täynnä).',
    'save.loaded': 'Peli ladattu',
    'save.noSaves': 'Ei tallennuksia vielä.',
  },
  en: {
    'lang.switch': 'Language',
    'lang.fi': 'Suomi',
    'lang.en': 'English',

    'common.back': 'Back',
    'common.close': 'Close',
    'common.loading': 'Loading...',

    'faction.title': 'Tales of the Steppe',
    'faction.subtitle': 'Year 1206 — Choose your realm',
    'faction.tagline': 'The Great Elk sang this world into being — now its fate is sung with steel, gold, and alliances.',
    'faction.openCodex': 'Open the Frontier Chronicle — world book & codex',
    'faction.howToPlay': '📜 How to play',
    'faction.howToPlayHint': 'Each turn you go through 6 phases in order. Press "Next" to move from one phase to another.',
    'faction.step1.title': 'Resources',
    'faction.step1.desc': 'You automatically gain gold and manpower from your provinces.',
    'faction.step2.title': 'Cards',
    'faction.step2.desc': 'Draw a card from the deck. Play cards from your hand for bonuses.',
    'faction.step3.title': 'Move',
    'faction.step3.desc': 'Click your own province → select an army → click a neighboring province.',
    'faction.step4.title': 'Battle',
    'faction.step4.desc': "Move into an enemy province to attack. Dice rolls decide the winner.",
    'faction.step5.title': 'Build',
    'faction.step5.desc': 'Build a camp, market, or fortress in your own provinces.',
    'faction.step6.title': 'End turn',
    'faction.step6.desc': 'AI opponents make their moves. A new turn begins.',
    'faction.goal.military.title': 'Capture the capitals',
    'faction.goal.military.sub': 'Military victory',
    'faction.goal.economic.title': '500 gold + Silk Road',
    'faction.goal.economic.sub': 'Economic victory',
    'faction.goal.tech.title': '5 technologies',
    'faction.goal.tech.sub': 'Technology victory',
    'faction.goal.diplomatic.title': '100 influence',
    'faction.goal.diplomatic.sub': 'Diplomatic victory',
    'faction.goal.cultural.title': '60 prestige (Wonders)',
    'faction.goal.cultural.sub': 'Cultural victory',
    'faction.rulebook': 'Rulebook (guide)',
    'faction.worldChronicle': 'World chronicle',
    'faction.difficulty': 'Difficulty',
    'faction.select': 'Select',
    'difficulty.easy': 'Easy',
    'difficulty.easyDesc': 'AI opponents gather fewer resources — a good start for new players.',
    'difficulty.normal': 'Normal',
    'difficulty.normalDesc': 'A balanced challenge.',
    'difficulty.hard': 'Hard',
    'difficulty.hardDesc': 'AI opponents gather more resources and grow faster.',
    'faction.continueTitle': '💾 Continue previous game',
    'faction.continueDesc': 'A saved game was found: turn {{turn}}, {{faction}}.',
    'faction.continueButton': 'Continue game',
    'faction.newGameBelow': 'Or start a new game below',

    'stat.cavalry': 'Cavalry',
    'stat.economy': 'Economy',
    'stat.defense': 'Defense',
    'faction.specialAbility': 'Special ability:',
    'faction.leadPrompt': 'Lead {{name}} ▶',
    'faction.clickToStart': 'Click a realm to start the game',
    'ability.mongol': '🐴 +30% cavalry attack, fast movement',
    'ability.jin': '🏯 +20% taxes, strong fortifications',
    'ability.song': '💰 +30% taxes, strong economy',
    'ability.xixia': '⚖️ Balanced, +10% everything',
    'ability.khwarezm': '🛤️ +20% Silk Road income',
    'ability.rus': '❄️ +10% defense, forest bonus',
    'ability.kipchak': '🐎 +20% cavalry, fast movement',

    'hud.gold': 'Gold',
    'hud.food': 'Food',
    'hud.horses': 'Horses',
    'hud.manpower': 'Manpower',
    'hud.artisans': 'Artisans',
    'hud.influence': 'Influence (diplomatic victory)',
    'hud.prestige': 'Prestige (cultural victory)',
    'hud.goalsButton': 'Victory goals & realm status (gold, provinces, Silk Road)',
    'hud.muteOn': 'Music off — click to play',
    'hud.muteOff': 'Music on — click to mute',
    'hud.codex': 'Frontier Chronicle — world book & codex',
    'hud.hide': '◀ Hide',
    'hud.menu': '▶ Menu',
    'hud.backToHome': 'Home',
    'hud.armySelected': 'Army selected',
    'hud.movement': 'Movement left',
    'hud.clickTarget': 'Click a target province on the map',

    'resource.collected': '✅ Resources collected!',
    'resource.gold': 'gold',
    'resource.men': 'men',
    'resource.food': 'food',
    'resource.silkRoad': 'Silk Road',
    'resource.market': 'Markets',
    'resource.influence': 'Influence',
    'resource.prestige': 'Prestige',
    'resource.continue': 'Continue to the next phase →',
    'resource.close': 'Close notification',

    'sidebar.tab.province': 'Province',
    'sidebar.tab.goals': 'Goals',
    'sidebar.tab.log': 'Log',
    'sidebar.tab.diplomacy': 'Diplo.',
    'sidebar.reset': 'Start over',

    'cards.none': 'No cards in hand',
    'cards.deckLabel': 'in deck',
    'cards.play': '▶ Play',
    'cards.dragHint': 'Drag to resize the card view — double-click to reset',

    'gameOver.victory': 'Victory!',
    'gameOver.defeat': 'Defeat!',
    'gameOver.victory.military': "You've conquered enough provinces to rule Eurasia!",
    'gameOver.victory.economic': 'Your Silk Road hubs and treasury are unmatched — trade is yours!',
    'gameOver.victory.technology': "You've achieved technological supremacy!",
    'gameOver.victory.diplomatic': 'Your influence and alliances dominate steppe politics — diplomacy wins!',
    'gameOver.victory.cultural': 'Your wonders and prestige outshine the steppes — cultural victory is yours!',
    'gameOver.victory.generic': "You've won the game!",
    'gameOver.defeatText': 'Your tribe has been destroyed. All armies and provinces are lost.',
    'gameOver.turnYear': 'Turn {{turn}} • Year {{year}}',
    'gameOver.playAgain': 'Play again',

    'phase.resource.label': 'Resources',
    'phase.resource.hint': 'Collect resources from your controlled provinces.',
    'phase.cards.label': 'Cards',
    'phase.cards.hint': 'Draw a card and play cards from your hand.',
    'phase.move.label': 'Move',
    'phase.move.hint': 'Select an army and move it to an adjacent province.',
    'phase.battle.label': 'Battle',
    'phase.battle.hint': 'Attack a neighboring enemy.',
    'phase.build.label': 'Build',
    'phase.build.hint': 'Build a camp, market, or fortress.',
    'phase.end.label': 'End',
    'phase.end.hint': "End the turn and let the AI players act.",
    'phase.next': 'Next',
    'phase.endTurn': 'End turn',
    'phase.aiActing': '⏳ AI players are acting...',

    'device.title': 'Interface',
    'device.desktop': 'Desktop',
    'device.desktopDesc': 'Denser layout, sidebar always visible, keyboard/mouse control.',
    'device.mobile': 'Mobile',
    'device.mobileDesc': 'Larger touch buttons, bottom menu, simplified view.',

    'moose.title': 'Moose Guide',
    'moose.greeting': "Hi! I'm Moose, your guide to Tales of the Steppe. Ask me anything about the game! 🫎",
    'moose.placeholder': 'Ask something about the game...',
    'moose.send': 'Send',
    'moose.thinking': 'Moose is thinking...',
    'moose.fallback': "Hmm, I'm not sure about that one — try the Rulebook (📖) or ask differently!",
    'moose.openAria': 'Open Moose guide',

    'save.title': 'Save / Load game',
    'save.saveButton': 'Save',
    'save.loadButton': 'Load',
    'save.deleteButton': 'Delete',
    'save.emptySlot': 'Empty slot',
    'save.slot': 'Slot {{n}}',
    'save.turn': 'Turn {{turn}}',
    'save.confirmDelete': 'Delete this save?',
    'save.saved': 'Game saved to slot {{n}}',
    'save.saveFailed': 'Save failed (storage may be full).',
    'save.loaded': 'Game loaded',
    'save.noSaves': 'No saves yet.',
  },
};

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => detectDefaultLanguage());

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const dict = translations[lang] || translations.en;
    let text = dict[key] ?? translations.en[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      });
    }
    return text;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
};
