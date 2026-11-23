import { describe, expect, it } from "vitest";
import { isValidMb, isValidPib, isValidZip, sanitizeDigits } from "./identifiers";

// Isti testovi kao referenca/prototip/js/rules/identifiers.test.js, prilagođeni za Vitest, plus
// isValidZip (poštanski broj), koji u prototipu nije bio izdvojen u js/rules/.

describe("sanitizeDigits", () => {
  it("uklanja sve osim cifara (razmaci, tačke, crtice iz nalepljenog teksta)", () => {
    expect(sanitizeDigits("112 233 445")).toBe("112233445");
    expect(sanitizeDigits("112-233-445")).toBe("112233445");
    expect(sanitizeDigits("PIB: 112233445")).toBe("112233445");
  });

  it("prazno/null/undefined daje prazan string", () => {
    expect(sanitizeDigits("")).toBe("");
    expect(sanitizeDigits(null)).toBe("");
    expect(sanitizeDigits(undefined)).toBe("");
  });

  it("maxLen seče na tačnu dužinu, i kad je nalepljeno više cifara nego treba", () => {
    expect(sanitizeDigits("1122334455555", 9)).toBe("112233445");
    expect(sanitizeDigits("123", 9)).toBe("123");
  });

  it("bez maxLen ne seče", () => {
    expect(sanitizeDigits("123456789012")).toBe("123456789012");
  });
});

describe("isValidPib", () => {
  it("tačno 9 cifara (spec 3.1)", () => {
    expect(isValidPib("112233445")).toBe(true);
    expect(isValidPib("11223344")).toBe(false);
    expect(isValidPib("1122334455")).toBe(false);
    expect(isValidPib("11223344a")).toBe(false);
    expect(isValidPib("")).toBe(false);
    expect(isValidPib(null)).toBe(false);
  });
});

describe("isValidMb", () => {
  it("tačno 8 cifara (spec 3.1)", () => {
    expect(isValidMb("66554433")).toBe(true);
    expect(isValidMb("6655443")).toBe(false);
    expect(isValidMb("665544330")).toBe(false);
    expect(isValidMb("")).toBe(false);
    expect(isValidMb(null)).toBe(false);
  });
});

describe("isValidZip", () => {
  it("tačno 5 cifara (spec 3.1, prototip js/onboarding.js Step2)", () => {
    expect(isValidZip("11000")).toBe(true);
    expect(isValidZip("1100")).toBe(false);
    expect(isValidZip("110000")).toBe(false);
    expect(isValidZip("")).toBe(false);
    expect(isValidZip(null)).toBe(false);
  });
});
