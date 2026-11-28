// Knjiga prihoda: lista (desktop, Korak 9a) - kartice zbira, podtabovi, filteri (Godina/Mesec/Klijent),
// "Očisti filtere", prazno stanje, red OTVARA BOČNI PANEL (Korak 9c, ne fakturu direktno - fakturi se
// prilazi preko linka "Otvori" u panelu); plus Korak 9b (kurs i dinarska protivvrednost za devizne
// prihode) i regresija "kolona Faktura se ne skraćuje". Izolacija za "Ispravi" (korisnik A ne može da
// izmeni prihod korisnika B preko akcije sa tuđim ID-om) je pokrivena na nivou servera
// (src/lib/prihodi-db.test.ts) - isti obrazac kao template-isolation.spec.ts beleži za obrisiSablon
// (server akcija prima incomeId samo iz VEĆ učitanog, firmi-skopiranog panela, nema polja/URL-a gde
// korisnik sam upisuje proizvoljan tuđi id). Fixture (beforeAll):
// NOVE plaćene fakture (scripts/e2e-db.ts: create-paid-invoice) u RAZLIČITIM godinama po grupi testova
// (2026/2025/2027) da sabiranja/brojevi uplata iz jedne grupe ne utiču na drugu, sa poznatim
// iznosima/datumima/kursevima da provere budu tačne. Čiste se zajedno sa celim probnim nalogom na kraju
// (e2e-cleanup.ts) - nijedan drugi fajl u paketu ne pravi "placena" fakturu, pa nema rizika od
// međusobnog uticaja.
import { test, expect } from "@playwright/test";
import { e2eDb } from "./db";

test.describe.configure({ mode: "serial" });

let fakturaDevizna: { id: string; broj: string };
let fakturaDinarska: { id: string; broj: string };
// Namerno dug, netipičan broj fakture (regresija: kolona Faktura ga je sekla na 1440px iako je staj'o -
// videti test niže "kolona Faktura se nikad ne skraćuje"). Godina 2025 (ne 2026) da ne menja zbirove/broj
// uplata koje ostali testovi iznad proveravaju za tekuću godinu.
let fakturaDugaDevizna: { id: string; broj: string };
let fakturaDugaDinarska: { id: string; broj: string };
// Korak 9b: kurs i dinarska protivvrednost za devizne prihode. Godina 2027 (sledeća, nedirnuta drugim
// testovima) - jedna uplata SA upisanim kursom (proverava prikaz stvarnih vrednosti i da ULAZI u zbir) i
// jedna BEZ kursa (proverava da u istoj godini i dalje ostaje "–" i isključena iz zbira, uz onu sa kursom).
let fakturaSaKursom: { id: string; broj: string };
let fakturaBezKursa9b: { id: string; broj: string };

test.beforeAll(() => {
  fakturaDevizna = e2eDb("create-paid-invoice", {
    klijent: "Acme",
    valuta: "EUR",
    iznos: 100000,
    datum: "2026-01-15",
  });
  fakturaDinarska = e2eDb("create-paid-invoice", {
    klijent: "Dinarska",
    valuta: "RSD",
    iznos: 5000000,
    datum: "2026-02-20",
  });
  fakturaDugaDevizna = e2eDb("create-paid-invoice", {
    klijent: "Acme",
    valuta: "EUR",
    iznos: 50000,
    datum: "2025-05-10",
    broj: "100/26-12",
  });
  fakturaDugaDinarska = e2eDb("create-paid-invoice", {
    klijent: "Dinarska",
    valuta: "RSD",
    iznos: 1000000,
    datum: "2025-06-15",
    broj: "101/26-12",
  });
  fakturaSaKursom = e2eDb("create-paid-invoice", {
    klijent: "Acme",
    valuta: "EUR",
    iznos: 100000,
    datum: "2027-03-10",
    kurs: 117.2,
  });
  fakturaBezKursa9b = e2eDb("create-paid-invoice", {
    klijent: "Dinarska",
    valuta: "EUR",
    iznos: 50000,
    datum: "2027-04-05",
  });
});

test.beforeEach(async ({ page }) => {
  await page.goto("/knjiga-prihoda");
});

