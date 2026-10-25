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

// Étape 3 du questionnaire : ce qui l'intéresse dans le sujet choisi (jusqu'à 2 choix).
// [Arnaud 2026-10-25] les choix doivent parler du sujet (requins → leurs dents, comment ils chassent…).
// HYPOTHÈSE : 4 choix par sujet, à ajuster avec l'enfant ; « Un peu de tout » est ajouté à chaque liste.
export const UN_PEU_DE_TOUT = ["Un peu de tout", "🎲"];
export const ANGLES_PAR_SUJET = {
  // Animaux
  "Les requins": [["Le requin le plus grand", "🐋"], ["Comment ils chassent", "🎯"], ["Leurs dents", "🦷"], ["Sont-ils dangereux ?", "⚠️"]],
  "Les félins": [["Le guépard, le plus rapide", "🐆"], ["Comment ils chassent", "🎯"], ["Les bébés félins", "🐾"], ["Le chat de la maison", "🐈"]],
  "Les insectes": [["Les fourmis et leur colonie", "🐜"], ["Les abeilles et le miel", "🐝"], ["Les papillons", "🦋"], ["Les insectes les plus forts", "💪"]],
  "Les oiseaux": [["Comment ils volent", "🪶"], ["Les oiseaux qui ne volent pas", "🐧"], ["Les nids et les œufs", "🥚"], ["Les oiseaux les plus rapides", "🦅"]],
  "Les serpents": [["Les serpents venimeux", "⚠️"], ["Comment ils mangent", "🐭"], ["Le serpent le plus long", "📏"], ["Pourquoi ils changent de peau", "🔄"]],
  "Les animaux de la ferme": [["Les vaches et le lait", "🐄"], ["Les poules et les œufs", "🐔"], ["Les cochons", "🐷"], ["Les chevaux", "🐴"]],
  // Sciences
  "Les expériences": [["Des expériences à la maison", "🏠"], ["Le volcan qui mousse", "🌋"], ["Ce qui flotte et ce qui coule", "⛵"], ["Mélanger les couleurs", "🎨"]],
  "L'électricité": [["D'où vient l'électricité", "⚡"], ["Les éclairs", "🌩️"], ["Comment marche une pile", "🔋"], ["Être prudent avec l'électricité", "⚠️"]],
  "Les aimants": [["Pourquoi ils s'attirent", "🧲"], ["La boussole", "🧭"], ["Les trains qui flottent", "🚄"], ["Les aimants dans la maison", "🏠"]],
  "L'eau": [["Le voyage de l'eau", "🌧️"], ["La glace et la vapeur", "🧊"], ["Pourquoi la mer est salée", "🌊"], ["L'eau dans notre corps", "💧"]],
  "La lumière et les couleurs": [["L'arc-en-ciel", "🌈"], ["Pourquoi le ciel est bleu", "🌤️"], ["Les ombres", "👤"], ["Comment on voit les couleurs", "👁️"]],
  "Les microbes": [["Les microbes qui rendent malade", "🤒"], ["Les microbes utiles", "🧀"], ["Pourquoi se laver les mains", "🧼"], ["Les vaccins", "💉"]],
  // Espace
  "Les planètes": [["Jupiter, la plus grande", "🪐"], ["Mars, la planète rouge", "🔴"], ["Les anneaux de Saturne", "💍"], ["Combien il y a de planètes", "🔢"]],
  "Les astronautes": [["La vie dans l'espace", "🚀"], ["Manger et dormir dans l'espace", "🍽️"], ["La station spatiale", "🛰️"], ["Devenir astronaute", "👩‍🚀"]],
  "Les étoiles": [["Le Soleil, notre étoile", "☀️"], ["Les constellations", "✨"], ["Pourquoi elles brillent", "💡"], ["Les étoiles filantes", "🌠"]],
  "Les fusées": [["Comment une fusée décolle", "🔥"], ["La plus grande fusée", "📏"], ["Aller sur la Lune", "🌙"], ["Les fusées qui reviennent", "🔄"]],
  "Les trous noirs": [["C'est quoi, un trou noir ?", "🕳️"], ["Pourquoi rien ne s'échappe", "🧲"], ["Le plus grand trou noir", "📏"], ["Comment on les voit", "🔭"]],
  "La Lune": [["Les premiers pas sur la Lune", "👣"], ["Pourquoi elle change de forme", "🌗"], ["La Lune et les marées", "🌊"], ["Retourner sur la Lune", "🚀"]],
  // Nature et Terre
  "Les volcans": [["Pourquoi ils explosent", "💥"], ["La lave", "🔥"], ["Le plus grand volcan", "📏"], ["Les volcans sous la mer", "🌊"]],
  "Les orages": [["Les éclairs", "⚡"], ["Le tonnerre", "🔊"], ["Les tornades", "🌪️"], ["Se protéger de l'orage", "🏠"]],
  "Les océans": [["Les animaux des grands fonds", "🐙"], ["L'endroit le plus profond", "📏"], ["Les vagues", "🌊"], ["Protéger les océans", "♻️"]],
  "Les forêts": [["La forêt tropicale", "🌴"], ["Les plus vieux arbres", "🌳"], ["Les animaux de la forêt", "🦊"], ["Pourquoi les feuilles tombent", "🍂"]],
  "Les déserts": [["Le plus grand désert", "🏜️"], ["Les animaux du désert", "🐪"], ["Trouver de l'eau dans le désert", "💧"], ["Les déserts de glace", "🧊"]],
  "Les tremblements de terre": [["Pourquoi la terre tremble", "🌍"], ["Les tsunamis", "🌊"], ["Les maisons qui résistent", "🏠"], ["Que faire pendant un séisme", "⚠️"]],
  // Histoire
  "Les chevaliers": [["Les châteaux forts", "🏰"], ["Les armures", "🛡️"], ["Les tournois", "🐴"], ["Devenir chevalier", "⚔️"]],
  "Les pyramides": [["Comment on les a construites", "🧱"], ["Les pharaons", "👑"], ["Les momies", "🏺"], ["Les hiéroglyphes", "📜"]],
  "Les pirates": [["Les bateaux pirates", "⛵"], ["Les trésors", "💰"], ["Les pirates célèbres", "🏴‍☠️"], ["La vie à bord", "🧭"]],
  "Les Vikings": [["Les bateaux vikings", "🚢"], ["Les voyages des Vikings", "🗺️"], ["La vie dans un village viking", "🏡"], ["Les dieux vikings", "⚡"]],
  "La préhistoire": [["Les hommes des cavernes", "🔥"], ["Les peintures dans les grottes", "🎨"], ["Les mammouths", "🦣"], ["Les premiers outils", "🪓"]],
  "Les Romains": [["Les gladiateurs", "⚔️"], ["Les routes romaines", "🛣️"], ["La ville de Rome", "🏛️"], ["L'armée romaine", "🛡️"]],
  // Géographie
  "Les pays du monde": [["Le plus grand pays", "🌍"], ["Le plus petit pays", "📍"], ["Les langues du monde", "🗣️"], ["Les enfants du monde", "🧒"]],
  "Les montagnes": [["La plus haute montagne", "⛰️"], ["Comment naissent les montagnes", "🌍"], ["Les animaux de montagne", "🐐"], ["Grimper l'Everest", "🧗"]],
  "Les fleuves": [["Le fleuve le plus long", "📏"], ["D'où vient l'eau des fleuves", "💧"], ["Les fleuves de France", "🇫🇷"], ["Les barrages", "🏗️"]],
  "Les capitales": [["Paris", "🗼"], ["Les capitales d'Europe", "🇪🇺"], ["Les plus grandes villes", "🏙️"], ["Les monuments célèbres", "🗽"]],
  "Les drapeaux": [["Le drapeau de la France", "🇫🇷"], ["Pourquoi ces couleurs ?", "🎨"], ["Les drapeaux étonnants", "🤯"], ["Les drapeaux d'Europe", "🇪🇺"]],
  "Les îles": [["Les îles volcaniques", "🌋"], ["La plus grande île", "📏"], ["Les îles françaises", "🏝️"], ["Vivre sur une île", "🏠"]],
  // Corps humain
  "Le cœur": [["Comment il bat", "❤️"], ["Le voyage du sang", "🩸"], ["Garder un cœur en forme", "🏃"], ["Le cœur des animaux", "🐋"]],
  "Le cerveau": [["Comment on se souvient", "🧠"], ["Pourquoi on rêve", "💭"], ["Les cinq sens", "👀"], ["Apprendre à lire", "📖"]],
  "Le squelette": [["Combien on a d'os", "🔢"], ["Le plus petit os", "🔍"], ["Comment un os se répare", "🩹"], ["Les articulations", "🦵"]],
  "Les dents": [["Les dents de lait", "🦷"], ["Pourquoi se brosser les dents", "🪥"], ["Les dents des animaux", "🦈"], ["Chez le dentiste", "👩‍⚕️"]],
  "Les muscles": [["Le muscle le plus fort", "💪"], ["Comment on bouge", "🏃"], ["Les muscles du visage", "😀"], ["Devenir plus fort", "🏋️"]],
  "Le sommeil": [["Pourquoi on dort", "😴"], ["Les rêves", "💭"], ["Combien de temps dormir", "⏰"], ["Le sommeil des animaux", "🦉"]],
  // Le futur
  "Les robots": [["Les robots qui aident", "🤖"], ["Les robots dans l'espace", "🚀"], ["Les robots qui parlent", "💬"], ["Construire un robot", "🔧"]],
  "Les voitures du futur": [["Les voitures sans conducteur", "🚗"], ["Les voitures électriques", "🔋"], ["Les voitures volantes", "✈️"], ["Les voitures les plus rapides", "🏎️"]],
  "Vivre sur Mars": [["Le voyage jusqu'à Mars", "🚀"], ["Respirer sur Mars", "💨"], ["Une maison sur Mars", "🏠"], ["Les robots sur Mars", "🤖"]],
  "Les villes du futur": [["Les tours géantes", "🏙️"], ["Les villes sous la mer", "🌊"], ["Les villes pleines d'arbres", "🌳"], ["Les transports du futur", "🚄"]],
  "Les métiers du futur": [["Inventeur", "💡"], ["Astronaute", "👩‍🚀"], ["Soigner les animaux", "🐾"], ["Protéger la planète", "🌍"]],
  "L'énergie de demain": [["L'énergie du soleil", "☀️"], ["Les éoliennes", "🌬️"], ["L'énergie de l'eau", "💧"], ["Économiser l'énergie", "💡"]],
  // Les inventions
  "La roue": [["Qui a inventé la roue", "⚙️"], ["Les premiers chariots", "🐴"], ["Le vélo", "🚲"], ["Les roues autour de nous", "🔄"]],
  "L'avion": [["Les premiers avions", "🛩️"], ["Comment un avion vole", "✈️"], ["Le plus grand avion", "📏"], ["Le métier de pilote", "👨‍✈️"]],
  "Le téléphone": [["Le premier téléphone", "☎️"], ["Comment la voix voyage", "📡"], ["Les téléphones portables", "📱"], ["Parler avec le monde entier", "🌍"]],
  "L'ordinateur": [["Le premier ordinateur", "💻"], ["Comment il calcule", "🔢"], ["Internet", "🌐"], ["Les jeux vidéo", "🎮"]],
  "Le train": [["La locomotive à vapeur", "🚂"], ["Le TGV", "🚄"], ["Les trains les plus rapides", "⚡"], ["Le tunnel sous la mer", "🌊"]],
  "Les inventions d'enfants": [["Des enfants inventeurs", "🧒"], ["Les inventions faites par hasard", "🍀"], ["Inventer à la maison", "🏠"], ["Les objets de tous les jours", "🧷"]]
};

// choix généraux, si un sujet n'a pas encore de liste à lui
export const ANGLES = [
  ["Les records : le plus grand, le plus rapide", "🏆"],
  ["Comment ça marche", "⚙️"],
  ["Comment ils vivent", "🏠"],
  ["Les secrets étonnants", "🤯"],
  ["Les dangers", "⚠️"],
  ["Les chiffres et les calculs", "🔢"]
];

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
