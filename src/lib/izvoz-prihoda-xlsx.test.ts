// Excel izvoz (Korak 9g-1) - generisani bafer se čita NAZAD istom bibliotekom (xlsx) i provere idu na
// stvarno upisane kolone/vrednosti/formate, ne samo da fajl "postoji".
import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { napraviIzvozExcel } from "./izvoz-prihoda-xlsx";
import { napraviTabeleIzvoza, type PeriodIzvoza } from "./izvoz-prihoda";
import type { PrihodRed } from "./prihodi";

function red(delimicno: Partial<PrihodRed> = {}): PrihodRed {
  return {
    id: "r1",
    datumIso: "2026-11-15T00:00:00.000Z",
    valuta: "EUR",
    vrsta: "devizni",
    iznos: 120000,
    kurs: 117.2,
    iznosRsd: 14_064_000,
    izvor: "rucno",
    fakturaId: "f1",
    brojFakture: "1/26-6",
    klijentId: "k1",
    klijentIme: "Acme Inc.",
    opis: "Usluge dizajna",
    fakturaPrelazak: null,
    ...delimicno,
  };
}

const GODINA: PeriodIzvoza = { tip: "godina" };
const FIRMA = { naziv: "Stephortless", pib: "123456789" };
const DANAS = new Date("2026-11-20T00:00:00.000Z");

function ucitajList(bafer: Buffer, naziv: string) {
  const knjiga = XLSX.read(bafer, { type: "buffer", cellNF: true });
  const list = knjiga.Sheets[naziv];
  if (!list) throw new Error(`List '${naziv}' ne postoji.`);
  return list;
}

function red0(list: XLSX.WorkSheet, broj: number) {
  return XLSX.utils.sheet_to_json<string[]>(list, { header: 1, raw: false })[
    broj
  ] as unknown as string[];
}

