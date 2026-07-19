import type { FactionId } from '@/types/game';

export interface HexLayoutTile {
  id: string;
  q: number;
  r: number;
  ownerId: FactionId | null;
  hasCity: boolean;
  regionName: string;
  citySize: 'small' | 'medium' | 'large';
}

const STARTING_POSITIONS: Record<FactionId, { q: number; r: number }> = {
  mongol: { q: 0, r: 0 },
  china: { q: 4, r: -2 },
  persia: { q: -2, r: 4 },
  russia: { q: -4, r: 1 },
};

const axialDistance = (a: { q: number; r: number }, b: { q: number; r: number }) =>
  Math.max(
    Math.abs(a.q - b.q),
    Math.abs(a.r - b.r),
    Math.abs((-a.q - a.r) - (-b.q - b.r))
  );

export const createHexGridLayout = (): HexLayoutTile[] => {
  const radius = 4;
  const tiles: HexLayoutTile[] = [];

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);

    for (let r = r1; r <= r2; r++) {
      const isCenter = q === 0 && r === 0;
      const position = { q, r };
      const factionEntries = Object.entries(STARTING_POSITIONS) as Array<[FactionId, { q: number; r: number }]>
      const nearestFaction = factionEntries.reduce<{ faction: FactionId; distance: number }>((best, [faction, start]) => {
        const distance = axialDistance(position, start);
        if (distance < best.distance) {
          return { faction, distance };
        }
        return best;
      }, { faction: 'mongol', distance: Number.POSITIVE_INFINITY });

      let ownerId: FactionId | null = null;
      let regionName = 'Neutraali kaupunki';
      let citySize: HexLayoutTile['citySize'] = 'small';

      if (isCenter) {
        ownerId = 'mongol';
        regionName = 'Karakorum';
        citySize = 'large';
      } else if (nearestFaction.distance <= 2) {
        ownerId = nearestFaction.faction;
        regionName = nearestFaction.faction === 'mongol' ? 'Mongolien steppi' : nearestFaction.faction === 'china' ? 'Kiinan raja' : nearestFaction.faction === 'persia' ? 'Persian raja' : 'Ruusien maa';
        citySize = nearestFaction.faction === 'mongol' ? 'medium' : 'medium';
      } else if (nearestFaction.distance <= 4) {
        ownerId = null;
        regionName = 'Neutraali kaupunki';
        citySize = 'small';
      } else {
        ownerId = null;
        regionName = 'Aavikon kaupunki';
        citySize = 'small';
      }

      tiles.push({
        id: `hex-${q}-${r}`,
        q,
        r,
        ownerId,
        hasCity: true,
        regionName,
        citySize,
      });
    }
  }

  return tiles;
};
