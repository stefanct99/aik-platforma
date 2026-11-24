import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import { getSessionsForUser, logoutSession } from "./devices";

const napravljeniKorisnici: string[] = [];

async function napraviKorisnika() {
  const korisnik = await prisma.user.create({
    data: { id: randomUUID(), name: "Test", email: `test-${randomUUID()}@primer.rs` },
  });
  napravljeniKorisnici.push(korisnik.id);
  return korisnik;
}

async function napraviSesiju(userId: string, userAgent: string) {
  return prisma.session.create({
    data: {
      id: randomUUID(),
      userId,
      token: randomUUID(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      userAgent,
    },
  });
}

afterAll(async () => {
  await prisma.session.deleteMany({ where: { userId: { in: napravljeniKorisnici } } });
  await prisma.user.deleteMany({ where: { id: { in: napravljeniKorisnici } } });
});

describe("getSessionsForUser", () => {
  it("izolacija: ne vraća sesije drugog korisnika", async () => {
    const korisnikA = await napraviKorisnika();
    const korisnikB = await napraviKorisnika();
    await napraviSesiju(korisnikA.id, "UA-A");
    const sesijaB = await napraviSesiju(korisnikB.id, "UA-B");

    const sesijeA = await getSessionsForUser(korisnikA.id);
    expect(sesijeA.find((s) => s.id === sesijaB.id)).toBeUndefined();
  });
});

describe("logoutSession", () => {
  it("gasi drugu sesiju istog korisnika", async () => {
    const korisnik = await napraviKorisnika();
    const trenutna = await napraviSesiju(korisnik.id, "UA-trenutna");
    const druga = await napraviSesiju(korisnik.id, "UA-druga");

    await logoutSession(korisnik.id, druga.id, trenutna.token);

    const preostale = await getSessionsForUser(korisnik.id);
    expect(preostale.map((s) => s.id)).toEqual([trenutna.id]);
  });

  it("ne gasi sopstvenu trenutnu sesiju", async () => {
    const korisnik = await napraviKorisnika();
    const trenutna = await napraviSesiju(korisnik.id, "UA-trenutna");

    await logoutSession(korisnik.id, trenutna.id, trenutna.token);

    const preostale = await getSessionsForUser(korisnik.id);
    expect(preostale.map((s) => s.id)).toEqual([trenutna.id]);
  });

  it("izolacija: korisnik A ne može da odjavi sesiju korisnika B", async () => {
    const korisnikA = await napraviKorisnika();
    const korisnikB = await napraviKorisnika();
    const sesijaB = await napraviSesiju(korisnikB.id, "UA-B");

    await logoutSession(korisnikA.id, sesijaB.id, "neki-drugi-token");

    const sesijeB = await getSessionsForUser(korisnikB.id);
    expect(sesijeB.map((s) => s.id)).toEqual([sesijaB.id]);
  });
});
