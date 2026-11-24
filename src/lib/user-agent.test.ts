import { describe, expect, it } from "vitest";
import { opisiKadaJeKorisceno, opisiProtekloVremeDuze, prepoznajPregledacISistem } from "./user-agent";

describe("prepoznajPregledacISistem", () => {
  it("prepoznaje Chrome na Windows", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    expect(prepoznajPregledacISistem(ua)).toBe("Chrome, Windows");
  });

  it("prepoznaje Safari na iPhone", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    expect(prepoznajPregledacISistem(ua)).toBe("Safari, iPhone");
  });

  it("razlikuje Edge i Chrome (Edge sadrži i Chrome/ u stringu)", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
    expect(prepoznajPregledacISistem(ua)).toBe("Edge, Windows");
  });

  it("vraća podrazumevan tekst kad nema user-agenta", () => {
    expect(prepoznajPregledacISistem(null)).toBe("Nepoznat uređaj");
    expect(prepoznajPregledacISistem(undefined)).toBe("Nepoznat uređaj");
  });
});

describe("opisiKadaJeKorisceno", () => {
  it('"aktivan sada" za poslednjih par minuta', () => {
    const sada = new Date("2026-01-01T12:00:00.000Z");
    expect(opisiKadaJeKorisceno(new Date("2026-01-01T11:58:00.000Z"), sada)).toBe("aktivan sada");
  });

  it("minuti i sati za isti dan", () => {
    const sada = new Date("2026-01-01T12:00:00.000Z");
    expect(opisiKadaJeKorisceno(new Date("2026-01-01T11:30:00.000Z"), sada)).toBe("Pre 30 min");
    expect(opisiKadaJeKorisceno(new Date("2026-01-01T09:00:00.000Z"), sada)).toBe("Pre 3 h");
  });

  it('"Pre 2 dana" (primer iz specifikacije)', () => {
    const sada = new Date("2026-01-03T12:00:00.000Z");
    expect(opisiKadaJeKorisceno(new Date("2026-01-01T12:00:00.000Z"), sada)).toBe("Pre 2 dana");
  });

  it('jednina "Pre 1 dan"', () => {
    const sada = new Date("2026-01-02T12:00:00.000Z");
    expect(opisiKadaJeKorisceno(new Date("2026-01-01T12:00:00.000Z"), sada)).toBe("Pre 1 dan");
  });
});

describe("opisiProtekloVremeDuze", () => {
  it('"pre 3 meseca" (primer iz frejma Pd6)', () => {
    const sada = new Date("2026-04-01T00:00:00.000Z");
    const pre3meseca = new Date("2026-01-01T00:00:00.000Z");
    expect(opisiProtekloVremeDuze(pre3meseca, sada)).toBe("pre 3 meseci");
  });

  it("dani za kraće periode, jednina za 1 dan i 1 mesec", () => {
    const sada = new Date("2026-02-01T00:00:00.000Z");
    expect(opisiProtekloVremeDuze(new Date("2026-01-31T00:00:00.000Z"), sada)).toBe("pre 1 dan");
    expect(opisiProtekloVremeDuze(new Date("2026-01-02T00:00:00.000Z"), sada)).toBe("pre 1 mesec");
  });

  it('"danas" za isti dan', () => {
    const sada = new Date("2026-01-01T18:00:00.000Z");
    expect(opisiProtekloVremeDuze(new Date("2026-01-01T09:00:00.000Z"), sada)).toBe("danas");
  });
});
