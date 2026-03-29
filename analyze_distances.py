#!/usr/bin/env python3
import math

provinces = [
    ('novgorod', 8, 12),
    ('pskov', 10, 22),
    ('tver', 20, 18),
    ('vladimir', 24, 8),
    ('smolensk', 14, 32),
    ('ryazan', 24, 20),
    ('chernigov', 14, 26),
    ('kiev', 12, 30),
    ('volga_bulgars', 28, 14),
    ('kipchak_central', 29, 22),
    ('siberia_west', 34, 10),
    ('altai', 44, 18),
    ('dzungaria', 36, 22),
    ('semirechye', 35, 30),
    ('khiva', 18, 30),
    ('karakorum', 53, 32),
    ('mongol_east', 60, 28),
    ('mongol_central', 48, 28),
    ('mongol_west', 42, 30),
    ('kerulen', 64, 24),
    ('onon', 74, 18),
    ('baikal', 58, 18),
    ('gobi_north', 56, 35),
    ('siberia_central', 44, 12),
    ('siberia_east', 54, 12),
    ('yakutia', 68, 10),
    ('manchuria_north', 74, 18),
    ('manchuria_central', 78, 24),
    ('liaoyang', 82, 28),
    ('liaodong', 86, 32),
    ('hebei_north', 82, 34),
    ('datong', 72, 40),
    ('turfan', 46, 34),
    ('sarkel', 23, 35),
    ('kipchak_west', 17, 37),
    ('khazaria', 21, 43),
    ('georgia', 11, 40),
    ('armenia', 10, 48),
    ('azerbaijan', 13, 48),
    ('shirvan', 12, 64),
    ('urgench', 24, 44),
    ('bukhara', 26, 57),
    ('merv', 28, 63),
    ('nishapur', 23, 67),
    ('balkh', 36, 55),
    ('herat', 34, 63),
    ('samarkand', 30, 51),
    ('isfahan', 18, 63),
    ('shiraz', 14, 71),
    ('tabriz', 10, 48),
    ('ray', 11, 42),
    ('kerman', 30, 72),
    ('hormuz', 20, 77),
    ('kashgar', 42, 43),
    ('khotan', 38, 50),
    ('dunhuang', 52, 40),
    ('xingqing', 54, 56),
    ('ganzhou', 48, 54),
    ('liangzhou', 52, 63),
    ('xixia_north', 51, 48),
    ('ordos', 57, 52),
    ('gobi_south', 64, 36),
    ('zhongdu', 78, 38),
    ('taiyuan', 72, 46),
    ('kaifeng', 78, 48),
    ('luoyang', 72, 52),
    ('shandong', 84, 42),
    ('shanxi_north', 68, 46),
    ('hangzhou', 74, 75),
    ('nanjing', 70, 69),
    ('suzhou', 76, 73),
    ('fujian', 74, 83),
    ('guangdong', 66, 89),
    ('jiangxi', 68, 82),
    ('hunan', 60, 79),
    ('hubei', 62, 71),
    ('sichuan', 52, 71),
    ('yunnan', 52, 83),
    ('lhasa', 46, 62),
    ('tibet_east', 60, 58),
    ('tibet_west', 36, 60),
    ('goryeo', 88, 40),
    ('korea_south', 88, 48),
]

def euclidean_distance(p1, p2):
    dx = p1[1] - p2[1]
    dy = p1[2] - p2[2]
    return math.sqrt(dx*dx + dy*dy)

violations = []
threshold = 6.05

for i in range(len(provinces)):
    for j in range(i+1, len(provinces)):
        dist = euclidean_distance(provinces[i], provinces[j])
        if dist < threshold:
            violations.append((provinces[i], provinces[j], dist))

violations.sort(key=lambda x: x[2])

print("========== DISTANCE ANALYSIS ==========")
print(f"Total provinces: {len(provinces)}")
print(f"Total pairwise combinations: {len(provinces) * (len(provinces) - 1) // 2}")
print(f"Threshold: {threshold} units")
print(f"Violations found: {len(violations)}\n")

if violations:
    print("VIOLATIONS (distance < 6.05):")
    print("=" * 90)
    for p1, p2, dist in violations:
        print(f"{p1[0]} ({p1[1]}, {p1[2]}) <-> {p2[0]} ({p2[1]}, {p2[2]}) = {dist:.4f}")
    print("=" * 90)
else:
    print("✓ NO VIOLATIONS FOUND - All province pairs maintain minimum distance!")

print(f"\nTotal violations: {len(violations)}")
