import { Card, CardContent } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';

interface AIPrivacyNoticeProps {
  onClose: () => void;
}

export const AIPrivacyNotice = ({ onClose }: AIPrivacyNoticeProps) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl">
        <Card className="border border-amber-700/40 bg-slate-900/95 shadow-2xl">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-amber-200">Tekoälyn käyttö ja tietosuoja</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Tämä sivu selittää, miten tekoälyä käytetään pelissä ja miten pelin tietoja käsitellään.
                </p>
              </div>
              <Button variant="secondary" onClick={onClose}>Sulje</Button>
            </div>

            <div className="space-y-4 text-sm text-slate-200">
              <div>
                <p className="font-medium text-amber-100">Tekoälyn käyttö pelissä</p>
                <p className="mt-2 text-slate-300">
                  Peli käyttää tekoälyä ainoastaan pelikokemuksen rikastamiseen: vihollisten päätöksentekoon, pelinsisäiseen toimintaan ja pelin dynaamiseen tasapainottamiseen. Tekoäly ei analysoi henkilökohtaisia tietojasi eikä sitä käytetä markkinointiin tai profilointiin.
                </p>
              </div>

              <div>
                <p className="font-medium text-amber-100">Tietosuoja</p>
                <p className="mt-2 text-slate-300">
                  Tämä sovellus säilyttää pelin tiedot pääasiassa paikallisesti laitteessasi selaimen tallennustilassa. Emme kerää tai lähetä henkilötietoja ulkopuolisille palveluille ilman nimenomaista suostumustasi.
                </p>
                <p className="mt-2 text-slate-300">
                  Pelin asetukset ja eteneminen voi tallentua paikallisesti, mutta henkilökohtaisia tunnistetietoja ei liitetä tähän tietoon. Jos sovellus tarjoaa tulevaisuudessa lisäpalveluita, niistä ilmoitetaan erikseen.
                </p>
              </div>

              <div>
                <p className="font-medium text-amber-100">Käyttäjän vastuut</p>
                <ul className="list-disc space-y-2 pl-5 text-slate-300">
                  <li>Älä anna pelin kautta arkaluonteisia henkilökohtaisia tietoja.</li>
                  <li>Pidä selain päivitettynä ja käytä turvallista yhteyttä.</li>
                  <li>Olet itse vastuussa pelin käytöstä ja kaikista laitteellesi syntyvistä muutoksista.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
