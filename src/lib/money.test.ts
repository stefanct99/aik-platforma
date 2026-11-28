import { describe, expect, it } from "vitest";
import { formatNovacKompaktno, formatNovacPuno, formatProcenat } from "./money";

describe("formatNovacKompaktno (lista, kartice - Korak 8a ispravka)", () => {
  it("okrugli iznosi bez decimala, za svaku valutu (primeri iz zadatka)", () => {
    expect(formatNovacKompaktno(120000, "EUR")).toBe("1.200 €");
    expect(formatNovacKompaktno(85000, "EUR")).toBe("850 €");
    expect(formatNovacKompaktno(8500000, "RSD")).toBe("85.000 din");
    expect(formatNovacKompaktno(210000, "USD")).toBe("2.100 $");
  });

  it("neokrugli iznosi sa dve decimale (primer iz zadatka)", () => {
    expect(formatNovacKompaktno(44128, "USD")).toBe("441,28 $");
  });

  it("tačka kao hiljaditi razdvajač, zarez kao decimalni", () => {
    expect(formatNovacKompaktno(123456789, "EUR")).toBe("1.234.567,89 €");
  });
});

describe("formatNovacPuno (pregled fakture, forme, dokument - Korak 8a ispravka)", () => {
  it("uvek dve decimale, za svaku valutu uključujući RSD (primeri iz zadatka)", () => {
    expect(formatNovacPuno(120000, "EUR")).toBe("1.200,00 €");
    expect(formatNovacPuno(8500000, "RSD")).toBe("85.000,00 din");
    expect(formatNovacPuno(44128, "USD")).toBe("441,28 $");
  });

  it("nepoznata valuta koristi sam kod kao simbol", () => {
    expect(formatNovacPuno(10000, "GBP")).toBe("100,00 GBP");
  });
});

describe("formatProcenat (kartica limita, baner upozorenja - Korak 9a/9f)", () => {
  it("jedna decimala, srpski format (zarez)", () => {
    expect(formatProcenat(83.7)).toBe("83,7");
    expect(formatProcenat(92.345)).toBe("92,3");
  });

  it("ceo broj dobija jednu decimalnu nulu", () => {
    expect(formatProcenat(80)).toBe("80,0");
  });
});
