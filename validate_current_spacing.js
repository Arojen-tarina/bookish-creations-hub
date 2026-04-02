#!/usr/bin/env node

/**
 * Extract all 83 provinces from current ProvinceData.ts and validate pairwise distances.
 * Report ONLY violations < 6.1 units.
 */

const fs = require('fs');
const path = require('path');

// Read the TypeScript file
const tsFilePath = path.join(__dirname, 'src/data/ProvinceData.ts');
const content = fs.readFileSync(tsFilePath, 'utf-8');

// Extract all p(...) calls with center coordinates
const pattern = /p\('([^']+)',\s*'([^']+)'.*?center:\s*\{\s*x:\s*(\d+(?:\.\d+)?),\s*y:\s*(\d+(?:\.\d+)?)\s*\}/gs;

const provinces = {};
let match;

while ((match = pattern.exec(content)) !== null) {
  const provinceId = match[1];
  const provinceName = match[2];
  const x = parseFloat(match[3]);
  const y = parseFloat(match[4]);
  provinces[provinceId] = { name: provinceName, x, y };
}

console.log(`Total provinces extracted: ${Object.keys(provinces).length}`);
console.log();

// Calculate all pairwise distances
const provinceIds = Object.keys(provinces).sort();
const violations = [];

for (let i = 0; i < provinceIds.length; i++) {
  for (let j = i + 1; j < provinceIds.length; j++) {
    const idA = provinceIds[i];
    const idB = provinceIds[j];
    
    const { name: nameA, x: xA, y: yA } = provinces[idA];
    const { name: nameB, x: xB, y: yB } = provinces[idB];
    
    // Calculate Euclidean distance
    const distance = Math.sqrt((xA - xB) ** 2 + (yA - yB) ** 2);
    
    // Check if violates minimum spacing of 6.1 units
    if (distance < 6.1) {
      violations.push({
        idA,
        idB,
        nameA,
        nameB,
        xA,
        yA,
        xB,
        yB,
        distance
      });
    }
  }
}

// Report results
console.log(`Total pairwise distances checked: ${(provinceIds.length * (provinceIds.length - 1)) / 2}`);
console.log(`Minimum spacing threshold: 6.1 units`);
console.log(`Violations found: ${violations.length}`);
console.log();

if (violations.length > 0) {
  console.log('='.repeat(90));
  console.log('SPACING VIOLATIONS (distance < 6.1 units):');
  console.log('='.repeat(90));
  
  // Sort by distance (ascending)
  violations.sort((a, b) => a.distance - b.distance);
  
  violations.forEach(v => {
    console.log(`\n${v.idA.padEnd(20)} <-> ${v.idB.padEnd(20)}`);
    console.log(`  ${v.nameA.padEnd(25)} (${v.xA.toFixed(1).padStart(5)}, ${v.yA.toFixed(1).padStart(5)})`);
    console.log(`  ${v.nameB.padEnd(25)} (${v.xB.toFixed(1).padStart(5)}, ${v.yB.toFixed(1).padStart(5)})`);
    console.log(`  Distance: ${v.distance.toFixed(2)} units`);
  });
} else {
  console.log('✓ VALIDATION PASSED - All provinces properly spaced');
}
