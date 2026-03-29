/**
 * BattleDisplay.tsx — Taistelunäyttö animoiduilla efekteillä
 * 
 * Vaiheet: intro → clash → rolling → power → losses → result
 * Sisältää räjähdysefektit, tärinän, joukkojen vähenemisanimaatiot.
 */
import { useState, useEffect, useCallback } from 'react';
import { Army, FactionId, FACTION_DATA_1206 } from '@/types/province.ts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Sword, Shield, Trophy, Skull, Flame, Zap } from 'lucide-react';

export interface BattleResult {
  attacker: Army;
  defender: Army;
  attackerFaction: FactionId;
  defenderFaction: FactionId;
  provinceName: string;
  winner: 'attacker' | 'defender';
  attackerLosses: { cavalry: number; infantry: number };
  defenderLosses: { cavalry: number; infantry: number };
  attackerMoraleLoss: number;
  defenderMoraleLoss: number;
  attackRoll?: number;
  defenseRoll?: number;
  attackerPower?: number;
  defenderPower?: number;
}

interface BattleDisplayProps {
  battle: BattleResult | null;
  onClose: () => void;
  onPlaySound?: (sound: string) => void;
}

// Dice face component
const DiceFace = ({ value, color, rolling }: { value: number; color: string; rolling: boolean }) => {
  const getPositions = (v: number): string[] => {
    switch (v) {
      case 1: return ['col-start-2 row-start-2'];
      case 2: return ['col-start-3 row-start-1', 'col-start-1 row-start-3'];
      case 3: return ['col-start-3 row-start-1', 'col-start-2 row-start-2', 'col-start-1 row-start-3'];
      case 4: return ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-1 row-start-3', 'col-start-3 row-start-3'];
      case 5: return ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-2 row-start-2', 'col-start-1 row-start-3', 'col-start-3 row-start-3'];
      case 6: return ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-1 row-start-2', 'col-start-3 row-start-2', 'col-start-1 row-start-3', 'col-start-3 row-start-3'];
      default: return [];
    }
  };

  return (
    <div
      className={`relative w-14 h-14 rounded-xl border-2 grid grid-cols-3 grid-rows-3 p-1.5 gap-0.5 transition-transform ${rolling ? 'animate-spin' : ''}`}
      style={{
        backgroundColor: `${color}20`,
        borderColor: `${color}80`,
        boxShadow: `0 0 20px ${color}30`,
      }}
    >
      {getPositions(value).map((pos, i) => (
        <div key={i} className={`${pos} flex items-center justify-center`}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        </div>
      ))}
    </div>
  );
};

// Animated number that counts up/down
const AnimatedNumber = ({ target, duration = 1000 }: { target: number; duration?: number }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCurrent(Math.round(target * progress));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return <span>{current}</span>;
};

// Animated troop loss counter (counts DOWN with red flash)
const TroopLossCounter = ({ from, loss, delay = 0 }: { from: number; loss: number; delay?: number }) => {
  const [displayed, setDisplayed] = useState(from);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    if (loss <= 0) return;
    const t = setTimeout(() => {
      setFlashing(true);
      const steps = Math.min(loss, 10);
      const interval = 600 / steps;
      let step = 0;
      const iv = setInterval(() => {
        step++;
        setDisplayed(from - Math.round((step / steps) * loss));
        if (step >= steps) clearInterval(iv);
      }, interval);
      setTimeout(() => setFlashing(false), 800);
    }, delay);
    return () => clearTimeout(t);
  }, [from, loss, delay]);

  return (
    <span className={`font-mono font-bold transition-all duration-200 ${flashing ? 'text-red-400 scale-125' : ''}`}>
      {displayed}
    </span>
  );
};

