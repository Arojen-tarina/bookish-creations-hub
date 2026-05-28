#!/usr/bin/env node

/**
 * Complete Province Distance Validation
 * Extract ALL 83 provinces from ProvinceData.ts
 * Calculate ALL 3,403 pairwise distances
 * Find ANY violations < 6.1 units
 */

const fs = require('fs');
const path = require('path');

// Read ProvinceData.ts
const filePath = path.join(__dirname, 'src/data/ProvinceData.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Extract all provinces with their coordinates
// Pattern: p('id', ... center: { x: XX, y: YY } ...
const pattern = /p\('([^']+)'[^}]*?center:\s*\{\s*x:\s*([\d.]+)\s*,\s*y:\s*([\d.]+)\s*\}/gs;

const provinces = {};
let match;

while ((match = pattern.exec(content)) !== null) {
    const id = match[1];
    const x = parseFloat(match[2]);
    const y = parseFloat(match[3]);
    provinces[id] = { x, y };
}

console.log('\n' + '='.repeat(100));
console.log('COMPLETE PROVINCE DISTANCE VALIDATION REPORT');
console.log('='.repeat(100) + '\n');

console.log(`✓ Extracted ${Object.keys(provinces).length} provinces from ProvinceData.ts\n`);

// Calculate all pairwise distances
const provinceIds = Object.keys(provinces).sort();
const violations = [];
let totalPairs = 0;
const threshold = 6.1;

function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Calculate all pairs
for (let i = 0; i < provinceIds.length; i++) {
    for (let j = i + 1; j < provinceIds.length; j++) {
        const id1 = provinceIds[i];
        const id2 = provinceIds[j];
        const dist = distance(provinces[id1], provinces[id2]);
        totalPairs++;

        if (dist < threshold) {
            violations.push({
                id1,
                id2,
                x1: provinces[id1].x,
                y1: provinces[id1].y,
                x2: provinces[id2].x,
                y2: provinces[id2].y,
                distance: dist
            });
        }
    }
}

violations.sort((a, b) => a.distance - b.distance);

console.log(`Total pairwise distances: ${totalPairs.toLocaleString()}`);
console.log(`Validation threshold: ${threshold} units\n`);

console.log('='.repeat(100));
console.log('VALIDATION RESULTS');
console.log('='.repeat(100) + '\n');

if (violations.length === 0) {
    console.log('✓ VALIDATION PASSED\n');
    console.log(`All ${totalPairs.toLocaleString()} pairwise distances >= ${threshold} units\n`);

    // Calculate statistics
    const allDistances = [];
    for (let i = 0; i < provinceIds.length; i++) {
        for (let j = i + 1; j < provinceIds.length; j++) {
            allDistances.push(distance(provinces[provinceIds[i]], provinces[provinceIds[j]]));
        }
    }
    allDistances.sort((a, b) => a - b);
    const mean = allDistances.reduce((a, b) => a + b, 0) / allDistances.length;

    console.log('Distance Statistics:');
    console.log(`  Minimum: ${Math.min(...allDistances).toFixed(4)} units`);
    console.log(`  Maximum: ${Math.max(...allDistances).toFixed(4)} units`);
    console.log(`  Mean: ${mean.toFixed(4)} units`);
    console.log(`  Median: ${allDistances[Math.floor(allDistances.length/2)].toFixed(4)} units\n`);
} else {
    console.log(`⚠ VIOLATIONS FOUND: ${violations.length} pairs < ${threshold} units\n`);
    
    console.log('All violations (sorted by distance, closest first):\n');
    console.log('#'.padEnd(4) + ' ' + 'Province 1'.padEnd(20) + ' ' + 'Coords'.padEnd(18) + ' ' + 'Province 2'.padEnd(20) + ' ' + 'Coords'.padEnd(18) + ' ' + 'Distance'.padStart(10));
    console.log('-'.repeat(100));

    violations.forEach((v, idx) => {
        const coords1 = `(${v.x1.toFixed(1)}, ${v.y1.toFixed(1)})`;
        const coords2 = `(${v.x2.toFixed(1)}, ${v.y2.toFixed(1)})`;
        console.log(String(idx + 1).padEnd(4) + ' ' + v.id1.toString().padEnd(20) + ' ' + coords1.padEnd(18) + ' ' + v.id2.toString().padEnd(20) + ' ' + coords2.padEnd(18) + ' ' + v.distance.toFixed(4).padStart(10));
    });
    
    console.log();
}

console.log('='.repeat(100) + '\n');
