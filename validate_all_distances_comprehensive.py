#!/usr/bin/env python3
"""
Comprehensive distance validation for ALL provinces.
Checks all pairwise distances and reports violations < 6.05 units.
"""

import re
import math
from collections import defaultdict

# Read ProvinceData.ts
with open('/workspaces/bookish-creations-hub/src/data/ProvinceData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all province definitions using regex
# Pattern: p('id', 'name', ..., { ... center: { x: X, y: Y }, ... })
province_pattern = r"p\('([^']+)',\s*'([^']+)'[^{]*\{[^}]*center:\s*\{\s*x:\s*([\d.]+),\s*y:\s*([\d.]+)"

provinces = {}
for match in re.finditer(province_pattern, content):
    prov_id = match.group(1)
    prov_name = match.group(2)
    x = float(match.group(3))
    y = float(match.group(4))
    provinces[prov_id] = {
        'name': prov_name,
        'x': x,
        'y': y,
    }

print(f"Extracted {len(provinces)} provinces")
print(f"Total pairwise combinations: {len(provinces) * (len(provinces) - 1) // 2}")
print()

# Calculate distances
def distance(p1, p2):
    return math.sqrt((p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2)

# Find violations
violations = []
threshold = 6.05

prov_ids = sorted(provinces.keys())
for i in range(len(prov_ids)):
    for j in range(i + 1, len(prov_ids)):
        pid1 = prov_ids[i]
        pid2 = prov_ids[j]
        p1 = provinces[pid1]
        p2 = provinces[pid2]
        dist = distance(p1, p2)
        
        if dist < threshold:
            violations.append({
                'id1': pid1,
                'name1': p1['name'],
                'id2': pid2,
                'name2': p2['name'],
                'distance': dist,
                'x1': p1['x'],
                'y1': p1['y'],
                'x2': p2['x'],
                'y2': p2['y'],
            })

# Report results
if not violations:
    print("✓ COMPLETE - All provinces properly spaced with 6+ unit minimum distance")
else:
    print(f"VIOLATIONS FOUND: {len(violations)} pairs with distance < 6.05 units")
    print()
    # Sort by distance (closest first)
    violations.sort(key=lambda v: v['distance'])
    
    for v in violations:
        print(f"{v['name1']:20} ({v['id1']:20}) - {v['name2']:20} ({v['id2']:20})")
        print(f"  Distance: {v['distance']:.4f} units")
        print(f"  Coords: ({v['x1']:.1f}, {v['y1']:.1f}) → ({v['x2']:.1f}, {v['y2']:.1f})")
        print()

print(f"\nValidation complete. Checked {len(provinces) * (len(provinces) - 1) // 2} pairwise combinations.")
