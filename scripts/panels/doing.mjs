// Panneau « Ce que je fais » (desktop 880) : assets/doing.svg.
import { writeFile } from "node:fs/promises";
import { ASSETS, BG, LINE, INK, MUTED, F, M, esc } from "./tokens.mjs";

const cols = [
  ["01", "Je construis", ["Des IA sur mesure et du code", "qui rend du temps aux gens.", "Seul, de bout en bout."]],
  ["02", "J'audite", ["Des architectures IA pour d'autres.", "Challenger un système vaut", "autant que le bâtir."]],
  ["03", "Je co-fonde", ["Une plateforme citoyenne, pour", "que ce que je code serve", "au-delà de moi."]],
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
console.log("[panels] doing.svg");
