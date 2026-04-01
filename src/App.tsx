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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Digipeli />} />
          <Route path="/ohjekirja" element={<Ohjekirja />} />
          <Route path="/digipeli" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
  </QueryClientProvider>
);

export default App;
