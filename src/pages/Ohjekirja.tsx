import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { BookOpen, ArrowLeft } from 'lucide-react';

const Ohjekirja = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-amber-200">Ohjekirja</h1>
            <p className="mt-2 text-slate-400">Tässä kerrotaan pelin kulusta, käyttöliittymästä ja pelivinkeistä.</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4" /> Palaa peliin
            </Button>
          </Link>
        </div>

        <Card className="bg-slate-900/90 border border-amber-700/30 shadow-2xl">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center gap-3 text-amber-200">
              <BookOpen className="w-6 h-6" />
              <h2 className="text-2xl font-semibold">Näin pelaat</h2>
            </div>

            <div className="space-y-5 text-slate-300">
              <p>
                Peli kulkee kuuden vaiheen kautta: resurssit, kortit, liike, taistelu, rakentaminen ja vuoron lopetus.
                Jokaisessa vaiheessa tehtävät valinnat vaikuttavat armeijasi vahvuuteen, talouteen ja alueiden hallintaan.
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { title: 'Resurssit', desc: 'Kerää automaattisesti kulta ja miehitykseen tarvittavat resurssit hallitsemiltasi alueilta.' },
                  { title: 'Kortit', desc: 'Nosta kortti pakasta ja pelaa kortteja kädestäsi saadaksesi etuja taisteluun, rakentamiseen tai liikuttamiseen.' },
                  { title: 'Liikuta', desc: 'Valitse armeija ja siirrä se viereiseen provinsseihin. Vain kelvollisiin kohteisiin voi siirtyä.' },
                  { title: 'Taistelu', desc: 'Hyökkäät vihollisen alueelle ja taistelu ratkaistaan noppien ja joukkojesi avulla.' },
                  { title: 'Rakenna', desc: 'Rakennukset kuten leiri, markkina tai linnoitus antavat etuja omille provinsseille.' },
                  { title: 'Lopeta vuoro', desc: 'Lopeta vuoro ja anna tekoälyn vastustajien pelata. Uusi vuoro alkaa seuraavalla kierroksella.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-700/50 bg-slate-950/80 p-4">
                    <h3 className="font-semibold text-amber-100">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-amber-700/20 bg-amber-950/10 p-5">
                <h3 className="text-lg font-semibold text-amber-100">Pelistrategia</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                  <li>Suosi vahvoja aloja ja varmista, että resurssit riittävät armeijoiden ylläpitoon.</li>
                  <li>Rakennusten valinta vaikuttaa pitkän aikavälin kasvuun ja puolustukseen.</li>
                  <li>Muista seurata vastustajien liikkeitä ja hyökätä oikeaan aikaan.</li>
                </ul>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-amber-700/20 bg-slate-950/80 p-4">
                  <p className="text-sm text-amber-100">Provinsseja</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-100">30</p>
                </div>
                <div className="rounded-2xl border border-amber-700/20 bg-slate-950/80 p-4">
                  <p className="text-sm text-amber-100">Peli alkaa</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-100">1206</p>
                </div>
                <div className="rounded-2xl border border-amber-700/20 bg-slate-950/80 p-4">
                  <p className="text-sm text-amber-100">Tavoite</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-100">Hallinta ja resurssit</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Ohjekirja;
