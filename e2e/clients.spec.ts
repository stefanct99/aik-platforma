// Klijenti: dodavanje, izmena, obavezna polja (zadatak tačka 4).
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/fakture/klijenti");
});

test("obavezna polja (Naziv, Adresa) blokiraju čuvanje praznog klijenta", async ({ page }) => {
  await page.getByRole("button", { name: "Novi klijent" }).first().click();
  await page.getByRole("button", { name: "Sačuvaj klijenta" }).click();

  await expect(page.getByText("Unesi naziv klijenta")).toBeVisible();
  await expect(page.getByText("Unesi adresu klijenta")).toBeVisible();
});

test("dodavanje novog klijenta", async ({ page }) => {
  const ime = `E2E Klijent ${Date.now()}`;
  await page.getByRole("button", { name: "Novi klijent" }).first().click();
  await page.getByLabel("Naziv klijenta").fill(ime);
  await page.getByLabel("Adresa").fill("Testna 5, Novi Sad");
  await page.getByLabel("Mejl za fakture").fill("e2e-novi@aik-test.local");
  await page.getByRole("button", { name: "Sačuvaj klijenta" }).click();

  // Tabela (desktop) i kartice (mobilni prikaz) su OBE u DOM-u istovremeno (CSS sakriva jednu po
  // širini ekrana) - .first() uzima tabelarni (desktop) prikaz, dovoljno da potvrdi da je sačuvano.
  await expect(page.getByText(ime).first()).toBeVisible();
});

test("izmena postojećeg klijenta se čuva", async ({ page }) => {
  await page.getByText("Acme Inc. (E2E)").first().click();
  const noviNaziv = "Acme Inc. (E2E, izmenjeno)";
  const poljeNaziv = page.getByLabel("Naziv klijenta");
  await poljeNaziv.fill(noviNaziv);
  await page.getByRole("button", { name: "Sačuvaj izmene" }).click();

  await expect(page.getByText(noviNaziv).first()).toBeVisible();

  // Vrati ime nazad (ostali testovi/pokretanja se oslanjaju na originalno ime klijenta).
  await page.getByText(noviNaziv).first().click();
  await page.getByLabel("Naziv klijenta").fill("Acme Inc. (E2E)");
  await page.getByRole("button", { name: "Sačuvaj izmene" }).click();
  await expect(page.getByText("Acme Inc. (E2E)").first()).toBeVisible();
});
