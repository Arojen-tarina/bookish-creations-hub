#!/usr/bin/env python3
"""
Final comprehensive distance validation for all 70 provinces.
Extracts ALL provinces from ProvinceData.ts and finds all pairs with distance < 6.05
"""

import re
import math
from typing import List, Tuple

# Read the ProvinceData.ts file
with open('/workspaces/bookish-creations-hub/src/data/ProvinceData.ts', 'r') as f:
    content = f.read()

# Extract all province definitions using regex
# Pattern: p('id', 'name', ..., { ... center: { x: NUM, y: NUM }, ... })
pattern = r"p\('([^']+)',\s*'([^']+)'[^}]*?center:\s*{\s*x:\s*([\d.]+),\s*y:\s*([\d.]+)\s*}"

provinces = {}
matches = re.finditer(pattern, content, re.DOTALL)

for match in matches:
    province_id = match.group(1)
    province_name = match.group(2)
    x = float(match.group(3))
    y = float(match.group(4))
    provinces[province_id] = {
        'name': province_name,
        'x': x,
        'y': y
    }

print(f"✓ Extracted {len(provinces)} provinces from ProvinceData.ts\n")

# Verify we have 70 provinces
if len(provinces) != 70:
    print(f"⚠ WARNING: Expected 70 provinces but found {len(provinces)}\n")

# Sort by ID for consistent output
sorted_ids = sorted(provinces.keys())

# Print all provinces with their coordinates
print("=" * 80)
print("ALL 70 PROVINCES WITH COORDINATES")
print("=" * 80)
for i, pid in enumerate(sorted_ids, 1):
    p = provinces[pid]
    print(f"{i:2d}. {p['name']:25s} ({pid:25s}) -> ({p['x']:6.1f}, {p['y']:6.1f})")

print(f"\n{'=' * 80}")
print("PAIRWISE DISTANCE ANALYSIS (< 6.05 units)")
print("=" * 80)

def distance(x1, y1, x2, y2):
    """Calculate Euclidean distance between two points"""
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

# Calculate all pairwise distances and find violations
violations = []

for i, id1 in enumerate(sorted_ids):
    for id2 in sorted_ids[i+1:]:
        p1 = provinces[id1]
        p2 = provinces[id2]
        
        dist = distance(p1['x'], p1['y'], p2['x'], p2['y'])
        
        if dist < 6.05:
            violations.append({
                'id1': id1,
                'name1': p1['name'],
                'x1': p1['x'],
                'y1': p1['y'],
                'id2': id2,
                'name2': p2['name'],
                'x2': p2['x'],
                'y2': p2['y'],
                'distance': dist
            })

# Sort violations by distance (ascending)
violations.sort(key=lambda v: v['distance'])

# Print results
if not violations:
    print("\n✓ NO VIOLATIONS FOUND!")
    print("All 2,415 province pairs maintain distance >= 6.05 units")
else:
    print(f"\n⚠ FOUND {len(violations)} VIOLATION(S):\n")
    for i, v in enumerate(violations, 1):
        print(f"{i}. {v['name1']:25s} ({v['x1']:6.1f}, {v['y1']:6.1f}) <-> " +
              f"{v['name2']:25s} ({v['x2']:6.1f}, {v['y2']:6.1f}) = {v['distance']:.3f}")

print(f"\n{'=' * 80}")
print(f"SUMMARY")
print("=" * 80)
print(f"Total Provinces:      {len(provinces)}")
print(f"Total Possible Pairs: {len(provinces) * (len(provinces) - 1) // 2}")
print(f"Violations (< 6.05):  {len(violations)}")
print(f"Pass Threshold:       {'YES ✓' if len(violations) == 0 else f'NO ✗ ({len(violations)} pairs)'}")
print()
