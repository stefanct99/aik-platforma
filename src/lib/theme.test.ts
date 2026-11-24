import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import { isValidTema, updateUserTheme } from "./theme";

// Integracioni testovi (Korak 4b): povezuju se na test bazu (aik_test), isto kao src/lib/business.test.ts.

const napravljeniKorisnici: string[] = [];

async function napraviKorisnika() {
  const korisnik = await prisma.user.create({
    data: { id: randomUUID(), name: "Test korisnik", email: `test-${randomUUID()}@primer.rs` },
  });
  napravljeniKorisnici.push(korisnik.id);
  return korisnik;
}

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: napravljeniKorisnici } } });
});

describe("isValidTema", () => {
  it("prihvata samo svetli/tamni/sistem", () => {
    expect(isValidTema("svetli")).toBe(true);
    expect(isValidTema("tamni")).toBe(true);
    expect(isValidTema("sistem")).toBe(true);
    expect(isValidTema("dark")).toBe(false);
    expect(isValidTema(undefined)).toBe(false);
    expect(isValidTema(null)).toBe(false);
    expect(isValidTema("")).toBe(false);
  });
});

describe("updateUserTheme", () => {
  it("podrazumevana tema novog korisnika je 'sistem'", async () => {
    const korisnik = await napraviKorisnika();
    expect(korisnik.theme).toBe("sistem");
  });

  it("čuva izabranu temu za korisnika", async () => {
    const korisnik = await napraviKorisnika();
    await updateUserTheme(korisnik.id, "tamni");

    const ponovoUcitan = await prisma.user.findUnique({ where: { id: korisnik.id } });
    expect(ponovoUcitan?.theme).toBe("tamni");
  });

  it("izolacija: promena teme korisnika A ne menja temu korisnika B", async () => {
    const korisnikA = await napraviKorisnika();
    const korisnikB = await napraviKorisnika();

    await updateUserTheme(korisnikA.id, "tamni");

    const b = await prisma.user.findUnique({ where: { id: korisnikB.id } });
    expect(b?.theme).toBe("sistem");
  });
});
