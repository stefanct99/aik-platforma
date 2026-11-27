// Knjiga prihoda: lista (desktop, Korak 9a) - kartice zbira, podtabovi, filteri (Godina/Mesec/Klijent),
// "Očisti filtere", prazno stanje, red sa fakturom otvara fakturu. Fixture (beforeAll): dve NOVE plaćene
// fakture (scripts/e2e-db.ts: create-paid-invoice) - devizna (EUR, bez upisanog kursa - Korak 9b tek
// dolazi) i dinarska, sa poznatim iznosima/datumima da provere budu tačne. Čiste se zajedno sa celim
// probnim nalogom na kraju (e2e-cleanup.ts) - nijedan drugi fajl u paketu ne pravi "placena" fakturu, pa
// nema rizika od međusobnog uticaja.
import { test, expect } from "@playwright/test";
import { e2eDb } from "./db";

test.describe.configure({ mode: "serial" });

let fakturaDevizna: { id: string; broj: string };
let fakturaDinarska: { id: string; broj: string };

test.beforeAll(() => {
  fakturaDevizna = e2eDb("create-paid-invoice", { klijent: "Acme", valuta: "EUR", iznos: 100000, datum: "2026-01-15" });
  fakturaDinarska = e2eDb("create-paid-invoice", {
    klijent: "Dinarska",
    valuta: "RSD",
    iznos: 5000000,
    datum: "2026-02-20",
  });
});

test.beforeEach(async ({ page }) => {
  await page.goto("/knjiga-prihoda");
});

test("kartice: devizna uplata bez kursa ne ulazi u zbir (prikazuje '–'), dinarska ulazi", async ({ page }) => {
  await expect(page.getByText("Ukupan prihod u 2026.")).toBeVisible();
  // Devizna (1.000,00 €) nema upisan kurs - "Devizni prihodi" karta ostaje 0,00 din, ali se I DALJE broji
  // kao 1 uplata (red postoji u tabeli, samo ne ulazi u RSD zbir).
  const devizniKarta = page.locator('[class*="sporednaKartica"]', { hasText: "Devizni prihodi" });
  await expect(devizniKarta.getByText("0,00 din")).toBeVisible();
  await expect(devizniKarta.getByText("1 uplata")).toBeVisible();

  // Dinarska (50.000,00 din) ulazi normalno u zbir.
  const dinarskaKarta = page.locator('[class*="sporednaKartica"]', { hasText: "Dinarski prihodi" });
  await expect(dinarskaKarta.getByText("50.000,00 din")).toBeVisible();
  await expect(dinarskaKarta.getByText("1 uplata")).toBeVisible();

  // Ukupan prihod (kalendarska godina) = SAMO dinarska (devizna bez kursa je isključena).
  await expect(page.getByText("50.000,00 din").first()).toBeVisible();
});

test("tabela devizni: '–' u Kurs/U dinarima, red sa fakturom otvara fakturu", async ({ page }) => {
  await expect(page.getByRole("button", { name: /^Devizni prihodi/ })).toBeVisible();
  const red = page.locator("tbody tr", { hasText: "Acme Inc. (E2E)" });
  await expect(red).toBeVisible();
  await expect(red.getByText("1.000,00 €")).toBeVisible();
  await expect(red.getByText(fakturaDevizna.broj, { exact: true })).toBeVisible();

  // Kurs i U dinarima su "–" (rate/amountRsd su null - Korak 9b ih tek popunjava).
  const celije = red.locator("td");
  await expect(celije.nth(4)).toHaveText("–"); // Kurs
  await expect(celije.nth(5)).toHaveText("–"); // U dinarima

  await expect(page.getByText("Ukupno devizni prihodi")).toBeVisible();
  const ukupnoRed = page.locator("tr", { hasText: "Ukupno devizni prihodi" });
  await expect(ukupnoRed.getByText("0,00")).toBeVisible();

  await red.click();
  await expect(page).toHaveURL(new RegExp(`/fakture/${fakturaDevizna.id}$`));
});

test("podtab dinarski, filter Mesec i Klijent, 'Očisti filtere'", async ({ page }) => {
  await page.getByRole("button", { name: /^Dinarski prihodi/ }).click();
  const red = page.locator("tbody tr", { hasText: "Dinarska Firma (E2E)" });
  await expect(red).toBeVisible();
  await expect(red.getByText(fakturaDinarska.broj, { exact: true })).toBeVisible();

  // Filter Mesec: februar zadržava red (uplata je 20.02.2026), januar ga uklanja.
  await page.getByRole("combobox").nth(1).selectOption({ label: "Februar" });
  await expect(red).toBeVisible();
  await expect(page.getByText("Očisti filtere")).toBeVisible();
  await page.getByRole("combobox").nth(1).selectOption({ label: "Januar" });
  await expect(red).not.toBeVisible();
  await page.getByRole("combobox").nth(1).selectOption({ label: "Svi meseci" });
  await expect(red).toBeVisible();

  // Filter Klijent: bira "Dinarska Firma (E2E)" iz padajućeg menija (sa brojem uplata).
  await page.getByRole("button", { name: "Svi klijenti" }).click();
  await expect(page.getByRole("button", { name: /Dinarska Firma \(E2E\)/ })).toBeVisible();
  await page.getByRole("button", { name: /Dinarska Firma \(E2E\)/ }).click();
  await expect(red).toBeVisible();
  await expect(page.getByText("Očisti filtere")).toBeVisible();

  await page.getByText("Očisti filtere").click();
  await expect(page.getByText("Očisti filtere")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Svi klijenti" })).toBeVisible();
});

test("prazno stanje za godinu bez uplata", async ({ page }) => {
  await page.getByRole("combobox").first().selectOption("2024");
  await expect(page.getByText("Još nema prihoda u 2024.")).toBeVisible();
  await expect(
    page.getByText("Čim stigne uplata, upisujem je ovde sam. Možeš i ručno da dodaš prihod koji ja ne vidim, na primer gotovinu."),
  ).toBeVisible();
  await expect(page.getByText("0,00 din").first()).toBeVisible();
});

test("filter Godina menja kartice, dugmad Izvezi/Dodaj prihod ne rade ništa (još)", async ({ page }) => {
  await page.getByRole("combobox").first().selectOption("2024");
  await expect(page.getByText("Ukupan prihod u 2024.")).toBeVisible();
  await page.getByRole("combobox").first().selectOption("2026");
  await expect(page.getByText("Ukupan prihod u 2026.")).toBeVisible();

  // Nijedan dijalog/navigacija - dugmad su namerno inertna u ovom koraku.
  await page.getByRole("button", { name: "Izvezi", exact: true }).click();
  await page.getByRole("button", { name: "Dodaj prihod", exact: true }).click();
  await expect(page).toHaveURL(/\/knjiga-prihoda$/);
  await expect(page.getByText("Ukupan prihod u 2026.")).toBeVisible();
});
