import type { Language } from '@/lib/i18n.tsx';

interface LocalKnowledgeEntry {
  keywords: { fi: string[]; en: string[] };
  answer: { fi: string; en: string };
}

const LOCAL_KNOWLEDGE: LocalKnowledgeEntry[] = [
  {
    keywords: { fi: ['hirvas', 'handgai', 'kosminen', 'laulu'], en: ['stag', 'handgai', 'cosmic', 'song'] },
    answer: {
      fi: 'Handgai, Suuri Hirvas, loi maailman ja ohjasi elämän syntyä. Maailmankaikkeus laulettiin olemassaoloon, ja jokainen kivi, eläin ja ihminen on osa jumalallista sävelmää.',
      en: 'Handgai, the Great Stag, shaped the world and guided life into being. The universe was sung into existence, and every stone, animal, and person remains part of the divine melody.',
    },
  },
  {
    keywords: { fi: ['lore', 'tarina', 'kronikka', 'temüü', 'qorchi', 'bolormaa'], en: ['lore', 'story', 'chronicle', 'temüü', 'qorchi', 'bolormaa'] },
    answer: {
      fi: 'Kronikan keskiössä ovat Temüü, hänen tyranni-isänsä Ganbataar, shamaani Qorchi ja uudistaja Bolormaa. Temüü yhdistää heimot ja yrittää korvata pelon, koston ja loputtoman sodan ansioihin, diplomatiaan ja rauhaan perustuvalla järjestyksellä.',
      en: 'The Chronicle centers on Temüü, his tyrant father Ganbataar, the shaman Qorchi, and the reformer Bolormaa. Temüü unites the clans and tries to replace fear, vengeance, and endless war with an order based on merit, diplomacy, and peace.',
    },
  },
  {
    keywords: { fi: ['vuoro', 'vaihe', 'vaiheet'], en: ['turn', 'phase', 'phases'] },
    answer: {
      fi: 'Vuoron kuusi vaihetta ovat Resurssit, Kortit, Liike, Taistelu, Rakenna ja Lopeta.',
      en: 'The six turn phases are Resources, Cards, Move, Battle, Build, and End.',
    },
  },
  {
    keywords: { fi: ['voitto', 'voitan', 'sotilas', 'talous', 'teknologia', 'diplomatia', 'kulttuuri'], en: ['win', 'victory', 'military', 'economic', 'technology', 'diplomatic', 'culture'] },
    answer: {
      fi: 'Voittoon on viisi tietä: sotilaallinen, taloudellinen, teknologinen, diplomaattinen ja kulttuurinen. Tarkat tavoitteet näkyvät pelin Voittotavoitteet-näkymässä ja Sääntökirjassa.',
      en: 'There are five victory paths: military, economic, technology, diplomatic, and cultural. The exact targets are shown in the Victory Goals view and the Rulebook.',
    },
  },
];

const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const matchMooseLocalKnowledge = (question: string, lang: Language): string | null => {
  const words = normalize(question).split(/[^a-z0-9]+/).filter(word => word.length >= 3);
  let best: { entry: LocalKnowledgeEntry; score: number } | null = null;

  for (const entry of LOCAL_KNOWLEDGE) {
    const score = entry.keywords[lang].reduce((total, keyword) => {
      const normalizedKeyword = normalize(keyword);
      return total + (words.some(word => word === normalizedKeyword || word.includes(normalizedKeyword) || normalizedKeyword.includes(word)) ? 1 : 0);
    }, 0);
    if (score > 0 && (!best || score > best.score)) best = { entry, score };
  }

  return best ? best.entry.answer[lang] : null;
};