// « Mergé en amont » : pull requests de aissablk1 acceptées dans des projets TIERS, mises à jour par la CI.
// Externe = GitHub classe l'auteur CONTRIBUTOR / FIRST_TIME_CONTRIBUTOR / FIRST_TIMER / NONE sur le dépôt
// (ses propres dépôts et ceux de ses organisations sont OWNER / MEMBER / COLLABORATOR et sont exclus).
// Sorties : assets/upstream/*.svg (880), assets/m/upstream/*.svg (360), bloc UPSTREAM du README.
// Si l'API échoue, rien n'est réécrit (les fichiers de la veille restent en place) et le script sort en 0.
import { writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { ASSETS, BG, LINE, INK, MUTED, F, M, esc, wrap, cell, rows, inject } from "./panels/tokens.mjs";

const LOGIN = "aissablk1";
const MAX = 6;
const EXTERNAL = new Set(["CONTRIBUTOR", "FIRST_TIME_CONTRIBUTOR", "FIRST_TIMER", "NONE"]);
const QUERY = `query($q:String!){ search(query:$q, type:ISSUE, first:100){ nodes{ ... on PullRequest {
  title url mergedAt authorAssociation
  repository{ nameWithOwner url stargazerCount isPrivate primaryLanguage{ name } } } } } }`;

async function fetchMerged() {
  const r = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${process.env.GITHUB_TOKEN}`, "Content-Type": "application/json", "User-Agent": LOGIN },
    body: JSON.stringify({ query: QUERY, variables: { q: `type:pr author:${LOGIN} is:merged -user:${LOGIN}` } }),
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  if (j.errors) throw new Error(j.errors.map((e) => e.message).join(" ; "));
  return j.data.search.nodes
    .filter((pr) => pr.mergedAt && EXTERNAL.has(pr.authorAssociation) && !pr.repository.isPrivate)
    .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
}

let prs;
try {
  prs = await fetchMerged();
} catch (err) {
  console.warn(`[upstream] API GitHub indisponible (${err.message}) — panneaux de la veille conservés.`);
  process.exit(0);
}

const frDate = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Paris" });
const clip = (s, max) => (s.length > max ? `${s.slice(0, max - 1)}…` : s);
const meta = (pr) => [`★ ${pr.repository.stargazerCount.toLocaleString("fr-FR")}`, pr.repository.primaryLanguage?.name].filter(Boolean).join(" · ");
const svg = (W, H, label, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${LINE}"/>
${body}</svg>
`;

const shown = prs.slice(0, MAX);
const count = `${String(prs.length).padStart(2, "0")} PR`;
const headLabel = `Mergé en amont : ${prs.length} pull request${prs.length > 1 ? "s" : ""} acceptée${prs.length > 1 ? "s" : ""} dans des projets tiers.`;

for (const dir of [`${ASSETS}/upstream`, `${ASSETS}/m/upstream`]) {
  await mkdir(dir, { recursive: true });
  for (const f of await readdir(dir)) if (f.endsWith(".svg")) await unlink(`${dir}/${f}`);
}

// En-tête (non cliquable).
await writeFile(`${ASSETS}/upstream/head.svg`, svg(880, 64, headLabel, `  <text x="40" y="38" ${M} font-size="11" letter-spacing="4" fill="${MUTED}">MERGÉ EN AMONT</text>
  <text x="840" y="38" text-anchor="end" ${M} font-size="11" fill="${MUTED}">${esc(`${count} ACCEPTÉES · PROJETS TIERS`)}</text>
`));
await writeFile(`${ASSETS}/m/upstream/head.svg`, svg(360, 56, headLabel, `  <text x="20" y="34" ${M} font-size="10" letter-spacing="3" fill="${MUTED}">MERGÉ EN AMONT</text>
  <text x="340" y="34" text-anchor="end" ${M} font-size="10" fill="${MUTED}">${esc(count)}</text>
`));

// Une rangée cliquable par pull request (vers la PR elle-même).
for (const [i, pr] of shown.entries()) {
  const label = `${pr.repository.nameWithOwner} : ${pr.title} (mergée le ${frDate(pr.mergedAt)})`;
  await writeFile(`${ASSETS}/upstream/pr-${i + 1}.svg`, svg(880, 72, label, `  <text x="40" y="30" ${M} font-size="13" fill="${INK}">${esc(clip(pr.repository.nameWithOwner, 60))}</text>
  <text x="840" y="30" text-anchor="end" ${M} font-size="11" fill="${MUTED}">${esc(meta(pr))}</text>
  <text x="40" y="52" ${F} font-size="13" fill="${MUTED}">${esc(clip(pr.title, 90))}</text>
  <text x="840" y="52" text-anchor="end" ${M} font-size="11" fill="${MUTED}">${esc(frDate(pr.mergedAt))}</text>
`));
  const lines = wrap(pr.title, 50).slice(0, 2);
  if (wrap(pr.title, 50).length > 2) lines[1] = clip(`${lines[1]} …`, 50);
  await writeFile(`${ASSETS}/m/upstream/pr-${i + 1}.svg`, svg(360, 100, label, [
    `  <text x="20" y="28" ${M} font-size="12" fill="${INK}">${esc(clip(pr.repository.nameWithOwner, 30))}</text>`,
    ...lines.map((l, j) => `  <text x="20" y="${50 + j * 16}" ${F} font-size="12" fill="${MUTED}">${esc(l)}</text>`),
    `  <text x="20" y="86" ${M} font-size="9" fill="${MUTED}">${esc(`${frDate(pr.mergedAt)} · ${meta(pr)}`)}</text>`,
  ].join("\n") + "\n"));
}

const cells = [
  cell({ desktop: "assets/upstream/head.svg", mobile: "assets/m/upstream/head.svg", alt: headLabel, width: "100%" }),
  ...shown.map((pr, i) => cell({
    href: pr.url,
    desktop: `assets/upstream/pr-${i + 1}.svg`,
    mobile: `assets/m/upstream/pr-${i + 1}.svg`,
    alt: `${pr.repository.nameWithOwner} : ${pr.title}`,
    width: "100%",
  })),
];
await inject("UPSTREAM", rows(cells));
console.log(`[upstream] ${prs.length} PR externes mergées, ${shown.length} affichées.`);
