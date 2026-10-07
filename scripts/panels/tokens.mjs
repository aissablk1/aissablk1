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

// Logos officiels monochromes de Simple Icons (CC0), versions épinglées.
// "slug@version" pour les marques retirées des versions récentes (ex. openai@13.0.0, linkedin@10.4.0).
export const icon = async (ref) => {
  const [slug, version = "16.34.0"] = ref.split("@");
  const res = await fetch(`https://unpkg.com/simple-icons@${version}/icons/${slug}.svg`);
  if (!res.ok) throw new Error(`icône ${ref} : HTTP ${res.status}`);
  const d = (await res.text()).match(/ d="([^"]+)"/)?.[1];
  if (!d) throw new Error(`icône ${ref} : tracé introuvable`);
  return `<path fill="${INK}" d="${d}"/>`;
};
