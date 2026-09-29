// Génère assets/pulse.svg à partir de l'API GraphQL GitHub et l'injecte dans README.md.
// Node 20+, aucune dépendance. Ne fait jamais échouer le workflow à cause de l'API.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const LOGIN = "aissablk1";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SVG_PATH = join(ROOT, "assets", "pulse.svg");
const README_PATH = join(ROOT, "README.md");

const QUERY = `query($login:String!){ user(login:$login){ contributionsCollection{ contributionCalendar{ totalContributions } } repositories(first:4,privacy:PUBLIC,orderBy:{field:PUSHED_AT,direction:DESC}){ nodes{ name primaryLanguage{ name } } } } }`;

async function fetchPulse() {
  try {
    const r = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": LOGIN,
      },
      body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    if (j.errors) throw new Error(j.errors.map((e) => e.message).join(" ; "));
    const user = j.data?.user;
    if (!user) throw new Error("utilisateur introuvable");
    return {
      total: user.contributionsCollection.contributionCalendar.totalContributions.toLocaleString("fr-FR"),
      // Le dépôt de profil est poussé chaque jour par ce workflow : on l'exclut pour ne pas se lister soi-même.
      repos: user.repositories.nodes
        .filter((n) => n.name !== LOGIN)
        .slice(0, 3)
        .map((n) => ({ name: n.name, lang: n.primaryLanguage?.name ?? "" })),
    };
  } catch (err) {
    console.warn(`[pulse] API GitHub indisponible (${err.message}) — fallback.`);
    return { total: "—", repos: [] };
  }
}

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const clip = (s, max) => (s.length > max ? `${s.slice(0, max - 1)}…` : s);

function renderSvg({ total, repos }) {
  const date = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  });
  const rows = repos.length
    ? repos
        .map((repo, i) => {
          const y = 56 + i * 24;
          return [
            `  <text x="470" y="${y}" font-family="monospace" font-size="13" fill="#FAFAFA">${esc(clip(repo.name, 32))}</text>`,
            `  <text x="840" y="${y}" text-anchor="end" font-family="monospace" font-size="11" fill="#8A8A8A">${esc(clip(repo.lang, 14))}</text>`,
          ].join("\n");
        })
        .join("\n")
    : `  <text x="470" y="56" font-family="monospace" font-size="13" fill="#8A8A8A">—</text>`;
  const label = `Contributions sur 12 mois : ${total}. Derniers dépôts : ${repos.map((r) => r.name).join(", ") || "aucun"}.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="150" viewBox="0 0 880 150" role="img" aria-label="${esc(label)}">
  <rect width="880" height="150" fill="#0A0A0A"/>
  <rect x="0.5" y="0.5" width="879" height="149" fill="none" stroke="#262626"/>
  <text x="40" y="32" font-family="monospace" font-size="11" letter-spacing="2" fill="#8A8A8A">CONTRIBUTIONS · 12 MOIS</text>
  <text x="40" y="98" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="800" fill="#FAFAFA">${esc(total)}</text>
  <line x1="430.5" y1="24" x2="430.5" y2="112" stroke="#262626"/>
  <text x="470" y="32" font-family="monospace" font-size="11" letter-spacing="2" fill="#8A8A8A">DERNIERS DÉPÔTS</text>
${rows}
  <line x1="40" y1="120.5" x2="840" y2="120.5" stroke="#262626"/>
  <text x="40" y="140" font-family="monospace" font-size="10" fill="#8A8A8A">MàJ ${esc(date)}</text>
</svg>
`;
}

const data = await fetchPulse();
await mkdir(dirname(SVG_PATH), { recursive: true });
await writeFile(SVG_PATH, renderSvg(data));
console.log(`[pulse] ${SVG_PATH} écrit (total=${data.total}, dépôts=${data.repos.length}).`);

const re = /(<!-- PULSE:START -->)[\s\S]*?(<!-- PULSE:END -->)/;
const readme = await readFile(README_PATH, "utf8");
if (!re.test(readme)) throw new Error("Marqueurs <!-- PULSE:START --> / <!-- PULSE:END --> absents de README.md");
await writeFile(README_PATH, readme.replace(re, `$1\n![pulse](assets/pulse.svg)\n$2`));
console.log("[pulse] README.md mis à jour.");
