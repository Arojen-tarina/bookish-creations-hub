#!/usr/bin/env python3
"""
Complete distance validation - inline with extracted coordinates.
Checks all 83 provinces for pairwise distance violations < 6.05 units.
"""

import math

# All extracted provinces with coordinates
provinces = {
    # NorthWest
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
    'khiva': (18, 38),
    # NorthEast
    'karakorum': (53, 32),
    'mongol_east': (60, 28),
    'mongol_central': (48, 28),
    'mongol_west': (36, 30),
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
    # SouthWest
    'sarkel': (23, 35),
    'kipchak_west': (17, 37),
    'khazaria': (21, 43),
    'georgia': (18, 40),
    'armenia': (10, 48),
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
    # SouthEast
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

def distance(p1_coords, p2_coords):
    x1, y1 = p1_coords
    x2, y2 = p2_coords
    return math.sqrt((x1 - x2)**2 + (y1 - y2)**2)

# Check all pairwise distances
prov_ids = sorted(provinces.keys())
violations = []
threshold = 6.05

print(f"Total provinces: {len(provinces)}")
print(f"Total pairwise combinations: {len(provinces) * (len(provinces) - 1) // 2}")
print()

for i in range(len(prov_ids)):
    for j in range(i + 1, len(prov_ids)):
        pid1 = prov_ids[i]
        pid2 = prov_ids[j]
        dist = distance(provinces[pid1], provinces[pid2])
        
        if dist < threshold:
            violations.append({
                'p1': pid1,
                'p2': pid2,
                'x1': provinces[pid1][0],
                'y1': provinces[pid1][1],
                'x2': provinces[pid2][0],
                'y2': provinces[pid2][1],
                'dist': dist,
            })

# Report results
if not violations:
    print("✓ COMPLETE - All provinces properly spaced with 6+ unit minimum distance")
else:
    violations.sort(key=lambda v: v['dist'])
    print(f"VIOLATIONS FOUND: {len(violations)} pairs with distance < 6.05 units\n")
    for v in violations:
        print(f"{v['p1']:20s} vs {v['p2']:20s} : {v['dist']:.4f} units")
        print(f"  ({v['x1']:.1f},{v['y1']:.1f}) → ({v['x2']:.1f},{v['y2']:.1f})")
        print()

print(f"Extraction and validation complete.")
print(f"All {len(provinces) * (len(provinces) - 1) // 2} pairwise combinations checked.")
