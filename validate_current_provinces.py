#!/usr/bin/env python3
"""
COMPREHENSIVE DISTANCE VALIDATION
Extract ALL 83 provinces from CURRENT ProvinceData.ts
Calculate ALL 3,403 pairwise distances
Find ANY violations < 6.1 units
Report exact results
"""

import re
import math
from typing import Dict, List, Tuple

def extract_all_provinces() -> Dict[str, Tuple[float, float]]:
    """Extract all provinces and coordinates from current ProvinceData.ts"""
    
    with open('src/data/ProvinceData.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    provinces = {}
    
    # Match: p('id', 'name', ... center: { x: FLOAT, y: FLOAT } ...)
    pattern = r"p\('([^']+)'[^}]*?center:\s*\{\s*x:\s*([\d.]+)\s*,\s*y:\s*([\d.]+)\s*\}"
    
    matches = re.finditer(pattern, content, re.DOTALL)
    
    for match in matches:
        prov_id = match.group(1)
        x = float(match.group(2))
        y = float(match.group(3))
        provinces[prov_id] = (x, y)
    
    return provinces

def calculate_distance(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
    """Euclidean distance between two points"""
    dx = p1[0] - p2[0]
    dy = p1[1] - p2[1]
    return math.sqrt(dx * dx + dy * dy)

def find_violations(provinces: Dict[str, Tuple[float, float]], threshold: float = 6.1) -> List[Dict]:
    """Find all province pairs with distance < threshold"""
    
    violations = []
    province_ids = sorted(list(provinces.keys()))
    
    for i in range(len(province_ids)):
        for j in range(i + 1, len(province_ids)):
            id1 = province_ids[i]
            id2 = province_ids[j]
            
            dist = calculate_distance(provinces[id1], provinces[id2])
            
            if dist < threshold:
                violations.append({
                    'id1': id1,
                    'id2': id2,
                    'x1': provinces[id1][0],
                    'y1': provinces[id1][1],
                    'x2': provinces[id2][0],
                    'y2': provinces[id2][1],
                    'distance': dist
                })
    
    # Sort by distance ascending
    violations.sort(key=lambda x: x['distance'])
    return violations

def main():
    print("\n" + "=" * 90)
    print("COMPLETE PROVINCE DISTANCE VALIDATION - CURRENT DATA (2026-03-29)")
    print("=" * 90 + "\n")
    
    # Extract all provinces
    provinces = extract_all_provinces()
    
    print(f"✓ Extracted {len(provinces)} provinces from ProvinceData.ts\n")
    
    # Validate all distances
    n = len(provinces)
    total_pairs = n * (n - 1) // 2
    
    print(f"  Total pairwise distances to check: {total_pairs:,}")
    print(f"  Minimum distance threshold: 6.1 units\n")
    
    violations = find_violations(provinces, threshold=6.1)
    
    print("=" * 90)
    print("VALIDATION RESULTS")
    print("=" * 90 + "\n")
    
    if violations:
        print(f"⚠ VIOLATIONS FOUND: {len(violations)} pairs with distance < 6.1 units\n")
        print("All violations listed (sorted by distance, closest first):\n")
        print(f"{'#':<3} {'Province 1':<20} {'Coordinates':<20} {'Province 2':<20} {'Coordinates':<20} {'Distance':<10}")
        print("-" * 95)
        
        for idx, v in enumerate(violations, 1):
            print(f"{idx:<3} {v['id1']:<20} ({v['x1']:>5.1f}, {v['y1']:>5.1f})     {v['id2']:<20} ({v['x2']:>5.1f}, {v['y2']:>5.1f})     {v['distance']:>8.4f}")
        
        print("\n" + "=" * 90)
    else:
        print("✓ VALIDATION PASSED")
        print(f"\n  All {total_pairs:,} pairwise distances are >= 6.1 units\n")
        
        # Calculate statistics
        all_distances = []
        province_ids = sorted(list(provinces.keys()))
        
        for i in range(len(province_ids)):
            for j in range(i + 1, len(province_ids)):
                dist = calculate_distance(provinces[province_ids[i]], provinces[province_ids[j]])
                all_distances.append(dist)
        
        all_distances.sort()
        
        min_dist = min(all_distances)
        max_dist = max(all_distances)
        mean_dist = sum(all_distances) / len(all_distances)
        median_dist = all_distances[len(all_distances) // 2]
        
        print(f"  Distance Statistics:")
        print(f"    Minimum: {min_dist:.4f} units")
        print(f"    Maximum: {max_dist:.4f} units")
        print(f"    Mean:    {mean_dist:.4f} units")
        print(f"    Median:  {median_dist:.4f} units\n")
        
        print("=" * 90)
    
    return len(violations) == 0

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
