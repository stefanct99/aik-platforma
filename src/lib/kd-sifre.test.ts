import { describe, expect, it } from "vitest";
import { findKD2010ByLegacyCode, isValidKD2025Code, pretraziKD2025 } from "./kd-sifre";

describe("isValidKD2025Code", () => {
  it("prihvata samo postojeću KD2025 šifru", () => {
    expect(isValidKD2025Code("62.10")).toBe(true);
    expect(isValidKD2025Code("62.01")).toBe(false); // stara KD2010 šifra, ne postoji u KD2025
    expect(isValidKD2025Code("99.99")).toBe(false);
  });
});

describe("findKD2010ByLegacyCode", () => {
  it("prepoznaje stari oblik bez tačke i sa tačkom", () => {
    expect(findKD2010ByLegacyCode("6201")).toEqual({ code: "62.01", name: "Računarsko programiranje" });
    expect(findKD2010ByLegacyCode("62.01")).toEqual({ code: "62.01", name: "Računarsko programiranje" });
  });

  it("vraća null za nepostojeću ili nepotpunu šifru", () => {
    expect(findKD2010ByLegacyCode("620")).toBeNull();
    expect(findKD2010ByLegacyCode("99.98")).toBeNull();
  });
});

describe("pretraziKD2025", () => {
  it("pretraga po šifri BEZ tačke pogađa novu šifru (62.10)", () => {
    const rezultati = pretraziKD2025("6210");
    expect(rezultati.some((r) => r.code === "62.10")).toBe(true);
  });

  it("pretraga po šifri SA tačkom pogađa istu šifru", () => {
    const rezultati = pretraziKD2025("62.10");
    expect(rezultati.some((r) => r.code === "62.10")).toBe(true);
  });

  it("pretraga po delu šifre (prefiks) vraća sve razrede te grane", () => {
    const rezultati = pretraziKD2025("62");
    expect(rezultati.length).toBeGreaterThan(1);
    expect(rezultati.every((r) => r.code.startsWith("62."))).toBe(true);
  });

  it("pretraga po delu naziva, bez obzira na veličinu slova", () => {
    const rezultati = pretraziKD2025("programiranja");
    expect(rezultati.some((r) => r.code === "62.10")).toBe(true);
  });

  it("pretraga po STAROJ KD2010 šifri (62.01) vraća novu šifru sa napomenom", () => {
    const rezultati = pretraziKD2025("62.01");
    const pogodak = rezultati.find((r) => r.code === "62.10");
    expect(pogodak).toBeDefined();
    expect(pogodak?.staraSifra).toBe("62.01");
  });

  it("pretraga po staroj šifri koja se deli na više novih vraća sve njih", () => {
    // 93.29 (KD2010, "Ostale zabavne i rekreativne delatnosti") se deli na 5 novih šifara.
    const rezultati = pretraziKD2025("9329");
    const saNapomenom = rezultati.filter((r) => r.staraSifra === "93.29");
    expect(saNapomenom.length).toBeGreaterThanOrEqual(5);
  });

  it("praznu pretragu vraća praznu listu", () => {
    expect(pretraziKD2025("")).toEqual([]);
    expect(pretraziKD2025("   ")).toEqual([]);
  });
});
