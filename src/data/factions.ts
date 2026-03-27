/**
 * factions.ts — Heimojen yksityiskohtaiset tiedot
 *
 * Sisältää 4 pelattavan heimon datan:
 * nimi, värit, vahvuudet, heikkoudet, erikoiskyky, alkuasetelma ja pelityyli.
 * Käytetään DetailedFactions-komponentissa.
 */
import { Sword, Shield, Coins, Sparkles, Users, Zap, Crown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FactionStrength {
  icon: LucideIcon;
  text: string;
}

export interface FactionData {
  name: string;
  color: string;
  borderColor: string;
  subtitle: string;
  description: string;
  strengths: FactionStrength[];
  weakness: string;
  specialAbility: {
    name: string;
    description: string;
  };
  startSetup: {
    units: string[];
    resources: string;
    territory: string;
  };
  playstyle: string;
}

export const detailedFactions: FactionData[] = [
  {
    name: "Mongoli-heimo",
    color: "bg-amber-500",
    borderColor: "border-amber-500",
    subtitle: "Stepin Herrat",
    description: "Nopealiikkeinen valloitusvoima, joka hallitsee avointa maastoa ja ratsusotataitoa.",
    strengths: [
      { icon: Zap, text: "Ratsuväki liikkuu +1 alueen pidemmälle" },
      { icon: Sword, text: "+1 hyökkäysbonus avoimessa maastossa" },
      { icon: Shield, text: "Voi vetäytyä taistelusta ilman rangaistusta" },
      { icon: Users, text: "Aloittaa ylimääräisellä ratsuväkiyksiköllä" },
    ],
    weakness: "Heikompi puolustus linnoituksissa ja kaupungeissa (-1 puolustus)",
    specialAbility: {
      name: "Khuriltai-kokous",
      description: "Kerran pelissä voi kutsua kaikki mongoli-yksiköt yhteen alueeseen ilmaiseksi liikkumisena."
    },
    startSetup: {
      units: ["4 ratsuväkiyksikköä", "2 jalkaväkiyksikköä", "1 heimopäällikkö", "2 tiedustelijaa"],
      resources: "8 resurssikorttia (painotus hevosiin)",
      territory: "Mongolian keskustasangot (3 aluetta)"
    },
    playstyle: "Aggressiivinen, nopea laajentuminen, häirintätaktiikat"
  },
  {
    name: "Kiinan Dynastia",
    color: "bg-red-600",
    borderColor: "border-red-600",
    subtitle: "Lohikäärmeen Valtakunta",
    description: "Puolustuksellinen supervalta, joka luottaa linnoituksiin, teknologiaan ja taloudelliseen voimaan.",
    strengths: [
      { icon: Shield, text: "+2 puolustus linnoitetuissa kaupungeissa" },
      { icon: Sparkles, text: "Aloittaa yhdellä teknologiakortilla" },
      { icon: Coins, text: "Kaupungit tuottavat +1 kultaa per vuoro" },
      { icon: Crown, text: "Voi rakentaa Suuren Muurin -erikoislinnoituksen" },
    ],
    weakness: "Ratsuväki liikkuu -1 alueen vähemmän (raskas varustus)",
    specialAbility: {
      name: "Ruutikeksintö",
      description: "Kerran pelissä voi tuhota vihollisen linnoituksen automaattisesti piirityksessä."
    },
    startSetup: {
      units: ["2 ratsuväkiyksikköä", "4 jalkaväkiyksikköä", "1 heimopäällikkö", "2 tiedustelijaa"],
      resources: "6 resurssikorttia + 1 teknologiakortti",
      territory: "Pohjois-Kiinan linnoitetut kaupungit (2 aluetta)"
    },
    playstyle: "Puolustuksellinen, teknologiapainotteinen, taloudellinen kasvu"
  },
  {
    name: "Persialainen Valtakunta",
    color: "bg-cyan-600",
    borderColor: "border-cyan-600",
    subtitle: "Silkkitien Kuningas",
    description: "Taloudellinen mahti, joka hallitsee diplomatiaa ja resursseja Keski-Aasiassa.",
    strengths: [
      { icon: Coins, text: "Verosopimuksten arvo kaksinkertainen" },
      { icon: Users, text: "+1 diplomatiakortti pelin alussa" },
      { icon: Sparkles, text: "Voi solmia 2 liittosopimusta samanaikaisesti" },
      { icon: Crown, text: "Silkkitien provinssit tuottavat bonusresursseja" },
    ],
    weakness: "Pienempi aloitusarmeija (-1 jalkaväkiyksikkö)",
    specialAbility: {
      name: "Silkkitien Monopoli",
      description: "Kerran pelissä voi sulkea yhden Silkkitien provinssin muilta pelaajilta 3 vuoroksi."
    },
    startSetup: {
      units: ["3 ratsuväkiyksikköä", "1 jalkaväkiyksikkö", "1 heimopäällikkö", "3 tiedustelijaa"],
      resources: "5 resurssikorttia + 2 diplomatiakorttia",
      territory: "Samarkand ja Bukhara (2 aluetta)"
    },
    playstyle: "Diplomaattinen, kaupallinen, liittolaisverkostot"
  },
  {
    name: "Venäläiset Ruhtinaskunnat",
    color: "bg-green-600",
    borderColor: "border-green-600",
    subtitle: "Pohjoisen Karhut",
    description: "Sitkeä puolustaja, joka hyödyntää karua maastoa ja talven voimaa.",
    strengths: [
      { icon: Shield, text: "Talvella +2 puolustusbonus" },
      { icon: Sword, text: "Metsäalueilla +1 hyökkäys ja puolustus" },
      { icon: Users, text: "Jalkaväki on halvempaa rekrytoida (−1 resurssi)" },
      { icon: Sparkles, text: "Immuuni 'talvikatastrofi'-tapahtumakorteille" },
    ],
    weakness: "Hitaampi liikkuminen kesällä (−1 ratsuväen liike)",
    specialAbility: {
      name: "Poltetun Maan Taktiikka",
      description: "Voi tuhota oman alueensa resurssit estääkseen vihollisen hyödyntämisen."
    },
    startSetup: {
      units: ["2 ratsuväkiyksikköä", "4 jalkaväkiyksikköä", "1 heimopäällikkö", "1 tiedustelija"],
      resources: "7 resurssikorttia (painotus ruokaan)",
      territory: "Novgorod ja Vladimir (2 ruhtinaskuntaa)"
    },
    playstyle: "Puolustuksellinen, partisaanisotataktiikka, resurssien säästö"
  },
];
