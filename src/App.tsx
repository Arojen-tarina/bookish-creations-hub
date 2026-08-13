/**
 * App.tsx — Sovelluksen juurikomponentti
 * 
 * Pelkkä digitaalinen strategiapeli.
 */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";

// Single-file/offline build or file:// loading: use hash routing so the app
// works from file:// too; otherwise normal history routing with base path.
const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';
const useHashRouter = import.meta.env.VITE_SINGLEFILE || isFileProtocol;
const AppRouter: typeof BrowserRouter = useHashRouter ? (HashRouter as typeof BrowserRouter) : BrowserRouter;
// BASE_URL is "./" for local/Capacitor builds, which isn't a valid basename
// (must start with "/"); only use it when it's an actual absolute base path.
const rawBase = import.meta.env.BASE_URL;
const basename = rawBase.startsWith("/") ? rawBase.replace(/\/$/, "") || "/" : "/";
const appRouterProps = useHashRouter ? {} : { basename };
import Digipeli from "./pages/Digipeli";
import Ohjekirja from "./pages/Ohjekirja";
import Codex from "./pages/Codex";
import Shop from "./pages/Shop";
import { AdMobBanner } from "@/components/ui/AdMobBanner.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 pointer-events-auto flex justify-center">
        <div className="max-w-6xl w-full px-4">
          <AdMobBanner className="w-full" />
        </div>
      </div>
      <AppRouter {...appRouterProps}>
        <Routes>
          <Route path="/" element={<Digipeli />} />
          <Route path="/ohjekirja" element={<Ohjekirja />} />
          <Route path="/codex" element={<Codex />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/digipeli" element={<Navigate to="/" replace />} />
        </Routes>
      </AppRouter>
  </QueryClientProvider>
);

export default App;
