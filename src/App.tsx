import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Romaani from "./pages/Romaani";
import Projektisuunnitelma from "./pages/Projektisuunnitelma";
import Lautapeli from "./pages/Lautapeli";
import Digipeli from "./pages/Digipeli";
import LukuOsa1 from "./pages/LukuOsa1";
import LukuOsa2 from "./pages/LukuOsa2";
import LukuOsa3 from "./pages/LukuOsa3";
import KokoKirja from "./pages/KokoKirja";
import OtaYhteytta from "./pages/OtaYhteytta";
import PrintableMaterials from "./pages/PrintableMaterials";
import PelinEsittely from "./pages/PelinEsittely";
import KortitPDF from "./pages/KortitPDF";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/romaani" element={<Romaani />} />
          <Route path="/suunnitelma" element={<Projektisuunnitelma />} />
          <Route path="/lautapeli" element={<Lautapeli />} />
          <Route path="/digipeli" element={<Digipeli />} />
          <Route path="/ota-yhteytta" element={<OtaYhteytta />} />
          <Route path="/liiketoiminta" element={<Projektisuunnitelma />} />
          <Route path="/luku/osa-1" element={<LukuOsa1 />} />
          <Route path="/luku/osa-2" element={<LukuOsa2 />} />
          <Route path="/luku/osa-3" element={<LukuOsa3 />} />
          <Route path="/luku/koko-kirja" element={<KokoKirja />} />
          <Route path="/tulosta" element={<PrintableMaterials />} />
          <Route path="/esittely" element={<PelinEsittely />} />
          <Route path="/kortit-pdf" element={<KortitPDF />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
