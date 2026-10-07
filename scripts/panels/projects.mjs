// Cartes projets en grille proportionnelle (2 par rangée, width="50%") :
// assets/projects/*.svg (desktop, 440) + assets/m/projects/*.svg (mobile, 180) + bloc PROJECTS du README.
import { writeFile, mkdir } from "node:fs/promises";
import { ASSETS, BG, LINE, INK, MUTED, F, M, esc, wrap, HALF, HALF_M, offset, cellW, cell, rows, inject } from "./tokens.mjs";

// Uniquement des dépôts PUBLICS et existants (vérifier : GET https://api.github.com/repos/aissablk1/<nom>).
const cards = [
  { file: "speckitlab", name: "speckitlab", desc: "Spec-Driven Development pour Claude Code.", tags: ["TYPESCRIPT", "CLAUDE CODE"], href: "https://github.com/aissablk1/speckitlab" },
  { file: "cupel", name: "cupel", desc: "Audit local des skills d'agents IA.", tags: ["AUDIT", "AGENTS"], href: "https://github.com/aissablk1/cupel" },
  { file: "communikey", name: "communikey", desc: "Bus de messages chiffré pour agents de code.", tags: ["GO", "CHIFFREMENT"], href: "https://github.com/aissablk1/communikey" },
  { file: "prochain", name: "Le prochain", desc: "En construction. Il sortira quand il sera prêt, pas avant.", tags: ["BIENTÔT"], soon: true },
];

const svg = (W, H, i, c, body) => {
  const x0 = offset(i), cw = cellW(W);
  const frame = c.soon ? `stroke="${LINE}" stroke-dasharray="4 4"` : `stroke="${LINE}"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`${c.name} : ${c.desc}`)}">
  <rect x="${x0}" width="${cw}" height="${H}" fill="${BG}"/>
  <rect x="${x0 + 0.5}" y="0.5" width="${cw - 1}" height="${H - 1}" fill="none" ${frame}/>
${body(x0, cw)}</svg>
`;
};

// Desktop : 440 × 184, mêmes tailles de texte que les grands panneaux (même échelle d'affichage).
const desktop = (c, i) =>
  svg(HALF, 184, i, c, (x0, cw) => {
    const P = 24;
    return `  <text x="${x0 + P}" y="40" ${M} font-size="11" letter-spacing="3" fill="${MUTED}">0${i + 1} / 0${cards.length}</text>
${c.soon ? "" : `  <text x="${x0 + cw - P}" y="40" text-anchor="end" ${M} font-size="14" fill="${MUTED}">↗</text>\n`}  <text x="${x0 + P}" y="88" ${F} font-size="26" font-weight="800" fill="${c.soon ? MUTED : INK}">${esc(c.name)}</text>
  <text x="${x0 + P}" y="116" ${F} font-size="13" fill="${MUTED}">${esc(c.desc)}</text>
  <line x1="${x0 + P}" y1="140.5" x2="${x0 + cw - P}" y2="140.5" stroke="${LINE}"/>
  <text x="${x0 + P}" y="164" ${M} font-size="11" letter-spacing="2" fill="${MUTED}">${esc(c.tags.join(" · "))}</text>
`;
  });

// Mobile : 180 de large (affiché ~171 px à côté de sa voisine), texte replié, hauteur égalisée par paire.
const P_M = 12;
const mobileLayout = (c) => {
  const desc = wrap(c.desc, 26);
  const tags = wrap(c.tags.join(" · "), 21, " · "); // coupe entre deux tags, jamais au milieu d'un tag
  const descTop = 72;
  const rule = descTop + (desc.length - 1) * 15 + 16;
  return { desc, tags, rule, h: rule + 12 + tags.length * 14 + 10 };
};
const mobile = (c, i, H, L) =>
  svg(HALF_M, H, i, c, (x0, cw) =>
    [
      `  <text x="${x0 + P_M}" y="26" ${M} font-size="9" letter-spacing="2" fill="${MUTED}">0${i + 1} / 0${cards.length}</text>`,
      c.soon ? "" : `  <text x="${x0 + cw - P_M}" y="26" text-anchor="end" ${M} font-size="12" fill="${MUTED}">↗</text>`,
      `  <text x="${x0 + P_M}" y="54" ${F} font-size="18" font-weight="800" fill="${c.soon ? MUTED : INK}">${esc(c.name)}</text>`,
      ...L.desc.map((l, j) => `  <text x="${x0 + P_M}" y="${72 + j * 15}" ${F} font-size="11" fill="${MUTED}">${esc(l)}</text>`),
      `  <line x1="${x0 + P_M}" y1="${L.rule + 0.5}" x2="${x0 + cw - P_M}" y2="${L.rule + 0.5}" stroke="${LINE}"/>`,
      ...L.tags.map((l, j) => `  <text x="${x0 + P_M}" y="${L.rule + 22 + j * 14}" ${M} font-size="9" letter-spacing="1" fill="${MUTED}">${esc(l)}</text>`),
    ]
      .filter(Boolean)
      .join("\n") + "\n",
  );

await mkdir(`${ASSETS}/projects`, { recursive: true });
await mkdir(`${ASSETS}/m/projects`, { recursive: true });
const layouts = cards.map(mobileLayout);
for (const [i, c] of cards.entries()) {
  const pair = i % 2 === 0 ? [i, i + 1] : [i - 1, i];
  const H = Math.max(...pair.filter((k) => layouts[k]).map((k) => layouts[k].h));
  await writeFile(`${ASSETS}/projects/${c.file}.svg`, desktop(c, i));
  await writeFile(`${ASSETS}/m/projects/${c.file}.svg`, mobile(c, i, H, layouts[i]));
}

const cells = cards.map((c) =>
  cell({ href: c.href, desktop: `assets/projects/${c.file}.svg`, mobile: `assets/m/projects/${c.file}.svg`, alt: `${c.name} : ${c.desc}` }),
);
await inject("PROJECTS", rows(cells));
console.log(`[panels] projects (${cards.length}) + README`);
