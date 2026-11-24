import { describe, expect, it } from "vitest";
import { formatBrojFakture, parseBrojFakture } from "./invoice-numbering";

describe("formatBrojFakture (Korak 8a, pravilo N/GG-M)", () => {
  it("primeri iz zadatka", () => {
    expect(formatBrojFakture(1, new Date("2027-01-15T00:00:00.000Z"))).toBe("1/27-1");
    expect(formatBrojFakture(25, new Date("2026-11-03T00:00:00.000Z"))).toBe("25/26-11");
    expect(formatBrojFakture(41, new Date("2026-12-20T00:00:00.000Z"))).toBe("41/26-12");
  });

  it("mesec bez vodeće nule (januar je '1', ne '01')", () => {
    expect(formatBrojFakture(5, new Date("2026-01-05T00:00:00.000Z"))).toBe("5/26-1");
  });

  it("koristi UTC, ne lokalnu vremensku zonu", () => {
    expect(formatBrojFakture(1, new Date("2026-01-01T00:00:00.000Z"))).toBe("1/26-1");
  });
});

describe("parseBrojFakture", () => {
  it("parsira ispravan format", () => {
    expect(parseBrojFakture("25/26-11")).toEqual({ redniBroj: 25, godina2: "26", mesec: 11 });
    expect(parseBrojFakture("1/27-1")).toEqual({ redniBroj: 1, godina2: "27", mesec: 1 });
  });

  it("odbija mesec van opsega 1-12", () => {
    expect(parseBrojFakture("1/26-0")).toBeNull();
    expect(parseBrojFakture("1/26-13")).toBeNull();
  });

  it("odbija redni broj manji od 1", () => {
    expect(parseBrojFakture("0/26-1")).toBeNull();
  });

  it("odbija stari format (GG/GG-N) i druge nepoznate oblike", () => {
    expect(parseBrojFakture("25/26-15")).toBeNull(); // stari prototip format: 25 je GG ovde, 3-cifren mesec nemoguć
    // napomena: "25/26-15" se zapravo PARSIRA kao redniBroj=25, mesec=15 (format isti, ali mesec 15 je
    // van opsega) - gornji expect to i proverava, test je ovde zbog čitljivosti nameran.
    expect(parseBrojFakture("abc")).toBeNull();
    expect(parseBrojFakture("")).toBeNull();
    expect(parseBrojFakture("25-26/11")).toBeNull();
  });

  it("formatBrojFakture i parseBrojFakture su obrnute operacije (za deo bez godine)", () => {
    const datum = new Date("2026-11-03T00:00:00.000Z");
    const broj = formatBrojFakture(25, datum);
    const nazad = parseBrojFakture(broj);
    expect(nazad).toEqual({ redniBroj: 25, godina2: "26", mesec: 11 });
  });
});
