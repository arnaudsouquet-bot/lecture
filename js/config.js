// Réglages de l'app. Les valeurs marquées HYPOTHÈSE sont des propositions ; les autres ont été décidées par les parents.

// argent de poche (décidé le 2026-10-25)
export const PLAFOND_EUROS = 5;            // maximum par semaine (lundi → dimanche)
export const EUROS_PAR_POINT = 0.05;       // 1 point = 0,05 €
export const POINTS_PREMIER_ESSAI = 2;     // bonne réponse du 1er coup
export const POINTS_DEUXIEME_ESSAI = 1;    // bonne réponse au 2e essai
export const ESSAIS_PAR_QUESTION = 2;      // ensuite la réponse est montrée et expliquée
export const UN_SEUL_ARTICLE_PAYE_PAR_JOUR = true; // les articles suivants se lisent pour le plaisir

// Répétition espacée (boîtes de Leitner) : jours avant la prochaine révision, par boîte
export const INTERVALLES_JOURS = [1, 2, 4, 7, 14]; // HYPOTHÈSE
export const REVISIONS_PAR_JOUR = 2;               // HYPOTHÈSE

// Réglages de lecture par défaut (modifiables par l'enfant avec « Aa »)
export const REGLAGES_DEFAUT = {
  syl: true, muet: true, bdpq: false, regle: false, large: false,
  taille: 28, fond: "#f7f1e3", vitesse: 0.85, voix: "",
  prenom: "" // saisi dans l'espace parent, gardé seulement sur l'iPad
};
export const FONDS = ["#f7f1e3", "#fbf3c8", "#e3eef8", "#e6f2e3"];

// Thèmes des articles, et questionnaire « J'ai envie d'autre chose » (étape 1 puis étape 2)
// Thèmes décidés par Arnaud le 2026-10-25 ; HYPOTHÈSE : les 6 sujets de chaque thème, à ajuster avec l'enfant.
export const THEMES = [
  { cle: "animaux", nom: "Animaux", emoji: "🐾", sujets: [
    ["Les requins", "🦈"], ["Les félins", "🐆"], ["Les insectes", "🐜"],
    ["Les oiseaux", "🦅"], ["Les serpents", "🐍"], ["Les animaux de la ferme", "🐄"]] },
  { cle: "sciences", nom: "Sciences", emoji: "🔬", sujets: [
    ["Les expériences", "🧪"], ["L'électricité", "⚡"], ["Les aimants", "🧲"],
    ["L'eau", "💧"], ["La lumière et les couleurs", "🌈"], ["Les microbes", "🦠"]] },
  { cle: "espace", nom: "Espace", emoji: "🪐", sujets: [
    ["Les planètes", "🪐"], ["Les astronautes", "👩‍🚀"], ["Les étoiles", "⭐"],
    ["Les fusées", "🚀"], ["Les trous noirs", "🕳️"], ["La Lune", "🌙"]] },
  { cle: "nature", nom: "Nature et Terre", emoji: "🌋", sujets: [
    ["Les volcans", "🌋"], ["Les orages", "⛈️"], ["Les océans", "🌊"],
    ["Les forêts", "🌳"], ["Les déserts", "🏜️"], ["Les tremblements de terre", "🌍"]] },
  { cle: "histoire", nom: "Histoire", emoji: "🏰", sujets: [
    ["Les chevaliers", "⚔️"], ["Les pyramides", "🏺"], ["Les pirates", "🏴‍☠️"],
    ["Les Vikings", "🛡️"], ["La préhistoire", "🔥"], ["Les Romains", "🏛️"]] },
  { cle: "geographie", nom: "Géographie", emoji: "🗺️", sujets: [
    ["Les pays du monde", "🌍"], ["Les montagnes", "⛰️"], ["Les fleuves", "🏞️"],
    ["Les capitales", "🏙️"], ["Les drapeaux", "🚩"], ["Les îles", "🏝️"]] },
  { cle: "corps", nom: "Corps humain", emoji: "🫀", sujets: [
    ["Le cœur", "❤️"], ["Le cerveau", "🧠"], ["Le squelette", "🦴"],
    ["Les dents", "🦷"], ["Les muscles", "💪"], ["Le sommeil", "😴"]] },
  { cle: "futur", nom: "Le futur", emoji: "🔮", sujets: [
    ["Les robots", "🤖"], ["Les voitures du futur", "🚗"], ["Vivre sur Mars", "🔴"],
    ["Les villes du futur", "🏙️"], ["Les métiers du futur", "👩‍🔬"], ["L'énergie de demain", "☀️"]] },
  { cle: "inventions", nom: "Les inventions", emoji: "🛠️", sujets: [
    ["La roue", "⚙️"], ["L'avion", "✈️"], ["Le téléphone", "📱"],
    ["L'ordinateur", "💻"], ["Le train", "🚂"], ["Les inventions d'enfants", "🧒"]] }
];
// anciens noms de thèmes, pour les articles déjà importés
export const ANCIENS_THEMES = { univers: "espace", machines: "inventions" };

