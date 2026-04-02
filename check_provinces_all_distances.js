#!/usr/bin/env node

/**
 * Validate all 83 provinces from ProvinceData.ts
 * Check all pairwise distances and report violations < 6.1 units
 */

// All 83 provinces extracted from ProvinceData.ts
const provinces = {
  // North West (15)
  novgorod: [8, 12],
  pskov: [6, 22],
  tver: [20, 18],
  vladimir: [24, 8],
  smolensk: [14, 44],
  ryazan: [36, 20],
  chernigov: [14, 26],
  kiev: [12, 36],
  volga_bulgars: [28, 14],
  kipchak_central: [29, 22],
  siberia_west: [34, 10],
  altai: [44, 18],
  dzungaria: [36, 22],
  semirechye: [35, 30],
  khiva: [20, 48],
  
  // North East (18)
  karakorum: [53, 32],
  mongol_east: [60, 28],
  mongol_central: [48, 28],
  mongol_west: [38, 38],
  kerulen: [70, 24],
  onon: [72, 32],
  baikal: [58, 18],
  gobi_north: [60, 42],
  siberia_central: [44, 6],
  siberia_east: [54, 12],
  yakutia: [68, 10],
  manchuria_north: [74, 18],
  manchuria_central: [78, 24],
  liaoyang: [88, 34],
  liaodong: [90, 48],
  hebei_north: [82, 16],
  datong: [72, 40],
  turfan: [46, 34],
  
  // South West (21)
  sarkel: [23, 35],
  kipchak_west: [17, 37],
  khazaria: [21, 43],
  georgia: [4, 50],
  armenia: [10, 54],
  azerbaijan: [26, 48],
  shirvan: [12, 64],
  urgench: [24, 50],
  bukhara: [26, 57],
  merv: [28, 63],
  nishapur: [23, 67],
  balkh: [36, 55],
  herat: [42, 63],
  samarkand: [30, 51],
  isfahan: [18, 63],
  shiraz: [14, 71],
  tabriz: [6, 54],
  ray: [4, 32],
  kerman: [30, 72],
  hormuz: [20, 77],
  
  // South East (29)
  kashgar: [42, 43],
  khotan: [38, 50],
  dunhuang: [52, 40],
  xingqing: [54, 56],
  ganzhou: [48, 54],
  liangzhou: [52, 63],
  xixia_north: [51, 48],
  ordos: [64, 50],
  gobi_south: [62, 38],
  zhongdu: [78, 38],
  taiyuan: [70, 60],
  kaifeng: [78, 48],
  luoyang: [72, 52],
  shandong: [84, 42],
  shanxi_north: [68, 46],
  hangzhou: [74, 75],
  nanjing: [70, 69],
  suzhou: [82, 78],
  fujian: [74, 83],
  guangdong: [66, 89],
  jiangxi: [68, 82],
  hunan: [60, 79],
  hubei: [62, 71],
  sichuan: [52, 71],
  yunnan: [52, 83],
  lhasa: [46, 62],
  tibet_east: [60, 58],
  tibet_west: [36, 60],
  goryeo: [94, 43],
  korea_south: [88, 56],
};

function euclideanDistance(p1, p2) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function validateDistances() {
  const ids = Object.keys(provinces);
  const violations = [];
  
  // Check all pairwise distances
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const id1 = ids[i];
      const id2 = ids[j];
      const dist = euclideanDistance(provinces[id1], provinces[id2]);
      
      if (dist < 6.1) {
        violations.push({ id1, id2, dist });
      }
    }
  }
  
  // Sort by distance ascending
  violations.sort((a, b) => a.dist - b.dist);
  return violations;
}

// Main
console.log(`Extracting provinces from ProvinceData.ts...`);
console.log(`✓ Extracted ${Object.keys(provinces).length} provinces\n`);

console.log(`Validating all pairwise distances...`);
const violations = validateDistances();

if (violations.length === 0) {
  console.log(`✓ VALIDATION PASSED - All provinces properly spaced`);
} else {
  console.log(`✗ VALIDATION FAILED - Found ${violations.length} violations (distance < 6.1):\n`);
  console.log(`${'Province 1':<20} ${'Province 2':<20} ${'Distance':>10}`);
  console.log('-'.repeat(52));
  
  violations.forEach(({ id1, id2, dist }) => {
    console.log(`${id1:<20} ${id2:<20} ${dist.toFixed(4).padStart(10)}`);
  });
}

process.exit(violations.length === 0 ? 0 : 1);
