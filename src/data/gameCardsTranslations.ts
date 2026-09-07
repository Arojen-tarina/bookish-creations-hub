/**
 * gameCardsTranslations.ts — English text for game cards
 *
 * The card data in gameCards.ts / the effect descriptions in cards.ts are
 * Finnish-only (source of truth for game state, kept as-is so save games
 * and effect-matching by id keep working). This file provides English
 * display text keyed by card id, looked up at render time only.
 */
import { CardType } from '@/data/gameCards';

export interface CardTextEN {
  name: string;
  description: string;
  effect: string;
  cost?: string;
}

// Card id -> English name/description/effect (display only)
export const CARD_TEXT_EN: Record<string, CardTextEN> = {
  // Strategy
  'str-001': { name: 'Mongol Charge', description: 'Classic cavalry assault', effect: '+3 attack bonus this turn' },
  'str-006': { name: 'Arrow Storm', description: 'Massive volley of arrows', effect: '+1 attack per cavalry unit' },
  'str-008': { name: 'Tactician of Chaos', description: 'Sow confusion in enemy ranks', effect: 'Enemy loses one unit before battle' },
  'str-010': { name: 'Blood Oath', description: 'Fight to the death', effect: '+2 defense, cannot retreat' },
  'str-011': { name: 'Fire Frenzy', description: 'Flaming arrows', effect: 'Destroy one enemy building' },
  'str-013': { name: 'Veteran Experience', description: 'Old warriors lead the way', effect: '+1 to all units in battle' },
  'str-014': { name: 'Reinforced Line', description: 'Tight defensive formation', effect: '+3 defense this turn' },
  'str-016': { name: 'Cavalry Shock', description: 'The first strike decides it', effect: 'First battle +3, rest +0' },
  'str-017': { name: 'Pit Traps', description: 'Traps hidden in the terrain', effect: 'Attacker loses 1 unit before battle' },
  'str-018': { name: 'Shadow Soldiers', description: 'Use of spies', effect: "See the enemy's hand of cards" },
  'str-019': { name: "The Khan's Command", description: 'Absolute obedience', effect: 'All units attack together' },
  'str-020': { name: 'Last Strength', description: 'A desperate assault', effect: 'Double attack, but lose half your units' },
  'str-021': { name: 'Wall Reinforcement', description: 'Fortress repairs', effect: '+2 fortress durability' },
  'str-022': { name: "The Besieged's Defiance", description: 'No surrender!', effect: 'Siege lasts 2 turns longer' },
  'str-024': { name: 'Boiling Oil', description: 'A defensive tactic', effect: '+3 defense against siege' },
  'str-025': { name: 'City Guards', description: 'Citizen militia', effect: 'Gain 2 temporary infantry units' },
  'str-026': { name: 'Scorpion Engine', description: 'A defensive siege weapon', effect: '+2 defense, can strike an adjacent province' },
  'str-027': { name: 'Firewalls', description: 'A firestorm in defense', effect: 'Attacker loses 1 cavalry unit' },
  'str-028': { name: 'Food Stockpile', description: 'A long siege', effect: 'No food consumption during a siege' },
  'str-032': { name: 'Battle-Hardened', description: 'Experience pays off', effect: '+2 defense on own territory' },
  'str-033': { name: 'Cold Resistance', description: 'Winter defense', effect: 'If winter: +4 defense' },
  'str-034': { name: 'Army Dispersal', description: 'Guerrilla tactics', effect: 'Split across 3 provinces, the enemy picks one to attack' },
  'str-035': { name: 'The Last Wall', description: 'Death or victory', effect: 'Defense x2, but no retreat' },
  'str-051': { name: 'Spirit of Genghis Khan', description: 'Inspiration of the great conqueror', effect: 'All units +2 attack and defense this turn' },
  'str-054': { name: 'Chinese Gunpowder', description: 'New technology in use', effect: 'Automatically destroy a fortress' },

  // Technology
  'tek-001': { name: 'Composite Bow', description: 'Improved bow technology', effect: '+1 cavalry attack permanently', cost: '2 artisans' },
  'tek-002': { name: 'Heavy Cavalry', description: 'Armored horses', effect: '+1 cavalry defense permanently', cost: '2 artisans + 2 horses' },
  'tek-003': { name: 'Siege Engine', description: 'A stone-hurling machine', effect: 'Fortresses -1 defense against you', cost: '3 artisans' },
  'tek-005': { name: 'Steel Armor', description: 'Improved armor', effect: '+1 infantry defense permanently', cost: '2 artisans' },
  'tek-011': { name: 'Tax System', description: 'Efficient tax collection', effect: '+1 gold per controlled province', cost: '2 artisans' },
  'tek-013': { name: 'Farming Technique', description: 'Improved harvest', effect: '+1 food per farmland', cost: '1 artisan' },
  'tek-015': { name: 'Literacy', description: 'Record-keeping', effect: '+1 gold per turn', cost: '2 artisans' },
  'tek-024': { name: 'Metalworking', description: 'Improved tools', effect: '+1 construction speed', cost: '2 artisans' },
  'tek-026': { name: 'Architecture', description: 'Building expertise', effect: 'Fortresses +1 durability', cost: '2 artisans' },
  'tek-029': { name: 'Philosophy', description: 'The power of thought', effect: '+1 victory point per 3 technology cards', cost: '2 artisans' },
  'tek-030': { name: 'Universal Science', description: 'All knowledge united', effect: 'Technological victory becomes possible', cost: '5 artisans + 5 gold' },

  // Resources
  'res-001': { name: 'Mongol Horses', description: '3 horses', effect: 'Recruit cavalry' },
  'res-002': { name: 'Wild Horse Herd', description: '5 horses', effect: 'A large horse reserve' },
  'res-003': { name: 'War Horses', description: '2 trained horses', effect: '+1 cavalry attack' },
  'res-004': { name: 'Horse Ranch', description: '1 horse per turn', effect: 'Ongoing horse production' },
  'res-005': { name: 'Steppe Stallion', description: '1 special horse', effect: 'A mount for the chieftain (+1 movement)' },
  'res-006': { name: 'Horse Care', description: '2 horses + care', effect: "Horses don't consume food" },
  'res-007': { name: 'Foal Herd', description: '4 horses', effect: 'New horses' },
  'res-008': { name: 'Caravan Horses', description: '3 horses', effect: 'For trade use' },
  'res-009': { name: 'Persian Arabian Horse', description: '2 fast horses', effect: '+2 cavalry movement' },
  'res-010': { name: 'Legendary Stallion', description: '1 magical horse', effect: 'Chieftain +2 in all battles' },
  'res-011': { name: 'Gold Coins', description: '3 gold', effect: 'A means of payment' },
  'res-012': { name: 'Treasure Chest', description: '5 gold', effect: 'A large gold reserve' },
  'res-013': { name: 'Silk Money', description: '4 gold', effect: 'Chinese currency' },
  'res-014': { name: 'Plundered Riches', description: '6 gold', effect: 'Spoils of war' },
  'res-015': { name: "Merchant's Profits", description: '3 gold + 1 per trade route', effect: 'Trading profits' },
  'res-017': { name: 'Gold Mine', description: '2 gold per turn', effect: 'Ongoing gold production' },
  'res-018': { name: 'Corruption Funds', description: '4 gold', effect: 'Buy influence' },
  'res-019': { name: 'Tax Revenue', description: '1 gold per controlled province', effect: 'From the tax system' },
  'res-020': { name: "The Khan's Treasure", description: '10 gold', effect: 'Immense riches' },
  'res-021': { name: 'Grain Harvest', description: '4 food', effect: 'Army upkeep' },
  'res-022': { name: 'Cattle Meat', description: '3 food', effect: 'A protein reserve' },
  'res-023': { name: 'Dried Food', description: '5 food', effect: 'Does not spoil' },
  'res-024': { name: 'Orchard', description: '2 food per turn', effect: 'Ongoing production' },
  'res-025': { name: 'Fishing Catch', description: '4 food', effect: 'From river provinces' },
  'res-026': { name: 'Food Reserves', description: '6 food', effect: 'An emergency stockpile' },
  'res-027': { name: 'Hunting Spoils', description: '2 food', effect: 'From hunting' },
  'res-028': { name: 'Agricultural Technology', description: '+1 food per farmland', effect: 'Improved harvest' },
  'res-029': { name: 'Rice Paddies', description: '3 food', effect: 'From Chinese farming' },
  'res-030': { name: 'Abundance', description: '8 food', effect: 'A giant harvest' },
  'res-031': { name: 'Blacksmiths', description: '2 artisans', effect: 'Weapon crafting' },
  'res-032': { name: 'Chinese Engineers', description: '3 artisans', effect: 'Builders of siege engines' },
  'res-033': { name: 'Persian Master Craftsmen', description: '4 artisans', effect: 'High-quality workmanship' },
  'res-034': { name: 'Weavers', description: '2 artisans', effect: 'Textile production' },
  'res-035': { name: 'Builders', description: '3 artisans', effect: 'Fortress construction' },
  'res-036': { name: 'Potters', description: '1 artisan', effect: 'Trade goods' },
  'res-037': { name: 'Silver Workshops', description: '2 artisans', effect: 'Jewelry crafting' },
  'res-038': { name: 'Master Weaponsmith', description: 'Legendary craftsmanship', effect: 'Permanent +1 attack bonus' },
  'res-039': { name: "Craftsmen's Guild", description: '1 artisan per turn', effect: 'Ongoing production' },
  'res-040': { name: 'Apprentices', description: '1 artisan', effect: 'A novice' },
  'res-041': { name: 'Flock of Sheep', description: '4 livestock', effect: 'Wool and meat' },
  'res-042': { name: 'Cattle Herd', description: '3 livestock', effect: 'Draft animals and meat' },
  'res-043': { name: 'Camel Caravan', description: '5 livestock', effect: 'For desert trade' },
  'res-044': { name: 'Goat Herd', description: '3 livestock', effect: 'Milk and leather' },
  'res-045': { name: 'Yaks', description: '2 livestock', effect: 'Mountain animals' },
  'res-046': { name: 'Silkworm Farm', description: 'A specialty good', effect: '+2 gold from trade' },
  'res-047': { name: 'Spices', description: 'A rarity', effect: '+3 gold when traded' },
  'res-048': { name: 'Furs', description: 'Valuable', effect: '+2 gold from trade' },
  'res-049': { name: 'Gems', description: 'Diamonds and rubies', effect: '+10 gold' },
  'res-050': { name: "The Khan's Tiara", description: 'Royal jewels', effect: '+20 gold' },
};

