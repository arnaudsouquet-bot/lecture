// Phrases fixes dites par l'app. outils/voix.py les lit dans ce fichier pour les enregistrer avec la voix naturelle :
// garder une phrase par ligne, entre guillemets doubles. {nom} est remplacé par le nom de chaque thème.
// Pas de prénom ici : il n'est jamais envoyé au service de voix.
export const PHRASES = {
  envie: "Qu'est-ce qui te fait envie aujourd'hui ?",
  autreChose: "J'ai envie d'autre chose",
  pasEncore: "Pas encore d'article sur {nom}. Appuie sur : j'ai envie d'autre chose, pour le demander !",
  deQuoi: "De quoi as-tu envie ?",
  plait: "{nom} : qu'est-ce qui te plaît ?",
  interesse: "Qu'est-ce qui t'intéresse le plus ?",
  surQuoi: "Sur quoi aimerais-tu lire ?",
  ajouterIdee: "Tu veux ajouter une idée ?",
  autre: "Autre chose",
  resumeSujet: "Tu aimerais lire sur :",
  resumeAngles: "Ce qui t'intéresse :",
  et: "et",
  resumeIdee: "Ton idée :",
  merci: "Merci ! Tes parents vont te préparer un article.",
  bravo: "Bravo !",
  pasGrave: "Pas grave, on le reverra.",
  presque: "Presque ! Essaie encore.",
  recompense: "Bravo ! Tu as bien travaillé. Regarde ta cagnotte !",
  recompensePlaisir: "Bravo ! Tu as bien travaillé !",
  test: "Bonjour ! Le caméléon change de couleur."
};

export const remplir = (phrase, nom) => phrase.replace("{nom}", nom);
