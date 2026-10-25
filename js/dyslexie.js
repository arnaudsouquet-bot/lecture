// Aides dyslexie : découpage en syllabes, lettres muettes, b/d/p/q, découpage en mots et en phrases.
// Le découpage est automatique (règles du français écrit) : il peut se tromper sur quelques mots rares.

const VOYELLES = "aàâäeéèêëiîïoôöuùûüyœæ";
const estVoyelle = c => VOYELLES.includes(c);

// graphèmes voyelles / consonnes d'un mot en minuscules
function unites(m) {
  const u = [];
  for (let i = 0; i < m.length;) {
    const r = m.slice(i);
    let t;
    if (/^(ch|ph|th|gn|qu)/.test(r)) t = { s: r.slice(0, 2), v: false };
    else if (/^gu[eéèêiy]/.test(r)) t = { s: "gu", v: false };
    else if (r.startsWith("ll") && m[i - 1] === "i") t = { s: "ll", v: false };
    else if (r[0] === "y" && i === 0 && estVoyelle(r[1] || "")) t = { s: "y", v: false };
    else {
      const g = r.match(/^(eau|œu|oeu|œi|eui|uei|ou|où|oi|ai|aî|ei|au|eu)/);
      t = g ? { s: g[0], v: true } : { s: r[0], v: estVoyelle(r[0]) };
      // voyelle nasale (an, en, in, on, un…) suivie d'une consonne autre que n/m, ou en fin de mot
      const nm = m.slice(i + t.s.length).match(/^[nm](?![aàâäeéèêëiîïoôöuùûüyœnm])/);
      if (t.v && nm && /^(a|e|i|o|u|y|ai|ei|oi)$/.test(t.s)) t.s += nm[0];
    }
    u.push(t); i += t.s.length;
  }
  // i, u, ou, y + voyelle restent ensemble (lion, oui) ; e final après voyelle aussi (vie, tortue)
  for (let k = 0; k < u.length - 1; k++) {
    const a = u[k], b = u[k + 1];
    const eFinal = b.s === "e" && u.slice(k + 2).every(x => x.s === "s");
    if (a.v && b.v && (["i", "u", "ou", "y", "ü"].includes(a.s) || eFinal)) { a.s += b.s; u.splice(k + 1, 1); k--; }
  }
  return u;
}

const inseparables = (x, y) => /^(b|c|d|f|g|k|p|t|v|ph|ch|th)$/.test(x) && /^(l|r)$/.test(y);

// longueurs des syllabes écrites : « reptile » → [3, 2, 2]
export function syllabesDe(m) {
  const u = unites(m), voy = u.map((x, k) => (x.v ? k : -1)).filter(k => k >= 0);
  if (voy.length < 2) return [m.length];
  const debuts = [0];
  for (let j = 1; j < voy.length; j++) {
    const a = voy[j - 1], b = voy[j], c = b - a - 1;
    if (c === 0) debuts.push(b);
    else if (c === 1) debuts.push(b - 1);
    else if (c === 2) debuts.push(inseparables(u[a + 1].s, u[a + 2].s) ? a + 1 : b - 1);
    else debuts.push(inseparables(u[b - 2].s, u[b - 1].s) ? b - 2 : b - 1);
  }
  return debuts.map((d, k) => u.slice(d, k + 1 < debuts.length ? debuts[k + 1] : u.length).reduce((n, x) => n + x.s.length, 0));
}

const FINALE_PRONONCEE = new Set(["bus", "autobus", "ours", "os", "fils", "mars", "sens", "atlas", "cactus", "virus", "maïs", "hélas",
  "ananas", "tennis", "jadis", "iris", "lys", "oasis", "bonus", "campus", "express", "tournevis", "vis", "gaz", "quiz", "sud",
  "huit", "sept", "net", "but", "brut", "août", "ouest", "zut", "chut", "dix", "six"]);
const ER_PRONONCE = new Set(["hiver", "super", "hier", "fier", "cancer", "laser", "hamster", "amer", "enfer", "revolver",
  "cuiller", "poker", "bunker", "scooter", "cluster", "mer", "fer", "ver", "cher", "hamburger", "joker", "starter"]);

