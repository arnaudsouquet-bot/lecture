// 7 · Récompense : points gagnés, conversion en argent de poche, cagnotte de la semaine.
import { PLAFOND_EUROS } from "../config.js";
import { article } from "../articles.js";
import { cagnotteSemaine, noterLecture } from "../progres.js";
import { session, finirSession, aller, nommer } from "../session.js";
import { dire } from "../voix.js";
import { $, esc, euros, compter, confettis, jour, pluriel } from "../outils.js";

// 0,70 → « 70 centimes » ; 1,20 → « 1 euro 20 »
function montantParle(v) {
  const e = Math.floor(v + 1e-9), c = Math.round((v - e) * 100);
  if (!e) return `${c} centimes`;
  return `${e} ${e > 1 ? "euros" : "euro"}${c ? " " + c : ""}`;
}

export default function recompense(ecran) {
  const s = session(), a = article(s.article);
  const avant = cagnotteSemaine();
  const minutes = Math.max(1, Math.round((Date.now() - s.debut) / 60000));
  const entree = { date: jour(), article: s.article, titre: s.titre, points: s.points, bonnes: s.bonnes, total: s.total, minutes, paye: s.paye };

  ecran.innerHTML = `
    <div class="recompense">
      <h1>${esc(nommer("Bravo"))} ! 🎉</h1>
      <div class="etoiles">⭐ <span id="pts">0</span> ${s.points > 1 ? "points" : "point"}</div>
      <div class="euros" id="euros"></div>
      <div class="carte cagnotte" style="width:620px;max-width:100%">
        <div style="display:flex;align-items:center;gap:20px;width:100%">
          <div class="cochon anim-rebond" style="font-size:80px" id="cochon">🐷</div>
          <div style="flex:1">
            <div class="montant" style="font-size:44px" id="cagnotte">${euros(avant)}</div>
            <div class="jauge"><div id="jauge" style="width:${avant / PLAFOND_EUROS * 100}%"></div></div>
            <div class="jauge-legende"><span>0 €</span><span>${PLAFOND_EUROS} €</span></div>
          </div>
        </div>
      </div>
      <div class="resume">
        <span class="puce">📚 ${pluriel(a ? a.mots.length : 3, "nouveau mot", "nouveaux mots")}</span>
        <span class="puce">✅ ${s.bonnes} sur ${s.total}</span>
        <span class="puce">⏱️ ${pluriel(minutes, "minute")} de lecture</span>
      </div>
      <button class="bouton vert" id="fin" style="margin-top:10px">À demain ! 👋</button>
    </div>`;

  // la lecture est notée une seule fois, puis la session est close
  noterLecture(entree).then(finirSession).then(() => {
    const nouvelle = cagnotteSemaine(), gagne = Math.round((nouvelle - avant) * 100) / 100;
    const txt = $("#euros", ecran);
    if (!s.paye) txt.textContent = "Lecture pour le plaisir : l'argent de poche, c'est une fois par jour.";
    else if (gagne <= 0 && avant >= PLAFOND_EUROS) txt.textContent = "Ta cagnotte est déjà pleine cette semaine !";
    else compter(txt, 0, gagne, 1200, v => "= " + euros(v) + " pour ta cagnotte");
    setTimeout(() => {
      compter($("#cagnotte", ecran), avant, nouvelle, 1200, euros);
      $("#jauge", ecran).style.width = (nouvelle / PLAFOND_EUROS * 100) + "%";
      if (gagne > 0) {
        const c = $("#cochon", ecran).getBoundingClientRect();
        for (let k = 0; k < 5; k++) {
          const p = document.createElement("div");
          p.className = "piece"; p.textContent = "🪙";
          p.style.left = c.left + 10 + "px"; p.style.top = c.top - 40 + "px"; p.style.animationDelay = k * 0.18 + "s";
          ecran.append(p); setTimeout(() => p.remove(), 2200);
        }
      }
    }, 1300);
    const parole = s.paye && gagne > 0
      ? `${nommer("Bravo")} ! Tu as gagné ${s.points} points. Ça fait ${montantParle(gagne)} pour ta cagnotte.`
      : `${nommer("Bravo")} ! Tu as gagné ${s.points} points.`;
    dire(parole);
  });

  compter($("#pts", ecran), 0, s.points, 1200, v => Math.round(v));
  confettis(ecran);
  $("#fin", ecran).onclick = () => aller("accueil");
}
