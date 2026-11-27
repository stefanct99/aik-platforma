// Editor šablona fakture - podešavanja NA NIVOU BLOKA (zadatak: dopuna E2E testova, tačka 1): uključi/
// isključi blok i "+ Dodaj blok" nazad, poravnanje, veličina teksta, boja teksta, pozicija/veličina
// (uključujući grešku kad je vrednost manja od 1), pozadina bloka, okvir oko bloka.
// Svaki test klikne u pravom brauzeru, proveri da se platno STVARNO promenilo, sačuva šablon, ponovo
// učita stranicu i proveri da je izbor ostao sačuvan. Radi se na "Moj izgled" (jedini, deljeni
// podrazumevani šablon probnog naloga - isti koji koriste i template-editor.spec.ts/template-layouts.spec.ts),
// zato serial mode + JEDNO čišćenje na kraju fajla (afterAll - "Vrati na podrazumevano"), ne posle svakog
// testa - isti obrazac kao template-assignment.spec.ts.
// NAPOMENA: platno editora (TemplateEditorClient.tsx, "Primer podataka") UVEK crta na ENGLESKOM
// (<InvoiceDoc jezik="en" .../>), dok su nazivi/prekidači u LEVOM panelu na srpskom (NAZIVI_BLOKOVA) -
// zato se ispod za sadržaj NA PLATNU koristi "Signature and stamp", a za prekidače/dugmad "Potpis i pečat".
import { test, expect } from "@playwright/test";
import { hexToRgb } from "./hex";

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await page.goto("/fakture/sablon");
});

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage({ storageState: ".playwright/storageState.json" });
  await page.goto("/fakture/sablon");
  await page.getByRole("button", { name: "Vrati na podrazumevano" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).not.toBeVisible({ timeout: 10_000 });
  await page.close();
});

function platno(page: import("@playwright/test").Page) {
  return page.locator('[class*="InvoiceDoc"][class*="papir"]');
}

