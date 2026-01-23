// Event Card Component - Shows random game events
import { useState } from 'react';
import { GameEvent, ActiveGameEvent, FactionId, FACTION_DATA_1206, GameEventType, EventChoice } from '@/types/province';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Gift, 
  Coins, 
  Mountain,
  Sword,
  Star,
  Flame,
} from 'lucide-react';

// Event types and their icons/colors
const EVENT_THEMES: Record<GameEventType, { 
  icon: typeof Sparkles; 
  bgColor: string; 
  borderColor: string; 
  textColor: string;
}> = {
  plague: { icon: Flame, bgColor: 'from-red-900/80 via-orange-900/60 to-red-950', borderColor: 'border-red-500/50', textColor: 'text-red-100' },
  rebellion: { icon: Sword, bgColor: 'from-slate-800/80 via-zinc-800/60 to-slate-900', borderColor: 'border-slate-500/50', textColor: 'text-slate-100' },
  trade_boom: { icon: Coins, bgColor: 'from-yellow-900/80 via-amber-800/60 to-yellow-950', borderColor: 'border-yellow-500/50', textColor: 'text-yellow-100' },
  drought: { icon: Mountain, bgColor: 'from-stone-800/80 via-stone-700/60 to-stone-900', borderColor: 'border-stone-500/50', textColor: 'text-stone-100' },
  mongol_rally: { icon: Star, bgColor: 'from-amber-900/80 via-yellow-900/60 to-amber-950', borderColor: 'border-amber-500/50', textColor: 'text-amber-100' },
  diplomatic_offer: { icon: Gift, bgColor: 'from-blue-900/80 via-indigo-900/60 to-blue-950', borderColor: 'border-blue-500/50', textColor: 'text-blue-100' },
  conquest_opportunity: { icon: Sword, bgColor: 'from-green-900/80 via-emerald-900/60 to-green-950', borderColor: 'border-green-500/50', textColor: 'text-green-100' },
  civil_war: { icon: Flame, bgColor: 'from-red-900/80 via-orange-900/60 to-red-950', borderColor: 'border-red-500/50', textColor: 'text-red-100' },
  natural_disaster: { icon: Mountain, bgColor: 'from-stone-800/80 via-stone-700/60 to-stone-900', borderColor: 'border-stone-500/50', textColor: 'text-stone-100' },
};

// Game events (matching the GameEvent type)
export const GAME_EVENTS: GameEvent[] = [
  // Positive events
  {
    id: 'silk_road_boom',
    type: 'trade_boom',
    name: 'Silkkitien kukoistus',
    description: 'Kauppa kukoistaa Silkkitiellä. Kaikki Silkkitien provinssit tuottavat lisää kultaa.',
    effect: '+50 kultaa valtionkassaan',
    duration: 1,
    weight: 10,
    choices: [
      { text: 'Erinomaista!', effect: '+50 kultaa' },
    ],
  },
  {
    id: 'horse_breeding',
    type: 'mongol_rally',
    name: 'Hevosten kasvatuskausi',
    description: 'Aropeiden hevoset ovat erityisen terveitä tänä vuonna.',
    effect: '+20 hevosta',
    duration: 1,
    weight: 8,
    choices: [
      { text: 'Loistavaa!', effect: '+20 hevosta' },
    ],
  },
  {
    id: 'tribal_warriors',
    type: 'conquest_opportunity',
    name: 'Heimosoturit liittyvät joukkoon',
    description: 'Naapuriheimo haluaa liittyä sotajoukkoomme.',
    effect: 'Valitse vastaanottaako soturit',
    duration: 1,
    weight: 7,
    choices: [
      { text: 'Tervetuloa!', effect: '+15 miesvoimaa' },
      { text: 'Emme tarvitse heitä', effect: '-10 suhteet' },
    ],
  },
  {
    id: 'trade_caravan',
    type: 'trade_boom',
    name: 'Kauppakaravaani',
    description: 'Rikas kauppakaravaani saapuu pääkaupunkiin.',
    effect: 'Valitse veropolitiikka',
    duration: 1,
    weight: 9,
    choices: [
      { text: 'Korkeat verot', effect: '+40 kultaa' },
      { text: 'Reilu kauppa', effect: '+20 kultaa, +5 suhteet' },
    ],
  },
  
  // Negative events
  {
    id: 'harsh_winter',
    type: 'natural_disaster',
    name: 'Ankara talvi',
    description: 'Kylmä talvi iskee aropeihin. Monet hevoset ja sotilaat kärsivät.',
    effect: '-10 hevosta, -5 miesvoimaa',
    duration: 1,
    weight: 6,
    choices: [
      { text: 'Kestämme', effect: 'Hyväksy tappiot' },
    ],
  },
  {
    id: 'plague_outbreak',
    type: 'plague',
    name: 'Rutto',
    description: 'Tauti leviää joukoissamme. Monet sairastuvat.',
    effect: 'Valitse toimenpide',
    duration: 2,
    weight: 4,
    choices: [
      { text: 'Eristä sairaat', effect: '-10 miesvoimaa' },
      { text: 'Rukoile parantumista', effect: '-15 miesvoimaa' },
    ],
  },
  {
    id: 'drought_event',
    type: 'drought',
    name: 'Kuivuus',
    description: 'Kuivuus kuivattaa laidunmaat. Ruokaa on niukasti.',
    effect: '-5 hevosta, -20 kultaa',
    duration: 1,
    weight: 5,
    choices: [
      { text: 'Säännöstele ruokaa', effect: 'Hyväksy tappiot' },
    ],
  },
  {
    id: 'rebellion_event',
    type: 'rebellion',
    name: 'Kapina',
    description: 'Tyytymättömät heimolaiset nousevat kapinaan yhdessä provinssissa.',
    effect: '+30% levottomuus satunnaiseen provinssiin',
    duration: 1,
    weight: 5,
    choices: [
      { text: 'Murskaa kapina', effect: '-5 miesvoimaa' },
      { text: 'Neuvottele', effect: '-30 kultaa' },
    ],
  },
  
  // Diplomatic events
  {
    id: 'foreign_envoy',
    type: 'diplomatic_offer',
    name: 'Vieraan maan lähettiläs',
    description: 'Lähettiläs saapuu kaukaisesta maasta tarjoamaan ystävyyttä.',
    effect: 'Valitse vastaus',
    duration: 1,
    weight: 7,
    choices: [
      { text: 'Hyväksy liitto', effect: '+20 suhteet' },
      { text: 'Kieltäydy', effect: '-10 suhteet' },
      { text: 'Vaadi veroa', effect: '+30 kultaa, -30 suhteet' },
    ],
  },
  {
    id: 'spy_caught',
    type: 'diplomatic_offer',
    name: 'Vakooja kiinni',
    description: 'Vihollisen vakooja on saatu kiinni hovissasi.',
    effect: 'Valitse vakoajan kohtalo',
    duration: 1,
    weight: 6,
    choices: [
      { text: 'Teloita', effect: '-20 suhteet' },
      { text: 'Vaadi lunnaita', effect: '+25 kultaa' },
      { text: 'Käännä puolellesi', effect: '+10 suhteet' },
    ],
  },
  {
    id: 'civil_unrest',
    type: 'civil_war',
    name: 'Sisäinen hajaannus',
    description: 'Kilpailevat heimopäälliköt kyseenalaistavat johtajuutesi.',
    effect: 'Vakautus vaaditaan',
    duration: 1,
    weight: 4,
    choices: [
      { text: 'Osoita voimasi', effect: '-10 miesvoimaa, +10 arvovalta' },
      { text: 'Lahjo päälliköt', effect: '-40 kultaa' },
    ],
  },
];

