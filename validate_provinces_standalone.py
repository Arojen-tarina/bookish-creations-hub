#!/usr/bin/env python3
"""
Province Distance Validation Script
Extract all 83 provinces from ProvinceData.ts and validate all pairwise distances.
"""

import math
from itertools import combinations

# All 83 provinces extracted from ProvinceData.ts with their coordinates
provinces = {
    # North West (15)
    'novgorod': (8, 12),
    'pskov': (6, 22),
    'tver': (20, 18),
    'vladimir': (24, 8),
    'smolensk': (14, 44),
    'ryazan': (36, 20),
    'chernigov': (14, 26),
    'kiev': (12, 36),
    'volga_bulgars': (28, 14),
    'kipchak_central': (29, 22),
    'siberia_west': (34, 10),
    'altai': (44, 18),
    'dzungaria': (36, 22),
    'semirechye': (35, 30),
    'khiva': (20, 48),
    
    # North East (18)
    'karakorum': (53, 32),
    'mongol_east': (60, 28),
    'mongol_central': (48, 28),
    'mongol_west': (38, 38),
    'kerulen': (70, 24),
    'onon': (72, 32),
    'baikal': (58, 18),
    'gobi_north': (60, 42),
    'siberia_central': (44, 6),
    'siberia_east': (54, 12),
    'yakutia': (68, 10),
    'manchuria_north': (74, 18),
    'manchuria_central': (78, 24),
    'liaoyang': (88, 34),
    'liaodong': (90, 48),
    'hebei_north': (82, 16),
    'datong': (72, 40),
    'turfan': (46, 34),
    
    # South West (21)
    'sarkel': (23, 35),
    'kipchak_west': (17, 37),
    'khazaria': (21, 43),
    'georgia': (4, 50),
    'armenia': (10, 54),
    'azerbaijan': (26, 48),
    'shirvan': (12, 64),
    'urgench': (24, 50),
    'bukhara': (26, 57),
    'merv': (28, 63),
    'nishapur': (23, 67),
    'balkh': (36, 55),
    'herat': (42, 63),
    'samarkand': (30, 51),
    'isfahan': (18, 63),
    'shiraz': (14, 71),
    'tabriz': (6, 54),
    'ray': (4, 32),
    'kerman': (30, 72),
    'hormuz': (20, 77),
    
    # South East (29)
    'kashgar': (42, 43),
    'khotan': (38, 50),
    'dunhuang': (52, 40),
    'xingqing': (54, 56),
    'ganzhou': (48, 54),
    'liangzhou': (52, 63),
    'xixia_north': (51, 48),
    'ordos': (64, 50),
    'gobi_south': (62, 38),
    'zhongdu': (78, 38),
    'taiyuan': (70, 60),
    'kaifeng': (78, 48),
    'luoyang': (72, 52),
    'shandong': (84, 42),
    'shanxi_north': (68, 46),
    'hangzhou': (74, 75),
    'nanjing': (70, 69),
    'suzhou': (82, 78),
    'fujian': (74, 83),
    'guangdong': (66, 89),
    'jiangxi': (68, 82),
    'hunan': (60, 79),
    'hubei': (62, 71),
    'sichuan': (52, 71),
    'yunnan': (52, 83),
    'lhasa': (46, 62),
    'tibet_east': (60, 58),
    'tibet_west': (36, 60),
    'goryeo': (94, 43),
    'korea_south': (88, 56),
}

def euclidean_distance(p1, p2):
    """Calculate Euclidean distance between two points"""
    dx = p1[0] - p2[0]
    dy = p1[1] - p2[1]
    return math.sqrt(dx * dx + dy * dy)

# Calculate all pairwise distances
threshold = 6.1
violations = []
province_ids = list(provinces.keys())

# Check all pairs
for id1, id2 in combinations(province_ids, 2):
    dist = euclidean_distance(provinces[id1], provinces[id2])
    if dist < threshold:
        violations.append((id1, id2, dist))

# Sort by distance ascending
violations.sort(key=lambda x: x[2])

# Output results
print(f"✓ Extracted {len(provinces)} provinces")
print(f"✓ Checked all pairwise distances ({len(province_ids) * (len(province_ids) - 1) // 2} pairs)")
print()

if len(violations) == 0:
    print("✓ VALIDATION PASSED - All provinces properly spaced")
else:
    print(f"✗ VALIDATION FAILED - Found {len(violations)} violations (distance < {threshold}):\n")
    print(f"{'Province 1':<25} {'Province 2':<25} {'Distance':>10}")
    print("-" * 62)
    for id1, id2, dist in violations:
        print(f"{id1:<25} {id2:<25} {dist:>10.4f}")
