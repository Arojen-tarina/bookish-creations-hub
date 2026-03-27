/**
 * BattleDisplay.tsx — Taistelunäyttö noppapohjaisella taistelulla
 * 
 * Näyttää hyökkäys- ja puolustusnopat animoidusti,
 * laskee voimat yhteen ja ratkaisee taistelun visuaalisesti.
 */
import { useState, useEffect, useCallback } from 'react';
import { Army, FactionId, FACTION_DATA_1206 } from '@/types/province';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sword, Shield, Trophy, Skull } from 'lucide-react';

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
  const dots = Array.from({ length: value }, (_, i) => i);
  
  // Dot positions for each dice value (standard dice layout)
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

  const positions = getPositions(value);

  return (
    <div className={`relative w-16 h-16 rounded-xl border-2 grid grid-cols-3 grid-rows-3 p-2 gap-0.5 ${rolling ? 'animate-spin' : ''}`}
      style={{ 
        backgroundColor: `${color}20`, 
        borderColor: `${color}80`,
        boxShadow: `0 0 20px ${color}30`
      }}
    >
      {positions.map((pos, i) => (
        <div key={i} className={`${pos} flex items-center justify-center`}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        </div>
      ))}
    </div>
  );
};

// Animated number counter
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

type BattlePhaseType = 'intro' | 'rolling' | 'power' | 'result';

