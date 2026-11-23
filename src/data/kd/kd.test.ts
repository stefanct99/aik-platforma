import { describe, expect, it } from "vitest";
import { KD2025 } from "./kd2025";
import { KD2010 } from "./kd2010";
import { TABELA_VEZA_KD2010_KD2025 } from "./tabela-veza";

describe("KD2025 (spisak razreda)", () => {
  it("ima 651 razred (RZS: 22 sektora, 87 oblasti, 287 grana, 651 grupa/razred)", () => {
    expect(KD2025).toHaveLength(651);
  });

  it("svaka šifra ima naziv i oblik XX.XX", () => {
    for (const razred of KD2025) {
      expect(razred.code).toMatch(/^\d{2}\.\d{2}$/);
      expect(razred.name.length).toBeGreaterThan(0);
    }
  });

  it("sadrži primer iz Uredbe: 62.10 (ranije 62.01 u KD 2010)", () => {
    expect(KD2025.find((r) => r.code === "62.10")).toEqual({
      code: "62.10",
      name: "Delatnosti računarskog programiranja",
    });
  });
});

describe("KD2010 (spisak razreda)", () => {
  it("ima 615 razreda", () => {
    expect(KD2010).toHaveLength(615);
  });

  it("svaka šifra ima naziv i oblik XX.XX", () => {
    for (const razred of KD2010) {
      expect(razred.code).toMatch(/^\d{2}\.\d{2}$/);
      expect(razred.name.length).toBeGreaterThan(0);
    }
  });

  it("sadrži primer iz Uredbe: 62.01 Računarsko programiranje", () => {
    expect(KD2010.find((r) => r.code === "62.01")).toEqual({
      code: "62.01",
      name: "Računarsko programiranje",
    });
  });
});

describe("Tabela veza KD2010 -> KD2025", () => {
  it("svaka stara šifra postoji u KD2010, svaka nova u KD2025", () => {
    const kd2010Sifre = new Set(KD2010.map((r) => r.code));
    const kd2025Sifre = new Set(KD2025.map((r) => r.code));
    for (const par of TABELA_VEZA_KD2010_KD2025) {
      expect(kd2010Sifre.has(par.staraSifra)).toBe(true);
      expect(kd2025Sifre.has(par.novaSifra)).toBe(true);
    }
  });

  it("sadrži primer iz Uredbe: 62.01 -> 62.10", () => {
    expect(
      TABELA_VEZA_KD2010_KD2025.some((p) => p.staraSifra === "62.01" && p.novaSifra === "62.10"),
    ).toBe(true);
  });

  it("pokriva svih 615 starih šifara (nijedna nije bez preslikavanja)", () => {
    const pokrivene = new Set(TABELA_VEZA_KD2010_KD2025.map((p) => p.staraSifra));
    expect(pokrivene.size).toBe(615);
  });

  it("neke stare šifre se dele na više novih (jedan na više)", () => {
    const brojac = new Map<string, number>();
    for (const par of TABELA_VEZA_KD2010_KD2025) {
      brojac.set(par.staraSifra, (brojac.get(par.staraSifra) || 0) + 1);
    }
    const podeljene = [...brojac.values()].filter((n) => n > 1).length;
    // Tačan broj (159) je proveren i upisan u izveštaj Koraka 2b; ovde se samo potvrđuje da pojava
    // postoji i da je u očekivanom redu veličine, da test ne zavisi od tačne cifre koja može
    // beznačajno da se promeni ako RZS ispravi tipfeler u tabeli.
    expect(podeljene).toBeGreaterThan(100);
    expect(podeljene).toBeLessThan(250);
  });
});
