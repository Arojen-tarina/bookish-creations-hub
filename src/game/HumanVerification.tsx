import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';

interface HumanVerificationProps {
  onVerified: () => void;
}

export const HumanVerification = ({ onVerified }: HumanVerificationProps) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  const challenge = useMemo(() => {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    return { a, b, correct: a + b };
  }, []);

  const handleSubmit = () => {
    if (parseInt(answer, 10) === challenge.correct) {
      onVerified();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-slate-900/95 border border-amber-700/40 shadow-2xl">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-semibold text-amber-200">Oletko ihminen?</h2>
            <Badge variant="secondary">Vahvistus</Badge>
          </div>

          <p className="text-sm text-slate-300">
            Vastaa seuraavaan laskutehtävään ennen kuin voit aloittaa pelin.
          </p>

          <div className="rounded-2xl border border-amber-700/30 bg-slate-950/80 p-5 text-center">
            <p className="text-2xl font-bold text-amber-100">
              {challenge.a} + {challenge.b} = ?
            </p>
          </div>

          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Kirjoita vastaus"
            className="w-full rounded-xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />

          {error && (
            <p className="text-sm text-red-400">Väärä vastaus, yritä uudelleen.</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="w-full"
          >
            Vahvista
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
