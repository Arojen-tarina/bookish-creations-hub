import math

# All 83 provinces with coordinates
provinces = {
    'novgorod': (8, 12), 'pskov': (6, 22), 'tver': (20, 18), 'vladimir': (24, 8),
    'smolensk': (14, 44), 'ryazan': (36, 20), 'chernigov': (14, 26), 'kiev': (12, 36),
    'volga_bulgars': (28, 14), 'kipchak_central': (29, 22), 'siberia_west': (34, 10),
    'altai': (44, 18), 'dzungaria': (38, 22), 'semirechye': (35, 30), 'khiva': (22, 44),
    'karakorum': (53, 32), 'mongol_east': (60, 28), 'mongol_central': (48, 28),
    'mongol_west': (38, 38), 'kerulen': (70, 24), 'onon': (72, 32), 'baikal': (58, 18),
    'gobi_north': (60, 42), 'siberia_central': (44, 6), 'siberia_east': (54, 12),
    'yakutia': (68, 10), 'manchuria_north': (74, 18), 'manchuria_central': (78, 24),
    'liaoyang': (88, 34), 'liaodong': (90, 48), 'hebei_north': (82, 16), 'datong': (72, 40),
    'turfan': (46, 34), 'sarkel': (23, 35), 'kipchak_west': (14, 38), 'khazaria': (28, 40),
    'georgia': (2, 42), 'armenia': (10, 54), 'azerbaijan': (26, 48), 'shirvan': (18, 58),
    'urgench': (28, 54), 'bukhara': (30, 48), 'merv': (26, 74), 'nishapur': (8, 74),
    'balkh': (36, 55), 'herat': (42, 63), 'samarkand': (32, 45), 'isfahan': (14, 68),
    'shiraz': (8, 80), 'tabriz': (2, 54), 'ray': (4, 32), 'kerman': (30, 72),
    'hormuz': (20, 77), 'kashgar': (42, 43), 'khotan': (38, 50), 'dunhuang': (52, 40),
    'xingqing': (54, 56), 'ganzhou': (48, 54), 'liangzhou': (52, 63), 'xixia_north': (51, 48),
    'ordos': (64, 50), 'gobi_south': (68, 38), 'zhongdu': (78, 38), 'taiyuan': (70, 60),
    'kaifeng': (78, 48), 'luoyang': (72, 52), 'shandong': (84, 42), 'shanxi_north': (68, 46),
    'hangzhou': (74, 75), 'nanjing': (70, 69), 'suzhou': (82, 78), 'fujian': (74, 83),
    'guangdong': (66, 89), 'jiangxi': (68, 82), 'hunan': (60, 79), 'hubei': (62, 71),
    'sichuan': (52, 71), 'yunnan': (52, 83), 'lhasa': (50, 62), 'tibet_east': (60, 58),
    'tibet_west': (36, 60), 'goryeo': (94, 43), 'korea_south': (88, 56)
}

print(f"✓ Extracted {len(provinces)} provinces")
print()

violations = []
ids = sorted(provinces.keys())

for i in range(len(ids)):
    for j in range(i+1, len(ids)):
        id1, id2 = ids[i], ids[j]
        x1, y1 = provinces[id1]
        x2, y2 = provinces[id2]
        dist = math.sqrt((x1-x2)**2 + (y1-y2)**2)
        if dist < 6.1:
            violations.append((id1, id2, dist))

violations.sort(key=lambda x: x[2])

print(f"Checked {len(ids)} provinces → {len(ids)*(len(ids)-1)//2:,} pairwise distances")
print()

if violations:
    print(f"⚠ VALIDATION FAILED - Found {len(violations)} violation(s):")
    print()
    for id1, id2, dist in violations:
        x1, y1 = provinces[id1]
        x2, y2 = provinces[id2]
        print(f"  {id1:20} ({x1:5.1f}, {y1:5.1f})")
        print(f"  {id2:20} ({x2:5.1f}, {y2:5.1f})")
        print(f"  Distance: {dist:.4f} units")
        print()
else:
    print("✓ VALIDATION PASSED - All 83 provinces properly spaced with minimum 6+ unit distance")