// Get random event for current game state
export const getRandomEvent = (playerFaction: FactionId, turn: number): ActiveGameEvent => {
  // Weight-based random selection
  const totalWeight = GAME_EVENTS.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;
  
  let selectedEvent = GAME_EVENTS[0];
  for (const event of GAME_EVENTS) {
    random -= event.weight;
    if (random <= 0) {
      selectedEvent = event;
      break;
    }
  }
  
  return {
    event: selectedEvent,
    turnsRemaining: selectedEvent.duration,
    affectedFactions: [playerFaction],
  };
};

interface EventCardProps {
  activeEvent: ActiveGameEvent | null;
  playerFaction: FactionId;
  onResolve: (choiceIndex: number) => void;
  onClose: () => void;
}

export const EventCard = ({ activeEvent, playerFaction, onResolve, onClose }: EventCardProps) => {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  
  if (!activeEvent) return null;
  
  const { event } = activeEvent;
  const theme = EVENT_THEMES[event.type];
  const ThemeIcon = theme.icon;
  
  const handleChoose = (choiceIndex: number) => {
    setSelectedChoice(choiceIndex);
    setIsResolving(true);
    
    // Small delay for animation
    setTimeout(() => {
      onResolve(choiceIndex);
      setIsResolving(false);
      setSelectedChoice(null);
    }, 500);
  };
  
  return (
    <Dialog open={!!activeEvent} onOpenChange={() => !isResolving && onClose()}>
      <DialogContent 
        className={`max-w-lg bg-gradient-to-br ${theme.bgColor} ${theme.borderColor} border-2 text-white overflow-hidden`}
      >
        {/* Sparkle effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-4 animate-pulse">
            <Sparkles className="w-4 h-4 text-white/30" />
          </div>
          <div className="absolute top-8 right-8 animate-pulse" style={{ animationDelay: '0.5s' }}>
            <Sparkles className="w-3 h-3 text-white/20" />
          </div>
          <div className="absolute bottom-12 left-8 animate-pulse" style={{ animationDelay: '1s' }}>
            <Sparkles className="w-5 h-5 text-white/25" />
          </div>
        </div>
        
        <DialogHeader className="relative z-10">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-black/30 border border-white/20">
              <ThemeIcon className="w-10 h-10 text-white/90" />
            </div>
          </div>
          
          <DialogTitle className={`text-2xl text-center ${theme.textColor}`}>
            {event.name}
          </DialogTitle>
          
          <DialogDescription className="text-center text-white/70 text-base mt-2">
            {event.description}
          </DialogDescription>
        </DialogHeader>
        
        {/* Effect preview */}
        <div className="text-center py-2 text-sm text-white/60">
          {event.effect}
        </div>
        
        {/* Choices */}
        <div className="space-y-3 mt-4 relative z-10">
          {event.choices?.map((choice, idx) => (
            <Button
              key={idx}
              onClick={() => handleChoose(idx)}
              disabled={isResolving}
              className={`w-full py-6 text-left justify-start transition-all duration-200 ${
                selectedChoice === idx 
                  ? 'bg-white/30 scale-105' 
                  : 'bg-black/30 hover:bg-black/40'
              }`}
              variant="ghost"
            >
              <div className="flex flex-col items-start gap-1 w-full">
                <span className="font-semibold text-white">{choice.text}</span>
                <span className="text-xs text-white/60">{choice.effect}</span>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
