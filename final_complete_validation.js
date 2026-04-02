#!/usr/bin/env node
/**
 * FINAL COMPREHENSIVE DISTANCE VALIDATION
 * Extract all 83 provinces and check ALL pairwise distances
 * Report ALL violations where distance < 6.1 units
 */

const fs = require('fs');
const path = require('path');

// All 83 provinces with their coordinates from ProvinceData.ts (March 29, 2026)
const provinces = {
  // NORTH WEST (15)
  novgorod: { x: 8, y: 12 },
  pskov: { x: 6, y: 22 },
  tver: { x: 20, y: 18 },
  vladimir: { x: 24, y: 8 },
  smolensk: { x: 14, y: 44 },
  ryazan: { x: 36, y: 20 },
  chernigov: { x: 14, y: 26 },
  kiev: { x: 12, y: 36 },
  volga_bulgars: { x: 28, y: 14 },
  kipchak_central: { x: 29, y: 22 },
  siberia_west: { x: 34, y: 10 },
  altai: { x: 44, y: 18 },
  dzungaria: { x: 36, y: 22 },
  semirechye: { x: 35, y: 30 },
  khiva: { x: 10, y: 44 },
  
  // NORTH EAST (18)
  karakorum: { x: 53, y: 32 },
  mongol_east: { x: 60, y: 28 },
  mongol_central: { x: 48, y: 28 },
  mongol_west: { x: 38, y: 38 },
  kerulen: { x: 70, y: 24 },
  onon: { x: 72, y: 32 },
  baikal: { x: 58, y: 18 },
  gobi_north: { x: 60, y: 42 },
  siberia_central: { x: 44, y: 6 },
  siberia_east: { x: 54, y: 12 },
  yakutia: { x: 68, y: 10 },
  manchuria_north: { x: 74, y: 18 },
  manchuria_central: { x: 78, y: 24 },
  liaoyang: { x: 88, y: 34 },
  liaodong: { x: 90, y: 48 },
  hebei_north: { x: 82, y: 16 },
  datong: { x: 72, y: 40 },
  turfan: { x: 46, y: 34 },
  
  // SOUTH WEST (20)
  sarkel: { x: 23, y: 35 },
  kipchak_west: { x: 17, y: 37 },
  khazaria: { x: 21, y: 43 },
  georgia: { x: 8, y: 44 },
  armenia: { x: 10, y: 48 },
  azerbaijan: { x: 26, y: 48 },
  shirvan: { x: 12, y: 64 },
  urgench: { x: 24, y: 50 },
  bukhara: { x: 26, y: 57 },
  merv: { x: 28, y: 63 },
  nishapur: { x: 23, y: 67 },
  balkh: { x: 36, y: 55 },
  herat: { x: 42, y: 63 },
  samarkand: { x: 30, y: 51 },
  isfahan: { x: 18, y: 63 },
  shiraz: { x: 14, y: 71 },
  tabriz: { x: 6, y: 54 },
  ray: { x: 4, y: 32 },
  kerman: { x: 30, y: 72 },
  hormuz: { x: 20, y: 77 },
  
  // SOUTH EAST (30)
  kashgar: { x: 42, y: 43 },
  khotan: { x: 38, y: 50 },
  dunhuang: { x: 52, y: 40 },
  xingqing: { x: 54, y: 56 },
  ganzhou: { x: 48, y: 54 },
  liangzhou: { x: 52, y: 63 },
  xixia_north: { x: 51, y: 48 },
  ordos: { x: 64, y: 50 },
  gobi_south: { x: 62, y: 38 },
  zhongdu: { x: 78, y: 38 },
  taiyuan: { x: 70, y: 60 },
  kaifeng: { x: 78, y: 48 },
  luoyang: { x: 72, y: 52 },
  shandong: { x: 84, y: 42 },
  shanxi_north: { x: 68, y: 46 },
  hangzhou: { x: 74, y: 75 },
  nanjing: { x: 70, y: 69 },
  suzhou: { x: 82, y: 78 },
  fujian: { x: 74, y: 83 },
  guangdong: { x: 66, y: 89 },
  jiangxi: { x: 68, y: 82 },
  hunan: { x: 60, y: 79 },
  hubei: { x: 62, y: 71 },
  sichuan: { x: 52, y: 71 },
  yunnan: { x: 52, y: 83 },
  lhasa: { x: 46, y: 62 },
  tibet_east: { x: 60, y: 58 },
  tibet_west: { x: 36, y: 60 },
  goryeo: { x: 94, y: 43 },
  korea_south: { x: 88, y: 56 },
};

const THRESHOLD = 6.1;

// Calculate Euclidean distance
function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Find all violations
const violations = [];
const provinceIds = Object.keys(provinces).sort();

console.log(`\n${'='.repeat(80)}`);
console.log('FINAL COMPREHENSIVE DISTANCE VALIDATION');
console.log(`${'='.repeat(80)}`);
console.log(`\nTotal provinces: ${provinceIds.length}`);
console.log(`Total pairwise combinations: ${provinceIds.length * (provinceIds.length - 1) / 2}`);
console.log(`Threshold: ${THRESHOLD} units\n`);

for (let i = 0; i < provinceIds.length; i++) {
  for (let j = i + 1; j < provinceIds.length; j++) {
    const id1 = provinceIds[i];
    const id2 = provinceIds[j];
    const p1 = provinces[id1];
    const p2 = provinces[id2];
    const dist = distance(p1, p2);
    
    if (dist < THRESHOLD) {
      violations.push({
        id1,
        id2,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        distance: dist
      });
    }
  }
}

// Sort by distance
violations.sort((a, b) => a.distance - b.distance);

// Display results
if (violations.length === 0) {
  console.log('✅ SUCCESS! NO VIOLATIONS FOUND');
  console.log('\nAll inter-province distances are >= 6.1 units');
} else {
  console.log(`❌ VIOLATIONS FOUND: ${violations.length} pair(s)`);
  console.log(`\nALL VIOLATIONS (distance < ${THRESHOLD} units), sorted smallest to largest:\n`);
  
  violations.forEach((v, idx) => {
    console.log(`${String(idx + 1).padStart(2, ' ')}. ${v.id1.padEnd(20)} (${String(v.x1).padStart(2)},${String(v.y1).padStart(2)}) ↔ ${v.id2.padEnd(20)} (${String(v.x2).padStart(2)},${String(v.y2).padStart(2)}) = ${v.distance.toFixed(3)}`);
  });
}

console.log(`\n${'='.repeat(80)}`);
console.log('VALIDATION SUMMARY');
console.log(`${'='.repeat(80)}`);
console.log(`Total provinces: ${provinceIds.length}`);
console.log(`Total pairs checked: ${provinceIds.length * (provinceIds.length - 1) / 2}`);
console.log(`Total violations: ${violations.length}`);

if (violations.length === 0) {
  console.log(`\n✅ VALIDATION PASSED - All inter-province distances >= ${THRESHOLD} units`);
} else {
  const minDist = Math.min(...violations.map(v => v.distance));
  console.log(`\n❌ VALIDATION FAILED - ${violations.length} pair(s) with distance < ${THRESHOLD} units`);
  console.log(`   Minimum distance found: ${minDist.toFixed(3)} units`);
}
console.log(`${'='.repeat(80)}\n`);
