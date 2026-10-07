// Bloc « Me parler » : panneau citation (desktop 880) + boutons cliquables 400×64 (assets/contact/*.svg).
import { writeFile } from "node:fs/promises";
import { ASSETS, BG, LINE, INK, MUTED, F, M, esc, icon } from "./tokens.mjs";

await writeFile(`${ASSETS}/contact.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="200" viewBox="0 0 880 200" role="img" aria-label="${esc("Me parler : quelqu'un qui ne lâche jamais rien, tout en restant à l'écoute.")}">
  <rect width="880" height="200" fill="${BG}"/>
  <rect x="0.5" y="0.5" width="879" height="199" fill="none" stroke="${LINE}"/>
  <text x="40" y="46" ${M} font-size="11" letter-spacing="4" fill="${MUTED}">ME PARLER</text>
  <text x="40" y="96" ${F} font-size="26" font-weight="800" fill="${INK}">${esc("« Quelqu'un qui ne lâche jamais rien,")}</text>
  <text x="40" y="128" ${F} font-size="26" font-weight="800" fill="${INK}">${esc("tout en restant à l'écoute. »")}</text>
  <text x="40" y="168" ${F} font-size="13" fill="${MUTED}">${esc("C'est comme ça qu'on me décrit. Une idée, un projet, une envie de créer ? C'est exactement ce que j'aime.")}</text>
</svg>
`);

// Icônes dessinées à la main (grille 24) pour ce qui n'est pas une marque.
const MAIL = `<rect x="2.5" y="5.5" width="19" height="13" fill="none" stroke="${INK}" stroke-width="1.5"/><polyline points="3,6 12,13 21,6" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
const GLOBE = `<circle cx="12" cy="12" r="9.5" fill="none" stroke="${INK}" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="4" ry="9.5" fill="none" stroke="${INK}" stroke-width="1.5"/><line x1="2.5" y1="12" x2="21.5" y2="12" stroke="${INK}" stroke-width="1.5"/>`;

const W = 400, H = 64;
const tiles = [
  ["mail", "ÉCRIRE", "aissabelkoussa.fr/contact", MAIL],
  ["site", "SITE", "aissabelkoussa.fr", GLOBE],
  ["linkedin", "LINKEDIN", "linkedin.com/in/aissabelkoussa", await icon("linkedin@10.4.0")],
  ["github", "GITHUB", "github.com/aissablk1", await icon("github")],
];
for (const [file, label, sub, glyph] of tiles) {
  await writeFile(`${ASSETS}/contact/${file}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`${label} : ${sub}`)}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${LINE}"/>
  <g transform="translate(24 22) scale(0.8333)">${glyph}</g>
  <text x="60" y="30" ${M} font-size="12" letter-spacing="2" fill="${INK}">${esc(label)}</text>
  <text x="60" y="46" ${M} font-size="10" fill="${MUTED}">${esc(sub)}</text>
  <text x="${W - 24}" y="37" text-anchor="end" ${M} font-size="14" fill="${MUTED}">↗</text>
</svg>
`);
}
console.log(`[panels] contact.svg + contact/*.svg (${tiles.length})`);
