/**
 * VictoryGoals.tsx — Voittotavoitteiden paneeli
 *
 * Näyttää kolme voittotapaa ja edistymisen kohti niitä.
 */
import { FactionId } from '@/types/province.ts';

interface VictoryGoalsProps {
  provincesOwned: number;
  targetProvinces: number;
  gold: number;
  targetGold: number;
  techCount: number;
  targetTech: number;
}

export const VictoryGoals = ({
  provincesOwned,
  targetProvinces,
  gold,
  targetGold,
  techCount,
  targetTech,
}: VictoryGoalsProps) => {
  const militaryPct = Math.min(100, (provincesOwned / targetProvinces) * 100);
  const economicPct = Math.min(100, (gold / targetGold) * 100);
  const techPct = Math.min(100, (techCount / targetTech) * 100);

  return (
    <div className="space-y-3">
      <h4 className="text-amber-100 text-xs font-bold flex items-center gap-1">🏆 Voittotavoite</h4>

      <div>
        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-red-300">⚔️ Sotilaallinen voitto</span>
          <span className="text-red-200">{provincesOwned}/{targetProvinces} aluetta</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${militaryPct}%` }} />
        </div>

        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-amber-300">💰 Taloudellinen voitto</span>
          <span className="text-amber-100">{gold}/{targetGold} kultaa</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${economicPct}%` }} />
        </div>

        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-sky-300">🔬 Teknologinen voitto</span>
          <span className="text-sky-100">{techCount}/{targetTech} tekniikkaa</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${techPct}%` }} />
        </div>
      </div>
    </div>
  );
};
