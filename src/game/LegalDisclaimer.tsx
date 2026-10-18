import { useState } from 'react';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { useLanguage, getContentLanguage } from '@/lib/i18n.tsx';

const TEXT = {
  fi: {
    title: 'Ennen pelaamista',
    intro: 'Tämä peli edellyttää, että hyväksyt vastuuvapauslausekkeen ennen kuin aloitat. Lue teksti huolellisesti ja allekirjoita hyväksymällä.',
    badge: 'Vastuuvapaus',
    accept: 'Hyväksyn seuraavat ehdot:',
    items: [
      'Peli on viihdettä. En vaadi korvauksia peliin liittyvistä häiriöistä, tietojen katoamisesta tai laitteistovioista.',
      'Olen vähintään 18-vuotias.',
      'Ymmärrän, että pelin tulokset eivät ole takuu ja että kehittäjä ei ole vastuussa päätöksistäni pelissä.',
      'Peli ja sen sisältö ovat tekijänoikeudella suojattuja. Käyttö tapahtuu omalla vastuulla.',
      'Olen lukenut tiedot tekoälyn käytöstä ja tietosuojasta ennen pelaamista.',
    ],
    signature: 'Allekirjoitus',
    word: 'HYVÄKSYN',
    placeholder: 'Kirjoita HYVÄKSYN',
    check: 'Hyväksyn vastuuvapauslausekkeen ja pelin käyttöehdot.',
    privacy: 'Tekoälyn käyttö ja tietosuoja',
    start: 'Hyväksyn ja aloitan pelin',
  },
  en: {
    title: 'Before you play',
    intro: 'You must accept this disclaimer before you start. Please read the text carefully and sign by accepting.',
    badge: 'Disclaimer',
    accept: 'I accept the following terms:',
    items: [
      'The game is entertainment. I make no claims for game-related malfunctions, loss of data or hardware faults.',
      'I am at least 18 years old.',
      'I understand that game outcomes are not guaranteed and that the developer is not responsible for my decisions in the game.',
      'The game and its content are protected by copyright. Use is at my own risk.',
      'I have read the information about AI use and privacy before playing.',
    ],
    signature: 'Signature',
    word: 'I AGREE',
    placeholder: 'Type I AGREE',
    check: 'I accept the disclaimer and the terms of use of the game.',
    privacy: 'AI use and privacy',
    start: 'I accept and start the game',
  },
} as const;

interface LegalDisclaimerProps {
  onAccept: (signature: string) => void;
  onShowPrivacy: () => void;
}

export const LegalDisclaimer = ({ onAccept, onShowPrivacy }: LegalDisclaimerProps) => {
  const { lang } = useLanguage();
  const c = TEXT[getContentLanguage(lang)];
  const [signature, setSignature] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const canAccept = confirmed && signature.trim().toUpperCase() === c.word;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/95 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl">
        <Card className="max-h-[100dvh] bg-slate-900/95 border border-amber-700/40 shadow-2xl">
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-amber-200">{c.title}</h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {c.intro}
                </p>
              </div>
              <Badge variant="secondary" className="self-start">{c.badge}</Badge>
            </div>

            <div className="space-y-4 rounded-2xl border border-amber-700/30 bg-slate-950/80 p-5 text-sm text-slate-200">
              <p className="font-medium text-amber-100">{c.accept}</p>
              <ul className="list-disc space-y-2 pl-5 text-slate-300">
                {c.items.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-200">{c.signature}</label>
              <input
                type="text"
                value={signature}
                onChange={(event) => setSignature(event.target.value)}
                placeholder={c.placeholder}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              <label className="inline-flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                <span>{c.check}</span>
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button variant="secondary" onClick={onShowPrivacy} className="w-full sm:w-auto">
                {c.privacy}
              </Button>
              <Button
                disabled={!canAccept}
                onClick={() => onAccept(signature.trim())}
                className="w-full sm:w-auto"
              >
                {c.start}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
