import { describe, expect, it } from "vitest";
import { config } from "./proxy";

// Zaštita ruta (Korak 4): svaka nova sekcija okvira aplikacije mora biti u matcher-u proxy-ja, inače
// middleware ne proverava prijavu/onboarding za nju. Ovaj test ne dozvoljava da se nova ruta doda u
// src/app/(app)/ a zaboravi ovde.
describe("proxy matcher", () => {
  it("pokriva sve rute okvira aplikacije", () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining([
        "/pocetna",
        "/onboarding",
        "/fakture",
        "/knjiga-prihoda",
        "/kalendar",
        "/porez",
        "/mejlovi-banke",
        "/ai",
        "/podesavanja",
        "/podesavanja/:path*",
      ]),
    );
  });
});
