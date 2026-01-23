// Battle Display Component - Animated battle visualization
import { useState, useEffect, useCallback } from 'react';
import { Army, FactionId, FACTION_DATA_1206 } from '@/types/province';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sword, Shield, Target, Trophy, Skull, Flame } from 'lucide-react';

// Horse icon replacement
const HorseIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 8c-1 0-1.5.5-2 1.5s-1 1.5-2 1.5c-1.5 0-2.5-1-3.5-2L4 12l1 3 2 1c1 0 2-1 3-1h4l2 3h4l-1-4-2-2c0-1-.5-2-1-3l-2-1z"/>
    <path d="M2 12l2 1"/>
    <path d="M8 6l1 1"/>
    <path d="M10 4l2 2"/>
  </svg>
);

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
}

interface BattleDisplayProps {
  battle: BattleResult | null;
  onClose: () => void;
  onPlaySound?: (sound: string) => void;
}

interface BattlePhase {
  name: string;
  description: string;
  iconType: 'horse' | 'target' | 'sword' | 'flame' | 'shield';
  attackerDamage: number;
  defenderDamage: number;
}

export const BattleDisplay = ({ battle, onClose, onPlaySound }: BattleDisplayProps) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [attackerHealth, setAttackerHealth] = useState(100);
  const [defenderHealth, setDefenderHealth] = useState(100);
  const [showResult, setShowResult] = useState(false);
  
  // Generate battle phases based on armies
  const generatePhases = useCallback((): BattlePhase[] => {
    if (!battle) return [];
    
    const phases: BattlePhase[] = [];
    const totalAttackerStrength = battle.attacker.cavalry * 3 + battle.attacker.infantry;
    const totalDefenderStrength = battle.defender.cavalry * 3 + battle.defender.infantry;
    const attackerAdvantage = totalAttackerStrength / Math.max(totalDefenderStrength, 1);
    
    // Phase 1: Cavalry Charge
    if (battle.attacker.cavalry > 0 || battle.defender.cavalry > 0) {
      phases.push({
        name: 'Ratsuväen rynnäkkö',
        description: 'Ratsuväki törmää viholliseen',
        iconType: 'horse',
        attackerDamage: Math.round(battle.defender.cavalry * 2),
        defenderDamage: Math.round(battle.attacker.cavalry * 2 * attackerAdvantage),
      });
    }
    
    // Phase 2: Arrow Volley
    phases.push({
      name: 'Nuolisade',
      description: 'Jousiampujat ampuvat nuolisateen',
      iconType: 'target',
      attackerDamage: Math.round((battle.defenderLosses.infantry / 3) * 100),
      defenderDamage: Math.round((battle.attackerLosses.infantry / 3) * 100),
    });
    
    // Phase 3: Infantry Clash
    if (battle.attacker.infantry > 0 || battle.defender.infantry > 0) {
      phases.push({
        name: 'Jalkaväen yhteenotto',
        description: 'Jalkaväki kohtaa taistelussa',
        iconType: 'sword',
        attackerDamage: Math.round(battle.defender.infantry * 1.5),
        defenderDamage: Math.round(battle.attacker.infantry * 1.5 * attackerAdvantage),
      });
    }
    
    // Phase 4: Final Push
    phases.push({
      name: 'Ratkaiseva isku',
      description: battle.winner === 'attacker' 
        ? 'Hyökkääjä murtaa puolustuksen!'
        : 'Puolustaja pitää pintansa!',
      iconType: battle.winner === 'attacker' ? 'flame' : 'shield',
      attackerDamage: battle.winner === 'defender' ? 20 : 5,
      defenderDamage: battle.winner === 'attacker' ? 25 : 5,
    });
    
    return phases;
  }, [battle]);
  
  const phases = generatePhases();
  
  // Animate through phases
  useEffect(() => {
    if (!battle || !isAnimating) return;
    
    const totalLosses = {
      attacker: (battle.attackerLosses.cavalry + battle.attackerLosses.infantry) / 
        (battle.attacker.cavalry + battle.attacker.infantry + 0.1),
      defender: (battle.defenderLosses.cavalry + battle.defenderLosses.infantry) /
        (battle.defender.cavalry + battle.defender.infantry + 0.1),
    };
    
    const timer = setInterval(() => {
      setCurrentPhase(prev => {
        if (prev >= phases.length - 1) {
          setIsAnimating(false);
          setShowResult(true);
          clearInterval(timer);
          return prev;
        }
        
        // Update health bars
        const progress = (prev + 1) / phases.length;
        setAttackerHealth(100 - Math.round(totalLosses.attacker * 100 * progress));
        setDefenderHealth(100 - Math.round(totalLosses.defender * 100 * progress));
        
        // Play sound effect
        if (onPlaySound) {
          if (prev === 0 && battle.attacker.cavalry > 0) {
            onPlaySound('cavalry_charge');
          } else if (prev === 1) {
            onPlaySound('arrow_volley');
          } else if (prev === 2) {
            onPlaySound('sword_clash');
          }
        }
        
        return prev + 1;
      });
    }, 1500);
    
    return () => clearInterval(timer);
  }, [battle, phases.length, isAnimating, onPlaySound]);
  
  // Reset on new battle
  useEffect(() => {
    if (battle) {
      setCurrentPhase(0);
      setIsAnimating(true);
      setAttackerHealth(100);
      setDefenderHealth(100);
      setShowResult(false);
      
      if (onPlaySound) {
        onPlaySound('battle_start');
      }
    }
  }, [battle, onPlaySound]);
  
  if (!battle) return null;
  
  const attackerFaction = FACTION_DATA_1206[battle.attackerFaction];
  const defenderFaction = FACTION_DATA_1206[battle.defenderFaction];
  const currentPhaseData = phases[currentPhase];
  
  // Render phase icon
  const renderPhaseIcon = (iconType: string) => {
    const iconClass = "w-12 h-12 text-red-400 animate-bounce";
    switch (iconType) {
      case 'horse': return <HorseIcon className={iconClass} />;
      case 'target': return <Target className={iconClass} />;
      case 'sword': return <Sword className={iconClass} />;
      case 'flame': return <Flame className={iconClass} />;
      case 'shield': return <Shield className={iconClass} />;
      default: return <Sword className={iconClass} />;
    }
  };
  
  return (
    <Dialog open={!!battle} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-stone-900 via-red-950/50 to-stone-900 border-red-700/50 text-white overflow-hidden">
        {/* Battle smoke effect */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.3) 0%, transparent 70%)',
          }}
        />
        
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-2xl text-center text-red-100 flex items-center justify-center gap-2">
            <Sword className="w-6 h-6 animate-pulse" />
            Taistelu: {battle.provinceName}
            <Sword className="w-6 h-6 animate-pulse" style={{ transform: 'scaleX(-1)' }} />
          </DialogTitle>
          <DialogDescription className="text-center text-red-200/70">
            {attackerFaction.name} vs {defenderFaction.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative z-10 space-y-6 p-4">
          {/* Army comparison */}
          <div className="grid grid-cols-2 gap-6">
            {/* Attacker */}
            <div className="space-y-3">
              <div 
                className="text-center py-2 px-4 rounded-lg font-bold text-lg"
                style={{ backgroundColor: `${attackerFaction.color}40`, borderColor: attackerFaction.color }}
              >
                <span style={{ color: attackerFaction.color }}>{attackerFaction.name}</span>
                <span className="text-xs block text-stone-400">Hyökkääjä</span>
              </div>
              
              <div className="bg-stone-800/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <HorseIcon className="w-4 h-4 text-amber-400" /> Ratsuväki
                  </span>
                  <span className="text-amber-200 font-mono">
                    {battle.attacker.cavalry - battle.attackerLosses.cavalry}/{battle.attacker.cavalry}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Sword className="w-4 h-4 text-blue-400" /> Jalkaväki
                  </span>
                  <span className="text-blue-200 font-mono">
                    {battle.attacker.infantry - battle.attackerLosses.infantry}/{battle.attacker.infantry}
                  </span>
                </div>
              </div>
              
              {/* Health bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Voima</span>
                  <span>{attackerHealth}%</span>
                </div>
                <Progress 
                  value={attackerHealth} 
                  className="h-3 bg-stone-700"
                />
              </div>
            </div>
            
            {/* Defender */}
            <div className="space-y-3">
              <div 
                className="text-center py-2 px-4 rounded-lg font-bold text-lg"
                style={{ backgroundColor: `${defenderFaction.color}40`, borderColor: defenderFaction.color }}
              >
                <span style={{ color: defenderFaction.color }}>{defenderFaction.name}</span>
                <span className="text-xs block text-stone-400">Puolustaja</span>
              </div>
              
              <div className="bg-stone-800/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <HorseIcon className="w-4 h-4 text-amber-400" /> Ratsuväki
                  </span>
                  <span className="text-amber-200 font-mono">
                    {battle.defender.cavalry - battle.defenderLosses.cavalry}/{battle.defender.cavalry}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Sword className="w-4 h-4 text-blue-400" /> Jalkaväki
                  </span>
                  <span className="text-blue-200 font-mono">
                    {battle.defender.infantry - battle.defenderLosses.infantry}/{battle.defender.infantry}
                  </span>
                </div>
              </div>
              
              {/* Health bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Voima</span>
                  <span>{defenderHealth}%</span>
                </div>
                <Progress 
                  value={defenderHealth} 
                  className="h-3 bg-stone-700"
                />
              </div>
            </div>
          </div>
          
          {/* Battle phase display */}
          <div className="bg-stone-800/70 rounded-xl p-4 text-center min-h-[100px] flex flex-col items-center justify-center">
            {isAnimating && currentPhaseData ? (
              <>
                <div className="relative">
                  {renderPhaseIcon(currentPhaseData.iconType)}
                  <div className="absolute inset-0 animate-ping opacity-50">
                    {renderPhaseIcon(currentPhaseData.iconType)}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-red-100 mt-3 animate-pulse">
                  {currentPhaseData.name}
                </h3>
                <p className="text-stone-400 text-sm">{currentPhaseData.description}</p>
                
                {/* Progress dots */}
                <div className="flex gap-2 mt-4">
                  {phases.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx <= currentPhase 
                          ? 'bg-red-400 scale-125' 
                          : 'bg-stone-600'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : showResult && (
              <div className="animate-fade-in">
                {battle.winner === 'attacker' ? (
                  <div className="flex flex-col items-center">
                    <Trophy className="w-16 h-16 text-amber-400 mb-2" />
                    <h3 className="text-2xl font-bold" style={{ color: attackerFaction.color }}>
                      {attackerFaction.name} voittaa!
                    </h3>
                    <p className="text-stone-400">Provinssi vallattu</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Shield className="w-16 h-16 text-blue-400 mb-2" />
                    <h3 className="text-2xl font-bold" style={{ color: defenderFaction.color }}>
                      {defenderFaction.name} puolustautuu!
                    </h3>
                    <p className="text-stone-400">Hyökkäys torjuttu</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Loss summary */}
          {showResult && (
            <div className="grid grid-cols-2 gap-4 text-center animate-fade-in">
              <div className="bg-red-900/30 rounded-lg p-3">
                <Skull className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-xs text-stone-400">Hyökkääjän tappiot</p>
                <p className="text-red-200 font-bold">
                  🐴 {battle.attackerLosses.cavalry} ⚔️ {battle.attackerLosses.infantry}
                </p>
              </div>
              <div className="bg-red-900/30 rounded-lg p-3">
                <Skull className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-xs text-stone-400">Puolustajan tappiot</p>
                <p className="text-red-200 font-bold">
                  🐴 {battle.defenderLosses.cavalry} ⚔️ {battle.defenderLosses.infantry}
                </p>
              </div>
            </div>
          )}
          
          {/* Close button */}
          {showResult && (
            <Button 
              onClick={onClose}
              className="w-full bg-red-700 hover:bg-red-600 animate-fade-in"
            >
              Jatka
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
