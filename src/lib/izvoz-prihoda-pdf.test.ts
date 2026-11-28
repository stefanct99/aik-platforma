// PDF izvoz (Korak 9g-2) - čista funkcija koja gradi HTML, bez puppeteer-a (taj deo je E2E, vidi
// e2e/izvoz-prihoda.spec.ts). Provere su na nivou stringa (indexOf/includes) - isti nivo jednostavnosti
// kao ostatak projekta (nema DOM/HTML-parsing biblioteke, nije bila potrebna za ove provere).
import { describe, it, expect } from "vitest";
import { napraviIzvozHtml } from "./izvoz-prihoda-pdf";
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

describe("napraviIzvozHtml", () => {
  it("zaglavlje: naziv firme, PIB, 'Knjiga prihoda', period, datum izrade", () => {
    const tabele = napraviTabeleIzvoza([red()], false, false);
    const html = napraviIzvozHtml(
      tabele,
      FIRMA,
      2026,
      { tip: "kvartal", kvartal: 2 },
      DANAS,
    );
    expect(html).toContain("Stephortless");
    expect(html).toContain("PIB: 123456789");
    expect(html).toContain("Knjiga prihoda");
    expect(html).toContain("2026, II kvartal");
    expect(html).toContain("Datum izrade: 20.11.2026.");
  });

  it("izostavlja red za PIB kad firma nema PIB", () => {
    const tabele = napraviTabeleIzvoza([red()], false, false);
    const html = napraviIzvozHtml(
      tabele,
      { naziv: "Stephortless", pib: "" },
      2026,
      GODINA,
      DANAS,
    );
    expect(html).not.toContain("PIB:");
  });

  it("nigde ne tvrdi da je ovo zvanična KPO knjiga", () => {
    const tabele = napraviTabeleIzvoza([red()], false, false);
    const html = napraviIzvozHtml(tabele, FIRMA, 2026, GODINA, DANAS);
    expect(html.toLowerCase()).not.toContain("kpo");
    expect(html.toLowerCase()).not.toContain("zvanič");
  });

  it("redosled kolona: Redni broj, Datum uplate, Klijent, Faktura, Opis, Iznos, Kurs, U dinarima, Izvor", () => {
    const tabele = napraviTabeleIzvoza([red()], false, false);
    const html = napraviIzvozHtml(tabele, FIRMA, 2026, GODINA, DANAS);
    const kolone = [
      "Redni broj",
      "Datum uplate",
      "Klijent",
      "Faktura",
      "Opis",
      "Iznos",
      "Kurs",
      "U dinarima",
      "Izvor",
    ];
    const pozicije = kolone.map((k) => html.indexOf(`>${k}<`));
    expect(pozicije.every((p) => p >= 0)).toBe(true);
    for (let i = 1; i < pozicije.length; i++) {
      expect(pozicije[i]).toBeGreaterThan(pozicije[i - 1]);
    }
  });

  it("odvojeno: dva naslova tabela, svaki sa sopstvenim zaglavljem kolona", () => {
    const tabele = napraviTabeleIzvoza(
      [
        red({ id: "d1", vrsta: "devizni" }),
        red({ id: "din1", vrsta: "dinarski", valuta: "RSD", kurs: null }),
      ],
      true,
      false,
    );
    const html = napraviIzvozHtml(tabele, FIRMA, 2026, GODINA, DANAS);
    expect(html).toContain(">Devizni prihodi<");
    expect(html).toContain(">Dinarski prihodi<");
    // Zaglavlje kolona se javlja dvaput (po jednom u svakoj tabeli).
    expect(html.match(/>Redni broj</g)).toHaveLength(2);
  });

  it("spojeno: jedan naslov 'Prihodi', oba reda u istoj tabeli", () => {
    const tabele = napraviTabeleIzvoza(
      [red({ id: "d1" }), red({ id: "din1", vrsta: "dinarski", valuta: "RSD", kurs: null })],
      false,
      false,
    );
    const html = napraviIzvozHtml(tabele, FIRMA, 2026, GODINA, DANAS);
    expect(html).toContain(">Prihodi<");
    expect(html).not.toContain("Devizni prihodi");
    expect(html.match(/>Redni broj</g)).toHaveLength(1);
  });

  it("dinarski red bez kursa: Kurs je '–'", () => {
    const dinarski = red({
      vrsta: "dinarski",
      valuta: "RSD",
      kurs: null,
      iznos: 500_000,
      iznosRsd: 500_000,
    });
    const tabele = napraviTabeleIzvoza([dinarski], false, false);
    const html = napraviIzvozHtml(tabele, FIRMA, 2026, GODINA, DANAS);
    expect(html).toContain("<td class=\"nowrap desno\">–</td>");
  });

  it("red zbira: labela i ukupan iznos, posle poslednjeg reda podataka", () => {
    const tabele = napraviTabeleIzvoza(
      [red({ id: "a", iznosRsd: 100_000 }), red({ id: "b", iznosRsd: 200_000 })],
      false,
      true,
    );
    const html = napraviIzvozHtml(tabele, FIRMA, 2026, GODINA, DANAS);
    expect(html).toContain("Ukupno prihodi");
    // Zbir ide POSLE oba reda podataka (poslednji id u redosledu je "a", najnoviji prvo - oba imaju isti
    // datum pa redosled prati ulazni niz) - provera da se "Ukupno" pojavljuje POSLE "Acme Inc." (zadnji
    // red u markup-u).
    expect(html.indexOf("Ukupno prihodi")).toBeGreaterThan(
      html.lastIndexOf("Acme Inc."),
    );
    // 1.000,00 + 2.000,00 = 3.000,00
    expect(html).toContain("3.000,00");
  });

  it("bez zbira (zbir isključen): nema reda 'Ukupno'", () => {
    const tabele = napraviTabeleIzvoza([red()], false, false);
    const html = napraviIzvozHtml(tabele, FIRMA, 2026, GODINA, DANAS);
    expect(html).not.toContain("Ukupno");
  });

  it("potpisno polje: 'Mesto i datum' i 'Potpis' na kraju dokumenta", () => {
    const tabele = napraviTabeleIzvoza([red()], false, false);
    const html = napraviIzvozHtml(tabele, FIRMA, 2026, GODINA, DANAS);
    expect(html).toContain("Mesto i datum");
    expect(html).toContain("Potpis");
    expect(html.indexOf("Mesto i datum")).toBeGreaterThan(html.indexOf("Acme Inc."));
  });
});
