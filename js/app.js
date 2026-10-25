// Démarrage de l'app et navigation entre les écrans (#accueil, #lecture…).
import { charger } from "./store.js";
import { chargerArticlesLivres, tousLesArticles, estValide } from "./articles.js";
import { chargerEnregistrements, mettreHorsLigne } from "./enregistrements.js";
import { brancherPanneauAa, session } from "./session.js";
import { taire } from "./voix.js";
import { $ } from "./outils.js";
import accueil from "./ecrans/accueil.js";
import envies from "./ecrans/envies.js";
import questionnaire from "./ecrans/questionnaire.js";
import lecture from "./ecrans/lecture.js";
import mots from "./ecrans/mots.js";
import { nombres, questions } from "./ecrans/quiz.js";
import recompense from "./ecrans/recompense.js";
import parent from "./ecrans/parent.js";

const ECRANS = { accueil, envies, questionnaire, lecture, mots, nombres, questions, recompense, parent };
// écrans qui demandent une lecture en cours
const AVEC_SESSION = ["lecture", "mots", "nombres", "questions", "recompense"];

let nettoyer = null;

function afficher() {
  let route = location.hash.slice(1) || "accueil";
  if (!ECRANS[route] || (AVEC_SESSION.includes(route) && !session())) route = "accueil";
  taire();
  $("#bulle").classList.remove("visible");
  $("#voile-aa").classList.remove("visible");
  if (nettoyer) { nettoyer(); nettoyer = null; }
  const ecran = document.createElement("section");
  ecran.className = "ecran ecran-" + route;
  $("#app").replaceChildren(ecran);
  scrollTo(0, 0);
  nettoyer = ECRANS[route](ecran) || null;
}

async function demarrer() {
  try {
    await charger();
  } catch (e) {
    $("#app").innerHTML = `<div class="vide">Impossible d'ouvrir les données de l'iPad.<br>${e}</div>`;
    return;
  }
  await chargerArticlesLivres();
  await chargerEnregistrements(tousLesArticles().map(a => a.id));
  brancherPanneauAa();
  window.addEventListener("hashchange", afficher);
  afficher();
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("sw.js");
      await navigator.serviceWorker.ready;
      // enregistrements des articles validés gardés sur l'iPad, en arrière-plan
      mettreHorsLigne(tousLesArticles().filter(a => estValide(a.id)).map(a => a.id));
    } catch (e) { console.warn("Hors ligne indisponible", e); }
  }
}

demarrer();
