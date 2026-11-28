// Izvoz Knjige prihoda (Korak 9g-1) - čiste funkcije, bez baze. Isti obrazac kao prihodi.test.ts.
import { describe, it, expect } from "vitest";
import {
  filtrirajZaIzvoz,
  imeFajlaIzvoza,
  jePrazanIzvoz,
  napraviTabeleIzvoza,
  opisPerioda,
  parsirajBool,
  parsirajFormat,
  parsirajGodinu,
  parsirajPeriod,
  pripadaPeriodu,
  uBrojevaniRedovi,
  zbirIznosaRsd,
  type PeriodIzvoza,
} from "./izvoz-prihoda";
import type { PrihodRed } from "./prihodi";

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

const GODINA: PeriodIzvoza = { tip: "godina" };

describe("opisPerioda", () => {
  it("cela godina", () => {
    expect(opisPerioda(2026, GODINA)).toBe("2026, cela godina");
  });
  it("kvartal (rimski broj)", () => {
    expect(opisPerioda(2026, { tip: "kvartal", kvartal: 2 })).toBe(
      "2026, II kvartal",
    );
  });
  it("mesec (naziv malim slovima)", () => {
    expect(opisPerioda(2026, { tip: "mesec", mesec: 3 })).toBe("2026, mart");
  });
});

describe("imeFajlaIzvoza", () => {
  it("cela godina, excel", () => {
    expect(imeFajlaIzvoza(2026, GODINA, "excel")).toBe(
      "knjiga-prihoda-2026.xlsx",
    );
  });
  it("kvartal, excel", () => {
    expect(
      imeFajlaIzvoza(2026, { tip: "kvartal", kvartal: 2 }, "excel"),
    ).toBe("knjiga-prihoda-2026-II-kvartal.xlsx");
  });
  it("mesec (dvocifreno), excel", () => {
    expect(imeFajlaIzvoza(2026, { tip: "mesec", mesec: 3 }, "excel")).toBe(
      "knjiga-prihoda-2026-03.xlsx",
    );
  });
  it("pdf ekstenzija", () => {
    expect(imeFajlaIzvoza(2026, GODINA, "pdf")).toBe("knjiga-prihoda-2026.pdf");
  });
});

describe("pripadaPeriodu", () => {
  it("cela godina: pogađa svaki mesec te godine, ne pogrešnu godinu", () => {
    expect(pripadaPeriodu(red({ datumIso: "2026-01-01T00:00:00.000Z" }), 2026, GODINA)).toBe(true);
    expect(pripadaPeriodu(red({ datumIso: "2026-12-31T00:00:00.000Z" }), 2026, GODINA)).toBe(true);
    expect(pripadaPeriodu(red({ datumIso: "2025-12-31T00:00:00.000Z" }), 2026, GODINA)).toBe(false);
  });

  it("kvartal: granice meseci (I kvartal = jan-mart, II kvartal = apr-jun)", () => {
    const q1 = { tip: "kvartal", kvartal: 1 } as const;
    expect(pripadaPeriodu(red({ datumIso: "2026-03-31T00:00:00.000Z" }), 2026, q1)).toBe(true);
    expect(pripadaPeriodu(red({ datumIso: "2026-04-01T00:00:00.000Z" }), 2026, q1)).toBe(false);
    const q2 = { tip: "kvartal", kvartal: 2 } as const;
    expect(pripadaPeriodu(red({ datumIso: "2026-04-01T00:00:00.000Z" }), 2026, q2)).toBe(true);
    expect(pripadaPeriodu(red({ datumIso: "2026-06-30T00:00:00.000Z" }), 2026, q2)).toBe(true);
    expect(pripadaPeriodu(red({ datumIso: "2026-07-01T00:00:00.000Z" }), 2026, q2)).toBe(false);
  });

  it("mesec: samo taj mesec te godine", () => {
    const mart = { tip: "mesec", mesec: 3 } as const;
    expect(pripadaPeriodu(red({ datumIso: "2026-03-01T00:00:00.000Z" }), 2026, mart)).toBe(true);
    expect(pripadaPeriodu(red({ datumIso: "2026-02-28T00:00:00.000Z" }), 2026, mart)).toBe(false);
    expect(pripadaPeriodu(red({ datumIso: "2025-03-15T00:00:00.000Z" }), 2026, mart)).toBe(false);
  });
});

describe("filtrirajZaIzvoz", () => {
  it("filtrira po periodu i sortira najnoviji prvo", () => {
    const stariji = red({ id: "a", datumIso: "2026-01-05T00:00:00.000Z" });
    const noviji = red({ id: "b", datumIso: "2026-01-20T00:00:00.000Z" });
    const vanPerioda = red({ id: "c", datumIso: "2026-02-01T00:00:00.000Z" });
    const rezultat = filtrirajZaIzvoz(
      [stariji, noviji, vanPerioda],
      2026,
      { tip: "mesec", mesec: 1 },
    );
    expect(rezultat.map((r) => r.id)).toEqual(["b", "a"]);
  });
});

describe("uBrojevaniRedovi", () => {
  it("numeriše od 1, u datom redosledu", () => {
    const rezultat = uBrojevaniRedovi([red({ id: "a" }), red({ id: "b" })]);
    expect(rezultat.map((r) => [r.id, r.redniBroj])).toEqual([
      ["a", 1],
      ["b", 2],
    ]);
  });
  it("prazan niz", () => {
    expect(uBrojevaniRedovi([])).toEqual([]);
  });
});