describe("napraviIzvozExcel", () => {
  it("odvojeno: dva lista sa tačnim nazivima", () => {
    const tabele = napraviTabeleIzvoza(
      [red({ id: "d1" }), red({ id: "din1", vrsta: "dinarski", valuta: "RSD", kurs: null })],
      true,
      true,
    );
    const bafer = napraviIzvozExcel(tabele, FIRMA, 2026, GODINA, DANAS);
    const knjiga = XLSX.read(bafer, { type: "buffer" });
    expect(knjiga.SheetNames).toEqual(["Devizni prihodi", "Dinarski prihodi"]);
  });

  it("spojeno: jedan list 'Prihodi'", () => {
    const tabele = napraviTabeleIzvoza([red()], false, false);
    const bafer = napraviIzvozExcel(tabele, FIRMA, 2026, GODINA, DANAS);
    const knjiga = XLSX.read(bafer, { type: "buffer" });
    expect(knjiga.SheetNames).toEqual(["Prihodi"]);
  });

  it("zaglavlje: naziv firme, PIB, 'Knjiga prihoda', period, datum izrade", () => {
    const tabele = napraviTabeleIzvoza([red()], false, false);
    const bafer = napraviIzvozExcel(
      tabele,
      FIRMA,
      2026,
      { tip: "kvartal", kvartal: 2 },
      DANAS,
    );
    const list = ucitajList(bafer, "Prihodi");
    expect(red0(list, 0)).toEqual(["Stephortless"]);
    expect(red0(list, 1)).toEqual(["PIB: 123456789"]);
    expect(red0(list, 2)).toEqual(["Knjiga prihoda"]);
    expect(red0(list, 3)).toEqual(["2026, II kvartal"]);
    expect(red0(list, 4)).toEqual(["Datum izrade: 20.11.2026."]);
  });

  it("izostavlja red za PIB kad firma nema PIB", () => {
    const tabele = napraviTabeleIzvoza([red()], false, false);
    const bafer = napraviIzvozExcel(
      tabele,
      { naziv: "Stephortless", pib: "" },
      2026,
      GODINA,
      DANAS,
    );
    const list = ucitajList(bafer, "Prihodi");
    expect(red0(list, 1)).toEqual(["Knjiga prihoda"]);
  });

  it("kolone zaglavlja tabele i podaci reda (devizni, sa kursom)", () => {
    const tabele = napraviTabeleIzvoza([red()], false, false);
    const bafer = napraviIzvozExcel(tabele, FIRMA, 2026, GODINA, DANAS);
    const list = ucitajList(bafer, "Prihodi");

    expect(red0(list, 6)).toEqual([
      "Redni broj",
      "Datum uplate",
      "Klijent",
      "Faktura",
      "Opis",
      "Iznos",
      "Kurs",
      "U dinarima",
      "Izvor",
    ]);
    const podaci = red0(list, 7);
    expect(podaci[0]).toBe("1");
    expect(podaci[2]).toBe("Acme Inc.");
    expect(podaci[3]).toBe("1/26-6");
    expect(podaci[4]).toBe("Usluge dizajna");
    expect(podaci[8]).toBe("Ručno");

    // Prave Excel vrednosti (ne tekst), format dd.mm.yyyy i broj sa 2 decimale + simbol valute.
    const knjiga = XLSX.read(bafer, { type: "buffer", cellNF: true });
    const sirovi = knjiga.Sheets["Prihodi"];
    const celDatum = sirovi[XLSX.utils.encode_cell({ r: 7, c: 1 })];
    expect(celDatum.t).toBe("n");
    expect(XLSX.utils.format_cell(celDatum)).toBe("15.11.2026");
    const celIznos = sirovi[XLSX.utils.encode_cell({ r: 7, c: 5 })];
    expect(celIznos.t).toBe("n");
    expect(celIznos.v).toBe(1200);
    expect(XLSX.utils.format_cell(celIznos)).toContain("€");
    const celKurs = sirovi[XLSX.utils.encode_cell({ r: 7, c: 6 })];
    expect(celKurs.v).toBe(117.2);
    const celRsd = sirovi[XLSX.utils.encode_cell({ r: 7, c: 7 })];
    expect(celRsd.v).toBe(140_640);
  });

  it("dinarski red bez kursa: Kurs je '–', Iznos i U dinarima su isti broj", () => {
    const dinarski = red({
      vrsta: "dinarski",
      valuta: "RSD",
      kurs: null,
      iznos: 500_000,
      iznosRsd: 500_000,
    });
    const tabele = napraviTabeleIzvoza([dinarski], false, false);
    const bafer = napraviIzvozExcel(tabele, FIRMA, 2026, GODINA, DANAS);
    const list = ucitajList(bafer, "Prihodi");
    const podaci = red0(list, 7);
    expect(podaci[6]).toBe("–");

    const knjiga = XLSX.read(bafer, { type: "buffer", cellNF: true });
    const sirovi = knjiga.Sheets["Prihodi"];
    expect(sirovi[XLSX.utils.encode_cell({ r: 7, c: 5 })].v).toBe(5000);
    expect(sirovi[XLSX.utils.encode_cell({ r: 7, c: 7 })].v).toBe(5000);
  });

  it("devizni red BEZ upisanog kursa (iznosRsd null): Kurs i U dinarima su '–'", () => {
    const bezKursa = red({ kurs: null, iznosRsd: null });
    const tabele = napraviTabeleIzvoza([bezKursa], false, false);
    const bafer = napraviIzvozExcel(tabele, FIRMA, 2026, GODINA, DANAS);
    const list = ucitajList(bafer, "Prihodi");
    const podaci = red0(list, 7);
    expect(podaci[6]).toBe("–");
    expect(podaci[7]).toBe("–");
  });

  it("red bez klijenta/fakture/opisa: 'Nije poznat'/'–'/'–'", () => {
    const bezPodataka = red({ klijentIme: null, brojFakture: null, opis: null });
    const tabele = napraviTabeleIzvoza([bezPodataka], false, false);
    const bafer = napraviIzvozExcel(tabele, FIRMA, 2026, GODINA, DANAS);
    const list = ucitajList(bafer, "Prihodi");
    const podaci = red0(list, 7);
    expect(podaci[2]).toBe("Nije poznat");
    expect(podaci[3]).toBe("–");
    expect(podaci[4]).toBe("–");
  });

  it("red zbira: labela i ukupan iznos u koloni 'U dinarima'", () => {
    const tabele = napraviTabeleIzvoza(
      [red({ id: "a", iznosRsd: 1000_00 }), red({ id: "b", iznosRsd: 2000_00 })],
      false,
      true,
    );
    const bafer = napraviIzvozExcel(tabele, FIRMA, 2026, GODINA, DANAS);
    const list = ucitajList(bafer, "Prihodi");
    // Zaglavlje (7 redova) + 2 reda podataka = zbir na indeksu 9.
    const zbirRed = red0(list, 9);
    expect(zbirRed[2]).toBe("Ukupno prihodi");

    const knjiga = XLSX.read(bafer, { type: "buffer", cellNF: true });
    const sirovi = knjiga.Sheets["Prihodi"];
    const celZbir = sirovi[XLSX.utils.encode_cell({ r: 9, c: 7 })];
    expect(celZbir.v).toBe(3000);
  });

  it("bez zbira (zbir isključen): nema dodatnog reda posle podataka", () => {
    const tabele = napraviTabeleIzvoza([red()], false, false);
    const bafer = napraviIzvozExcel(tabele, FIRMA, 2026, GODINA, DANAS);
    const list = ucitajList(bafer, "Prihodi");
    const sveRedovi = XLSX.utils.sheet_to_json(list, { header: 1 });
    // Zaglavlje (7) + 1 red podataka = tačno 8 redova, bez reda zbira.
    expect(sveRedovi).toHaveLength(8);
  });
});
