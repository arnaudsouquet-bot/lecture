// 4 · Mes 3 mots : les mots du jour, tirés du texte qu'il vient de lire, puis les révisions.
import { article, phraseDuTexte } from "../articles.js";
import { apprendre, reviser, motsAReviser } from "../progres.js";
import { session, majSession, aller } from "../session.js";
import { dire } from "../voix.js";
import { $, $$, esc, etapes, syllabesHTML } from "../outils.js";

export default function mots(ecran) {
  const s = session(), a = article(s.article);
  if (!a) { aller("accueil"); return; }
  const revisions = motsAReviser(a.mots.map(m => m.mot));
  const cartes = [...a.mots.map(m => ({ ...m, rev: false })), ...revisions.map(m => ({ ...m, rev: true }))];
  let i = Math.min(s.motIndex || 0, cartes.length - 1);

  async function suite() {
    await apprendre(a.mots.map(({ mot, syllabes, emoji, definition, exemple }) => ({ mot, syllabes, emoji, definition, exemple })), a.id);
    const etape = a.questions.some(q => q.type === "calcul") ? "nombres" : "questions";
    await majSession({ etape });
    aller(etape);
  }

  function afficher() {
    const m = cartes[i], ctx = m.rev ? null : phraseDuTexte(a, m.mot);
    const nouveaux = a.mots.length;
    ecran.innerHTML = `
      <div class="entete">
        <h1>${m.rev ? "Tu te souviens ? 🧠" : `Mot ${i + 1} sur ${nouveaux}`}</h1>
        <div class="droite"><div class="points-etapes">${etapes(cartes.length, i)}</div></div>
      </div>
      <div class="carte mot-carte">
        <div class="mot-image"><span class="anim-rebond" style="display:inline-block">${m.emoji || "📘"}</span></div>
        <div class="lisible">
          <span class="etiquette ${m.rev ? "rev" : ""}">${m.rev ? "Révision" : "Nouveau mot"}</span>
          <div class="mot-grand"><button class="hp" id="dire-mot" aria-label="Écouter le mot">🔊</button><span>${syllabesHTML(m.syllabes)}</span></div>
          ${ctx ? `<div class="mot-ctx"><button class="hp" id="dire-ctx" aria-label="Écouter la phrase">🔊</button><span><span class="ou">📖 Dans ton texte, page ${ctx.page} :</span>« ${ctx.html} »</span></div>` : ""}
          <div class="mot-def"><button class="hp" id="dire-def" aria-label="Écouter la définition">🔊</button><span>${esc(m.definition)}</span></div>
          ${!ctx && m.exemple ? `<div class="mot-ex">« ${esc(m.exemple)} »</div>` : ""}
        </div>
      </div>
      <div class="bas">
        <button class="bouton clair petit" id="prec" style="visibility:${i ? "visible" : "hidden"}">◀ Retour</button>
        <span class="fin">${m.rev
          ? `<button class="bouton clair petit" data-rev="0">🔁 Pas encore</button> <button class="bouton vert petit" data-rev="1">✅ Je sais</button>`
          : `<button class="bouton" id="suiv">${i < cartes.length - 1 ? "Mot suivant ▶" : "Continuer ▶"}</button>`}</span>
      </div>`;

    $("#dire-mot", ecran).onclick = e => dire(`${m.mot}. ${m.syllabes.join(", ")}. ${m.mot}.`, { bouton: e.currentTarget });
    $("#dire-def", ecran).onclick = e => dire(ctx || !m.exemple ? m.definition : `${m.definition} ${m.exemple}`, { bouton: e.currentTarget });
    if (ctx) $("#dire-ctx", ecran).onclick = e => dire(ctx.texte, { bouton: e.currentTarget });
    $("#prec", ecran).onclick = () => { if (i) { i--; majSession({ motIndex: i }); afficher(); } };
    const avancer = () => { if (i < cartes.length - 1) { i++; majSession({ motIndex: i }); afficher(); } else suite(); };
    const suiv = $("#suiv", ecran); if (suiv) suiv.onclick = avancer;
    $$("[data-rev]", ecran).forEach(b => b.onclick = async () => {
      await reviser(m.mot, b.dataset.rev === "1");
      dire(b.dataset.rev === "1" ? "Bravo !" : "Pas grave, on le reverra.");
      avancer();
    });
  }
  afficher();
}
