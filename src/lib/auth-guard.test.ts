import { describe, expect, it } from "vitest";
import { trebaPreusmeravanjeNaPrijavu } from "./auth-guard";

describe("trebaPreusmeravanjeNaPrijavu", () => {
  it("preusmerava neprijavljenog korisnika", () => {
    expect(trebaPreusmeravanjeNaPrijavu(null, true)).toBe(true);
    expect(trebaPreusmeravanjeNaPrijavu(undefined, true)).toBe(true);
  });

  it("ne preusmerava običnog prijavljenog korisnika", () => {
    const sesija = { user: { email: "stefan@primer.rs", role: "user" } };
    expect(trebaPreusmeravanjeNaPrijavu(sesija, false)).toBe(false);
  });

  it("preusmerava admina van razvojnog režima", () => {
    const sesija = { user: { email: "admin@primer.rs", role: "admin" } };
    expect(trebaPreusmeravanjeNaPrijavu(sesija, false)).toBe(true);
  });

  it("ne preusmerava admina u razvojnom režimu", () => {
    const sesija = { user: { email: "admin@primer.rs", role: "admin" } };
    expect(trebaPreusmeravanjeNaPrijavu(sesija, true)).toBe(false);
  });
});
