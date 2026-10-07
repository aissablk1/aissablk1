// Régénère tous les panneaux statiques (npm run panels). Hero, story et process desktop sont écrits à la main.
// Pulse (desktop + mobile) reste généré par scripts/generate-pulse.mjs via le workflow dashboard.
await import("./doing.mjs");
await import("./projects.mjs");
await import("./explore.mjs");
await import("./contact.mjs");
await import("./mobile.mjs");
