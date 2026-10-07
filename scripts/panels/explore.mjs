// « Ce que j'explore » : un panneau par catégorie (assets/explore/*.svg).
// Largeur intrinsèque 400 : deux panneaux côte à côte sur desktop, empilés sur mobile (img max-width:100%).
// Le bloc <p><img …></p> est réinjecté dans le README entre les marqueurs EXPLORE.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { ASSETS, BG, SURF, LINE, INK, MUTED, M, esc, icon } from "./tokens.mjs";

const W = 400, PAD = 24, CH = 32, GAP = 8, CHAR = 7.4, TOP = 56;
// [fichier, titre affiché, texte alternatif, [[étiquette, logo Simple Icons ?]]]
// Règle : une marque a son logo ; un savoir-faire (ou un outil sans logo libre) reste du texte.
const cats = [
  ["langages", "LANGAGES", "Langages", [["TypeScript", "typescript"], ["JavaScript", "javascript"], ["Go", "go"], ["Rust", "rust"], ["Python", "python"], ["Luau", "luau"], ["Swift", "swift"], ["Shell", "gnubash"], ["Ruby", "ruby"], ["Perl", "perl"], ["HTML", "html5"], ["CSS", "css"]]],
  ["agents", "AGENTS & IA", "Agents et IA", [["Claude Code", "claude"], ["Cursor", "cursor"], ["Codex", "openai@13.0.0"], ["OpenCode", "opencode"], ["Ollama", "ollama"], ["MCP", "modelcontextprotocol"], ["Hermes"], ["Tous les agents"]]],
  ["web", "WEB", "Web", [["Next.js", "nextdotjs"], ["Tailwind", "tailwindcss"], ["Vercel", "vercel"], ["GSAP", "gsap"], ["Motion"]]],
  ["odoo", "ODOO", "Odoo", [["Odoo", "odoo"], ["Consultant"], ["Maîtrise complète"]]],
  ["infra", "INFRA & SÉCURITÉ", "Infra et sécurité", [["GitHub Actions", "githubactions"], ["Cloudflare", "cloudflare"], ["Supabase", "supabase"], ["Homebrew", "homebrew"], ["Audit"], ["Pentest"]]],
  ["identite", "IDENTITÉ GRAPHIQUE", "Identité graphique", [["Figma", "figma"], ["Charte graphique"], ["Logo"], ["Motion design"]]],
  ["marketing", "MARKETING", "Marketing", [["SEO"], ["Copywriting"], ["Contenu"], ["Acquisition"]]],
  ["hardware", "HARDWARE & RADIO", "Hardware et radio", [["Meshtastic"], ["Radio maillée longue portée"]]],
];

// 1) Placement des étiquettes avec retour à la ligne calculé.
const panels = cats.map(([file, label, alt, chips]) => {
  let x = PAD, line = 0;
  const placed = chips.map(([name, ic]) => {
    const w = Math.ceil(24 + (ic ? 22 : 0) + name.length * CHAR);
    if (x + w > W - PAD) { x = PAD; line++; }
    const p = { name, ic, x, y: TOP + line * (CH + GAP), w };
    x += w + GAP;
    return p;
  });
  return { file, label, alt, chips, placed, h: TOP + (line + 1) * CH + line * GAP + PAD };
});

// 2) Hauteur égalisée par paire : les deux panneaux d'une même rangée desktop s'alignent.
for (let i = 0; i < panels.length; i += 2) {
  const h = Math.max(panels[i].h, panels[i + 1]?.h ?? 0);
  panels[i].h = h;
  if (panels[i + 1]) panels[i + 1].h = h;
}

await mkdir(`${ASSETS}/explore`, { recursive: true });
for (const p of panels) {
  let body = "";
  for (const c of p.placed) {
    body += `  <rect x="${c.x + 0.5}" y="${c.y + 0.5}" width="${c.w - 1}" height="${CH - 1}" fill="${SURF}" stroke="${LINE}"/>\n`;
    let tx = c.x + 12;
    if (c.ic) {
      body += `  <g transform="translate(${tx} ${c.y + 9}) scale(0.5833)">${await icon(c.ic)}</g>\n`;
      tx += 22;
    }
    body += `  <text x="${tx}" y="${c.y + 20}" ${M} font-size="12" fill="${INK}">${esc(c.name)}</text>\n`;
  }
  const names = p.chips.map(([n]) => n).join(", ");
  await writeFile(`${ASSETS}/explore/${p.file}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${p.h}" viewBox="0 0 ${W} ${p.h}" role="img" aria-label="${esc(`${p.label} : ${names}`)}">
  <rect width="${W}" height="${p.h}" fill="${BG}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${p.h - 1}" fill="none" stroke="${LINE}"/>
  <text x="${PAD}" y="36" ${M} font-size="11" letter-spacing="3" fill="${MUTED}">${esc(p.label)}</text>
  <text x="${W - PAD}" y="36" text-anchor="end" ${M} font-size="11" fill="${MUTED}">${String(p.chips.length).padStart(2, "0")}</text>
${body}</svg>
`);
}
console.log(`[panels] explore/*.svg (${panels.length})`);

// 3) Injection idempotente du bloc dans le README : ajouter ou retirer une catégorie ci-dessus suffit.
const README = join(ASSETS, "..", "README.md");
const re = /(<!-- EXPLORE:START -->)[\s\S]*?(<!-- EXPLORE:END -->)/;
const readme = await readFile(README, "utf8");
if (!re.test(readme)) throw new Error("Marqueurs <!-- EXPLORE:START --> / <!-- EXPLORE:END --> absents de README.md");
const imgs = panels.map((p) => `<img src="assets/explore/${p.file}.svg" alt="${esc(`${p.alt} : ${p.chips.map(([n]) => n).join(", ")}`)}">`);
await writeFile(README, readme.replace(re, () => `<!-- EXPLORE:START -->\n<p>\n${imgs.join("\n")}\n</p>\n<!-- EXPLORE:END -->`));
console.log("[panels] README.md (bloc explore)");