async function sacuvajIProveriPosleReload(page: import("@playwright/test").Page, provera: () => Promise<void>) {
  await page.getByRole("button", { name: "Sačuvaj šablon" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).not.toBeVisible({ timeout: 10_000 });
  await page.reload();
  await provera();
}

test("uključivanje/isključivanje bloka i '+ Dodaj blok' nazad - ostaje posle reload-a", async ({ page }) => {
  // "Potpis i pečat" je po podrazumevanom ISKLJUČEN (napraviPodrazumevaniSablonPodatke - blocksOff).
  await expect(platno(page).getByText("Signature and stamp")).toHaveCount(0);

  // Uključi preko prekidača u levoj listi blokova.
  await page.getByRole("switch", { name: "Uključi Potpis i pečat" }).click();
  await expect(platno(page).getByText("Signature and stamp")).toBeVisible();

  await sacuvajIProveriPosleReload(page, async () => {
    await expect(platno(page).getByText("Signature and stamp")).toBeVisible();
  });

  // Isključi preko ISTOG prekidača, pa ponovo uključi preko "+ Dodaj blok" (drugi ulaz, isti rezultat).
  await page.getByRole("switch", { name: "Uključi Potpis i pečat" }).click();
  await expect(platno(page).getByText("Signature and stamp")).toHaveCount(0);

  await page.getByRole("button", { name: "+ Dodaj blok" }).click();
  await page.getByRole("button", { name: "Potpis i pečat", exact: true }).click();
  await expect(platno(page).getByText("Signature and stamp")).toBeVisible();

  await sacuvajIProveriPosleReload(page, async () => {
    await expect(platno(page).getByText("Signature and stamp")).toBeVisible();
  });
});

test("poravnanje, veličina teksta i boja menjaju platno (blok 'Podaci o tvojoj firmi') - ostaje posle reload-a", async ({
  page,
}) => {
  await page.locator('[class*="blokRed"]', { hasText: "Podaci o tvojoj firmi" }).click();

  // "Probni Petrović" je ownerName probnog naloga (scripts/e2e-seed.ts) - getByText je case-insensitive,
  // pa poklapa i veliku verziju slova koju InvoiceDoc crta (imeFirme.toUpperCase()). .first() - isto ime
  // se ponavlja i u bloku "banka" ("Beneficiary: ..."), "firma" je prvi u DOM redosledu (From: ...).
  const blokNaPlatnu = platno(page).getByText("Probni Petrović", { exact: false }).first();

  await expect(blokNaPlatnu).toHaveCSS("text-align", "left"); // podrazumevano
  await page.getByRole("button", { name: "Sredina", exact: true }).click();
  await expect(blokNaPlatnu).toHaveCSS("text-align", "center");

  await expect(blokNaPlatnu).toHaveCSS("font-size", "12px"); // 0.75rem (normal), podrazumevano
  await page.getByRole("button", { name: "Veći", exact: true }).click();
  await expect(blokNaPlatnu).toHaveCSS("font-size", "14px"); // 0.875rem

  await page.getByRole("button", { name: "#B4281E" }).click();
  await expect(blokNaPlatnu).toHaveCSS("color", hexToRgb("#B4281E"));

  await sacuvajIProveriPosleReload(page, async () => {
    await page.locator('[class*="blokRed"]', { hasText: "Podaci o tvojoj firmi" }).click();
    await expect(page.getByRole("button", { name: "Sredina", exact: true })).toHaveClass(/segmentAktivan/);
    await expect(page.getByRole("button", { name: "Veći", exact: true })).toHaveClass(/segmentAktivan/);
    await expect(page.getByRole("button", { name: "#B4281E" })).toHaveClass(/svatchAktivan/);
    await expect(blokNaPlatnu).toHaveCSS("text-align", "center");
    await expect(blokNaPlatnu).toHaveCSS("font-size", "14px");
    await expect(blokNaPlatnu).toHaveCSS("color", hexToRgb("#B4281E"));
  });
});

test("pozadina i okvir bloka menjaju platno (blok 'Bankovni podaci') - ostaje posle reload-a", async ({ page }) => {
  await page.locator('[class*="blokRed"]', { hasText: "Bankovni podaci" }).click();
  const blokNaPlatnu = platno(page).getByText("Banking details:");

  await expect(blokNaPlatnu).toHaveCSS("background-color", "rgba(0, 0, 0, 0)"); // bez pozadine, podrazumevano
  await page.getByRole("switch", { name: "Pozadina bloka" }).click();
  await expect(blokNaPlatnu).toHaveCSS("background-color", "rgba(200, 241, 105, 0.14)");

  await expect(blokNaPlatnu).toHaveCSS("border-top-width", "0px");
  await page.getByRole("switch", { name: "Okvir oko bloka" }).click();
  await expect(blokNaPlatnu).toHaveCSS("border-top-width", "1px");

  await sacuvajIProveriPosleReload(page, async () => {
    await page.locator('[class*="blokRed"]', { hasText: "Bankovni podaci" }).click();
    await expect(page.getByRole("switch", { name: "Pozadina bloka" })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("switch", { name: "Okvir oko bloka" })).toHaveAttribute("aria-checked", "true");
    await expect(blokNaPlatnu).toHaveCSS("background-color", "rgba(200, 241, 105, 0.14)");
    await expect(blokNaPlatnu).toHaveCSS("border-top-width", "1px");
  });
});

test("pozicija/veličina bloka: Širina menja platno (kolona firme), Visina < 1 prikazuje grešku", async ({ page }) => {
  await page.locator('[class*="blokRed"]', { hasText: "Podaci o tvojoj firmi" }).click();

  // Širina bloka "Podaci o tvojoj firmi" je JEDINO polje pozicije/veličine koje danas ima VIDLJIV efekat
  // na platnu (postavlja width desne kolone, InvoiceDoc.tsx: style={{width: sablon.blockProps.firma.w}});
  // X/Y/Visina (za SVE blokove) i Širina za SVE OSTALE blokove danas nemaju nikakav vizuelan efekat -
  // stilBloka() ih uopšte ne koristi (izveštaj - nije popravljeno, samo zabeleženo).
  // div, ne [class*="desno"] bez taga - isti prefiks dele i th/td.desnoPoravnato (kolone tabele).
  const desnaKolona = page.locator('div[class*="InvoiceDoc"][class*="desno"]');
  await expect(desnaKolona).toHaveCSS("width", "210px");

  const sirinaPolje = page.getByText("Širina", { exact: true }).locator("xpath=..").locator("input");
  await sirinaPolje.fill("300");
  await expect(desnaKolona).toHaveCSS("width", "300px");

  await sacuvajIProveriPosleReload(page, async () => {
    await page.locator('[class*="blokRed"]', { hasText: "Podaci o tvojoj firmi" }).click();
    await expect(page.getByText("Širina", { exact: true }).locator("xpath=..").locator("input")).toHaveValue("300");
    await expect(desnaKolona).toHaveCSS("width", "300px");
  });

  // Neispravna vrednost (< 1) se i dalje NE ČUVA u šablon, ali sad se ispod polja prikazuje poruka dok je
  // vrednost neispravna (ranije se ovo tiho odbijalo bez ikakve poruke - popravljeno).
  const visinaPolje = page.getByText("Visina", { exact: true }).locator("xpath=..").locator("input");
  const pocetnaVisina = await visinaPolje.inputValue();
  const greskaVisina = page.getByText("Mora biti broj veći od 0.");

  await expect(greskaVisina).not.toBeVisible();
  await visinaPolje.fill("0");
  await expect(visinaPolje).toHaveValue(pocetnaVisina); // i dalje se ne čuva u šablon
  await expect(greskaVisina).toBeVisible();

  await visinaPolje.fill("-5");
  await expect(greskaVisina).toBeVisible(); // ostaje vidljiva i za negativnu vrednost

  // Ispravna vrednost - poruka nestaje, vrednost se čuva.
  await visinaPolje.fill("200");
  await expect(greskaVisina).not.toBeVisible();
  await expect(visinaPolje).toHaveValue("200");

  // Izbor drugog bloka čisti lokalnu grešku (ne sme da "procuri" na drugi blok).
  await visinaPolje.fill("0");
  await expect(greskaVisina).toBeVisible();
  await page.locator('[class*="blokRed"]', { hasText: "Bankovni podaci" }).click();
  await expect(greskaVisina).not.toBeVisible();
});
