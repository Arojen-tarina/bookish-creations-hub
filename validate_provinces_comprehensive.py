#!/usr/bin/env python3
"""
Comprehensive validation of ALL provinces in ProvinceData.ts
Extracts all province coordinates and calculates pairwise distances
"""

import re
import math
from pathlib import Path

# Read ProvinceData.ts
data_file = Path('/workspaces/bookish-creations-hub/src/data/ProvinceData.ts').read_text('utf-8')

# Extract all province definitions with regex
# Pattern: p('id', ... center: { x: XX, y: YY }
pattern = r"p\('([^']+)',\s*'([^']+)'[^}]*?center:\s*\{\s*x:\s*([\d.]+),\s*y:\s*([\d.]+)\s*\}"

provinces = []
for match in re.finditer(pattern, data_file):
    prov_id = match.group(1)
    prov_name = match.group(2)
    x = float(match.group(3))
    y = float(match.group(4))
    provinces.append({
        'id': prov_id,
        'name': prov_name,
        'x': x,
        'y': y,
    })

print(f'\n✓ Extracted {len(provinces)} provinces from ProvinceData.ts\n')

# Calculate distance between two points
def distance(p1, p2):
    dx = p1['x'] - p2['x']
    dy = p1['y'] - p2['y']
    return math.sqrt(dx * dx + dy * dy)

# Find all violations
violations = []
MIN_DISTANCE = 6.05
total_checks = len(provinces) * (len(provinces) - 1) // 2

for i in range(len(provinces)):
    for j in range(i + 1, len(provinces)):
        p1 = provinces[i]
        p2 = provinces[j]
        dist = distance(p1, p2)
        
        if dist < MIN_DISTANCE:
            violations.append({
                'p1_id': p1['id'],
                'p1_name': p1['name'],
                'p1_x': p1['x'],
                'p1_y': p1['y'],
                'p2_id': p2['id'],
                'p2_name': p2['name'],
                'p2_x': p2['x'],
                'p2_y': p2['y'],
                'distance': dist,
            })

# Sort by distance (closest first)
violations.sort(key=lambda v: v['distance'])

# Report results
print('=' * 90)
print('PROVINCE SPACING VALIDATION - ALL PAIRWISE DISTANCES')
print('=' * 90)
print(f'Total provinces: {len(provinces)}')
print(f'Total pairwise checks: {total_checks:,}')
print(f'Minimum required distance: {MIN_DISTANCE} units')
print(f'\nViolations found (distance < {MIN_DISTANCE}): {len(violations)}')
print('=' * 90)

if len(violations) == 0:
    print('\n' + '✓' * 45)
    print('✓ ALL PROVINCES VALIDATED - Perfect 6+ unit minimum spacing achieved')
    print('✓' * 45 + '\n')
else:
    print(f'\n⚠ SPACING VIOLATIONS DETECTED - {len(violations)} pairs below threshold:\n')
    print(f'{"Distance":>8} | {"Province 1":>25} | {"Province 2":>25} | {"Coordinates P1":>16} | {"Coordinates P2":>16}')
    print('-' * 105)
    
    for v in violations:
        dist_str = f'{v["distance"]:.4f}'
        p1_name = f'{v["p1_id"]} ({v["p1_name"]})'
        p2_name = f'{v["p2_id"]} ({v["p2_name"]})'
        p1_coords = f'({v["p1_x"]:.0f},{v["p1_y"]:.0f})'
        p2_coords = f'({v["p2_x"]:.0f},{v["p2_y"]:.0f})'
        
        print(f'{dist_str:>8} | {p1_name:>25} | {p2_name:>25} | {p1_coords:>16} | {p2_coords:>16}')

print('\n' + '=' * 90)
print(f'FINAL RESULT: {"✗ VALIDATION FAILED" if len(violations) > 0 else "✓ VALIDATION PASSED"}')
print('=' * 90 + '\n')

# List all extracted provinces for reference
print(f'All {len(provinces)} Extracted Provinces:')
print('-' * 50)
for i, p in enumerate(provinces, 1):
    print(f'{i:2d}. {p["id"]:20s} ({p["x"]:5.1f}, {p["y"]:5.1f}) - {p["name"]}')

print()
