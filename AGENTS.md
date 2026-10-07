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
README.md                      Page affichée par GitHub (marqueurs PULSE et EXPLORE gérés par scripts)
assets/hero.svg, story.svg,    Grands panneaux desktop 880 px, ÉCRITS À LA MAIN
  process.svg
assets/doing.svg, contact.svg  Grands panneaux desktop 880 px, GÉNÉRÉS
assets/projects/*.svg          Cartes projets 400 px, GÉNÉRÉES
assets/explore/*.svg           Panneaux « Ce que j'explore » 400 px, GÉNÉRÉS
assets/contact/*.svg           Boutons de contact 400×64, GÉNÉRÉS
assets/m/*.svg                 Variantes mobiles 360 px des grands panneaux, GÉNÉRÉES
assets/pulse.svg, m/pulse.svg  Statistiques GitHub, GÉNÉRÉES chaque jour par la CI
scripts/panels/                Générateurs (un fichier par élément, jetons partagés dans tokens.mjs)
scripts/generate-pulse.mjs     Générateur des statistiques (API GraphQL GitHub)
.github/workflows/dashboard.yml  Pulse + panneaux, commit automatique
.github/workflows/snake.yml      Serpent de contributions, publié sur la branche `output`
```

## Commandes

```bash
npm run panels                 # régénère tous les SVG GÉNÉRÉS + le bloc EXPLORE du README
GITHUB_TOKEN=… npm run pulse   # régénère pulse.svg et m/pulse.svg
```

Sans `GITHUB_TOKEN` valide, `pulse` écrit volontairement un état de repli (« — »). **Ne committe jamais ce repli** :
restaure `assets/pulse.svg` et `assets/m/pulse.svg`, la CI les régénère avec de vraies données.

## Comment modifier (recettes)

- **Un texte d'un panneau généré** : modifie le générateur dans `scripts/panels/`, puis `npm run panels`.
  Ne modifie jamais un SVG généré à la main : la CI l'écraserait.
- **Un texte de hero, story ou process** : modifie le SVG desktop **et** sa version mobile dans `scripts/panels/mobile.mjs`.
- **Une carte projet** : édite `cards` dans `scripts/panels/projects.mjs` et le bloc `<a><img></a>` correspondant dans le README.
  Uniquement des dépôts **publics** et existants : vérifie avec `curl -s https://api.github.com/repos/aissablk1/<nom>`
  (HTTP 200 et `"private": false`).
- **Une catégorie ou une étiquette « explore »** : édite `cats` dans `scripts/panels/explore.mjs`. Le README est mis à jour
  automatiquement entre `<!-- EXPLORE:START -->` et `<!-- EXPLORE:END -->`.
  Règle : une marque a son logo Simple Icons, un savoir-faire reste en texte.
- **Un logo** : la fonction `icon()` de `tokens.mjs` utilise Simple Icons (CC0) à la version épinglée `16.34.0`.
  Si une marque a été retirée de cette version, épingle une version plus ancienne (`"linkedin@10.4.0"`, `"openai@13.0.0"`).
  Vérifie l'existence avec `curl -sL -o /dev/null -w "%{http_code}" https://unpkg.com/simple-icons@<version>/icons/<slug>.svg`.
- **Un nouveau grand panneau 880 px** : ajoute aussi sa variante 360 px dans `mobile.mjs` et insère-le dans le README via
  `<picture><source media="(max-width: 600px)" srcset="assets/m/<nom>.svg"><img src="assets/<nom>.svg" alt="…"></picture>`.

## Invariants (ne jamais casser)

1. **Palette fermée, 5 couleurs, aucune autre** : `#0A0A0A` fond · `#141414` surface · `#262626` filets ·
   `#FAFAFA` texte · `#8A8A8A` texte secondaire. Pas de dégradé, d'ombre ni de coins arrondis.
2. **SVG** : fond opaque `#0A0A0A`, `viewBox` + `role="img"` + `aria-label`, polices **système** uniquement
   (`Arial, Helvetica, sans-serif` et `monospace` : un SVG affiché via `<img>` ne charge aucune webfont),
   aucun script, aucune animation, filets de 1 px posés sur des demi-pixels (`x="0.5"`).
3. **Grille** : grands panneaux 880 px (marge 40) ; cartes et panneaux en 400 px (marge 24) ; mobile 360 px (marge 20).
4. **Responsive** : les images de 400 px n'ont **pas** d'attribut `width` dans le README (elles se placent à deux par ligne
   sur desktop, une par ligne sur mobile). Les grands panneaux passent par `<picture>` avec le point de rupture `600px`.
5. **Marqueurs** : `<!-- PULSE:START/END -->` et `<!-- EXPLORE:START/END -->` présents **une fois chacun**.
   Ne modifie pas leur contenu à la main.
6. **Texte** : tout texte doit tenir dans la marge. Le retour à la ligne des générateurs est une estimation :
   vérifie le rendu (voir ci-dessous).
7. **Chaque élément cliquable** est un SVG séparé entouré de `<a href>` dans le README (un lien dans un SVG affiché via
   `<img>` ne fonctionne pas).

## Vérifications avant commit

```bash
rg -i --pcre2 '#(?!0a0a0a|141414|262626|fafafa|8a8a8a)[0-9a-f]{6}' . --glob '!.git'   # aucune sortie
xmllint --noout assets/*.svg assets/*/*.svg                                            # aucune erreur
grep -c "PULSE:START" README.md; grep -c "EXPLORE:START" README.md                     # 1 et 1
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