// Card id -> English version of parsedEffect.description (the short combat/log summary in cards.ts)
export const CARD_EFFECT_DESC_EN: Record<string, string> = {
  'str-001': 'Mongol Charge: +3 attack',
  'str-006': 'Arrow Storm: +1 per cavalry',
  'str-008': 'Tactician of Chaos: +4 attack',
  'str-010': 'Blood Oath: +2 defense, no retreat',
  'str-011': 'Fire Frenzy: destroy a building',
  'str-013': 'Veterans: +1 to all in battle',
  'str-014': 'Reinforced Line: +3 defense',
  'str-016': 'Cavalry Shock: +3 on first strike',
  'str-017': 'Pit Traps: +2 defense',
  'str-018': 'Shadow Soldiers: +1 reconnaissance',
  'str-019': "The Khan's Command: +3 combined attack",
  'str-020': 'Last Strength: +5 desperate attack',
  'str-021': 'Wall Reinforcement: +2 fortress',
  'str-022': 'Defiance: +2 defense for 2 turns',
  'str-024': 'Boiling Oil: +3 defense against siege',
  'str-025': 'City Guards: +2 defense',
  'str-026': 'Scorpion Engine: +2 defense',
  'str-027': 'Firewalls: +2 defense',
  'str-028': 'Food Stockpile: +3 food',
  'str-032': 'Battle-Hardened: +2 on own territory',
  'str-033': 'Cold Resistance: +4 winter defense',
  'str-034': 'Army Dispersal: +2 guerrilla defense',
  'str-035': 'The Last Wall: +5 defense',
  'str-051': 'Spirit of Genghis Khan: +2 to all',
  'str-054': 'Chinese Gunpowder: destroy a fortress',

  'tek-001': 'Composite Bow: +1 cavalry attack permanently',
  'tek-002': 'Heavy Cavalry: +1 cavalry defense permanently',
  'tek-003': 'Siege Engine: +2 against fortresses',
  'tek-005': 'Steel Armor: +1 infantry defense permanently',
  'tek-011': 'Tax System: +5 gold',
  'tek-013': 'Farming Technique: +3 food',
  'tek-015': 'Literacy: +2 gold per turn',
  'tek-024': 'Metalworking: +2 artisans',
  'tek-026': 'Architecture: +1 fortress durability',
  'tek-029': 'Philosophy: +3 gold',
  'tek-030': 'Universal Science: +10 gold',

  'res-001': 'Mongol Horses: +3 horses',
  'res-002': 'Wild Horse Herd: +5 horses',
  'res-003': 'War Horses: +2 horses',
  'res-004': 'Horse Ranch: +3 horses',
  'res-005': 'Steppe Stallion: +1 special horse',
  'res-006': 'Horse Care: +2 horses',
  'res-007': 'Foal Herd: +4 horses',
  'res-008': 'Caravan Horses: +3 horses',
  'res-009': 'Persian Arabian Horse: +2 horses',
  'res-010': 'Legendary Stallion: +1 special horse',
  'res-011': 'Gold Coins: +3 gold',
  'res-012': 'Treasure Chest: +5 gold',
  'res-013': 'Silk Money: +4 gold',
  'res-014': 'Plundered Riches: +6 gold',
  'res-015': "Merchant's Profits: +3 gold",
  'res-017': 'Gold Mine: +5 gold',
  'res-018': 'Corruption Funds: +4 gold',
  'res-019': 'Tax Revenue: +3 gold',
  'res-020': "The Khan's Treasure: +10 gold",
  'res-021': 'Grain Harvest: +4 food',
  'res-022': 'Cattle Meat: +3 food',
  'res-023': 'Dried Food: +5 food',
  'res-024': 'Orchard: +4 food',
  'res-025': 'Fishing Catch: +4 food',
  'res-026': 'Food Reserves: +6 food',
  'res-027': 'Hunting Spoils: +2 food',
  'res-028': 'Agricultural Technology: +3 food',
  'res-029': 'Rice Paddies: +3 food',
  'res-030': 'Abundance: +8 food',
  'res-031': 'Blacksmiths: +2 artisans',
  'res-032': 'Chinese Engineers: +3 artisans',
  'res-033': 'Persian Master Craftsmen: +4 artisans',
  'res-034': 'Weavers: +2 artisans',
  'res-035': 'Builders: +3 artisans',
  'res-036': 'Potters: +1 artisan',
  'res-037': 'Silver Workshops: +2 artisans',
  'res-038': 'Master Weaponsmith: +3 artisans',
  'res-039': "Craftsmen's Guild: +4 artisans",
  'res-040': 'Apprentices: +1 artisan',
  'res-041': 'Flock of Sheep: +4 food',
  'res-042': 'Cattle Herd: +3 food',
  'res-043': 'Camel Caravan: +5 food',
  'res-044': 'Goat Herd: +3 food',
  'res-045': 'Yaks: +2 food',
  'res-046': 'Silkworm Farm: +2 gold',
  'res-047': 'Spices: +3 gold',
  'res-048': 'Furs: +2 gold',
  'res-049': 'Gems: +4 gold',
  'res-050': "The Khan's Tiara: +8 gold",
};

