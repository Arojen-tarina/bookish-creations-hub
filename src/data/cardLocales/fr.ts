// Korttitekstit (fr): n = nimi, d = kuvaus, e = efekti, c = hinta, s = lyhyt efekti kortin alaosaan.
import type { CardLocale } from './index.ts';

const cards: CardLocale = {
 "res-001": {
  "n": "Chevaux mongols",
  "d": "3 chevaux",
  "e": "Recrutez de la cavalerie",
  "s": "+3 chevaux"
 },
 "res-002": {
  "n": "Chevaux sauvages",
  "d": "5 chevaux",
  "e": "Une grande réserve de chevaux",
  "s": "+5 chevaux"
 },
 "res-003": {
  "n": "Chevaux de guerre",
  "d": "2 chevaux dressés",
  "e": "+1 attaque de cavalerie",
  "s": "+2 chevaux"
 },
 "res-004": {
  "n": "Haras",
  "d": "1 cheval par tour",
  "e": "Production continue de chevaux",
  "s": "+3 chevaux"
 },
 "res-005": {
  "n": "Étalon des steppes",
  "d": "1 cheval spécial",
  "e": "Monture du chef (+1 déplacement)",
  "s": "+1 cheval spécial"
 },
 "res-006": {
  "n": "Soins équins",
  "d": "2 chevaux + soins",
  "e": "Les chevaux ne consomment pas de nourriture",
  "s": "+2 chevaux"
 },
 "res-007": {
  "n": "Troupeau de poulains",
  "d": "4 chevaux",
  "e": "De nouveaux chevaux",
  "s": "+4 chevaux"
 },
 "res-008": {
  "n": "Chevaux de caravane",
  "d": "3 chevaux",
  "e": "Pour le commerce",
  "s": "+3 chevaux"
 },
 "res-009": {
  "n": "Cheval arabe persan",
  "d": "2 chevaux rapides",
  "e": "+2 mouvement de cavalerie",
  "s": "+2 chevaux"
 },
 "res-010": {
  "n": "Étalon légendaire",
  "d": "1 cheval magique",
  "e": "Chef +2 dans toutes les batailles",
  "s": "+1 cheval spécial"
 },
 "res-011": {
  "n": "Pièces d'or",
  "d": "3 or",
  "e": "Moyen de paiement",
  "s": "+3 or"
 },
 "res-012": {
  "n": "Coffre au trésor",
  "d": "5 or",
  "e": "Grande réserve d'or",
  "s": "+5 or"
 },
 "res-013": {
  "n": "Monnaie de soie",
  "d": "4 or",
  "e": "Monnaie chinoise",
  "s": "+4 or"
 },
 "res-014": {
  "n": "Richesses pillées",
  "d": "6 or",
  "e": "Butin de guerre",
  "s": "+6 or"
 },
 "res-015": {
  "n": "Profits du marchand",
  "d": "3 or + 1 par route commerciale",
  "e": "Profits du commerce",
  "s": "+3 or"
 },
 "res-017": {
  "n": "Mine d'or",
  "d": "2 or par tour",
  "e": "Production continue d'or",
  "s": "+5 or"
 },
 "res-018": {
  "n": "Fonds de corruption",
  "d": "4 or",
  "e": "Achetez de l'influence",
  "s": "+4 or"
 },
 "res-019": {
  "n": "Recettes fiscales",
  "d": "1 or par province contrôlée",
  "e": "Issu du système fiscal",
  "s": "+3 or"
 },
 "res-020": {
  "n": "Trésor du Khan",
  "d": "10 or",
  "e": "Richesses immenses",
  "s": "+10 or"
 },
 "res-021": {
  "n": "Récolte de grain",
  "d": "4 nourriture",
  "e": "Entretien de l'armée",
  "s": "+4 nourriture"
 },
 "res-022": {
  "n": "Viande de bétail",
  "d": "3 nourriture",
  "e": "Réserve de protéines",
  "s": "+3 nourriture"
 },
 "res-023": {
  "n": "Nourriture séchée",
  "d": "5 nourriture",
  "e": "Ne se gâte pas",
  "s": "+5 nourriture"
 },
 "res-024": {
  "n": "Verger",
  "d": "2 nourriture par tour",
  "e": "Production continue",
  "s": "+4 nourriture"
 },
 "res-025": {
  "n": "Prise de pêche",
  "d": "4 nourriture",
  "e": "Des provinces fluviales",
  "s": "+4 nourriture"
 },
 "res-026": {
  "n": "Réserves de nourriture",
  "d": "6 nourriture",
  "e": "Stock d'urgence",
  "s": "+6 nourriture"
 },
 "res-027": {
  "n": "Butin de chasse",
  "d": "2 nourriture",
  "e": "Issu de la chasse",
  "s": "+2 nourriture"
 },
 "res-028": {
  "n": "Technologie agricole",
  "d": "+1 nourriture par terre agricole",
  "e": "Récolte améliorée",
  "s": "+3 nourriture"
 },
 "res-029": {
  "n": "Rizières",
  "d": "3 nourriture",
  "e": "De l'agriculture chinoise",
  "s": "+3 nourriture"
 },
 "res-030": {
  "n": "Abondance",
  "d": "8 nourriture",
  "e": "Une récolte géante",
  "s": "+8 nourriture"
 },
 "res-031": {
  "n": "Forgerons",
  "d": "2 artisans",
  "e": "Forge d'armes",
  "s": "+2 artisans"
 },
 "res-032": {
  "n": "Ingénieurs chinois",
  "d": "3 artisans",
  "e": "Bâtisseurs d'engins de siège",
  "s": "+3 artisans"
 },
 "res-033": {
  "n": "Maîtres artisans persans",
  "d": "4 artisans",
  "e": "Un travail de haute qualité",
  "s": "+4 artisans"
 },
 "res-034": {
  "n": "Tisserands",
  "d": "2 artisans",
  "e": "Production textile",
  "s": "+2 artisans"
 },
 "res-035": {
  "n": "Bâtisseurs",
  "d": "3 artisans",
  "e": "Construction de forteresses",
  "s": "+3 artisans"
 },
 "res-036": {
  "n": "Potiers",
  "d": "1 artisan",
  "e": "Biens de commerce",
  "s": "+1 artisan"
 },
 "res-037": {
  "n": "Ateliers d'argent",
  "d": "2 artisans",
  "e": "Fabrication de bijoux",
  "s": "+2 artisans"
 },
 "res-038": {
  "n": "Maître armurier",
  "d": "Artisanat légendaire",
  "e": "Bonus permanent de +1 attaque",
  "s": "+3 artisans"
 },
 "res-039": {
  "n": "Guilde des artisans",
  "d": "1 artisan par tour",
  "e": "Production continue",
  "s": "+4 artisans"
 },
 "res-040": {
  "n": "Apprentis",
  "d": "1 artisan",
  "e": "Un novice",
  "s": "+1 artisan"
 },
 "res-041": {
  "n": "Troupeau de moutons",
  "d": "4 bétail",
  "e": "Laine et viande",
  "s": "+4 nourriture"
 },
 "res-042": {
  "n": "Troupeau bovin",
  "d": "3 bétail",
  "e": "Bêtes de trait et viande",
  "s": "+3 nourriture"
 },
 "res-043": {
  "n": "Caravane de chameaux",
  "d": "5 bétail",
  "e": "Pour le commerce du désert",
  "s": "+5 nourriture"
 },
 "res-044": {
  "n": "Troupeau de chèvres",
  "d": "3 bétail",
  "e": "Lait et cuir",
  "s": "+3 nourriture"
 },
 "res-045": {
  "n": "Yaks",
  "d": "2 bétail",
  "e": "Animaux de montagne",
  "s": "+2 nourriture"
 },
 "res-046": {
  "n": "Ferme à vers à soie",
  "d": "Produit de spécialité",
  "e": "+2 or grâce au commerce",
  "s": "+2 or"
 },
 "res-047": {
  "n": "Épices",
  "d": "Une rareté",
  "e": "+3 or à l'échange",
  "s": "+3 or"
 },
 "res-048": {
  "n": "Fourrures",
  "d": "Précieuses",
  "e": "+2 or grâce au commerce",
  "s": "+2 or"
 },
 "res-049": {
  "n": "Gemmes",
  "d": "Diamants et rubis",
  "e": "+10 or",
  "s": "+4 or"
 },
 "res-050": {
  "n": "Tiare du Khan",
  "d": "Joyaux royaux",
  "e": "+20 or",
  "s": "+8 or"
 },
 "str-001": {
  "n": "Charge mongole",
  "d": "Assaut classique de cavalerie",
  "e": "Bonus de +3 attaque ce tour",
  "s": "+3 attaque"
 },
 "str-006": {
  "n": "Tempête de flèches",
  "d": "Volée massive de flèches",
  "e": "+1 attaque par unité de cavalerie",
  "s": "+1 par cavalerie"
 },
 "str-008": {
  "n": "Tacticien du chaos",
  "d": "Semez la confusion dans les rangs ennemis",
  "e": "L'ennemi perd une unité avant la bataille",
  "s": "+4 attaque"
 },
 "str-010": {
  "n": "Serment de sang",
  "d": "Combattre jusqu'à la mort",
  "e": "+2 défense, retraite impossible",
  "s": "+2 défense, pas de retraite"
 },
 "str-011": {
  "n": "Frénésie de feu",
  "d": "Flèches enflammées",
  "e": "Détruisez un bâtiment ennemi",
  "s": "détruire un bâtiment"
 },
 "str-013": {
  "n": "Expérience des vétérans",
  "d": "Les vieux guerriers montrent la voie",
  "e": "+1 à toutes les unités en bataille",
  "s": "+1 à tous en bataille"
 },
 "str-014": {
  "n": "Ligne renforcée",
  "d": "Formation défensive serrée",
  "e": "+3 défense ce tour",
  "s": "+3 défense"
 },
 "str-016": {
  "n": "Choc de cavalerie",
  "d": "Le premier choc décide",
  "e": "Première bataille +3, suivantes +0",
  "s": "+3 à la première frappe"
 },
 "str-017": {
  "n": "Fosses piégées",
  "d": "Pièges cachés dans le terrain",
  "e": "L'attaquant perd 1 unité avant la bataille",
  "s": "+2 défense"
 },
 "str-018": {
  "n": "Soldats de l'ombre",
  "d": "Recours aux espions",
  "e": "Voyez la main de cartes ennemie",
  "s": "+1 reconnaissance"
 },
 "str-019": {
  "n": "Ordre du Khan",
  "d": "Obéissance absolue",
  "e": "Toutes les unités attaquent ensemble",
  "s": "+3 attaque combinée"
 },
 "str-020": {
  "n": "Dernière force",
  "d": "Un assaut désespéré",
  "e": "Attaque doublée, mais perdez la moitié de vos unités",
  "s": "+5 attaque désespérée"
 },
 "str-021": {
  "n": "Renfort des murs",
  "d": "Réparations de forteresse",
  "e": "+2 durabilité de forteresse",
  "s": "+2 forteresse"
 },
 "str-022": {
  "n": "Défi des assiégés",
  "d": "Pas de reddition !",
  "e": "Le siège dure 2 tours de plus",
  "s": "+2 défense pendant 2 tours"
 },
 "str-024": {
  "n": "Huile bouillante",
  "d": "Une tactique défensive",
  "e": "+3 défense contre le siège",
  "s": "+3 défense contre le siège"
 },
 "str-025": {
  "n": "Gardes de la ville",
  "d": "Milice citoyenne",
  "e": "Gagnez 2 unités d'infanterie temporaires",
  "s": "+2 défense"
 },
 "str-026": {
  "n": "Scorpion",
  "d": "Une arme de siège défensive",
  "e": "+2 défense, peut frapper une province adjacente",
  "s": "+2 défense"
 },
 "str-027": {
  "n": "Murs de feu",
  "d": "Une tempête de feu en défense",
  "e": "L'attaquant perd 1 unité de cavalerie",
  "s": "+2 défense"
 },
 "str-028": {
  "n": "Stock de vivres",
  "d": "Un long siège",
  "e": "Aucune consommation de nourriture pendant un siège",
  "s": "+3 nourriture"
 },
 "str-032": {
  "n": "Aguerris",
  "d": "L'expérience paie",
  "e": "+2 défense sur votre territoire",
  "s": "+2 sur votre territoire"
 },
 "str-033": {
  "n": "Résistance au froid",
  "d": "Défense hivernale",
  "e": "Si hiver : +4 défense",
  "s": "+4 défense d'hiver"
 },
 "str-034": {
  "n": "Dispersion de l'armée",
  "d": "Tactique de guérilla",
  "e": "Répartissez-vous sur 3 provinces, l'ennemi en choisit une à attaquer",
  "s": "+2 défense de guérilla"
 },
 "str-035": {
  "n": "Le dernier mur",
  "d": "La mort ou la victoire",
  "e": "Défense x2, mais pas de retraite",
  "s": "+5 défense"
 },
 "str-051": {
  "n": "Esprit de Gengis Khan",
  "d": "Inspiration du grand conquérant",
  "e": "Toutes les unités +2 attaque et défense ce tour",
  "s": "+2 à tous"
 },
 "str-054": {
  "n": "Poudre chinoise",
  "d": "Nouvelle technologie en service",
  "e": "Détruisez automatiquement une forteresse",
  "s": "détruire une forteresse"
 },
 "tek-001": {
  "n": "Arc composite",
  "d": "Technologie d'arc améliorée",
  "e": "+1 attaque de cavalerie permanente",
  "c": "2 artisans",
  "s": "+1 attaque de cavalerie permanente"
 },
 "tek-002": {
  "n": "Cavalerie lourde",
  "d": "Chevaux cuirassés",
  "e": "+1 défense de cavalerie permanente",
  "c": "2 artisans + 2 chevaux",
  "s": "+1 défense de cavalerie permanente"
 },
 "tek-003": {
  "n": "Engin de siège",
  "d": "Une machine à lancer des pierres",
  "e": "Les forteresses ont -1 défense contre vous",
  "c": "3 artisans",
  "s": "+2 contre forteresses"
 },
 "tek-005": {
  "n": "Armure d'acier",
  "d": "Armure améliorée",
  "e": "+1 défense d'infanterie permanente",
  "c": "2 artisans",
  "s": "+1 défense d'infanterie permanente"
 },
 "tek-011": {
  "n": "Système fiscal",
  "d": "Collecte d'impôts efficace",
  "e": "+1 or par province contrôlée",
  "c": "2 artisans",
  "s": "+5 or"
 },
 "tek-013": {
  "n": "Technique agricole",
  "d": "Récolte améliorée",
  "e": "+1 nourriture par terre agricole",
  "c": "1 artisan",
  "s": "+3 nourriture"
 },
 "tek-015": {
  "n": "Alphabétisation",
  "d": "Tenue des registres",
  "e": "+1 or par tour",
  "c": "2 artisans",
  "s": "+2 or par tour"
 },
 "tek-024": {
  "n": "Travail du métal",
  "d": "Outils améliorés",
  "e": "+1 vitesse de construction",
  "c": "2 artisans",
  "s": "+2 artisans"
 },
 "tek-026": {
  "n": "Architecture",
  "d": "Savoir bâtir",
  "e": "Les forteresses gagnent +1 durabilité",
  "c": "2 artisans",
  "s": "+1 durabilité de forteresse"
 },
 "tek-029": {
  "n": "Philosophie",
  "d": "La puissance de la pensée",
  "e": "+1 point de victoire par 3 cartes de technologie",
  "c": "2 artisans",
  "s": "+3 or"
 },
 "tek-030": {
  "n": "Science universelle",
  "d": "Tout le savoir uni",
  "e": "La victoire technologique devient possible",
  "c": "5 artisans + 5 or",
  "s": "+10 or"
 }
};

export default cards;
