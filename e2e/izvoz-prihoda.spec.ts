// Izvoz Knjige prihoda (Korak 9g-1, dijalog Kp6, "Izvezi") - otvaranje/zatvaranje, podrazumevane
// vrednosti, Excel stvarno preuzima fajl (čita se nazad bibliotekom xlsx - kolone/redovi/zbirovi/nazivi
// listova), odvojeno/spojeno, prazan period, PDF je i dalje poruka (Korak 9g-2). Testovi NAMERNO koriste
// godinu 2024 (poznato prazna za Knjigu prihoda - isto kao e2e/obrisi-prihod.spec.ts "klijent bez ijedne
// uplate") - svaki test pravi SVOJE redove i briše ih na kraju TOG ISTOG testa (ne samo afterAll), da
// redosled testova u ovom fajlu nikad ne utiče jedan na drugi.
import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import * as XLSX from "xlsx";
import { e2eDb } from "./db";

test.describe.configure({ mode: "serial" });

const GODINA_PRAZNA = 2024;

function kreirajPrihod(
  datum: string,
  opcije: Record<string, unknown>,
): string {
  const { id } = e2eDb("create-manual-income", { datum, ...opcije });
  return id;
}

function obrisiPrihod(id: string) {
  e2eDb("delete-income", { id });
}

async function otvoriDijalog(page: Page) {
  await page.goto("/knjiga-prihoda");
  await page.getByRole("button", { name: "Izvezi", exact: true }).click();
  await expect(page.getByText("Izvezi knjigu prihoda")).toBeVisible();
}

async function izaberiPeriod(page: Page, godina: number, period: string) {
  await page.getByLabel("Godina", { exact: true }).selectOption(String(godina));
  await page.getByLabel("Period", { exact: true }).selectOption(period);
}

function dugmeIzvezi(page: Page) {
  return page.getByRole("button", { name: "Izvezi", exact: true }).last();
}

test.describe("dijalog - otvaranje/zatvaranje i podrazumevane vrednosti", () => {
  test("podrazumevane vrednosti: tekuća godina stranice, Cela godina, PDF, obe kućice uključene", async ({
    page,
  }) => {
    await page.goto("/knjiga-prihoda");
    const tekucaGodina = new Date().getUTCFullYear();
    await otvoriDijalog(page);

    await expect(page.getByLabel("Godina", { exact: true })).toHaveValue(
      String(tekucaGodina),
    );
    await expect(page.getByLabel("Period", { exact: true })).toHaveValue(
      "cela-godina",
    );
    await expect(
      page.getByRole("checkbox", {
        name: "Devizni i dinarski prihodi u dve odvojene tabele",
      }),
    ).toHaveAttribute("aria-checked", "true");
    await expect(
      page.getByRole("checkbox", { name: "Ukupan zbir na kraju" }),
    ).toHaveAttribute("aria-checked", "true");
  });

  test("'Odustani' zatvara dijalog; sledeće otvaranje opet ima podrazumevane vrednosti", async ({
    page,
  }) => {
    await otvoriDijalog(page);
    await page.getByLabel("Period", { exact: true }).selectOption("q2");
    await page
      .getByRole("checkbox", { name: "Ukupan zbir na kraju" })
      .click();
    await page.getByRole("button", { name: "Odustani", exact: true }).click();
    await expect(page.getByText("Izvezi knjigu prihoda")).not.toBeVisible();

    await otvoriDijalog(page);
    await expect(page.getByLabel("Period", { exact: true })).toHaveValue(
      "cela-godina",
    );
    await expect(
      page.getByRole("checkbox", { name: "Ukupan zbir na kraju" }),
    ).toHaveAttribute("aria-checked", "true");
  });
});

test("Format PDF: prikazuje poruku 'PDF izvoz stiže uskoro.' i ne preuzima ništa (Korak 9g-2)", async ({
  page,
}) => {
  await otvoriDijalog(page);
  await dugmeIzvezi(page).click();
  await expect(page.getByText("PDF izvoz stiže uskoro.")).toBeVisible();
  // Dijalog ostaje otvoren (ne zatvara se posle poruke).
  await expect(dugmeIzvezi(page)).toBeVisible();
});

test("prazan period: poruka 'Nema uplata za izabrani period.', dijalog ostaje otvoren", async ({
  page,
}) => {
  await otvoriDijalog(page);
  await izaberiPeriod(page, GODINA_PRAZNA, "cela-godina");
  await page.getByRole("button", { name: "Excel", exact: true }).click();
  await dugmeIzvezi(page).click();
  await expect(page.getByText("Nema uplata za izabrani period.")).toBeVisible();
  await expect(dugmeIzvezi(page)).toBeVisible();
});

