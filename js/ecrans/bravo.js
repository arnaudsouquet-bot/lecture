// Fin d'un jeu de Mémoire ou de Mathématique : étoiles gagnées, niveau, nouveaux jeux débloqués, nouveaux badges.
import { BADGES } from "../config.js";
import { etat, dernierResultat, jeu } from "../jeux.js";
import { aller, nommer } from "../session.js";
import { direSuite } from "../voix.js";
import { PHRASES } from "../phrases.js";
import { $, esc, compter, confettis } from "../outils.js";

export default function bravo(ecran) {
  const r = dernierResultat();
  if (!r) { aller("accueil"); return; }
  const gagnes = etat().badges, n = r.niveau;
  const niveauHTML = !n ? "" : n.apres > n.avant
    ? `<div class="carte annonce monte"><span class="emo anim-rebond">⬆️</span><div><b>Niveau ${n.apres} !</b><br><span class="petit-gris">${esc(jeu(n.jeu).titre)} : niveau ${n.apres} sur ${n.max}</span></div></div>`
    : n.apres < n.avant
      ? `<div class="carte annonce"><span class="emo">💪</span><div><b>On s'entraîne encore un peu</b><br><span class="petit-gris">Retour au niveau ${n.apres}</span></div></div>`
      : `<div class="petit-gris" style="font-size:20px">${esc(jeu(n.jeu).titre)} : niveau ${n.apres} sur ${n.max}</div>`;
  ecran.innerHTML = `
    <div class="bravo">
      <h1>${esc(nommer("Bravo"))} ! 🎉</h1>
      <div class="gros">⭐ +<span id="n">0</span> étoile${r.etoiles > 1 ? "s" : ""}</div>
      ${niveauHTML}
      ${r.debloques.map(j => `<div class="carte annonce debloque"><span class="emo anim-rebond">🔓</span>
        <div><b>Nouveau jeu : ${j.emoji} ${esc(j.titre)}</b><br><span class="petit-gris">${esc(j.desc)}</span></div></div>`).join("")}
      ${r.nouveaux.map(b => `<div class="carte annonce"><span class="emo anim-rebond">${b.emoji}</span>
        <div><b>Nouveau badge : ${esc(b.titre)}</b><br><span class="petit-gris">${esc(b.desc)}</span></div></div>`).join("")}
      <div class="collection">${BADGES.map(b => `<span class="${gagnes.includes(b.id) ? "" : "gris"}" title="${esc(b.titre)} : ${esc(b.desc)}">${b.emoji}</span>`).join("")}</div>
      <div class="petit-gris" style="font-size:20px">Tu as ${etat().etoiles} étoiles en tout.</div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center">
        <button class="bouton clair" id="accueil">🏠 Accueil</button>
        ${r.debloques[0] ? `<button class="bouton" id="nouveau">${r.debloques[0].emoji} Essayer le nouveau jeu</button>` : ""}
        <button class="bouton vert" id="encore">${r.retour === "memoire" ? "🧠 Mémoire" : "🔢 Mathématique"}</button>
      </div>
    </div>`;
  compter($("#n", ecran), 0, r.etoiles, 1000, v => Math.round(v));
  confettis(ecran, r.debloques.length || (n && n.apres > n.avant) ? 120 : 60);
  const parole = [PHRASES.gagneEtoiles];
  if (n && n.apres > n.avant) parole.push(PHRASES.niveauSuivant);
  else if (n && n.apres < n.avant) parole.push(PHRASES.niveauDescend);
  r.debloques.forEach(j => parole.push(PHRASES.nouveauJeu, j.titre));
  if (r.nouveaux.length) parole.push(PHRASES.nouveauBadge, ...r.nouveaux.map(b => b.titre));
  direSuite(parole.map(texte => ({ texte })));
  $("#accueil", ecran).onclick = () => aller("accueil");
  $("#encore", ecran).onclick = () => aller(r.retour);
  if (r.debloques[0]) $("#nouveau", ecran).onclick = () => aller(r.debloques[0].id);
}
