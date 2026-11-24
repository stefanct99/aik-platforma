import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import { saveOnboardingStep1 } from "./business";
import { addAccount } from "./bank-accounts";
import { getNotificationSettings } from "./notification-settings";
import { AdminNalogNeMozeDaSeObriseError, obrisiNalogKorisnika } from "./account-deletion";

const napravljeniKorisnici: string[] = [];

function nasumicniPib() {
  return String(Math.floor(100000000 + Math.random() * 899999999));
}

afterAll(async () => {
  // Većina korisnika u ovom fajlu se briše samom funkcijom koja se testira - ovo je samo za slučaj da
  // neki test padne pre nego što stigne do brisanja, da ne ostane smeće u aik_test.
  await prisma.business.deleteMany({ where: { ownerId: { in: napravljeniKorisnici } } });
  await prisma.user.deleteMany({ where: { id: { in: napravljeniKorisnici } } });
});

describe("obrisiNalogKorisnika", () => {
  it("briše korisnika, firmu, račune, obaveštenja i pokušaje prijave bez traga", async () => {
    const email = `test-${randomUUID()}@primer.rs`;
    const korisnik = await prisma.user.create({ data: { id: randomUUID(), name: "Test", email } });
    napravljeniKorisnici.push(korisnik.id);

    await saveOnboardingStep1(korisnik.id, {
      ownerName: "Test",
      name: "Firma za brisanje",
      pib: nasumicniPib(),
      mb: "21212121",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2024-01-01"),
    });
    const racun = await addAccount(korisnik.id, {
      type: "RSD",
      currency: "RSD",
      bank: "Banka",
      number: "160-0000123456-54",
      isDefault: true,
    });
    await getNotificationSettings(korisnik.id);
    await prisma.loginAttempt.create({ data: { email, failedCount: 3 } });

    await obrisiNalogKorisnika(korisnik.id);

    expect(await prisma.user.findUnique({ where: { id: korisnik.id } })).toBeNull();
    expect(await prisma.business.findFirst({ where: { ownerId: korisnik.id } })).toBeNull();
    expect(await prisma.bankAccount.findUnique({ where: { id: racun.id } })).toBeNull();
    expect(await prisma.notificationSettings.findUnique({ where: { userId: korisnik.id } })).toBeNull();
    expect(await prisma.loginAttempt.findUnique({ where: { email } })).toBeNull();
  });

  it("admin nalog se ne briše, baca grešku", async () => {
    const korisnik = await prisma.user.create({
      data: { id: randomUUID(), name: "Admin", email: `admin-${randomUUID()}@primer.rs`, role: "admin" },
    });
    napravljeniKorisnici.push(korisnik.id);

    await expect(obrisiNalogKorisnika(korisnik.id)).rejects.toThrow(AdminNalogNeMozeDaSeObriseError);

    expect(await prisma.user.findUnique({ where: { id: korisnik.id } })).not.toBeNull();
  });

  it("izolacija: brisanje korisnika A ne dira firmu korisnika B", async () => {
    const korisnikA = await prisma.user.create({
      data: { id: randomUUID(), name: "A", email: `test-${randomUUID()}@primer.rs` },
    });
    const korisnikB = await prisma.user.create({
      data: { id: randomUUID(), name: "B", email: `test-${randomUUID()}@primer.rs` },
    });
    napravljeniKorisnici.push(korisnikB.id);

    await saveOnboardingStep1(korisnikB.id, {
      ownerName: "B",
      name: "Firma B ostaje",
      pib: nasumicniPib(),
      mb: "22222233",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2024-01-01"),
    });

    await obrisiNalogKorisnika(korisnikA.id);

    const firmaB = await prisma.business.findFirst({ where: { ownerId: korisnikB.id } });
    expect(firmaB?.name).toBe("Firma B ostaje");
  });
});
