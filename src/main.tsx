/**
 * main.tsx — Sovelluksen käynnistyspiste
 *
 * Liittää React-sovelluksen DOM:iin (root-elementti)
 * ja lataa globaalit CSS-tyylit (index.css).
 */
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
