// Prompt à coller dans claude.ai pour obtenir un article au format de l'app, à partir d'une envie de l'enfant.
import { THEMES } from "./config.js";
import { jour } from "./outils.js";
import { prenom } from "./session.js";

export function promptClaude(envie) {
  const theme = envie && THEMES.find(t => t.cle === envie.theme);
  const sujet = envie ? envie.sujet || envie.idee : "un sujet au choix parmi ses thèmes préférés";
  const demande = [
    `Sujet : ${sujet}`,
    theme ? `Thème : ${theme.nom} (clé "${theme.cle}")` : "",
    envie && envie.angles && envie.angles.length ? `Ce qui l'intéresse le plus : ${envie.angles.join(" ; ")}` : "",
    envie && envie.sujet && envie.idee ? `Son idée à lui : « ${envie.idee} »` : ""
  ].filter(Boolean).join("\n");

  // le prénom vient des réglages de l'iPad : il n'est jamais écrit dans le code publié
  const enfant = prenom() ? `${prenom()}, un enfant de 8 ans` : "un enfant de 8 ans";
  return `Écris un article de lecture pour ${enfant}, dyslexique, qui a des difficultés à lire. Il lit sur iPad, avec une voix qui peut lire pour lui.

${demande}

Contraintes :
- Environ 450 à 500 mots, répartis en 10 pages. Chaque page : un titre court, 4 à 6 phrases courtes (12 mots au plus), vocabulaire simple, ton enthousiaste.
- Des faits vrais et vérifiables uniquement. Pas d'à-peu-près : si un chiffre est incertain, écris « environ » ou ne le donne pas.
- L'app est axée sur les nombres : mets des nombres concrets dans au moins 5 pages (tailles, durées, quantités, records).
- 3 mots nouveaux, utiles pour comprendre le texte, qui apparaissent dans le texte.
- 3 petits calculs tirés des nombres du texte, faisables de tête à 8 ans (additions, soustractions, doubles, résultat < 100).
- 5 questions : 4 de compréhension du texte + 1 sur le sens d'un des 3 mots. 3 choix chacune, une seule bonne réponse, position de la bonne réponse variée.

Réponds uniquement avec un objet JSON valide, sans texte autour, de cette forme exacte :
{
  "format": 1,
  "id": "${jour()}_sujet-en-minuscules-sans-accents",
  "theme": "${theme ? theme.cle : THEMES.map(t => t.cle).join(" | ")}",
  "titre": "Titre de l'article",
  "emoji": "un emoji",
  "auteur": "Claude",
  "verbes_ent": ["tous", "les", "verbes", "du", "texte", "conjugués", "en", "-ent", "muet", "comme", "pondent", "vivent"],
  "mots": [
    { "mot": "mot1", "syllabes": ["syl", "la", "bes"], "emoji": "🌿", "definition": "Définition très simple.", "exemple": "Une phrase d'exemple hors du texte." }
  ],
  "pages": [
    { "titre": "Titre de la page", "emoji": "🦎", "anim": "flotte", "texte": "Phrases de la page." }
  ],
  "questions": [
    { "type": "calcul", "question": "…", "aide": "68 − 3 = ?", "choix": ["71", "65", "61"], "reponse": 1, "explication": "68 moins 3, ça fait 65." },
    { "type": "comprehension", "question": "…", "choix": ["…", "…", "…"], "reponse": 0, "explication": "…" },
    { "type": "mot", "question": "Que veut dire le mot « … » ?", "choix": ["…", "…", "…"], "reponse": 2, "explication": "…" }
  ]
}

Règles du format :
- Dans "texte", marque chacun des 3 mots du jour la première fois qu'il apparaît : [[mot]] (ou [[mot|forme écrite]] si la forme change, par exemple [[espèce|espèces]]).
- Dans "texte", marque chaque nombre écrit en chiffres avec sa lecture : {{68|soixante-huit}}. Écris les nombres en chiffres dans le texte.
- "syllabes" : découpage écrit à l'école (ca-mé-lé-on), et les syllabes recollées doivent redonner exactement "mot".
- "anim" : flotte, rebond, tourne, zoom, balance ou aucune.
- "reponse" : position du bon choix, 0 pour le premier.
- "aide" (calculs seulement) : le calcul posé, ou des emojis à compter pour les petits nombres.
- 3 objets dans "mots", 10 dans "pages", 3 questions "calcul", 4 "comprehension", 1 "mot".`;
}
