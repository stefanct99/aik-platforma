// Baner upozorenja na limit (Korak 9f, frejm Kp7 - prag 80%; 90/100 su odluka zadatka, bez frejma).
// Testovi NE zavise od tačnog postojećeg procenta u probnoj bazi - pročitaju trenutni procenat sa
// kartice (isti obrazac kao dodaj-prihod.spec.ts/obrisi-prihod.spec.ts), pa dodaju TAČNO toliko dinarskog
// prihoda da ukupno uđe duboko u ciljani prag (85/95/110%, ne na samu granicu - granice su već pokrivene
// vitest testovima za pragLimitBanera). Svaki test čisti sopstveni dodati red na kraju (brisanjem preko
// panela), pa procenat vraća na baznu vrednost pre sledećeg testa.
import { test, expect, type Page } from "@playwright/test";
import { e2eDb } from "./db";

test.describe.configure({ mode: "serial" });

const LIMIT_DIN = 6_000_000;

async function procitajProcenatLimita(page: Page): Promise<number> {
  const glavna = page.locator('[class*="glavnaKartica"]');
  const tekst = await glavna.locator('[class*="trakaFoot"]').first().innerText();
  const procenat = tekst.match(/([\d,]+)%/)?.[1] ?? "0";
  return parseFloat(procenat.replace(",", "."));
}

// Koliko dinara treba dodati (preko "Dodaj prihod") da trenutni procenat ode na ciljani - zaokruženo na
// ceo dinar da iznos u tabeli ima čist prikaz (",00").
function potrebanIznos(trenutniProcenat: number, ciljaniProcenat: number): number {
  const trenutnoDin = (trenutniProcenat / 100) * LIMIT_DIN;
  const ciljanoDin = (ciljaniProcenat / 100) * LIMIT_DIN;
  return Math.round(ciljanoDin - trenutnoDin);
}

function banerLocator(page: Page) {
  return page.locator('[class*="upozorenje"], [class*="opasnost"]').filter({
    has: page.locator("a", { hasText: "Vidi na stranici Porez i rokovi" }),
  });
}

async function dodajDinarskiPrihod(page: Page, iznosDin: number) {
  await page
    .getByRole("button", { name: "Dodaj prihod", exact: true })
    .first()
    .click();
  await page.getByLabel("Iznos u dinarima").fill(String(iznosDin));
  await page.getByRole("button", { name: "Sačuvaj prihod" }).click();
}

async function obrisiRedPoIznosu(page: Page, iznosTekst: string) {
  // Podtab ostaje na "Devizni" (podrazumevano) posle "Dodaj prihod" - dinarski red je vidljiv tek posle
  // prelaska na "Dinarski prihodi" (isti korak kao obrisi-prihod.spec.ts).
  await page.getByRole("button", { name: /^Dinarski prihodi/ }).click();
  await page
    .locator("tbody tr", { hasText: iznosTekst })
    .filter({ hasNotText: "Ukupno" })
    .click();
  await page.getByRole("button", { name: "Obriši prihod" }).click();
  await page.getByRole("button", { name: "Obriši prihod" }).last().click();
}

test.afterAll(() => {
  // Sigurnosna mreža - svaki test čisti svoj red preko panela, ovo pokriva slučaj da neki test padne pre
  // sopstvenog brisanja (isti obrazac kao obrisi-prihod.spec.ts).
  e2eDb("delete-manual-incomes");
});

test.beforeEach(async ({ page }) => {
  await page.goto("/knjiga-prihoda");
});

test("ispod 80% - baner se ne prikazuje", async ({ page }) => {
  const p0 = await procitajProcenatLimita(page);
  // Pretpostavka ovog testa (ne nagađanje): ostali spec fajlovi čiste za sobom, pa je bazni procenat u
  // probnom nalogu ispod 80% - ako nije, ovaj expect to jasno prijavi umesto da test tiho lažno prođe.
  expect(p0).toBeLessThan(80);
  await expect(banerLocator(page)).not.toBeVisible();
});

