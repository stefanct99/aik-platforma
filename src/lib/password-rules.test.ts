import { describe, expect, it } from "vitest";
import { jeLozinkaIspravna, proveriLozinku } from "./password-rules";

describe("proveriLozinku", () => {
  it("prepoznaje sva tri uslova kad su ispunjena", () => {
    expect(proveriLozinku("Lozinka1")).toEqual({ najmanje8: true, velikoSlovo: true, broj: true });
  });

  it("prepoznaje kad fali dužina", () => {
    expect(proveriLozinku("Lz1").najmanje8).toBe(false);
  });

  it("prepoznaje kad fali veliko slovo", () => {
    expect(proveriLozinku("lozinka1").velikoSlovo).toBe(false);
  });

  it("prepoznaje kad fali broj", () => {
    expect(proveriLozinku("Lozinkaaa").broj).toBe(false);
  });
});

describe("jeLozinkaIspravna", () => {
  it("prihvata lozinku koja ispunjava sva tri pravila", () => {
    expect(jeLozinkaIspravna("Lozinka1")).toBe(true);
  });

  it("odbija slabu lozinku (spec 7.1: najmanje 8, veliko slovo, broj)", () => {
    expect(jeLozinkaIspravna("lozinka")).toBe(false);
    expect(jeLozinkaIspravna("lozinka1")).toBe(false);
    expect(jeLozinkaIspravna("Lozinka")).toBe(false);
    expect(jeLozinkaIspravna("Loz1")).toBe(false);
  });
});
