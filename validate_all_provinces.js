/**
 * Extract all provinces from ProvinceData.ts and validate spacing
 */

const fs = require('fs');
const path = require('path');

// Read the ProvinceData.ts file
const dataFile = fs.readFileSync(
  path.join(__dirname, 'src/data/ProvinceData.ts'),
  'utf-8'
);

// Extract all p('id', ...) call data using regex
// Pattern: p('id', 'name', ... center: { x: XX, y: YY }
const provincePattern = /p\('([^']+)',\s*'([^']+)'[^}]*?center:\s*\{\s*x:\s*([\d.]+),\s*y:\s*([\d.]+)\s*\}/g;

const provinces = [];
let match;

while ((match = provincePattern.exec(dataFile)) !== null) {
  const [fullMatch, id, name, x, y] = match;
  provinces.push({
    id,
    name,
    center: {
      x: parseFloat(x),
      y: parseFloat(y),
    },
  });
}

console.log(`\n✓ Extracted ${provinces.length} provinces\n`);

// Calculate distance between two points
function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Calculate all pairwise distances
const violations = [];
const MIN_DISTANCE = 6.05;

for (let i = 0; i < provinces.length; i++) {
  for (let j = i + 1; j < provinces.length; j++) {
    const p1 = provinces[i];
    const p2 = provinces[j];
    const dist = distance(p1.center, p2.center);

    if (dist < MIN_DISTANCE) {
      violations.push({
        province1: p1.id,
        province2: p2.id,
        distance: dist,
        name1: p1.name,
        name2: p2.name,
      });
    }
  }
}

// Sort violations by distance
violations.sort((a, b) => a.distance - b.distance);

// Report results
console.log('═'.repeat(80));
console.log('PROVINCE SPACING VALIDATION');
console.log('═'.repeat(80));
console.log(`Total provinces: ${provinces.length}`);
console.log(`Total pairwise checks: ${(provinces.length * (provinces.length - 1)) / 2}`);
console.log(`Minimum required distance: ${MIN_DISTANCE} units`);
console.log(`\nViolations found: ${violations.length}`);

if (violations.length === 0) {
  console.log('\n' + '✓'.repeat(30));
  console.log('✓ ALL PROVINCES VALIDATED - Perfect 6+ unit minimum spacing achieved');
  console.log('✓'.repeat(30));
} else {
  console.log('\n⚠ SPACING VIOLATIONS DETECTED:\n');
  console.log('Distance | Province 1           | Province 2');
  console.log('-'.repeat(80));
  
  for (const v of violations) {
    const dist = v.distance.toFixed(4);
    const p1 = `${v.province1} (${v.name1})`.padEnd(25);
    const p2 = `${v.province2} (${v.name2})`;
    console.log(`${dist.padStart(7)} | ${p1} | ${p2}`);
  }
}

console.log('\n═'.repeat(80));
