const provinces = [
  // NORTH WEST
  {id:"novgorod",x:8,y:12},{id:"pskov",x:6,y:22},{id:"tver",x:20,y:18},{id:"vladimir",x:24,y:8},
  {id:"smolensk",x:14,y:44},{id:"ryazan",x:36,y:20},{id:"chernigov",x:14,y:26},{id:"kiev",x:12,y:36},
  {id:"volga_bulgars",x:28,y:14},{id:"kipchak_central",x:29,y:22},{id:"siberia_west",x:34,y:10},
  {id:"altai",x:44,y:18},{id:"dzungaria",x:36,y:22},{id:"semirechye",x:35,y:30},{id:"khiva",x:18,y:30},
  // NORTH EAST
  {id:"karakorum",x:53,y:32},{id:"mongol_east",x:60,y:28},{id:"mongol_central",x:48,y:28},{id:"mongol_west",x:42,y:30},
  {id:"kerulen",x:70,y:24},{id:"onon",x:72,y:32},{id:"baikal",x:58,y:18},{id:"gobi_north",x:60,y:42},
  {id:"siberia_central",x:44,y:6},{id:"siberia_east",x:54,y:12},{id:"yakutia",x:68,y:10},{id:"manchuria_north",x:74,y:18},
  {id:"manchuria_central",x:78,y:24},{id:"liaoyang",x:88,y:34},{id:"liaodong",x:90,y:48},{id:"hebei_north",x:82,y:16},
  {id:"datong",x:72,y:40},{id:"turfan",x:46,y:34},
  // SOUTH WEST
  {id:"sarkel",x:23,y:35},{id:"kipchak_west",x:17,y:37},{id:"khazaria",x:21,y:43},{id:"georgia",x:11,y:40},
  {id:"armenia",x:10,y:48},{id:"azerbaijan",x:26,y:48},{id:"shirvan",x:12,y:64},{id:"urgench",x:24,y:50},
  {id:"bukhara",x:26,y:57},{id:"merv",x:28,y:63},{id:"nishapur",x:23,y:67},{id:"balkh",x:36,y:55},
  {id:"herat",x:34,y:63},{id:"samarkand",x:30,y:51},{id:"isfahan",x:18,y:63},{id:"shiraz",x:14,y:71},
  {id:"tabriz",x:6,y:54},{id:"ray",x:4,y:32},{id:"kerman",x:30,y:72},{id:"hormuz",x:20,y:77},
  // SOUTH EAST
  {id:"kashgar",x:42,y:43},{id:"khotan",x:38,y:50},{id:"dunhuang",x:52,y:40},{id:"xingqing",x:54,y:56},
  {id:"ganzhou",x:48,y:54},{id:"liangzhou",x:52,y:63},{id:"xixia_north",x:51,y:48},{id:"ordos",x:64,y:50},
  {id:"gobi_south",x:62,y:38},{id:"zhongdu",x:78,y:38},{id:"taiyuan",x:70,y:60},{id:"kaifeng",x:78,y:48},
  {id:"luoyang",x:72,y:52},{id:"shandong",x:84,y:42},{id:"shanxi_north",x:68,y:46},{id:"hangzhou",x:74,y:75},
  {id:"nanjing",x:70,y:69},{id:"suzhou",x:82,y:78},{id:"fujian",x:74,y:83},{id:"guangdong",x:66,y:89},
  {id:"jiangxi",x:68,y:82},{id:"hunan",x:60,y:79},{id:"hubei",x:62,y:71},{id:"sichuan",x:52,y:71},
  {id:"yunnan",x:52,y:83},{id:"lhasa",x:46,y:62},{id:"tibet_east",x:60,y:58},{id:"tibet_west",x:36,y:60},
  {id:"goryeo",x:94,y:43},{id:"korea_south",x:88,y:56}
];

function dist(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx*dx + dy*dy);
}

const violations = [];
const THRESHOLD = 6.05;

for (let i=0; i<provinces.length; i++) {
  for (let j=i+1; j<provinces.length; j++) {
    const d = dist(provinces[i], provinces[j]);
    if (d < THRESHOLD) {
      violations.push({
        p1: provinces[i].id,
        p2: provinces[j].id,
        d: d.toFixed(4)
      });
    }
  }
}

violations.sort((a,b) => parseFloat(a.d) - parseFloat(b.d));

console.log(`\n${'='.repeat(90)}`);
console.log('PROVINCE SPACING VALIDATION - COMPLETE ANALYSIS');
console.log(`${'='.repeat(90)}`);
console.log(`Total provinces: ${provinces.length}`);
console.log(`Total pairwise checks: ${provinces.length * (provinces.length-1) / 2}`);
console.log(`Minimum distance threshold: ${THRESHOLD}`);
console.log(`\nViolations found: ${violations.length}\n`);

if (violations.length === 0) {
  console.log('✓'.repeat(45));
  console.log('✓ ALL PROVINCES VALIDATED - Perfect 6+ unit minimum spacing achieved');
  console.log('✓'.repeat(45));
} else {
  console.log('Province Pair 1          | Province Pair 2          | Distance');
  console.log('-'.repeat(90));
  violations.forEach(v => {
    console.log(`${v.p1.padEnd(24)} | ${v.p2.padEnd(24)} | ${v.d}`);
  });
}
console.log(`${'='.repeat(90)}\n`);
