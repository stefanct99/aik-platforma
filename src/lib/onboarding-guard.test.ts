import { describe, expect, it } from "vitest";
import { trebaPreusmeravanjeNaOnboarding, trebaPreusmeravanjeNaPocetnu } from "./onboarding-guard";

describe("trebaPreusmeravanjeNaOnboarding", () => {
  it("preusmerava kad onboarding nije završen", () => {
    expect(trebaPreusmeravanjeNaOnboarding(null)).toBe(true);
    expect(trebaPreusmeravanjeNaOnboarding(undefined)).toBe(true);
  });

  it("ne preusmerava kad je onboarding završen", () => {
    expect(trebaPreusmeravanjeNaOnboarding(new Date())).toBe(false);
  });
});

describe("trebaPreusmeravanjeNaPocetnu", () => {
  it("preusmerava na početnu kad je onboarding već završen", () => {
    expect(trebaPreusmeravanjeNaPocetnu(new Date())).toBe(true);
  });

  it("ne preusmerava kad onboarding nije završen", () => {
    expect(trebaPreusmeravanjeNaPocetnu(null)).toBe(false);
    expect(trebaPreusmeravanjeNaPocetnu(undefined)).toBe(false);
  });
});
