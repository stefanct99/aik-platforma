import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import { saveOnboardingStep1 } from "./business";
import { addAccount } from "./bank-accounts";
import { napraviIzvozPodataka } from "./data-export";

const napravljeniKorisnici: string[] = [];

function nasumicniPib() {
  return String(Math.floor(100000000 + Math.random() * 899999999));
}

afterAll(async () => {
  await prisma.bankAccount.deleteMany({ where: { business: { ownerId: { in: napravljeniKorisnici } } } });
  await prisma.notificationSettings.deleteMany({ where: { userId: { in: napravljeniKorisnici } } });
  await prisma.business.deleteMany({ where: { ownerId: { in: napravljeniKorisnici } } });
  await prisma.user.deleteMany({ where: { id: { in: napravljeniKorisnici } } });
});

describe("napraviIzvozPodataka", () => {
  it("pravi ZIP koji sadrži profil firme i dodati račun", async () => {
    const korisnik = await prisma.user.create({
      data: { id: randomUUID(), name: "Test Izvoz", email: `test-${randomUUID()}@primer.rs` },
    });
    napravljeniKorisnici.push(korisnik.id);

    await saveOnboardingStep1(korisnik.id, {
      ownerName: "Test Izvoz",
      name: "Firma za izvoz",
      pib: nasumicniPib(),
      mb: "18181818",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2024-01-01"),
    });
    await addAccount(korisnik.id, {
      type: "RSD",
      currency: "RSD",
      bank: "Banka Izvoz",
      number: "160-0000123456-54",
      isDefault: true,
    });

    const zip = await napraviIzvozPodataka(korisnik.id);
    expect(zip.readUInt32LE(0)).toBe(0x04034b50);
    expect(zip.includes("profil.json")).toBe(true);
    expect(zip.includes("racuni.json")).toBe(true);
    expect(zip.includes("Firma za izvoz")).toBe(true);
    expect(zip.includes("Banka Izvoz")).toBe(true);
  });

  it("izolacija: izvoz korisnika A ne sadrži podatke korisnika B", async () => {
    const korisnikA = await prisma.user.create({
      data: { id: randomUUID(), name: "A", email: `test-${randomUUID()}@primer.rs` },
    });
    const korisnikB = await prisma.user.create({
      data: { id: randomUUID(), name: "B", email: `test-${randomUUID()}@primer.rs` },
    });
    napravljeniKorisnici.push(korisnikA.id, korisnikB.id);

    await saveOnboardingStep1(korisnikA.id, {
      ownerName: "A",
      name: "Firma A Tajna",
      pib: nasumicniPib(),
      mb: "19191919",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2024-01-01"),
    });
    await saveOnboardingStep1(korisnikB.id, {
      ownerName: "B",
      name: "Firma B",
      pib: nasumicniPib(),
      mb: "20202020",
      delatnostCode: "6202",
      delatnostName: "Konsultantske delatnosti u vezi sa informacionom tehnologijom",
      regDate: new Date("2024-01-01"),
    });

    const izvozB = await napraviIzvozPodataka(korisnikB.id);
    expect(izvozB.includes("Firma A Tajna")).toBe(false);
  });
});
