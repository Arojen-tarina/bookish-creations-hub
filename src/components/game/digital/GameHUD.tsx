/**
 * GameHUD.tsx — Pelin yläpaneeli (Head-Up Display, vanha versio)
 *
 * Näyttää vuoron, vaiheen, resurssit ja kontrollipainikkeet.
 * Käytetään MongolianGame-komponentissa (heksilautapeli).
 */
import { GameState, RESOURCE_INFO, Faction } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Maximize2, 
  Minimize2, 
  Menu, 
  X, 
  HelpCircle,
  BookOpen,
  Clock,
  Brain,
  Crown,
  Save,
  FolderOpen,
} from 'lucide-react';

interface GameHUDProps {
  gameState: GameState;
  faction: Faction;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onToggleSidebar: () => void;
  onToggleLegend: () => void;
  onOpenSaveMenu?: () => void;
  onOpenLoadMenu?: () => void;
  showSidebar: boolean;
}

export const GameHUD = ({
  gameState,
  faction,
  isFullscreen,
  onToggleFullscreen,
  onToggleSidebar,
  onToggleLegend,
  onOpenSaveMenu,
  onOpenLoadMenu,
  showSidebar,
}: GameHUDProps) => {
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  
  return (
    <div className="fixed top-0 left-0 right-0 h-16 z-30">
      {/* Glass background */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl border-b border-amber-700/20" />
      
      {/* Content */}
      <div className="relative h-full flex items-center justify-between px-4 lg:px-6">
        {/* Left section - Faction & Turn */}
        <div className="flex items-center gap-4">
          {/* Faction indicator */}
          <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-2 border border-amber-700/20">
            <div className="relative">
              <span 
                className="block w-5 h-5 rounded-full shadow-lg"
                style={{ 
                  backgroundColor: faction.color, 
                  boxShadow: `0 0 15px ${faction.color}80` 
                }}
              />
              <Crown className="absolute -top-1 -right-1 w-3 h-3 text-amber-400" />
            </div>
            <span className="text-amber-100 font-display font-bold text-lg hidden sm:block">
              {faction.name}
            </span>
            {currentPlayer?.isAI && (
              <Badge variant="secondary" className="bg-purple-900/50 text-purple-200 border-purple-500/30">
                <Brain className="w-3 h-3 mr-1" />
                AI
              </Badge>
            )}
          </div>
          
          {/* Turn indicator */}
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-4 py-2 border border-amber-700/20">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-amber-200 font-mono">
              {gameState.turn}<span className="text-amber-200/50">/{gameState.maxTurns}</span>
            </span>
          </div>
          
          {/* Save/Load buttons */}
          <div className="hidden md:flex items-center gap-1">
            {onOpenSaveMenu && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenSaveMenu}
                className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30"
                title="Tallenna peli"
              >
                <Save className="w-4 h-4 mr-1" />
                <span className="hidden lg:inline">Tallenna</span>
              </Button>
            )}
            {onOpenLoadMenu && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenLoadMenu}
                className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30"
                title="Lataa peli"
              >
                <FolderOpen className="w-4 h-4 mr-1" />
                <span className="hidden lg:inline">Lataa</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Center - Resources (desktop only) */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-800/30 rounded-xl px-3 py-1.5 border border-amber-700/10">
          {currentPlayer && (Object.entries(currentPlayer.resources) as [keyof typeof RESOURCE_INFO, number][]).map(([key, value]) => (
            <div 
              key={key} 
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 transition-colors group"
              title={RESOURCE_INFO[key].name}
            >
              <span className="text-lg">{RESOURCE_INFO[key].emoji}</span>
              <span className="text-amber-100 font-bold text-sm tabular-nums">{value}</span>
            </div>
          ))}
        </div>
        
        {/* Right section - Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile Save/Load */}
          <div className="md:hidden flex items-center gap-1">
            {onOpenSaveMenu && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSaveMenu}
                className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30"
                title="Tallenna peli"
              >
                <Save className="w-5 h-5" />
              </Button>
            )}
            {onOpenLoadMenu && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenLoadMenu}
                className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30"
                title="Lataa peli"
              >
                <FolderOpen className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          {/* Help button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleLegend}
            className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 transition-all"
            title="Näytä selitykset"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
          
          {/* Ohjekirja link */}
          <a
            href="/ohjekirja"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-9 h-9 rounded-md text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 transition-all"
            title="Avaa ohjekirja"
          >
            <BookOpen className="w-5 h-5" />
          </a>
          
          {/* Fullscreen button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullscreen}
            className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 transition-all"
            title={isFullscreen ? 'Poistu koko näytöstä (ESC)' : 'Koko näyttö'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </Button>
          
          {/* Sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 transition-all lg:hidden"
            title={showSidebar ? 'Piilota valikko' : 'Näytä valikko'}
          >
            {showSidebar ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
          
          {/* Desktop sidebar toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSidebar}
            className="hidden lg:flex items-center gap-2 border-amber-700/30 text-amber-200 hover:bg-amber-900/30 hover:text-amber-100 transition-all"
          >
            {showSidebar ? (
              <>
                <X className="w-4 h-4" />
                Piilota
              </>
            ) : (
              <>
                <Menu className="w-4 h-4" />
                Valikko
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* AI thinking indicator */}
      {gameState.aiThinking && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 animate-fade-in">
          <div className="flex items-center gap-2 bg-purple-900/90 text-purple-100 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border border-purple-500/30">
            <Brain className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">AI suunnittelee siirtoaan...</span>
          </div>
        </div>
      )}
    </div>
  );
};