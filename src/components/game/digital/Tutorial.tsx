// Tutorial Component - Interactive game tutorial
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  X,
  Map,
  Sword,
  Handshake,
  Coins,
  Users,
  Crown,
  ChevronRight,
  Target,
  Shield,
  Clock,
  Trophy,
  HelpCircle,
  MousePointer,
  Keyboard,
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Map;
  tips: string[];
  highlight?: string; // Element ID to highlight
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Tervetuloa Mongolien Valtakuntaan!',
    description: 'Tämä tutoriaali opettaa sinulle pelin perusteet. Olet Temüjin, tuleva Tšingis-kaani, ja tavoitteenasi on yhdistää heimot ja luoda maailman suurin imperiumi.',
    icon: Crown,
    tips: [
      'Peli alkaa vuodesta 1206',
      'Valitse heimosi aluksi',
      'Tavoitteena on vallata tarpeeksi provinsseja voittoon',
    ],
  },
  {
    id: 'map',
    title: 'Kartta ja provinssit',
    description: 'Kartta näyttää Euraasian provinssit. Jokaisella provinssilla on erilaisia ominaisuuksia kuten verotulo, miesvoima ja maasto.',
    icon: Map,
    tips: [
      'Klikkaa provinssia nähdäksesi sen tiedot',
      'Hiiren rullalla voit zoomata karttaa',
      'Vedä karttaa hiirellä panoroidaksesi',
      'Omat provinssisi näkyvät heimosi värillä',
    ],
    highlight: 'map-container',
  },
  {
    id: 'resources',
    title: 'Resurssit',
    description: 'Sinulla on kolme pääresurssia: kultaa, miesvoimaa ja hevosia. Näitä tarvitset armeijoiden rakentamiseen ja ylläpitoon.',
    icon: Coins,
    tips: [
      '💰 Kulta - maksetaan armeijat ja rakennukset',
      '👥 Miesvoima - tarvitaan uusien armeijoiden värväykseen',
      '🐴 Hevoset - ratsuväki tarvitsee hevosia',
      'Resurssit kerätään vuoron lopussa provinsseilta',
    ],
  },
  {
    id: 'armies',
    title: 'Armeijat ja sotiminen',
    description: 'Armeijat ovat valloituksen avain. Voit siirtää armeijoita naapuriprovinsseihin ja hyökätä vihollisen alueille.',
    icon: Sword,
    tips: [
      'Valitse armeija klikkaamalla sitä',
      'Vihreät korostetut provinssit näyttävät minne voit liikkua',
      'Ratsuväki on tehokkaampi kuin jalkaväki',
      'Taistelun tulos riippuu armeijan koosta ja maaston eduista',
    ],
    highlight: 'army-panel',
  },
  {
    id: 'phases',
    title: 'Vuoron vaiheet',
    description: 'Jokainen vuoro koostuu viidestä vaiheesta. Käy ne järjestyksessä läpi painamalla "Seuraava"-nappia.',
    icon: Clock,
    tips: [
      '📋 Suunnittelu - tarkastele tilannetta',
      '⚔️ Sotilaalliset - liikuta armeijoita ja hyökkää',
      '🤝 Diplomatia - solmi sopimuksia',
      '💰 Talous - resurssit kerätään',
      '✨ Tapahtumat - satunnaiset tapahtumat',
    ],
  },
  {
    id: 'diplomacy',
    title: 'Diplomatia',
    description: 'Et ole yksin maailmassa. Muut heimot ja valtakunnat voivat olla liittolaisia tai vihollisia. Käytä diplomatiaa viisaasti.',
    icon: Handshake,
    tips: [
      'Hyökkäämättömyyssopimus suojaa selustasi',
      'Kauppasopimus tuo lisätuloja',
      'Liitto tarkoittaa yhteistä puolustusta',
      'Varo sopimuksen rikkomista - se tuhoaa luottamuksen',
    ],
  },
  {
    id: 'victory',
    title: 'Voitto',
    description: 'Voittaaksesi pelin sinun on vallattava tietty määrä provinsseja. Mitä isompi valtakunta, sitä lähempänä voitto!',
    icon: Trophy,
    tips: [
      'Tavoitteena on vallata 30+ provinssia',
      'Vahvat liittolaiset auttavat selviämään',
      'Taloudellinen vahvuus mahdollistaa isot armeijat',
      'Älä laajene liian nopeasti - hallitse valloituksiasi',
    ],
  },
  {
    id: 'controls',
    title: 'Näppäimet ja ohjaus',
    description: 'Muista nämä hyödylliset ohjeet pelatessasi.',
    icon: Keyboard,
    tips: [
      'Hiiren rulla = zoom karttaa',
      'Vedä karttaa = panoroi',
      'Klikkaa provinssia = valitse',
      'Klikkaa armeijaa = valitse liikutettavaksi',
      'Seuraava-nappi = etene vaiheessa',
    ],
  },
];

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const Tutorial = ({ isOpen, onClose, onComplete }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;
  const StepIcon = step.icon;
  
  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setHasCompleted(true);
      onComplete();
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSkip = () => {
    onClose();
  };
  
  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setHasCompleted(false);
    }
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={() => !hasCompleted && onClose()}>
      <DialogContent className="max-w-xl bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 border-amber-700/50 text-white overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1">
          <Progress value={progress} className="h-full rounded-none bg-slate-800" />
        </div>
        
        <DialogHeader className="pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-200/60 uppercase tracking-wider">
              Tutoriaali {currentStep + 1}/{TUTORIAL_STEPS.length}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip}
              className="text-amber-200/50 hover:text-amber-200 -mr-2"
            >
              Ohita <X className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="flex justify-center py-4">
            <div className="p-4 rounded-xl bg-amber-900/30 border border-amber-700/30">
              <StepIcon className="w-12 h-12 text-amber-400" />
            </div>
          </div>
          
          <DialogTitle className="text-2xl text-center text-amber-100">
            {step.title}
          </DialogTitle>
          
          <DialogDescription className="text-center text-amber-200/70 text-base">
            {step.description}
          </DialogDescription>
        </DialogHeader>
        
        {/* Tips */}
        <div className="space-y-2 my-4">
          {step.tips.map((tip, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-3 animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-amber-100/90 text-sm">{tip}</span>
            </div>
          ))}
        </div>
        
        {/* Navigation buttons */}
        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1 border-amber-700/50 text-amber-200 hover:bg-amber-900/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Edellinen
          </Button>
          
          <Button
            onClick={handleNext}
            className="flex-1 bg-amber-600 hover:bg-amber-500"
          >
            {currentStep === TUTORIAL_STEPS.length - 1 ? (
              <>
                Aloita peli
                <Trophy className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Seuraava
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
        
        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 pt-4">
          {TUTORIAL_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                idx === currentStep 
                  ? 'bg-amber-400 scale-125' 
                  : idx < currentStep
                    ? 'bg-amber-600'
                    : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Floating help button component
export const TutorialButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="outline"
    size="icon"
    onClick={onClick}
    className="fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full bg-amber-900/80 border-amber-600/50 text-amber-200 hover:bg-amber-800 shadow-lg"
    title="Näytä tutoriaali"
  >
    <HelpCircle className="w-6 h-6" />
  </Button>
);
