import { Card, CardContent } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useLanguage, getContentLanguage } from '@/lib/i18n.tsx';

interface AIPrivacyNoticeProps {
  onClose: () => void;
}

const TEXT = {
  fi: {
    title: 'Tekoälyn käyttö ja tietosuoja',
    intro: 'Tämä sivu selittää, miten tekoälyä käytetään pelissä ja miten pelin tietoja käsitellään.',
    close: 'Sulje',
    aiTitle: 'Tekoälyn käyttö pelissä',
    ai: 'Peli käyttää tekoälyä ainoastaan pelikokemuksen rikastamiseen: vihollisten päätöksentekoon, pelinsisäiseen toimintaan ja pelin dynaamiseen tasapainottamiseen. Tekoäly ei analysoi henkilökohtaisia tietojasi eikä sitä käytetä markkinointiin tai profilointiin.',
    privacyTitle: 'Tietosuoja',
    privacy1: 'Tämä sovellus säilyttää pelin tiedot pääasiassa paikallisesti laitteessasi selaimen tallennustilassa. Emme kerää tai lähetä henkilötietoja ulkopuolisille palveluille ilman nimenomaista suostumustasi.',
    privacy2: 'Pelin asetukset ja eteneminen voi tallentua paikallisesti, mutta henkilökohtaisia tunnistetietoja ei liitetä tähän tietoon. Jos sovellus tarjoaa tulevaisuudessa lisäpalveluita, niistä ilmoitetaan erikseen.',
    dutiesTitle: 'Käyttäjän vastuut',
    duties: [
      'Älä anna pelin kautta arkaluonteisia henkilökohtaisia tietoja.',
      'Pidä selain päivitettynä ja käytä turvallista yhteyttä.',
      'Olet itse vastuussa pelin käytöstä ja kaikista laitteellesi syntyvistä muutoksista.',
    ],
  },
  en: {
    title: 'AI use and privacy',
    intro: 'This page explains how AI is used in the game and how game data is handled.',
    close: 'Close',
    aiTitle: 'AI use in the game',
    ai: 'The game uses AI only to enrich the game experience: enemy decision-making, in-game actions and dynamic balancing. The AI does not analyse your personal data and is not used for marketing or profiling.',
    privacyTitle: 'Privacy',
    privacy1: 'This app stores game data mainly locally on your device, in the browser storage. We do not collect or send personal data to external services without your explicit consent.',
    privacy2: 'Game settings and progress may be saved locally, but no personal identifiers are attached to this data. If the app offers additional services in the future, they will be announced separately.',
    dutiesTitle: 'User responsibilities',
    duties: [
      'Do not enter sensitive personal information through the game.',
      'Keep your browser up to date and use a secure connection.',
      'You are responsible for your use of the game and any changes made to your device.',
    ],
  },
} as const;

export const AIPrivacyNotice = ({ onClose }: AIPrivacyNoticeProps) => {
  const { lang } = useLanguage();
  const c = TEXT[getContentLanguage(lang)];
  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/95 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl">
        <Card className="max-h-[100dvh] border border-amber-700/40 bg-slate-900/95 shadow-2xl">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-amber-200">{c.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{c.intro}</p>
              </div>
              <Button variant="secondary" onClick={onClose}>{c.close}</Button>
            </div>

            <div className="space-y-4 text-sm text-slate-200">
              <div>
                <p className="font-medium text-amber-100">{c.aiTitle}</p>
                <p className="mt-2 text-slate-300">{c.ai}</p>
              </div>

              <div>
                <p className="font-medium text-amber-100">{c.privacyTitle}</p>
                <p className="mt-2 text-slate-300">{c.privacy1}</p>
                <p className="mt-2 text-slate-300">{c.privacy2}</p>
              </div>

              <div>
                <p className="font-medium text-amber-100">{c.dutiesTitle}</p>
                <ul className="list-disc space-y-2 pl-5 text-slate-300">
                  {c.duties.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
