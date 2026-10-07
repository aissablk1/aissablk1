// « Ce que j'explore » : catégories groupées par paires. Chaque rangée est UN SVG de 880 (deux panneaux côte à côte),
// donc réduit par GitHub exactement comme les grands panneaux ; sa variante mobile (360) empile les deux panneaux.
// Sorties : assets/explore/row-N.svg, assets/m/explore/row-N.svg, bloc EXPLORE du README.
import { writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { ASSETS, BG, SURF, LINE, INK, MUTED, M, esc, icon, GUTTER, inject } from "./tokens.mjs";

// [titre affiché, texte alternatif, [[étiquette, logo Simple Icons ?]]]
// Règle : une marque a son logo ; un savoir-faire (ou un outil sans logo libre) reste du texte.
const cats = [
  ["LANGAGES", "Langages", [["TypeScript", "typescript"], ["JavaScript", "javascript"], ["Go", "go"], ["Rust", "rust"], ["Python", "python"], ["Luau", "luau"], ["Swift", "swift"], ["Shell", "gnubash"], ["Ruby", "ruby"], ["Perl", "perl"], ["HTML", "html5"], ["CSS", "css"]]],
  ["AGENTS & IA", "Agents et IA", [["Claude Code", "claude"], ["Cursor", "cursor"], ["Codex", "openai@13.0.0"], ["OpenCode", "opencode"], ["Ollama", "ollama"], ["MCP", "modelcontextprotocol"], ["Hermes"], ["Tous les agents"]]],
  ["WEB", "Web", [["Next.js", "nextdotjs"], ["Tailwind", "tailwindcss"], ["Vercel", "vercel"], ["GSAP", "gsap"], ["Motion"]]],
  ["ODOO", "Odoo", [["Odoo", "odoo"], ["Consultant"], ["Maîtrise complète"]]],
  ["INFRA & SÉCURITÉ", "Infra et sécurité", [["GitHub Actions", "githubactions"], ["Cloudflare", "cloudflare"], ["Supabase", "supabase"], ["Homebrew", "homebrew"], ["Audit"], ["Pentest"]]],
  ["IDENTITÉ GRAPHIQUE", "Identité graphique", [["Figma", "figma"], ["Charte graphique"], ["Logo"], ["Motion design"]]],
  ["MARKETING", "Marketing", [["SEO"], ["Copywriting"], ["Contenu"], ["Acquisition"]]],
  ["HARDWARE & RADIO", "Hardware et radio", [["Meshtastic"], ["Radio maillée longue portée"]]],
];

const CH = 32, GAP = 8, CHAR = 7.4, TOP = 56;

// Placement des étiquettes dans un panneau de largeur PW (retour à la ligne calculé).
const layout = ([, , chips], PW, PAD) => {
  let x = PAD, line = 0;
  const placed = chips.map(([name, ic]) => {
    const w = Math.ceil(24 + (ic ? 22 : 0) + name.length * CHAR);
    if (x + w > PW - PAD) { x = PAD; line++; }
    const p = { name, ic, x, y: TOP + line * (CH + GAP), w };
    x += w + GAP;
    return p;
  });
  return { placed, h: TOP + (line + 1) * CH + line * GAP + PAD };
};

// Un panneau opaque posé en (X, Y) ; l'espace entre panneaux reste transparent (fond de la page).
const panel = async (cat, L, X, Y, PW, PH, PAD) => {
  let s = `  <rect x="${X}" y="${Y}" width="${PW}" height="${PH}" fill="${BG}"/>
  <rect x="${X + 0.5}" y="${Y + 0.5}" width="${PW - 1}" height="${PH - 1}" fill="none" stroke="${LINE}"/>
  <text x="${X + PAD}" y="${Y + 36}" ${M} font-size="11" letter-spacing="3" fill="${MUTED}">${esc(cat[0])}</text>
  <text x="${X + PW - PAD}" y="${Y + 36}" text-anchor="end" ${M} font-size="11" fill="${MUTED}">${String(cat[2].length).padStart(2, "0")}</text>\n`;
  for (const c of L.placed) {
    const cx = X + c.x, cy = Y + c.y;
    s += `  <rect x="${cx + 0.5}" y="${cy + 0.5}" width="${c.w - 1}" height="${CH - 1}" fill="${SURF}" stroke="${LINE}"/>\n`;
    let tx = cx + 12;
    if (c.ic) {
      s += `  <g transform="translate(${tx} ${cy + 9}) scale(0.5833)">${await icon(c.ic)}</g>\n`;
      tx += 22;
    }
    s += `  <text x="${tx}" y="${cy + 20}" ${M} font-size="12" fill="${INK}">${esc(c.name)}</text>\n`;
  }
  return s;
};

const svg = (W, H, label, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
${body}</svg>
`;

await mkdir(`${ASSETS}/explore`, { recursive: true });
await mkdir(`${ASSETS}/m/explore`, { recursive: true });
// Les rangées sont recalculées à chaque passage : on retire les fichiers d'une génération précédente.
for (const dir of [`${ASSETS}/explore`, `${ASSETS}/m/explore`])
  for (const f of await readdir(dir)) if (f.endsWith(".svg")) await unlink(`${dir}/${f}`);

const md = [];
for (let r = 0; r * 2 < cats.length; r++) {
  const pair = cats.slice(r * 2, r * 2 + 2);
  const label = pair.map((c) => `${c[1]} : ${c[2].map(([n]) => n).join(", ")}`).join(" ; ");
  const file = `row-${r + 1}.svg`;

  // Desktop 880 : deux panneaux de 436 séparés par la gouttière de 8 (même grille que projets et contact).
  const PW = (880 - GUTTER) / 2;
  const Ld = pair.map((c) => layout(c, PW, 24));
  const Hd = Math.max(...Ld.map((l) => l.h));
  let body = "";
  for (const [k, c] of pair.entries()) body += await panel(c, Ld[k], k * (PW + GUTTER), 0, PW, Hd, 24);
  await writeFile(`${ASSETS}/explore/${file}`, svg(880, Hd, label, body));

  // Mobile 360 : panneaux empilés, chacun à sa hauteur, séparés par la même gouttière.
  const Lm = pair.map((c) => layout(c, 360, 20));
  let y = 0, bodyM = "";
  for (const [k, c] of pair.entries()) {
    bodyM += await panel(c, Lm[k], 0, y, 360, Lm[k].h, 20);
    y += Lm[k].h + GUTTER;
  }
  await writeFile(`${ASSETS}/m/explore/${file}`, svg(360, y - GUTTER, label, bodyM));

  // Une ligne sans espace : les rangées s'enchaînent dans le même paragraphe que les cartes (même interligne).
  md.push(`<picture><source media="(max-width: 600px)" srcset="assets/m/explore/${file}"><img src="assets/explore/${file}" width="100%" alt="${esc(label)}"></picture>`);
}
await inject("EXPLORE", `<p>\n${md.join("")}\n</p>`);
console.log(`[panels] explore (${md.length} rangées) + README`);
