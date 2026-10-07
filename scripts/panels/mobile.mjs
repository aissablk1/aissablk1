// Variantes mobiles (360 px) des grands panneaux : assets/m/*.svg, servies via <picture media="(max-width: 600px)">.
// La variante mobile de pulse est écrite par scripts/generate-pulse.mjs (données dynamiques).
import { writeFile, mkdir } from "node:fs/promises";
import { ASSETS, BG, LINE, INK, MUTED, F, M, esc } from "./tokens.mjs";

const W = 360, PAD = 20, INNER = W - 2 * PAD;

// Retour à la ligne par estimation de chasse Arial (vérifiée ensuite par getBBox dans le navigateur).
const wrap = (text, size, bold = false) => {
  const max = Math.floor(INNER / (size * (bold ? 0.6 : 0.53)));
  const lines = [];
  let cur = "";
  for (const w of text.split(" ")) {
    if (cur && (cur + " " + w).length > max) { lines.push(cur); cur = w; } else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) lines.push(cur);
  return lines;
};

// Petit moteur de mise en page verticale : chaque appel avance le curseur y.
const panel = (label) => {
  let y = 0, body = "";
  const api = {
    gap: (h) => { y += h; return api; },
    kicker: (left, right) => {
      y += 40;
      body += `  <text x="${PAD}" y="${y}" ${M} font-size="10" letter-spacing="3" fill="${MUTED}">${esc(left)}</text>\n`;
      if (right) body += `  <text x="${W - PAD}" y="${y}" text-anchor="end" ${M} font-size="10" fill="${MUTED}">${esc(right)}</text>\n`;
      return api;
    },
    mono: (lines, { size = 10, ls = 3, color = MUTED, lh = 16 } = {}) => {
      for (const l of lines) { y += lh; body += `  <text x="${PAD}" y="${y}" ${M} font-size="${size}" letter-spacing="${ls}" fill="${color}">${esc(l)}</text>\n`; }
      return api;
    },
    text: (t, { size = 13, bold = false, weight, color = MUTED, lh = Math.round(size * 1.5) } = {}) => {
      const fw = bold ? ' font-weight="800"' : weight ? ` font-weight="${weight}"` : "";
      for (const l of wrap(t, size, bold)) { y += lh; body += `  <text x="${PAD}" y="${y}" ${F} font-size="${size}"${fw} fill="${color}">${esc(l)}</text>\n`; }
      return api;
    },
    rule: (before = 20, after = 0) => { y += before; body += `  <line x1="${PAD}" y1="${y + 0.5}" x2="${W - PAD}" y2="${y + 0.5}" stroke="${LINE}"/>\n`; y += after; return api; },
    raw: (fn) => { const r = fn(y); body += r.svg; y = r.y; return api; },
    done: async (file, bottom = 24) => {
      const H = y + bottom;
      await writeFile(`${ASSETS}/m/${file}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${LINE}"/>
${body}</svg>
`);
      console.log(`${file}: ${W}x${H}`);
    },
  };
  return api;
};

await mkdir(`${ASSETS}/m`, { recursive: true });

// Hero
await panel("Aïssa BELKOUSSA, Concepteur de produits IA et full-stack créatif")
  .gap(24).mono(["DE A À Z · CE QUI EXISTE", "ET CE QUI N'EXISTE PAS ENCORE"], { ls: 2 })
  .gap(12).text("Aïssa BELKOUSSA", { size: 32, bold: true, color: INK, lh: 40 })
  .gap(4).text("Concepteur de produits IA & full-stack créatif", { size: 15, weight: 500, color: INK, lh: 22 })
  .gap(10).text("Une idée se concrétise plus aisément qu'on ne le pense — de la charte au système complet.", { lh: 19 })
  .rule(20)
  .raw((y) => ({ y: y + 24, svg: `  <text x="${PAD}" y="${y + 24}" ${M} font-size="10" fill="${MUTED}">JE TRAVAILLE PARTOUT</text>\n  <text x="${W - PAD}" y="${y + 24}" text-anchor="end" ${M} font-size="10" fill="${MUTED}">aissabelkoussa.fr</text>\n` }))
  .done("hero", 20);

// Histoire (sans filet bas, comme la version desktop)
await panel("Mon histoire : passionné depuis mes 2 ans.")
  .kicker("MON HISTOIRE", "DEPUIS MES 2 ANS")
  .gap(10).text("Je parle pas. J'agis.", { size: 24, bold: true, color: INK, lh: 32 })
  .gap(6).text("Passionné d'informatique depuis mes 2 ans : devant la télé, je voulais comprendre pourquoi le Mickey que je regardais vivait aussi dans un jeu que je contrôlais.", { color: INK, lh: 20 })
  .gap(8).text("Ma flemme est devenue passion : automatiser, simplifier, faire tourner les choses seules.", { lh: 20 })
  .gap(8).text("Je prends ce qui coince, j'en fais un outil qui travaille à ma place. Et à la vôtre.", { lh: 20 })
  .done("story");

// De A à Z : chaîne verticale
await panel("De A à Z : idée, charte, architecture, build, déploiement.")
  .kicker("DE A À Z")
  .raw((y0) => {
    let y = y0 + 20, svg = "";
    ["IDÉE", "CHARTE", "ARCHITECTURE", "BUILD", "DÉPLOIEMENT"].forEach((step, i) => {
      if (i) { svg += `  <text x="${W / 2}" y="${y + 17}" text-anchor="middle" ${M} font-size="14" fill="${MUTED}">↓</text>\n`; y += 24; }
      svg += `  <rect x="${PAD + 0.5}" y="${y + 0.5}" width="${INNER - 1}" height="39" fill="none" stroke="${LINE}"/>\n`;
      svg += `  <text x="${W / 2}" y="${y + 24}" text-anchor="middle" ${M} font-size="12" fill="${INK}">${esc(step)}</text>\n`;
      y += 40;
    });
    return { y, svg };
  })
  .gap(12).text("Tout, seul, de bout en bout — de la première idée au déploiement.", { lh: 19 })
  .done("process");

// Ce que je fais : trois blocs empilés
const doing = panel("Ce que je fais : je construis, j'audite, je co-fonde.").kicker("CE QUE JE FAIS", "TROIS GESTES");
[
  ["01", "Je construis", "Des IA sur mesure et du code qui rend du temps aux gens. Seul, de bout en bout."],
  ["02", "J'audite", "Des architectures IA pour d'autres. Challenger un système vaut autant que le bâtir."],
  ["03", "Je co-fonde", "ParleCitoyen, une plateforme citoyenne, pour que ce que je code serve au-delà de moi."],
].forEach(([n, title, desc], i) => {
  if (i) doing.rule(20);
  doing.gap(8).mono([n], { size: 10, ls: 3, lh: 20 }).text(title, { size: 20, bold: true, color: INK, lh: 30 }).gap(2).text(desc, { lh: 19 });
});
await doing.rule(20).gap(8).mono(["DE A À Z", "BUILDER & CONSULTANT", "RIEN N'EST IMPOSSIBLE"], { size: 10, ls: 3, color: INK, lh: 18 }).done("doing");

// Me parler
await panel("Me parler : quelqu'un qui ne lâche jamais rien, tout en restant à l'écoute.")
  .kicker("ME PARLER")
  .gap(10).text("« Quelqu'un qui ne lâche jamais rien, tout en restant à l'écoute. »", { size: 22, bold: true, color: INK, lh: 30 })
  .gap(8).text("C'est comme ça qu'on me décrit. Une idée, un projet, une envie de créer ? C'est exactement ce que j'aime.", { lh: 19 })
  .done("contact");
