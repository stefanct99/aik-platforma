// Ponavljajuće fakture: dodaj, izmeni, pauziraj, aktiviraj, obriši (zadatak tačka 4).
import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await page.goto("/fakture/ponavljajuce");
});

test("dodavanje nove ponavljajuće fakture", async ({ page }) => {
  await page.getByRole("button", { name: "Nova ponavljajuća faktura" }).first().click();
  await page.getByLabel("Klijent").selectOption({ label: "Acme Inc. (E2E)" });
  await page.getByLabel("Opis").fill("E2E ponavljajuća");
  await page.getByLabel("Iznos").fill("50");
  await page.getByRole("button", { name: "Sačuvaj" }).click();

  // Tabela (desktop) i kartice (mobilni prikaz) su OBE u DOM-u istovremeno - .first() je dovoljan.
  await expect(page.getByText("E2E ponavljajuća").first()).toBeVisible({ timeout: 10_000 });
});

test("izmena, pauziranje, aktiviranje i brisanje ponavljajuće fakture", async ({ page }) => {
  const red = page.locator('[class*="tRed"]', { hasText: "E2E ponavljajuća" });
  await expect(red).toBeVisible();

  // Izmena (klik na red otvara formu).
  await red.click();
  await page.getByLabel("Opis").fill("E2E ponavljajuća (izmenjeno)");
  await page.getByRole("button", { name: "Sačuvaj" }).click();
  await expect(page.getByText("E2E ponavljajuća (izmenjeno)").first()).toBeVisible({ timeout: 10_000 });

  const redIzmenjen = page.locator('[class*="tRed"]', { hasText: "E2E ponavljajuća (izmenjeno)" });

  // Pauziraj.
  await redIzmenjen.getByRole("button", { name: "Više opcija" }).click();
  await page.getByRole("button", { name: "Pauziraj" }).click();
  await expect(redIzmenjen.getByText("Pauzirano")).toBeVisible({ timeout: 10_000 });

  // Nastavi (aktiviraj).
  await redIzmenjen.getByRole("button", { name: "Više opcija" }).click();
  await page.getByRole("button", { name: "Nastavi" }).click();
  await expect(redIzmenjen.getByText("Pauzirano")).not.toBeVisible({ timeout: 10_000 });

  // Obriši.
  await redIzmenjen.getByRole("button", { name: "Više opcija" }).click();
  await page.getByRole("button", { name: "Obriši" }).click();
  await page.getByRole("button", { name: "Obriši", exact: true }).last().click();
  await expect(page.getByText("E2E ponavljajuća (izmenjeno)").first()).not.toBeVisible({ timeout: 10_000 });
});
