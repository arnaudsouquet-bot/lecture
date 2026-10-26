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
// [Arnaud 2026-10-26] le niveau de chaque jeu suit la réussite ; les étoiles débloquent de nouveaux jeux.

export const ETOILES_PAR_REPONSE = 1;  // HYPOTHÈSE : bonne réponse, mot révisé, paire trouvée, manche réussie

// HYPOTHÈSE : après une série, réussite ≥ 80 % → niveau suivant ; < 50 % deux séries de suite → niveau précédent
export const REGLES_NIVEAU = { monte: 0.8, descend: 0.5, echecsPourDescendre: 2 };

// Les jeux. « etoiles » : étoiles qu'il faut avoir gagnées (en tout) pour débloquer le jeu — HYPOTHÈSE.
// « niveaux » : nombre de niveaux (0 = pas de niveau). « regles » : seuils propres au jeu, si besoin.
export const JEUX = [
  { id: "reviser", section: "memoire", titre: "Réviser mes mots", emoji: "🔁", etoiles: 0, niveaux: 0,
    desc: "Les mots de tes articles, juste au moment où tu risques de les oublier." },
  { id: "paires", section: "memoire", titre: "Jeu de paires", emoji: "🃏", etoiles: 0, niveaux: 3, regles: { monte: 0.6, descend: 0.35 },
    desc: "Retourne les cartes et trouve chaque mot avec son image." },
  { id: "retiens", section: "memoire", titre: "Retiens et retrouve", emoji: "🧩", etoiles: 0, niveaux: 5,
    desc: "Regarde bien, puis retrouve tout dans le bon ordre." },
  { id: "ecoute", section: "memoire", titre: "Écoute et retrouve", emoji: "👂", etoiles: 20, niveaux: 5,
    desc: "Écoute sans regarder, puis retrouve dans le bon ordre." },
  { id: "change", section: "memoire", titre: "Qu'est-ce qui a changé ?", emoji: "🔍", etoiles: 50, niveaux: 5,
    desc: "Regarde bien les objets : lequel a disparu ?" },
  { id: "definitions", section: "memoire", titre: "Paires mot et définition", emoji: "📖", etoiles: 90, niveaux: 3, regles: { monte: 0.6, descend: 0.35 },
    desc: "Retrouve chaque mot avec ce qu'il veut dire." },
  { id: "simon", section: "memoire", titre: "Simon des couleurs", emoji: "🌈", etoiles: 140, niveaux: 6,
    desc: "Regarde et écoute la suite de couleurs, puis refais-la." },
  { id: "calcul", section: "maths", titre: "Calcul mental", emoji: "⚡", etoiles: 0, niveaux: 9,
    desc: "Additions, soustractions, doubles et tables." },
  { id: "problemes", section: "maths", titre: "Problèmes de mes articles", emoji: "📰", etoiles: 0, niveaux: 0,
    desc: "Des petits problèmes avec les nombres de tes articles." },
  { id: "lire-nombres", section: "maths", titre: "Lire les nombres", emoji: "🔢", etoiles: 0, niveaux: 4,
    desc: "Écoute ou lis un nombre, et trouve comment il s'écrit." },
  { id: "ranger", section: "maths", titre: "Ranger les nombres", emoji: "📊", etoiles: 30, niveaux: 4,
    desc: "Du plus petit au plus grand, et les suites de nombres." },
  { id: "formes", section: "maths", titre: "Les formes", emoji: "🔷", etoiles: 70, niveaux: 4,
    desc: "Reconnaître les formes, compter leurs côtés et leurs coins." },
  { id: "logique", section: "maths", titre: "Logique", emoji: "🧠", etoiles: 120, niveaux: 4,
    desc: "Trouve ce qui vient ensuite, ou l'intrus." }
];

// Calcul mental : série de 10 calculs ; niveaux (HYPOTHÈSE)
export const CALCULS_PAR_SERIE = 10;
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

// Lire et ranger les nombres : plus grand nombre par niveau (HYPOTHÈSE)
export const NOMBRES_PAR_NIVEAU = [20, 100, 1000, 10000];
export const QUESTIONS_PAR_SERIE = 8;

// Paires : nombre de paires par niveau ; paires mot et définition (HYPOTHÈSE)
export const PAIRES_PAR_NIVEAU = [4, 6, 8];
export const DEFINITIONS_PAR_NIVEAU = [3, 4, 5];

// Retiens et retrouve, écoute et retrouve : images (dites à voix haute) ; nombre d'éléments par niveau (HYPOTHÈSE)
export const IMAGES_MEMOIRE = [
  ["caméléon", "🦎"], ["lune", "🌙"], ["cœur", "❤️"], ["fusée", "🚀"], ["serpent", "🐍"],
  ["volcan", "🌋"], ["requin", "🦈"], ["étoile", "⭐"], ["arbre", "🌳"], ["pomme", "🍎"]
];
export const RETIENS_PAR_NIVEAU = [3, 4, 5, 6, 7];
export const ECOUTE_PAR_NIVEAU = [2, 3, 4, 5, 6];
export const MANCHES = 5;

// Qu'est-ce qui a changé ? : objets ; nombre d'objets par niveau ; à partir du niveau 3, les objets changent de place
export const OBJETS = ["🎈", "🧸", "⚽", "📚", "✏️", "🔑", "🎁", "🕰️", "🍎", "🚗", "🐶", "🌻", "🎸", "🧦", "🍪", "🪁"];
export const CHANGE_PAR_NIVEAU = [4, 5, 6, 8, 10];

// Simon des couleurs : longueur de la première suite = niveau + 1 ; vitesse (ms par couleur) par niveau
export const SIMON_COULEURS = [["rouge", "#e74c3c"], ["bleu", "#2f80ed"], ["vert", "#27ae60"], ["jaune", "#f2c94c"]];
export const SIMON_VITESSE = [900, 800, 700, 620, 550, 480];

// Les formes (nom dit à voix haute, nombre de côtés ; 0 = rond)
export const FORMES = [
  ["cercle", "0"], ["carré", "4"], ["triangle", "3"], ["rectangle", "4"],
  ["losange", "4"], ["pentagone", "5"], ["hexagone", "6"], ["ovale", "0"]
];

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
