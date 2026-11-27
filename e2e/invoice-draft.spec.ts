// Nova faktura: čuvanje nacrta, validacija, numeracija N/GG-M (zadatak tačka 4).
import { test, expect } from "@playwright/test";

test("nacrt sa samo klijentom (bez stavki) se čuva bez validacije", async ({ page }) => {
  // Potpuno prazna forma se NAMERNO ne čuva kao nacrt (InvoiceEditor.tsx: "Prazna forma koju korisnik
  // zatvori ne ostavlja nacrt"). Server (sacuvajNacrtAction) zahteva klijenta da bi SAČUVAO nacrt - zato
  // ovaj test koristi klijenta (stvarno obavezno polje za nacrt), ne samo stavku (vidi test ispod za
  // slučaj "stavka bez klijenta", koji sada prikazuje poruku umesto da tiho ne uspe).
  await page.goto("/fakture/nova");
  await expect(page.getByText("nije sačuvano")).toBeVisible();

  await page.getByRole("button", { name: "Izaberi klijenta" }).click();
  await page.getByRole("button", { name: /Acme Inc\. \(E2E\)/ }).click();

  await page.getByRole("button", { name: "Sačuvaj nacrt" }).first().click();
  await expect(page.getByText(/sačuvano u \d/)).toBeVisible({ timeout: 10_000 });
});

test("stavka bez klijenta: poruka ispod polja 'Klijent' kad automatsko čuvanje ne uspe, nestaje kad se klijent izabere", async ({ page }) => {
  await page.goto("/fakture/nova");
  await page.getByPlaceholder("Opis stavke").fill("E2E stavka bez klijenta");

  // Automatsko čuvanje (2s posle poslednje izmene) pokuša i ne uspe bez klijenta - poruka se pojavljuje
  // ispod polja "Klijent", forma i dalje pokazuje "nije sačuvano" (bez ovoga bi zauvek ostalo bez objašnjenja).
  await expect(page.getByText("Izaberi klijenta da bi se nacrt sačuvao.")).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText("nije sačuvano")).toBeVisible();

  await page.getByRole("button", { name: "Izaberi klijenta" }).click();
  await page.getByRole("button", { name: /Acme Inc\. \(E2E\)/ }).click();

  // Poruka nestaje čim je klijent izabran, i nacrt se zatim uspešno čuva (klijent je sad postavljen).
  await expect(page.getByText("Izaberi klijenta da bi se nacrt sačuvao.")).not.toBeVisible();
  await expect(page.getByText(/sačuvano u \d/)).toBeVisible({ timeout: 10_000 });
});

test("'Pregledaj i pošalji' bez klijenta i stavki prikazuje greške, ne nastavlja na slanje", async ({ page }) => {
  await page.goto("/fakture/nova");
  await page.getByRole("button", { name: "Pregledaj i pošalji" }).first().click();

  await expect(page.getByText("Izaberi klijenta kome šalješ fakturu.")).toBeVisible();
  await expect(page.getByText("Upiši opis stavke i iznos veći od 0.")).toBeVisible();
});

test("faktura sa klijentom i stavkom dobija broj u obliku N/GG-M pri čuvanju", async ({ page }) => {
  await page.goto("/fakture/nova");
  await page.getByRole("button", { name: "Izaberi klijenta" }).click();
  await page.getByRole("button", { name: /Acme Inc\. \(E2E\)/ }).click();

  await page.getByPlaceholder("Opis stavke").fill("E2E usluga");
  await page.getByPlaceholder("Upiši iznos").fill("150");

  await page.getByRole("button", { name: "Sačuvaj nacrt" }).first().click();
  await expect(page.getByText(/sačuvano u \d/)).toBeVisible({ timeout: 10_000 });

  // Broj fakture nema label/data-testid - polje je u omotu sa natpisom "Broj" (span, ne label - zato ne
  // radi getByLabel). getByText(exact:true) je TAČAN tekst (ne i "Poziv na broj", koje postoji niže na formi).
  const brojPolje = page
    .locator('[class*="poljeOmot"]')
    .filter({ has: page.getByText("Broj", { exact: true }) })
    .locator("input");
  await expect(brojPolje).toHaveValue(/^\d+\/\d{2}-(1[0-2]|[1-9])$/);
});
