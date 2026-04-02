#!/usr/bin/env python3
"""Comprehensive pairwise distance validator for all provinces."""
import re
import math
from typing import Dict, Tuple, List

def extract_provinces(filepath: str) -> Dict[str, Tuple[float, float]]:
    """Extract province IDs and coordinates from ProvinceData.ts"""
    provinces = {}
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to extract province ID and coordinates
    # Look for patterns like: center: { x: 8, y: 12 }
    # Need to associate with province ID from p('id', 'name', ...)
    
    lines = content.split('\n')
    current_id = None
    
    for i, line in enumerate(lines):
        # Match p('id', 'name', ...) to get province ID
        id_match = re.search(r"p\('([^']+)'", line)
        if id_match:
            current_id = id_match.group(1)
        
        # Match center: { x: XX, y: YY }
        center_match = re.search(r'center:\s*{\s*x:\s*([\d.]+)\s*,\s*y:\s*([\d.]+)', line)
        if center_match and current_id:
            x = float(center_match.group(1))
            y = float(center_match.group(2))
            provinces[current_id] = (x, y)
            current_id = None
    
    return provinces

def calculate_distance(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
    """Calculate Euclidean distance between two points."""
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def find_violations(provinces: Dict[str, Tuple[float, float]], min_distance: float = 6.05) -> List[Tuple[str, str, float]]:
    """Find all pairs with distance < min_distance."""
    violations = []
    sorted_ids = sorted(provinces.keys())
    
    for i in range(len(sorted_ids)):
        for j in range(i + 1, len(sorted_ids)):
            id1 = sorted_ids[i]
            id2 = sorted_ids[j]
            dist = calculate_distance(provinces[id1], provinces[id2])
            
            if dist < min_distance:
                violations.append((id1, id2, dist))
    
    return violations

def main():
    filepath = '/workspaces/bookish-creations-hub/src/data/ProvinceData.ts'
    
    print("=" * 80)
    print("COMPREHENSIVE PAIRWISE DISTANCE VALIDATION")
    print("=" * 80)
    print()
    
    # Extract all provinces
    provinces = extract_provinces(filepath)
    print(f"✓ Extracted {len(provinces)} provinces\n")
    
    print("PROVINCES FOUND:")
    print("-" * 80)
    sorted_ids = sorted(provinces.keys())
    for pid in sorted_ids:
        x, y = provinces[pid]
        print(f"  {pid:30} → ({x:6.2f}, {y:6.2f})")
    print()
    
    # Calculate and check violations
    min_dist = 6.05
    violations = find_violations(provinces, min_dist)
    
    print("=" * 80)
    print(f"DISTANCE CHECK: Minimum allowed = {min_dist} units")
    print("=" * 80)
    print()
    
    total_pairs = len(provinces) * (len(provinces) - 1) // 2
    print(f"Total province pairs checked: {total_pairs}")
    print()
    
    if violations:
        print(f"❌ VIOLATIONS FOUND: {len(violations)} pairs with distance < {min_dist}")
        print("-" * 80)
        violations_sorted = sorted(violations, key=lambda x: x[2])
        for id1, id2, dist in violations_sorted:
            print(f"  {id1:20} <-> {id2:20} : {dist:7.3f} units")
        print()
    else:
        print(f"✓ SUCCESS: All provinces properly spaced")
        print(f"  All {total_pairs} pairs have distance ≥ {min_dist} units")
        print()

if __name__ == '__main__':
    main()
