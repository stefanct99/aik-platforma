import { describe, expect, it } from "vitest";
import { suNazivIliPibPromenjeni } from "./profil-promene";

describe("suNazivIliPibPromenjeni", () => {
  it("false kad se ništa nije promenilo", () => {
    expect(
      suNazivIliPibPromenjeni(
        { naziv: "Firma", pib: "100002887" },
        { naziv: "Firma", pib: "100002887" },
      ),
    ).toBe(false);
  });

  it("true kad se promeni samo naziv", () => {
    expect(
      suNazivIliPibPromenjeni(
        { naziv: "Nova firma", pib: "100002887" },
        { naziv: "Firma", pib: "100002887" },
      ),
    ).toBe(true);
  });

  it("true kad se promeni samo PIB", () => {
    expect(
      suNazivIliPibPromenjeni(
        { naziv: "Firma", pib: "100001958" },
        { naziv: "Firma", pib: "100002887" },
      ),
    ).toBe(true);
  });

  it("true kad se promene oba", () => {
    expect(
      suNazivIliPibPromenjeni(
        { naziv: "Nova firma", pib: "100001958" },
        { naziv: "Firma", pib: "100002887" },
      ),
    ).toBe(true);
  });
});
