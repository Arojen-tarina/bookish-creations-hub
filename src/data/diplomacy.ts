/**
 * diplomacy.ts — Diplomatian sääntödata
 *
 * Sisältää diplomatiajärjestelmän datan:
 * - 4 sopimustyyppiä (rauha, kauppa, dynastinen liitto, vasallisuhde)
 * - Diplomaattiset toiminnot ja niiden hinnat
 * - Verenvihajärjestelmän säännöt
 * Käytetään AdvancedDiplomacy-komponentissa.
 */
import { Handshake, Heart, Coins, Crown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TreatyTypeData {
  icon: LucideIcon;
  name: string;
  duration: string;
  effect: string;
  breakPenalty: string;
  color: string;
}

export interface DiplomaticAction {
  action: string;
  cost: string;
  effect: string;
}

export const treatyTypes: TreatyTypeData[] = [
  {
    icon: Handshake,
    name: "Rauhansopimus",
    duration: "3 vuoroa",
    effect: "Osapuolet eivät voi hyökätä toisiaan vastaan",
    breakPenalty: "Petturimerkki, -3 diplomatiapistettä",
    color: "bg-green-500"
  },
  {
    icon: Coins,
    name: "Kauppasopimus",
    duration: "5 vuoroa",
    effect: "Molemmat saavat +1 kultaa per vuoro",
    breakPenalty: "Menettää kaikki kauppaedut välittömästi",
    color: "bg-amber-500"
  },
  {
    icon: Heart,
    name: "Dynastinen Liitto",
    duration: "Pysyvä",
    effect: "Ei voi hyökätä, jaettu puolustus, perimysoikeudet",
    breakPenalty: "Verenvihan julistus, kaikki pelaajat vihollisia",
    color: "bg-pink-500"
  },
  {
    icon: Crown,
    name: "Vasallisuhde",
    duration: "Kunnes purjetaan",
    effect: "Vasalli maksaa tributin (2 resurssia/vuoro), saa suojelun",
    breakPenalty: "Vasallin tulee voittaa taistelu vapautuakseen",
    color: "bg-purple-500"
  },
];

export const diplomaticActions: DiplomaticAction[] = [
  { action: "Lähettiläs", cost: "1 kauppias", effect: "Avaa neuvottelut, +1 diplomatiapiste kyseisen pelaajan kanssa" },
  { action: "Lahja", cost: "3 resurssia", effect: "+2 diplomatiapistettä, mahdollistaa sopimusneuvottelut" },
  { action: "Uhkavaatimus", cost: "Vähintään 2:1 sotilasylivoima", effect: "Pakottaa vastustajan valitsemaan: tributti tai sota" },
  { action: "Salamurha", cost: "1 strategiakortti + 5 kultaa", effect: "50% mahdollisuus eliminoida vastustajan johtohahmo" },
];

export const bloodFeudRules: string[] = [
  "Verenvihaa ei voi lopettaa ilman sopimuskorttia",
  "Vihollisen alueiden valloitus antaa +1 voittopiste",
  "Muut pelaajat eivät voi liittoutua kummankaan kanssa (paitsi jos itsekin sodassa)",
  "Verenvihan aiheuttaja saa -2 diplomatiaa kaikkien muidenkin kanssa"
];
