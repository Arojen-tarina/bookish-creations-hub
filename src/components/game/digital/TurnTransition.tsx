import { useState, useEffect } from 'react';
import { FactionId, FACTION_DATA_1206, GamePhase } from '@/types/province';
import { Crown, Sword, Handshake, Coins, Sparkles, Clock } from 'lucide-react';

interface TurnEvent {
  id: string;
  type: 'turn_start' | 'phase_change' | 'battle' | 'province_captured' | 'treaty' | 'income' | 'event';
  title: string;
  description: string;
  factionId?: FactionId;
  timestamp: number;
}

interface TurnTransitionProps {
  turn: number;
  year: number;
  phase: GamePhase;
  factionId: FactionId;
  isNewTurn: boolean;
  onComplete: () => void;
}

const phaseInfo: Record<GamePhase, { icon: typeof Crown; name: string; color: string }> = {
  planning: { icon: Clock, name: 'Suunnitteluvaihe', color: 'text-blue-400' },
  military: { icon: Sword, name: 'Sotilaalliset toimet', color: 'text-red-400' },
  diplomacy: { icon: Handshake, name: 'Diplomatia', color: 'text-green-400' },
  economy: { icon: Coins, name: 'Talous', color: 'text-amber-400' },
  event: { icon: Sparkles, name: 'Tapahtumat', color: 'text-purple-400' },
};

