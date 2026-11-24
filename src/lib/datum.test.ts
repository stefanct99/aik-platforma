import { describe, expect, it } from "vitest";
import { formatDatum, formatDatumSrpski, parseDatumSrpski } from "./datum";

describe("formatDatumSrpski", () => {
  it("formatira kao DD.MM.GGGG. (primer iz spec 7.13: 14.03.2024.)", () => {
    expect(formatDatumSrpski(new Date("2024-03-14T00:00:00.000Z"))).toBe("14.03.2024.");
  });

  it("dodaje nule ispred jednocifrenih dana i meseci", () => {
    expect(formatDatumSrpski(new Date("2026-01-05T00:00:00.000Z"))).toBe("05.01.2026.");
  });

  it("koristi UTC, ne lokalnu vremensku zonu servera", () => {
    // Ponoć po UTC za 1. januar ne sme da se pomeri na 31. decembar čak ni u zoni iza UTC.
    expect(formatDatumSrpski(new Date("2026-01-01T00:00:00.000Z"))).toBe("01.01.2026.");
  });
});

describe("parseDatumSrpski", () => {
  it("parsira ispravan datum sa tačkom na kraju", () => {
    const datum = parseDatumSrpski("14.03.2024.");
    expect(datum?.getUTCFullYear()).toBe(2024);
    expect(datum?.getUTCMonth()).toBe(2);
    expect(datum?.getUTCDate()).toBe(14);
  });

  it("prihvata i bez tačke na kraju", () => {
    expect(parseDatumSrpski("05.01.2026")).not.toBeNull();
  });

  it("odbija nepostojeći dan (31. februar), ne tiho prebacuje na mart", () => {
    expect(parseDatumSrpski("31.02.2021.")).toBeNull();
  });

  it("odbija 29. februar u neprestupnoj godini", () => {
    expect(parseDatumSrpski("29.02.2023.")).toBeNull();
  });

  it("prihvata 29. februar u prestupnoj godini", () => {
    expect(parseDatumSrpski("29.02.2024.")).not.toBeNull();
  });

  it("odbija format koji nije dd.mm.gggg.", () => {
    expect(parseDatumSrpski("2024-03-14")).toBeNull();
    expect(parseDatumSrpski("14/03/2024")).toBeNull();
    expect(parseDatumSrpski("")).toBeNull();
  });

  it("formatDatumSrpski i parseDatumSrpski su obrnute operacije", () => {
    const original = new Date("2024-03-14T00:00:00.000Z");
    const nazad = parseDatumSrpski(formatDatumSrpski(original));
    expect(nazad?.toISOString()).toBe(original.toISOString());
  });
});

describe("formatDatum (Korak 7, Jezik i izgled - podešavanje formata datuma)", () => {
  const datum = new Date("2026-11-15T00:00:00.000Z");

  it('"dmy" je isto što i formatDatumSrpski (primer iz frejma Pd7: 15.11.2026.)', () => {
    expect(formatDatum(datum, "dmy")).toBe("15.11.2026.");
    expect(formatDatum(datum, "dmy")).toBe(formatDatumSrpski(datum));
  });

  it('"iso" vraća GGGG-MM-DD (primer iz frejma Pd7: 2026-11-15)', () => {
    expect(formatDatum(datum, "iso")).toBe("2026-11-15");
  });

  it('"iso" dodaje nule ispred jednocifrenih dana i meseci', () => {
    expect(formatDatum(new Date("2026-01-05T00:00:00.000Z"), "iso")).toBe("2026-01-05");
  });
});
