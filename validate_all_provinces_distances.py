#!/usr/bin/env python3
"""
Validate all pairwise distances between 83 provinces.
Extract from ProvinceData.ts and report violations < 6.1 units.
"""

import re
import math
from typing import Dict, Tuple, List

def extract_provinces_from_ts() -> Dict[str, Tuple[float, float]]:
    """Extract province IDs and coordinates from ProvinceData.ts"""
    provinces = {}
    
    with open('src/data/ProvinceData.ts', 'r') as f:
        content = f.read()
    
    # Extract all p(...) function calls with center coordinates
    # Pattern: p('id', ... center: { x: XX, y: YY } ...
    pattern = r"p\('([^']+)'[^}]*center:\s*\{\s*x:\s*([\d.]+)\s*,\s*y:\s*([\d.]+)\s*\}"
    
    matches = re.findall(pattern, content)
    
    for match in matches:
        province_id = match[0]
        x = float(match[1])
        y = float(match[2])
        provinces[province_id] = (x, y)
    
    return provinces

def euclidean_distance(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
    """Calculate Euclidean distance between two points"""
    dx = p1[0] - p2[0]
    dy = p1[1] - p2[1]
    return math.sqrt(dx * dx + dy * dy)

def validate_distances(provinces: Dict[str, Tuple[float, float]]) -> List[Tuple[str, str, float]]:
    """Check all pairwise distances and return violations < 6.1"""
    violations = []
    province_ids = list(provinces.keys())
    
    # Check all pairs
    for i in range(len(province_ids)):
        for j in range(i + 1, len(province_ids)):
            id1 = province_ids[i]
            id2 = province_ids[j]
            dist = euclidean_distance(provinces[id1], provinces[id2])
            
            if dist < 6.1:
                violations.append((id1, id2, dist))
    
    # Sort by distance ascending
    violations.sort(key=lambda x: x[2])
    return violations

def main():
    print("Extracting provinces from ProvinceData.ts...")
    provinces = extract_provinces_from_ts()
    
    print(f"✓ Extracted {len(provinces)} provinces")
    print()
    
    print("Validating all pairwise distances...")
    violations = validate_distances(provinces)
    
    if not violations:
        print("✓ VALIDATION PASSED - All provinces properly spaced")
    else:
        print(f"✗ VALIDATION FAILED - Found {len(violations)} violations (distance < 6.1):")
        print()
        print(f"{'Province 1':<20} {'Province 2':<20} {'Distance':>10}")
        print("-" * 52)
        for id1, id2, dist in violations:
            print(f"{id1:<20} {id2:<20} {dist:>10.4f}")
    
    return len(violations) == 0

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