export const TurnTransition = ({ 
  turn, 
  year, 
  phase, 
  factionId, 
  isNewTurn,
  onComplete 
}: TurnTransitionProps) => {
  const [animationStage, setAnimationStage] = useState(0);
  const [visible, setVisible] = useState(true);

  const factionData = FACTION_DATA_1206[factionId];
  const phaseData = phaseInfo[phase];
  const PhaseIcon = phaseData.icon;

  useEffect(() => {
    // Animation sequence
    const timers: NodeJS.Timeout[] = [];

    // Stage 1: Fade in
    timers.push(setTimeout(() => setAnimationStage(1), 100));
    
    // Stage 2: Show content
    timers.push(setTimeout(() => setAnimationStage(2), 400));
    
    // Stage 3: Hold
    timers.push(setTimeout(() => setAnimationStage(3), isNewTurn ? 2200 : 1200));
    
    // Stage 4: Fade out
    timers.push(setTimeout(() => {
      setVisible(false);
      onComplete();
    }, isNewTurn ? 2800 : 1800));

    return () => timers.forEach(clearTimeout);
  }, [isNewTurn, onComplete]);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
        animationStage >= 1 ? 'opacity-100' : 'opacity-0'
      } ${animationStage >= 3 ? 'opacity-0' : ''}`}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Content */}
      <div className={`relative z-10 text-center transition-all duration-500 ${
        animationStage >= 2 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
      }`}>
        {isNewTurn ? (
          // New turn announcement
          <div className="space-y-6">
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-amber-500" />
              <Crown className="w-8 h-8 text-amber-400 animate-pulse" />
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-amber-500" />
            </div>
            
            {/* Year */}
            <div className="relative">
              <h1 className="text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 tracking-wider">
                {year}
              </h1>
              <div className="absolute inset-0 text-7xl font-display font-bold text-amber-400/20 blur-lg">
                {year}
              </div>
            </div>
            
            {/* Turn counter */}
            <p className="text-xl text-amber-200/80 tracking-widest uppercase">
              Vuoro {turn}
            </p>
            
            {/* Faction banner */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <div 
                className="w-4 h-4 rounded-full shadow-lg"
                style={{ 
                  backgroundColor: factionData.color,
                  boxShadow: `0 0 20px ${factionData.color}80`
                }}
              />
              <span className="text-lg font-semibold" style={{ color: factionData.color }}>
                {factionData.name}
              </span>
            </div>
            
            {/* Decorative bottom */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {['🏇', '⚔️', '🏰'].map((emoji, i) => (
                <span 
                  key={i} 
                  className="text-2xl opacity-60"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        ) : (
          // Phase change announcement
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-500" />
              <PhaseIcon className={`w-6 h-6 ${phaseData.color}`} />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-500" />
            </div>
            
            <h2 className={`text-3xl font-display font-bold ${phaseData.color}`}>
              {phaseData.name}
            </h2>
            
            <p className="text-sm text-slate-400">
              {getPhaseDescription(phase)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

function getPhaseDescription(phase: GamePhase): string {
  switch (phase) {
    case 'planning': return 'Tarkastele tilannetta ja suunnittele seuraavat siirtosi';
    case 'military': return 'Liikuta armeijoita ja hyökkää vihollisen alueille';
    case 'diplomacy': return 'Neuvottele sopimuksia muiden valtakuntien kanssa';
    case 'economy': return 'Kerää verot ja hallinnoi resursseja';
    case 'event': return 'Satunnaiset tapahtumat vaikuttavat valtakuntaasi';
    default: return '';
  }
}

// Turn Log Component
interface TurnLogEntry {
  id: string;
  turn: number;
  phase: GamePhase;
  type: 'move' | 'battle' | 'capture' | 'treaty' | 'build' | 'recruit' | 'income' | 'event';
  message: string;
  details?: string;
  factionId?: FactionId;
  timestamp: number;
}

interface TurnLogProps {
  entries: TurnLogEntry[];
  maxVisible?: number;
}

export const TurnLog = ({ entries, maxVisible = 5 }: TurnLogProps) => {
  const visibleEntries = entries.slice(-maxVisible);

  const getIcon = (type: TurnLogEntry['type']) => {
    switch (type) {
      case 'move': return '🏇';
      case 'battle': return '⚔️';
      case 'capture': return '🏴';
      case 'treaty': return '📜';
      case 'build': return '🏗️';
      case 'recruit': return '👥';
      case 'income': return '💰';
      case 'event': return '✨';
      default: return '•';
    }
  };

  const getTypeColor = (type: TurnLogEntry['type']) => {
    switch (type) {
      case 'battle': return 'border-l-red-500';
      case 'capture': return 'border-l-amber-500';
      case 'treaty': return 'border-l-green-500';
      case 'income': return 'border-l-amber-400';
      case 'event': return 'border-l-purple-500';
      default: return 'border-l-slate-500';
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center text-slate-500 text-sm py-4">
        Ei tapahtumia tällä vuorolla
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visibleEntries.map((entry, index) => (
        <div 
          key={entry.id}
          className={`bg-slate-800/50 border-l-2 ${getTypeColor(entry.type)} rounded-r-lg px-3 py-2 animate-fade-in`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start gap-2">
            <span className="text-sm shrink-0">{getIcon(entry.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-amber-100 leading-tight">{entry.message}</p>
              {entry.details && (
                <p className="text-xs text-slate-400 mt-0.5">{entry.details}</p>
              )}
            </div>
            <span className="text-xs text-slate-500 shrink-0">V{entry.turn}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// New Turn Summary Modal
interface TurnSummaryProps {
  turn: number;
  year: number;
  factionId: FactionId;
  income: number;
  manpowerGain: number;
  provincesOwned: number;
  armiesCount: number;
  onClose: () => void;
}

export const TurnSummary = ({
  turn,
  year,
  factionId,
  income,
  manpowerGain,
  provincesOwned,
  armiesCount,
  onClose,
}: TurnSummaryProps) => {
  const factionData = FACTION_DATA_1206[factionId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900/95 border border-amber-700/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: factionData.color }}
            />
            <span className="text-sm text-amber-200/70">{factionData.name}</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-amber-100">
            Vuosi {year} päättyi
          </h2>
          <p className="text-amber-200/50 text-sm">Vuoro {turn} yhteenveto</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <Coins className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-100">+{income}</p>
            <p className="text-xs text-slate-400">Verotulot</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <span className="text-2xl block mb-2">👥</span>
            <p className="text-2xl font-bold text-blue-100">+{manpowerGain}</p>
            <p className="text-xs text-slate-400">Miesvoima</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <span className="text-2xl block mb-2">🗺️</span>
            <p className="text-2xl font-bold text-green-100">{provincesOwned}</p>
            <p className="text-xs text-slate-400">Provinssit</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <Sword className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-100">{armiesCount}</p>
            <p className="text-xs text-slate-400">Armeijat</p>
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors"
        >
          Jatka pelaamista
        </button>
      </div>
    </div>
  );
};

export type { TurnLogEntry };
