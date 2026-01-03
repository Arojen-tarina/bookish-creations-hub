import { Layout } from "@/components/Layout";
import { ComicPanel } from "@/components/ComicPanel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Suunnitelma = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Romaanin Suunnitelma
            </h1>
            <p className="text-xl text-muted-foreground">
              Rakenteen ja taiteen yhdistelmä — dokumentoitu suunnitelma trilogialle.
            </p>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold mb-8">Visio ja Teemat</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <ComicPanel variant="primary">
                <h3 className="font-display text-lg font-semibold mb-3">
                  Trilogian Päävaiheet
                </h3>
                <p className="text-muted-foreground text-sm">
                  Romaanin visio rakentuu kolmesta vaiheesta: yhdistyminen, valloitus
                  ja koettelemus, jotka muodostavat eheän kokonaisuuden.
                </p>
              </ComicPanel>

              <ComicPanel variant="accent">
                <h3 className="font-display text-lg font-semibold mb-3">
                  Tyylilaji
                </h3>
                <p className="text-muted-foreground text-sm">
                  Historiallis-fantastinen eeppinen draama yhdistää sotaretket ja
                  mytologian rakenteellisesti läpinäkyväksi tarinaksi.
                </p>
              </ComicPanel>
            </div>

            <h3 className="font-display text-2xl font-bold mb-6">Keskeiset Teemat</h3>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="kunnia" className="border-2 border-border rounded-sm px-4">
                <AccordionTrigger className="font-display">Kunnia & Resilienssi</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Teemat käsittelevät soturin kunniakoodia ja kykyä kestää vastoinkäymisiä.
                  Paimentolaiskulttuurissa kunnia on keskeisin arvo.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="rakkaus" className="border-2 border-border rounded-sm px-4">
                <AccordionTrigger className="font-display">Kielletty Rakkaus</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Rakkaus, joka ylittää heimojen rajat ja kyseenalaistaa perinteiset
                  normit. Tunteiden ja velvollisuuden välinen konflikti.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="meritokratia" className="border-2 border-border rounded-sm px-4">
                <AccordionTrigger className="font-display">Meritokratia</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yhteiskunta, jossa asema ansaitaan teoilla, ei syntymällä.
                  Tämä luo mahdollisuuksia mutta myös jännitteitä.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="trauma" className="border-2 border-border rounded-sm px-4">
                <AccordionTrigger className="font-display">Trauman Käsittely</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sodan ja menetyksen jälkeiset haavat. Kuinka hahmot käsittelevät
                  kokemuksiaan ja löytävät tien eteenpäin.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* World Building */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-12">
              Maailma ja Yhteiskunta
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <ComicPanel>
                <h3 className="font-display text-lg font-semibold mb-3">
                  Paimentolaiskulttuuri
                </h3>
                <p className="text-muted-foreground text-sm">
                  Arojen paimentolaiskulttuuri korostaa ratsuväkeä ja karjanhoitoa
                  yhteiskunnan keskeisinä toimintoina.
                </p>
              </ComicPanel>

              <ComicPanel>
                <h3 className="font-display text-lg font-semibold mb-3">
                  Lainsäädäntö ja Kunnia
                </h3>
                <p className="text-muted-foreground text-sm">
                  Yhteiskunnan tiukka lainsäädäntö painottaa kunniaa ja vastuuta
                  sesonkien rytmissä toimivassa yhteisössä.
                </p>
              </ComicPanel>

              <ComicPanel>
                <h3 className="font-display text-lg font-semibold mb-3">
                  Ulkosuhteet ja Diplomatia
                </h3>
                <p className="text-muted-foreground text-sm">
                  Ryöstöretket, salakaupat ja Silkkitien diplomatia muovaavat
                  maailman ulkosuhteita ja vakoilua.
                </p>
              </ComicPanel>

              <ComicPanel>
                <h3 className="font-display text-lg font-semibold mb-3">
                  Uskonto ja Symboliikka
                </h3>
                <p className="text-muted-foreground text-sm">
                  Shamanismi ja myyttiset eläimet — hirvi, susi, kotka, karhu ja
                  pöllö — ohjaavat kohtaloa.
                </p>
              </ComicPanel>
            </div>
          </div>
        </div>
      </section>

      {/* Mythology */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-12">
              Mytologia
            </h2>

            <div className="space-y-6">
              <ComicPanel variant="primary">
                <h3 className="font-display text-lg font-semibold mb-3">
                  Dengri Hangin ja Luominen
                </h3>
                <p className="text-muted-foreground text-sm">
                  Dengri Hangin, Hirvi, loi maan laulullaan. Tämä on mytologian
                  keskeinen luomiskertomus, joka yhdistää hahmot maahan.
                </p>
              </ComicPanel>

              <ComicPanel variant="accent">
                <h3 className="font-display text-lg font-semibold mb-3">
                  Valon ja Pimeyden Tasapaino
                </h3>
                <p className="text-muted-foreground text-sm">
                  Tasapaino valon ja pimeyden välillä korostaa, että ulkoisesti
                  pimeä voima voi sisältää valoa — ja päinvastoin.
                </p>
              </ComicPanel>

              <ComicPanel>
                <h3 className="font-display text-lg font-semibold mb-3">
                  Shamanistiset Rituaalit
                </h3>
                <p className="text-muted-foreground text-sm">
                  Sanansaattajat, rituaalit ja kurkkulaulu suojelevat ja ohjaavat
                  hahmoja mytologiassa. Shamaanit toimivat siltoina maailmojen välillä.
                </p>
              </ComicPanel>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Suunnitelma;
