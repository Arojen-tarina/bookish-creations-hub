/**
 * mooseFaq.ts — Hirvi-avustajan kysymyspankki (sääntökysymykset)
 *
 * Yksinkertainen avainsanapohjainen haku: jokaiselle kysymykselle on lista
 * avainsanoja molemmilla kielillä. Ei vaadi verkkoyhteyttä eikä API-avainta —
 * tämä on ensisijainen vastauslähde ennen mahdollista LLM-varajärjestelmää.
 */
import { VICTORY_TARGETS, BUILDING_INFO, WONDER_MAX, ACTIVE_FACTIONS } from '@/hooks/useProvinceGameState.ts';
import { FACTION_DATA_1206 } from '@/types/province.ts';
import type { Language } from '@/lib/i18n.tsx';

interface FaqEntry {
  id: string;
  keywords: { fi: string[]; en: string[] };
  answer: { fi: string; en: string };
}

const factionNamesFi = ACTIVE_FACTIONS.map(id => FACTION_DATA_1206[id].name).join(', ');
const factionNamesEn = 'Mongol Empire, Song Dynasty, Rus Principalities, Khwarezmian Empire';
const buildingNamesEn: Record<string, string> = {
  Leiri: 'Camp', Markkina: 'Market', Linnoitus: 'Fortress', Paja: 'Workshop',
  Hevostalli: 'Stable', Silta: 'Bridge', Ihme: 'Wonder',
};

