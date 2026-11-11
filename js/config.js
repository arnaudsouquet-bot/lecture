// Réglages de l'app. Les valeurs marquées HYPOTHÈSE sont des propositions ; les autres ont été décidées par les parents.

// argent de poche (décidé le 2026-10-25)
export const PLAFOND_EUROS = 5;            // maximum par semaine (lundi → dimanche)
export const EUROS_PAR_POINT = 0.05;       // 1 point = 0,05 €
export const POINTS_PREMIER_ESSAI = 2;     // bonne réponse du 1er coup
export const POINTS_DEUXIEME_ESSAI = 1;    // bonne réponse au 2e essai
export const ESSAIS_PAR_QUESTION = 2;      // ensuite la réponse est montrée et expliquée
export const UN_SEUL_ARTICLE_PAYE_PAR_JOUR = true; // les articles suivants se lisent pour le plaisir
// [Arnaud 2026-11-03] cadeau unique de la mise à jour : 1 € ajouté une seule fois à la cagnotte de la semaine, en plus du plafond
export const BONUS_MISE_A_JOUR = { id: "maj-2026-11", montant: 1, motif: "Cadeau de la mise à jour" };

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
  // [Arnaud 2026-11-03] les grandes questions de Sacha, un article de 7 pages par question (6 pour les empires)
  { cle: "questions", nom: "Grandes questions", emoji: "🤔", sujets: [
    ["La naissance de la Terre", "🌍"], ["La naissance des volcans", "🌋"], ["La naissance de l'Univers", "💥"],
    ["La naissance du Soleil", "☀️"], ["Les galaxies", "🌌"], ["Les atomes", "⚛️"],
    ["Le tableau de Mendeleïev", "🧪"], ["Les grands empires", "👑"], ["La vie sur Terre", "🦠"], ["L'évolution de l'homme", "🦍"]] },
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
  { id: "calcul", section: "maths", titre: "Calcul mental", emoji: "⚡", etoiles: 0, niveaux: 12,
    desc: "Additions, soustractions, tables et divisions." },
  { id: "problemes", section: "maths", titre: "Problèmes de mes articles", emoji: "📰", etoiles: 0, niveaux: 0,
    desc: "Des petits problèmes avec les nombres de tes articles." },
  { id: "lire-nombres", section: "maths", titre: "Lire les nombres", emoji: "🔢", etoiles: 0, niveaux: 4,
    desc: "Écoute ou lis un nombre, et trouve comment il s'écrit." },
  { id: "ranger", section: "maths", titre: "Ranger les nombres", emoji: "📊", etoiles: 30, niveaux: 4,
    desc: "Du plus petit au plus grand, et les suites de nombres." },
  { id: "formes", section: "maths", titre: "Les formes", emoji: "🔷", etoiles: 70, niveaux: 4,
    desc: "Reconnaître les formes, compter leurs côtés et leurs coins." },
  { id: "logique", section: "maths", titre: "Logique", emoji: "🧠", etoiles: 120, niveaux: 6,
    desc: "Suites, intrus, grilles et pyramides de nombres." },
  // [Arnaud 2026-11-11] section Apprendre : infinitifs, divisions, alphabet ; ouverts tout de suite.
  // [Arnaud 2026-11-11] « au moins 10 niveaux » ; on passe au niveau suivant à 75 % (2e essai = ½)
  { id: "infinitifs", section: "apprendre", titre: "Chasse aux infinitifs", emoji: "🎯", etoiles: 0, niveaux: 10, regles: { monte: 0.75 },
    desc: "Éclate les bulles des verbes et retrouve leur infinitif." },
  { id: "partages", section: "apprendre", titre: "Atelier des partages", emoji: "🍕", etoiles: 0, niveaux: 10, regles: { monte: 0.75 },
    desc: "Partage entre les amis pour comprendre les divisions." },
  { id: "alphabet", section: "apprendre", titre: "Train de l'alphabet", emoji: "🚂", etoiles: 0, niveaux: 10, regles: { monte: 0.75 },
    desc: "Les lettres, leur ordre, et ranger les mots." }
];

