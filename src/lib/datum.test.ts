import { describe, expect, it } from "vitest";
import { formatDatumSrpski } from "./datum";

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
