// Espace parent : argent de poche, validation des articles, envies de l'enfant, prompt pour Claude, réglages, sauvegarde.
import { PLAFOND_EUROS, EUROS_PAR_POINT, POINTS_PREMIER_ESSAI, POINTS_DEUXIEME_ESSAI, THEMES, BADGES, NIVEAUX_CALCUL } from "../config.js";
import { etat as etatJeux, niveauCalcul, changerNiveauCalcul } from "../jeux.js";
import { lire, ecrire } from "../store.js";
import { tousLesArticles, estValide, valider, verifier, nombreDeMots, dejaLu, texteBrut } from "../articles.js";
import { cagnotteSemaine, verseSemaine, resteAVerser, marquerPaye, motsAppris } from "../progres.js";
import { aller, message, ouvrirAa, reglages, changerReglage, prenom, nommer } from "../session.js";
import { exporter, importerSauvegarde } from "../export.js";
import { promptClaude } from "../prompt.js";
import { voixFrancaises, nomVoix, nomVoixEnregistree, dire } from "../voix.js";
import { PHRASES } from "../phrases.js";
import { estEnregistre, mettreHorsLigne } from "../enregistrements.js";
import { $, $$, esc, euros, dateCourte, lundi } from "../outils.js";

export default function parent(ecran) {
  // barrière parentale : un calcul
  const a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4);
  ecran.innerHTML = `
    <div class="garde">
      <h1 style="font-size:34px">Espace parent</h1>
      <div style="font-size:26px">Combien font ${a} × ${b} ?</div>
      <input id="rep" inputmode="numeric" autocomplete="off" aria-label="Réponse">
      <div style="display:flex;gap:14px;justify-content:center">
        <button class="bouton clair petit" id="retour">◀ Retour</button>
        <button class="bouton petit" id="ok">Entrer</button>
      </div>
    </div>`;
  const rep = $("#rep", ecran);
  rep.focus();
  $("#retour", ecran).onclick = () => aller("accueil");
  const tenter = () => {
    if (+rep.value.trim() === a * b) afficherParent(ecran);
    else { rep.value = ""; rep.style.animation = "secoue .5s"; setTimeout(() => (rep.style.animation = ""), 600); }
  };
  $("#ok", ecran).onclick = tenter;
  rep.onkeydown = e => { if (e.key === "Enter") tenter(); };
}

