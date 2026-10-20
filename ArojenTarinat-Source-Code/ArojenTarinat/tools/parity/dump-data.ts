import { getProvincesWithAdjacency } from '@/data/ProvinceData.ts';
import { strategyCards, diplomacyCards, technologyCards, resourceCards } from '@/data/gameCards';
import { createPlayableDeck } from '@/game/cards';
import { writeFileSync } from 'node:fs';

const order = [...strategyCards, ...diplomacyCards, ...technologyCards, ...resourceCards].map(c => c.id);
const byId = new Map(createPlayableDeck().map(c => [c.id, c]));
const cards = order.map(id => {
  const c = byId.get(id)!;
  return { id: c.id, type: c.type, rarity: c.rarity ?? null, name: c.name, description: c.description, effectText: c.effect, cost: c.cost ?? null, effect: c.parsedEffect };
});
writeFileSync(process.argv[2], JSON.stringify({ provinces: getProvincesWithAdjacency(), cards }, null, 1));
console.log(`provinces=${getProvincesWithAdjacency().length} cards=${cards.length}`);
