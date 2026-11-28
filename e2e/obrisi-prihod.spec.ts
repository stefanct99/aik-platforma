// "Obriši prihod" (Korak 9e, dijalog Kp8) - otvara se preko linka u panelu "Detalj uplate"; TRAJNO
// brisanje, zbir/procenat limita/brojači po klijentu se osvežavaju; ako je prihod vezan za fakturu koja
// je "Plaćena", faktura se vraća na "Poslata"/"Kasni" (vidi rečenicu u dijalogu). Testovi prave sopstvene
// podatke (ili koriste e2eDb create-paid-invoice/delete-invoice, isti obrazac kao knjiga-prihoda.spec.ts)
// i čiste za sobom - ne zavise od tačnih postojećih vrednosti u probnoj bazi (delta pre/posle).
import { test, expect, type Page } from "@playwright/test";
import { e2eDb } from "./db";

test.describe.configure({ mode: "serial" });

function parsirajSrBroj(tekst: string): number {
  const cisto = tekst
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return Number(cisto);
}

function kartica(page: Page, naslov: string) {
  return page.locator('[class*="sporednaKartica"]', { hasText: naslov });
}

async function procitajUplata(page: Page, naslov: string): Promise<number> {
  const tekst = await kartica(page, naslov)
    .locator('[class*="labelaMuted"]')
    .last()
    .innerText();
  return parseInt(tekst, 10);
}

async function procitajIznos(page: Page, naslov: string): Promise<number> {
  const tekst = await kartica(page, naslov)
    .locator('[class*="vrednostSrednja"]')
    .innerText();
  return parsirajSrBroj(tekst);
}

// Isti princip kao dodaj-prihod.spec.ts: sačekaj (Playwright-ovo automatsko ponavljanje) da broj uplata
// stvarno dostigne očekivanu vrednost pre čitanja iznosa - router.refresh() posle brisanja je asinhrono.
async function sacekajIProcitajIznos(
  page: Page,
  naslov: string,
  ocekivanaUplata: number,
): Promise<number> {
  await expect(
    kartica(page, naslov).locator('[class*="labelaMuted"]').last(),
  ).toHaveText(new RegExp(`^${ocekivanaUplata}\\s`));
  return procitajIznos(page, naslov);
}

async function procitajProcenatLimita(page: Page): Promise<number> {
  const glavna = page.locator('[class*="glavnaKartica"]');
  const tekst = await glavna
    .locator('[class*="trakaFoot"]')
    .first()
    .innerText();
  const procenat = tekst.match(/([\d,]+)%/)?.[1] ?? "0";
  return parseFloat(procenat.replace(",", "."));
}

async function procitajBroj30Dana(page: Page): Promise<number> {
  const tekst = await page
    .locator('[class*="karticaTreca"]')
    .locator('[class*="karticaLabela"]')
    .last()
    .innerText();
  return parseInt(tekst, 10);
}

async function otvoriPanelZaRed(page: Page, hasText: string) {
  // Isključi "Ukupno ..." red - kad je ovo JEDINI podatkovni red, zbir mu je jednak iznosu, pa bi ga
  // hasText na iznos inače dvosmisleno uhvatio (isti problem kao knjiga-prihoda.spec.ts).
  await page
    .locator("tbody tr", { hasText })
    .filter({ hasNotText: "Ukupno" })
    .click();
}

async function kliknuObrisiIPotvrdi(page: Page) {
  await page.getByRole("button", { name: "Obriši prihod" }).click();
  // Modal (centriran) - njegovo dugme "Obriši prihod" je DRUGI element sa tim tekstom (prvi je link u
  // panelu iza senke modala) - .last() ga uzima pouzdano.
  await page.getByRole("button", { name: "Obriši prihod" }).last().click();
}

test.afterAll(() => {
  // "Dodaj prihod"-stvoreni redovi bez fakture (isti e2eDb kao dodaj-prihod.spec.ts) - čisti sve što je
  // ovaj fajl eventualno ostavio (testovi ispod sami brišu ono što prave preko panela, ovo je sigurnosna
  // mreža ako neki test padne pre svog sopstvenog brisanja).
  e2eDb("delete-manual-incomes");
});

