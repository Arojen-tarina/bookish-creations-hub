/**
 * DiplomacyPanel.tsx — Digipelin diplomatiapaneeli
 *
 * Näyttää suhteet muihin valtakuntiin (luottamus, uhka, rajakitka),
 * voimassa olevat sopimukset ja mahdollistaa uusien ehdottamisen/purkamisen.
 */
import { useState } from 'react';
import { useLanguage } from '@/lib/i18n.tsx';
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
  war_surprise: {
    name: 'Yllättävä sota',
    icon: <Sword className="w-4 h-4" />,
    description: 'Sota alkaa heti, kaikki muut julistavat sodan sinua vastaan',
  },
  war_formal: {
    name: 'Formaalinen sota',
    icon: <AlertTriangle className="w-4 h-4" />,
    description: 'Sota alkaa seuraavan vuoron lopussa',
  },
};

const TREATY_NAMES_EN: Record<TreatyType, string> = {
  non_aggression: 'Non-aggression pact',
  trade_agreement: 'Trade agreement',
  alliance: 'Alliance',
  truce: 'Truce',
  tributary: 'Tributary',
  peace: 'Peace treaty',
  war_surprise: 'Surprise war',
  war_formal: 'Formal war',
};

const TREATY_DESCRIPTIONS_EN: Record<TreatyType, string> = {
  non_aggression: 'No war between you',
  trade_agreement: '+10% tax income for both',
  alliance: 'Defensive alliance - fight together',
  truce: 'Temporary peace (5 turns)',
  tributary: 'Pays tribute to its protector',
  peace: 'Formal peace',
  war_surprise: 'War starts immediately',
  war_formal: 'War starts at the end of next turn',
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
  const { lang } = useLanguage();
  const treatyName = (type: TreatyType) => lang === 'en' ? TREATY_NAMES_EN[type] : TREATY_INFO[type].name;
  const treatyDescription = (type: TreatyType) => lang === 'en' ? TREATY_DESCRIPTIONS_EN[type] : TREATY_INFO[type].description;
  
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
              <h4 className="text-amber-100 font-bold">{faction.name}</h4>
              <p className="text-xs text-stone-300">{faction.ruler}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {relationIcon}
            <span className="text-sm font-medium text-stone-100">{lang === 'en' ? ({ Ystävällinen: 'Friendly', Positiivinen: 'Positive', Neutraali: 'Neutral', Vihamielinen: 'Hostile', Vihollinen: 'Enemy' } as Record<string, string>)[relationText] : relationText}</span>
          </div>
        </div>
        
        {/* Relation bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-stone-200 mb-1">
            <span>{lang === 'fi' ? 'Suhde' : 'Relation'}</span>
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
                  <span>{lang === 'fi' ? 'Luottamus' : 'Trust'}</span>
                  <span>{relation.trust}%</span>
                </div>
                <Progress value={relation.trust} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-stone-200 mb-1">
                  <span>{lang === 'fi' ? 'Uhka' : 'Threat'}</span>
                  <span>{relation.threat}%</span>
                </div>
                <Progress value={relation.threat} className="h-2 [&>div]:bg-red-500" />
              </div>
            </div>
            
            {/* Border friction */}
            {relation.borderFriction > 0 && (
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{lang === 'fi' ? 'Rajakitkaa' : 'Border friction'}: {relation.borderFriction}%</span>
              </div>
            )}
            
            {/* Claims */}
            {relation.claims.length > 0 && (
              <div className="text-sm text-red-400">
                <Sword className="w-4 h-4 inline mr-1" />
                {lang === 'fi' ? 'Vaatimuksia' : 'Claims'}: {relation.claims.length} {lang === 'fi' ? 'provinssia' : 'provinces'}
              </div>
            )}
            
            {/* Treaty actions */}
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-amber-100 uppercase">{lang === 'fi' ? 'Ehdota sopimusta' : 'Propose treaty'}</h5>
              <p className="text-xs text-stone-300">{lang === 'fi' ? 'Yksi rauhanomainen ehdotus per valtakunta per vuoro.' : 'One peaceful proposal per realm per turn.'}</p>
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
                    {TREATY_INFO[treatyType].icon}
                    <span className="ml-1"><span className="block">{treatyName(treatyType)}</span><span className="block text-xs font-normal text-stone-300">{treatyDescription(treatyType)}</span></span>
                  </Button>
                ))}
              </div>
              
              {/* Break treaty buttons */}
              {currentTreaties.length > 0 && (
                <>
                  <h5 className="text-sm font-semibold text-amber-100 uppercase mt-4">{lang === 'fi' ? 'Pura sopimus' : 'Break treaty'}</h5>
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
  const { lang } = useLanguage();
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
            {lang === 'fi' ? 'Diplomatia' : 'Diplomacy'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-purple-200/60 mb-4">
            {lang === 'fi' ? 'Solmi sopimuksia ja hallitse suhteita muihin valtakuntiin' : 'Make treaties and manage relations with other realms'}
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