function afficherParent(ecran) {
  const semaine = lundi(), articles = tousLesArticles(), jeux = etatJeux();
  const envies = lire("envies", []), journal = lire("journal", []).slice(-12).reverse();
  const versements = lire("versements", []).slice(-4).reverse();
  const mots = motsAppris().sort((x, y) => (y.appris || "").localeCompare(x.appris || ""));
  const theme = cle => (THEMES.find(t => t.cle === cle) || { nom: cle }).nom;
  const etatMot = m => !m.prochaine ? ["su", "ok"] : m.boite > 1 ? [`révision (boîte ${m.boite})`, "ok"] : ["nouveau", "att"];

  ecran.classList.add("parent");
  ecran.innerHTML = `
    <div class="entete">
      <h1>⚙️ Espace parent</h1>
      <div class="droite"><button class="bouton clair petit" id="retour">◀ Retour</button></div>
    </div>
    <div class="parent-grille">

      <div class="carte">
        <h2>🐷 Argent de poche</h2>
        <div class="ligne"><span>Gagné cette semaine</span><b>${euros(cagnotteSemaine(semaine))} / ${PLAFOND_EUROS} €</b></div>
        <div class="ligne"><span>Déjà versé</span><span>${euros(verseSemaine(semaine))}</span></div>
        <div class="ligne"><span>Reste à verser</span><b>${euros(resteAVerser(semaine))}</b></div>
        ${versements.map(v => `<div class="ligne petit-gris"><span>Versé le ${dateCourte(v.date)}</span><span>${euros(v.montant)}</span></div>`).join("")}
        <div class="actions"><button class="mini plein" id="payer" ${resteAVerser(semaine) ? "" : "disabled"}>Marquer ${euros(resteAVerser(semaine))} comme payé</button></div>
        <p class="petit-gris">Règle : ${POINTS_PREMIER_ESSAI} points par bonne réponse du 1er coup, ${POINTS_DEUXIEME_ESSAI} au 2ᵉ ;
          1 point = ${euros(EUROS_PAR_POINT)} ; maximum ${PLAFOND_EUROS} € par semaine ; seul le 1er article du jour rapporte. Modifiable dans <code>js/config.js</code>.</p>
      </div>

      <div class="carte">
        <h2>📚 Articles</h2>
        ${articles.map(x => `
          <div class="ligne">
            <span>${x.emoji || "📄"} ${esc(x.titre)}<br><span class="petit-gris">${theme(x.theme)} · ${nombreDeMots(x)} mots · ${x.source}${estEnregistre(x.id) ? " · 🔊 voix enregistrée" : ""}${dejaLu(x.id) ? " · lu" : ""}</span></span>
            <span>${estValide(x.id) ? `<span class="statut ok">Validé</span>` : `<span class="statut att">À relire</span>`}
              <button class="mini" data-apercu="${esc(x.id)}">Aperçu</button></span>
          </div>`).join("") || `<p class="petit-gris">Aucun article.</p>`}
        <p class="petit-gris">L'IA propose, vous validez : l'enfant ne voit que les articles validés. Relisez les faits avant de valider.</p>
      </div>

      <div class="carte">
        <h2>💡 Envies${esc(prenom() ? " de " + prenom() : "")}</h2>
        ${envies.map((e, k) => ({ e, k })).reverse().map(({ e, k }) => `
          <div class="ligne" style="${e.faite ? "opacity:.5" : ""}">
            <span><b>${esc(e.sujet || e.idee)}</b> <span class="petit-gris">${dateCourte(e.date)}</span><br>
              <span class="petit-gris">${[e.theme ? theme(e.theme) : "", ...(e.angles || []), e.sujet && e.idee ? "« " + esc(e.idee) + " »" : ""].filter(Boolean).join(" · ")}</span></span>
            <span><button class="mini plein" data-prompt="${k}">Prompt Claude</button> <button class="mini" data-faite="${k}">${e.faite ? "À refaire" : "Fait"}</button></span>
          </div>`).join("") || `<p class="petit-gris">Pas encore d'envie. L'enfant peut en envoyer avec « J'ai envie d'autre chose ».</p>`}
        <div class="actions"><button class="mini" data-prompt="libre">Prompt Claude sans envie</button></div>
        <p class="petit-gris">« Prompt Claude » copie une demande prête à coller dans claude.ai. Collez ensuite le JSON obtenu ci-dessous.</p>
      </div>

      <div class="carte">
        <h2>📥 Importer un article</h2>
        <textarea id="json" placeholder="Collez ici le JSON donné par Claude"></textarea>
        <div class="actions">
          <button class="mini plein" id="importer">Importer</button>
          <label class="mini">Choisir un fichier .json<input type="file" id="fichier-article" accept=".json,application/json" hidden></label>
        </div>
        <div class="erreurs" id="erreurs"></div>
        <p class="petit-gris">L'article arrive « À relire » : ouvrez son aperçu pour le valider.</p>
      </div>

      <div class="carte">
        <h2>📅 Journal</h2>
        ${journal.map(j => `<div class="ligne"><span>${dateCourte(j.date)} · ${esc(j.titre || j.article)}</span><span>${j.bonnes}/${j.total} · ${j.points} pts · ${j.minutes} min${j.paye ? "" : " · plaisir"}</span></div>`).join("")
          || `<p class="petit-gris">Aucune lecture pour l'instant.</p>`}
      </div>

      <div class="carte">
        <h2>📒 Carnet de mots (${mots.length})</h2>
        ${mots.slice(0, 15).map(m => { const [t, c] = etatMot(m); return `<div class="ligne"><span>${esc(m.mot)} <span class="petit-gris">${esc(m.definition)}</span></span><span class="statut ${c}">${t}</span></div>`; }).join("")
          || `<p class="petit-gris">Les mots appris apparaîtront ici.</p>`}
      </div>

      <div class="carte">
        <h2>⭐ Mémoire et maths</h2>
        <div class="ligne"><span>Étoiles</span><b>${jeux.etoiles}</b></div>
        <div class="ligne"><span>Badges</span><span>${BADGES.map(b => `<span title="${esc(b.titre)} : ${esc(b.desc)}" style="${jeux.badges.includes(b.id) ? "" : "filter:grayscale(1);opacity:.3"}">${b.emoji}</span>`).join(" ")}</span></div>
        <div class="ligne"><span>Niveau de calcul</span><select id="niveau-calcul">${NIVEAUX_CALCUL.map((n, k) => `<option value="${k + 1}" ${k + 1 === niveauCalcul() ? "selected" : ""}>${k + 1}. ${esc(n.titre)}</option>`).join("")}</select></div>
        <div class="ligne"><span>Retiens et retrouve</span><span>${jeux.niveauRetiens} images</span></div>
        <div class="ligne petit-gris"><span>Séries de calcul · paires gagnées · mots révisés</span><span>${jeux.compteurs.seriesCalcul || 0} · ${jeux.compteurs.pairesGagnees || 0} · ${jeux.compteurs.motsRevises || 0}</span></div>
        <p class="petit-gris">Les étoiles ne donnent pas d'argent de poche. Le niveau de calcul monte tout seul (8 sur 10 du premier coup) ; vous pouvez le changer ici.</p>
      </div>

      <div class="carte">
        <h2>🔧 Enfant, voix et lecture</h2>
        <div class="ligne"><span>Prénom</span><input id="prenom" value="${esc(prenom())}" placeholder="pour « Bonjour … ! »" autocomplete="off" style="font:inherit;font-size:16px;padding:6px 10px;border-radius:8px;border:1px solid #b9b2a4;width:200px"></div>
        <div class="ligne"><span>Voix des articles</span><b>${esc(nomVoixEnregistree() || "aucun enregistrement")}</b></div>
        <div class="ligne"><span>Voix de secours</span><select id="voix"><option value="">Automatique (${esc(nomVoix() || "aucune voix française")})</option>
          ${voixFrancaises().map(v => `<option ${v.name === reglages().voix ? "selected" : ""}>${esc(v.name)}</option>`).join("")}</select></div>
        <div class="ligne"><span>Vitesse <b id="vitesse-val">${reglages().vitesse}</b></span><input type="range" id="vitesse" min="0.6" max="1.1" step="0.05" value="${reglages().vitesse}"></div>
        <div class="actions"><button class="mini" id="tester">🔊 Tester la voix</button><button class="mini" id="aa">Réglages « Aa »</button></div>
        <p class="petit-gris">Les articles enregistrés (outils/voix.py) sont lus avec la voix naturelle. La voix de secours, celle de l'iPad, ne sert que pour ce qui n'est pas enregistré : article importé sur l'iPad, idée tapée par l'enfant.</p>
      </div>

      <div class="carte">
        <h2>💾 Sauvegarde</h2>
        <p class="petit-gris" style="margin-top:0">Les données restent sur cet iPad. Exportez-les régulièrement (iOS peut effacer les données d'un site peu utilisé).</p>
        <div class="actions">
          <button class="mini plein" id="exporter">Exporter les données</button>
          <label class="mini">Importer une sauvegarde<input type="file" id="fichier-sauvegarde" accept=".json,application/json" hidden></label>
        </div>
      </div>
    </div>

    <div class="voile" id="voile-apercu"><div class="carte aa apercu" id="apercu" style="width:900px"></div></div>`;

  const recharger = () => afficherParent(ecran);
  $("#retour", ecran).onclick = () => aller("accueil");
  $("#payer", ecran).onclick = async () => { await marquerPaye(semaine); message("Versement noté ✔"); recharger(); };

  // articles : aperçu et validation
  $$("[data-apercu]", ecran).forEach(btn => btn.onclick = () => apercu(ecran, articles.find(x => x.id === btn.dataset.apercu), recharger));

  // envies : prompt pour Claude
  $$("[data-prompt]", ecran).forEach(btn => btn.onclick = () => copier(promptClaude(btn.dataset.prompt === "libre" ? null : envies[+btn.dataset.prompt])));
  $$("[data-faite]", ecran).forEach(btn => btn.onclick = async () => {
    const liste = [...envies], k = +btn.dataset.faite;
    liste[k] = { ...liste[k], faite: !liste[k].faite };
    await ecrire("envies", liste); recharger();
  });

  // import d'un article
  const importer = async texte => {
    const err = $("#erreurs", ecran);
    let a;
    try { a = JSON.parse(texte.trim().replace(/^```(json)?|```$/g, "")); }
    catch (e) { err.textContent = "Ce n'est pas du JSON valide : " + e.message; return; }
    const pb = verifier(a);
    if (pb.length) { err.innerHTML = "À corriger :<br>" + pb.map(esc).join("<br>"); return; }
    const autres = lire("importes", []).filter(x => x.id !== a.id);
    await ecrire("importes", [...autres, { ...a, importe_le: new Date().toISOString() }]);
    await valider(a.id, false);
    message("Article importé : à relire puis valider");
    recharger();
  };
  $("#importer", ecran).onclick = () => importer($("#json", ecran).value);
  $("#fichier-article", ecran).onchange = async e => { const f = e.target.files[0]; if (f) importer(await f.text()); };

  $("#niveau-calcul", ecran).onchange = async e => { await changerNiveauCalcul(+e.target.value); message("Niveau de calcul changé ✔"); };

  // prénom (gardé seulement sur l'iPad) et voix
  $("#prenom", ecran).onchange = e => { changerReglage("prenom", e.target.value.trim()); message("Prénom enregistré ✔"); };
  $("#voix", ecran).onchange = e => changerReglage("voix", e.target.value);
  $("#vitesse", ecran).oninput = e => { changerReglage("vitesse", +e.target.value); $("#vitesse-val", ecran).textContent = e.target.value; };
  $("#tester", ecran).onclick = e => dire(PHRASES.test, { bouton: e.currentTarget });
  $("#aa", ecran).onclick = ouvrirAa;

  // sauvegarde
  $("#exporter", ecran).onclick = exporter;
  $("#fichier-sauvegarde", ecran).onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { if (await importerSauvegarde(await f.text())) location.reload(); }
    catch (x) { alert("Sauvegarde illisible : " + x.message); }
  };
}

function apercu(ecran, a, recharger) {
  const voile = $("#voile-apercu", ecran), valide = estValide(a.id), importe = a.source === "importé";
  $("#apercu", ecran).innerHTML = `
    <div class="entete" style="margin-bottom:8px"><h1 style="font-size:26px">${a.emoji || ""} ${esc(a.titre)}</h1>
      <div class="droite"><button class="mini" id="fermer">Fermer</button></div></div>
    <p class="petit-gris">${nombreDeMots(a)} mots · ${a.pages.length} pages · ${a.auteur ? "rédigé par : " + esc(a.auteur) : ""}</p>
    <h3>Les 3 mots</h3>
    ${a.mots.map(m => `<div><b>${esc(m.mot)}</b> (${m.syllabes.map(esc).join("-")}) : ${esc(m.definition)}</div>`).join("")}
    ${a.pages.map((p, i) => `<h3>${i + 1}. ${esc(p.titre || "")} ${p.emoji || ""}</h3><div>${esc(texteBrut(p.texte))}</div>`).join("")}
    <h3>Questions</h3>
    ${a.questions.map(q => `<div class="q">${q.type === "calcul" ? "🔢" : "🧠"} ${esc(q.question)}<br>${q.choix.map((c, k) => `<span class="${k === q.reponse ? "bon" : ""}">${esc(c)}</span>`).join(" · ")}</div>`).join("")}
    <div class="actions" style="position:sticky;bottom:0;background:var(--carte);padding:12px 0">
      <button class="mini plein" id="basculer">${valide ? "Retirer la validation" : "✔ Valider : l'enfant peut le lire"}</button>
      ${importe ? `<button class="mini danger" id="supprimer">Supprimer</button>` : ""}
    </div>`;
  voile.classList.add("visible");
  $("#fermer", ecran).onclick = () => voile.classList.remove("visible");
  $("#basculer", ecran).onclick = async () => {
    await valider(a.id, !valide);
    if (!valide) mettreHorsLigne([a.id]); // son enregistrement est gardé sur l'iPad
    message(valide ? "Validation retirée" : "Article validé ✔"); recharger();
  };
  if (importe) $("#supprimer", ecran).onclick = async () => {
    if (!confirm(`Supprimer « ${a.titre} » de cet iPad ?`)) return;
    await ecrire("importes", lire("importes", []).filter(x => x.id !== a.id));
    await valider(a.id, false); recharger();
  };
}

async function copier(texte) {
  try { await navigator.clipboard.writeText(texte); message("Prompt copié : collez-le dans claude.ai"); }
  catch {
    // presse-papiers refusé : on affiche le texte à copier à la main
    const t = document.createElement("textarea");
    t.value = texte; t.style.cssText = "position:fixed;inset:10%;z-index:30;width:80%;height:70%";
    t.onblur = () => t.remove();
    document.body.append(t); t.focus(); t.select();
    message("Sélectionnez tout et copiez");
  }
}
