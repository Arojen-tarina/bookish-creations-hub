/**
 * VictoryGoals.tsx — Voittotavoitteiden paneeli
 *
 * Näyttää kolme voittotapaa ja edistymisen kohti niitä.
 */
import { FactionId } from '@/types/province.ts';

interface VictoryGoalsProps {
  provincesOwned: number;
  targetProvinces: number;
}

export const VictoryGoals = ({
  provincesOwned,
  targetProvinces,
}: VictoryGoalsProps) => {
  const militaryPct = Math.min(100, (provincesOwned / targetProvinces) * 100);

  return (
    <div className="space-y-2">
      <h4 className="text-amber-100 text-xs font-bold flex items-center gap-1">🏆 Voittotavoite</h4>

      <div>
        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-red-300">⚔️ Valloita kaikki alueet</span>
          <span className="text-red-200">{provincesOwned}/{targetProvinces} aluetta</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${militaryPct}%` }} />
        </div>
      </div>
    </div>
  );
};
