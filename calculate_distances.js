// Extract coordinates from ProvinceData.ts

const provinces = {
  // Persia region
  isfahan: { x: 18, y: 63 },
  shiraz: { x: 14, y: 71 },
  tabriz: { x: 14, y: 55 },
  ray: { x: 17, y: 50 },
  kerman: { x: 22, y: 67 },
  hormuz: { x: 20, y: 77 },
  
  // Central Asia / Khwarezm
  merv: { x: 28, y: 63 },
  nishapur: { x: 23, y: 67 },
  herat: { x: 34, y: 63 },
  balkh: { x: 36, y: 55 },
  bukhara: { x: 26, y: 57 },
  urgench: { x: 26, y: 51 },
  samarkand: { x: 30, y: 51 },
  kashgar: { x: 42, y: 43 },
};

// Also check shirvan (Caucasus) in case it's close
const shirvan = { x: 21, y: 54 };

function euclideanDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

const provinceNames = Object.keys(provinces);
const totalPairs = (provinceNames.length * (provinceNames.length - 1)) / 2;

console.log(`Total provinces: ${provinceNames.length}`);
console.log(`Total pairs to check: ${totalPairs}`);
console.log(`\nCoordinates:`);
provinceNames.forEach(name => {
  const p = provinces[name];
  console.log(`  ${name.padEnd(12)}: (${p.x.toString().padStart(2)}, ${p.y.toString().padStart(2)})`);
});

console.log('\n' + '='.repeat(70));
console.log('PAIRS WITH DISTANCE < 6.2 UNITS:');
console.log('='.repeat(70));

const closePairs = [];

for (let i = 0; i < provinceNames.length; i++) {
  for (let j = i + 1; j < provinceNames.length; j++) {
    const name1 = provinceNames[i];
    const name2 = provinceNames[j];
    const p1 = provinces[name1];
    const p2 = provinces[name2];
    const distance = euclideanDistance(p1, p2);
    
    if (distance < 6.2) {
      closePairs.push({
        pair: `${name1} - ${name2}`,
        distance: distance.toFixed(4),
        distance_num: distance
      });
    }
  }
}

// Sort by distance
closePairs.sort((a, b) => a.distance_num - b.distance_num);

if (closePairs.length === 0) {
  console.log('\nNo pairs found with distance < 6.2 units');
} else {
  closePairs.forEach((item, idx) => {
    const [p1, p2] = item.pair.split(' - ');
    const c1 = provinces[p1];
    const c2 = provinces[p2];
    console.log(`\n${idx + 1}. ${item.pair.padEnd(40)} = ${item.distance} units`);
    console.log(`   ${p1.padEnd(12)}: (${c1.x.toString().padStart(2)}, ${c1.y.toString().padStart(2)})`);
    console.log(`   ${p2.padEnd(12)}: (${c2.x.toString().padStart(2)}, ${c2.y.toString().padStart(2)})`);
  });
}

// Check shirvan against all provinces
console.log('\n' + '='.repeat(70));
console.log('SHIRVAN (Caucasus) DISTANCES TO ALL PROVINCES:');
console.log('='.repeat(70));

const shirvanDistances = [];
provinceNames.forEach(name => {
  const distance = euclideanDistance(shirvan, provinces[name]);
  shirvanDistances.push({
    province: name,
    distance: distance.toFixed(4),
    distance_num: distance
  });
});

shirvanDistances.sort((a, b) => a.distance_num - b.distance_num);

shirvanDistances.slice(0, 5).forEach((item, idx) => {
  const closeIndicator = item.distance_num < 6.2 ? ' *** CLOSE ***' : '';
  console.log(`${idx + 1}. shirvan - ${item.province.padEnd(12)}: ${item.distance} units${closeIndicator}`);
});

// Show the full summary
console.log('\n' + '='.repeat(70));
console.log('ALL PAIRWISE DISTANCES (sorted by distance):');
console.log('='.repeat(70));

const allPairs = [];
for (let i = 0; i < provinceNames.length; i++) {
  for (let j = i + 1; j < provinceNames.length; j++) {
    const name1 = provinceNames[i];
    const name2 = provinceNames[j];
    const distance = euclideanDistance(provinces[name1], provinces[name2]);
    allPairs.push({
      pair: `${name1} - ${name2}`,
      distance: distance.toFixed(4),
      distance_num: distance,
      isClose: distance < 6.2
    });
  }
}

allPairs.sort((a, b) => a.distance_num - b.distance_num);

console.log(`\nFirst 20 pairs (shortest distances):\n`);
allPairs.slice(0, 20).forEach((item, idx) => {
  const [p1, p2] = item.pair.split(' - ');
  const c1 = provinces[p1];
  const c2 = provinces[p2];
  const indicator = item.isClose ? ' ✓' : '';
  console.log(`${(idx + 1).toString().padStart(2)}. ${item.pair.padEnd(40)} = ${item.distance}${indicator}`);
  if (idx < 5 || item.isClose) {
    console.log(`    ${p1}: (${c1.x}, ${c1.y})  |  ${p2}: (${c2.x}, ${c2.y})`);
  }
});