test("kartice: devizna uplata bez kursa ne ulazi u zbir (prikazuje '–'), dinarska ulazi", async ({
  page,
}) => {
  await expect(page.getByText("Ukupan prihod u 2026.")).toBeVisible();
  // Devizna (1.000,00 €) nema upisan kurs - "Devizni prihodi" karta ostaje 0,00 din, ali se I DALJE broji
  // kao 1 uplata (red postoji u tabeli, samo ne ulazi u RSD zbir).
  const devizniKarta = page.locator('[class*="sporednaKartica"]', {
    hasText: "Devizni prihodi",
  });
  await expect(devizniKarta.getByText("0,00 din")).toBeVisible();
  await expect(devizniKarta.getByText("1 uplata")).toBeVisible();

  // Dinarska (50.000,00 din) ulazi normalno u zbir.
  const dinarskaKarta = page.locator('[class*="sporednaKartica"]', {
    hasText: "Dinarski prihodi",
  });
  await expect(dinarskaKarta.getByText("50.000,00 din")).toBeVisible();
  await expect(dinarskaKarta.getByText("1 uplata")).toBeVisible();

  // Ukupan prihod (kalendarska godina) = SAMO dinarska (devizna bez kursa je isključena).
  await expect(page.getByText("50.000,00 din").first()).toBeVisible();
});

