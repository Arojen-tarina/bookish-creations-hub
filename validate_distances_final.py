#!/usr/bin/env python3

import re
import math
import sys
from pathlib import Path

# Read ProvinceData.ts
province_file = Path('/workspaces/bookish-creations-hub/src/data/ProvinceData.ts')
content = province_file.read_text()

# Extract all province definitions with coordinates
pattern = r"p\('([^']+)',\s*'[^']+',\s*'[^']+',\s*'[^']+',\s*(?:null|'[^']+'),\s*\{[^}]*center:\s*\{\s*x:\s*([0-9.]+),\s*y:\s*([0-9.]+)\s*\}[^}]*\}"

provinces = []
for match in re.finditer(pattern, content):
    provinces.append({
        'id': match.group(1),
        'x': float(match.group(2)),
        'y': float(match.group(3))
    })

print(f"Found {len(provinces)} provinces\n")

if len(provinces) < 70:
    print(f"ERROR: Expected 70 provinces, found {len(provinces)}")
    for p in provinces:
        print(f"  {p['id']}: ({p['x']}, {p['y']})")
    sys.exit(1)

# Calculate distances and find violations
violations = []
MIN_DISTANCE = 6.05

for i in range(len(provinces)):
    for j in range(i + 1, len(provinces)):
        p1 = provinces[i]
        p2 = provinces[j]
        
        dx = p2['x'] - p1['x']
        dy = p2['y'] - p1['y']
        distance = math.sqrt(dx * dx + dy * dy)
        
        if distance < MIN_DISTANCE:
            violations.append({
                'pair': f"{p1['id']} <-> {p2['id']}",
                'p1': p1,
                'p2': p2,
                'distance': distance
            })

total_pairs = len(provinces) * (len(provinces) - 1) // 2
print(f"Checked all {total_pairs} pairwise distances\n")

if len(violations) == 0:
    print("✓ VALIDATION PASSED - All 70 provinces maintain minimum 6-unit spacing (with ~3 unit radius each, allowing 6+ unit center-to-center distance)")
else:
    print(f"Found {len(violations)} violation{'s' if len(violations) != 1 else ''}:\n")
    for v in violations:
        print(f"{v['pair']}")
        print(f"  {v['p1']['id']}: ({v['p1']['x']}, {v['p1']['y']})")
        print(f"  {v['p2']['id']}: ({v['p2']['x']}, {v['p2']['y']})")
        print(f"  Distance: {v['distance']:.3f} units")
        print()

sys.exit(0 if len(violations) == 0 else 1)
