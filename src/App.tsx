/**
 * App.tsx — Sovelluksen juurikomponentti
 * 
 * Pelkkä digitaalinen strategiapeli.
 */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Digipeli from "./pages/Digipeli";
import Ohjekirja from "./pages/Ohjekirja";
import Shop from "./pages/Shop";
import { HouseAd } from "@/components/ui/HouseAd.tsx";
import { GoogleAdSense } from "@/components/ui/AdSense.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 pointer-events-auto flex justify-center">
        <div className="max-w-6xl w-full px-4 space-y-3">
          <GoogleAdSense
            clientId="ca-pub-0000000000000000"
            slotId="1234567890"
            className="mx-auto block"
            style={{ minHeight: 90 }}
          />
          <HouseAd slot="global_bottom" variant="banner" className="w-full" />
        </div>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Digipeli />} />
          <Route path="/ohjekirja" element={<Ohjekirja />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/digipeli" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
  </QueryClientProvider>
);

export default App;
