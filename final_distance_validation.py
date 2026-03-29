#!/usr/bin/env python3
"""
Final comprehensive distance validation for ALL provinces in ProvinceData.ts
- Extract all provinces with CURRENT coordinates
- Check all pairwise distances
- List ALL violations where distance < 6.1 units
- Sort smallest to largest
"""

import re
import math
from typing import Dict, Tuple, List

# Read the current ProvinceData.ts file
with open('/workspaces/bookish-creations-hub/src/data/ProvinceData.ts', 'r') as f:
    content = f.read()

# Extract all province definitions with name and center coordinates
# Pattern: p('id', 'Name', ..., { ... center: { x: NUM, y: NUM }, ... })
provinces = {}

# More comprehensive regex to capture all provinces
pattern = r"p\('([^']+)',\s*'([^']+)',\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*\{[^}]*?center:\s*\{\s*x:\s*(\d+),\s*y:\s*(\d+)\s*\}"

matches = re.finditer(pattern, content, re.DOTALL)
for match in matches:
    province_id = match.group(1)
    province_name = match.group(2)
    x = int(match.group(3))
    y = int(match.group(4))
    provinces[province_id] = {
        'name': province_name,
        'x': x,
        'y': y
    }

print(f"Extracted {len(provinces)} provinces from ProvinceData.ts\n")
print("=" * 80)
print("ALL PROVINCES WITH COORDINATES")
print("=" * 80)

# Sort by id for display
for i, (pid, data) in enumerate(sorted(provinces.items()), 1):
    print(f"{i:2d}. {pid:20s} ({data['name']:20s}) -> ({data['x']:2d}, {data['y']:2d})")

print(f"\n{'=' * 80}")
print(f"TOTAL PROVINCES: {len(provinces)}")
print(f"TOTAL PAIRWISE COMBINATIONS: {len(provinces) * (len(provinces) - 1) // 2}")
print(f"THRESHOLD: 6.1 units")
print(f"{'=' * 80}\n")

# Calculate all pairwise distances
violations = []

province_ids = sorted(provinces.keys())
for i in range(len(province_ids)):
    for j in range(i + 1, len(province_ids)):
        p1_id = province_ids[i]
        p2_id = province_ids[j]
        
        p1 = provinces[p1_id]
        p2 = provinces[p2_id]
        
        # Calculate Euclidean distance
        distance = math.sqrt((p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2)
        
        # Record if below threshold
        if distance < 6.1:
            violations.append({
                'p1_id': p1_id,
                'p1_name': p1['name'],
                'p1_x': p1['x'],
                'p1_y': p1['y'],
                'p2_id': p2_id,
                'p2_name': p2['name'],
                'p2_x': p2['x'],
                'p2_y': p2['y'],
                'distance': distance
            })

# Sort by distance (smallest first)
violations.sort(key=lambda v: v['distance'])

# Display results
print("VIOLATIONS FOUND (distance < 6.1 units)")
print("=" * 80)

if len(violations) == 0:
    print("\n✓ SUCCESS! No violations found!")
    print("All 70+ provinces have adequate spacing (>= 6.1 units apart)")
else:
    print(f"\n✗ {len(violations)} VIOLATION(S) FOUND\n")
    for idx, v in enumerate(violations, 1):
        print(f"{idx:2d}. {v['p1_id']:20s} ({v['p1_x']:2d},{v['p1_y']:2d}) <-> {v['p2_id']:20s} ({v['p2_x']:2d},{v['p2_y']:2d}) = {v['distance']:7.3f}")
        print(f"    {v['p1_name']:20s}                           {v['p2_name']:20s}")

print(f"\n{'=' * 80}")
print(f"FINAL RESULT")
print(f"{'=' * 80}")
print(f"Total provinces: {len(provinces)}")
print(f"Total pairs checked: {len(provinces) * (len(provinces) - 1) // 2}")
print(f"Total violations: {len(violations)}")

if len(violations) == 0:
    print(f"\n✅ VALIDATION PASSED - All inter-province distances >= 6.1 units")
else:
    print(f"\n❌ VALIDATION FAILED - {len(violations)} pair(s) with distance < 6.1 units")
    min_distance = min(v['distance'] for v in violations)
    print(f"   Minimum distance found: {min_distance:.3f} units")

print(f"{'=' * 80}\n")
