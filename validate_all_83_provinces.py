#!/usr/bin/env python3
"""
Extract all 83 provinces from ProvinceData.ts and validate spacing.
Report all violations < 6.1 units with exact distances.
"""

import re
import math

# Read the ProvinceData.ts file
with open('/workspaces/bookish-creations-hub/src/data/ProvinceData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all province definitions using regex
# Pattern: p('id', 'name', ..., { ... center: { x: X, y: Y }, ... })
pattern = r"p\('([^']+)',\s*'([^']+)'.*?center:\s*\{\s*x:\s*([\d.]+),\s*y:\s*([\d.]+)\s*\}"

provinces = {}
for match in re.finditer(pattern, content, re.DOTALL):
    province_id = match.group(1)
    province_name = match.group(2)
    x = float(match.group(3))
    y = float(match.group(4))
    provinces[province_id] = {
        'name': province_name,
        'x': x,
        'y': y
    }

print(f"Found {len(provinces)} provinces")
print("=" * 80)

# Calculate all pairwise distances
violations = []

province_ids = sorted(provinces.keys())

for i in range(len(province_ids)):
    for j in range(i + 1, len(province_ids)):
        id1 = province_ids[i]
        id2 = province_ids[j]
        
        p1 = provinces[id1]
        p2 = provinces[id2]
        
        # Euclidean distance
        distance = math.sqrt((p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2)
        
        # Check if violation (< 6.1)
        if distance < 6.1:
            violations.append({
                'id1': id1,
                'name1': p1['name'],
                'id2': id2,
                'name2': p2['name'],
                'distance': distance,
                'x1': p1['x'],
                'y1': p1['y'],
                'x2': p2['x'],
                'y2': p2['y']
            })

# Sort violations by distance (closest first)
violations.sort(key=lambda v: v['distance'])

# Report
if violations:
    print(f"VIOLATIONS FOUND: {len(violations)} pairs with distance < 6.1\n")
    for v in violations:
        print(f"  {v['name1']:20} ({v['id1']:20}) x={v['x1']:5.1f}, y={v['y1']:5.1f}")
        print(f"  {v['name2']:20} ({v['id2']:20}) x={v['x2']:5.1f}, y={v['y2']:5.1f}")
        print(f"  Distance: {v['distance']:.4f} units\n")
else:
    print("✓ SUCCESS - All provinces properly spaced")

print("=" * 80)
print(f"Total provinces: {len(provinces)}")
print(f"Total unique pairwise distances checked: {len(province_ids) * (len(province_ids) - 1) // 2}")
