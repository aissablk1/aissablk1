// Bloc « Me parler » : panneau citation (desktop 880) + boutons cliquables en grille proportionnelle
// (assets/contact/*.svg desktop 440 × 64, assets/m/contact/*.svg mobile 180 × 48) + bloc CONTACT du README.
import { writeFile, mkdir } from "node:fs/promises";
import { ASSETS, BG, LINE, INK, MUTED, F, M, esc, icon, MAIL, GLOBE, HALF, HALF_M, offset, cellW, cell, rows, inject } from "./tokens.mjs";

await writeFile(`${ASSETS}/contact.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="200" viewBox="0 0 880 200" role="img" aria-label="${esc("Me parler : quelqu'un qui ne lâche jamais rien, tout en restant à l'écoute.")}">
  <rect width="880" height="200" fill="${BG}"/>
  <rect x="0.5" y="0.5" width="879" height="199" fill="none" stroke="${LINE}"/>
  <text x="40" y="46" ${M} font-size="11" letter-spacing="4" fill="${MUTED}">ME PARLER</text>
  <text x="40" y="96" ${F} font-size="26" font-weight="800" fill="${INK}">${esc("« Quelqu'un qui ne lâche jamais rien,")}</text>
  <text x="40" y="128" ${F} font-size="26" font-weight="800" fill="${INK}">${esc("tout en restant à l'écoute. »")}</text>
  <text x="40" y="168" ${F} font-size="13" fill="${MUTED}">${esc("C'est comme ça qu'on me décrit. Une idée, un projet, une envie de créer ? C'est exactement ce que j'aime.")}</text>
</svg>
`);


const tiles = [
  { file: "mail", label: "ÉCRIRE", sub: "aissabelkoussa.fr/contact", glyph: MAIL, href: "https://www.aissabelkoussa.fr/contact", alt: "Écrire : formulaire de contact" },
  { file: "site", label: "SITE", sub: "aissabelkoussa.fr", glyph: GLOBE, href: "https://www.aissabelkoussa.fr", alt: "Site : aissabelkoussa.fr" },
  { file: "linkedin", label: "LINKEDIN", sub: "linkedin.com/in/aissabelkoussa", glyph: await icon("linkedin@10.4.0"), href: "https://www.linkedin.com/in/aissabelkoussa", alt: "LinkedIn : in/aissabelkoussa" },
  { file: "github", label: "GITHUB", sub: "github.com/aissablk1", glyph: await icon("github"), href: "https://github.com/aissablk1", alt: "GitHub : @aissablk1" },
];

const tile = (W, H, i, t, body) => {
  const x0 = offset(i), cw = cellW(W);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`${t.label} : ${t.sub}`)}">
  <rect x="${x0}" width="${cw}" height="${H}" fill="${BG}"/>
  <rect x="${x0 + 0.5}" y="0.5" width="${cw - 1}" height="${H - 1}" fill="none" stroke="${LINE}"/>
${body(x0, cw)}</svg>
`;
};

await mkdir(`${ASSETS}/m/contact`, { recursive: true });
for (const [i, t] of tiles.entries()) {
  // Desktop 440 × 64 : icône, libellé, adresse complète.
  await writeFile(`${ASSETS}/contact/${t.file}.svg`, tile(HALF, 64, i, t, (x0, cw) => `  <g transform="translate(${x0 + 24} 22) scale(0.8333)">${t.glyph}</g>
  <text x="${x0 + 60}" y="30" ${M} font-size="12" letter-spacing="2" fill="${INK}">${esc(t.label)}</text>
  <text x="${x0 + 60}" y="46" ${M} font-size="10" fill="${MUTED}">${esc(t.sub)}</text>
  <text x="${x0 + cw - 24}" y="37" text-anchor="end" ${M} font-size="14" fill="${MUTED}">↗</text>
`));
  // Mobile 180 × 48 : icône et libellé seulement (l'adresse ne tient pas à ~171 px ; le lien reste actif).
  await writeFile(`${ASSETS}/m/contact/${t.file}.svg`, tile(HALF_M, 48, i, t, (x0, cw) => `  <g transform="translate(${x0 + 14} 16) scale(0.6667)">${t.glyph}</g>
  <text x="${x0 + 40}" y="28" ${M} font-size="10" letter-spacing="1" fill="${INK}">${esc(t.label)}</text>
  <text x="${x0 + cw - 12}" y="28" text-anchor="end" ${M} font-size="12" fill="${MUTED}">↗</text>
`));
}
await inject("CONTACT", rows(tiles.map((t) => cell({ href: t.href, desktop: `assets/contact/${t.file}.svg`, mobile: `assets/m/contact/${t.file}.svg`, alt: t.alt }))));
console.log(`[panels] contact.svg + contact (${tiles.length}) + README`);
