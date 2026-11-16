// Petit échiquier dessiné (SVG) pour les articles sur les échecs [Arnaud 2026-11-16].
// Dans une page de fiche : "echiquier": { "position": "<placement FEN>", "cases": ["e4"], "danger": ["f7"], "fleches": [["d1", "h5"]] }
// position : la première partie d'une notation FEN (rangée 8 d'abord, lettres anglaises : K roi, Q dame, R tour, B fou, N cavalier,
// P pion ; majuscules = blancs, minuscules = noirs ; chiffres = cases vides).
// cases : cases en jaune (à regarder) ; danger : cases en rouge (pièce en prise, case attaquée) ; fleches : un coup ou une attaque.

// pièces pleines pour les deux camps (les blanches sont coloriées en blanc) ; \uFE0E : jamais d'emoji sur l'iPad
const DESSINS = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
const COLONNES = "abcdefgh";

export function caseValide(c) {
  return typeof c === "string" && /^[a-h][1-8]$/.test(c);
}
export function positionValide(position) {
  const rangees = String(position || "").split("/");
  return rangees.length === 8 && rangees.every(r => /^[kqrbnpKQRBNP1-8]+$/.test(r) &&
    [...r].reduce((n, x) => n + (/\d/.test(x) ? +x : 1), 0) === 8);
}

const centre = c => [COLONNES.indexOf(c[0]) + 0.5, 8 - +c[1] + 0.5];

export function echiquierHTML(e) {
  if (!e || !positionValide(e.position)) return "";
  const carres = [], pieces = [], reperes = [];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++)
    carres.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${(x + y) % 2 ? "#b58863" : "#f0d9b5"}"/>`);
  const marque = (liste, couleur) => (liste || []).filter(caseValide)
    .map(c => `<rect x="${COLONNES.indexOf(c[0])}" y="${8 - +c[1]}" width="1" height="1" fill="${couleur}"/>`).join("");
  e.position.split("/").forEach((rangee, y) => {
    let x = 0;
    for (const p of rangee) {
      if (/\d/.test(p)) { x += +p; continue; }
      pieces.push(`<text x="${x + 0.5}" y="${y + 0.56}" ${p === p.toUpperCase() ? 'fill="#fff" stroke="#222" stroke-width="0.035" paint-order="stroke"' : 'fill="#222"'}>${DESSINS[p.toLowerCase()]}\uFE0E</text>`);
      x++;
    }
  });
  for (let i = 0; i < 8; i++) {
    reperes.push(`<text x="${i + 0.5}" y="8.25" font-size="0.3" fill="#7a6a55">${COLONNES[i]}</text>`);
    reperes.push(`<text x="-0.22" y="${i + 0.55}" font-size="0.3" fill="#7a6a55">${8 - i}</text>`);
  }
  const fleches = (e.fleches || []).filter(f => Array.isArray(f) && caseValide(f[0]) && caseValide(f[1])).map(([a, b]) => {
    const [x1, y1] = centre(a), [x2, y2] = centre(b), d = Math.hypot(x2 - x1, y2 - y1), r = (d - 0.32) / d;
    return `<line x1="${x1}" y1="${y1}" x2="${x1 + (x2 - x1) * r}" y2="${y1 + (y2 - y1) * r}" stroke="#e07a10" stroke-width="0.14" stroke-linecap="round" opacity="0.9" marker-end="url(#pointe)"/>`;
  }).join("");
  return `<svg class="echiquier" viewBox="-0.45 0 8.45 8.45" role="img" aria-label="Échiquier" font-size="0.86" text-anchor="middle" dominant-baseline="middle">
    <defs><marker id="pointe" viewBox="0 0 10 10" refX="3" refY="5" markerWidth="2.6" markerHeight="2.6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#e07a10"/></marker></defs>
    ${carres.join("")}${marque(e.cases, "rgba(255,214,64,.75)")}${marque(e.danger, "rgba(229,57,53,.6)")}${pieces.join("")}${fleches}${reperes.join("")}
  </svg>`;
}
