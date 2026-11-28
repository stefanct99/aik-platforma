// Rokovi za porez (Korak 10a) - prenos svih 12 testova iz referenca/prototip/js/rules/taxDeadlines.
// test.js (isti slučajevi, iste očekivane vrednosti, samo u vitest/TypeScript - videti porez-rokovi.ts
// za objašnjenje preimenovanja funkcija), plus novi testovi za funkcije prenete iz selectors.js (koje u
// prototipu nisu imale sopstveni test fajl).
import { describe, it, expect } from "vitest";
import {
  brojPlacenih,
  jeMesecPlacen,
  jePraznik,
  jeVikend,
  nazivMesecaUsluge,
  pravoslavniUskrs,
  rokPoreza,
  sledeciMeseciZaPlacanje,
  sledeciRadniDan,
  ukupnoMesecno,
} from "./porez-rokovi";

describe("pravoslavniUskrs (orthodoxEaster)", () => {
  it("2026, 2027, 2028 (nezavisno proverene vrednosti)", () => {
    const e26 = pravoslavniUskrs(2026);
    expect(e26.getFullYear()).toBe(2026);
    expect(e26.getMonth()).toBe(3);
    expect(e26.getDate()).toBe(12);

    const e27 = pravoslavniUskrs(2027);
    expect(e27.getFullYear()).toBe(2027);
    expect(e27.getMonth()).toBe(4);
    expect(e27.getDate()).toBe(2);

    const e28 = pravoslavniUskrs(2028);
    expect(e28.getFullYear()).toBe(2028);
    expect(e28.getMonth()).toBe(3);
    expect(e28.getDate()).toBe(16);
  });
});

describe("jePraznik (isHoliday)", () => {
  it("Vaskršnji praznici (Veliki petak do 2. dana Vaskrsa) za 2027 i 2028, ne samo 2026", () => {
    // 2027: Uskrs 2. maj (nedelja) -> Veliki petak 30. april, Vaskršnji ponedeljak 3. maj
    expect(jePraznik(new Date(2027, 3, 30))).toBe(true); // Veliki petak
    expect(jePraznik(new Date(2027, 4, 3))).toBe(true); // 2. dan Vaskrsa
    // [PROVERITI 3] nadoknada po pojedinačnom datumu - videti napomenu u porez-rokovi.ts.
    expect(jePraznik(new Date(2027, 4, 4))).toBe(true);
    // 2028: Uskrs 16. april -> Veliki petak 14. april, ponedeljak 17. april
    expect(jePraznik(new Date(2028, 3, 14))).toBe(true);
    expect(jePraznik(new Date(2028, 3, 17))).toBe(true);
  });

  it("fiksni praznici rade za bilo koju godinu (Nova godina, Božić, Sretenje, Praznik rada, Dan primirja)", () => {
    for (const y of [2026, 2027, 2028]) {
      expect(jePraznik(new Date(y, 0, 1))).toBe(true);
      expect(jePraznik(new Date(y, 0, 2))).toBe(true);
      expect(jePraznik(new Date(y, 0, 7))).toBe(true);
      expect(jePraznik(new Date(y, 1, 15))).toBe(true);
      expect(jePraznik(new Date(y, 1, 16))).toBe(true);
      expect(jePraznik(new Date(y, 4, 1))).toBe(true);
      expect(jePraznik(new Date(y, 4, 2))).toBe(true);
      expect(jePraznik(new Date(y, 10, 11))).toBe(true);
    }
  });

  it("Dan pobede (9. maj) NIJE neradni dan - zakon ga izričito izuzima (čl. 3)", () => {
    expect(jePraznik(new Date(2026, 4, 9))).toBe(false);
  });

  it("'radni praznici' (čl. 5: Sveti Sava, Vidovdan, ...) NISU neradni dani", () => {
    expect(jePraznik(new Date(2026, 0, 27))).toBe(false); // Sveti Sava
    expect(jePraznik(new Date(2026, 5, 28))).toBe(false); // Vidovdan
  });

  it("čl. 3a (nadoknada kad praznik padne u nedelju): 2026, Sretenje (15. februar) je nedelja -> 17. februar je dodatni neradni dan jer je 16. VEĆ praznik", () => {
    expect(new Date(2026, 1, 15).getDay()).toBe(0); // kontrola: zaista nedelja
    expect(jePraznik(new Date(2026, 1, 17))).toBe(true);
    expect(jePraznik(new Date(2026, 1, 18))).toBe(false);
  });

  it("čl. 3a: 2026, Uskrs (12. april) je nedelja -> 14. april je dodatni neradni dan jer je 13. VEĆ praznik", () => {
    expect(new Date(2026, 3, 12).getDay()).toBe(0); // kontrola: zaista nedelja (Uskrs)
    expect(jePraznik(new Date(2026, 3, 14))).toBe(true);
    expect(jePraznik(new Date(2026, 3, 15))).toBe(false);
  });

  it("[PROVERITI 2] subota: nema nadoknade - 2026, drugi dan Praznika rada (2. maj) je subota, 4. maj NIJE neradan", () => {
    expect(new Date(2026, 4, 2).getDay()).toBe(6); // kontrola: zaista subota
    expect(jePraznik(new Date(2026, 4, 4))).toBe(false);
  });
});

