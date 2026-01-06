import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, ExternalLink, Sparkles } from "lucide-react";

export const DigitalGame = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-amber-950/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Gamepad2 className="w-4 h-4" />
            Digitaalinen versio
          </div>
          <h2 className="text-4xl font-bold text-amber-100 mb-4">
            The Archive Explorer's Gambit
          </h2>
          <p className="text-xl text-amber-200/80 max-w-2xl mx-auto">
            Pelaa digitaalista versiota selaimessasi - Rosebud AI:lla kehitetty interaktiivinen kokemus
          </p>
        </div>

        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-amber-900/40 to-amber-950/60 border-amber-700/50 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
          
          <CardHeader className="relative text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-amber-100">
              🕹️ Rosebud AI Vibe Code Games
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-200">Pelin ominaisuudet</h3>
                <ul className="space-y-2 text-amber-100/80">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">▸</span>
                    Interaktiivinen seikkailupeli
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">▸</span>
                    Mongolien valtakunnan teema
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">▸</span>
                    Pelattavissa suoraan selaimessa
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">▸</span>
                    Ilmainen kokemus
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-200">Teknologia</h3>
                <ul className="space-y-2 text-amber-100/80">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">▸</span>
                    Kehitetty Rosebud AI:lla
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">▸</span>
                    Vibe Code -pelinkehitys
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">▸</span>
                    Moderni web-teknologia
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">▸</span>
                    Mobiiliystävällinen
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-amber-700/30">
              <a 
                href="https://rosebud.ai/p/efffa4fe-b6cd-4a1a-b9ac-473fb00e2090" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-lg py-6 shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/40 hover:scale-[1.02]"
                >
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Pelaa nyt
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <p className="text-center text-amber-200/60 text-sm mt-3">
                Avautuu uuteen välilehteen Rosebud AI -sivustolle
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
