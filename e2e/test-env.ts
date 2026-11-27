// Deljene konstante za E2E testove. NAMERNO bez ikakvog uvoza iz src/lib/prisma ili src/lib/auth (i bez
// postavljanja DATABASE_URL) - testovima kojima treba baza, e2eDb() (e2e/db.ts) poziva poseban proces
// (scripts/e2e-db.ts), jer Playwright-ov sopstveni modul-loader ne ume da učita generisanog Prisma
// klijenta kroz dinamički "import()" (videti komentar u scripts/e2e-db.ts).
export const E2E_EMAIL = "e2e-test@aik-test.local";

// Lozinka probnog naloga: generisana nasumično pri svakom pokretanju (scripts/e2e-seed.ts) i upisana
// OVDE (lokalni, git-ignorisan fajl, nikad u izveštaju - zadatak tačka 1).
export const E2E_CREDS_FILE = ".playwright/.e2e-creds.json";
