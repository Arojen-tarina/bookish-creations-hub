import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { BookOpen, ArrowLeft, Play } from 'lucide-react';

const Ohjekirja = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-amber-200">Ohjekirja</h1>
            <p className="mt-2 text-slate-400">Tässä kerrotaan pelin kulusta, käyttöliittymästä ja pelivinkeistä. Tämä sivu on koko ohjekirjan verkkoversio.</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link to="/" className="inline-flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4" /> Palaa peliin
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              Tulosta koko ohjekirja
            </Button>
          </div>
        </div>

        <Card className="bg-slate-900/90 border border-amber-700/30 shadow-2xl">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center gap-3 text-amber-200">
              <BookOpen className="w-6 h-6" />
              <h2 className="text-2xl font-semibold">Ohjekirja</h2>
            </div>

            <div className="space-y-5 text-slate-300">
              <section id="video" className="rounded-3xl border border-amber-700/30 bg-slate-900/90 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-amber-100">Yhden vuoron videokatsaus</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      Tiivis opas näyttää yhden vuoron kulun vaihe vaiheelta. Käytä tätä täydennyksenä ohjekirjalle, kun haluat nopeasti ymmärtää vuorojen rytmin.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => window.print()}>
                    Tulosta koko ohjekirja
                  </Button>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-3xl border border-slate-700/40 bg-slate-950/80 p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                        <Play className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.12em] text-slate-400">Videokatsaus</p>
                        <h4 className="text-lg font-semibold text-amber-100">Yhden vuoron kulku</h4>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-700/30 bg-slate-900/80 p-5 text-slate-300">
                      <p className="text-sm leading-relaxed">
                        Kuvittele nopea video, jossa vuoro tehdään näin:
                      </p>
                      <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-slate-300">
                        <li><strong>Resurssit:</strong> kerätään kulta ja joukot aluista.</li>
                        <li><strong>Kortit:</strong> nostetaan kortti ja pelataan vahvistus.</li>
                        <li><strong>Liikkeet:</strong> siirretään joukot strategisesti kartalla.</li>
                        <li><strong>Taistelu:</strong> hyökätään vahvimpiin kohteisiin.</li>
                        <li><strong>Rakentaminen:</strong> parannetaan merkittäviä tukikohtia.</li>
                        <li><strong>Vuoron lopetus:</strong> vahvistetaan asetelma ja katsotaan AI-vastustajan reaktio.
                        </li>
                      </ol>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-700/40 bg-slate-950/80 p-4">
                    <div className="aspect-[16/9] overflow-hidden rounded-3xl bg-slate-900/90 shadow-inner">
                      <div className="relative h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(248,211,113,0.15),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_30%)]">
                        <div className="absolute inset-0 flex flex-col justify-center items-center gap-4 p-4 text-slate-300">
                          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                            <Play className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm uppercase text-slate-500">Simuloitu video</p>
                            <p className="mt-2 text-base font-semibold text-slate-100">1 vuoro pelissä</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-slate-400">
                      Tämä osio täydentää ohjekirjaa tiiviillä yhteenvedolla yhdestä vuorosta. Se auttaa hahmottamaan pelin rytmin nopeasti ilman tarvetta lukea kaikkea kerralla.
                    </p>
                  </div>
                </div>
              </section>

              <p>
                Tämä ohjekirja kattaa sekä digitaalisen pelin että lautapelin. Käytä samaa perustasoa molemmissa, ja huomioi
                pelitilan erikoispiirteet: verkkopeleissä käyttöliittymä pitää huolta laskuista, lautapelissä kaikki päätökset tehdään käsin.
              </p>

              <div className="grid gap-4 xl:grid-cols-2">
                <section id="digipeli" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-5">
                  <h3 className="text-xl font-semibold text-amber-100">Verkkopelin ohjeet</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Peli etenee kuuden vaiheen läpi. Seuraa käyttöliittymän neuvoja ja hyödynnä karttaa, kortteja sekä resurssien hallintaa.
                  </p>

                  <div className="mt-4 space-y-3">
                    {[
                      { title: 'Resurssit', desc: 'Kerää kullat, väkiluvun ja hevosten tuotot hallitsemiltasi provinsseilta. Nämä näkyvät käyttöliittymässäsi.' },
                      { title: 'Kortit', desc: 'Nosta kortti ja pelaa se oikeaan aikaan. Kortit antavat välittömiä bonuksia liikkeeseen, taisteluun tai rakentamiseen.' },
                      { title: 'Liikuta', desc: 'Valitse omasta provinssistasi armeija ja siirrä se viereiseen ruutuun. Vihollisten alueelle hyökätessä käynnistyy taistelu.' },
                      { title: 'Taistelu', desc: 'Pelin automatiikka käyttää noppia ja joukkojen vahvuuksia. Suunnittele etukäteen, koska hyökkäät ja mitä yksikköjä käytät.' },
                      { title: 'Rakenna', desc: 'Rakennukset tuovat pysyviä etuja. Linnoitukset parantavat puolustusta, markkinat kasvattavat tuloja ja leirit nopeuttavat joukkojen siirtoa.' },
                      { title: 'Lopeta vuoro', desc: 'Vahvista päätöksesi ja anna tekoälyn vastustajien toimia. Uusi kierros alkaa automaattisesti.' },
                    ].map((item) => (
                      <div key={item.title} className="rounded-2xl border border-slate-700/40 bg-slate-950/90 p-4">
                        <h4 className="font-semibold text-amber-100">{item.title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-slate-300">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-amber-700/20 bg-amber-950/10 p-4">
                    <h4 className="text-base font-semibold text-amber-100">Tärkeitä muistettavia</h4>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                      <li>Seuraa talouttasi: yksiköt ja rakennukset kuluttavat resursseja jokaisella vuorolla.</li>
                      <li>Käytä kortteja taktisesti: ne voivat kääntää taistelun tai antaa nopean edun rakentamisessa.</li>
                      <li>Pidä huoli linnoituksista, jos odotat hyökkäystä.</li>
                    </ul>
                  </div>
                </section>

                <section id="lautapeli" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-5">
                  <h3 className="text-xl font-semibold text-amber-100">Lautapelin ohjeet</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Lautapelissä pelilaudalla oleva kartta, kortit ja noppatulen tulokset ohjaavat etenemistä. Tämä osio kertoo valmistelusta ja keskeisistä säännöistä.
                  </p>

                  <div className="mt-4 space-y-3">
                    {[
                      { title: 'Valmistelu', desc: 'Aseta pelilauta pöydälle, jaettavat kortit, noppapakka ja resurssimerkit pelaajille. Jokainen valitsee valtakunnan ja ottaa aloitusresurssit.' },
                      { title: 'Vuoron kulku', desc: 'Pelaajalla on kuusi vaihetta. Tee ne järjestyksessä: resurssit, kortit, liikkeet, taistelut, rakentaminen ja vuoron lopetus.' },
                      { title: 'Resurssien kerääminen', desc: 'Laske kulta ja joukot omilta hallitsemiltasi provinsseilta. Käytä markkereita pitämään kirjaa taloudesta ja väestöstä.' },
                      { title: 'Korttien käyttö', desc: 'Nosta kortti pakasta. Pelaa kortteja antamaan etuja liikkeeseen, puolustukseen tai rakentamiseen.' },
                      { title: 'Liikkeet ja taistelut', desc: 'Liikuta joukkoja ääneen sovittuja siirtoja seuraamalla. Hyökkäystilanteissa ratkaise taistelu nopilla ja muista huomioida vahvuusetusi.' },
                      { title: 'Rakentaminen', desc: 'Rakennukset antavat pysyviä etuja. Laadi rakentamissuunnitelma, jotta alueesi tuotot ja puolustus paranevat.' },
                    ].map((item) => (
                      <div key={item.title} className="rounded-2xl border border-slate-700/40 bg-slate-950/90 p-4">
                        <h4 className="font-semibold text-amber-100">{item.title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-slate-300">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-amber-700/20 bg-blue-950/10 p-4">
                    <h4 className="text-base font-semibold text-amber-100">Lautapelin erinomaista</h4>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                      <li>Sovi selkeästi siirroista ja taistelun tuloksista muiden pelaajien kanssa.</li>
                      <li>Kirjaa ylös resurssien muutokset jokaisen vuoron jälkeen.</li>
                      <li>Lautapelin taistelut vaativat sopivaa noppalukua ja vahvuusarviointia.</li>
                    </ul>
                  </div>
                </section>
              </div>

              <div className="rounded-2xl border border-amber-700/20 bg-amber-950/10 p-5">
                <h3 className="text-lg font-semibold text-amber-100">Yhteisiä perusperiaatteita</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                  <li>Hallinta perustuu alueiden hallintaan, resurssien tuotantoon ja vahvojen joukkojen ylläpitoon.</li>
                  <li>Rakennukset, kortit ja liikkeet luovat syvemmän strategian kuin suora taistelu.</li>
                  <li>Hyvä palvelu parantaa pitkän aikavälin voiton mahdollisuuksia: suunnittele sekä puolustusta että laajentumista.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Ohjekirja;