export const MOOSE_FAQ: FaqEntry[] = [
  {
    id: 'phases',
    keywords: { fi: ['vuoro', 'vaihe', 'vaiheet'], en: ['turn', 'phase', 'phases'] },
    answer: {
      fi: 'Joka vuoro on 6 vaihetta järjestyksessä: 🪙 Resurssit → 🃏 Kortit → 🐴 Liike → ⚔️ Taistelu → 🏗️ Rakenna → 🏁 Lopeta. Paina "Seuraava" siirtyäksesi vaiheesta toiseen.',
      en: 'Each turn has 6 phases in order: 🪙 Resources → 🃏 Cards → 🐴 Move → ⚔️ Battle → 🏗️ Build → 🏁 End. Press "Next" to move to the next phase.',
    },
  },
  {
    id: 'victory-military',
    keywords: { fi: ['sotilaallinen', 'sotilas', 'valloit', 'aluetta', 'provinssi'], en: ['military', 'conquer', 'provinces', 'capital'] },
    answer: {
      fi: `Sotilaallinen voitto: hallitse ${VICTORY_TARGETS.provinces} provinssia (tai valloita kaikki vihollisten pääkaupungit).`,
      en: `Military victory: control ${VICTORY_TARGETS.provinces} provinces (or capture every enemy capital).`,
    },
  },
  {
    id: 'victory-economic',
    keywords: { fi: ['talous', 'kulta', 'raha', 'kultaa'], en: ['economic', 'economy', 'gold', 'money'] },
    answer: {
      fi: `Taloudellinen voitto: kerää ${VICTORY_TARGETS.gold} kultaa ja hallitse yli puolet Silkkitien kauppasolmuista ${VICTORY_TARGETS.treasuryStreak} perakkaisen vuoron ajan.`,
      en: `Economic victory: accumulate ${VICTORY_TARGETS.gold} gold and control more than half of the Silk Road hubs for ${VICTORY_TARGETS.treasuryStreak} consecutive turns.`,
    },
  },
  {
    id: 'victory-tech',
    keywords: { fi: ['teknolog', 'tiede', 'tutkimus'], en: ['technology', 'tech', 'research'] },
    answer: {
      fi: `Teknologinen voitto: pelaa ${VICTORY_TARGETS.tech} teknologiakorttia.`,
      en: `Technology victory: play ${VICTORY_TARGETS.tech} technology cards.`,
    },
  },
  {
    id: 'victory-diplomatic',
    keywords: { fi: ['diplomatia', 'liitto', 'liittolainen', 'vaikutusvalta'], en: ['diplomatic', 'diplomacy', 'alliance', 'influence'] },
    answer: {
      fi: `Diplomaattinen voitto: liity liittoon ${VICTORY_TARGETS.diplomaticMinAllies}+ valtakunnan kanssa TAI kerää ${VICTORY_TARGETS.influence} vaikutusvaltaa.`,
      en: `Diplomatic victory: form an alliance with ${VICTORY_TARGETS.diplomaticMinAllies}+ realms OR accumulate ${VICTORY_TARGETS.influence} influence.`,
    },
  },
  {
    id: 'victory-cultural',
    keywords: { fi: ['kulttuuri', 'ihme', 'arvovalta'], en: ['cultural', 'culture', 'wonder', 'prestige'] },
    answer: {
      fi: `Kulttuurinen voitto: kerää ${VICTORY_TARGETS.prestige} arvovaltaa rakentamalla Ihmeitä (enintään ${WONDER_MAX} pääkaupunkia kohden).`,
      en: `Cultural victory: accumulate ${VICTORY_TARGETS.prestige} prestige by building Wonders (max ${WONDER_MAX} per capital).`,
    },
  },
  {
    id: 'buildings',
    keywords: { fi: ['rakenna', 'rakennus', 'leiri', 'markkina', 'linnoitus', 'paja', 'talli', 'silta'], en: ['build', 'building', 'camp', 'market', 'fortress', 'workshop', 'stable', 'bridge'] },
    answer: {
      fi: `Rakennukset: ${Object.values(BUILDING_INFO).map(b => `${b.emoji} ${b.name} (${b.effect})`).join(' · ')}.`,
      en: `Buildings: ${Object.values(BUILDING_INFO).map(b => `${b.emoji} ${buildingNamesEn[b.name] || b.name} (${b.cost.gold} gold)`).join(' · ')}.`,
    },
  },
  {
    id: 'factions',
    keywords: { fi: ['valtakunta', 'valtakunnat', 'faktio', 'kansa', 'heimo'], en: ['faction', 'factions', 'realm', 'nation', 'tribe'] },
    answer: {
      fi: `Voit pelata neljää valtakuntaa: ${factionNamesFi}. Muut valtakunnat esiintyvät tekoälyvastustajina.`,
      en: `You can play four realms: ${factionNamesEn}. Other realms appear as AI opponents.`,
    },
  },
  {
    id: 'combat',
    keywords: { fi: ['taistelu', 'hyökkää', 'hyökkäys', 'sota', 'armeija'], en: ['combat', 'battle', 'attack', 'war', 'army'] },
    answer: {
      fi: 'Taistelu: liikuta armeija vihollisen alueelle Liike- tai Taistelu-vaiheessa. Voimat lasketaan ratsuväestä, jalkaväestä, piiritystykistä ja bonuksista, plus nopanheitto — suurempi tulos voittaa.',
      en: 'Combat: move an army into an enemy province during the Move or Battle phase. Power is calculated from cavalry, infantry, siege, and bonuses, plus a dice roll — the higher score wins.',
    },
  },
  {
    id: 'diplomacy',
    keywords: { fi: ['sopimus', 'rauha', 'liittouma', 'kauppasopimus'], en: ['treaty', 'peace', 'truce', 'trade agreement'] },
    answer: {
      fi: 'Diplomatia-välilehdeltä voit ehdottaa sopimuksia (hyökkäämättömyys, kauppa, liitto, rauha) tai julistaa sotaa muille valtakunnille.',
      en: 'From the Diplomacy tab you can propose treaties (non-aggression, trade, alliance, peace) or declare war on other realms.',
    },
  },
  {
    id: 'cards',
    keywords: { fi: ['kortti', 'kortit', 'pelaa kortti', 'käsi'], en: ['card', 'cards', 'hand', 'play card'] },
    answer: {
      fi: 'Kortit-vaiheessa nostat kortin pakasta. Kortteja voi pelaa kädestäsi milloin tahansa vuoron aikana bonusten saamiseksi (hyökkäys, puolustus, kulta, ruoka ja muut).',
      en: 'In the Cards phase you draw a card from the deck. Cards can be played from your hand any time during the turn for bonuses (attack, defense, gold, food, and more).',
    },
  },
  {
    id: 'language',
    keywords: { fi: ['kieli', 'englanti', 'suomi', 'kääntää'], en: ['language', 'english', 'finnish', 'translate'] },
    answer: {
      fi: 'Voit vaihtaa kielen suomen ja englannin välillä yläpalkin 🌐-kuvakkeesta.',
      en: 'You can switch between Finnish and English from the 🌐 icon in the top bar.',
    },
  },
  {
    id: 'device-mode',
    keywords: { fi: ['puhelin', 'mobiili', 'tietokone', 'laite', 'näkymä'], en: ['phone', 'mobile', 'desktop', 'device', 'layout'] },
    answer: {
      fi: 'Voit valita tietokone- tai puhelinoptimoidun käyttöliittymän samasta 🌐-valikosta kuin kielen.',
      en: 'You can choose a desktop- or mobile-optimized interface from the same 🌐 menu as the language.',
    },
  },
  {
    id: 'save',
    keywords: { fi: ['tallenna', 'tallennus', 'jatka peli', 'menetin pelin'], en: ['save', 'resume', 'lost my game', 'continue'] },
    answer: {
      fi: 'Peli säilyy istunnon ajan automaattisesti, joten voit avata Sääntökirjan tai Kronikan menettämättä peliäsi. "Aloita alusta" -painike sivupalkissa aloittaa täysin uuden pelin.',
      en: 'Your game is kept automatically for the session, so you can open the Rulebook or Chronicle without losing progress. The "Start over" button in the sidebar begins a completely new game.',
    },
  },
];

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const STOP_WORDS: Record<Language, Set<string>> = {
  fi: new Set(['ja', 'tai', 'on', 'mita', 'miten', 'kuinka', 'voinko', 'saanko', 'haluan', 'pelata']),
  en: new Set(['a', 'an', 'and', 'can', 'do', 'how', 'i', 'is', 'it', 'my', 'the', 'to', 'what', 'when', 'where', 'with']),
};

/** Palauttaa parhaiten osuvan FAQ-vastauksen tai null jos mikään ei osu riittävän hyvin. */
export const matchMooseFaq = (question: string, lang: Language): string | null => {
  const words = normalize(question)
    .split(/[^a-z0-9]+/)
    .filter(word => word.length >= 3 && !STOP_WORDS[lang].has(word));
  if (words.length === 0) return null;

  let best: { entry: FaqEntry; score: number } | null = null;
  for (const entry of MOOSE_FAQ) {
    const kws = entry.keywords[lang].map(normalize);
    const score = kws.reduce((sum, kw) => {
      const exact = words.some(word => word === kw);
      const stem = kw.length >= 4 && words.some(word => word.startsWith(kw) || kw.startsWith(word));
      return sum + (exact ? 3 : stem ? 1 : 0);
    }, 0);
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }
  return best && best.score >= 3 ? best.entry.answer[lang] : null;
};