describe("rokPoreza (taxDueDate)", () => {
  it("novembar 2026 - 15. pada u nedelju, pomera se na ponedeljak 16.11.", () => {
    const d = rokPoreza("2026-11");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(10);
    expect(d.getDate()).toBe(16);
  });

  it("kad 15. padne na dan koji je i vikend i praznik u nizu, nijedan preskočeni dan nije radni", () => {
    const d = rokPoreza("2026-02");
    expect(jeVikend(d)).toBe(false);
    expect(jePraznik(d)).toBe(false);
    let x = new Date(2026, 1, 15);
    while (x.getTime() < d.getTime()) {
      expect(jeVikend(x) || jePraznik(x)).toBe(true);
      x = new Date(x.getTime() + 86_400_000);
    }
  });

  it("radi i za 2027/2028 (ne samo za 2026)", () => {
    // 2027-02-15 je ponedeljak, ALI Sretenje je fiksan datum (15/16. februar) svake godine -> oba su
    // praznik, rok se pomera na prvi radni dan, sredu 17.
    const d27 = rokPoreza("2027-02");
    expect(d27.getFullYear()).toBe(2027);
    expect(d27.getMonth()).toBe(1);
    expect(d27.getDate()).toBe(17);
  });
});

describe("sledeciRadniDan (nextBusinessDay)", () => {
  it("radni dan bez praznika ostaje nepromenjen", () => {
    const d = sledeciRadniDan(new Date(2026, 10, 17));
    expect(d.getDate()).toBe(17);
    expect(d.getMonth()).toBe(10);
  });
});

describe("nazivMesecaUsluge (taxServiceMonthName)", () => {
  it("mesec usluge je PRETHODNI mesec u odnosu na ključ", () => {
    expect(nazivMesecaUsluge("2026-11")).toBe("oktobar");
    expect(nazivMesecaUsluge("2026-01")).toBe("decembar"); // prelaz preko godine
  });
});

describe("ukupnoMesecno (taxMonthlyTotal)", () => {
  it("sabira monthlyAmount svih stavki", () => {
    const stavke = [
      { monthlyAmount: 495_000 },
      { monthlyAmount: 1_231_128 },
      { monthlyAmount: 528_359 },
      { monthlyAmount: 38_473 },
    ];
    expect(ukupnoMesecno(stavke)).toBe(2_292_960);
  });
  it("prazan niz vraća 0", () => {
    expect(ukupnoMesecno([])).toBe(0);
  });
});

describe("brojPlacenih / jeMesecPlacen (taxMonthPaidCount / taxMonthFullyPaid)", () => {
  it("broji samo 'placeno'", () => {
    expect(brojPlacenih(["placeno", "neplaceno", "placeno", "placeno"])).toBe(3);
    expect(brojPlacenih([])).toBe(0);
  });
  it("mesec je plaćen tek kad je broj plaćenih jednak broju stavki", () => {
    expect(jeMesecPlacen(["placeno", "placeno", "placeno", "placeno"], 4)).toBe(true);
    expect(jeMesecPlacen(["placeno", "neplaceno", "placeno", "placeno"], 4)).toBe(false);
  });
});

describe("sledeciMeseciZaPlacanje (upcomingTaxMonths)", () => {
  it("počinje od tekućeg meseca kad ništa nije plaćeno", () => {
    const danas = new Date(2026, 10, 20); // 20. novembar 2026
    const rezultat = sledeciMeseciZaPlacanje(danas, () => false, 3);
    expect(rezultat).toEqual(["2026-11", "2026-12", "2027-01"]);
  });

  it("preskače mesece koji su već u potpunosti plaćeni", () => {
    const danas = new Date(2026, 10, 20);
    const placeni = new Set(["2026-11"]);
    const rezultat = sledeciMeseciZaPlacanje(danas, (k) => placeni.has(k), 2);
    expect(rezultat).toEqual(["2026-12", "2027-01"]);
  });

  it("prelazi preko granice godine (decembar -> januar)", () => {
    const danas = new Date(2026, 11, 5); // 5. decembar 2026
    const rezultat = sledeciMeseciZaPlacanje(danas, () => false, 2);
    expect(rezultat).toEqual(["2026-12", "2027-01"]);
  });
});
