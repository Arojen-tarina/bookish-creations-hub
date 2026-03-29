#!/usr/bin/env python3
"""
Extract all 83 provinces from current ProvinceData.ts and validate pairwise distances.
Report ONLY violations < 6.1 units.
"""

import re
import math
from typing import Dict, List, Tuple

# Read the file
with open('src/data/ProvinceData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all p(...) calls with center coordinates
pattern = r"p\('([^']+)',\s*'([^']+)'.*?center:\s*\{\s*x:\s*(\d+(?:\.\d+)?),\s*y:\s*(\d+(?:\.\d+)?)\s*\}"
matches = re.finditer(pattern, content, re.DOTALL)

provinces: Dict[str, Tuple[str, float, float]] = {}
for match in matches:
    province_id = match.group(1)
    province_name = match.group(2)
    x = float(match.group(3))
    y = float(match.group(4))
    provinces[province_id] = (province_name, x, y)

# Also look for ferghana which might be in adjacency but not defined
print(f"Total provinces extracted: {len(provinces)}")
print()

# Calculate all pairwise distances
province_ids = sorted(provinces.keys())
violations = []

for i in range(len(province_ids)):
    for j in range(i + 1, len(province_ids)):
        id_a = province_ids[i]
        id_b = province_ids[j]
        
        name_a, x_a, y_a = provinces[id_a]
        name_b, x_b, y_b = provinces[id_b]
        
        # Calculate Euclidean distance
        distance = math.sqrt((x_a - x_b)**2 + (y_a - y_b)**2)
        
        # Check if violates minimum spacing of 6.1 units
        if distance < 6.1:
            violations.append({
                'id_a': id_a,
                'id_b': id_b,
                'name_a': name_a,
                'name_b': name_b,
                'x_a': x_a,
                'y_a': y_a,
                'x_b': x_b,
                'y_b': y_b,
                'distance': distance
            })

# Report results
print(f"Total pairwise distances checked: {len(province_ids) * (len(province_ids) - 1) // 2}")
print(f"Minimum spacing threshold: 6.1 units")
print(f"Violations found: {len(violations)}")
print()

if len(violations) > 0:
    print("=" * 90)
    print("SPACING VIOLATIONS (distance < 6.1 units):")
    print("=" * 90)
    
    # Sort by distance (ascending)
    violations.sort(key=lambda v: v['distance'])
    
    for v in violations:
        print(f"\n{v['id_a']:20} <-> {v['id_b']:20}")
        print(f"  {v['name_a']:25} ({v['x_a']:5.1f}, {v['y_a']:5.1f})")
        print(f"  {v['name_b']:25} ({v['x_b']:5.1f}, {v['y_b']:5.1f})")
        print(f"  Distance: {v['distance']:.2f} units")
else:
    print("✓ VALIDATION PASSED - All provinces properly spaced")
