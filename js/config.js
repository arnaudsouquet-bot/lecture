// Réglages de l'app. Les valeurs marquées HYPOTHÈSE sont des propositions à valider par les parents.

// argent de poche, maximum 5 €
export const PLAFOND_EUROS = 5;            // HYPOTHÈSE : par semaine (lundi → dimanche)
export const EUROS_PAR_POINT = 0.05;       // HYPOTHÈSE : 1 point = 0,05 €
export const POINTS_PREMIER_ESSAI = 2;     // HYPOTHÈSE
export const POINTS_DEUXIEME_ESSAI = 1;    // HYPOTHÈSE
export const ESSAIS_PAR_QUESTION = 2;      // HYPOTHÈSE : ensuite la réponse est montrée et expliquée
export const UN_SEUL_ARTICLE_PAYE_PAR_JOUR = true; // HYPOTHÈSE

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
// HYPOTHÈSE : liste à compléter.
export const THEMES = [
  { cle: "animaux", nom: "Animaux", emoji: "🐾", sujets: [
    ["Les requins", "🦈"], ["Les félins", "🐆"], ["Les insectes", "🐜"],
    ["Les oiseaux", "🦅"], ["Les serpents", "🐍"], ["Les animaux de la ferme", "🐄"]] },
  { cle: "univers", nom: "Univers", emoji: "🪐", sujets: [
    ["Les planètes", "🪐"], ["Les astronautes", "👩‍🚀"], ["Les étoiles", "⭐"],
    ["Les fusées", "🚀"], ["Les trous noirs", "🕳️"], ["La Lune", "🌙"]] },
  { cle: "sciences", nom: "Sciences", emoji: "🔬", sujets: [
    ["Les expériences", "🧪"], ["L'électricité", "⚡"], ["Les aimants", "🧲"],
    ["L'eau", "💧"], ["La lumière et les couleurs", "🌈"], ["Les microbes", "🦠"]] },
  { cle: "corps", nom: "Corps humain", emoji: "🫀", sujets: [
    ["Le cœur", "❤️"], ["Le cerveau", "🧠"], ["Le squelette", "🦴"],
    ["Les dents", "🦷"], ["Les muscles", "💪"], ["Le sommeil", "😴"]] },
  { cle: "dinosaures", nom: "Dinosaures", emoji: "🦖", sujets: [
    ["Le T-Rex", "🦖"], ["Les géants à long cou", "🦕"], ["Les reptiles volants", "🦅"],
    ["La fin des dinosaures", "☄️"], ["Les fossiles", "🦴"], ["Les monstres marins", "🌊"]] },
  { cle: "nature", nom: "Nature et Terre", emoji: "🌋", sujets: [
    ["Les volcans", "🌋"], ["Les orages", "⛈️"], ["Les océans", "🌊"],
    ["Les forêts", "🌳"], ["Les déserts", "🏜️"], ["Les tremblements de terre", "🌍"]] },
  { cle: "machines", nom: "Machines", emoji: "⚙️", sujets: [
    ["Les voitures de course", "🏎️"], ["Les trains", "🚄"], ["Les avions", "✈️"],
    ["Les robots", "🤖"], ["Les sous-marins", "🚢"], ["Les ordinateurs", "💻"]] },
  { cle: "histoire", nom: "Histoire", emoji: "🏰", sujets: [
    ["Les chevaliers", "⚔️"], ["Les pyramides", "🏺"], ["Les pirates", "🏴‍☠️"],
    ["Les Vikings", "🛡️"], ["La préhistoire", "🔥"], ["Les Romains", "🏛️"]] },
  { cle: "sport", nom: "Sport", emoji: "⚽", sujets: [
    ["Le football", "⚽"], ["Les Jeux olympiques", "🏅"], ["Le vélo", "🚴"],
    ["La natation", "🏊"], ["Le basket", "🏀"], ["Les records du monde", "🏆"]] }
];

// Étape 3 du questionnaire : ce qui l'intéresse dans le sujet (jusqu'à 2 choix)
export const ANGLES = [
  ["Les records : le plus grand, le plus rapide", "🏆"],
  ["Comment ça marche", "⚙️"],
  ["Comment ils vivent", "🏠"],
  ["Les secrets étonnants", "🤯"],
  ["Les dangers", "⚠️"],
  ["Les chiffres et les calculs", "🔢"]
];

export const ANIMATIONS = ["flotte", "rebond", "tourne", "zoom", "balance", "aucune"];
