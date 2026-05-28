import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

export const cinzel = loadCinzel("normal", { weights: ["600", "700", "900"] }).fontFamily;
export const inter = loadInter("normal", { weights: ["400", "600", "700"] }).fontFamily;
