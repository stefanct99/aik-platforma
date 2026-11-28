// Klizni limit od 6.000.000 din - 365 dana unazad (Korak 9a, spec 8.4). Čista funkcija, bez baze.
import { describe, it, expect } from "vitest";
import {
  izracunajPausalniLimit,
  LIMIT_PAUSALACA,
  pragLimitBanera,
  sadrzajLimitBanera,
} from "./pausalni-limit";

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

describe("pragLimitBanera (Korak 9f)", () => {
  it("vraća null ispod 80%", () => {
    expect(pragLimitBanera(79.99)).toBeNull();
    expect(pragLimitBanera(0)).toBeNull();
  });

  it("tačno 80,0% je prag 80", () => {
    expect(pragLimitBanera(80)).toBe(80);
  });

  it("između 80% i 90% je prag 80", () => {
    expect(pragLimitBanera(85)).toBe(80);
    expect(pragLimitBanera(89.9)).toBe(80);
  });

  it("tačno 90,0% je prag 90", () => {
    expect(pragLimitBanera(90)).toBe(90);
  });

  it("između 90% i 100% je prag 90", () => {
    expect(pragLimitBanera(95)).toBe(90);
    expect(pragLimitBanera(99.9)).toBe(90);
  });

  it("tačno 100,0% je prag 100", () => {
    expect(pragLimitBanera(100)).toBe(100);
  });

  it("preko 100% ostaje na pragu 100 (nema četvrtog nivoa)", () => {
    expect(pragLimitBanera(120)).toBe(100);
    expect(pragLimitBanera(500)).toBe(100);
  });
});

describe("sadrzajLimitBanera (Korak 9f)", () => {
  it("ispod 80% vraća null (baner se ne prikazuje)", () => {
    expect(sadrzajLimitBanera(79.99, LIMIT_PAUSALACA * 0.2)).toBeNull();
  });

  it("80%: nivo 'upozorenje', naslov i preostalo u poruci", () => {
    const r = sadrzajLimitBanera(83.7, 980000_00);
    expect(r).not.toBeNull();
    expect(r?.nivo).toBe("upozorenje");
    expect(r?.naslov).toBe("Približavaš se limitu za paušalce");
    expect(r?.poruka).toBe(
      "Do 6.000.000 din ti je ostalo 980.000,00 din. Kad ga pređeš, gubiš pravo na paušalno oporezivanje, pa te upozoravam unapred.",
    );
  });

  it("90%: nivo 'opasnost', naslov sadrži procenat sa jednom decimalom, ISTA poruka kao 80%", () => {
    const r = sadrzajLimitBanera(92.345, 460000_00);
    expect(r?.nivo).toBe("opasnost");
    expect(r?.naslov).toBe("Dostigao si 92,3% godišnjeg limita");
    expect(r?.poruka).toBe(
      "Do 6.000.000 din ti je ostalo 460.000,00 din. Kad ga pređeš, gubiš pravo na paušalno oporezivanje, pa te upozoravam unapred.",
    );
  });

  it("100%: nivo 'opasnost', drugačija poruka (bez preostalog)", () => {
    const r = sadrzajLimitBanera(104, 0);
    expect(r?.nivo).toBe("opasnost");
    expect(r?.naslov).toBe("Prešao si limit za paušalce");
    expect(r?.poruka).toBe(
      "Prešao si 6.000.000 din. Menja se način oporezivanja, pa se javi knjigovođi da vidiš šta dalje.",
    );
  });
});
