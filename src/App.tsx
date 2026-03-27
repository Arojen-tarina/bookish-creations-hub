/**
 * App.tsx — Sovelluksen juurikomponentti
 * 
 * Pelkkä digitaalinen strategiapeli.
 */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Digipeli from "./pages/Digipeli";
import Ohjekirja from "./pages/Ohjekirja";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Digipeli />} />
          <Route path="/digipeli" element={<Navigate to="/" replace />} />
          <Route path="/ohjekirja" element={<Ohjekirja />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
