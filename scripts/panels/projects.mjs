// Cartes projets : assets/projects/*.svg. Largeur intrinsèque 400 (grille commune), sans width forcé dans le README.
import { writeFile } from "node:fs/promises";
import { ASSETS, BG, LINE, INK, MUTED, F, M, esc } from "./tokens.mjs";

const W = 400, H = 184, PAD = 24;
const cards = [
  ["speckitlab", "speckitlab", "Spec-Driven Development pour Claude Code.", "TYPESCRIPT · CLAUDE CODE"],
  ["cupel", "cupel", "Audit local des skills d'agents IA.", "AUDIT · AGENTS"],
  ["communikey", "communikey", "Bus de messages chiffré pour agents de code.", "GO · CHIFFREMENT"],
  ["prochain", "Le prochain", "En construction. Il sortira quand il sera prêt, pas avant.", "BIENTÔT", true],
];

for (const [i, [file, name, desc, tags, soon]] of cards.entries()) {
  const frame = soon ? `stroke="${LINE}" stroke-dasharray="4 4"` : `stroke="${LINE}"`;
  const arrow = soon ? "" : `\n  <text x="${W - PAD}" y="40" text-anchor="end" ${M} font-size="14" fill="${MUTED}">↗</text>`;
  await writeFile(`${ASSETS}/projects/${file}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`${name} : ${desc}`)}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" ${frame}/>
  <text x="${PAD}" y="40" ${M} font-size="11" letter-spacing="3" fill="${MUTED}">0${i + 1} / 0${cards.length}</text>${arrow}
  <text x="${PAD}" y="88" ${F} font-size="26" font-weight="800" fill="${soon ? MUTED : INK}">${esc(name)}</text>
  <text x="${PAD}" y="116" ${F} font-size="13" fill="${MUTED}">${esc(desc)}</text>
  <line x1="${PAD}" y1="140.5" x2="${W - PAD}" y2="140.5" stroke="${LINE}"/>
  <text x="${PAD}" y="164" ${M} font-size="11" letter-spacing="2" fill="${MUTED}">${esc(tags)}</text>
</svg>
`);
}
console.log(`[panels] projects/*.svg (${cards.length})`);
