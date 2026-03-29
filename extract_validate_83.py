#!/usr/bin/env python3
"""
Extract all 83 provinces from ProvinceData.ts and validate all pairwise distances.
Find violations < 6.1 units.
"""

import re
import math
from typing import Dict, Tuple, List

# Read ProvinceData.ts
with open('src/data/ProvinceData.ts', 'r') as f:
    content = f.read()

# Extract centers using regex: center: { x: NUMBER, y: NUMBER }
pattern = r"center:\s*{\s*x:\s*([\d.]+),\s*y:\s*([\d.]+)\s*}"
matches = re.findall(pattern, content)

# Extract province IDs by finding p('id', ...
id_pattern = r"p\('([^']+)',"
ids = re.findall(id_pattern, content)

# Build province dictionary
provinces: Dict[str, Tuple[float, float]] = {}
for i, province_id in enumerate(ids):
    if i < len(matches):
        x, y = float(matches[i][0]), float(matches[i][1])
        provinces[province_id] = (x, y)

print(f"✓ Extracted {len(provinces)} provinces")
print()

# Calculate all pairwise distances
violations: List[Tuple[str, str, float]] = []

province_ids = list(provinces.keys())
for i in range(len(province_ids)):
    for j in range(i + 1, len(province_ids)):
        id1, id2 = province_ids[i], province_ids[j]
        x1, y1 = provinces[id1]
        x2, y2 = provinces[id2]
        
        distance = math.sqrt((x1 - x2)**2 + (y1 - y2)**2)
        
        if distance < 6.1:
            violations.append((id1, id2, distance))

# Sort by distance
violations.sort(key=lambda x: x[2])

# Report
print(f"Checked {len(province_ids)} provinces → {len(province_ids) * (len(province_ids) - 1) // 2:,} pairwise distances")
print()

if violations:
    print(f"⚠ VALIDATION FAILED - Found {len(violations)} violation(s):")
    print()
    for id1, id2, distance in violations:
        x1, y1 = provinces[id1]
        x2, y2 = provinces[id2]
        print(f"  {id1:20} ({x1:5.1f}, {y1:5.1f})")
        print(f"  {id2:20} ({x2:5.1f}, {y2:5.1f})")
        print(f"  Distance: {distance:.4f} units")
        print()
else:
    print("✓ VALIDATION PASSED - All 83 provinces properly spaced with minimum 6+ unit distance")

# Also list all provinces for reference
print()
print("=" * 60)
print(f"All {len(provinces)} Provinces and Coordinates:")
print("=" * 60)
for province_id in sorted(provinces.keys()):
    x, y = provinces[province_id]
    print(f"  {province_id:25} ({x:5.1f}, {y:5.1f})")