// positions des lettres muettes dans un mot en minuscules
export function lettresMuettes(m, verbesEnt) {
  const muet = new Set(), n = m.length;
  for (let i = 0; i < n; i++) if (m[i] === "h" && !"cpstg".includes(m[i - 1] || "#")) muet.add(i);
  // -ent des verbes au pluriel (ils pondent) : impossible à deviner, l'article fournit la liste
  if (verbesEnt && verbesEnt.has(m)) { muet.add(n - 1).add(n - 2).add(n - 3); return muet; }
  if (n < 2 || FINALE_PRONONCEE.has(m) || /ct$/.test(m)) return muet;
  // r de l'infinitif en -er (chasser), sauf les mots où il se prononce
  if (/er$/.test(m) && !ER_PRONONCE.has(m) && syllabesDe(m).length > 1) { muet.add(n - 1); return muet; }
  let k = n - 1, fin = 0;
  while (k > 0 && fin < 2) {
    const c = m[k];
    const ok = c === "s" || c === "t" || c === "d" || (c === "z" && m[k - 1] === "e")
      || (c === "p" && ("um".includes(m[k - 1]) || /^(trop|sirop|galop)$/.test(m)))
      || (c === "x" && (m[k - 1] === "u" || /(oi|ri)x$/.test(m.slice(0, k + 1))));
    if (!ok) break;
    muet.add(k); k--; fin++;
  }
  // e final muet : après une voyelle (vie, année) ou dans un mot de 2 syllabes et plus (reptile, petites)
  const apresVoyelle = estVoyelle(m[k - 1] || "") && !/[qg]u$/.test(m.slice(0, k));
  if (m[k] === "e" && (fin === 0 || m.slice(k + 1) === "s") && (apresVoyelle || syllabesDe(m).length > 1)) muet.add(k);
  return muet;
}

function motDecore(mot, verbesEnt) {
  const m = mot.toLowerCase(), muet = lettresMuettes(m, verbesEnt);
  let html = "", i = 0;
  syllabesDe(m).forEach((n, k) => {
    html += `<span class="${k % 2 ? "sb" : "sa"}">`;
    for (let j = 0; j < n; j++, i++) {
      const c = mot[i], cls = muet.has(i) ? "mu" : "bdpq".includes(m[i]) ? "l-" + m[i] : "";
      html += cls ? `<span class="${cls}">${c}</span>` : c;
    }
    html += "</span>";
  });
  return html;
}

// colore syllabes, lettres muettes et b/d/p/q dans les textes du conteneur, sans changer le texte lu
export function decorer(conteneur, verbesEnt = new Set()) {
  const marche = document.createTreeWalker(conteneur, NodeFilter.SHOW_TEXT), noeuds = [];
  while (marche.nextNode()) noeuds.push(marche.currentNode);
  const modele = document.createElement("template");
  noeuds.forEach(n => {
    if (n.parentElement.closest(".nb, .hp, .dire-choix, .sans-deco")) return;
    const t = n.textContent, frag = document.createDocumentFragment();
    let dernier = 0;
    for (const r of t.matchAll(/[a-zàâäéèêëîïôöùûüÿçœæ]+/gi)) {
      frag.append(t.slice(dernier, r.index));
      modele.innerHTML = motDecore(r[0], verbesEnt);
      frag.append(modele.content.cloneNode(true));
      dernier = r.index + r[0].length;
    }
    frag.append(t.slice(dernier));
    n.replaceWith(frag);
  });
}

// entoure chaque mot d'un <span class="w"> avec sa position dans le texte lu à voix haute et son numéro de phrase
export function decouperMots(conteneur) {
  const mots = [];
  let pos = 0;
  const marche = noeud => {
    [...noeud.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(bout => {
          if (!bout) return;
          if (/^\s+$/.test(bout)) frag.append(bout);
          else {
            const s = document.createElement("span");
            s.className = "w"; s.textContent = bout;
            mots.push({ el: s, debut: pos });
            frag.append(s);
          }
          pos += bout.length;
        });
        n.replaceWith(frag);
      } else marche(n);
    });
  };
  marche(conteneur);
  let ph = 0;
  mots.forEach(m => {
    if (m.el.closest("h2")) { m.el.dataset.ph = -1; return; }
    m.el.dataset.ph = ph;
    if (/[.!?]$/.test(m.el.textContent)) ph++;
  });
  return { mots, nbPhrases: ph };
}
