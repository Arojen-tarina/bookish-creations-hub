"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VictoryGoals = void 0;
var VictoryGoals = function (_a) {
    var provincesOwned = _a.provincesOwned, targetProvinces = _a.targetProvinces, gold = _a.gold, targetGold = _a.targetGold, techCount = _a.techCount, targetTech = _a.targetTech;
    var militaryPct = Math.min(100, (provincesOwned / targetProvinces) * 100);
    var economicPct = Math.min(100, (gold / targetGold) * 100);
    var techPct = Math.min(100, (techCount / targetTech) * 100);
    return (<div className="space-y-3">
      <h4 className="text-amber-100 text-xs font-bold flex items-center gap-1">🏆 Voittotavoite</h4>

      <div>
        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-red-300">⚔️ Sotilaallinen voitto</span>
          <span className="text-red-200">{provincesOwned}/{targetProvinces} aluetta</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: "".concat(militaryPct, "%") }}/>
        </div>

        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-amber-300">💰 Taloudellinen voitto</span>
          <span className="text-amber-100">{gold}/{targetGold} kultaa</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: "".concat(economicPct, "%") }}/>
        </div>

        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-sky-300">🔬 Teknologinen voitto</span>
          <span className="text-sky-100">{techCount}/{targetTech} tekniikkaa</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: "".concat(techPct, "%") }}/>
        </div>
      </div>
    </div>);
};
exports.VictoryGoals = VictoryGoals;
