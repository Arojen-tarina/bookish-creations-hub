import assert from 'node:assert/strict';
import { createHexGridLayout } from '../src/hooks/hexMapLayout.ts';

const hexes = createHexGridLayout();

assert.ok(hexes.length > 0, 'hex grid should contain hex tiles');
assert.ok(hexes.every(hex => hex.hasCity), 'every tile should contain a city');
assert.ok(hexes.some(hex => hex.ownerId === 'mongol'), 'mongol should own at least one city tile');
assert.ok(hexes.some(hex => hex.ownerId === 'china'), 'china should own at least one city tile');
assert.ok(hexes.some(hex => hex.ownerId === 'persia'), 'persia should own at least one city tile');
assert.ok(hexes.some(hex => hex.ownerId === 'russia'), 'russia should own at least one city tile');
assert.ok(hexes.some(hex => hex.ownerId === null), 'some tiles should remain neutral');

console.log(`Verified ${hexes.length} hex tiles with cities and faction ownership.`);
