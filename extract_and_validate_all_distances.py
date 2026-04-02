#!/usr/bin/env python3
"""
Extract all 83 provinces from ProvinceData.ts
Calculate ALL 3,403 pairwise distances
Find ANY violations < 6.1 units
"""

import re
import math
from collections import defaultdict

def extract_provinces_from_ts():
    """Extract all provinces from ProvinceData.ts"""
    
    with open('src/data/ProvinceData.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    provinces = {}
    
    # Match pattern: p('id', 'name', ... center: { x: X, y: Y } ...)
    # Using more robust regex to handle multiline
    pattern = r"p\(\s*'([^']+)'[^}]*?center:\s*\{\s*x:\s*([\d.]+)\s*,\s*y:\s*([\d.]+)\s*\}"
    
    matches = re.finditer(pattern, content, re.DOTALL)
    
    for match in matches:
        prov_id = match.group(1)
        x = float(match.group(2))
        y = float(match.group(3))
        provinces[prov_id] = {'x': x, 'y': y}
    
    return provinces

def calculate_distance(p1, p2):
    """Calculate Euclidean distance between two provinces"""
    dx = p1['x'] - p2['x']
    dy = p1['y'] - p2['y']
    return math.sqrt(dx*dx + dy*dy)

def validate_all_distances():
    """Extract provinces and validate all pairwise distances"""
    
    print("=" * 80)
    print("COMPLETE PROVINCE DISTANCE VALIDATION")
    print("=" * 80)
    
    # Extract all provinces
    provinces = extract_provinces_from_ts()
    
    print(f"\n✓ Extracted {len(provinces)} provinces\n")
    
    province_ids = sorted(list(provinces.keys()))
    
    # Calculate expected number of pairs
    n = len(provinces)
    expected_pairs = n * (n - 1) // 2
    
    print(f"Expected pairwise distances: {expected_pairs}")
    print()
    
    # Calculate all distances and find violations
    violations = []
    
    for i in range(len(province_ids)):
        for j in range(i + 1, len(province_ids)):
            id1 = province_ids[i]
            id2 = province_ids[j]
            
            distance = calculate_distance(provinces[id1], provinces[id2])
            
            # Check for violation (distance < 6.1)
            if distance < 6.1:
                violations.append({
                    'id1': id1,
                    'id2': id2,
                    'x1': provinces[id1]['x'],
                    'y1': provinces[id1]['y'],
                    'x2': provinces[id2]['x'],
                    'y2': provinces[id2]['y'],
                    'distance': distance
                })
    
    # Report results
    print("=" * 80)
    print("DISTANCE VALIDATION RESULTS")
    print("=" * 80)
    print()
    
    if violations:
        print(f"⚠ VIOLATIONS FOUND: {len(violations)} pairs < 6.1 units")
        print()
        print("Violations (sorted by distance, closest first):")
        print("-" * 80)
        
        violations.sort(key=lambda x: x['distance'])
        
        for v in violations:
            print(f"{v['id1']:20s} ({v['x1']:6.2f}, {v['y1']:6.2f})")
            print(f"{v['id2']:20s} ({v['x2']:6.2f}, {v['y2']:6.2f})")
            print(f"Distance: {v['distance']:.4f} units")
            print()
    else:
        print("✓ VALIDATION PASSED")
        print()
        print(f"All {expected_pairs:,} pairwise distances >= 6.1 units")
        print()
        
        # Show some stats
        all_distances = []
        for i in range(len(province_ids)):
            for j in range(i + 1, len(province_ids)):
                id1 = province_ids[i]
                id2 = province_ids[j]
                distance = calculate_distance(provinces[id1], provinces[id2])
                all_distances.append(distance)
        
        all_distances.sort()
        print(f"Minimum distance: {min(all_distances):.4f} units")
        print(f"Maximum distance: {max(all_distances):.4f} units")
        print(f"Mean distance: {sum(all_distances)/len(all_distances):.4f} units")
        print(f"Median distance: {all_distances[len(all_distances)//2]:.4f} units")
    
    print()
    print("=" * 80)
    
    return len(violations) == 0

if __name__ == '__main__':
    success = validate_all_distances()
    exit(0 if success else 1)
