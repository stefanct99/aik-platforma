// Knjiga prihoda - grupisanje/filtriranje (Korak 9a). Čiste funkcije, bez baze.
import { describe, it, expect } from "vitest";
import {
  godinePrihoda,
  grupisiPoGodini,
  filtrirajRedove,
  ukupanPrihodUGodini,
  brojUplataPoKlijentu,
  uplataRec,
  izracunajIznosRsd,
  type PrihodRed,
} from "./prihodi";

function red(delimicno: Partial<PrihodRed>): PrihodRed {
  return {
    id: "r1",
    datumIso: "2026-06-15T00:00:00.000Z",
    valuta: "EUR",
    vrsta: "devizni",
    iznos: 120000,
    kurs: 117.2,
    iznosRsd: 140640,
    izvor: "rucno",
    fakturaId: "f1",
    brojFakture: "1/26-6",
    klijentId: "k1",
    klijentIme: "Acme Inc.",
    opis: null,
    fakturaPrelazak: null,
    ...delimicno,
  };
}

describe("godinePrihoda", () => {
  it("vraća narednu, trenutnu i dve prethodne godine, tim redosledom", () => {
    expect(godinePrihoda(new Date("2026-05-01"))).toEqual([2027, 2026, 2025, 2024]);
  });
});

describe("grupisiPoGodini", () => {
  it("razdvaja devizni/dinarski i filtrira po godini datuma uplate", () => {
    const redovi = [
      red({ id: "a", datumIso: "2026-01-01", vrsta: "devizni" }),
      red({ id: "b", datumIso: "2026-02-01", vrsta: "dinarski" }),
      red({ id: "c", datumIso: "2025-01-01", vrsta: "devizni" }),
    ];
    const g = grupisiPoGodini(redovi, 2026);
    expect(g.devizni.map((r) => r.id)).toEqual(["a"]);
    expect(g.dinarski.map((r) => r.id)).toEqual(["b"]);
  });

  it("sortira po datumu uplate, najnoviji prvo", () => {
    const redovi = [
      red({ id: "stariji", datumIso: "2026-01-01" }),
      red({ id: "noviji", datumIso: "2026-06-01" }),
    ];
    const g = grupisiPoGodini(redovi, 2026);
    expect(g.devizni.map((r) => r.id)).toEqual(["noviji", "stariji"]);
  });
});

describe("filtrirajRedove", () => {
  const redovi = [
    red({ id: "a", datumIso: "2026-03-10", klijentId: "k1" }),
    red({ id: "b", datumIso: "2026-03-20", klijentId: "k2" }),
    red({ id: "c", datumIso: "2026-07-01", klijentId: "k1" }),
  ];

  it("bez filtera vraća sve redove", () => {
    expect(filtrirajRedove(redovi, null, null).map((r) => r.id)).toEqual(["a", "b", "c"]);
  });

  it("filtrira po mesecu", () => {
    expect(filtrirajRedove(redovi, 3, null).map((r) => r.id)).toEqual(["a", "b"]);
  });

  it("filtrira po klijentu", () => {
    expect(filtrirajRedove(redovi, null, "k1").map((r) => r.id)).toEqual(["a", "c"]);
  });

  it("kombinuje mesec i klijenta", () => {
    expect(filtrirajRedove(redovi, 3, "k1").map((r) => r.id)).toEqual(["a"]);
  });
});

describe("ukupanPrihodUGodini", () => {
  it("sabira RSD protivvrednost oba podtaba, isključuje null iznosRsd", () => {
    const devizni = [red({ id: "a", iznosRsd: 1000 }), red({ id: "b", iznosRsd: null })];
    const dinarski = [red({ id: "c", vrsta: "dinarski", iznosRsd: 500 })];
    expect(ukupanPrihodUGodini(devizni, dinarski)).toBe(1500);
  });
});

describe("brojUplataPoKlijentu", () => {
  it("broji uplate po klijentu, izostavlja redove bez klijenta, sortira po imenu", () => {
    const redovi = [
      red({ id: "a", klijentId: "k2", klijentIme: "Zed" }),
      red({ id: "b", klijentId: "k1", klijentIme: "Acme" }),
      red({ id: "c", klijentId: "k1", klijentIme: "Acme" }),
      red({ id: "d", klijentId: null, klijentIme: null }),
    ];
    expect(brojUplataPoKlijentu(redovi)).toEqual([
      { klijentId: "k1", klijentIme: "Acme", broj: 2 },
      { klijentId: "k2", klijentIme: "Zed", broj: 1 },
    ]);
  });
});

describe("izracunajIznosRsd", () => {
  it("1.000,00 EUR (iznos=100000) po kursu 117,20 = 117.200,00 din (11720000 para)", () => {
    expect(izracunajIznosRsd(100000, 117.2)).toBe(11_720_000);
  });

  it("zaokružuje na najbližu paru (2 decimale dinara)", () => {
    // 0,01 EUR (iznos=1) * 117,2345 = 1,172345 din -> zaokruženo na 1,17 din = 117 para.
    expect(izracunajIznosRsd(1, 117.2345)).toBe(117);
  });

  it("zaokružuje .5 pare naviše (standardno zaokruživanje, ne bankarsko)", () => {
    // 1 para (0,01 najmanje jedinice) * kurs takav da je proizvod tačno na granici .5 pare.
    expect(izracunajIznosRsd(2, 117.25)).toBe(235); // 2 * 117,25 = 234,50 -> 235
  });

  it("nema greške zaokruživanja za kurs koji u binarnom floating-point zapisu nije tačan (npr. 107,10)", () => {
    // Direktno iznos*kurs (oba floating-point) bi za ovaj kurs moglo da padne na 4712809,999999999 -
    // funkcija prvo zaokružuje kurs na ceo broj (1071000 = 107,10 * 10000) pa množi kao cele brojeve.
    expect(izracunajIznosRsd(44_000, 107.1)).toBe(4_712_400);
  });

  it("veliki iznos (realna faktura) daje tačan rezultat", () => {
    expect(izracunajIznosRsd(1_200_000, 117.2)).toBe(140_640_000);
  });

  it.each([0, -1, -117.2, NaN, Infinity, -Infinity])("baca grešku za nevažeći kurs (%s)", (kurs) => {
    expect(() => izracunajIznosRsd(100000, kurs)).toThrow("Kurs mora biti broj veći od 0.");
  });
});

describe("uplataRec", () => {
  it("1, 21, 31... -> 'uplata'", () => {
    expect(uplataRec(1)).toBe("uplata");
    expect(uplataRec(21)).toBe("uplata");
  });
  it("2-4, 22-24... -> 'uplate'", () => {
    expect(uplataRec(2)).toBe("uplate");
    expect(uplataRec(3)).toBe("uplate");
    expect(uplataRec(4)).toBe("uplate");
    expect(uplataRec(22)).toBe("uplate");
  });
  it("5-20 (uključujući 11-14) i 0 -> 'uplata'", () => {
    expect(uplataRec(0)).toBe("uplata");
    expect(uplataRec(5)).toBe("uplata");
    expect(uplataRec(11)).toBe("uplata");
    expect(uplataRec(12)).toBe("uplata");
    expect(uplataRec(14)).toBe("uplata");
    expect(uplataRec(111)).toBe("uplata");
  });
});
