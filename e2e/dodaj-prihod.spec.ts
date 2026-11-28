// "Dodaj prihod" (Korak 9d-2, bočni panel, frejm Kp5) - dugme u zaglavlju otvara panel, Vrsta prihoda
// (Dinarski/Devizni), Klijent ("Nije poznat" ili postojeći), Valuta+Kurs samo za devizni, validacije po
// polju, Odustani odbacuje unos, uspeh zatvara panel i osvežava listu/kartice/limit. Testovi NAMERNO ne
// biraju poseban datum/godinu (podrazumevano "danas", tekuća godina) - umesto toga porede zbir/broj
// uplata PRE i POSLE (delta), pa ne zavise od tačnih postojećih vrednosti u probnoj bazi. Čiste za sobom
// (afterAll: e2eDb "delete-manual-incomes" - briše SAMO redove bez fakture koje ovaj fajl pravi, vidi
// scripts/e2e-db.ts), bezbedno za ostale spec fajlove koji dele istu probnu bazu u istom pokretanju.
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

// router.refresh() (posle čuvanja) je asinhrono - panel se zatvara ODMAH, pre nego što osveženi podaci
// stvarno stignu. Umesto proizvoljnog čekanja (networkidle), SAČEKAJ (Playwright-ovo automatsko
// ponavljanje) da broj uplata na kartici stvarno dostigne očekivanu vrednost, PA TEK ONDA pročitaj iznos -
// to garantuje da je DOM već osvežen pre čitanja (ne proizvoljan tajming).
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

test.afterAll(() => {
  e2eDb("delete-manual-incomes");
});

test.beforeEach(async ({ page }) => {
  await page.goto("/knjiga-prihoda");
});

