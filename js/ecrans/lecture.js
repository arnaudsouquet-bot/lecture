// 3 · Lecture : l'article page par page, avec les aides dyslexie.
import { article, pageHTML } from "../articles.js";
import { session, majSession, aller, ouvrirAa, reglages, quandReglagesChangent } from "../session.js";
import { decorer, decouperMots } from "../dyslexie.js";
import { dire, taire } from "../voix.js";
import { $, esc, etapes, syllabesHTML } from "../outils.js";

export default function lecture(ecran) {
  const s = session(), a = article(s.article);
  if (!a) { aller("accueil"); return; }
  const verbesEnt = new Set(a.verbes_ent || []);
  let page = Math.min(s.page || 0, a.pages.length - 1), mots = [], nbPhrases = 0, phrase = 0;

  ecran.innerHTML = `
    <div class="entete">
      <h1>${esc(a.titre)} <span class="anim-flotte" style="display:inline-block">${a.emoji || ""}</span></h1>
      <div class="droite">
        <div class="points-etapes" id="etapes"></div>
        <span class="puce" id="num"></span>
        <button class="hp" id="aa" style="font-weight:bold;font-size:26px" aria-label="Mes réglages de lecture">Aa</button>
      </div>
    </div>
    <div class="lecture">
      <div class="illu"><span id="illu"></span></div>
      <div class="texte-page lisible" id="texte"></div>
    </div>
    <div class="bas">
      <button class="hp large" id="lis-moi">🔊 Lis-moi</button>
      <button class="bouton clair petit" id="phrase-suiv">Phrase suivante ▼</button>
      <button class="bouton clair petit" id="prec" aria-label="Page précédente">◀</button>
      <button class="bouton fin" id="suiv"></button>
    </div>`;

  const texte = $("#texte", ecran), bulle = $("#bulle");

  function majPhrase() {
    const regle = reglages().regle;
    mots.forEach(m => m.el.classList.toggle("ph-on", +m.el.dataset.ph === phrase || m.el.dataset.ph === "-1"));
    const b = $("#phrase-suiv", ecran);
    b.style.display = regle ? "" : "none";
    b.disabled = phrase >= nbPhrases - 1;
  }

  function afficherPage() {
    taire();
    bulle.classList.remove("visible");
    const p = a.pages[page], n = a.pages.length;
    $("#illu", ecran).textContent = p.emoji || "📖";
    $("#illu", ecran).className = p.anim && p.anim !== "aucune" ? "anim-" + p.anim : "";
    texte.innerHTML = `${p.titre ? `<h2 class="titre-page">${esc(p.titre)}</h2>\n` : ""}<div>${pageHTML(p.texte)}</div>`;
    ({ mots, nbPhrases } = decouperMots(texte));
    decorer(texte, verbesEnt);
    phrase = 0; majPhrase();
    texte.scrollTop = 0;
    $("#num", ecran).textContent = `Page ${page + 1} / ${n}`;
    $("#etapes", ecran).innerHTML = etapes(n, page);
    $("#prec", ecran).style.visibility = page ? "visible" : "hidden";
    $("#suiv", ecran).textContent = page < n - 1 ? "Page suivante ▶" : "Apprendre mes 3 mots ▶";
    majSession({ page });
  }

  $("#aa", ecran).onclick = ouvrirAa;
  quandReglagesChangent(() => { if (ecran.isConnected) majPhrase(); });
  $("#prec", ecran).onclick = () => { if (page) { page--; afficherPage(); } };
  $("#suiv", ecran).onclick = async () => {
    if (page < a.pages.length - 1) { page++; afficherPage(); }
    else { await majSession({ etape: "mots", motIndex: 0 }); aller("mots"); }
  };
  $("#phrase-suiv", ecran).onclick = () => { if (phrase < nbPhrases - 1) { phrase++; majPhrase(); } };
  $("#lis-moi", ecran).onclick = e => {
    if (!reglages().regle) return dire(texte.textContent, { bouton: e.currentTarget, mots });
    let pos = 0;
    const ceux = mots.filter(m => +m.el.dataset.ph === phrase).map(m => { const o = { el: m.el, debut: pos }; pos += m.el.textContent.length + 1; return o; });
    dire(ceux.map(m => m.el.textContent).join(" "), { bouton: e.currentTarget, mots: ceux });
  };

  texte.addEventListener("click", e => {
    const cible = e.target.closest(".motdujour, .nb"), w = e.target.closest(".w");
    if (w && w.dataset.ph !== "-1" && +w.dataset.ph !== phrase) { phrase = +w.dataset.ph; majPhrase(); }
    if (!cible) {
      bulle.classList.remove("visible");
      // un mot touché est lu à voix haute
      const mot = w ? w.textContent.replace(/[^\p{L}'’-]/gu, "") : "";
      if (mot) { dire(mot); w.classList.add("touche"); setTimeout(() => w.classList.remove("touche"), 900); }
      return;
    }
    if (cible.classList.contains("nb")) {
      bulle.innerHTML = `<div class="grand">${esc(cible.textContent)}</div><div>${esc(cible.dataset.lettres)}</div>`;
      dire(cible.dataset.lettres);
    } else {
      const m = a.mots.find(x => x.mot === cible.dataset.mot);
      if (!m) return;
      bulle.innerHTML = `<div class="grand" style="color:var(--vert)">${syllabesHTML(m.syllabes)}</div><div>${esc(m.definition)}</div>`;
      dire(`${m.mot}. ${m.definition}`);
    }
    const r = cible.getBoundingClientRect();
    bulle.style.left = Math.max(10, Math.min(r.left, innerWidth - 480)) + "px";
    bulle.style.top = (r.bottom + 12 + 200 > innerHeight ? r.top - 140 : r.bottom + 12) + "px";
    bulle.classList.add("visible");
  });

  afficherPage();
  return () => bulle.classList.remove("visible");
}
