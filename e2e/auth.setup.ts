// Prijavljuje se JEDNOM (prava UI forma, isti kao svaki korisnik) i snima kolačić sesije - svi ostali
// testovi (projekat "chromium", videti playwright.config.ts) ponovo koriste ovu sesiju, umesto da se
// svaki test iznova prijavljuje preko forme (brže, a sâm tok prijave ipak ostaje pokriven - e2e/auth.spec.ts).
import { test as setup, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { E2E_CREDS_FILE } from "./test-env";

setup("prijava (čuva sesiju za ostale testove)", async ({ page }) => {
  const { email, password } = JSON.parse(readFileSync(E2E_CREDS_FILE, "utf-8"));

  await page.goto("/prijava");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Lozinka").fill(password);
  await page.getByRole("button", { name: "Prijavi se" }).click();

  await page.waitForURL("**/pocetna", { timeout: 10_000 });
  await expect(page.getByText("Probni Petrović")).toBeVisible();
  await page.context().storageState({ path: ".playwright/storageState.json" });
});
