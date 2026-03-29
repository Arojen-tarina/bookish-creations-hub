#!/usr/bin/env node

// Extract provinces with coordinates from ProvinceData.ts
const fs = require('fs');
const path = require('path');

const fileContent = fs.readFileSync(
  path.join(__dirname, 'src/data/ProvinceData.ts'),
  'utf-8'
);

// Extract all province definitions
const provinceMatches = fileContent.matchAll(
  /p\('([^']+)',\s*'[^']+',\s*'[^']+',\s*'[^']+',\s*(?:null|'[^']+'),\s*{[^}]*center:\s*{\s*x:\s*(\d+(?:\.\d+)?),\s*y:\s*(\d+(?:\.\d+)?)\s*}[^}]*}\s*\)/g
);

const provinces = [];
for (const match of provinceMatches) {
  provinces.push({
    id: match[1],
    x: parseFloat(match[2]),
    y: parseFloat(match[3])
  });
}

console.log(`Found ${provinces.length} provinces\n`);

if (provinces.length < 70) {
  console.error(`ERROR: Expected 70 provinces, found ${provinces.length}`);
  console.error('Provinces found:');
  provinces.forEach(p => console.error(`  ${p.id}: (${p.x}, ${p.y})`));
  process.exit(1);
}

// Calculate distances and find violations
const violations = [];
const MIN_DISTANCE = 6.05;

for (let i = 0; i < provinces.length; i++) {
  for (let j = i + 1; j < provinces.length; j++) {
    const p1 = provinces[i];
    const p2 = provinces[j];
    
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < MIN_DISTANCE) {
      violations.push({
        pair: `${p1.id} <-> ${p2.id}`,
        p1,
        p2,
        distance: distance.toFixed(3)
      });
    }
  }
}

console.log(`Checked all ${provinces.length * (provinces.length - 1) / 2} pairwise distances\n`);

if (violations.length === 0) {
  console.log('✓ VALIDATION PASSED - All 70 provinces maintain minimum 6-unit spacing (with ~3 unit radius each, allowing 6+ unit center-to-center distance)');
} else {
  console.log(`Found ${violations.length} violation${violations.length !== 1 ? 's' : ''}:\n`);
  violations.forEach(v => {
    console.log(`${v.pair}`);
    console.log(`  ${v.p1.id}: (${v.p1.x}, ${v.p1.y})`);
    console.log(`  ${v.p2.id}: (${v.p2.x}, ${v.p2.y})`);
    console.log(`  Distance: ${v.distance} units`);
    console.log('');
  });
}

process.exit(violations.length === 0 ? 0 : 1);
