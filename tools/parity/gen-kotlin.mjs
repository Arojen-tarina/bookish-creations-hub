import { readFileSync, writeFileSync } from 'node:fs';

const [dataPath, outDir] = process.argv.slice(2);
const d = JSON.parse(readFileSync(dataPath, 'utf8'));
const E = (s) => s.toUpperCase();
const BS = String.fromCharCode(92);
const str = (s) => '"' + s.split(BS).join(BS + BS).split('"').join(BS + '"').split('$').join(BS + '$') + '"';
const num = (n) => (Number.isInteger(n) ? n.toFixed(1) : String(n));
const header = (src) =>
  `// GENERATED from bookish-creations-hub ${src} by the port's data generator. Do not edit by hand.\npackage fi.bookish.creations.arojen.tarinat.game.data\n\n`;

for (const p of d.provinces) {
  if (p.supply !== 3 || p.garrison !== 0 || p.isCoastal || p.unrest !== 0 || p.buildings.length) {
    throw new Error('unexpected default override in ' + p.id);
  }
}

let k = header('src/data/ProvinceData.ts') +
`import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.Province
import fi.bookish.creations.arojen.tarinat.game.model.Region
import fi.bookish.creations.arojen.tarinat.game.model.Terrain
import fi.bookish.creations.arojen.tarinat.game.model.TradeGood

/** The 221 provinces of the 1206 start, in board order, with adjacency applied. */
val PROVINCES_1206: List<Province> = listOf(
`;
for (const p of d.provinces) {
  const args = [
    str(p.id), str(p.name), 'Region.' + E(p.region), 'Terrain.' + E(p.terrain),
    p.ownerId ? 'FactionId.' + E(p.ownerId) : 'null',
    `tax = ${p.baseTax}`, `manpower = ${p.baseManpower}`, `development = ${p.developmentLevel}`,
    `x = ${num(p.center.x)}`, `y = ${num(p.center.y)}`,
    `neighbors = listOf(${p.neighbors.map(str).join(', ')})`,
  ];
  if (p.fortLevel) args.push(`fort = ${p.fortLevel}`);
  if (p.tradeGood) args.push(`tradeGood = TradeGood.${E(p.tradeGood)}`);
  if (p.isCapital) args.push('capital = true');
  if (p.hasSilkRoad) args.push('silkRoad = true');
  k += `    province(${args.join(', ')}),\n`;
}
k += ')\n';
writeFileSync(outDir + '/Provinces1206.kt', k);

let c = header('src/data/gameCards.ts + src/game/cards.ts') +
`import fi.bookish.creations.arojen.tarinat.game.model.Card
import fi.bookish.creations.arojen.tarinat.game.model.CardEffect
import fi.bookish.creations.arojen.tarinat.game.model.CardEffectType
import fi.bookish.creations.arojen.tarinat.game.model.CardType
import fi.bookish.creations.arojen.tarinat.game.model.Rarity

/** Every card in the playable deck, in the original deck-building order. */
val CARD_CATALOG: List<Card> = listOf(
`;
for (const card of d.cards) {
  const e = card.effect;
  const rarity = card.rarity ? 'Rarity.' + E(card.rarity) : 'null';
  c += `    Card(${str(card.id)}, CardType.${E(card.type)}, ${rarity}, CardEffect(CardEffectType.${E(e.type)}, ${e.value}, ${e.duration})),\n`;
}
c += ')\n';
writeFileSync(outDir + '/CardCatalog.kt', c);
console.log('ok', d.provinces.length, d.cards.length);
