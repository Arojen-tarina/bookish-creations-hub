/**
 * VictoryGoals.tsx — Voittotavoitteiden paneeli
 * 
 * Näyttää kolme voittotapaa ja edistymisen kohti niitä.
 */
import { FactionId } from '@/types/province';

interface VictoryGoalsProps {
  provincesOwned: number;
  totalProvinces: number;
  treasury: number;
  techCount: number;
  targetProvinces: number;
  targetGold: number;
  targetTech: number;
}

export const VictoryGoals = ({
  provincesOwned,
  totalProvinces,
  treasury,
  techCount,
  targetProvinces,
  targetGold,
  targetTech,
}: VictoryGoalsProps) => {
  const militaryPct = Math.min(100, (provincesOwned / targetProvinces) * 100);
  const economyPct = Math.min(100, (treasury / targetGold) * 100);
  const techPct = Math.min(100, (techCount / targetTech) * 100);
  
  return (
    <div className="space-y-2">
      <h4 className="text-amber-100 text-xs font-bold flex items-center gap-1">🏆 Voittotavoitteet</h4>
      
      {/* Military */}
      <div>
        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-red-300">⚔️ Sotilaallinen</span>
          <span className="text-red-200">{provincesOwned}/{targetProvinces} aluetta</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${militaryPct}%` }} />
        </div>
      </div>
      
      {/* Economic */}
      <div>
        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-amber-300">🪙 Taloudellinen</span>
          <span className="text-amber-200">{treasury}/{targetGold} kultaa</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${economyPct}%` }} />
        </div>
      </div>
      
      {/* Technology */}
      <div>
        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-green-300">🔬 Teknologia</span>
          <span className="text-green-200">{techCount}/{targetTech} teknologiaa</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${techPct}%` }} />
        </div>
      </div>
    </div>
  );
};