test("dinarski: ispravan unos sa klijentom i opisom - panel se zatvara, kartica/zbir se uvećavaju", async ({
  page,
}) => {
  const preUplata = await procitajUplata(page, "Dinarski prihodi");
  const preIznos = await procitajIznos(page, "Dinarski prihodi");

  await page
    .getByRole("button", { name: "Dodaj prihod", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Klijent", { exact: true })
    .selectOption({ label: "Acme Inc. (E2E)" });
  await page.getByLabel("Iznos u dinarima").fill("1234.56");
  await page
    .getByLabel("Opis (nije obavezno)")
    .fill("E2E ručni unos - dinarski");
  await page.getByRole("button", { name: "Sačuvaj prihod" }).click();

  // Panel se zatvara posle uspeha ("Sačuvaj prihod" postoji SAMO u panelu, za razliku od "Dodaj prihod"
  // koje postoji i kao dugme u zaglavlju - ne go check na taj tekst).
  await expect(
    page.getByRole("button", { name: "Sačuvaj prihod" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Dodaj prihod", exact: true }).first(),
  ).toBeVisible();

  const posleIznos = await sacekajIProcitajIznos(
    page,
    "Dinarski prihodi",
    preUplata + 1,
  );
  expect(posleIznos).toBeCloseTo(preIznos + 1234.56, 2);

  await page.getByRole("button", { name: /^Dinarski prihodi/ }).click();
  // Po klijentu, ne po iznosu - "Ukupno dinarski prihodi" red TAKOĐE sadrži "1.234,56" kad je ovo jedini
  // red (zbir == taj jedan iznos), pa bi hasText na iznos bio dvosmislen.
  const red = page.locator("tbody tr", { hasText: "Acme Inc. (E2E)" });
  await expect(red).toBeVisible();
  await expect(red.getByText("1.234,56")).toBeVisible();
  await expect(red.getByText("–", { exact: true })).toBeVisible(); // Faktura
  await expect(red.getByText("Ručno", { exact: true })).toBeVisible();
});

test("devizni: ispravan unos sa kursom - preračun tačan, klijent 'Nije poznat', kartica se uvećava", async ({
  page,
}) => {
  const preUplata = await procitajUplata(page, "Devizni prihodi");
  const preIznos = await procitajIznos(page, "Devizni prihodi");

  await page
    .getByRole("button", { name: "Dodaj prihod", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Devizni", exact: true }).click();
  await page.getByLabel("Valuta", { exact: true }).selectOption("USD");
  await page.getByLabel("Iznos u USD", { exact: true }).fill("200");
  await page.getByLabel("Kurs", { exact: true }).fill("100");
  await page.getByRole("button", { name: "Sačuvaj prihod" }).click();

  await expect(
    page.getByRole("button", { name: "Dodaj prihod", exact: true }).first(),
  ).toBeVisible();

  const posleIznos = await sacekajIProcitajIznos(
    page,
    "Devizni prihodi",
    preUplata + 1,
  );
  expect(posleIznos).toBeCloseTo(preIznos + 20_000, 2); // 200 USD * 100 = 20.000,00 din

  await expect(
    page.getByRole("button", { name: /^Devizni prihodi/ }),
  ).toBeVisible();
  const red = page.locator("tbody tr", { hasText: "200,00 $" });
  await expect(red).toBeVisible();
  await expect(red.getByText("Nije poznat")).toBeVisible();
  const celije = red.locator("td");
  await expect(celije.nth(4)).toHaveText("100,00"); // Kurs
  await expect(celije.nth(5)).toHaveText("20.000,00"); // U dinarima
});

test("validacije: greška ispod odgovarajućeg polja, nestaje čim se vrednost promeni", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Dodaj prihod", exact: true })
    .first()
    .click();

  // Dinarski, bez iznosa.
  await page.getByRole("button", { name: "Sačuvaj prihod" }).click();
  const greskaIznos = page.getByText("Iznos mora biti broj veći od 0.");
  await expect(greskaIznos).toBeVisible();
  await page.getByLabel("Iznos u dinarima").fill("100");
  await expect(greskaIznos).not.toBeVisible();

  // Devizni, sa iznosom ali bez kursa.
  await page.getByRole("button", { name: "Devizni", exact: true }).click();
  await page.getByLabel("Iznos u EUR", { exact: true }).fill("100");
  await page.getByRole("button", { name: "Sačuvaj prihod" }).click();
  const greskaKurs = page.getByText("Kurs mora biti broj veći od 0.");
  await expect(greskaKurs).toBeVisible();
  await expect(greskaIznos).not.toBeVisible(); // iznos je i dalje ispravan, ta greška se ne vraća
  await page.getByLabel("Kurs", { exact: true }).fill("100");
  await expect(greskaKurs).not.toBeVisible();

  // Zatvori bez čuvanja (ne pravi redove za ovaj test).
  await page.getByRole("button", { name: "Odustani", exact: true }).click();
});

test("'Odustani' odbacuje unos - ništa se ne čuva, sledeće otvaranje počinje prazno", async ({
  page,
}) => {
  const preUplata = await procitajUplata(page, "Dinarski prihodi");
  const preIznos = await procitajIznos(page, "Dinarski prihodi");

  await page
    .getByRole("button", { name: "Dodaj prihod", exact: true })
    .first()
    .click();
  await page.getByLabel("Iznos u dinarima").fill("9999");
  await page.getByLabel("Opis (nije obavezno)").fill("Ne treba da se sačuva");
  await page.getByRole("button", { name: "Odustani", exact: true }).click();

  await expect(
    page.getByRole("button", { name: "Dodaj prihod", exact: true }).first(),
  ).toBeVisible();
  // Nema čuvanja - nema osvežavanja da se čeka, broj uplata ostaje ISTI (ne +1).
  expect(await procitajUplata(page, "Dinarski prihodi")).toBe(preUplata);
  expect(await procitajIznos(page, "Dinarski prihodi")).toBeCloseTo(
    preIznos,
    2,
  );

  // Sledeće otvaranje - prazno, podrazumevane vrednosti (ne "9999"/opis od malopre).
  await page
    .getByRole("button", { name: "Dodaj prihod", exact: true })
    .first()
    .click();
  await expect(page.getByLabel("Iznos u dinarima")).toHaveValue("");
  await expect(page.getByLabel("Opis (nije obavezno)")).toHaveValue("");
  await page.getByRole("button", { name: "Odustani", exact: true }).click();
});

test("dva uzastopna unosa u istoj sesiji rade (otvaranje/zatvaranje panela dva puta)", async ({
  page,
}) => {
  const preUplata = await procitajUplata(page, "Dinarski prihodi");
  const preIznos = await procitajIznos(page, "Dinarski prihodi");

  await page
    .getByRole("button", { name: "Dodaj prihod", exact: true })
    .first()
    .click();
  await page.getByLabel("Iznos u dinarima").fill("111");
  await page.getByRole("button", { name: "Sačuvaj prihod" }).click();
  await expect(
    page.getByRole("button", { name: "Dodaj prihod", exact: true }).first(),
  ).toBeVisible();
  await sacekajIProcitajIznos(page, "Dinarski prihodi", preUplata + 1);

  await page
    .getByRole("button", { name: "Dodaj prihod", exact: true })
    .first()
    .click();
  await page.getByLabel("Iznos u dinarima").fill("222");
  await page.getByRole("button", { name: "Sačuvaj prihod" }).click();
  await expect(
    page.getByRole("button", { name: "Dodaj prihod", exact: true }).first(),
  ).toBeVisible();

  const posleIznos = await sacekajIProcitajIznos(
    page,
    "Dinarski prihodi",
    preUplata + 2,
  );
  expect(posleIznos).toBeCloseTo(preIznos + 111 + 222, 2);

  await page.getByRole("button", { name: /^Dinarski prihodi/ }).click();
  await expect(page.locator("tbody tr", { hasText: "111,00" })).toBeVisible();
  await expect(page.locator("tbody tr", { hasText: "222,00" })).toBeVisible();
});