test("tabela devizni: '–' u Kurs/U dinarima, red otvara bočni panel (ne fakturu direktno)", async ({
  page,
}) => {
  await expect(
    page.getByRole("button", { name: /^Devizni prihodi/ }),
  ).toBeVisible();
  const red = page.locator("tbody tr", { hasText: "Acme Inc. (E2E)" });
  await expect(red).toBeVisible();
  await expect(red.getByText("1.000,00 €")).toBeVisible();
  await expect(
    red.getByText(fakturaDevizna.broj, { exact: true }),
  ).toBeVisible();

  // Kurs i U dinarima su "–" (rate/amountRsd su null - Korak 9b ih tek popunjava).
  const celije = red.locator("td");
  await expect(celije.nth(4)).toHaveText("–"); // Kurs
  await expect(celije.nth(5)).toHaveText("–"); // U dinarima

  await expect(page.getByText("Ukupno devizni prihodi")).toBeVisible();
  const ukupnoRed = page.locator("tr", { hasText: "Ukupno devizni prihodi" });
  await expect(ukupnoRed.getByText("0,00")).toBeVisible();

  // Klik na red (Korak 9c) OTVARA PANEL, ne fakturu - fakturi se prilazi preko linka "Otvori" u panelu.
  await red.click();
  const panel = page.getByText(/^Prihod \d{2}\.\d{2}\.\d{4}\.$/);
  await expect(panel).toBeVisible();
  await expect(page).toHaveURL(/\/knjiga-prihoda$/);

  await page.getByRole("link", { name: "Otvori", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/fakture/${fakturaDevizna.id}$`));
});

test("panel: zatvara se dugmetom 'Zatvori' i klikom van panela, sadržaj deviznog reda sa kursom", async ({
  page,
}) => {
  await page.getByRole("combobox").first().selectOption("2027");
  await expect(
    page.getByRole("button", { name: /^Devizni prihodi/ }),
  ).toBeVisible();

  const red = page.locator("tbody tr", { hasText: "Acme Inc. (E2E)" });
  await red.click();
  // Skopirano na panel (ne go page.getByText) za tekst koji se poklapa sa tabelom ispod (iznos/Ručno/kurs
  // su ISTI string i u tabeli i u panelu, dok je panel otvoren tabela ostaje u DOM-u ispod senke).
  const panel = page.locator('[class*="panel"]');
  await expect(page.getByText(/^Prihod \d{2}\.\d{2}\.\d{4}\.$/)).toBeVisible();

  // Sadržaj (frejm Kp4): "Uplata od [klijent]" + iznos, Datum uplate/Klijent/Faktura/Izvor, i SAMO za
  // devizni Kurs/Upisano u dinarima + napomena o kursu.
  await expect(page.getByText("Uplata od Acme Inc. (E2E)")).toBeVisible();
  await expect(panel.getByText("1.000,00 €", { exact: true })).toBeVisible();
  await expect(page.getByText("Datum uplate")).toBeVisible();
  await expect(panel.getByText("Ručno", { exact: true })).toBeVisible();
  await expect(panel.getByText("117,20", { exact: true })).toBeVisible();
  await expect(panel.getByText("117.200,00 din", { exact: true })).toBeVisible(); // 1.000,00 € * 117,20
  await expect(
    page.getByText(
      "Kurs je onaj po kom je banka preračunala priliv. Ako se razlikuje od onoga što vidiš u banci, ispravi ga ovde.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Obriši prihod" }),
  ).toBeVisible();

  // Dugme "Zatvori".
  await page.getByRole("button", { name: "Zatvori", exact: true }).last().click();
  await expect(panel).not.toBeVisible();

  // Klik van panela (senka/overlay, van 560px panela desno).
  await red.click();
  await expect(panel).toBeVisible();
  await page.mouse.click(10, 10);
  await expect(panel).not.toBeVisible();
});

test("panel: dinarski red nema Kurs/Upisano u dinarima (nema kursa za dinarski prihod)", async ({
  page,
}) => {
  const red = page.locator("tbody tr", { hasText: "Dinarska Firma (E2E)" });
  await page.getByRole("button", { name: /^Dinarski prihodi/ }).click();
  await red.click();
  await expect(page.getByText(/^Prihod \d{2}\.\d{2}\.\d{4}\.$/)).toBeVisible();
  await expect(page.getByText("Uplata od Dinarska Firma (E2E)")).toBeVisible();
  await expect(page.getByText("Kurs", { exact: true })).not.toBeVisible();
  await expect(page.getByText("Upisano u dinarima")).not.toBeVisible();
});

test("panel 'Ispravi': nevažeći kurs prikazuje grešku ispod polja, ne čuva", async ({
  page,
}) => {
  await page.getByRole("combobox").first().selectOption("2027");
  await expect(
    page.getByRole("button", { name: /^Devizni prihodi/ }),
  ).toBeVisible();
  const red = page.locator("tbody tr", { hasText: "Acme Inc. (E2E)" });
  await red.click();
  await page.getByRole("button", { name: "Ispravi" }).click();

  const kursPolje = page.getByLabel("Kurs", { exact: true });
  await kursPolje.fill("0");
  await page.getByRole("button", { name: "Sačuvaj" }).click();
  await expect(page.getByText("Kurs mora biti broj veći od 0.")).toBeVisible();
  // Panel ostaje u režimu izmene (nije se zatvorio/vratio na pregled).
  await expect(kursPolje).toBeVisible();

  // Prazno polje (input[type=number] ne prima slova poput "abc" - ni pravi korisnik ne bi mogao).
  await kursPolje.fill("");
  await page.getByRole("button", { name: "Sačuvaj" }).click();
  await expect(page.getByText("Kurs mora biti broj veći od 0.")).toBeVisible();
});

test("panel 'Ispravi' (dinarski): samo polje Opis, nema polje za kurs", async ({
  page,
}) => {
  await page.getByRole("button", { name: /^Dinarski prihodi/ }).click();
  const red = page.locator("tbody tr", { hasText: "Dinarska Firma (E2E)" });
  await red.click();
  await page.getByRole("button", { name: "Ispravi" }).click();

  await expect(page.getByLabel("Kurs", { exact: true })).not.toBeVisible();
  const opisPolje = page.getByLabel("Opis", { exact: true });
  await opisPolje.fill("Gotovinska uplata");
  await page.getByRole("button", { name: "Sačuvaj" }).click();

  await expect(page.getByText("Opis", { exact: true })).toBeVisible();
  await expect(page.getByText("Gotovinska uplata")).toBeVisible();
});

test("podtab dinarski, filter Mesec i Klijent, 'Očisti filtere'", async ({
  page,
}) => {
  await page.getByRole("button", { name: /^Dinarski prihodi/ }).click();
  const red = page.locator("tbody tr", { hasText: "Dinarska Firma (E2E)" });
  await expect(red).toBeVisible();
  await expect(
    red.getByText(fakturaDinarska.broj, { exact: true }),
  ).toBeVisible();

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
  await expect(
    page.getByRole("button", { name: /Dinarska Firma \(E2E\)/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Dinarska Firma \(E2E\)/ }).click();
  await expect(red).toBeVisible();
  await expect(page.getByText("Očisti filtere")).toBeVisible();

  await page.getByText("Očisti filtere").click();
  await expect(page.getByText("Očisti filtere")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Svi klijenti" }),
  ).toBeVisible();
});

test("prazno stanje za godinu bez uplata", async ({ page }) => {
  await page.getByRole("combobox").first().selectOption("2024");
  await expect(page.getByText("Još nema prihoda u 2024.")).toBeVisible();
  await expect(
    page.getByText(
      "Čim stigne uplata, upisujem je ovde sam. Možeš i ručno da dodaš prihod koji ja ne vidim, na primer gotovinu.",
    ),
  ).toBeVisible();
  await expect(page.getByText("0,00 din").first()).toBeVisible();
});

test("kolona Faktura se nikad ne skraćuje, čak ni za neuobičajeno dug broj, na 1280/1440/1920/2560px", async ({
  page,
}) => {
  // Regresija: "100/26-12"/"101/26-12" (godina 2025, da ne menja zbirove 2026 provereni gore) su se ranije
  // sekle na "…" na 1440px iako su stale - kolona Faktura je imala fiksnu širinu (108px) deljenu sa Uplata.
  // Ovaj test bi PAO pre ispravke (scrollWidth > clientWidth na bar jednoj od ovih širina).
  await page.getByRole("combobox").first().selectOption("2025");
  const sirine = [1280, 1440, 1920, 2560];

  await expect(
    page.getByRole("button", { name: /^Devizni prihodi/ }),
  ).toBeVisible();
  const celijaDevizni = page
    .locator("tbody tr", { hasText: fakturaDugaDevizna.broj })
    .getByText(fakturaDugaDevizna.broj, {
      exact: true,
    });
  await expect(celijaDevizni).toBeVisible();
  for (const sirina of sirine) {
    await page.setViewportSize({ width: sirina, height: 900 });
    const dimenzije = await celijaDevizni.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(
      dimenzije.scrollWidth,
      `Devizni, ${sirina}px: broj fakture "${fakturaDugaDevizna.broj}" je skraćen (scrollWidth=${dimenzije.scrollWidth}, clientWidth=${dimenzije.clientWidth})`,
    ).toBeLessThanOrEqual(dimenzije.clientWidth + 1);
  }

  await page.getByRole("button", { name: /^Dinarski prihodi/ }).click();
  const celijaDinarski = page
    .locator("tbody tr", { hasText: fakturaDugaDinarska.broj })
    .getByText(fakturaDugaDinarska.broj, { exact: true });
  await expect(celijaDinarski).toBeVisible();
  for (const sirina of sirine) {
    await page.setViewportSize({ width: sirina, height: 900 });
    const dimenzije = await celijaDinarski.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(
      dimenzije.scrollWidth,
      `Dinarski, ${sirina}px: broj fakture "${fakturaDugaDinarska.broj}" je skraćen (scrollWidth=${dimenzije.scrollWidth}, clientWidth=${dimenzije.clientWidth})`,
    ).toBeLessThanOrEqual(dimenzije.clientWidth + 1);
  }
});

test("Korak 9b: devizna uplata SA kursom prikazuje stvarne vrednosti i ulazi u zbir, ona BEZ kursa ostaje '–' i izuzeta", async ({
  page,
}) => {
  await page.getByRole("combobox").first().selectOption("2027");
  await expect(page.getByText("Ukupan prihod u 2027.")).toBeVisible();

  // 1.000,00 € * 117,2 = 117.200,00 din (izracunajIznosRsd) - kartica "Devizni prihodi" sabira OBE uplate
  // (ona SA kursom ulazi, ona BEZ kursa doprinosi 0), ali broji obe kao uplate (2).
  const devizniKarta = page.locator('[class*="sporednaKartica"]', {
    hasText: "Devizni prihodi",
  });
  await expect(devizniKarta.getByText("117.200,00 din")).toBeVisible();
  await expect(devizniKarta.getByText("2 uplate")).toBeVisible();

  // "Ukupan prihod u 2027." (kalendarska godina) = ista vrednost (nema dinarskih uplata u ovoj godini).
  await expect(page.getByText("117.200,00 din").first()).toBeVisible();

  await expect(
    page.getByRole("button", { name: /^Devizni prihodi/ }),
  ).toBeVisible();

  const redSaKursom = page.locator("tbody tr", { hasText: "Acme Inc. (E2E)" });
  await expect(
    redSaKursom.getByText(fakturaSaKursom.broj, { exact: true }),
  ).toBeVisible();
  const celijeSaKursom = redSaKursom.locator("td");
  await expect(celijeSaKursom.nth(4)).toHaveText("117,20"); // Kurs (sr-RS, 2 decimale - frejm Kp1)
  await expect(celijeSaKursom.nth(5)).toHaveText("117.200,00"); // U dinarima (bez oznake valute)

  const redBezKursa = page.locator("tbody tr", {
    hasText: "Dinarska Firma (E2E)",
  });
  await expect(
    redBezKursa.getByText(fakturaBezKursa9b.broj, { exact: true }),
  ).toBeVisible();
  const celijeBezKursa = redBezKursa.locator("td");
  await expect(celijeBezKursa.nth(4)).toHaveText("–");
  await expect(celijeBezKursa.nth(5)).toHaveText("–");

  // Red "Ukupno devizni prihodi" sabira SAMO uplatu sa kursom (500,00 € bez kursa doprinosi 0).
  const ukupnoRed = page.locator("tr", { hasText: "Ukupno devizni prihodi" });
  await expect(ukupnoRed.getByText("117.200,00")).toBeVisible();
});

// NAMERNO POSLE testa iznad ("Korak 9b") - ovaj test TRAJNO upisuje kurs na fakturaBezKursa9b (red koji
// test iznad proverava da MORA ostati "–"), pa mora da se izvrši POSLE te provere (serial mode, redosled
// u fajlu = redosled izvršavanja).
test("panel 'Ispravi': prvi upis kursa - panel, tabela, kartica i limit se osvežavaju", async ({
  page,
}) => {
  await page.getByRole("combobox").first().selectOption("2027");
  await expect(
    page.getByRole("button", { name: /^Devizni prihodi/ }),
  ).toBeVisible();

  // fakturaBezKursa9b (Dinarska Firma, EUR 500,00, bez kursa) - pre izmene: "–" u panelu i tabeli, karta
  // "Devizni prihodi" NE uključuje njen iznos.
  const red = page.locator("tbody tr", { hasText: "Dinarska Firma (E2E)" });
  await expect(red.locator("td").nth(4)).toHaveText("–");
  await red.click();

  const panel = page.locator('[class*="panel"]');
  await expect(panel).toBeVisible();
  await expect(page.getByRole("button", { name: "Ispravi" })).toBeVisible();
  await page.getByRole("button", { name: "Ispravi" }).click();

  const kursPolje = page.getByLabel("Kurs", { exact: true });
  await expect(kursPolje).toHaveValue("");
  await kursPolje.fill("110");
  await page.getByRole("button", { name: "Sačuvaj" }).click();

  // Panel (posle čuvanja, ostaje otvoren u pregledu): 500,00 € * 110 = 55.000,00 din. Skopirano na panel -
  // posle router.refresh() tabela ispod takođe dobija "110,00" (bez "din"), pa bi go page.getByText bio
  // dvosmislen čim se tabela osveži.
  await expect(panel.getByText("110,00", { exact: true })).toBeVisible();
  await expect(page.getByText("55.000,00 din")).toBeVisible();

  // Zatvori panel, proveri tabelu/karticu/limit (router.refresh posle čuvanja).
  await page.getByRole("button", { name: "Zatvori", exact: true }).last().click();
  await expect(panel).not.toBeVisible();
  await expect(red.locator("td").nth(4)).toHaveText("110,00");
  await expect(red.locator("td").nth(5)).toHaveText("55.000,00");

  // Karta "Devizni prihodi": 117.200,00 (fakturaSaKursom) + 55.000,00 (upravo upisano) = 172.200,00 din.
  const devizniKarta = page.locator('[class*="sporednaKartica"]', {
    hasText: "Devizni prihodi",
  });
  await expect(devizniKarta.getByText("172.200,00 din")).toBeVisible();
  await expect(page.getByText("Ukupan prihod u 2027.")).toBeVisible();
  await expect(page.getByText("172.200,00 din").first()).toBeVisible();
});

test("filter Godina menja kartice, dugmad Izvezi/Dodaj prihod ne rade ništa (još)", async ({
  page,
}) => {
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
