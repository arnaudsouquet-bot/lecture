// 5 · Défi des nombres et 6 · Questions de compréhension.
import { POINTS_PREMIER_ESSAI, POINTS_DEUXIEME_ESSAI, ESSAIS_PAR_QUESTION } from "../config.js";
import { article } from "../articles.js";
import { session, majSession, aller } from "../session.js";
import { decorer } from "../dyslexie.js";
import { dire } from "../voix.js";
import { PHRASES } from "../phrases.js";
import { $, $$, esc, etapes } from "../outils.js";

function quiz(ecran, cle) {
  const s = session(), a = article(s.article);
  if (!a) { aller("accueil"); return; }
  const liste = a.questions.filter(q => cle === "nombres" ? q.type === "calcul" : q.type !== "calcul");
  const suivant = cle === "nombres" ? "questions" : "recompense";
  const verbesEnt = new Set(a.verbes_ent || []);
  let i = (s.faites || {})[cle] || 0;

  async function finir() {
    await majSession({ etape: suivant });
    aller(suivant);
  }
  if (!liste.length || i >= liste.length) { finir(); return; }

  function question() {
    const q = liste[i], dernier = i === liste.length - 1;
    let essais = 0, fini = false;
    ecran.innerHTML = `
      <div class="entete">
        <h1>${cle === "nombres" ? "🔢 Défi des nombres" : "🧠 As-tu bien compris ?"}</h1>
        <div class="droite"><div class="points-etapes">${etapes(liste.length, i)}</div><span class="points-coin" id="pts">⭐ ${session().points}</span></div>
      </div>
      <div class="quiz">
        <div class="carte question lisible"><button class="hp" id="dire-q" aria-label="Écouter la question">🔊</button><span>${esc(q.question)}</span></div>
        ${q.aide ? `<div class="aide sans-deco">${esc(q.aide)}</div>` : ""}
        <div class="choix">${q.choix.map((c, k) => `<button data-k="${k}"><span class="txt">${esc(c)}</span><span class="dire-choix" aria-label="Écouter">🔊</span></button>`).join("")}</div>
        <div class="retour lisible" id="retour"></div>
      </div>
      <div class="bas"><button class="bouton fin" id="suiv" style="visibility:hidden">${!dernier ? "Question suivante ▶" : cle === "nombres" ? "Aux questions ▶" : "Ma récompense 🎁"}</button></div>`;

    $$(".question > span, .choix .txt", ecran).forEach(el => decorer(el, verbesEnt));
    $("#dire-q", ecran).onclick = e => dire(`${q.question} ${q.choix.join(" ? ")} ?`, { bouton: e.currentTarget });

    $$("[data-k]", ecran).forEach(b => b.onclick = async e => {
      // le 🔊 d'une réponse la lit sans la choisir
      if (e.target.closest(".dire-choix")) { dire(q.choix[+b.dataset.k]); return; }
      if (fini || b.classList.contains("faux")) return;
      essais++;
      const r = $("#retour", ecran), k = +b.dataset.k;
      if (k === q.reponse) {
        fini = true;
        const gain = essais === 1 ? POINTS_PREMIER_ESSAI : POINTS_DEUXIEME_ESSAI, t = session();
        await majSession({ points: t.points + gain, bonnes: t.bonnes + 1, total: t.total + 1, faites: { ...t.faites, [cle]: i + 1 } });
        b.classList.add("juste");
        r.className = "retour lisible ok";
        r.innerHTML = `🎉 Bravo ! +${gain} ⭐ <span style="font-weight:normal">${esc(q.explication || "")}</span>`;
        const pts = $("#pts", ecran); pts.textContent = "⭐ " + session().points; pts.classList.remove("pop"); void pts.offsetWidth; pts.classList.add("pop");
        dire(`${PHRASES.bravo} ${q.explication || ""}`);
      } else if (essais < ESSAIS_PAR_QUESTION) {
        b.classList.add("faux");
        r.className = "retour lisible encore"; r.textContent = "Presque ! Essaie encore 💪";
        dire(PHRASES.presque);
      } else {
        fini = true;
        const t = session();
        await majSession({ total: t.total + 1, faites: { ...t.faites, [cle]: i + 1 } });
        b.classList.add("faux");
        $(`[data-k="${q.reponse}"]`, ecran).classList.add("juste");
        r.className = "retour lisible"; r.textContent = "La bonne réponse est en vert. " + (q.explication || "");
        dire(`La bonne réponse est : ${q.choix[q.reponse]}. ${q.explication || ""}`);
      }
      if (fini) $("#suiv", ecran).style.visibility = "visible";
    });
    $("#suiv", ecran).onclick = () => { i++; if (i < liste.length) question(); else finir(); };
  }
  question();
}

export const nombres = ecran => quiz(ecran, "nombres");
export const questions = ecran => quiz(ecran, "questions");
