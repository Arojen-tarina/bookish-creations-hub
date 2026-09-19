/**
 * achievementDefinitions.ts — Kaikkien saavutusten datavetoinen määrittely
 *
 * Jokainen rivi on yksi saavutus: nimi/kuvaus (fi/en), kategoria, vaikeus,
 * arvioitu avausprosentti (suunnittelu-/analytiikkaviite), pisteet, palkinto
 * ja `check`-funktio joka lukee PlayerStats-tilastoista. Uuden saavutuksen
 * lisääminen = uusi rivi tähän taulukkoon, ei muutoksia moottorikoodiin.
 *
 * Pistetalous: pieniä palkintoja heti alussa (tutorial/early_game 10-20p),
 * kasvavasti arvokkaampia myöhemmin (challenge/historical 40-80p),
 * legendaarisissa saavutuksissa 100-150p — ei inflaatiota, koska pisteet
 * kasvavat maltillisesti ja taso (achievementTypes.pointsForLevel) vaatii
 * yhä enemmän pisteitä per taso.
 */
import type { AchievementDefinition, PlayerStats } from './achievementTypes.ts';
import { atLeast, atMost, atLeastUnique } from './achievementTypes.ts';
import type { FactionId } from '@/types/province.ts';

const victoryByFaction = (faction: FactionId, target = 1) =>
  (stats: PlayerStats) => (stats.victoriesByFaction[faction] ?? 0) >= target;

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  /* ================= TUTORIAL ================= */
  {
    id: 'tut_first_turn', category: 'tutorial', difficulty: 'trivial', estimatedUnlockRate: 0.95, points: 10,
    name: { fi: 'Ensimmäiset askeleet', en: 'First Steps' },
    description: { fi: 'Lopetit ensimmäisen vuorosi.', en: 'Ended your first turn.' },
    reward: { kind: 'badge', icon: '🥾', name: { fi: 'Aloittelijan merkki', en: 'Beginner Badge' } },
    ...atLeast('totalTurnsPlayed', 1),
  },
  {
    id: 'tut_first_card', category: 'tutorial', difficulty: 'trivial', estimatedUnlockRate: 0.9, points: 10,
    name: { fi: 'Ensimmäinen kortti', en: 'First Card' },
    description: { fi: 'Pelasit ensimmäisen korttisi.', en: 'Played your first card.' },
    reward: { kind: 'badge', icon: '🃏', name: { fi: 'Korttimestarin merkki', en: 'Card Novice Badge' } },
    ...atLeast('cardsPlayedTotal', 1),
  },
  {
    id: 'tut_first_building', category: 'tutorial', difficulty: 'trivial', estimatedUnlockRate: 0.85, points: 10,
    name: { fi: 'Perustuksen kivi', en: 'Foundation Stone' },
    description: { fi: 'Rakensit ensimmäisen rakennuksesi.', en: 'Built your first building.' },
    reward: { kind: 'badge', icon: '🧱', name: { fi: 'Rakentajan merkki', en: 'Builder Badge' } },
    ...atLeast('buildingsBuilt', 1),
  },
  {
    id: 'tut_first_recruit', category: 'tutorial', difficulty: 'trivial', estimatedUnlockRate: 0.85, points: 10,
    name: { fi: 'Kutsu aseisiin', en: 'Call to Arms' },
    description: { fi: 'Rekrytoit ensimmäisen yksikkösi.', en: 'Recruited your first unit.' },
    reward: { kind: 'badge', icon: '🪖', name: { fi: 'Rekrytoijan merkki', en: 'Recruiter Badge' } },
    ...atLeast('unitsRecruited', 1),
  },
  {
    id: 'tut_first_province', category: 'tutorial', difficulty: 'easy', estimatedUnlockRate: 0.8, points: 15,
    name: { fi: 'Ensimmäinen valloitus', en: 'First Conquest' },
    description: { fi: 'Valtasit ensimmäisen provinssin.', en: 'Captured your first province.' },
    reward: { kind: 'title', icon: '🏳️', name: { fi: 'Maanvaltaaja', en: 'Landtaker' } },
    ...atLeast('provincesCaptured', 1),
  },
  {
    id: 'tut_first_battle', category: 'tutorial', difficulty: 'easy', estimatedUnlockRate: 0.75, points: 15,
    name: { fi: 'Ensitaistelu', en: 'First Blood' },
    description: { fi: 'Voitit ensimmäisen taistelusi.', en: 'Won your first battle.' },
    reward: { kind: 'badge', icon: '⚔️', name: { fi: 'Soturin merkki', en: 'Warrior Badge' } },
    ...atLeast('battlesWon', 1),
  },

  /* ================= EARLY GAME ================= */
  {
    id: 'early_five_provinces', category: 'early_game', difficulty: 'easy', estimatedUnlockRate: 0.6, points: 20,
    name: { fi: 'Kasvava valtakunta', en: 'A Growing Realm' },
    description: { fi: 'Hallitset 5 provinssia yhtä aikaa.', en: 'Control 5 provinces at once.' },
    ...atLeast('maxProvincesOwnedInRun', 5),
  },
  {
    id: 'early_two_regions', category: 'early_game', difficulty: 'easy', estimatedUnlockRate: 0.55, points: 20,
    name: { fi: 'Rajojen yli', en: 'Beyond the Borders' },
    description: { fi: 'Hallitset provinsseja 2 eri alueella.', en: 'Control provinces in 2 different regions.' },
    ...atLeast('regionsControlledPeak', 2),
  },
  {
    id: 'early_first_alliance', category: 'early_game', difficulty: 'easy', estimatedUnlockRate: 0.5, points: 20,
    name: { fi: 'Ensimmäinen liittolainen', en: 'First Ally' },
    description: { fi: 'Solmit ensimmäisen liittosi.', en: 'Formed your first alliance.' },
    reward: { kind: 'badge', icon: '🤝', name: { fi: 'Liittolaisen merkki', en: 'Ally Badge' } },
    ...atLeast('alliancesFormed', 1),
  },
  {
    id: 'early_first_war', category: 'early_game', difficulty: 'easy', estimatedUnlockRate: 0.5, points: 20,
    name: { fi: 'Sodanjulistus', en: 'Declaration of War' },
    description: { fi: 'Julistit ensimmäisen sotasi.', en: 'Declared your first war.' },
    ...atLeast('warsDeclared', 1),
  },
  {
    id: 'early_ten_recruits', category: 'early_game', difficulty: 'easy', estimatedUnlockRate: 0.5, points: 20,
    name: { fi: 'Kasvava armeija', en: 'A Growing Army' },
    description: { fi: 'Rekrytoit yhteensä 10 yksikköä.', en: 'Recruited 10 units in total.' },
    ...atLeast('unitsRecruited', 10),
  },
  {
    id: 'early_hundred_gold', category: 'early_game', difficulty: 'easy', estimatedUnlockRate: 0.55, points: 20,
    name: { fi: 'Täysi kassa', en: 'Full Coffers' },
    description: { fi: 'Kartuta 100 kultaa valtionkassaan.', en: 'Build up 100 gold in your treasury.' },
    ...atLeast('peakTreasury', 100),
  },
  {
    id: 'early_all_buildings_started', category: 'early_game', difficulty: 'medium', estimatedUnlockRate: 0.35, points: 25,
    name: { fi: 'Rakennusmestari', en: 'Master Builder' },
    description: { fi: 'Rakensit jokaista rakennustyyppiä ainakin kerran.', en: 'Built every building type at least once.' },
    reward: { kind: 'badge', icon: '🏗️', name: { fi: 'Arkkitehdin merkki', en: 'Architect Badge' } },
    ...atLeastUnique('buildingTypesBuilt', 7),
  },

  /* ================= MID GAME ================= */
  {
    id: 'mid_twenty_provinces', category: 'mid_game', difficulty: 'medium', estimatedUnlockRate: 0.3, points: 30,
    name: { fi: 'Alueellinen valta', en: 'Regional Power' },
    description: { fi: 'Hallitset 20 provinssia yhtä aikaa.', en: 'Control 20 provinces at once.' },
    ...atLeast('maxProvincesOwnedInRun', 20),
  },
  {
    id: 'mid_five_regions', category: 'mid_game', difficulty: 'medium', estimatedUnlockRate: 0.28, points: 30,
    name: { fi: 'Mannerten hallitsija', en: 'Ruler of Realms' },
    description: { fi: 'Hallitset provinsseja 5 eri alueella.', en: 'Control provinces in 5 different regions.' },
    ...atLeast('regionsControlledPeak', 5),
  },
  {
    id: 'mid_thousand_gold', category: 'mid_game', difficulty: 'medium', estimatedUnlockRate: 0.3, points: 30,
    name: { fi: 'Kultainen kauppias', en: 'Golden Merchant' },
    description: { fi: 'Ansaitse yhteensä 1000 kultaa.', en: 'Earn a total of 1000 gold.' },
    ...atLeast('goldEarnedTotal', 1000),
  },
  {
    id: 'mid_three_tech', category: 'mid_game', difficulty: 'medium', estimatedUnlockRate: 0.3, points: 30,
    name: { fi: 'Tiedon kerääjä', en: 'Seeker of Knowledge' },
    description: { fi: 'Pelasit 3 teknologiakorttia.', en: 'Played 3 technology cards.' },
    ...atLeast('techCardsPlayedTotal', 3),
  },
  {
    id: 'mid_three_silk_hubs', category: 'mid_game', difficulty: 'medium', estimatedUnlockRate: 0.25, points: 35,
    name: { fi: 'Silkkitien herra', en: 'Lord of the Silk Road' },
    description: { fi: 'Hallitse 3 Silkkitien kauppasolmua yhtä aikaa.', en: 'Control 3 Silk Road trade hubs at once.' },
    reward: { kind: 'banner', icon: '🎗️', name: { fi: 'Silkkitien viiri', en: 'Silk Road Banner' } },
    ...atLeast('silkRoadHubsPeak', 3),
  },
  {
    id: 'mid_first_capital', category: 'mid_game', difficulty: 'medium', estimatedUnlockRate: 0.3, points: 35,
    name: { fi: 'Pääkaupungin kaatuminen', en: 'Fall of a Capital' },
    description: { fi: 'Valtasit vihollisen pääkaupungin.', en: "Captured an enemy's capital." },
    ...atLeast('capitalsCaptured', 1),
  },
  {
    id: 'mid_five_battle_streak', category: 'mid_game', difficulty: 'medium', estimatedUnlockRate: 0.25, points: 35,
    name: { fi: 'Voittoputki', en: 'Winning Streak' },
    description: { fi: 'Voita 5 taistelua peräkkäin.', en: 'Win 5 battles in a row.' },
    ...atLeast('longestWinStreakBattles', 5),
  },

  /* ================= END GAME ================= */
  {
    id: 'end_first_victory', category: 'end_game', difficulty: 'medium', estimatedUnlockRate: 0.25, points: 40,
    name: { fi: 'Ensimmäinen voitto', en: 'First Victory' },
    description: { fi: 'Voitit ensimmäisen pelisi millä tahansa tavalla.', en: 'Won your first game by any victory path.' },
    reward: { kind: 'title', icon: '🏆', name: { fi: 'Voittaja', en: 'Victor' } },
    ...atLeast('gamesWon', 1),
  },
  {
    id: 'end_military_victory', category: 'end_game', difficulty: 'medium', estimatedUnlockRate: 0.15, points: 45,
    name: { fi: 'Valloittaja', en: 'Conqueror' },
    description: { fi: 'Saavutit sotilaallisen voiton.', en: 'Achieved a military victory.' },
    reward: { kind: 'portrait', icon: '🐎', name: { fi: 'Kenraalin muotokuva', en: "General's Portrait" } },
    ...atLeast('militaryVictories', 1),
  },
  {
    id: 'end_economic_victory', category: 'end_game', difficulty: 'medium', estimatedUnlockRate: 0.15, points: 45,
    name: { fi: 'Kultainen valtakunta', en: 'Golden Empire' },
    description: { fi: 'Saavutit taloudellisen voiton.', en: 'Achieved an economic victory.' },
    reward: { kind: 'portrait', icon: '💰', name: { fi: 'Kaupparuhtinaan muotokuva', en: "Merchant Prince's Portrait" } },
    ...atLeast('economicVictories', 1),
  },
  {
    id: 'end_technology_victory', category: 'end_game', difficulty: 'medium', estimatedUnlockRate: 0.15, points: 45,
    name: { fi: 'Tiedon mestari', en: 'Master of Science' },
    description: { fi: 'Saavutit teknologisen voiton.', en: 'Achieved a technology victory.' },
    reward: { kind: 'portrait', icon: '🧭', name: { fi: 'Tietäjän muotokuva', en: "Sage's Portrait" } },
    ...atLeast('technologyVictories', 1),
  },
  {
    id: 'end_diplomatic_victory', category: 'end_game', difficulty: 'medium', estimatedUnlockRate: 0.15, points: 45,
    name: { fi: 'Suurliitto', en: 'Grand Alliance' },
    description: { fi: 'Saavutit diplomaattisen voiton.', en: 'Achieved a diplomatic victory.' },
    reward: { kind: 'portrait', icon: '🕊️', name: { fi: 'Suurlähettilään muotokuva', en: "Envoy's Portrait" } },
    ...atLeast('diplomaticVictories', 1),
  },
  {
    id: 'end_cultural_victory', category: 'end_game', difficulty: 'medium', estimatedUnlockRate: 0.15, points: 45,
    name: { fi: 'Ihmeiden rakentaja', en: 'Wonder Builder' },
    description: { fi: 'Saavutit kulttuurisen voiton.', en: 'Achieved a cultural victory.' },
    reward: { kind: 'portrait', icon: '🏛️', name: { fi: 'Rakentajan muotokuva', en: "Builder's Portrait" } },
    ...atLeast('culturalVictories', 1),
  },
  {
    id: 'end_all_victory_types', category: 'end_game', difficulty: 'hard', estimatedUnlockRate: 0.03, points: 100, legendary: true,
    name: { fi: 'Viisi tietä valtaan', en: 'Five Paths to Power' },
    description: { fi: 'Saavutit kaikki viisi eri voittotapaa (elinaikana).', en: 'Achieved all five different victory paths (lifetime).' },
    reward: { kind: 'decoration', icon: '🌟', name: { fi: 'Viiden tien kunniamerkki', en: 'Five Paths Decoration' } },
    check: (s) => s.militaryVictories > 0 && s.economicVictories > 0 && s.technologyVictories > 0 && s.diplomaticVictories > 0 && s.culturalVictories > 0,
  },

  /* ================= HIDDEN ================= */
  {
    id: 'hidden_comeback', category: 'hidden', difficulty: 'hard', estimatedUnlockRate: 0.05, points: 60, hidden: true,
    name: { fi: '???', en: '???' },
    description: { fi: 'Menetit yli puolet provinsseistasi ja voitit silti pelin.', en: 'Lost over half your provinces and still won the game.' },
    reward: { kind: 'title', icon: '🔥', name: { fi: 'Feeniks', en: 'Phoenix' } },
    check: (s) => s.provincesLost > 0 && s.gamesWon > 0,
  },
  {
    id: 'hidden_underdog', category: 'hidden', difficulty: 'legendary', estimatedUnlockRate: 0.02, points: 80, hidden: true, legendary: true,
    name: { fi: '???', en: '???' },
    description: { fi: 'Voitit vaikealla vaikeustasolla.', en: 'Won a game on hard difficulty.' },
    reward: { kind: 'title', icon: '🐺', name: { fi: 'Ylivoiman kukistaja', en: 'Underdog' } },
    ...atLeast('hardDifficultyWins', 1),
  },
  {
    id: 'hidden_hoarder', category: 'hidden', difficulty: 'medium', estimatedUnlockRate: 0.1, points: 30, hidden: true,
    name: { fi: '???', en: '???' },
    description: { fi: 'Kartuta 500 kultaa valtionkassaan yhtä aikaa.', en: 'Amass 500 gold in your treasury at once.' },
    reward: { kind: 'badge', icon: '🐉', name: { fi: 'Lohikäärmeen aarreaitta', en: "Dragon's Hoard" } },
    ...atLeast('peakTreasury', 500),
  },
  {
    id: 'hidden_flawless', category: 'hidden', difficulty: 'hard', estimatedUnlockRate: 0.04, points: 60, hidden: true,
    name: { fi: '???', en: '???' },
    description: { fi: 'Voita 5 taistelua ilman että menetät yhtäkään yksikköä.', en: 'Win 5 battles without losing a single unit.' },
    reward: { kind: 'unit_skin', icon: '✨', name: { fi: 'Kultainen ratsuväki -asu', en: 'Golden Cavalry Skin' } },
    ...atLeast('perfectBattlesWon', 5),
  },
  {
    id: 'hidden_diplomat_spy', category: 'hidden', difficulty: 'medium', estimatedUnlockRate: 0.15, points: 25, hidden: true,
    name: { fi: '???', en: '???' },
    description: { fi: 'Solmi ja riko liittoja: allekirjoitit 10 sopimusta yhteensä.', en: 'Signed 10 treaties in total.' },
    ...atLeast('treatiesSigned', 10),
  },
  {
    id: 'hidden_night_owl', category: 'hidden', difficulty: 'easy', estimatedUnlockRate: 0.2, points: 20, hidden: true,
    name: { fi: '???', en: '???' },
    description: { fi: 'Pelasit peliä 7 eri päivänä.', en: 'Played the game on 7 different days.' },
    ...atLeast('distinctPlayDays', 7),
  },

  /* ================= SKILL-BASED ================= */
  {
    id: 'skill_perfect_battle', category: 'skill', difficulty: 'medium', estimatedUnlockRate: 0.2, points: 25,
    name: { fi: 'Täydellinen voitto', en: 'Flawless Victory' },
    description: { fi: 'Voita taistelu menettämättä yhtään yksikköä.', en: 'Win a battle without losing a single unit.' },
    ...atLeast('perfectBattlesWon', 1),
  },
  {
    id: 'skill_ten_perfect_battles', category: 'skill', difficulty: 'hard', estimatedUnlockRate: 0.06, points: 55,
    name: { fi: 'Taktinen nero', en: 'Tactical Genius' },
    description: { fi: 'Voita 10 taistelua ilman tappioita.', en: 'Win 10 battles without losses.' },
    ...atLeast('perfectBattlesWon', 10),
  },
  {
    id: 'skill_ten_battle_streak', category: 'skill', difficulty: 'hard', estimatedUnlockRate: 0.08, points: 50,
    name: { fi: 'Voittamaton', en: 'Unstoppable' },
    description: { fi: 'Voita 10 taistelua peräkkäin.', en: 'Win 10 battles in a row.' },
    ...atLeast('longestWinStreakBattles', 10),
  },
  {
    id: 'skill_no_province_lost', category: 'skill', difficulty: 'hard', estimatedUnlockRate: 0.07, points: 55,
    name: { fi: 'Läpäisemätön puolustus', en: 'Impenetrable Defense' },
    description: { fi: 'Voitit pelin menettämättä yhtään provinssia.', en: 'Won a game without losing a single province.' },
    check: (s) => s.gamesWon > 0 && s.provincesLost === 0,
  },
  {
    id: 'skill_fast_victory', category: 'skill', difficulty: 'hard', estimatedUnlockRate: 0.05, points: 60,
    name: { fi: 'Salamasota', en: 'Blitzkrieg' },
    description: { fi: 'Voitit pelin 15 vuoron sisällä.', en: 'Won a game within 15 turns.' },
    ...atMost('fastestVictoryTurn', 15),
  },
  {
    id: 'skill_hard_win', category: 'skill', difficulty: 'legendary', estimatedUnlockRate: 0.02, points: 90, legendary: true,
    name: { fi: 'Mestarin taso', en: "Master's Difficulty" },
    description: { fi: 'Voitit pelin vaikealla vaikeustasolla.', en: 'Won a game on hard difficulty.' },
    reward: { kind: 'title', icon: '👑', name: { fi: 'Mestari', en: 'Master' } },
    ...atLeast('hardDifficultyWins', 1),
  },

  /* ================= EXPLORATION ================= */
  {
    id: 'explore_three_regions', category: 'exploration', difficulty: 'easy', estimatedUnlockRate: 0.45, points: 20,
    name: { fi: 'Uusia maita', en: 'New Lands' },
    description: { fi: 'Hallitse provinsseja 3 eri alueella.', en: 'Control provinces in 3 different regions.' },
    ...atLeast('regionsControlledPeak', 3),
  },
  {
    id: 'explore_six_regions', category: 'exploration', difficulty: 'medium', estimatedUnlockRate: 0.25, points: 35,
    name: { fi: 'Aron ylittäjä', en: 'Steppe Crosser' },
    description: { fi: 'Hallitse provinsseja 6 eri alueella.', en: 'Control provinces in 6 different regions.' },
    ...atLeast('regionsControlledPeak', 6),
  },
  {
    id: 'explore_ten_regions', category: 'exploration', difficulty: 'hard', estimatedUnlockRate: 0.1, points: 55,
    name: { fi: 'Maailman reunalla', en: 'At the Edge of the World' },
    description: { fi: 'Hallitse provinsseja 10 eri alueella.', en: 'Control provinces in 10 different regions.' },
    ...atLeast('regionsControlledPeak', 10),
  },
  {
    id: 'explore_all_regions', category: 'exploration', difficulty: 'legendary', estimatedUnlockRate: 0.01, points: 120, legendary: true,
    name: { fi: 'Tunnetun maailman herra', en: 'Lord of the Known World' },
    description: { fi: 'Hallitse provinsseja kaikilla 16 alueella yhtä aikaa.', en: 'Control provinces in all 16 regions at once.' },
    reward: { kind: 'decoration', icon: '🗺️', name: { fi: 'Maailmankartta-koriste', en: 'World Map Decoration' } },
    ...atLeast('regionsControlledPeak', 16),
  },
  {
    id: 'explore_silk_road_master', category: 'exploration', difficulty: 'hard', estimatedUnlockRate: 0.1, points: 50,
    name: { fi: 'Silkkitien tuntija', en: 'Silk Road Expert' },
    description: { fi: 'Hallitse 5 Silkkitien kauppasolmua yhtä aikaa.', en: 'Control 5 Silk Road trade hubs at once.' },
    ...atLeast('silkRoadHubsPeak', 5),
  },
  {
    id: 'explore_four_capitals', category: 'exploration', difficulty: 'hard', estimatedUnlockRate: 0.06, points: 60,
    name: { fi: 'Kaikkien pääkaupunkien kaatuminen', en: 'Fall of All Capitals' },
    description: { fi: 'Valtasit 4 vihollisen pääkaupunkia (elinaikana).', en: "Captured 4 enemy capitals (lifetime)." },
    ...atLeast('capitalsCaptured', 4),
  },

  /* ================= COLLECTION ================= */
  {
    id: 'collect_ten_cards', category: 'collection', difficulty: 'easy', estimatedUnlockRate: 0.5, points: 20,
    name: { fi: 'Korttien kerääjä', en: 'Card Collector' },
    description: { fi: 'Pelasit 10 eri korttia.', en: 'Played 10 unique cards.' },
    ...atLeastUnique('uniqueCardIdsPlayed', 10),
  },
  {
    id: 'collect_twentyfive_cards', category: 'collection', difficulty: 'medium', estimatedUnlockRate: 0.25, points: 35,
    name: { fi: 'Korttimestari', en: 'Card Master' },
    description: { fi: 'Pelasit 25 eri korttia.', en: 'Played 25 unique cards.' },
    reward: { kind: 'banner', icon: '🎴', name: { fi: 'Kortiston viiri', en: 'Deck Banner' } },
    ...atLeastUnique('uniqueCardIdsPlayed', 25),
  },
  {
    id: 'collect_fifty_cards', category: 'collection', difficulty: 'hard', estimatedUnlockRate: 0.08, points: 60,
    name: { fi: 'Kortiston herra', en: 'Grand Collector' },
    description: { fi: 'Pelasit 50 eri korttia.', en: 'Played 50 unique cards.' },
    ...atLeastUnique('uniqueCardIdsPlayed', 50),
  },
  {
    id: 'collect_legendary_card', category: 'collection', difficulty: 'medium', estimatedUnlockRate: 0.2, points: 30,
    name: { fi: 'Legendan kosketus', en: 'Touch of Legend' },
    description: { fi: 'Pelasit legendaarisen kortin.', en: 'Played a legendary-rarity card.' },
    reward: { kind: 'badge', icon: '🌠', name: { fi: 'Legendaarinen merkki', en: 'Legendary Badge' } },
    ...atLeast('legendaryCardsPlayed', 1),
  },
  {
    id: 'collect_five_legendary', category: 'collection', difficulty: 'hard', estimatedUnlockRate: 0.07, points: 55,
    name: { fi: 'Legendojen kokoelma', en: 'Collection of Legends' },
    description: { fi: 'Pelasit 5 legendaarista korttia.', en: 'Played 5 legendary-rarity cards.' },
    ...atLeast('legendaryCardsPlayed', 5),
  },
  {
    id: 'collect_all_buildings', category: 'collection', difficulty: 'medium', estimatedUnlockRate: 0.3, points: 30,
    name: { fi: 'Täydellinen kaupunki', en: 'The Complete City' },
    description: { fi: 'Rakensit jokaista rakennustyyppiä ainakin kerran.', en: 'Built every building type at least once.' },
    ...atLeastUnique('buildingTypesBuilt', 7),
  },
  {
    id: 'collect_three_wonders', category: 'collection', difficulty: 'hard', estimatedUnlockRate: 0.1, points: 50,
    name: { fi: 'Ihmeiden kokoelma', en: 'Collection of Wonders' },
    description: { fi: 'Rakensit 3 Ihmettä (elinaikana).', en: 'Built 3 Wonders (lifetime).' },
    reward: { kind: 'decoration', icon: '🏛️', name: { fi: 'Ihmeenrakentajan koriste', en: 'Wonder Builder Decoration' } },
    ...atLeast('wondersBuilt', 3),
  },

  /* ================= CHALLENGE ================= */
  {
    id: 'challenge_hard_difficulty', category: 'challenge', difficulty: 'legendary', estimatedUnlockRate: 0.02, points: 90, legendary: true,
    name: { fi: 'Todellinen haaste', en: 'The Real Challenge' },
    description: { fi: 'Voitit pelin vaikealla vaikeustasolla.', en: 'Won a game on hard difficulty.' },
    ...atLeast('hardDifficultyWins', 1),
  },
  {
    id: 'challenge_speedrun', category: 'challenge', difficulty: 'hard', estimatedUnlockRate: 0.04, points: 65,
    name: { fi: 'Salamavalloitus', en: 'Lightning Conquest' },
    description: { fi: 'Voitit pelin 10 vuoron sisällä.', en: 'Won a game within 10 turns.' },
    ...atMost('fastestVictoryTurn', 10),
  },
  {
    id: 'challenge_win_streak_3', category: 'challenge', difficulty: 'medium', estimatedUnlockRate: 0.15, points: 35,
    name: { fi: 'Jatkuva menestys', en: 'Sustained Success' },
    description: { fi: 'Voita 3 peliä peräkkäin.', en: 'Win 3 games in a row.' },
    ...atLeast('longestGameWinStreak', 3),
  },
  {
    id: 'challenge_win_streak_5', category: 'challenge', difficulty: 'hard', estimatedUnlockRate: 0.05, points: 70,
    name: { fi: 'Ylivertainen hallitsija', en: 'Supreme Ruler' },
    description: { fi: 'Voita 5 peliä peräkkäin.', en: 'Win 5 games in a row.' },
    ...atLeast('longestGameWinStreak', 5),
  },
  {
    id: 'challenge_all_factions', category: 'challenge', difficulty: 'hard', estimatedUnlockRate: 0.04, points: 80,
    name: { fi: 'Neljän valtakunnan mestari', en: 'Master of Four Realms' },
    description: { fi: 'Voitit pelin jokaisella pelattavalla valtakunnalla.', en: 'Won a game with every playable faction.' },
    reward: { kind: 'decoration', icon: '🌍', name: { fi: 'Neljän valtakunnan koriste', en: 'Four Realms Decoration' } },
    check: (s) => (['mongol', 'song', 'rus', 'khwarezm'] as FactionId[]).every(f => (s.victoriesByFaction[f] ?? 0) > 0),
  },
  {
    id: 'challenge_ten_wins', category: 'challenge', difficulty: 'hard', estimatedUnlockRate: 0.06, points: 65,
    name: { fi: 'Kokenut hallitsija', en: 'Seasoned Ruler' },
    description: { fi: 'Voitit 10 peliä (elinaikana).', en: 'Won 10 games (lifetime).' },
    ...atLeast('gamesWon', 10),
  },
  {
    id: 'challenge_defensive_master', category: 'challenge', difficulty: 'hard', estimatedUnlockRate: 0.05, points: 60,
    name: { fi: 'Muuri joka ei murru', en: 'The Wall That Never Broke' },
    description: { fi: 'Voitit pelin menettämättä yhtään provinssia.', en: 'Won a game without losing a single province.' },
    check: (s) => s.gamesWon > 0 && s.provincesLost === 0,
  },

  /* ================= HISTORICAL ================= */
  {
    id: 'hist_first_capital', category: 'historical', difficulty: 'medium', estimatedUnlockRate: 0.3, points: 35,
    name: { fi: 'Kaupungin muurien murtaja', en: 'Breaker of City Walls' },
    description: { fi: 'Valtasit ensimmäisen vihollisen pääkaupungin.', en: "Captured your first enemy capital." },
    ...atLeast('capitalsCaptured', 1),
  },
  {
    id: 'hist_mongol_conqueror', category: 'historical', difficulty: 'hard', estimatedUnlockRate: 0.08, points: 60,
    name: { fi: 'Suurkhaanin perillinen', en: "Heir to the Great Khan" },
    description: { fi: 'Voitit pelin Mongolien valtakuntana.', en: 'Won a game as the Mongol Empire.' },
    reward: { kind: 'portrait', icon: '🏹', name: { fi: 'Suurkhaanin muotokuva', en: "Great Khan's Portrait" } },
    check: victoryByFaction('mongol'),
  },
  {
    id: 'hist_song_prosperity', category: 'historical', difficulty: 'hard', estimatedUnlockRate: 0.08, points: 60,
    name: { fi: 'Taivaan mandaatti', en: 'The Mandate of Heaven' },
    description: { fi: 'Voitit pelin Song-dynastiana.', en: 'Won a game as the Song Dynasty.' },
    reward: { kind: 'portrait', icon: '🏮', name: { fi: 'Keisarin muotokuva', en: "Emperor's Portrait" } },
    check: victoryByFaction('song'),
  },
  {
    id: 'hist_rus_unifier', category: 'historical', difficulty: 'hard', estimatedUnlockRate: 0.08, points: 60,
    name: { fi: 'Ruhtinaskuntien yhdistäjä', en: 'Unifier of Principalities' },
    description: { fi: 'Voitit pelin Venäjän ruhtinaskuntina.', en: 'Won a game as the Rus Principalities.' },
    reward: { kind: 'portrait', icon: '🛡️', name: { fi: 'Ruhtinaan muotokuva', en: "Prince's Portrait" } },
    check: victoryByFaction('rus'),
  },
  {
    id: 'hist_khwarezm_shah', category: 'historical', difficulty: 'hard', estimatedUnlockRate: 0.08, points: 60,
    name: { fi: 'Shaahien shaahi', en: 'Shah of Shahs' },
    description: { fi: 'Voitit pelin Khwarezmin valtakuntana.', en: 'Won a game as the Khwarezmian Empire.' },
    reward: { kind: 'portrait', icon: '🕌', name: { fi: 'Shaahin muotokuva', en: "Shah's Portrait" } },
    check: victoryByFaction('khwarezm'),
  },
  {
    id: 'hist_year_1215', category: 'historical', difficulty: 'medium', estimatedUnlockRate: 0.3, points: 30,
    name: { fi: 'Vuosikymmenen taistelut', en: 'A Decade of Battles' },
    description: { fi: 'Pelasit peliä yhteensä 500 vuoroa (elinaikana).', en: 'Played 500 turns in total (lifetime).' },
    ...atLeast('totalTurnsPlayed', 500),
  },

  /* ================= CAMPAIGN ================= */
  {
    id: 'campaign_mongol_win', category: 'campaign', difficulty: 'medium', estimatedUnlockRate: 0.15, points: 40,
    name: { fi: 'Mongolikampanja voitettu', en: 'Mongol Campaign Won' },
    description: { fi: 'Suorita mongolikampanja voittoon.', en: 'Complete the Mongol campaign in victory.' },
    check: victoryByFaction('mongol'),
  },
  {
    id: 'campaign_song_win', category: 'campaign', difficulty: 'medium', estimatedUnlockRate: 0.15, points: 40,
    name: { fi: 'Song-kampanja voitettu', en: 'Song Campaign Won' },
    description: { fi: 'Suorita Song-kampanja voittoon.', en: 'Complete the Song campaign in victory.' },
    check: victoryByFaction('song'),
  },
  {
    id: 'campaign_rus_win', category: 'campaign', difficulty: 'medium', estimatedUnlockRate: 0.15, points: 40,
    name: { fi: 'Rus-kampanja voitettu', en: 'Rus Campaign Won' },
    description: { fi: 'Suorita Rus-kampanja voittoon.', en: 'Complete the Rus campaign in victory.' },
    check: victoryByFaction('rus'),
  },
  {
    id: 'campaign_khwarezm_win', category: 'campaign', difficulty: 'medium', estimatedUnlockRate: 0.15, points: 40,
    name: { fi: 'Khwarezm-kampanja voitettu', en: 'Khwarezm Campaign Won' },
    description: { fi: 'Suorita Khwarezm-kampanja voittoon.', en: 'Complete the Khwarezm campaign in victory.' },
    check: victoryByFaction('khwarezm'),
  },
  {
    id: 'campaign_two_won', category: 'campaign', difficulty: 'medium', estimatedUnlockRate: 0.2, points: 35,
    name: { fi: 'Kampanjaveteraani', en: 'Campaign Veteran' },
    description: { fi: 'Suoritit 2 kampanjaa voittoon (elinaikana).', en: 'Completed 2 campaigns in victory (lifetime).' },
    ...atLeast('gamesWon', 2),
  },
  {
    id: 'campaign_ten_won', category: 'campaign', difficulty: 'legendary', estimatedUnlockRate: 0.02, points: 110, legendary: true,
    name: { fi: 'Elinikäinen valloittaja', en: 'Lifelong Conqueror' },
    description: { fi: 'Suoritit 10 kampanjaa voittoon (elinaikana).', en: 'Completed 10 campaigns in victory (lifetime).' },
    reward: { kind: 'title', icon: '🏵️', name: { fi: 'Ikuinen valloittaja', en: 'Eternal Conqueror' } },
    ...atLeast('gamesWon', 10),
  },

  /* ================= DAILY / WEEKLY ================= */
  {
    id: 'daily_login_3', category: 'daily_weekly', difficulty: 'trivial', estimatedUnlockRate: 0.6, points: 10,
    name: { fi: 'Palaava pelaaja', en: 'Returning Player' },
    description: { fi: 'Pelasit 3 päivänä peräkkäin.', en: 'Played on 3 consecutive days.' },
    ...atLeast('loginStreak', 3),
  },
  {
    id: 'daily_login_7', category: 'daily_weekly', difficulty: 'easy', estimatedUnlockRate: 0.3, points: 25,
    name: { fi: 'Viikon uskollisuus', en: 'A Week of Loyalty' },
    description: { fi: 'Pelasit 7 päivänä peräkkäin.', en: 'Played on 7 consecutive days.' },
    reward: { kind: 'badge', icon: '📅', name: { fi: 'Viikkomerkki', en: 'Weekly Badge' } },
    ...atLeast('loginStreak', 7),
  },
  {
    id: 'daily_login_30', category: 'daily_weekly', difficulty: 'hard', estimatedUnlockRate: 0.05, points: 70,
    name: { fi: 'Kuukauden omistautuminen', en: 'A Month of Dedication' },
    description: { fi: 'Pelasit 30 päivänä peräkkäin.', en: 'Played on 30 consecutive days.' },
    reward: { kind: 'title', icon: '🗓️', name: { fi: 'Uskollinen hallitsija', en: 'Devoted Ruler' } },
    ...atLeast('loginStreak', 30),
  },
  {
    id: 'weekly_five_days', category: 'daily_weekly', difficulty: 'medium', estimatedUnlockRate: 0.2, points: 30,
    name: { fi: 'Viikoittainen valloittaja', en: 'Weekly Warrior' },
    description: { fi: 'Pelasit yhteensä 5 eri päivänä.', en: 'Played on 5 different days in total.' },
    ...atLeast('distinctPlayDays', 5),
  },
  {
    id: 'weekly_thirty_days', category: 'daily_weekly', difficulty: 'hard', estimatedUnlockRate: 0.06, points: 55,
    name: { fi: 'Vakituinen hallitsija', en: 'Steadfast Ruler' },
    description: { fi: 'Pelasit yhteensä 30 eri päivänä.', en: 'Played on 30 different days in total.' },
    ...atLeast('distinctPlayDays', 30),
  },

  /* ================= LIFETIME ================= */
  {
    id: 'lifetime_ten_games', category: 'lifetime', difficulty: 'easy', estimatedUnlockRate: 0.4, points: 20,
    name: { fi: 'Kokenut hallitsija', en: 'Experienced Ruler' },
    description: { fi: 'Pelasit 10 peliä (elinaikana).', en: 'Played 10 games (lifetime).' },
    ...atLeast('gamesPlayed', 10),
  },
  {
    id: 'lifetime_fifty_games', category: 'lifetime', difficulty: 'medium', estimatedUnlockRate: 0.15, points: 40,
    name: { fi: 'Vankka pelaaja', en: 'Dedicated Player' },
    description: { fi: 'Pelasit 50 peliä (elinaikana).', en: 'Played 50 games (lifetime).' },
    ...atLeast('gamesPlayed', 50),
  },
  {
    id: 'lifetime_hundred_games', category: 'lifetime', difficulty: 'legendary', estimatedUnlockRate: 0.02, points: 100, legendary: true,
    name: { fi: 'Aikakauden hallitsija', en: 'Ruler of an Era' },
    description: { fi: 'Pelasit 100 peliä (elinaikana).', en: 'Played 100 games (lifetime).' },
    reward: { kind: 'decoration', icon: '⏳', name: { fi: 'Aikakausikoriste', en: 'Era Decoration' } },
    ...atLeast('gamesPlayed', 100),
  },
  {
    id: 'lifetime_2000_turns', category: 'lifetime', difficulty: 'hard', estimatedUnlockRate: 0.08, points: 60,
    name: { fi: 'Ajan hallitsija', en: 'Master of Time' },
    description: { fi: 'Pelasit yhteensä 2000 vuoroa (elinaikana).', en: 'Played 2000 turns in total (lifetime).' },
    ...atLeast('totalTurnsPlayed', 2000),
  },
  {
    id: 'lifetime_10000_gold', category: 'lifetime', difficulty: 'medium', estimatedUnlockRate: 0.2, points: 35,
    name: { fi: 'Valtakunnan aarteet', en: "The Realm's Treasures" },
    description: { fi: 'Ansaitse yhteensä 10 000 kultaa (elinaikana).', en: 'Earn a total of 10,000 gold (lifetime).' },
    ...atLeast('goldEarnedTotal', 10000),
  },
  {
    id: 'lifetime_50000_gold', category: 'lifetime', difficulty: 'hard', estimatedUnlockRate: 0.05, points: 70,
    name: { fi: 'Loputon vauraus', en: 'Endless Wealth' },
    description: { fi: 'Ansaitse yhteensä 50 000 kultaa (elinaikana).', en: 'Earn a total of 50,000 gold (lifetime).' },
    ...atLeast('goldEarnedTotal', 50000),
  },
  {
    id: 'lifetime_100_battles', category: 'lifetime', difficulty: 'medium', estimatedUnlockRate: 0.2, points: 40,
    name: { fi: 'Taisteluveteraani', en: 'Battle Veteran' },
    description: { fi: 'Voita 100 taistelua (elinaikana).', en: 'Win 100 battles (lifetime).' },
    ...atLeast('battlesWon', 100),
  },
  {
    id: 'lifetime_500_battles', category: 'lifetime', difficulty: 'legendary', estimatedUnlockRate: 0.01, points: 130, legendary: true,
    name: { fi: 'Legendaarinen sotapäällikkö', en: 'Legendary Warlord' },
    description: { fi: 'Voita 500 taistelua (elinaikana).', en: 'Win 500 battles (lifetime).' },
    reward: { kind: 'title', icon: '⚔️', name: { fi: 'Legendaarinen sotapäällikkö', en: 'Legendary Warlord' } },
    ...atLeast('battlesWon', 500),
  },
];

/** Lookup map, built once at module load — used by AchievementManager and the tracking hook. */
export const ACHIEVEMENT_DEFINITIONS_BY_ID = new Map(ACHIEVEMENT_DEFINITIONS.map(def => [def.id, def]));
