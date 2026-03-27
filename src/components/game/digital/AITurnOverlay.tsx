/**
 * AITurnOverlay.tsx — Animoitu AI-vuoron näkymä
 * 
 * Näyttää AI-pelaajien toiminnot yksi kerrallaan viiveiden kera.
 */
import { useState, useEffect } from 'react';
import { AIActionLog } from '@/hooks/useProvinceGameState';
import { Brain, Swords, MapPin, Shield, Coins, Users } from 'lucide-react';

interface AITurnOverlayProps {
  actions: AIActionLog[];
  isVisible: boolean;
  onComplete: () => void;
}

const ACTION_DELAY = 1200; // ms between actions

function getActionIcon(description: string) {
  if (description.includes('Hyökkä') || description.includes('Voitti') || description.includes('taistelun')) return <Swords className="w-5 h-5 text-red-400" />;
  if (description.includes('Valloi') || description.includes('Eteneminen')) return <MapPin className="w-5 h-5 text-green-400" />;
  if (description.includes('Linnoita') || description.includes('Puolusta')) return <Shield className="w-5 h-5 text-blue-400" />;
  if (description.includes('Markkina')) return <Coins className="w-5 h-5 text-amber-400" />;
  if (description.includes('Rekrytoi') || description.includes('Yhdist')) return <Users className="w-5 h-5 text-purple-400" />;
  return <Brain className="w-5 h-5 text-slate-400" />;
}

function getActionColor(description: string) {
  if (description.includes('Hyökkä') || description.includes('Voitti') || description.includes('taistelun')) return 'border-red-500/50 bg-red-950/40';
  if (description.includes('epäonnistui')) return 'border-orange-500/50 bg-orange-950/40';
  if (description.includes('Valloi')) return 'border-green-500/50 bg-green-950/40';
  if (description.includes('Linnoita')) return 'border-blue-500/50 bg-blue-950/40';
  if (description.includes('Rekrytoi')) return 'border-purple-500/50 bg-purple-950/40';
  return 'border-amber-500/50 bg-amber-950/40';
}

export const AITurnOverlay = ({ actions, isVisible, onComplete }: AITurnOverlayProps) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isVisible || actions.length === 0) {
      setVisibleCount(0);
      setIsDone(false);
      return;
    }

    setVisibleCount(0);
    setIsDone(false);

    let current = 0;
    const timer = setInterval(() => {
      current++;
      setVisibleCount(current);
      if (current >= actions.length) {
        clearInterval(timer);
        setTimeout(() => {
          setIsDone(true);
          onComplete();
        }, 1500);
      }
    }, ACTION_DELAY);

    return () => clearInterval(timer);
  }, [isVisible, actions, onComplete]);

  if (!isVisible || actions.length === 0) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex items-start justify-center pt-24">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-500" 
           style={{ opacity: isDone ? 0 : 1 }} />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-lg px-4" style={{ opacity: isDone ? 0 : 1, transition: 'opacity 0.5s' }}>
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-600/80 flex items-center justify-center animate-pulse">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white drop-shadow-lg">
            AI-pelaajien vuoro
          </h2>
        </div>

        {/* Actions list */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {actions.slice(0, visibleCount).map((action, i) => (
            <div 
              key={i}
              className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 animate-fade-in ${getActionColor(action.description)}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Faction color dot */}
              <span 
                className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white/20"
                style={{ backgroundColor: action.factionColor }}
              />
              
              {/* Icon */}
              {getActionIcon(action.description)}
              
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/90 font-medium truncate">
                  {action.description}
                </p>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {visibleCount < actions.length && (
            <div className="flex items-center justify-center gap-2 py-2 text-amber-300/70">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '200ms' }} />
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '400ms' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
