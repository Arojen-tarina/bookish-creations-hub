// Korttitekstit (de): n = nimi, d = kuvaus, e = efekti, c = hinta, s = lyhyt efekti kortin alaosaan.
import type { CardLocale } from './index.ts';

const cards: CardLocale = {
 "res-001": {
  "n": "Mongolenpferde",
  "d": "3 Pferde",
  "e": "Kavallerie anwerben",
  "s": "+3 Pferde"
 },
 "res-002": {
  "n": "Wilde Pferdeherde",
  "d": "5 Pferde",
  "e": "Große Pferdereserve",
  "s": "+5 Pferde"
 },
 "res-003": {
  "n": "Kriegspferde",
  "d": "2 trainierte Pferde",
  "e": "+1 Kavallerie-Angriff",
  "s": "+2 Pferde"
 },
 "res-004": {
  "n": "Pferderanch",
  "d": "1 Pferd pro Zug",
  "e": "Laufende Pferdezucht",
  "s": "+3 Pferde"
 },
 "res-005": {
  "n": "Steppenhengst",
  "d": "1 besonderes Pferd",
  "e": "Reittier des Stammesführers (+1 Bewegung)",
  "s": "+1 besonderes Pferd"
 },
 "res-006": {
  "n": "Pferdepflege",
  "d": "2 Pferde + Pflege",
  "e": "Pferde verbrauchen keine Nahrung",
  "s": "+2 Pferde"
 },
 "res-007": {
  "n": "Fohlenherde",
  "d": "4 Pferde",
  "e": "Neue Pferde",
  "s": "+4 Pferde"
 },
 "res-008": {
  "n": "Karawanenpferde",
  "d": "3 Pferde",
  "e": "Für den Handel",
  "s": "+3 Pferde"
 },
 "res-009": {
  "n": "Persisches Araberpferd",
  "d": "2 schnelle Pferde",
  "e": "+2 Kavallerie-Bewegung",
  "s": "+2 Pferde"
 },
 "res-010": {
  "n": "Legendärer Hengst",
  "d": "1 magisches Pferd",
  "e": "Stammesführer +2 in allen Schlachten",
  "s": "+1 besonderes Pferd"
 },
 "res-011": {
  "n": "Goldmünzen",
  "d": "3 Gold",
  "e": "Zahlungsmittel",
  "s": "+3 Gold"
 },
 "res-012": {
  "n": "Schatztruhe",
  "d": "5 Gold",
  "e": "Große Goldreserve",
  "s": "+5 Gold"
 },
 "res-013": {
  "n": "Seidengeld",
  "d": "4 Gold",
  "e": "Chinesische Währung",
  "s": "+4 Gold"
 },
 "res-014": {
  "n": "Plündergut",
  "d": "6 Gold",
  "e": "Kriegsbeute",
  "s": "+6 Gold"
 },
 "res-015": {
  "n": "Händlergewinne",
  "d": "3 Gold + 1 pro Handelsroute",
  "e": "Handelsgewinn",
  "s": "+3 Gold"
 },
 "res-017": {
  "n": "Goldmine",
  "d": "2 Gold pro Zug",
  "e": "Laufende Goldproduktion",
  "s": "+5 Gold"
 },
 "res-018": {
  "n": "Bestechungsgeld",
  "d": "4 Gold",
  "e": "Einfluss kaufen",
  "s": "+4 Gold"
 },
 "res-019": {
  "n": "Steuereinnahmen",
  "d": "1 Gold pro kontrollierter Provinz",
  "e": "Aus dem Steuersystem",
  "s": "+3 Gold"
 },
 "res-020": {
  "n": "Schatz des Khans",
  "d": "10 Gold",
  "e": "Unermesslicher Reichtum",
  "s": "+10 Gold"
 },
 "res-021": {
  "n": "Getreideernte",
  "d": "4 Nahrung",
  "e": "Heeresunterhalt",
  "s": "+4 Nahrung"
 },
 "res-022": {
  "n": "Rindfleisch",
  "d": "3 Nahrung",
  "e": "Proteinreserve",
  "s": "+3 Nahrung"
 },
 "res-023": {
  "n": "Trockenproviant",
  "d": "5 Nahrung",
  "e": "Verdirbt nicht",
  "s": "+5 Nahrung"
 },
 "res-024": {
  "n": "Obstgarten",
  "d": "2 Nahrung pro Zug",
  "e": "Laufende Produktion",
  "s": "+4 Nahrung"
 },
 "res-025": {
  "n": "Fischfang",
  "d": "4 Nahrung",
  "e": "Aus Flussprovinzen",
  "s": "+4 Nahrung"
 },
 "res-026": {
  "n": "Nahrungsreserven",
  "d": "6 Nahrung",
  "e": "Notvorrat",
  "s": "+6 Nahrung"
 },
 "res-027": {
  "n": "Jagdbeute",
  "d": "2 Nahrung",
  "e": "Von der Jagd",
  "s": "+2 Nahrung"
 },
 "res-028": {
  "n": "Agrartechnik",
  "d": "+1 Nahrung pro Ackerland",
  "e": "Verbesserte Ernte",
  "s": "+3 Nahrung"
 },
 "res-029": {
  "n": "Reisfelder",
  "d": "3 Nahrung",
  "e": "Aus chinesischer Landwirtschaft",
  "s": "+3 Nahrung"
 },
 "res-030": {
  "n": "Überfluss",
  "d": "8 Nahrung",
  "e": "Riesenernte",
  "s": "+8 Nahrung"
 },
 "res-031": {
  "n": "Schmiede",
  "d": "2 Handwerker",
  "e": "Waffenherstellung",
  "s": "+2 Handwerker"
 },
 "res-032": {
  "n": "Chinesische Ingenieure",
  "d": "3 Handwerker",
  "e": "Erbauer von Belagerungsmaschinen",
  "s": "+3 Handwerker"
 },
 "res-033": {
  "n": "Persische Meister",
  "d": "4 Handwerker",
  "e": "Hochwertige Handwerkskunst",
  "s": "+4 Handwerker"
 },
 "res-034": {
  "n": "Weber",
  "d": "2 Handwerker",
  "e": "Textilproduktion",
  "s": "+2 Handwerker"
 },
 "res-035": {
  "n": "Baumeister",
  "d": "3 Handwerker",
  "e": "Festungsbau",
  "s": "+3 Handwerker"
 },
 "res-036": {
  "n": "Töpfer",
  "d": "1 Handwerker",
  "e": "Handelsware",
  "s": "+1 Handwerker"
 },
 "res-037": {
  "n": "Silberwerkstätten",
  "d": "2 Handwerker",
  "e": "Schmuckherstellung",
  "s": "+2 Handwerker"
 },
 "res-038": {
  "n": "Meisterwaffenschmied",
  "d": "Legendäre Handwerkskunst",
  "e": "Dauerhaft +1 Angriff",
  "s": "+3 Handwerker"
 },
 "res-039": {
  "n": "Handwerkergilde",
  "d": "1 Handwerker pro Zug",
  "e": "Laufende Produktion",
  "s": "+4 Handwerker"
 },
 "res-040": {
  "n": "Lehrlinge",
  "d": "1 Handwerker",
  "e": "Ein Anfänger",
  "s": "+1 Handwerker"
 },
 "res-041": {
  "n": "Schafherde",
  "d": "4 Vieh",
  "e": "Wolle und Fleisch",
  "s": "+4 Nahrung"
 },
 "res-042": {
  "n": "Rinderherde",
  "d": "3 Vieh",
  "e": "Zugtiere und Fleisch",
  "s": "+3 Nahrung"
 },
 "res-043": {
  "n": "Kamelkarawane",
  "d": "5 Vieh",
  "e": "Für Wüstenhandel",
  "s": "+5 Nahrung"
 },
 "res-044": {
  "n": "Ziegenherde",
  "d": "3 Vieh",
  "e": "Milch und Leder",
  "s": "+3 Nahrung"
 },
 "res-045": {
  "n": "Yaks",
  "d": "2 Vieh",
  "e": "Gebirgstiere",
  "s": "+2 Nahrung"
 },
 "res-046": {
  "n": "Seidenraupenzucht",
  "d": "Spezialware",
  "e": "+2 Gold aus Handel",
  "s": "+2 Gold"
 },
 "res-047": {
  "n": "Gewürze",
  "d": "Eine Seltenheit",
  "e": "+3 Gold beim Handel",
  "s": "+3 Gold"
 },
 "res-048": {
  "n": "Pelze",
  "d": "Wertvoll",
  "e": "+2 Gold aus Handel",
  "s": "+2 Gold"
 },
 "res-049": {
  "n": "Edelsteine",
  "d": "Diamanten und Rubine",
  "e": "+10 Gold",
  "s": "+4 Gold"
 },
 "res-050": {
  "n": "Tiara des Khans",
  "d": "Königliche Juwelen",
  "e": "+20 Gold",
  "s": "+8 Gold"
 },
 "str-001": {
  "n": "Mongolenansturm",
  "d": "Klassischer Kavallerieangriff",
  "e": "+3 Angriff in diesem Zug",
  "s": "+3 Angriff"
 },
 "str-006": {
  "n": "Pfeilhagel",
  "d": "Gewaltige Pfeilsalve",
  "e": "+1 Angriff pro Kavallerieeinheit",
  "s": "+1 pro Kavallerie"
 },
 "str-008": {
  "n": "Taktiker des Chaos",
  "d": "Verwirrung in den feindlichen Reihen säen",
  "e": "Feind verliert eine Einheit vor der Schlacht",
  "s": "+4 Angriff"
 },
 "str-010": {
  "n": "Blutschwur",
  "d": "Kämpfe bis zum Tod",
  "e": "+2 Verteidigung, kein Rückzug",
  "s": "+2 Verteidigung, kein Rückzug"
 },
 "str-011": {
  "n": "Feuerrausch",
  "d": "Brennende Pfeile",
  "e": "Zerstöre ein feindliches Gebäude",
  "s": "Gebäude zerstören"
 },
 "str-013": {
  "n": "Veteranenerfahrung",
  "d": "Alte Krieger gehen voran",
  "e": "+1 für alle Einheiten in der Schlacht",
  "s": "+1 für alle im Kampf"
 },
 "str-014": {
  "n": "Verstärkte Linie",
  "d": "Dichte Verteidigungsformation",
  "e": "+3 Verteidigung in diesem Zug",
  "s": "+3 Verteidigung"
 },
 "str-016": {
  "n": "Kavallerieschock",
  "d": "Der erste Schlag entscheidet",
  "e": "Erste Schlacht +3, danach +0",
  "s": "+3 im ersten Angriff"
 },
 "str-017": {
  "n": "Fallgruben",
  "d": "Im Gelände verborgene Fallen",
  "e": "Angreifer verliert 1 Einheit vor der Schlacht",
  "s": "+2 Verteidigung"
 },
 "str-018": {
  "n": "Schattensoldaten",
  "d": "Einsatz von Spionen",
  "e": "Sieh die Handkarten des Feindes",
  "s": "+1 Aufklärung"
 },
 "str-019": {
  "n": "Befehl des Khans",
  "d": "Absoluter Gehorsam",
  "e": "Alle Einheiten greifen gemeinsam an",
  "s": "+3 gemeinsamer Angriff"
 },
 "str-020": {
  "n": "Letzte Kraft",
  "d": "Ein verzweifelter Angriff",
  "e": "Angriff verdoppeln, aber die Hälfte deiner Einheiten verlieren",
  "s": "+5 Verzweiflungsangriff"
 },
 "str-021": {
  "n": "Mauerverstärkung",
  "d": "Festungsreparaturen",
  "e": "+2 Festungshaltbarkeit",
  "s": "+2 Festung"
 },
 "str-022": {
  "n": "Belagertenmut",
  "d": "Keine Kapitulation!",
  "e": "Belagerung dauert 2 Züge länger",
  "s": "+2 Verteidigung für 2 Züge"
 },
 "str-024": {
  "n": "Siedendes Öl",
  "d": "Eine Verteidigungstaktik",
  "e": "+3 Verteidigung gegen Belagerung",
  "s": "+3 gegen Belagerung"
 },
 "str-025": {
  "n": "Stadtwachen",
  "d": "Bürgermiliz",
  "e": "Erhalte 2 temporäre Infanterieeinheiten",
  "s": "+2 Verteidigung"
 },
 "str-026": {
  "n": "Skorpiongeschütz",
  "d": "Eine defensive Belagerungswaffe",
  "e": "+2 Verteidigung, kann eine benachbarte Provinz treffen",
  "s": "+2 Verteidigung"
 },
 "str-027": {
  "n": "Feuerwände",
  "d": "Ein Feuersturm zur Verteidigung",
  "e": "Angreifer verliert 1 Kavallerieeinheit",
  "s": "+2 Verteidigung"
 },
 "str-028": {
  "n": "Vorratslager",
  "d": "Eine lange Belagerung",
  "e": "Kein Nahrungsverbrauch während einer Belagerung",
  "s": "+3 Nahrung"
 },
 "str-032": {
  "n": "Kampferprobt",
  "d": "Erfahrung zahlt sich aus",
  "e": "+2 Verteidigung auf eigenem Gebiet",
  "s": "+2 auf eigenem Gebiet"
 },
 "str-033": {
  "n": "Kälteresistenz",
  "d": "Winterverteidigung",
  "e": "Wenn Winter: +4 Verteidigung",
  "s": "+4 Winterverteidigung"
 },
 "str-034": {
  "n": "Truppenstreuung",
  "d": "Guerillataktik",
  "e": "Verteile dich auf 3 Provinzen, der Feind wählt eine zum Angriff",
  "s": "+2 Guerillaverteidigung"
 },
 "str-035": {
  "n": "Die letzte Mauer",
  "d": "Tod oder Sieg",
  "e": "Verteidigung x2, aber kein Rückzug",
  "s": "+5 Verteidigung"
 },
 "str-051": {
  "n": "Geist Dschingis Khans",
  "d": "Inspiration des großen Eroberers",
  "e": "Alle Einheiten +2 Angriff und Verteidigung in diesem Zug",
  "s": "+2 für alle"
 },
 "str-054": {
  "n": "Chinesisches Schießpulver",
  "d": "Neue Technologie im Einsatz",
  "e": "Zerstöre automatisch eine Festung",
  "s": "Festung zerstören"
 },
 "tek-001": {
  "n": "Kompositbogen",
  "d": "Verbesserte Bogentechnik",
  "e": "Dauerhaft +1 Kavallerie-Angriff",
  "c": "2 Handwerker",
  "s": "Dauerhaft +1 Kavallerie-Angriff"
 },
 "tek-002": {
  "n": "Schwere Kavallerie",
  "d": "Gepanzerte Pferde",
  "e": "Dauerhaft +1 Kavallerie-Verteidigung",
  "c": "2 Handwerker + 2 Pferde",
  "s": "Dauerhaft +1 Kavallerie-Verteidigung"
 },
 "tek-003": {
  "n": "Belagerungsmaschine",
  "d": "Eine steinschleudernde Maschine",
  "e": "Festungen haben -1 Verteidigung gegen dich",
  "c": "3 Handwerker",
  "s": "+2 gegen Festungen"
 },
 "tek-005": {
  "n": "Stahlrüstung",
  "d": "Verbesserte Rüstung",
  "e": "Dauerhaft +1 Infanterie-Verteidigung",
  "c": "2 Handwerker",
  "s": "Dauerhaft +1 Infanterie-Verteidigung"
 },
 "tek-011": {
  "n": "Steuersystem",
  "d": "Effiziente Steuererhebung",
  "e": "+1 Gold pro kontrollierter Provinz",
  "c": "2 Handwerker",
  "s": "+5 Gold"
 },
 "tek-013": {
  "n": "Ackerbautechnik",
  "d": "Verbesserte Ernte",
  "e": "+1 Nahrung pro Ackerland",
  "c": "1 Handwerker",
  "s": "+3 Nahrung"
 },
 "tek-015": {
  "n": "Schriftkunde",
  "d": "Buchführung",
  "e": "+1 Gold pro Zug",
  "c": "2 Handwerker",
  "s": "+2 Gold pro Zug"
 },
 "tek-024": {
  "n": "Metallverarbeitung",
  "d": "Verbesserte Werkzeuge",
  "e": "+1 Bautempo",
  "c": "2 Handwerker",
  "s": "+2 Handwerker"
 },
 "tek-026": {
  "n": "Architektur",
  "d": "Baukunst",
  "e": "Festungen +1 Haltbarkeit",
  "c": "2 Handwerker",
  "s": "+1 Festungshaltbarkeit"
 },
 "tek-029": {
  "n": "Philosophie",
  "d": "Die Kraft des Denkens",
  "e": "+1 Siegpunkt pro 3 Technologiekarten",
  "c": "2 Handwerker",
  "s": "+3 Gold"
 },
 "tek-030": {
  "n": "Universalwissenschaft",
  "d": "Alles Wissen vereint",
  "e": "Technologischer Sieg wird möglich",
  "c": "5 Handwerker + 5 Gold",
  "s": "+10 Gold"
 }
};

export default cards;
