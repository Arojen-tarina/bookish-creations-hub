/**
 * VictoryGoals.tsx — Voittotavoitteiden paneeli
 *
 * Näyttää kaikki viisi voittotapaa ja edistymisen kohti niitä.
 */
interface VictoryGoalsProps {
  provincesOwned: number;
  targetProvinces: number;
  gold: number;
  targetGold: number;
  techCount: number;
  targetTech: number;
  influence: number;
  targetInfluence: number;
  alliesCount: number;
  targetAllies: number;
  prestige: number;
  targetPrestige: number;
}

export const VictoryGoals = ({
  provincesOwned,
  targetProvinces,
  gold,
  targetGold,
  techCount,
  targetTech,
  influence,
  targetInfluence,
  alliesCount,
  targetAllies,
  prestige,
  targetPrestige,
}: VictoryGoalsProps) => {
  const militaryPct = Math.min(100, (provincesOwned / targetProvinces) * 100);
  const economicPct = Math.min(100, (gold / targetGold) * 100);
  const techPct = Math.min(100, (techCount / targetTech) * 100);
  const diplomaticPct = Math.min(100, Math.max(
    (influence / targetInfluence) * 100,
    targetAllies > 0 ? (alliesCount / targetAllies) * 100 : 0,
  ));
  const culturalPct = Math.min(100, (prestige / targetPrestige) * 100);

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
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${techPct}%` }} />
        </div>

        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-emerald-300">🕊️ Diplomaattinen voitto</span>
          <span className="text-emerald-100">{influence}/{targetInfluence} vaikutusvaltaa · {alliesCount}/{targetAllies} liittoa</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${diplomaticPct}%` }} />
        </div>

        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-purple-300">🏛️ Kulttuurinen voitto</span>
          <span className="text-purple-100">{prestige}/{targetPrestige} arvovaltaa</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${culturalPct}%` }} />
        </div>
      </div>
    </div>
  );
};

