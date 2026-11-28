// Izvoz Knjige prihoda (Korak 9g-1/9g-2, dijalog Kp6, "Izvezi") - otvaranje/zatvaranje, podrazumevane
// vrednosti, Excel i PDF OBA stvarno preuzimaju fajl (Excel se čita nazad bibliotekom xlsx - kolone/
// redovi/zbirovi/nazivi listova; PDF se čita nazad bibliotekom pdfjs-dist - broj strana, tekst po strani,
// "Strana X od Y" - videti napomenu o toj biblioteci niže), odvojeno/spojeno, prazan period. Testovi
// NAMERNO koriste godinu 2024 (poznato prazna za Knjigu prihoda - isto kao e2e/obrisi-prihod.spec.ts
// "klijent bez ijedne uplate") - svaki test pravi SVOJE redove i briše ih na kraju TOG ISTOG testa (ne
// samo afterAll), da redosled testova u ovom fajlu nikad ne utiče jedan na drugi.
//
// pdfjs-dist (Korak 9g-2, nova dev-zavisnost): projekat pre ovoga nije imao NIJEDNU biblioteku koja čita
// PDF (puppeteer-core samo PRAVI PDF, ne čita ga nazad) - provereno pre dodavanja (package.json, zadatak).
// Koristi se SAMO ovde (test), nikad u src/ - broj strana i tekst po strani (zaglavlje kolona koje se
// ponavlja, "Strana X od Y") ne mogu pouzdano da se provere bez pravog PDF parsera. Vizuelni deo (slika
// prve/poslednje strane) umesto toga koristi već postojeći puppeteer-core - headless Chrome otvori
// generisani PDF fajl (file://) u svom UGRAĐENOM PDF prikazivaču i taj se snimi (isti princip kao svaki
// drugi screenshot u ovom paketu), bez ikakve nove biblioteke za taj deo.
import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import puppeteer from "puppeteer-core";
import * as XLSX from "xlsx";
import { e2eDb } from "./db";

const CHROME_PUTANJA =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function ucitajPdf(putanja: string) {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(readFileSync(putanja));
  return pdfjsLib.getDocument({ data }).promise;
}

async function tekstStrane(
  dokument: Awaited<ReturnType<typeof ucitajPdf>>,
  broj: number,
): Promise<string> {
  const strana = await dokument.getPage(broj);
  const sadrzaj = await strana.getTextContent();
  return sadrzaj.items
    .map((stavka) => ("str" in stavka ? stavka.str : ""))
    .join(" ");
}

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

