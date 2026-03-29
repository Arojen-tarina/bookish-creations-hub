/**
 * DiplomacyPanel.tsx — Digipelin diplomatiapaneeli
 *
 * Näyttää suhteet muihin valtakuntiin (luottamus, uhka, rajakitka),
 * voimassa olevat sopimukset ja mahdollistaa uusien ehdottamisen/purkamisen.
 */
import { useState } from 'react';
import { FactionId, Faction, DiplomaticRelation, TreatyType, FACTION_DATA_1206 } from '@/types/province.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Progress } from '@/components/ui/progress.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { 
  Handshake, 
  Sword, 
  Scale, 
  ShieldAlert,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';

interface DiplomacyPanelProps {
  factions: Faction[];
  relations: DiplomaticRelation[];
  playerFaction: FactionId;
  onProposeTreaty: (targetFaction: FactionId, treatyType: TreatyType) => void;
  onBreakTreaty: (targetFaction: FactionId, treatyType: TreatyType) => void;
}

const TREATY_INFO: Record<TreatyType, { name: string; icon: React.ReactNode; description: string }> = {
  non_aggression: {
    name: 'Hyökkäämättömyyssopimus',
    icon: <ShieldAlert className="w-4 h-4" />,
    description: 'Ei sotaa keskenään',
  },
  trade_agreement: {
    name: 'Kauppasopimus',
    icon: <TrendingUp className="w-4 h-4" />,
    description: '+10% verotulot molemmille',
  },
  alliance: {
    name: 'Liitto',
    icon: <Handshake className="w-4 h-4" />,
    description: 'Puolustusliitto - sodassa yhdessä',
  },
  truce: {
    name: 'Aselepo',
    icon: <Scale className="w-4 h-4" />,
    description: 'Väliaikainen rauha (5 vuoroa)',
  },
  tributary: {
    name: 'Verovassalli',
    icon: <Crown className="w-4 h-4" />,
    description: 'Maksaa veroa suojelijalle',
  },
  peace: {
    name: 'Rauhansopimus',
    icon: <Check className="w-4 h-4" />,
    description: 'Virallinen rauha',
  },
};

const RelationBar = ({ value }: { value: number }) => {
  const normalized = (value + 100) / 2; // -100..100 -> 0..100
  const color = value > 30 ? 'bg-green-500' : value > -30 ? 'bg-amber-500' : 'bg-red-500';
  
  return (
    <div className="w-full h-2 bg-stone-700 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-300`}
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
};

const FactionRelationCard = ({
  faction,
  relation,
  playerFaction,
  onProposeTreaty,
  onBreakTreaty,
}: {
  faction: Faction;
  relation: DiplomaticRelation;
  playerFaction: FactionId;
  onProposeTreaty: (treatyType: TreatyType) => void;
  onBreakTreaty: (treatyType: TreatyType) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const relationIcon = relation.relation > 30 
    ? <TrendingUp className="w-4 h-4 text-green-400" />
    : relation.relation < -30 
      ? <TrendingDown className="w-4 h-4 text-red-400" />
      : <Minus className="w-4 h-4 text-amber-400" />;
  
  const relationText = relation.relation > 30 
    ? 'Ystävällinen'
    : relation.relation > 0 
      ? 'Positiivinen'
      : relation.relation > -30 
        ? 'Neutraali'
        : relation.relation > -60 
          ? 'Vihamielinen'
          : 'Vihollinen';
  
  // Available treaties (not already signed)
  const availableTreaties: TreatyType[] = ['non_aggression', 'trade_agreement', 'alliance'];
  const currentTreaties = relation.treaties.map(t => t.type);
  const offerableTreaties = availableTreaties.filter(t => !currentTreaties.includes(t));
  
  return (
    <Card 
      className="bg-stone-800/50 border-stone-700/50 cursor-pointer transition-all hover:bg-stone-800/70"
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full shadow-lg flex items-center justify-center"
              style={{ backgroundColor: faction.color }}
            >
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-amber-100 font-bold">{faction.name}</h4>
              <p className="text-xs text-stone-400">{faction.ruler}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {relationIcon}
            <span className="text-sm text-stone-300">{relationText}</span>
          </div>
        </div>
        
        {/* Relation bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-stone-400 mb-1">
            <span>Suhde</span>
            <span>{relation.relation > 0 ? '+' : ''}{relation.relation}</span>
          </div>
          <RelationBar value={relation.relation} />
        </div>
        
        {/* Current treaties */}
        {currentTreaties.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {currentTreaties.map(treatyType => (
              <Badge 
                key={treatyType}
                variant="secondary" 
                className="bg-amber-900/50 text-amber-200 text-xs"
              >
                {TREATY_INFO[treatyType].icon}
                <span className="ml-1">{TREATY_INFO[treatyType].name}</span>
              </Badge>
            ))}
          </div>
        )}
        
        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-stone-700 space-y-4" onClick={e => e.stopPropagation()}>
            {/* Trust & Threat */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>Luottamus</span>
                  <span>{relation.trust}%</span>
                </div>
                <Progress value={relation.trust} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>Uhka</span>
                  <span>{relation.threat}%</span>
                </div>
                <Progress value={relation.threat} className="h-2 [&>div]:bg-red-500" />
              </div>
            </div>
            
            {/* Border friction */}
            {relation.borderFriction > 0 && (
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Rajakitkaa: {relation.borderFriction}%</span>
              </div>
            )}
            
            {/* Claims */}
            {relation.claims.length > 0 && (
              <div className="text-sm text-red-400">
                <Sword className="w-4 h-4 inline mr-1" />
                Vaatimuksia: {relation.claims.length} provinssia
              </div>
            )}
            
            {/* Treaty actions */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-stone-400 uppercase">Ehdota sopimusta</h5>
              <div className="flex flex-wrap gap-2">
                {offerableTreaties.map(treatyType => (
                  <Button
                    key={treatyType}
                    variant="outline"
                    size="sm"
                    className="border-amber-700/50 text-amber-200 hover:bg-amber-900/30"
                    onClick={() => onProposeTreaty(treatyType)}
                  >
                    {TREATY_INFO[treatyType].icon}
                    <span className="ml-1">{TREATY_INFO[treatyType].name}</span>
                  </Button>
                ))}
              </div>
              
              {/* Break treaty buttons */}
              {currentTreaties.length > 0 && (
                <>
                  <h5 className="text-xs font-semibold text-stone-400 uppercase mt-4">Pura sopimus</h5>
                  <div className="flex flex-wrap gap-2">
                    {currentTreaties.map(treatyType => (
                      <Button
                        key={treatyType}
                        variant="outline"
                        size="sm"
                        className="border-red-700/50 text-red-400 hover:bg-red-900/30"
                        onClick={() => onBreakTreaty(treatyType)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        {TREATY_INFO[treatyType].name}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const DiplomacyPanel = ({
  factions,
  relations,
  playerFaction,
  onProposeTreaty,
  onBreakTreaty,
}: DiplomacyPanelProps) => {
  const otherFactions = factions.filter(f => f.id !== playerFaction);
  
  const getRelationWith = (factionId: FactionId): DiplomaticRelation | null => {
    return relations.find(
      r => (r.factionA === playerFaction && r.factionB === factionId) ||
           (r.factionB === playerFaction && r.factionA === factionId)
    ) || null;
  };
  
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-950/80 to-stone-950/80 border-purple-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-purple-100 text-lg flex items-center gap-2">
            <Handshake className="w-5 h-5" />
            Diplomatia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-purple-200/60 mb-4">
            Solmi sopimuksia ja hallitse suhteita muihin valtakuntiin
          </p>
          
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-3">
              {otherFactions.map(faction => {
                const relation = getRelationWith(faction.id);
                if (!relation) return null;
                
                return (
                  <FactionRelationCard
                    key={faction.id}
                    faction={faction}
                    relation={relation}
                    playerFaction={playerFaction}
                    onProposeTreaty={(type) => onProposeTreaty(faction.id, type)}
                    onBreakTreaty={(type) => onBreakTreaty(faction.id, type)}
                  />
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