test("80% (između 80 i 90) - baner 'Približavaš se', tekst sa preostalim iznosom, nestaje posle brisanja", async ({
  page,
}) => {
  const p0 = await procitajProcenatLimita(page);
  const iznos = potrebanIznos(p0, 85);

  await dodajDinarskiPrihod(page, iznos);
  await expect(banerLocator(page)).toBeVisible();
  await expect(
    page.getByText("Približavaš se limitu za paušalce"),
  ).toBeVisible();
  await expect(
    page.getByText(/Do 6\.000\.000 din ti je ostalo .+ din\. Kad ga pređeš,/),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Vidi na stranici Porez i rokovi" }),
  ).toHaveAttribute("href", "/porez");

  await obrisiRedPoIznosu(page, iznos.toLocaleString("sr-RS") + ",00");
  await expect(
    page.getByRole("button", { name: "Dodaj prihod", exact: true }).first(),
  ).toBeVisible();
  await expect(banerLocator(page)).not.toBeVisible();
});

test("90% (između 90 i 100) - baner 'Dostigao si X%', crvenkasta varijanta", async ({
  page,
}) => {
  const p0 = await procitajProcenatLimita(page);
  const iznos = potrebanIznos(p0, 95);

  await dodajDinarskiPrihod(page, iznos);
  await expect(banerLocator(page)).toBeVisible();
  await expect(page.getByText(/Dostigao si \d+,\d% godišnjeg limita/)).toBeVisible();
  await expect(
    page.getByText(/Do 6\.000\.000 din ti je ostalo .+ din\. Kad ga pređeš,/),
  ).toBeVisible();

  await obrisiRedPoIznosu(page, iznos.toLocaleString("sr-RS") + ",00");
  await expect(banerLocator(page)).not.toBeVisible();
});

test("preko 100% - baner 'Prešao si limit', drugačija poruka (bez preostalog)", async ({
  page,
}) => {
  const p0 = await procitajProcenatLimita(page);
  const iznos = potrebanIznos(p0, 110);

  await dodajDinarskiPrihod(page, iznos);
  await expect(banerLocator(page)).toBeVisible();
  await expect(page.getByText("Prešao si limit za paušalce")).toBeVisible();
  await expect(
    page.getByText(
      "Prešao si 6.000.000 din. Menja se način oporezivanja, pa se javi knjigovođi da vidiš šta dalje.",
    ),
  ).toBeVisible();

  await obrisiRedPoIznosu(page, iznos.toLocaleString("sr-RS") + ",00");
  await expect(banerLocator(page)).not.toBeVisible();
});

test("baner ne zavisi od izabrane godine u filteru", async ({ page }) => {
  const p0 = await procitajProcenatLimita(page);
  const iznos = potrebanIznos(p0, 85);

  await dodajDinarskiPrihod(page, iznos);
  await expect(page.getByText("Približavaš se limitu za paušalce")).toBeVisible();

  const godineSelect = page.getByRole("combobox").first();
  const opcije = await godineSelect.locator("option").allTextContents();
  const drugaGodina = opcije.find((g) => g.trim() !== String(new Date().getFullYear()));
  if (drugaGodina) {
    await godineSelect.selectOption({ label: drugaGodina });
    // Isti baner, ista poruka - nezavisno od toga koja je godina izabrana (procenat je iz kliznog
    // prozora od 365 dana, ne iz kalendarske godine filtera).
    await expect(
      page.getByText("Približavaš se limitu za paušalce"),
    ).toBeVisible();
    await godineSelect.selectOption({ label: String(new Date().getFullYear()) });
  }

  await obrisiRedPoIznosu(page, iznos.toLocaleString("sr-RS") + ",00");
  await expect(banerLocator(page)).not.toBeVisible();
});
