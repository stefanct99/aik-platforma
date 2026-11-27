// Prijava i odjava (zadatak tačka 4) - SAMOSTALAN tok, bez deljene sesije (test.use ispod resetuje
// storageState na prazan - projekat "chromium" inače svuda koristi već prijavljenu sesiju, videti
// playwright.config.ts i e2e/auth.setup.ts).
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { E2E_CREDS_FILE } from "./test-env";

test.use({ storageState: { cookies: [], origins: [] } });

test("pogrešna lozinka prikazuje grešku i ne prijavljuje", async ({ page }) => {
  const { email } = JSON.parse(readFileSync(E2E_CREDS_FILE, "utf-8"));
  await page.goto("/prijava");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Lozinka").fill("PogresnaLozinka123");
  await page.getByRole("button", { name: "Prijavi se" }).click();

  await expect(page.getByText("Pogrešan e-mail ili lozinka")).toBeVisible();
  await expect(page).toHaveURL(/\/prijava/);
});

test("ispravna prijava vodi na Početnu, odjava vraća na Prijavu", async ({ page }) => {
  const { email, password } = JSON.parse(readFileSync(E2E_CREDS_FILE, "utf-8"));
  await page.goto("/prijava");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Lozinka").fill(password);
  await page.getByRole("button", { name: "Prijavi se" }).click();

  await page.waitForURL("**/pocetna");
  await expect(page.getByText("Probni Petrović")).toBeVisible();

  await page.getByRole("button", { name: "Odjavi se" }).click();
  await page.waitForURL("**/prijava");
  await expect(page.getByRole("heading", { name: "Dobro došao nazad" })).toBeVisible();

  // Odjavljena sesija ne sme da se vrati na zaštićenu stranicu.
  await page.goto("/pocetna");
  await page.waitForURL("**/prijava");
});