test.beforeEach(async ({ page }) => {
  await page.goto("/knjiga-prihoda");
});

test("brisanje dinarskog prihoda bez fakture - zbir i procenat limita se smanjuju nazad na prethodno", async ({
  page,
}) => {
  const preUplata = await procitajUplata(page, "Dinarski prihodi");
  const preIznos = await procitajIznos(page, "Dinarski prihodi");
  const preProcenat = await procitajProcenatLimita(page);

  await page
    .getByRole("button", { name: "Dodaj prihod", exact: true })
    .first()
    .click();
  await page.getByLabel("Iznos u dinarima").fill("55000");
  await page.getByRole("button", { name: "Sačuvaj prihod" }).click();
  await sacekajIProcitajIznos(page, "Dinarski prihodi", preUplata + 1);

  await page.getByRole("button", { name: /^Dinarski prihodi/ }).click();
  await otvoriPanelZaRed(page, "55.000,00");
  await kliknuObrisiIPotvrdi(page);

  const posleIznos = await sacekajIProcitajIznos(
    page,
    "Dinarski prihodi",
    preUplata,
  );
  expect(posleIznos).toBeCloseTo(preIznos, 2);
  expect(await procitajProcenatLimita(page)).toBeCloseTo(preProcenat, 1);
});

test("brisanje deviznog prihoda bez fakture - zbir se smanjuje nazad na prethodno", async ({
  page,
}) => {
  const preUplata = await procitajUplata(page, "Devizni prihodi");
  const preIznos = await procitajIznos(page, "Devizni prihodi");

  await page
    .getByRole("button", { name: "Dodaj prihod", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Devizni", exact: true }).click();
  await page.getByLabel("Iznos u EUR", { exact: true }).fill("321");
  await page.getByLabel("Kurs", { exact: true }).fill("117.2");
  await page.getByRole("button", { name: "Sačuvaj prihod" }).click();
  await sacekajIProcitajIznos(page, "Devizni prihodi", preUplata + 1);

  await page.getByRole("button", { name: /^Devizni prihodi/ }).click();
  await otvoriPanelZaRed(page, "321,00 €");
  await kliknuObrisiIPotvrdi(page);

  const posleIznos = await sacekajIProcitajIznos(
    page,
    "Devizni prihodi",
    preUplata,
  );
  expect(posleIznos).toBeCloseTo(preIznos, 2);
});

test("'Odustani' u dijalogu ne briše ništa", async ({ page }) => {
  const preUplata = await procitajUplata(page, "Dinarski prihodi");

  await page
    .getByRole("button", { name: "Dodaj prihod", exact: true })
    .first()
    .click();
  await page.getByLabel("Iznos u dinarima").fill("777");
  await page.getByRole("button", { name: "Sačuvaj prihod" }).click();
  await sacekajIProcitajIznos(page, "Dinarski prihodi", preUplata + 1);

  await page.getByRole("button", { name: /^Dinarski prihodi/ }).click();
  await otvoriPanelZaRed(page, "777,00");
  await page.getByRole("button", { name: "Obriši prihod" }).click();
  await expect(page.getByText("Obrisati prihod?")).toBeVisible();
  await page
    .getByRole("button", { name: "Odustani", exact: true })
    .last()
    .click();

  // Dijalog i panel ostaju (klik "Odustani" u DIJALOGU ne zatvara i panel "Detalj uplate" iza njega).
  await expect(page.getByText("Obrisati prihod?")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Ispravi" })).toBeVisible();
  expect(await procitajUplata(page, "Dinarski prihodi")).toBe(preUplata + 1);

  // Očisti za sobom (nije deo onoga što se testira, samo higijena ovog testa).
  await page
    .getByRole("button", { name: "Zatvori", exact: true })
    .first()
    .click();
  await otvoriPanelZaRed(page, "777,00");
  await kliknuObrisiIPotvrdi(page);
  await sacekajIProcitajIznos(page, "Dinarski prihodi", preUplata);
});

test("brisanje prihoda vezanog za fakturu: faktura izlazi iz 'Plaćene' i prelazi u 'Kasni', 'Naplaćeno u 30 dana' se smanjuje", async ({
  page,
}) => {
  const { id: fakturaId, broj } = e2eDb("create-paid-invoice", {
    klijent: "Acme",
    valuta: "RSD",
    iznos: 500_000,
    datum: "2026-11-05", // rok (7 dana) davno prošao, paidDate i dalje u poslednjih 30 dana
  });

  await page.goto("/fakture");
  await page.getByRole("button", { name: /^Plaćene/ }).click();
  await expect(page.getByText(broj, { exact: true })).toBeVisible();
  const pre30 = await procitajBroj30Dana(page);

  await page.goto("/knjiga-prihoda");
  await page.getByRole("button", { name: /^Dinarski prihodi/ }).click();
  await otvoriPanelZaRed(page, broj);
  await page.getByRole("button", { name: "Obriši prihod" }).click();
  await expect(
    page.getByText(`Faktura ${broj} se vraća na Kasni.`),
  ).toBeVisible();
  await page.getByRole("button", { name: "Obriši prihod" }).last().click();
  await expect(
    page.getByRole("button", { name: "Dodaj prihod", exact: true }).first(),
  ).toBeVisible();

  await page.goto("/fakture");
  await page.getByRole("button", { name: /^Plaćene/ }).click();
  await expect(page.getByText(broj, { exact: true })).not.toBeVisible();
  await page.getByRole("button", { name: /^Kasne/ }).click();
  await expect(page.getByText(broj, { exact: true })).toBeVisible();
  await expect(page.getByText(/^Kasni \d+ dan/).first()).toBeVisible();

  await expect
    .poll(() => procitajBroj30Dana(page), { timeout: 5000 })
    .toBe(pre30 - 1);

  e2eDb("delete-invoice", { id: fakturaId });
});

test("klijent bez ijedne uplate nestaje iz filtera Klijent", async ({
  page,
}) => {
  // Godina 2024 (ne "danas") - u probnoj bazi NEMA nijednog prihoda za 2024 (druga spec datoteka to i
  // proverava, "prazno stanje"), pa je ovo garantovano čist, nula-osnovica za OVOG klijenta: posle
  // dodavanja broj uplata ide na 1, posle brisanja nazad na 0 (klijent nestaje), bez obzira na ono što
  // druge spec datoteke rade sa 2025/2026/2027.
  await page
    .getByRole("button", { name: "Dodaj prihod", exact: true })
    .first()
    .click();
  await page.getByLabel("Datum uplate").fill("15.03.2024.");
  await page
    .getByLabel("Klijent", { exact: true })
    .selectOption({ label: "Dinarska Firma (E2E)" });
  await page.getByLabel("Iznos u dinarima").fill("4000");
  await page.getByRole("button", { name: "Sačuvaj prihod" }).click();
  await expect(
    page.getByRole("button", { name: "Dodaj prihod", exact: true }).first(),
  ).toBeVisible();

  await page.getByRole("combobox").first().selectOption("2024");
  await page.getByRole("button", { name: /^Dinarski prihodi/ }).click();
  await page.getByRole("button", { name: "Svi klijenti" }).click();
  await expect(
    page.getByRole("button", { name: /Dinarska Firma \(E2E\)/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Dinarska Firma \(E2E\)/ }).click();

  await otvoriPanelZaRed(page, "4.000,00");
  await kliknuObrisiIPotvrdi(page);

  // Godina 2024 je sad opet potpuno prazna (ovo je bila jedina uplata u njoj) - stranica prelazi na
  // prazno stanje, koje uopšte nema Klijent padajući meni (nema šta da se filtrira).
  await expect(page.getByText("Još nema prihoda u 2024.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Svi klijenti" }),
  ).not.toBeVisible();
});
