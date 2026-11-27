// E2E testovi (Playwright) - cilj: da Claude jednom komandom (npm run test:e2e) proveri funkcionalnost
// bez ručnog klikanja. Stefan i dalje SAM pregleda izgled - vizuelne provere (e2e/visual.spec.ts) prave
// slike i prijavljuju razlike, ali NIKAD ne obaraju testove (zadatak tačka 5).
//
// Bezbednost (zadatak tačka 1): testovi NIKAD ne diraju aik_dev. webServer (ispod) pokreće Next.js nad
// aik_test, na portu 3100 (ne 3000, da se nikad slučajno ne pomeša sa pravim razvojnim serverom koji
// Stefan možda već ima pokrenut). Probni nalog pravi/čisti scripts/e2e-seed.ts i scripts/e2e-cleanup.ts,
// pokrenuti iz scripts/e2e-run.ts PRE/POSLE Playwright-a - NAMERNO ne kao Playwright globalSetup/
// globalTeardown (Playwright-ov modul-loader ne ume da učita generisanog Prisma klijenta kroz te kuke -
// "Cannot use import.meta outside a module" - videti komentar u scripts/e2e-db.ts).
import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

loadEnv({ path: ".env.local" });

const PORT = process.env.E2E_PORT ?? "3100";
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false, // deljeni probni nalog (jedna firma) - paralelni upisi bi se sudarali.
  retries: 0, // namerno bez retry-ja: zadatak traži da POKRENEMO 2x da bismo SAMI uhvatili flaky testove.
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "test-results/html-report", open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  outputDir: "test-results/artifacts",
  use: {
    baseURL: BASE_URL,
    // Lokalni Chrome (isti pristup kao PDF generisanje, src/lib/pdf.ts) - BEZ preuzimanja sopstvenog
    // Chromium-a (zadatak tačka 2).
    channel: "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    // "setup" se prijavljuje JEDNOM (prava UI prijava, e2e/auth.setup.ts) i snima kolačić sesije - svi
    // ostali testovi ga ponovo koriste (storageState), umesto da se svaki test iznova prijavljuje.
    // e2e/auth.spec.ts i dalje SAMOSTALNO testira sâm tok prijave/odjave (bez ove deljene sesije).
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome", storageState: ".playwright/storageState.json" },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: `npx tsx --env-file=.env.local scripts/e2e-server.ts`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 60_000,
    env: { E2E_PORT: PORT },
  },
});
