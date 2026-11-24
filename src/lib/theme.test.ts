import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import {
  isValidTema,
  isValidJezik,
  isValidFormatDatuma,
  updateUserTheme,
  updateUserJezikIFormat,
} from "./theme";

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

describe("isValidJezik / isValidFormatDatuma (Korak 7, Jezik i izgled)", () => {
  it("jezik prihvata samo sr-lat/sr-cir/en", () => {
    expect(isValidJezik("sr-lat")).toBe(true);
    expect(isValidJezik("sr-cir")).toBe(true);
    expect(isValidJezik("en")).toBe(true);
    expect(isValidJezik("fr")).toBe(false);
    expect(isValidJezik(undefined)).toBe(false);
  });

  it("format datuma prihvata samo dmy/iso", () => {
    expect(isValidFormatDatuma("dmy")).toBe(true);
    expect(isValidFormatDatuma("iso")).toBe(true);
    expect(isValidFormatDatuma("ymd")).toBe(false);
    expect(isValidFormatDatuma(null)).toBe(false);
  });
});

describe("updateUserJezikIFormat", () => {
  it("podrazumevane vrednosti novog korisnika su 'sr-lat' i 'dmy'", async () => {
    const korisnik = await napraviKorisnika();
    expect(korisnik.jezik).toBe("sr-lat");
    expect(korisnik.formatDatuma).toBe("dmy");
  });

  it("čuva izabran jezik i format datuma za korisnika", async () => {
    const korisnik = await napraviKorisnika();
    await updateUserJezikIFormat(korisnik.id, "en", "iso");

    const ponovoUcitan = await prisma.user.findUnique({ where: { id: korisnik.id } });
    expect(ponovoUcitan?.jezik).toBe("en");
    expect(ponovoUcitan?.formatDatuma).toBe("iso");
  });

  it("izolacija: promena kod korisnika A ne menja podešavanje korisnika B", async () => {
    const korisnikA = await napraviKorisnika();
    const korisnikB = await napraviKorisnika();

    await updateUserJezikIFormat(korisnikA.id, "sr-cir", "iso");

    const b = await prisma.user.findUnique({ where: { id: korisnikB.id } });
    expect(b?.jezik).toBe("sr-lat");
    expect(b?.formatDatuma).toBe("dmy");
  });
});
