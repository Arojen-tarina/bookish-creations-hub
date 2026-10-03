/**
 * DiplomacyPanel.tsx — Digipelin diplomatiapaneeli
 *
 * Näyttää suhteet muihin valtakuntiin (luottamus, uhka, rajakitka),
 * voimassa olevat sopimukset ja mahdollistaa uusien ehdottamisen/purkamisen.
 */
import { useState } from 'react';
import { useLanguage } from '@/lib/i18n.tsx';
import { localizedName } from '@/lib/i18nGameUi.ts';
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
  currentTurn: number;
  onProposeTreaty: (targetFaction: FactionId, treatyType: TreatyType) => void;
  onBreakTreaty: (targetFaction: FactionId, treatyType: TreatyType) => void;
}

const TREATY_ICONS: Record<TreatyType, React.ReactNode> = {
  non_aggression: <ShieldAlert className="w-4 h-4" />,
  trade_agreement: <TrendingUp className="w-4 h-4" />,
  alliance: <Handshake className="w-4 h-4" />,
  truce: <Scale className="w-4 h-4" />,
  tributary: <Crown className="w-4 h-4" />,
  peace: <Check className="w-4 h-4" />,
  war_surprise: <Sword className="w-4 h-4" />,
  war_formal: <AlertTriangle className="w-4 h-4" />,
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
  currentTurn,
  onProposeTreaty,
  onBreakTreaty,
}: {
  faction: Faction;
  relation: DiplomaticRelation;
  playerFaction: FactionId;
  currentTurn: number;
  onProposeTreaty: (treatyType: TreatyType) => void;
  onBreakTreaty: (treatyType: TreatyType) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();
  const treatyName = (type: TreatyType) => t(`treaty.${type}.name`);
  const treatyDescription = (type: TreatyType) => t(`treaty.${type}.desc`);
  
  const relationIcon = relation.relation > 30 
    ? <TrendingUp className="w-4 h-4 text-green-400" />
    : relation.relation < -30 
      ? <TrendingDown className="w-4 h-4 text-red-400" />
      : <Minus className="w-4 h-4 text-amber-400" />;
  
  const relationText = relation.relation > 30 
    ? t('rel.friendly')
    : relation.relation > 0 
      ? t('rel.positive')
      : relation.relation > -30 
        ? t('ui.neutral')
        : relation.relation > -60 
          ? t('rel.hostile')
          : t('rel.enemy');
  
  // Available treaties and declarations (not already signed)
  const availableTreaties: TreatyType[] = ['non_aggression', 'trade_agreement', 'alliance', 'peace', 'war_surprise', 'war_formal'];
  const currentTreaties = relation.treaties.map(t => t.type);
  const offerableTreaties = availableTreaties.filter(t => !currentTreaties.includes(t));
  const proposalUsedThisTurn = relation.lastProposalTurn === currentTurn;
  
  return (
    <Card 
      className="bg-stone-900/90 border-stone-600/70 cursor-pointer transition-all hover:bg-stone-800/90"
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
              <h4 className="text-amber-100 font-bold">{localizedName(t, `faction.name.${faction.id}`, faction.name)}</h4>
              <p className="text-xs text-stone-300">{localizedName(t, `faction.ruler.${faction.id}`, faction.ruler)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {relationIcon}
            <span className="text-sm font-medium text-stone-100">{relationText}</span>
          </div>
        </div>
        
        {/* Relation bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-stone-200 mb-1">
            <span>{t('dipl.relation')}</span>
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
                {TREATY_ICONS[treatyType]}
                <span className="ml-1">{treatyName(treatyType)}</span>
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
                <div className="flex justify-between text-xs text-stone-200 mb-1">
                  <span>{t('dipl.trust')}</span>
                  <span>{relation.trust}%</span>
                </div>
                <Progress value={relation.trust} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-stone-200 mb-1">
                  <span>{t('dipl.threat')}</span>
                  <span>{relation.threat}%</span>
                </div>
                <Progress value={relation.threat} className="h-2 [&>div]:bg-red-500" />
              </div>
            </div>
            
            {/* Border friction */}
            {relation.borderFriction > 0 && (
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{t('dipl.friction')}: {relation.borderFriction}%</span>
              </div>
            )}
            
            {/* Claims */}
            {relation.claims.length > 0 && (
              <div className="text-sm text-red-400">
                <Sword className="w-4 h-4 inline mr-1" />
                {t('dipl.claims', { n: relation.claims.length })}
              </div>
            )}
            
            {/* Treaty actions */}
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-amber-100 uppercase">{t('dipl.propose')}</h5>
              <p className="text-xs text-stone-300">{t('dipl.oneProposal')}</p>
              <div className="flex flex-wrap gap-2">
                {offerableTreaties.map(treatyType => (
                  <Button
                    key={treatyType}
                    variant="outline"
                    size="sm"
                    disabled={proposalUsedThisTurn && !['war_surprise', 'war_formal'].includes(treatyType)}
                    title={treatyDescription(treatyType)}
                    className="h-auto min-h-10 border-amber-600/70 bg-stone-950/60 py-2 text-left text-amber-100 hover:bg-amber-900/40 disabled:cursor-not-allowed disabled:border-stone-700 disabled:text-stone-500"
                    onClick={() => onProposeTreaty(treatyType)}
                  >
                    {TREATY_ICONS[treatyType]}
                    <span className="ml-1"><span className="block">{treatyName(treatyType)}</span><span className="block text-xs font-normal text-stone-300">{treatyDescription(treatyType)}</span></span>
                  </Button>
                ))}
              </div>
              
              {/* Break treaty buttons */}
              {currentTreaties.length > 0 && (
                <>
                  <h5 className="text-sm font-semibold text-amber-100 uppercase mt-4">{t('dipl.breakTreaty')}</h5>
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
                        {treatyName(treatyType)}
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
  currentTurn,
  onProposeTreaty,
  onBreakTreaty,
}: DiplomacyPanelProps) => {
  const { t } = useLanguage();
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
            {t('dipl.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-purple-200/60 mb-4">
            {t('dipl.subtitle')}
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
                    currentTurn={currentTurn}
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
