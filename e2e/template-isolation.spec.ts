// Izolacija šablona po firmi (zadatak: dopuna E2E testova, tačka 6): šablon DRUGE firme se ne vidi u
// listi i ne može da se učita preko njegovog ID-a. Druga, potpuno nezavisna probna firma se pravi/briše
// posebno (scripts/e2e-db.ts: create-other-business/delete-other-business) - NIKAD se ne loguje, test samo
// pokušava pristup NJENOM šablonu IZ SESIJE glavnog probnog naloga (storageState iz auth.setup.ts).
//
// NAPOMENA (obim ovog testa): brisanje TUĐEG šablona preko ID-a nije direktno dostupno kroz pravi klik u
// brauzeru - server akcija (obrisiSablonAction) prima templateId samo iz VEĆ učitane, firmi-skopirane liste
// u editoru, nema polja/URL-a gde korisnik sam upisuje proizvoljan id za brisanje. Taj deo je već pokriven
// na nivou servera (vitest: "obrisiSablon odbija brisanje tuđeg šablona", "ne dira šablon druge firme").
// Ovaj test pokriva ono što je STVARNO dostupno kroz brauzer: lista šablona i učitavanje preko ?sablonId=.
import { test, expect } from "@playwright/test";
import { e2eDb } from "./db";

let tudjaFirma: { userId: string; businessId: string; templateId: string };

test.beforeAll(() => {
  tudjaFirma = e2eDb("create-other-business");
});

test.afterAll(() => {
  e2eDb("delete-other-business", { userId: tudjaFirma.userId });
});

test("tuđi šablon se ne vidi u listi i ne učitava preko ?sablonId= u URL-u", async ({ page }) => {
  await page.goto("/fakture/sablon");
  await page.getByRole("button", { name: /^Šablon:/ }).click();
  await expect(page.getByText("Tuđi šablon (E2E izolacija)")).not.toBeVisible();
  await page.getByRole("button", { name: /^Šablon:/ }).click(); // zatvori meni

  // Direktan pokušaj preko URL-a - stranica (page.tsx) tiho pada nazad na SOPSTVENI podrazumevani šablon,
  // ne na tuđi (ucitajSablonPoId proverava businessId, ne samo id).
  await page.goto(`/fakture/sablon?sablonId=${tudjaFirma.templateId}`);
  await expect(page.getByRole("button", { name: "Šablon: Moj izgled" })).toBeVisible();
  await expect(page.getByText("Tuđi šablon (E2E izolacija)")).not.toBeVisible();
  // Akcent boja tuđeg šablona (#FF00FF, raspoznatljiva - nijedna probna firma je ne koristi) se nigde ne
  // vidi na platnu (dodatna potvrda da se tuđi šablon nije učitao ni delimično).
  await expect(page.locator('[style*="FF00FF" i]')).toHaveCount(0);
});
