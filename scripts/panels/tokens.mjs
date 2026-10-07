// Jetons partagés par les générateurs de panneaux : palette fermée, polices système, échappement XML, logos.
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ASSETS = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "assets");

export const BG = "#0A0A0A";
export const SURF = "#141414";
export const LINE = "#262626";
export const INK = "#FAFAFA";
export const MUTED = "#8A8A8A";

// Un SVG servi via <img> ne charge aucune webfont : uniquement des polices système.
export const F = 'font-family="Arial, Helvetica, sans-serif"';
export const M = 'font-family="monospace"';

export const esc = (s) =>
  String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

// Icônes dessinées à la main (grille 24) pour ce qui n'est pas une marque.
export const MAIL = `<rect x="2.5" y="5.5" width="19" height="13" fill="none" stroke="${INK}" stroke-width="1.5"/><polyline points="3,6 12,13 21,6" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
export const GLOBE = `<circle cx="12" cy="12" r="9.5" fill="none" stroke="${INK}" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="4" ry="9.5" fill="none" stroke="${INK}" stroke-width="1.5"/><line x1="2.5" y1="12" x2="21.5" y2="12" stroke="${INK}" stroke-width="1.5"/>`;

// Retour à la ligne par estimation de chasse (Arial ~0,53 em, gras ~0,6 em, monospace ~0,6 em + letter-spacing).
export const wrap = (text, maxChars, sep = " ") => {
  const lines = [];
  let cur = "";
  for (const w of text.split(sep)) {
    const next = cur ? `${cur}${sep}${w}` : w;
    if (cur && next.length > maxChars) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
};

// ---- Grille proportionnelle -------------------------------------------------------------
// Les grands panneaux (880) sont réduits par GitHub à la largeur de la colonne (~845 px).
// Pour que tout s'aligne au pixel, les éléments par paire occupent chacun width="50%" de la colonne
// (aucun espace entre les balises : 50 % + 50 % = 100 %). Leur SVG vaut la moitié de la grille (440)
// et la gouttière de 6 unités est dessinée dedans : 3 transparentes de chaque côté intérieur.
// 6 unités ≈ 6 px affichés = l'écart vertical que GitHub laisse entre deux rangées d'images (interligne),
// donc les gouttières horizontales et verticales sont égales.
export const GUTTER = 6;
export const HALF = 440; // desktop : moitié de 880
export const HALF_M = 180; // mobile : moitié d'une colonne ~360 (vue à ~171 px sur un téléphone)
export const offset = (i) => (i % 2 === 0 ? 0 : GUTTER / 2); // décalage du cadre (gauche : 0, droite : 4)
export const cellW = (W) => W - GUTTER / 2; // largeur du cadre dans une moitié

// Un élément de grille pour le README : <picture> (variante mobile sous 600 px), cliquable si href.
export const cell = ({ href, desktop, mobile, alt, width = "50%" }) => {
  const pic = `<picture><source media="(max-width: 600px)" srcset="${mobile}"><img src="${desktop}" width="${width}" alt="${esc(alt)}"></picture>`;
  return href ? `<a href="${href}">${pic}</a>` : pic;
};
// Une rangée = deux éléments collés (sans espace, sinon 50 % + espace + 50 % passe à la ligne).
export const rows = (cells) => `<p>\n${cells.join("")}\n</p>`;

// Injection idempotente d'un bloc du README entre <!-- NOM:START --> et <!-- NOM:END -->.
export const README = join(ASSETS, "..", "README.md");
export const inject = async (name, block) => {
  const { readFile, writeFile } = await import("node:fs/promises");
  const re = new RegExp(`<!-- ${name}:START -->[\\s\\S]*?<!-- ${name}:END -->`);
  const md = await readFile(README, "utf8");
  if (!re.test(md)) throw new Error(`Marqueurs <!-- ${name}:START --> / <!-- ${name}:END --> absents de README.md`);
  await writeFile(README, md.replace(re, () => `<!-- ${name}:START -->\n${block}\n<!-- ${name}:END -->`));
};

// Logos officiels monochromes de Simple Icons (CC0), versions épinglées.
// "slug@version" pour les marques retirées des versions récentes (ex. openai@13.0.0, linkedin@10.4.0).
const icons = new Map();
export const icon = async (ref) => {
  if (!icons.has(ref)) icons.set(ref, fetchIcon(ref));
  return icons.get(ref);
};
const fetchIcon = async (ref) => {
  const [slug, version = "16.34.0"] = ref.split("@");
  const res = await fetch(`https://unpkg.com/simple-icons@${version}/icons/${slug}.svg`);
  if (!res.ok) throw new Error(`icône ${ref} : HTTP ${res.status}`);
  const d = (await res.text()).match(/ d="([^"]+)"/)?.[1];
  if (!d) throw new Error(`icône ${ref} : tracé introuvable`);
  return `<path fill="${INK}" d="${d}"/>`;
};