// Explosion particle effect
const ExplosionEffect = ({ active }: { active: boolean }) => {
  if (!active) return null;
  const particles = Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * 360,
    distance: 30 + Math.random() * 40,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 200,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: `hsl(${20 + Math.random() * 30}, 90%, ${50 + Math.random() * 20}%)`,
            animation: `battle-particle 0.8s ease-out ${p.delay}ms forwards`,
            transform: `translate(0, 0)`,
            '--px': `${Math.cos(p.angle * Math.PI / 180) * p.distance}px`,
            '--py': `${Math.sin(p.angle * Math.PI / 180) * p.distance}px`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes battle-particle {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--px), var(--py)) scale(0); }
        }
        @keyframes battle-shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-6px) rotate(-1deg); }
          20% { transform: translateX(5px) rotate(1deg); }
          30% { transform: translateX(-4px); }
          40% { transform: translateX(3px); }
          50% { transform: translateX(-2px); }
          60% { transform: translateX(1px); }
        }
        @keyframes battle-flash {
          0% { opacity: 0; }
          20% { opacity: 0.6; }
          100% { opacity: 0; }
        }
        @keyframes slide-in-left {
          0% { transform: translateX(-80px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-in-right {
          0% { transform: translateX(80px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes clash-impact {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
        .battle-shake { animation: battle-shake 0.5s ease-in-out; }
        .slide-in-left { animation: slide-in-left 0.5s ease-out; }
        .slide-in-right { animation: slide-in-right 0.5s ease-out; }
      `}</style>
    </div>
  );
};

type BattlePhaseType = 'intro' | 'clash' | 'rolling' | 'power' | 'losses' | 'result';

export const BattleDisplay = ({ battle, onClose, onPlaySound }: BattleDisplayProps) => {
  const [phase, setPhase] = useState<BattlePhaseType>('intro');
  const [rollingAttack, setRollingAttack] = useState(1);
  const [rollingDefense, setRollingDefense] = useState(1);
  const [diceRolling, setDiceRolling] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [shaking, setShaking] = useState(false);

  // Reset on new battle
  useEffect(() => {
    if (battle) {
      setPhase('intro');
      setDiceRolling(false);
      setRollingAttack(1);
      setRollingDefense(1);
      setShowExplosion(false);
      setShaking(false);
      if (onPlaySound) onPlaySound('battle_start');
    }
  }, [battle, onPlaySound]);

  // Auto-advance phases
  useEffect(() => {
    if (!battle) return;

    if (phase === 'intro') {
      const t = setTimeout(() => setPhase('clash'), 1000);
      return () => clearTimeout(t);
    }

    if (phase === 'clash') {
      setShowExplosion(true);
      setShaking(true);
      const t1 = setTimeout(() => setShaking(false), 500);
      const t2 = setTimeout(() => {
        setShowExplosion(false);
        setPhase('rolling');
        setDiceRolling(true);
      }, 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }

    if (phase === 'rolling') {
      const interval = setInterval(() => {
        setRollingAttack(Math.floor(Math.random() * 6) + 1);
        setRollingDefense(Math.floor(Math.random() * 6) + 1);
      }, 100);

      const t = setTimeout(() => {
        clearInterval(interval);
        setDiceRolling(false);
        setRollingAttack(battle.attackRoll || Math.floor(Math.random() * 6) + 1);
        setRollingDefense(battle.defenseRoll || Math.floor(Math.random() * 6) + 1);
        if (onPlaySound) onPlaySound('dice_roll');
        setPhase('power');
      }, 1600);

      return () => { clearInterval(interval); clearTimeout(t); };
    }

    if (phase === 'power') {
      const t = setTimeout(() => {
        setShaking(true);
        setTimeout(() => setShaking(false), 400);
        setPhase('losses');
      }, 1800);
      return () => clearTimeout(t);
    }

    if (phase === 'losses') {
      const t = setTimeout(() => setPhase('result'), 2000);
      return () => clearTimeout(t);
    }
  }, [phase, battle, onPlaySound]);

  if (!battle) return null;

  const attackerFaction = FACTION_DATA_1206[battle.attackerFaction];
  const defenderFaction = FACTION_DATA_1206[battle.defenderFaction];

  const attackRoll = phase === 'rolling' ? rollingAttack : (battle.attackRoll || 3);
  const defenseRoll = phase === 'rolling' ? rollingDefense : (battle.defenseRoll || 3);

  const rawAttackPower = battle.attacker.cavalry * 3 + battle.attacker.infantry * 1.5;
  const rawDefensePower = battle.defender.cavalry * 2 + battle.defender.infantry * 2;
  const totalAttack = Math.round(rawAttackPower + attackRoll * 2);
  const totalDefense = Math.round(rawDefensePower + defenseRoll * 2);

  const showArmies = phase !== 'intro';
  const showDice = phase === 'rolling' || phase === 'power' || phase === 'losses' || phase === 'result';
  const showPower = phase === 'power' || phase === 'losses' || phase === 'result';
  const showLosses = phase === 'losses' || phase === 'result';
  const showResult = phase === 'result';

  return (
    <Dialog open={!!battle} onOpenChange={() => { if (phase === 'result') onClose(); }}>
      <DialogContent className={`max-w-2xl bg-gradient-to-br from-stone-900 via-red-950/30 to-stone-900 border-red-700/50 text-white overflow-hidden p-0 ${shaking ? 'battle-shake' : ''}`}>
        {/* Background glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.3) 0%, transparent 70%)' }}
        />
        
        {/* Flash overlay on clash */}
        {phase === 'clash' && (
          <div className="absolute inset-0 z-20 pointer-events-none bg-white"
            style={{ animation: 'battle-flash 0.6s ease-out forwards' }}
          />
        )}

        <ExplosionEffect active={showExplosion} />

        <div className="relative z-10">
          {/* Header */}
          <DialogHeader className="p-5 pb-2">
            <DialogTitle className="text-2xl text-center text-red-100 flex items-center justify-center gap-2">
              <Sword className="w-6 h-6" />
              Taistelu: {battle.provinceName}
              <Sword className="w-6 h-6" style={{ transform: 'scaleX(-1)' }} />
            </DialogTitle>
            <DialogDescription className="text-center text-red-200/70 text-sm">
              {attackerFaction.name} hyökkää — {defenderFaction.name} puolustaa
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 pb-5 space-y-3">
            {/* === INTRO — Armies charging === */}
            {phase === 'intro' && (
              <div className="text-center py-10">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-5xl slide-in-left">⚔️</div>
                  <Zap className="w-10 h-10 text-amber-400 animate-pulse" />
                  <div className="text-5xl slide-in-right">🛡️</div>
                </div>
                <p className="text-red-200 text-lg font-bold mt-4 animate-pulse">Armeijat törmäävät!</p>
              </div>
            )}

            {/* === ARMIES === */}
            {showArmies && (
              <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center">
                {/* Attacker */}
                <div className={`rounded-xl p-3 border transition-all duration-300 ${showLosses ? 'border-red-500/60' : ''}`}
                  style={{ backgroundColor: `${attackerFaction.color}15`, borderColor: showLosses ? undefined : `${attackerFaction.color}40` }}>
                  <div className="text-center mb-2">
                    <span className="font-bold text-base" style={{ color: attackerFaction.color }}>{attackerFaction.name}</span>
                    <span className="block text-xs text-stone-400">⚔️ Hyökkääjä</span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span>🐴 Ratsuväki</span>
                      {showLosses ? (
                        <div className="flex items-center gap-1">
                          <TroopLossCounter from={battle.attacker.cavalry} loss={battle.attackerLosses.cavalry} delay={200} />
                          {battle.attackerLosses.cavalry > 0 && (
                            <span className="text-red-400 text-xs animate-fade-in">(-{battle.attackerLosses.cavalry})</span>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-amber-200">{battle.attacker.cavalry}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span>⚔️ Jalkaväki</span>
                      {showLosses ? (
                        <div className="flex items-center gap-1">
                          <TroopLossCounter from={battle.attacker.infantry} loss={battle.attackerLosses.infantry} delay={500} />
                          {battle.attackerLosses.infantry > 0 && (
                            <span className="text-red-400 text-xs animate-fade-in">(-{battle.attackerLosses.infantry})</span>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-blue-200">{battle.attacker.infantry}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* VS / Clash icon */}
                <div className="text-center">
                  {phase === 'clash' ? (
                    <Flame className="w-8 h-8 text-orange-400 animate-bounce" />
                  ) : (
                    <div className="text-2xl font-black text-red-500/80">VS</div>
                  )}
                </div>

                {/* Defender */}
                <div className={`rounded-xl p-3 border transition-all duration-300 ${showLosses ? 'border-blue-500/60' : ''}`}
                  style={{ backgroundColor: `${defenderFaction.color}15`, borderColor: showLosses ? undefined : `${defenderFaction.color}40` }}>
                  <div className="text-center mb-2">
                    <span className="font-bold text-base" style={{ color: defenderFaction.color }}>{defenderFaction.name}</span>
                    <span className="block text-xs text-stone-400">🛡️ Puolustaja</span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span>🐴 Ratsuväki</span>
                      {showLosses ? (
                        <div className="flex items-center gap-1">
                          <TroopLossCounter from={battle.defender.cavalry} loss={battle.defenderLosses.cavalry} delay={300} />
                          {battle.defenderLosses.cavalry > 0 && (
                            <span className="text-red-400 text-xs animate-fade-in">(-{battle.defenderLosses.cavalry})</span>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-amber-200">{battle.defender.cavalry}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span>⚔️ Jalkaväki</span>
                      {showLosses ? (
                        <div className="flex items-center gap-1">
                          <TroopLossCounter from={battle.defender.infantry} loss={battle.defenderLosses.infantry} delay={600} />
                          {battle.defenderLosses.infantry > 0 && (
                            <span className="text-red-400 text-xs animate-fade-in">(-{battle.defenderLosses.infantry})</span>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-blue-200">{battle.defender.infantry}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* === DICE === */}
            {showDice && (
              <div className="bg-stone-800/70 rounded-xl p-3 animate-fade-in">
                <h4 className="text-center text-stone-400 text-xs uppercase tracking-wider mb-2">🎲 Nopanheitto</h4>
                <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-red-300 font-semibold">Hyökkäys</span>
                    <DiceFace value={attackRoll} color="#ef4444" rolling={diceRolling} />
                    {!diceRolling && <span className="text-xl font-black text-red-400">{attackRoll}</span>}
                  </div>
                  <div className="text-stone-600 text-lg">⚡</div>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-blue-300 font-semibold">Puolustus</span>
                    <DiceFace value={defenseRoll} color="#3b82f6" rolling={diceRolling} />
                    {!diceRolling && <span className="text-xl font-black text-blue-400">{defenseRoll}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* === POWER === */}
            {showPower && (
              <div className="bg-stone-800/50 rounded-xl p-3 animate-fade-in">
                <h4 className="text-center text-stone-400 text-xs uppercase tracking-wider mb-2">⚖️ Kokonaisvoima</h4>
                <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                  <div className="text-center">
                    <div className="text-3xl font-black text-red-400">
                      <AnimatedNumber target={totalAttack} />
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">{Math.round(rawAttackPower)} + {attackRoll}×2</p>
                  </div>
                  <div className={`text-2xl font-black ${totalAttack > totalDefense ? 'text-red-400' : totalDefense > totalAttack ? 'text-blue-400' : 'text-stone-400'}`}>
                    {totalAttack > totalDefense ? '>' : totalDefense > totalAttack ? '<' : '='}
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-blue-400">
                      <AnimatedNumber target={totalDefense} />
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">{Math.round(rawDefensePower)} + {defenseRoll}×2</p>
                  </div>
                </div>
              </div>
            )}

            {/* === RESULT === */}
            {showResult && (
              <div className="space-y-3 animate-fade-in">
                <div className={`rounded-xl p-4 text-center border-2 ${
                  battle.winner === 'attacker'
                    ? 'bg-red-900/30 border-red-600/50'
                    : 'bg-blue-900/30 border-blue-600/50'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {battle.winner === 'attacker'
                      ? <Trophy className="w-8 h-8 text-amber-400" />
                      : <Shield className="w-8 h-8 text-blue-400" />
                    }
                  </div>
                  <h3 className="text-xl font-black" style={{ color: battle.winner === 'attacker' ? attackerFaction.color : defenderFaction.color }}>
                    {battle.winner === 'attacker' ? `${attackerFaction.name} voittaa!` : `${defenderFaction.name} puolustautuu!`}
                  </h3>
                  <p className="text-stone-400 text-sm">
                    {battle.winner === 'attacker' ? 'Provinssi vallattu!' : 'Hyökkäys torjuttu!'}
                  </p>
                </div>

                <Button onClick={onClose} className="w-full bg-red-700 hover:bg-red-600 font-bold h-10">
                  Jatka peliä
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
