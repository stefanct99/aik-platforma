import { describe, expect, it } from "vitest";
import { formatNovac } from "./money";

describe("formatNovac (Korak 8a)", () => {
  it("EUR i USD uvek sa dve decimale (primeri iz zadatka)", () => {
    expect(formatNovac(120000, "EUR")).toBe("1.200,00 €");
    expect(formatNovac(44128, "USD")).toBe("441,28 $");
  });

  it("RSD bez decimala (primer iz zadatka)", () => {
    expect(formatNovac(8500000, "RSD")).toBe("85.000 din");
  });

  it("RSD sa necelim brojem para se zaokružuje na prikazu (nema decimalno mesto)", () => {
    expect(formatNovac(8500050, "RSD")).toBe("85.001 din");
  });

  it("tačka kao hiljaditi razdvajač, zarez kao decimalni", () => {
    expect(formatNovac(123456789, "EUR")).toBe("1.234.567,89 €");
  });

  it("nepoznata valuta koristi sam kod kao simbol", () => {
    expect(formatNovac(10000, "GBP")).toBe("100,00 GBP");
  });
});
