// Thème clair : décline CHAQUE SVG de assets/ (écrits à la main, générés, CI) en miroir dans assets/l/,
// en remplaçant la palette sombre par la palette claire. Toujours exécuté EN DERNIER (après pulse et upstream en CI).
import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { ASSETS, LIGHT } from "./tokens.mjs";

const OUT = join(ASSETS, "l");
const re = new RegExp(Object.keys(LIGHT).join("|"), "gi");

async function* svgs(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (p !== OUT) yield* svgs(p); }
    else if (e.name.endsWith(".svg")) yield p;
  }
}

await rm(OUT, { recursive: true, force: true }); // miroir intégralement recalculé : aucun fichier orphelin
let n = 0;
for await (const src of svgs(ASSETS)) {
  const dst = join(OUT, relative(ASSETS, src));
  await mkdir(dirname(dst), { recursive: true });
  // Remplacement simultané (une seule passe) : #0A0A0A → #FAFAFA et #FAFAFA → #0A0A0A sans se chevaucher.
  await writeFile(dst, (await readFile(src, "utf8")).replace(re, (c) => LIGHT[c.toUpperCase()]));
  n++;
}
console.log(`[panels] thème clair : ${n} SVG dans assets/l/`);
