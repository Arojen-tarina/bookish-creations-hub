/**
 * cards.ts — Korttijärjestelmän logiikka (MVP)
 * 
 * Hallinnoi korttikättä, nostamista, pelaamista ja vaikutusten soveltamista.
 */
import { GameCard, strategyCards, diplomacyCards, technologyCards, resourceCards } from '@/data/gameCards';

export interface CardEffect {
  type: 'attack_bonus' | 'defense_bonus' | 'movement_bonus' | 'gold' | 'food' | 'horses' | 'artisans' | 'draw_cards' | 'recruit_free' | 'permanent_attack' | 'permanent_defense' | 'terrain_ignore';
  value: number;
  duration: number; // 0 = instant, -1 = permanent, N = N turns
  description: string;
}

export interface PlayableCard extends GameCard {
  parsedEffect: CardEffect;
}

// Parse a card into a playable card with concrete effect
function parseCardEffect(card: GameCard): CardEffect {
  const id = card.id;
  
  // Strategy cards - combat bonuses
  if (id === 'str-001') return { type: 'attack_bonus', value: 3, duration: 0, description: '+3 hyökkäys tässä taistelussa' };
  if (id === 'str-002') return { type: 'attack_bonus', value: 2, duration: 0, description: '+2 hyökkäys seuraavassa taistelussa' };
  if (id === 'str-003') return { type: 'attack_bonus', value: 2, duration: 0, description: 'Ohita puolustajan maastobonus' };
  if (id === 'str-006') return { type: 'attack_bonus', value: 1, duration: 0, description: '+1 hyökkäys per ratsuväki' };
  if (id === 'str-007') return { type: 'movement_bonus', value: 2, duration: 0, description: 'Ratsuväki +2 liikettä' };
  if (id === 'str-014') return { type: 'defense_bonus', value: 3, duration: 0, description: '+3 puolustus tällä vuorolla' };
  if (id === 'str-015') return { type: 'movement_bonus', value: 1, duration: 0, description: 'Kaikki yksiköt +1 liike' };
  if (id === 'str-036') return { type: 'movement_bonus', value: 1, duration: 0, description: 'Kaikki +1 liike' };
  if (id === 'str-042') return { type: 'terrain_ignore', value: 1, duration: 0, description: 'Ohita jokirangaistus' };
  if (id === 'str-043') return { type: 'terrain_ignore', value: 1, duration: 0, description: 'Vuoriston läpi helpommin' };
  
  // Diplomacy cards  
  if (id === 'dip-011') return { type: 'gold', value: 3, duration: 0, description: '+3 kultaa kauppasopimuksesta' };
  if (id === 'dip-018') return { type: 'gold', value: 2, duration: 0, description: '+2 kultaa markkinoilta' };
  if (id === 'dip-019') return { type: 'gold', value: 5, duration: 0, description: '+5 kultaa lainasta' };
  if (id === 'dip-001') return { type: 'defense_bonus', value: 2, duration: 3, description: 'Rauhansopimus: +2 puolustus' };
  if (id === 'dip-006') return { type: 'defense_bonus', value: 1, duration: 1, description: 'Aselepo: +1 puolustus' };
  
  // Technology cards - permanent bonuses
  if (id === 'tek-001') return { type: 'permanent_attack', value: 1, duration: -1, description: '+1 ratsuväen hyökkäys pysyvästi' };
  if (id === 'tek-005') return { type: 'permanent_defense', value: 1, duration: -1, description: '+1 jalkaväen puolustus pysyvästi' };
  if (id === 'tek-011') return { type: 'gold', value: 5, duration: 0, description: '+5 kultaa verojärjestelmästä' };
  if (id === 'tek-013') return { type: 'food', value: 3, duration: 0, description: '+3 ruokaa maataloudesta' };
  if (id === 'tek-017') return { type: 'movement_bonus', value: 1, duration: -1, description: '+1 liike pysyvästi' };
  
  // Resource cards - instant resources
  if (id.startsWith('res-001') || id === 'res-007' || id === 'res-008') return { type: 'horses', value: 3, duration: 0, description: '+3 hevosta' };
  if (id === 'res-002') return { type: 'horses', value: 5, duration: 0, description: '+5 hevosta' };
  if (id === 'res-011' || id === 'res-019') return { type: 'gold', value: 3, duration: 0, description: '+3 kultaa' };
  if (id === 'res-012') return { type: 'gold', value: 5, duration: 0, description: '+5 kultaa' };
  if (id === 'res-014') return { type: 'gold', value: 6, duration: 0, description: '+6 kultaa' };
  if (id === 'res-021' || id === 'res-022') return { type: 'food', value: 4, duration: 0, description: '+4 ruokaa' };
  if (id === 'res-023') return { type: 'food', value: 5, duration: 0, description: '+5 ruokaa' };
  if (id === 'res-031' || id === 'res-034') return { type: 'artisans', value: 2, duration: 0, description: '+2 käsityöläistä' };
  if (id === 'res-032') return { type: 'artisans', value: 3, duration: 0, description: '+3 käsityöläistä' };
  
  // Default: give some gold
  if (card.type === 'strategy') return { type: 'attack_bonus', value: 1, duration: 0, description: '+1 hyökkäys' };
  if (card.type === 'diplomacy') return { type: 'gold', value: 2, duration: 0, description: '+2 kultaa diplomatiasta' };
  if (card.type === 'technology') return { type: 'artisans', value: 1, duration: 0, description: '+1 käsityöläinen' };
  return { type: 'gold', value: 2, duration: 0, description: '+2 kultaa' };
}

// Create the full playable deck (20 cards for MVP)
export function createPlayableDeck(): PlayableCard[] {
  // Pick 5 of each type for MVP
  const picks = [
    ...strategyCards.slice(0, 5),
    ...diplomacyCards.slice(0, 5),
    ...technologyCards.slice(0, 5),
    ...resourceCards.slice(0, 5),
  ];
  
  return shuffleDeck(picks.map(card => ({
    ...card,
    parsedEffect: parseCardEffect(card),
  })));
}

export function shuffleDeck<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function drawCards(deck: PlayableCard[], count: number): { drawn: PlayableCard[]; remaining: PlayableCard[] } {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
}