describe("zbirIznosaRsd", () => {
  it("sabira iznosRsd, red bez kursa (null) ne učestvuje", () => {
    const rezultat = zbirIznosaRsd([
      red({ iznosRsd: 100 }),
      red({ iznosRsd: null }),
      red({ iznosRsd: 50 }),
    ]);
    expect(rezultat).toBe(150);
  });
  it("prazan niz vraća 0", () => {
    expect(zbirIznosaRsd([])).toBe(0);
  });
});

describe("napraviTabeleIzvoza", () => {
  const devizni = red({ id: "d1", vrsta: "devizni", iznosRsd: 1000 });
  const dinarski = red({
    id: "r1-din",
    vrsta: "dinarski",
    valuta: "RSD",
    kurs: null,
    iznosRsd: 2000,
  });

  it("odvojeno: dve tabele, redni broj počinje od 1 u SVAKOJ", () => {
    const tabele = napraviTabeleIzvoza([devizni, dinarski], true, false);
    expect(tabele.map((t) => t.naziv)).toEqual([
      "Devizni prihodi",
      "Dinarski prihodi",
    ]);
    expect(tabele[0].redovi).toEqual([{ ...devizni, redniBroj: 1 }]);
    expect(tabele[1].redovi).toEqual([{ ...dinarski, redniBroj: 1 }]);
  });

  it("spojeno: jedna tabela 'Prihodi' sa svim redovima", () => {
    const tabele = napraviTabeleIzvoza([devizni, dinarski], false, false);
    expect(tabele).toHaveLength(1);
    expect(tabele[0].naziv).toBe("Prihodi");
    expect(tabele[0].redovi.map((r) => r.id)).toEqual(["d1", "r1-din"]);
  });

  it("zbir uključen: zbirRsd je zbir SAMO te tabele", () => {
    const tabele = napraviTabeleIzvoza([devizni, dinarski], true, true);
    expect(tabele[0].zbirRsd).toBe(1000);
    expect(tabele[1].zbirRsd).toBe(2000);
  });

  it("zbir isključen: zbirRsd je null", () => {
    const tabele = napraviTabeleIzvoza([devizni, dinarski], true, false);
    expect(tabele[0].zbirRsd).toBeNull();
    expect(tabele[1].zbirRsd).toBeNull();
  });

  it("prazan period: tabele postoje, ali bez redova", () => {
    const tabele = napraviTabeleIzvoza([], true, true);
    expect(tabele[0].redovi).toEqual([]);
    expect(tabele[0].zbirRsd).toBe(0);
  });
});

describe("jePrazanIzvoz", () => {
  it("true kad su SVE tabele bez redova", () => {
    const tabele = napraviTabeleIzvoza([], true, false);
    expect(jePrazanIzvoz(tabele)).toBe(true);
  });
  it("false kad bar jedna tabela ima red", () => {
    const tabele = napraviTabeleIzvoza([red({ vrsta: "devizni" })], true, false);
    expect(jePrazanIzvoz(tabele)).toBe(false);
  });
});

describe("parsirajGodinu", () => {
  const dozvoljene = [2027, 2026, 2025, 2024];
  it("prihvata godinu sa liste", () => {
    expect(parsirajGodinu("2026", dozvoljene)).toBe(2026);
  });
  it("odbija godinu van liste", () => {
    expect(parsirajGodinu("2020", dozvoljene)).toBeNull();
  });
  it("odbija nenumerički/praznu/nepostojeću vrednost", () => {
    expect(parsirajGodinu("abc", dozvoljene)).toBeNull();
    expect(parsirajGodinu("", dozvoljene)).toBeNull();
    expect(parsirajGodinu(null, dozvoljene)).toBeNull();
  });
});

describe("parsirajPeriod", () => {
  it("cela-godina", () => {
    expect(parsirajPeriod("cela-godina")).toEqual({ tip: "godina" });
  });
  it("kvartal q1..q4", () => {
    expect(parsirajPeriod("q1")).toEqual({ tip: "kvartal", kvartal: 1 });
    expect(parsirajPeriod("q4")).toEqual({ tip: "kvartal", kvartal: 4 });
  });
  it("mesec m01..m12", () => {
    expect(parsirajPeriod("m01")).toEqual({ tip: "mesec", mesec: 1 });
    expect(parsirajPeriod("m12")).toEqual({ tip: "mesec", mesec: 12 });
  });
  it.each(["q0", "q5", "m00", "m13", "mesec", "", null])(
    "odbija nevažeću vrednost (%s)",
    (vrednost) => {
      expect(parsirajPeriod(vrednost)).toBeNull();
    },
  );
});

describe("parsirajFormat", () => {
  it("prihvata pdf/excel", () => {
    expect(parsirajFormat("pdf")).toBe("pdf");
    expect(parsirajFormat("excel")).toBe("excel");
  });
  it("odbija sve ostalo (npr. 'csv')", () => {
    expect(parsirajFormat("csv")).toBeNull();
    expect(parsirajFormat(null)).toBeNull();
  });
});

describe("parsirajBool", () => {
  it("'1' je true, sve ostalo (uključujući null) je false", () => {
    expect(parsirajBool("1")).toBe(true);
    expect(parsirajBool("0")).toBe(false);
    expect(parsirajBool(null)).toBe(false);
    expect(parsirajBool("true")).toBe(false);
  });
});