test.describe("PDF (Korak 9g-2)", () => {
  test("preuzimanje: %PDF potpis, Content-Type, ime fajla po periodu", async ({
    page,
    context,
  }) => {
    const id = kreirajPrihod("2024-03-10T00:00:00.000Z", {
      valuta: "RSD",
      iznos: 10_000,
      kind: "dinarski",
      opis: "E2E pdf potpis",
    });
    try {
      await otvoriDijalog(page);
      await izaberiPeriod(page, GODINA_PRAZNA, "q1");
      // Format je već PDF po podrazumevanoj vrednosti - nema klik na segment.

      const [preuzimanje] = await Promise.all([
        context.waitForEvent("download"),
        dugmeIzvezi(page).click(),
      ]);
      expect(preuzimanje.suggestedFilename()).toBe(
        "knjiga-prihoda-2024-I-kvartal.pdf",
      );
      await expect(page.getByText("Izvezi knjigu prihoda")).not.toBeVisible();

      const putanja = await preuzimanje.path();
      const bajtovi = readFileSync(putanja!);
      expect(bajtovi.subarray(0, 5).toString("latin1")).toBe("%PDF-");

      const odgovor = await page.request.fetch(
        `/knjiga-prihoda/izvoz?godina=2024&period=q1&format=pdf&odvojeno=1&zbir=1`,
      );
      expect(odgovor.headers()["content-type"]).toBe("application/pdf");
    } finally {
      obrisiPrihod(id);
    }
  });

  test("prazan period (PDF): poruka 'Nema uplata za izabrani period.', dijalog ostaje otvoren", async ({
    page,
  }) => {
    await otvoriDijalog(page);
    await izaberiPeriod(page, GODINA_PRAZNA, "m12");
    // Format je već PDF po podrazumevanoj vrednosti.
    await dugmeIzvezi(page).click();
    await expect(page.getByText("Nema uplata za izabrani period.")).toBeVisible();
    await expect(dugmeIzvezi(page)).toBeVisible();
  });

  test("mnogo redova (85 uplata): više strana, zaglavlje kolona se ponavlja, 'Strana X od Y' je tačno", async ({
    page,
    context,
  }) => {
    const PREFIKS = "E2E-IZVOZ-PDF-MNOGO-";
    const redovi = Array.from({ length: 85 }, (_, i) => ({
      datum: `2024-06-${String((i % 28) + 1).padStart(2, "0")}T00:00:00.000Z`,
      valuta: "RSD",
      iznos: 10_000 + i,
      kind: "dinarski",
      opis: `${PREFIKS}${i}`,
    }));
    e2eDb("create-manual-incomes-bulk", { redovi });

    try {
      await otvoriDijalog(page);
      await izaberiPeriod(page, GODINA_PRAZNA, "m06");

      const [preuzimanje] = await Promise.all([
        context.waitForEvent("download"),
        dugmeIzvezi(page).click(),
      ]);
      const putanja = await preuzimanje.path();
      const dokument = await ucitajPdf(putanja!);

      expect(dokument.numPages).toBeGreaterThan(1);

      const tekstPrve = await tekstStrane(dokument, 1);
      expect(tekstPrve).toContain("Redni broj");
      expect(tekstPrve).toContain(`Strana 1 od ${dokument.numPages}`);

      const tekstDruge = await tekstStrane(dokument, 2);
      // Zaglavlje kolona se PONAVLJA na svakoj novoj strani (zadatak) - ne samo na prvoj.
      expect(tekstDruge).toContain("Redni broj");
      expect(tekstDruge).toContain(`Strana 2 od ${dokument.numPages}`);

      const tekstPoslednje = await tekstStrane(dokument, dokument.numPages);
      expect(tekstPoslednje).toContain(
        `Strana ${dokument.numPages} od ${dokument.numPages}`,
      );
      // Potpisno polje je na kraju, uz poslednji deo tabele (zadatak).
      expect(tekstPoslednje).toContain("Mesto i datum");
      expect(tekstPoslednje).toContain("Potpis");
    } finally {
      e2eDb("delete-manual-incomes-sa-opisom", { prefiks: PREFIKS });
    }
  });

  test("odvojeno (podrazumevano): naslovi obe tabele, zbir svake tabele", async ({
    page,
    context,
  }) => {
    const devizniId = kreirajPrihod("2024-02-10T00:00:00.000Z", {
      valuta: "EUR",
      iznos: 100_000,
      kurs: 117.2,
      iznosRsd: 11_720_000,
      kind: "devizni",
      opis: "E2E pdf odvojeno devizni",
    });
    const dinarskiId = kreirajPrihod("2024-02-15T00:00:00.000Z", {
      valuta: "RSD",
      iznos: 500_000,
      kind: "dinarski",
      opis: "E2E pdf odvojeno dinarski",
    });

    try {
      await otvoriDijalog(page);
      await izaberiPeriod(page, GODINA_PRAZNA, "q1");

      const [preuzimanje] = await Promise.all([
        context.waitForEvent("download"),
        dugmeIzvezi(page).click(),
      ]);
      const putanja = await preuzimanje.path();
      const dokument = await ucitajPdf(putanja!);
      const tekst = await tekstStrane(dokument, 1);

      expect(tekst).toContain("Devizni prihodi");
      expect(tekst).toContain("Dinarski prihodi");
      expect(tekst.indexOf("Devizni prihodi")).toBeLessThan(
        tekst.indexOf("Dinarski prihodi"),
      );
      expect(tekst).toContain("Ukupno devizni prihodi");
      expect(tekst).toContain("Ukupno dinarski prihodi");
    } finally {
      obrisiPrihod(devizniId);
      obrisiPrihod(dinarskiId);
    }
  });

  test("spojeno (kućica isključena): jedan naslov 'Prihodi', bez zbira kad je ta kućica isključena", async ({
    page,
    context,
  }) => {
    const id = kreirajPrihod("2024-09-05T00:00:00.000Z", {
      valuta: "RSD",
      iznos: 50_000,
      kind: "dinarski",
      opis: "E2E pdf spojeno bez zbira",
    });

    try {
      await otvoriDijalog(page);
      await izaberiPeriod(page, GODINA_PRAZNA, "m09");
      await page
        .getByRole("checkbox", {
          name: "Devizni i dinarski prihodi u dve odvojene tabele",
        })
        .click();
      await page
        .getByRole("checkbox", { name: "Ukupan zbir na kraju" })
        .click();

      const [preuzimanje] = await Promise.all([
        context.waitForEvent("download"),
        dugmeIzvezi(page).click(),
      ]);
      const putanja = await preuzimanje.path();
      const dokument = await ucitajPdf(putanja!);
      const tekst = await tekstStrane(dokument, 1);

      expect(tekst).toContain("Prihodi");
      expect(tekst).not.toContain("Devizni prihodi");
      expect(tekst).not.toContain("Dinarski prihodi");
      expect(tekst).not.toContain("Ukupno");
    } finally {
      obrisiPrihod(id);
    }
  });

  test("vizuelna provera: prva i poslednja strana (preklapanje/tekst/potpis - ručni pregled slika)", async ({
    page,
    context,
  }, testInfo) => {
    const PREFIKS = "E2E-IZVOZ-PDF-VIZUELNO-";
    const redovi = Array.from({ length: 45 }, (_, i) => ({
      datum: `2024-10-${String((i % 28) + 1).padStart(2, "0")}T00:00:00.000Z`,
      valuta: i % 2 === 0 ? "EUR" : "RSD",
      iznos: 100_000 + i * 137,
      kurs: i % 2 === 0 ? 117.2 : undefined,
      iznosRsd: i % 2 === 0 ? (100_000 + i * 137) * 117 : 100_000 + i * 137,
      kind: i % 2 === 0 ? "devizni" : "dinarski",
      opis: `${PREFIKS}opis koji je dovoljno dug da proveri prelom teksta u dva reda ${i}`,
    }));
    e2eDb("create-manual-incomes-bulk", { redovi });

    try {
      await otvoriDijalog(page);
      await izaberiPeriod(page, GODINA_PRAZNA, "m10");

      const [preuzimanje] = await Promise.all([
        context.waitForEvent("download"),
        dugmeIzvezi(page).click(),
      ]);
      const putanja = await preuzimanje.path();
      const dokument = await ucitajPdf(putanja!);

      const browser = await puppeteer.launch({
        executablePath: CHROME_PUTANJA,
        headless: true,
      });
      try {
        const pregledac = await browser.newPage();
        await pregledac.setViewport({ width: 1400, height: 1000 });
        await pregledac.goto(`file://${putanja}`, {
          waitUntil: "networkidle0",
          timeout: 15000,
        });
        await pregledac.waitForSelector("embed", { timeout: 10000 }).catch(() => {});
        const prvaStrana = Buffer.from(await pregledac.screenshot());
        await testInfo.attach("pdf-prva-strana", {
          body: prvaStrana,
          contentType: "image/png",
        });

        // Klik na sličicu POSLEDNJE strane u levom panelu prikazivača - thumbnail-i su raspoređeni
        // vertikalno na fiksnoj poziciji po strani (isti princip kao ostatak paketa: najjednostavnije
        // pouzdano rešenje, bez pretpostavki o internom DOM-u Chrome-ovog ugrađenog prikazivača).
        const visinaMinijature = 148;
        await pregledac.mouse.click(
          149,
          130 + (dokument.numPages - 1) * visinaMinijature,
        );
        await new Promise((r) => setTimeout(r, 800));
        const poslednjaStrana = Buffer.from(await pregledac.screenshot());
        await testInfo.attach("pdf-poslednja-strana", {
          body: poslednjaStrana,
          contentType: "image/png",
        });
      } finally {
        await browser.close();
      }
    } finally {
      e2eDb("delete-manual-incomes-sa-opisom", { prefiks: PREFIKS });
    }
  });
});