// Calcul mental : série de 10 calculs ; niveaux (HYPOTHÈSE)
export const CALCULS_PAR_SERIE = 10;
// [Arnaud 2026-11-03] trop facile : on démarre à 20, avec des retenues, des divisions et des calculs en deux étapes
const TOUTES_LES_TABLES = [2, 3, 4, 5, 6, 7, 8, 9];
export const NIVEAUX_CALCUL = [
  { titre: "Additions et soustractions jusqu'à 20", op: "+-", max: 20 },
  { titre: "Additions avec retenue jusqu'à 100", op: "+", max: 100 },
  { titre: "Soustractions avec retenue jusqu'à 100", op: "-", max: 100 },
  { titre: "Doubles et moitiés jusqu'à 100", op: "double", max: 50 },
  { titre: "Tables de 2, 3, 4 et 5", op: "x", tables: [2, 3, 4, 5] },
  { titre: "Toutes les tables", op: "x", tables: TOUTES_LES_TABLES },
  { titre: "Divisions : tables de 2, 5 et 10", op: ":", tables: [2, 5, 10] },
  { titre: "Divisions : toutes les tables", op: ":", tables: TOUTES_LES_TABLES },
  { titre: "Le nombre qui manque", op: "?", tables: TOUTES_LES_TABLES, max: 100 },
  { titre: "Additions et soustractions jusqu'à 1000", op: "+-", max: 1000 },
  { titre: "Multiplier un grand nombre", op: "x2", tables: TOUTES_LES_TABLES },
  { titre: "Calculs en deux étapes", op: "2etapes", tables: TOUTES_LES_TABLES }
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

/* ---------- Apprendre [Arnaud 2026-11-11] ---------- */
// Les mots entre crochets ["mot", "…"] sont enregistrés avec la voix naturelle (outils/voix.py).
// Ce qu'on demande à chaque niveau est décrit dans js/ecrans/apprendre.js (HYPOTHÈSE).

// Chasse aux infinitifs : verbes en -er (leurs formes en -é et -e sont enregistrées aussi), autres verbes,
// mots qui ne sont pas des verbes, et pièges qui finissent comme un infinitif
export const VERBES_ER = [
  ["manger", "🍽️"], ["jouer", "⚽"], ["chanter", "🎤"], ["danser", "💃"], ["sauter", "🦘"], ["nager", "🏊"],
  ["dessiner", "🎨"], ["regarder", "👀"], ["marcher", "🚶"], ["parler", "🗣️"], ["cuisiner", "🍳"], ["grimper", "🧗"]
];
export const VERBES_AUTRES = [
  ["finir", "🏁"], ["dormir", "😴"], ["courir", "🏃"], ["lire", "📖"], ["écrire", "✏️"], ["prendre", "✋"],
  ["voir", "🔭"], ["boire", "🥤"], ["rire", "😂"], ["partir", "🧳"], ["grandir", "🌱"], ["vendre", "🏷️"],
  ["être", "🙂"], ["avoir", "🎒"], ["aller", "➡️"], ["faire", "🛠️"], ["pouvoir", "💪"], ["savoir", "🧠"],
  ["venir", "👋"], ["mettre", "🧦"], ["vouloir", "🙏"]
];
export const PAS_VERBES = [
  ["maison", "🏠"], ["chat", "🐱"], ["vélo", "🚲"], ["joli", "🌸"], ["soleil", "☀️"], ["gâteau", "🎂"],
  ["rapide", "💨"], ["ballon", "🎈"], ["chien", "🐶"], ["grand", "🦒"], ["table", "🪑"], ["fleur", "🌼"]
];
export const PIEGES_VERBES = [
  ["hiver", "❄️"], ["rocher", "🪨"], ["cahier", "📓"], ["soir", "🌙"], ["miroir", "🪞"], ["plaisir", "😊"],
  ["panier", "🧺"], ["noir", "⚫"], ["papier", "📄"], ["fermier", "👨‍🌾"]
];
// [forme conjuguée, infinitif] : verbes en -er, puis en -ir, -re, -oir, puis les plus difficiles
export const CONJUGUES_ER = [
  ["il mange", "manger"], ["tu joues", "jouer"], ["nous chantons", "chanter"], ["elle danse", "danser"],
  ["vous sautez", "sauter"], ["je dessine", "dessiner"], ["ils nagent", "nager"], ["tu regardes", "regarder"]
];
export const CONJUGUES = [
  ["elle finit", "finir"], ["je dors", "dormir"], ["ils courent", "courir"], ["vous lisez", "lire"],
  ["il prend", "prendre"], ["je bois", "boire"], ["tu vois", "voir"], ["elle écrit", "écrire"],
  ["nous grandissons", "grandir"], ["il part", "partir"], ["tu ris", "rire"], ["ils vendent", "vendre"]
];
export const CONJUGUES_DIFFICILES = [
  ["nous allons", "aller"], ["je vais", "aller"], ["ils sont", "être"], ["vous êtes", "être"], ["tu as", "avoir"],
  ["elles ont", "avoir"], ["il fait", "faire"], ["vous faites", "faire"], ["il peut", "pouvoir"], ["je sais", "savoir"],
  ["ils viennent", "venir"], ["il met", "mettre"], ["nous voulons", "vouloir"]
];
// phrases à compléter : -er, -é ou -e (le mot à trouver est dans la phrase)
export const PHRASES_A_TROU = [
  ["Je vais manger une pomme.", "manger"], ["J'ai mangé une pomme.", "mangé"], ["Il mange une pomme.", "mange"],
  ["Tu veux jouer au ballon ?", "jouer"], ["Nous avons joué au ballon.", "joué"], ["Elle aime chanter.", "chanter"],
  ["Hier, j'ai chanté.", "chanté"], ["Il faut sauter très haut.", "sauter"], ["Le chat a sauté sur le lit.", "sauté"],
  ["Je vais nager dans la mer.", "nager"], ["Elle a nagé longtemps.", "nagé"], ["Tu peux dessiner un volcan.", "dessiner"],
  ["Mon frère a dessiné une fusée.", "dessiné"], ["On va danser ce soir.", "danser"], ["Ils ont dansé toute la nuit.", "dansé"],
  ["Je regarde les étoiles.", "regarde"], ["Il faut regarder à gauche.", "regarder"], ["Le bébé marche tout seul.", "marche"]
];

// Atelier des partages : amis et objets à partager ; 10 niveaux (HYPOTHÈSE).
// « partager » : on distribue soi-même (nombre d'amis, part de chacun) ; « diviser » : divisions des tables ;
// « problemes » : petits problèmes et divisions avec reste
export const AMIS = ["🐻", "🐰", "🦊", "🐸", "🐼", "🐯"];
export const A_PARTAGER = ["🍬", "🍓", "🍪", "🌰", "🍒", "🧁"];
const TABLES_PARTAGE = [2, 3, 4, 5, 6, 7, 8, 9];
export const PARTAGES_PAR_NIVEAU = [
  { sorte: "partager", amis: [2, 2], parts: [2, 5] },
  { sorte: "partager", amis: [3, 3], parts: [2, 5] },
  { sorte: "partager", amis: [2, 5], parts: [2, 6] },
  { sorte: "diviser", tables: [2, 5, 10], parts: [2, 10] },
  { sorte: "diviser", tables: [3, 4], parts: [2, 10] },
  { sorte: "diviser", tables: [6, 7, 8, 9], parts: [2, 10] },
  { sorte: "diviser", tables: [...TABLES_PARTAGE, 10], parts: [2, 10] },
  { sorte: "partager", amis: [3, 5], parts: [2, 4], reste: true },
  { sorte: "diviser", tables: TABLES_PARTAGE, parts: [2, 9], reste: true },
  { sorte: "problemes", tables: TABLES_PARTAGE, parts: [2, 9], reste: true }
];
// petits problèmes : « Il y a » + nombre + texte (le nombre du texte est le diviseur)
export const PROBLEMES_PARTAGE = [
  ["roues. Une voiture a 4 roues. Combien de voitures ?", "🚗"],
  ["pattes. Un chat a 4 pattes. Combien de chats ?", "🐱"],
  ["pattes. Une araignée a 8 pattes. Combien d'araignées ?", "🕷️"],
  ["œufs. Une boîte contient 6 œufs. Combien de boîtes ?", "🥚"],
  ["élèves. On fait des équipes de 5. Combien d'équipes ?", "🧒"],
  ["jours. Une semaine a 7 jours. Combien de semaines ?", "📅"],
  ["chaussettes. Une paire, c'est 2 chaussettes. Combien de paires ?", "🧦"],
  ["bonbons, à partager entre 3 amis. Combien pour chacun ?", "🍬"]
];

// Train de l'alphabet : [nom de la lettre dit à voix haute, lettre]
export const LETTRES = [
  ["a", "A"], ["bé", "B"], ["cé", "C"], ["dé", "D"], ["e", "E"], ["effe", "F"], ["gé", "G"], ["ache", "H"], ["i", "I"],
  ["ji", "J"], ["ka", "K"], ["elle", "L"], ["emme", "M"], ["enne", "N"], ["o", "O"], ["pé", "P"], ["ku", "Q"], ["erre", "R"],
  ["esse", "S"], ["té", "T"], ["u", "U"], ["vé", "V"], ["double vé", "W"], ["ixe", "X"], ["i grec", "Y"], ["zède", "Z"]
];
// lettres qui se ressemblent (en minuscules), proposées ensemble à partir du niveau 2
export const LETTRES_JUMELLES = [["b", "d", "p", "q"], ["m", "n", "u", "h"], ["f", "t", "l", "i"], ["a", "o", "e", "c"]];

// HYPOTHÈSE : badges
export const BADGES = [
  { id: "lecteur", emoji: "📚", titre: "Premier article", desc: "Lire un premier article" },
  { id: "calculateur", emoji: "🧮", titre: "Calculateur", desc: "Finir 10 séries de calcul" },
  { id: "elephant", emoji: "🐘", titre: "Mémoire d'éléphant", desc: "Gagner 5 jeux de paires" },
  { id: "hibou", emoji: "🦉", titre: "Hibou savant", desc: "Réviser 50 mots" },
  { id: "fusee", emoji: "🚀", titre: "Fusée du calcul", desc: "Atteindre le niveau 6 de calcul" },
  { id: "champion", emoji: "🏆", titre: "Champion", desc: "Lire 7 jours de suite" },
  { id: "savant", emoji: "🎓", titre: "Tête bien pleine", desc: "Finir 10 séries dans Apprendre" }
];

export const ANIMATIONS =["flotte", "rebond", "tourne", "zoom", "balance", "aucune"];