/* ---------- Mémoire et Mathématique : des étoiles, pas d'argent de poche [Arnaud] ---------- */

export const ETOILES_PAR_REPONSE = 1;  // HYPOTHÈSE : bonne réponse en calcul, nombres, problèmes ; mot révisé ; paire trouvée
export const ETOILES_RETIENS = 2;      // HYPOTHÈSE : suite retrouvée sans erreur (1 avec des erreurs)

// HYPOTHÈSE : niveaux de calcul mental ; série de 10 calculs, 8 justes du premier coup → niveau suivant
export const NIVEAU_CALCUL_DEPART = 1;
export const CALCULS_PAR_SERIE = 10;
export const REUSSITES_POUR_MONTER = 8;
export const NIVEAUX_CALCUL = [
  { titre: "Additions jusqu'à 10", op: "+", max: 10 },
  { titre: "Soustractions jusqu'à 10", op: "-", max: 10 },
  { titre: "Additions jusqu'à 20", op: "+", max: 20 },
  { titre: "Soustractions jusqu'à 20", op: "-", max: 20 },
  { titre: "Doubles et moitiés", op: "double" },
  { titre: "Tables de 2, 5 et 10", op: "x", tables: [2, 5, 10] },
  { titre: "Additions jusqu'à 100", op: "+", max: 100 },
  { titre: "Tables de 3 et 4", op: "x", tables: [3, 4] },
  { titre: "Toutes les tables", op: "x", tables: [2, 3, 4, 5, 6, 7, 8, 9] }
];

// Retiens et retrouve : images dites à voix haute. HYPOTHÈSE : 3 images au départ (max 7),
// +1 après 3 suites réussies d'affilée, −1 après 2 suites ratées ; 4 secondes pour 3 images, +1 s par image en plus
export const IMAGES_MEMOIRE = [
  ["caméléon", "🦎"], ["lune", "🌙"], ["cœur", "❤️"], ["fusée", "🚀"], ["serpent", "🐍"],
  ["volcan", "🌋"], ["requin", "🦈"], ["étoile", "⭐"], ["arbre", "🌳"], ["pomme", "🍎"]
];
export const RETIENS_DEPART = 3, RETIENS_MAX = 7;

// Lire les nombres : HYPOTHÈSE nombres jusqu'à 100, séries de 8
export const NOMBRES_MAX = 100, NOMBRES_PAR_SERIE = 8;

// HYPOTHÈSE : badges
export const BADGES = [
  { id: "lecteur", emoji: "📚", titre: "Premier article", desc: "Lire un premier article" },
  { id: "calculateur", emoji: "🧮", titre: "Calculateur", desc: "Finir 10 séries de calcul" },
  { id: "elephant", emoji: "🐘", titre: "Mémoire d'éléphant", desc: "Gagner 5 jeux de paires" },
  { id: "hibou", emoji: "🦉", titre: "Hibou savant", desc: "Réviser 50 mots" },
  { id: "fusee", emoji: "🚀", titre: "Fusée du calcul", desc: "Atteindre le niveau 6 de calcul" },
  { id: "champion", emoji: "🏆", titre: "Champion", desc: "Lire 7 jours de suite" }
];

export const ANIMATIONS =["flotte", "rebond", "tourne", "zoom", "balance", "aucune"];
