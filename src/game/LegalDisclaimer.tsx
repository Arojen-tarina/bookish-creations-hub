import { useState } from 'react';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';

interface LegalDisclaimerProps {
  onAccept: (signature: string) => void;
  onShowPrivacy: () => void;
}

export const LegalDisclaimer = ({ onAccept, onShowPrivacy }: LegalDisclaimerProps) => {
  const [signature, setSignature] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const canAccept = confirmed && signature.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl">
        <Card className="bg-slate-900/95 border border-amber-700/40 shadow-2xl">
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-amber-200">Ennen pelaamista</h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Tämä peli edellyttää, että hyväksyt vastuuvapauslausekkeen ennen kuin aloitat. Lue teksti huolellisesti ja allekirjoita hyväksymällä.
                </p>
              </div>
              <Badge variant="secondary" className="self-start">Vastuuvapaus</Badge>
            </div>

            <div className="space-y-4 rounded-2xl border border-amber-700/30 bg-slate-950/80 p-5 text-sm text-slate-200">
              <p className="font-medium text-amber-100">Hyväksyn seuraavat ehdot:</p>
              <ul className="list-disc space-y-2 pl-5 text-slate-300">
                <li>Peli on viihdettä. En vaadi korvauksia peliin liittyvistä häiriöistä, tietojen katoamisesta tai laitteistovioista.</li>
                <li>En ole alle 13-vuotias, tai minulla on huoltajan suostumus pelin käyttämiseen.</li>
                <li>Ymmärrän, että pelin tulokset eivät ole takuu ja että kehittäjä ei ole vastuussa päätöksistäni pelissä.</li>
                <li>Peli ja sen sisältö ovat tekijänoikeudella suojattuja. Käyttö tapahtuu omalla vastuulla.</li>
                <li>Olen lukenut tiedot tekoälyn käytöstä ja tietosuojasta ennen pelaamista.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-200">Allekirjoitus</label>
              <input
                type="text"
                value={signature}
                onChange={(event) => setSignature(event.target.value)}
                placeholder="Kirjoita koko nimesi tai HYVÄKSYN"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              <label className="inline-flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                <span>Hyväksyn vastuuvapauslausekkeen ja pelin käyttöehdot.</span>
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button variant="secondary" onClick={onShowPrivacy} className="w-full sm:w-auto">
                Tekoälyn käyttö ja tietosuoja
              </Button>
              <Button
                disabled={!canAccept}
                onClick={() => onAccept(signature.trim())}
                className="w-full sm:w-auto"
              >
                Hyväksyn ja aloitan pelin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
