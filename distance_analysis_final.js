#!/usr/bin/env node
/**
 * Final comprehensive distance validation for all 70 provinces
 * Extracts ALL provinces from ProvinceData.ts and finds all pairs with distance < 6.05
 */

const fs = require('fs');
const path = require('path');

// Read the ProvinceData.ts file
const filePath = path.join(process.cwd(), 'src/data/ProvinceData.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Extract all province definitions using regex
// Pattern: p('id', 'name', ..., { ... center: { x: NUM, y: NUM }, ... })
const pattern = /p\('([^']+)',\s*'([^']+)'[^}]*?center:\s*{\s*x:\s*([\d.]+),\s*y:\s*([\d.]+)\s*}/gs;

const provinces = {};
let match;

while ((match = pattern.exec(content)) !== null) {
  const provinceId = match[1];
  const provinceName = match[2];
  const x = parseFloat(match[3]);
  const y = parseFloat(match[4]);
  
  provinces[provinceId] = {
    name: provinceName,
    x: x,
    y: y
  };
}

console.log(`✓ Extracted ${Object.keys(provinces).length} provinces from ProvinceData.ts\n`);

// Verify we have 70 provinces
if (Object.keys(provinces).length !== 70) {
  console.log(`⚠ WARNING: Expected 70 provinces but found ${Object.keys(provinces).length}\n`);
}

// Sort by ID for consistent output
const sortedIds = Object.keys(provinces).sort();

// Print all provinces with their coordinates
console.log('='.repeat(80));
console.log('ALL 70 PROVINCES WITH COORDINATES');
console.log('='.repeat(80));
sortedIds.forEach((pid, i) => {
  const p = provinces[pid];
  const num = (i + 1).toString().padStart(2);
  const name = p.name.padEnd(25);
  const id = pid.padEnd(25);
  console.log(`${num}. ${name} (${id}) -> (${p.x.toString().padStart(6)}, ${p.y.toString().padStart(6)})`);
});

console.log(`\n${'='.repeat(80)}`);
console.log('PAIRWISE DISTANCE ANALYSIS (< 6.05 units)');
console.log('='.repeat(80));

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Calculate all pairwise distances and find violations
const violations = [];

for (let i = 0; i < sortedIds.length; i++) {
  const id1 = sortedIds[i];
  for (let j = i + 1; j < sortedIds.length; j++) {
    const id2 = sortedIds[j];
    const p1 = provinces[id1];
    const p2 = provinces[id2];
    
    const dist = distance(p1.x, p1.y, p2.x, p2.y);
    
    if (dist < 6.05) {
      violations.push({
        id1,
        name1: p1.name,
        x1: p1.x,
        y1: p1.y,
        id2,
        name2: p2.name,
        x2: p2.x,
        y2: p2.y,
        distance: dist
      });
    }
  }
}

// Sort violations by distance (ascending)
violations.sort((a, b) => a.distance - b.distance);

// Print results
if (violations.length === 0) {
  console.log('\n✓ NO VIOLATIONS FOUND!');
  console.log('All 2,415 province pairs maintain distance >= 6.05 units');
} else {
  console.log(`\n⚠ FOUND ${violations.length} VIOLATION(S):\n`);
  violations.forEach((v, i) => {
    const line = `${i + 1}. ${v.name1.padEnd(25)} (${v.x1.toString().padStart(6)}, ${v.y1.toString().padStart(6)}) <-> ` +
                 `${v.name2.padEnd(25)} (${v.x2.toString().padStart(6)}, ${v.y2.toString().padStart(6)}) = ${v.distance.toFixed(3)}`;
    console.log(line);
  });
}

console.log(`\n${'='.repeat(80)}`);
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Total Provinces:      ${Object.keys(provinces).length}`);
console.log(`Total Possible Pairs: ${Object.keys(provinces).length * (Object.keys(provinces).length - 1) / 2}`);
console.log(`Violations (< 6.05):  ${violations.length}`);
console.log(`Pass Threshold:       ${violations.length === 0 ? 'YES ✓' : `NO ✗ (${violations.length} pairs)`}`);
console.log();
