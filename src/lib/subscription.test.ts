import { describe, expect, it } from "vitest";
import { izracunajProbniPeriod, recDan } from "./subscription";

describe("izracunajProbniPeriod", () => {
  it("vraća 30 dana odmah posle registracije", () => {
    const sada = new Date("2026-01-31T12:00:00.000Z");
    const nalogKreiran = new Date("2026-01-31T10:00:00.000Z");
    expect(izracunajProbniPeriod(nalogKreiran, sada).danaOstalo).toBe(30);
  });

  it("broji unazad kako dani prolaze (primer iz specifikacije: 23 dana)", () => {
    const nalogKreiran = new Date("2026-01-01T00:00:00.000Z");
    const sada = new Date("2026-01-08T00:00:00.000Z");
    expect(izracunajProbniPeriod(nalogKreiran, sada).danaOstalo).toBe(23);
  });

  it("ne ide ispod nule i označava da je istekao", () => {
    const nalogKreiran = new Date("2026-01-01T00:00:00.000Z");
    const sada = new Date("2026-03-01T00:00:00.000Z");
    const stanje = izracunajProbniPeriod(nalogKreiran, sada);
    expect(stanje.danaOstalo).toBe(0);
    expect(stanje.istekaoJe).toBe(true);
  });

  it("tačno na 30. dan više nije istekao, a na 31. jeste", () => {
    const nalogKreiran = new Date("2026-01-01T00:00:00.000Z");
    expect(izracunajProbniPeriod(nalogKreiran, new Date("2026-01-30T00:00:00.000Z")).istekaoJe).toBe(
      false,
    );
    expect(izracunajProbniPeriod(nalogKreiran, new Date("2026-01-31T00:00:00.000Z")).istekaoJe).toBe(
      true,
    );
  });
});

describe("recDan", () => {
  it("koristi 'dan' za 1, 21, 31...", () => {
    expect(recDan(1)).toBe("dan");
    expect(recDan(21)).toBe("dan");
    expect(recDan(31)).toBe("dan");
  });

  it("koristi 'dana' za 2-20, uključujući 11-14, i za primer iz spec (23)", () => {
    expect(recDan(2)).toBe("dana");
    expect(recDan(5)).toBe("dana");
    expect(recDan(11)).toBe("dana");
    expect(recDan(14)).toBe("dana");
    expect(recDan(23)).toBe("dana");
    expect(recDan(0)).toBe("dana");
  });
});
