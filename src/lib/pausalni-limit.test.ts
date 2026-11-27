// Klizni limit od 6.000.000 din - 365 dana unazad (Korak 9a, spec 8.4). Čista funkcija, bez baze.
import { describe, it, expect } from "vitest";
import { izracunajPausalniLimit, LIMIT_PAUSALACA } from "./pausalni-limit";

const DANAS = new Date("2026-11-27T00:00:00.000Z");

describe("izracunajPausalniLimit", () => {
  it("prazan niz uplata daje 0% i ceo limit kao preostalo", () => {
    const r = izracunajPausalniLimit([], DANAS);
    expect(r).toEqual({ ukupno: 0, procenat: 0, preostalo: LIMIT_PAUSALACA, limit: LIMIT_PAUSALACA });
  });

  it("sabira samo uplate unutar poslednjih 365 dana (uključujući granicu)", () => {
    const tacno365DanaRanije = new Date(DANAS);
    tacno365DanaRanije.setUTCDate(tacno365DanaRanije.getUTCDate() - 365);
    const r = izracunajPausalniLimit(
      [{ datum: tacno365DanaRanije, iznosRsd: 100_00 }],
      DANAS,
    );
    expect(r.ukupno).toBe(100_00);
  });

  it("isključuje uplatu stariju od 365 dana (366 dana ranije)", () => {
    const stara = new Date(DANAS);
    stara.setUTCDate(stara.getUTCDate() - 366);
    const r = izracunajPausalniLimit([{ datum: stara, iznosRsd: 100_00 }], DANAS);
    expect(r.ukupno).toBe(0);
  });

  it("isključuje uplatu bez upisanog kursa (iznosRsd null)", () => {
    const r = izracunajPausalniLimit([{ datum: DANAS, iznosRsd: null }], DANAS);
    expect(r.ukupno).toBe(0);
  });

  it("isključuje uplatu u budućnosti (posle 'danas')", () => {
    const sutra = new Date(DANAS);
    sutra.setUTCDate(sutra.getUTCDate() + 1);
    const r = izracunajPausalniLimit([{ datum: sutra, iznosRsd: 100_00 }], DANAS);
    expect(r.ukupno).toBe(0);
  });

  it("procenat i preostalo su tačni na pola limita", () => {
    const r = izracunajPausalniLimit([{ datum: DANAS, iznosRsd: LIMIT_PAUSALACA / 2 }], DANAS);
    expect(r.procenat).toBe(50);
    expect(r.preostalo).toBe(LIMIT_PAUSALACA / 2);
  });

  it("preostalo nikad nije negativno kad se limit pređe", () => {
    const r = izracunajPausalniLimit([{ datum: DANAS, iznosRsd: LIMIT_PAUSALACA * 2 }], DANAS);
    expect(r.procenat).toBe(200);
    expect(r.preostalo).toBe(0);
  });

  it("sabira više uplata u periodu", () => {
    const r = izracunajPausalniLimit(
      [
        { datum: DANAS, iznosRsd: 100_00 },
        { datum: DANAS, iznosRsd: 200_00 },
        { datum: DANAS, iznosRsd: null },
      ],
      DANAS,
    );
    expect(r.ukupno).toBe(300_00);
  });
});