test("Excel, odvojeno (podrazumevano): devizni i dinarski u dva lista, ime fajla po kvartalu, zbir tačan", async ({
  page,
  context,
}) => {
  const devizniId = kreirajPrihod("2024-02-10T00:00:00.000Z", {
    valuta: "EUR",
    iznos: 100_000, // 1.000,00 €
    kurs: 117.2,
    iznosRsd: 11_720_000,
    kind: "devizni",
    opis: "E2E izvoz devizni",
  });
  const dinarskiId = kreirajPrihod("2024-02-15T00:00:00.000Z", {
    valuta: "RSD",
    iznos: 500_000, // 5.000,00 din
    kind: "dinarski",
    opis: "E2E izvoz dinarski",
  });

  try {
    await otvoriDijalog(page);
    await izaberiPeriod(page, GODINA_PRAZNA, "q1");
    await page.getByRole("button", { name: "Excel", exact: true }).click();

    const [preuzimanje] = await Promise.all([
      context.waitForEvent("download"),
      dugmeIzvezi(page).click(),
    ]);
    expect(preuzimanje.suggestedFilename()).toBe(
      "knjiga-prihoda-2024-I-kvartal.xlsx",
    );
    // Uspešan izvoz zatvara dijalog (zadatak).
    await expect(page.getByText("Izvezi knjigu prihoda")).not.toBeVisible();

    const putanja = await preuzimanje.path();
    const knjiga = XLSX.read(readFileSync(putanja!), { type: "buffer" });
    expect(knjiga.SheetNames).toEqual(["Devizni prihodi", "Dinarski prihodi"]);

    const devizniList = XLSX.utils.sheet_to_json<string[]>(
      knjiga.Sheets["Devizni prihodi"],
      { header: 1, raw: false },
    );
    // Zaglavlje (naziv/PIB/"Knjiga prihoda"/period/datum izrade/prazan red/kolone) = 7 redova, pa 1 red
    // podataka + 1 red zbira = 9 redova ukupno.
    expect(devizniList).toHaveLength(9);
    expect(devizniList[7][4]).toBe("E2E izvoz devizni");
    expect(devizniList[8][2]).toBe("Ukupno devizni prihodi");

    const dinarskiList = XLSX.utils.sheet_to_json<string[]>(
      knjiga.Sheets["Dinarski prihodi"],
      { header: 1, raw: false },
    );
    expect(dinarskiList[7][4]).toBe("E2E izvoz dinarski");
    expect(dinarskiList[7][6]).toBe("–"); // Kurs - dinarski red nema kurs.
  } finally {
    obrisiPrihod(devizniId);
    obrisiPrihod(dinarskiId);
  }
});

test("Excel, spojeno (kućica isključena): jedan list 'Prihodi', oba reda, najnoviji prvo", async ({
  page,
  context,
}) => {
  const stariji = kreirajPrihod("2024-05-05T00:00:00.000Z", {
    valuta: "RSD",
    iznos: 100_000,
    kind: "dinarski",
    opis: "E2E spojeno stariji",
  });
  const noviji = kreirajPrihod("2024-05-20T00:00:00.000Z", {
    valuta: "EUR",
    iznos: 50_000,
    kurs: 117,
    iznosRsd: 5_850_000,
    kind: "devizni",
    opis: "E2E spojeno noviji",
  });

  try {
    await otvoriDijalog(page);
    await izaberiPeriod(page, GODINA_PRAZNA, "m05");
    await page.getByRole("button", { name: "Excel", exact: true }).click();
    await page
      .getByRole("checkbox", {
        name: "Devizni i dinarski prihodi u dve odvojene tabele",
      })
      .click();

    const [preuzimanje] = await Promise.all([
      context.waitForEvent("download"),
      dugmeIzvezi(page).click(),
    ]);
    expect(preuzimanje.suggestedFilename()).toBe(
      "knjiga-prihoda-2024-05.xlsx",
    );

    const putanja = await preuzimanje.path();
    const knjiga = XLSX.read(readFileSync(putanja!), { type: "buffer" });
    expect(knjiga.SheetNames).toEqual(["Prihodi"]);

    const list = XLSX.utils.sheet_to_json<string[]>(knjiga.Sheets["Prihodi"], {
      header: 1,
      raw: false,
    });
    expect(list[7][4]).toBe("E2E spojeno noviji"); // najnoviji prvo
    expect(list[8][4]).toBe("E2E spojeno stariji");
    expect(list[9][2]).toBe("Ukupno prihodi");
  } finally {
    obrisiPrihod(stariji);
    obrisiPrihod(noviji);
  }
});

test("Excel, bez zbira (kućica 'Ukupan zbir' isključena): nema reda sa zbirom", async ({
  page,
  context,
}) => {
  const id = kreirajPrihod("2024-08-01T00:00:00.000Z", {
    valuta: "RSD",
    iznos: 10_000,
    kind: "dinarski",
    opis: "E2E bez zbira",
  });

  try {
    await otvoriDijalog(page);
    await izaberiPeriod(page, GODINA_PRAZNA, "m08");
    await page.getByRole("button", { name: "Excel", exact: true }).click();
    await page
      .getByRole("checkbox", { name: "Ukupan zbir na kraju" })
      .click();

    const [preuzimanje] = await Promise.all([
      context.waitForEvent("download"),
      dugmeIzvezi(page).click(),
    ]);

    const putanja = await preuzimanje.path();
    const knjiga = XLSX.read(readFileSync(putanja!), { type: "buffer" });
    // "Odvojeno" je i dalje podrazumevano uključeno - prihod je dinarski, pa je samo list "Dinarski
    // prihodi" neprazan (zaglavlje 7 + 1 red podataka = 8, BEZ reda zbira).
    const list = XLSX.utils.sheet_to_json(knjiga.Sheets["Dinarski prihodi"], {
      header: 1,
    });
    expect(list).toHaveLength(8);
  } finally {
    obrisiPrihod(id);
  }
});