export const CARD_TYPE_NAME_EN: Record<CardType, string> = {
  strategy: 'Strategy Card',
  diplomacy: 'Diplomacy Card',
  technology: 'Technology Card',
  resource: 'Resource Card',
};

export const RARITY_NAME_EN: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  legendary: 'Legendary',
};

type Lang = 'fi' | 'en';

/** Returns a display copy of the card with English text when lang === 'en' (falls back to Finnish if untranslated). */
export function localizeCard<T extends { id: string; name: string; description: string; effect: string; cost?: string }>(card: T, lang: Lang): T {
  if (lang !== 'en') return card;
  const en = CARD_TEXT_EN[card.id];
  if (!en) return card;
  return { ...card, name: en.name, description: en.description, effect: en.effect, cost: en.cost ?? card.cost };
}

/** Returns the English parsedEffect.description for a card id (falls back to the given Finnish text). */
export function localizeEffectDescription(cardId: string, fallback: string, lang: Lang): string {
  if (lang !== 'en') return fallback;
  return CARD_EFFECT_DESC_EN[cardId] ?? fallback;
}

export function localizeCardTypeName(type: CardType, fallback: string, lang: Lang): string {
  if (lang !== 'en') return fallback;
  return CARD_TYPE_NAME_EN[type] ?? fallback;
}

export function localizeRarityName(rarity: string, fallback: string, lang: Lang): string {
  if (lang !== 'en') return fallback;
  return RARITY_NAME_EN[rarity] ?? fallback;
}
