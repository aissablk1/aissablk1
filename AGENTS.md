# AGENTS.md

Instructions pour tout agent de code (Claude Code, Codex, Cursor, Copilot, Gemini CLI…) qui modifie ce dépôt.
Format : [AGENTS.md](https://agents.md). Les instructions explicites du propriétaire en conversation priment sur ce fichier.

## Projet

Dépôt de profil GitHub de **Aïssa BELKOUSSA** (`aissablk1/aissablk1`) : GitHub affiche `README.md` sur
<https://github.com/aissablk1>. Tout le visuel est fait de SVG écrits à la main ou générés, en noir et blanc.

- Langue : **français**. Ton direct, sans jargon marketing, sans emoji décoratif.
- Node ≥ 20, **zéro dépendance npm** (`fetch` natif). Ne pas ajouter de `node_modules`.
- La seule source de vérité sur l'identité, les compétences et les projets est le propriétaire.
  N'invente aucune information (rôle, client, chiffre, projet). Si une info manque, demande.

## Structure

```
README.md                      Page affichée par GitHub (blocs DOING, PROJECTS, UPSTREAM, EXPLORE, PULSE, CONTACT injectés)
assets/hero.svg, story.svg,    Grands panneaux desktop 880 px, ÉCRITS À LA MAIN
  process.svg
assets/doing.svg, contact.svg  Grands panneaux desktop 880 px, GÉNÉRÉS
assets/explore/row-N.svg       Rangées « Ce que j'explore » 880 px (deux panneaux par SVG), GÉNÉRÉES
assets/projects/*.svg          Cartes projets, demi-grille 440 px, GÉNÉRÉES
assets/contact/*.svg           Boutons de contact, demi-grille 440 × 64, GÉNÉRÉS
assets/m/**                    Variantes mobiles de tout ce qui précède, GÉNÉRÉES
assets/cofonde.svg             Lien ParleCitoyen sous « Ce que je fais », GÉNÉRÉ par doing.mjs
assets/pulse.svg, m/pulse.svg  Statistiques GitHub, GÉNÉRÉES chaque jour par la CI
assets/upstream/*.svg          « Mergé en amont » (PR acceptées dans des projets tiers), GÉNÉRÉES chaque jour par la CI
scripts/panels/                Générateurs (un fichier par élément, jetons partagés dans tokens.mjs)
scripts/generate-pulse.mjs     Générateur des statistiques (API GraphQL GitHub)
scripts/generate-upstream.mjs  Générateur « Mergé en amont » (API GraphQL GitHub)
.github/workflows/dashboard.yml  Pulse + panneaux, commit automatique
.github/workflows/snake.yml      Serpent de contributions, publié sur la branche `output`
```

## Commandes

```bash
npm run panels                 # régénère tous les SVG GÉNÉRÉS + les blocs PROJECTS, EXPLORE, CONTACT du README
GITHUB_TOKEN=… npm run pulse   # régénère pulse.svg et m/pulse.svg
GITHUB_TOKEN=… node scripts/generate-upstream.mjs   # régénère « Mergé en amont »
```

Sans `GITHUB_TOKEN` valide, `pulse` écrit volontairement un état de repli (« — »). **Ne committe jamais ce repli** :
restaure `assets/pulse.svg` et `assets/m/pulse.svg`, la CI les régénère avec de vraies données.

## Comment modifier (recettes)

- **Un texte d'un panneau généré** : modifie le générateur dans `scripts/panels/`, puis `npm run panels`.
  Ne modifie jamais un SVG généré à la main : la CI l'écraserait.
- **Un texte de hero, story ou process** : modifie le SVG desktop **et** sa version mobile dans `scripts/panels/mobile.mjs`.
- **Une carte projet** : édite `cards` dans `scripts/panels/projects.mjs` (le README suit automatiquement).
  Garde un nombre pair d'éléments pour remplir les rangées. Uniquement des dépôts **publics** et existants : vérifie avec `curl -s https://api.github.com/repos/aissablk1/<nom>`
  (HTTP 200 et `"private": false`).
- **Une catégorie ou une étiquette « explore »** : édite `cats` dans `scripts/panels/explore.mjs`. Le README est mis à jour
  automatiquement. Les catégories sont groupées par deux dans l'ordre de la liste. Règle : une marque a son logo Simple Icons, un savoir-faire reste en texte.
- **Un logo** : la fonction `icon()` de `tokens.mjs` utilise Simple Icons (CC0) à la version épinglée `16.34.0`.
  Si une marque a été retirée de cette version, épingle une version plus ancienne (`"linkedin@10.4.0"`, `"openai@13.0.0"`).
  Vérifie l'existence avec `curl -sL -o /dev/null -w "%{http_code}" https://unpkg.com/simple-icons@<version>/icons/<slug>.svg`.
- **Un nouveau grand panneau 880 px** : ajoute aussi sa variante 360 px dans `mobile.mjs` et insère-le dans le README via
  `<picture><source media="(max-width: 600px)" srcset="assets/m/<nom>.svg"><img src="assets/<nom>.svg" alt="…"></picture>`.

## Invariants (ne jamais casser)

1. **Palette fermée, 5 couleurs, aucune autre** : `#0A0A0A` fond · `#141414` surface · `#262626` filets ·
   `#FAFAFA` texte · `#8A8A8A` texte secondaire. Pas de dégradé, d'ombre ni de coins arrondis.
2. **SVG** : fond opaque `#0A0A0A` sur la surface des panneaux (seules les gouttières restent transparentes), `viewBox` + `role="img"` + `aria-label`, polices **système** uniquement
   (`Arial, Helvetica, sans-serif` et `monospace` : un SVG affiché via `<img>` ne charge aucune webfont),
   aucun script, aucune animation, filets de 1 px posés sur des demi-pixels (`x="0.5"`).
3. **Grille proportionnelle** (voir `tokens.mjs`). GitHub réduit tout SVG à la largeur de sa colonne (~845 px) mais
   n'agrandit jamais : une largeur fixe plus petite que la colonne laisse un vide à droite. Donc :
   - tout ce qui occupe une rangée entière fait **880** de large (y compris une paire sans lien : `explore/row-N.svg`) ;
   - un élément cliquable par paire fait **440** (demi-grille), avec `width="50%"` dans le README et **aucun espace**
     entre les balises de la rangée (50 % + 50 % = 100 %) ; la gouttière de 6 unités est dessinée dans le SVG,
     transparente, 3 de chaque côté intérieur (`offset()`, `cellW()`).
   - Mobile (sous 600 px, via `<picture>`) : 360 de large pour une rangée entière, 180 pour une demi-grille.
   - Marges intérieures : 40 (880), 24 (440), 20 (360), 12 (180).
4. **Responsive** : tout passe par `<picture><source media="(max-width: 600px)" srcset="assets/m/…">`. Utilise les
   fonctions `cell()` et `rows()` de `tokens.mjs`, qui écrivent le bon balisage.
5. **Marqueurs** : `DOING`, `PROJECTS`, `UPSTREAM`, `EXPLORE`, `PULSE`, `CONTACT` (`<!-- NOM:START -->` /
   `<!-- NOM:END -->`) présents **une fois chacun**. Ne modifie pas leur contenu à la main : il est réécrit par les générateurs.
8. **« Mergé en amont » = contributions externes uniquement.** Le filtre est l'`authorAssociation` donné par GitHub
   (`CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, `FIRST_TIMER`, `NONE`). N'ajoute jamais de PR vers les dépôts du propriétaire
   ou de ses organisations (`OWNER`, `MEMBER`, `COLLABORATOR`), même pour gonfler la liste.
6. **Texte** : tout texte doit tenir dans la marge. Le retour à la ligne des générateurs est une estimation :
   vérifie le rendu (voir ci-dessous).
7. **Chaque élément cliquable** est un SVG séparé entouré de `<a href>` dans le README (un lien dans un SVG affiché via
   `<img>` ne fonctionne pas).

## Vérifications avant commit

```bash
rg -i --pcre2 '#(?!0a0a0a|141414|262626|fafafa|8a8a8a)[0-9a-f]{6}' . --glob '!.git'   # aucune sortie
xmllint --noout assets/*.svg assets/*/*.svg assets/m/*/*.svg                          # aucune erreur
for m in DOING PROJECTS UPSTREAM EXPLORE PULSE CONTACT; do grep -c "$m:START" README.md; done  # 1 pour chacun
npm run panels && git status --short assets README.md                                  # relancer ne change plus rien
```

Vérifie aussi le rendu visuel dans un navigateur, en largeur desktop **et** à 375 px, en ouvrant le README rendu par
l'API `POST https://api.github.com/markdown` (c'est le même rendu que celui de GitHub).

## Git et CI

- La CI (`dashboard.yml`) committe sur `main` à chaque push et chaque jour à 06:00 UTC. **Fais toujours
  `git pull --rebase` avant `git push`.**
- Un push est réussi uniquement si `git ls-remote origin refs/heads/main` renvoie le SHA local
  (`git push` affiche `main -> main` même quand il est refusé).
- Messages de commit au format Conventional Commits, en français, sans emoji. Ajoute les fichiers un par un
  avec leur chemin (pas de `git add -A`).
- Auteur des commits : Aïssa BELKOUSSA, avec l'adresse noreply GitHub. Aucune mention d'IA comme auteur ou co-auteur
  (pas de `Co-Authored-By`). N'expose jamais d'adresse e-mail personnelle.
- Ne touche pas à la branche `output` : elle est gérée par `snake.yml`.

## Sécurité

- Le seul secret utilisé est le `GITHUB_TOKEN` fourni par Actions. N'en ajoute aucun autre dans le dépôt.
- N'ajoute aucun script, iframe, traceur ni service tiers au README ou aux SVG.
