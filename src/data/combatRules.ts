/**
 * combatRules.ts — Taistelujärjestelmän data
 *
 * Sisältää laajennettujen taistelusääntöjen datan:
 * - Taistelumodifikaattorit (maasto, ylivoima, johtajat)
 * - Piiritysvaiheet
 * - Vetäytymissäännöt yksikkötyypeittäin
 * Käytetään AdvancedCombatRules-komponentissa.
 */

export interface CombatModifier {
  condition: string;
  modifier: string;
  type: "positive" | "negative";
}

export interface SiegePhase {
  phase: string;
  duration: string;
  description: string;
}

export interface RetreatRule {
  unit: string;
  rule: string;
}

export const combatModifiers: CombatModifier[] = [
  { condition: "Hyökkääjän ratsuväki avoimessa maastossa", modifier: "+2", type: "positive" },
  { condition: "Puolustaja linnoitetussa kaupungissa", modifier: "+3", type: "positive" },
  { condition: "Hyökkäys vuoristoon", modifier: "-2", type: "negative" },
  { condition: "Hyökkäys talvella (ei-venäläiset)", modifier: "-1", type: "negative" },
  { condition: "Heimopäällikkö läsnä", modifier: "+1", type: "positive" },
  { condition: "Ylivoima (2:1 tai enemmän)", modifier: "+1", type: "positive" },
  { condition: "Huoltoreittien katkeaminen", modifier: "-1", type: "negative" },
];

export const siegePhases: SiegePhase[] = [
  { phase: "Piiritysvalmistelut", duration: "1 vuoro", description: "Armeija asettuu piiritysasemiin, rakentaa leirinsä" },
  { phase: "Muurien pommitus", duration: "1-3 vuoroa", description: "Heitetään noppaa joka vuoro, 5-6 tekee vahinkoa linnoitukselle" },
  { phase: "Rynnäkkö", duration: "1 vuoro", description: "Kun linnoitus on heikentynyt, voi yrittää rynnäkköä" },
  { phase: "Antautuminen", duration: "-", description: "Puolustaja voi antautua missä vaiheessa tahansa" },
];

export const retreatRules: RetreatRule[] = [
  { unit: "Ratsuväki", rule: "Voi vetäytyä ennen taistelun ratkaisua (mongoli-heimo: ilman tappiota)" },
  { unit: "Jalkaväki", rule: "Vetäytyminen aiheuttaa 1 ylimääräisen tappion" },
  { unit: "Heimopäällikkö", rule: "Voi paeta vaikka armeija tuhoutuisi (50% todennäköisyys)" },
];
