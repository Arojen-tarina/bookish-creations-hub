#!/usr/bin/env node
/**
 * Extract all 83 provinces from ProvinceData.ts and validate spacing.
 * Report all violations < 6.1 units with exact distances.
 */

const fs = require('fs');
const path = require('path');

// Read the ProvinceData.ts file
const filePath = path.join(__dirname, 'src/data/ProvinceData.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Extract all province definitions using regex
// Pattern: p('id', 'name', ..., { ... center: { x: X, y: Y }, ... })
const pattern = /p\('([^']+)',\s*'([^']+)'.*?center:\s*\{\s*x:\s*([\d.]+),\s*y:\s*([\d.]+)\s*\}/gs;

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

console.log(`Found ${Object.keys(provinces).length} provinces`);
console.log('='.repeat(80));

// Calculate all pairwise distances
const violations = [];

const provinceIds = Object.keys(provinces).sort();

for (let i = 0; i < provinceIds.length; i++) {
  for (let j = i + 1; j < provinceIds.length; j++) {
    const id1 = provinceIds[i];
    const id2 = provinceIds[j];
    
    const p1 = provinces[id1];
    const p2 = provinces[id2];
    
    // Euclidean distance
    const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    
    // Check if violation (< 6.1)
    if (distance < 6.1) {
      violations.push({
        id1: id1,
        name1: p1.name,
        id2: id2,
        name2: p2.name,
        distance: distance,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y
      });
    }
  }
}

// Sort violations by distance (closest first)
violations.sort((a, b) => a.distance - b.distance);

// Report
if (violations.length > 0) {
  console.log(`VIOLATIONS FOUND: ${violations.length} pairs with distance < 6.1\n`);
  for (const v of violations) {
    console.log(`  ${v.name1.padEnd(20)} (${v.id1.padEnd(20)}) x=${v.x1.toFixed(1).padStart(5)}, y=${v.y1.toFixed(1).padStart(5)}`);
    console.log(`  ${v.name2.padEnd(20)} (${v.id2.padEnd(20)}) x=${v.x2.toFixed(1).padStart(5)}, y=${v.y2.toFixed(1).padStart(5)}`);
    console.log(`  Distance: ${v.distance.toFixed(4)} units\n`);
  }
} else {
  console.log('✓ SUCCESS - All provinces properly spaced');
}

console.log('='.repeat(80));
console.log(`Total provinces: ${Object.keys(provinces).length}`);
console.log(`Total unique pairwise distances checked: ${provinceIds.length * (provinceIds.length - 1) / 2}`);
