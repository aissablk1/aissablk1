// Panneau « Ce que je fais » (desktop 880) : assets/doing.svg.
import { writeFile, mkdir } from "node:fs/promises";
import { ASSETS, BG, LINE, INK, MUTED, F, M, esc, GLOBE, cell, rows, inject } from "./tokens.mjs";
await mkdir(`${ASSETS}/m`, { recursive: true });

const cols = [
  ["01", "Je construis", ["Des IA sur mesure et du code", "qui rend du temps aux gens.", "Seul, de bout en bout."]],
  ["02", "J'audite", ["Des architectures IA pour d'autres.", "Challenger un système vaut", "autant que le bâtir."]],
  ["03", "Je co-fonde", ["ParleCitoyen, une plateforme", "citoyenne, pour que ce que je", "code serve au-delà de moi."]],
];

let s = `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="272" viewBox="0 0 880 272" role="img" aria-label="Ce que je fais : je construis, j'audite, je co-fonde.">
  <rect width="880" height="272" fill="${BG}"/>
  <rect x="0.5" y="0.5" width="879" height="271" fill="none" stroke="${LINE}"/>
  <text x="40" y="46" ${M} font-size="11" letter-spacing="4" fill="${MUTED}">CE QUE JE FAIS</text>
  <text x="840" y="46" text-anchor="end" ${M} font-size="11" fill="${MUTED}">TROIS GESTES</text>
`;
cols.forEach(([n, title, lines], i) => {
  const x = 40 + i * 275;
  if (i) s += `  <line x1="${x - 24.5}" y1="72" x2="${x - 24.5}" y2="200" stroke="${LINE}"/>\n`;
  s += `  <text x="${x}" y="88" ${M} font-size="11" letter-spacing="3" fill="${MUTED}">${n}</text>\n`;
  s += `  <text x="${x}" y="120" ${F} font-size="20" font-weight="800" fill="${INK}">${esc(title)}</text>\n`;
  lines.forEach((l, j) => (s += `  <text x="${x}" y="${150 + j * 20}" ${F} font-size="13" fill="${MUTED}">${esc(l)}</text>\n`));
});
s += `  <line x1="40" y1="224.5" x2="840" y2="224.5" stroke="${LINE}"/>
  <text x="40" y="252" ${M} font-size="11" letter-spacing="3" fill="${INK}">${esc("DE A À Z · BUILDER & CONSULTANT · RIEN N'EST IMPOSSIBLE")}</text>
</svg>
`;
await writeFile(`${ASSETS}/doing.svg`, s);

// Lien cliquable vers la plateforme co-fondée, juste sous le panneau (rangée entière : 880 desktop, 360 mobile).
const CO = { label: "PARLECITOYEN", sub: "parlecitoyen.fr · la plateforme citoyenne que je co-fonde", href: "https://parlecitoyen.fr" };
const coSvg = (W, H, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`${CO.label} : ${CO.sub}`)}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${LINE}"/>
${body}</svg>
`;
await writeFile(`${ASSETS}/cofonde.svg`, coSvg(880, 64, `  <g transform="translate(40 22) scale(0.8333)">${GLOBE}</g>
  <text x="76" y="30" ${M} font-size="12" letter-spacing="2" fill="${INK}">${CO.label}</text>
  <text x="76" y="46" ${M} font-size="10" fill="${MUTED}">${esc(CO.sub)}</text>
  <text x="840" y="37" text-anchor="end" ${M} font-size="14" fill="${MUTED}">↗</text>
`));
await writeFile(`${ASSETS}/m/cofonde.svg`, coSvg(360, 56, `  <g transform="translate(20 18) scale(0.8333)">${GLOBE}</g>
  <text x="52" y="26" ${M} font-size="11" letter-spacing="2" fill="${INK}">${CO.label}</text>
  <text x="52" y="41" ${M} font-size="9" fill="${MUTED}">parlecitoyen.fr</text>
  <text x="340" y="33" text-anchor="end" ${M} font-size="13" fill="${MUTED}">↗</text>
`));
// Panneau + lien dans le même paragraphe : l'écart entre les deux est la gouttière de la grille, pas une marge de paragraphe.
await inject("DOING", rows([
  cell({ desktop: "assets/doing.svg", mobile: "assets/m/doing.svg", alt: "Je construis des IA sur mesure, j'audite des architectures IA, je co-fonde ParleCitoyen, une plateforme citoyenne", width: "100%" }),
  cell({ href: CO.href, desktop: "assets/cofonde.svg", mobile: "assets/m/cofonde.svg", alt: "ParleCitoyen : la plateforme citoyenne que je co-fonde", width: "100%" }),
]));
console.log("[panels] doing.svg + cofonde + README");