export const BattleDisplay = ({ battle, onClose, onPlaySound }: BattleDisplayProps) => {
  const [phase, setPhase] = useState<BattlePhaseType>('intro');
  const [rollingAttack, setRollingAttack] = useState(1);
  const [rollingDefense, setRollingDefense] = useState(1);
  const [diceRolling, setDiceRolling] = useState(false);

  // Reset on new battle
  useEffect(() => {
    if (battle) {
      setPhase('intro');
      setDiceRolling(false);
      setRollingAttack(1);
      setRollingDefense(1);
      if (onPlaySound) onPlaySound('battle_start');
    }
  }, [battle, onPlaySound]);

  // Auto-advance phases
  useEffect(() => {
    if (!battle) return;
    
    if (phase === 'intro') {
      const t = setTimeout(() => {
        setPhase('rolling');
        setDiceRolling(true);
      }, 1200);
      return () => clearTimeout(t);
    }
    
    if (phase === 'rolling') {
      // Animate dice rolling
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
      }, 1800);
      
      return () => { clearInterval(interval); clearTimeout(t); };
    }
    
    if (phase === 'power') {
      const t = setTimeout(() => setPhase('result'), 2000);
      return () => clearTimeout(t);
    }
  }, [phase, battle, onPlaySound]);

  if (!battle) return null;

  const attackerFaction = FACTION_DATA_1206[battle.attackerFaction];
  const defenderFaction = FACTION_DATA_1206[battle.defenderFaction];
  
  const attackRoll = phase === 'rolling' ? rollingAttack : (battle.attackRoll || 3);
  const defenseRoll = phase === 'rolling' ? rollingDefense : (battle.defenseRoll || 3);
  
  // Calculate displayed power
  const rawAttackPower = battle.attacker.cavalry * 3 + battle.attacker.infantry * 1.5;
  const rawDefensePower = battle.defender.cavalry * 2 + battle.defender.infantry * 2;
  const totalAttack = Math.round(rawAttackPower + attackRoll * 2);
  const totalDefense = Math.round(rawDefensePower + defenseRoll * 2);

  return (
    <Dialog open={!!battle} onOpenChange={() => { if (phase === 'result') onClose(); }}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-stone-900 via-red-950/30 to-stone-900 border-red-700/50 text-white overflow-hidden p-0">
        {/* Background glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.3) 0%, transparent 70%)' }}
        />

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

          <div className="px-5 pb-5 space-y-4">
            {/* === ARMIES === */}
            <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center">
              {/* Attacker */}
              <div className="rounded-xl p-3 border" style={{ backgroundColor: `${attackerFaction.color}15`, borderColor: `${attackerFaction.color}40` }}>
                <div className="text-center mb-2">
                  <span className="font-bold text-lg" style={{ color: attackerFaction.color }}>{attackerFaction.name}</span>
                  <span className="block text-xs text-stone-400">⚔️ Hyökkääjä</span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span>🐴 Ratsuväki</span>
                    <span className="font-mono font-bold text-amber-200">{battle.attacker.cavalry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⚔️ Jalkaväki</span>
                    <span className="font-mono font-bold text-blue-200">{battle.attacker.infantry}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 border-t border-stone-700 pt-1">
                    <span>💪 Voima</span>
                    <span className="font-mono font-bold">{Math.round(rawAttackPower)}</span>
                  </div>
                </div>
              </div>

              {/* VS */}
              <div className="text-3xl font-black text-red-500/80 px-2">VS</div>

              {/* Defender */}
              <div className="rounded-xl p-3 border" style={{ backgroundColor: `${defenderFaction.color}15`, borderColor: `${defenderFaction.color}40` }}>
                <div className="text-center mb-2">
                  <span className="font-bold text-lg" style={{ color: defenderFaction.color }}>{defenderFaction.name}</span>
                  <span className="block text-xs text-stone-400">🛡️ Puolustaja</span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span>🐴 Ratsuväki</span>
                    <span className="font-mono font-bold text-amber-200">{battle.defender.cavalry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⚔️ Jalkaväki</span>
                    <span className="font-mono font-bold text-blue-200">{battle.defender.infantry}</span>
                  </div>
                  <div className="flex justify-between text-blue-400 border-t border-stone-700 pt-1">
                    <span>💪 Voima</span>
                    <span className="font-mono font-bold">{Math.round(rawDefensePower)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* === DICE SECTION === */}
            {(phase === 'rolling' || phase === 'power' || phase === 'result') && (
              <div className="bg-stone-800/70 rounded-xl p-4">
                <h4 className="text-center text-stone-400 text-xs uppercase tracking-wider mb-3">🎲 Nopanheitto</h4>
                
                <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                  {/* Attack dice */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-red-300 font-semibold">Hyökkäysnoppa</span>
                    <DiceFace value={attackRoll} color="#ef4444" rolling={diceRolling} />
                    {!diceRolling && (
                      <span className="text-2xl font-black text-red-400">{attackRoll}</span>
                    )}
                  </div>

                  <div className="text-stone-600 text-lg">⚡</div>

                  {/* Defense dice */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-blue-300 font-semibold">Puolustusnoppa</span>
                    <DiceFace value={defenseRoll} color="#3b82f6" rolling={diceRolling} />
                    {!diceRolling && (
                      <span className="text-2xl font-black text-blue-400">{defenseRoll}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* === POWER CALCULATION === */}
            {(phase === 'power' || phase === 'result') && (
              <div className="bg-stone-800/50 rounded-xl p-4 animate-fade-in">
                <h4 className="text-center text-stone-400 text-xs uppercase tracking-wider mb-3">⚖️ Kokonaisvoima</h4>
                <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                  <div className="text-center">
                    <div className="text-3xl font-black text-red-400">
                      <AnimatedNumber target={totalAttack} />
                    </div>
                    <p className="text-xs text-stone-500 mt-1">{Math.round(rawAttackPower)} + {attackRoll}×2</p>
                  </div>
                  
                  <div className={`text-2xl font-black ${totalAttack > totalDefense ? 'text-red-400' : totalDefense > totalAttack ? 'text-blue-400' : 'text-stone-400'}`}>
                    {totalAttack > totalDefense ? '>' : totalDefense > totalAttack ? '<' : '='}
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-black text-blue-400">
                      <AnimatedNumber target={totalDefense} />
                    </div>
                    <p className="text-xs text-stone-500 mt-1">{Math.round(rawDefensePower)} + {defenseRoll}×2</p>
                  </div>
                </div>
              </div>
            )}

            {/* === RESULT === */}
            {phase === 'result' && (
              <div className="space-y-4 animate-fade-in">
                {/* Winner banner */}
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

                {/* Losses */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-900/20 rounded-lg p-3 text-center border border-red-900/30">
                    <Skull className="w-4 h-4 text-red-400 mx-auto mb-1" />
                    <p className="text-[10px] text-stone-400 uppercase">Hyökkääjän tappiot</p>
                    <p className="text-red-200 font-bold text-sm mt-1">
                      🐴 -{battle.attackerLosses.cavalry} &nbsp; ⚔️ -{battle.attackerLosses.infantry}
                    </p>
                    <p className="text-stone-500 text-[10px]">
                      Jäljellä: 🐴{battle.attacker.cavalry - battle.attackerLosses.cavalry} ⚔️{battle.attacker.infantry - battle.attackerLosses.infantry}
                    </p>
                  </div>
                  <div className="bg-blue-900/20 rounded-lg p-3 text-center border border-blue-900/30">
                    <Skull className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <p className="text-[10px] text-stone-400 uppercase">Puolustajan tappiot</p>
                    <p className="text-blue-200 font-bold text-sm mt-1">
                      🐴 -{battle.defenderLosses.cavalry} &nbsp; ⚔️ -{battle.defenderLosses.infantry}
                    </p>
                    <p className="text-stone-500 text-[10px]">
                      Jäljellä: 🐴{battle.defender.cavalry - battle.defenderLosses.cavalry} ⚔️{battle.defender.infantry - battle.defenderLosses.infantry}
                    </p>
                  </div>
                </div>

                {/* Close */}
                <Button onClick={onClose} className="w-full bg-red-700 hover:bg-red-600 font-bold h-10">
                  Jatka peliä
                </Button>
              </div>
            )}

            {/* Loading state for intro */}
            {phase === 'intro' && (
              <div className="text-center py-8">
                <Sword className="w-12 h-12 text-red-400 mx-auto animate-bounce" />
                <p className="text-red-200 text-lg font-bold mt-3 animate-pulse">Armeijat kohtaavat...</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
