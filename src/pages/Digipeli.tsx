/**
 * Digipeli.tsx — Digitaalisen pelin pääsivu
 * 
 * Renderöi ProvinceGame-komponentin, joka sisältää koko digitaalisen
 * strategiapelin: kartan, HUD:n, taistelut, diplomatian ja tekoälyn.
 */
import { ProvinceGame } from "@/game/ProvinceGame.tsx";

const Digipeli = () => {
  return <ProvinceGame />;
};

export default Digipeli;
