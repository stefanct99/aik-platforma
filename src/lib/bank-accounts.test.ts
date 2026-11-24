import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import { saveOnboardingStep1 } from "./business";
import {
  addAccount,
  getAccountsForUser,
  removeAccount,
  updateAccount,
  validirajRacunPodatke,
} from "./bank-accounts";

// Integracioni testovi (aik_test, videti vitest.setup.ts). Svaki test pravi sopstvenog korisnika i firmu
// sa nasumičnim PIB-om, i briše sve na kraju (afterAll).

const napravljeniKorisnici: string[] = [];

function nasumicniPib() {
  return String(Math.floor(100000000 + Math.random() * 899999999));
}

async function napraviKorisnikaSaFirmom() {
  const korisnik = await prisma.user.create({
    data: { id: randomUUID(), name: "Test korisnik", email: `test-${randomUUID()}@primer.rs` },
  });
  napravljeniKorisnici.push(korisnik.id);
  await saveOnboardingStep1(korisnik.id, {
    ownerName: "Test",
    name: "Test Firma",
    pib: nasumicniPib(),
    mb: "11112222",
    delatnostCode: "6201",
    delatnostName: "Računarsko programiranje",
    regDate: new Date("2024-01-01"),
  });
  return korisnik;
}

afterAll(async () => {
  await prisma.invoice.deleteMany({
    where: { business: { ownerId: { in: napravljeniKorisnici } } },
  });
  await prisma.client.deleteMany({ where: { business: { ownerId: { in: napravljeniKorisnici } } } });
  await prisma.bankAccount.deleteMany({ where: { business: { ownerId: { in: napravljeniKorisnici } } } });
  await prisma.business.deleteMany({ where: { ownerId: { in: napravljeniKorisnici } } });
  await prisma.user.deleteMany({ where: { id: { in: napravljeniKorisnici } } });
});

describe("validirajRacunPodatke", () => {
  it("prihvata ispravan dinarski račun", () => {
    const errors = validirajRacunPodatke({
      type: "RSD",
      currency: "RSD",
      bank: "Banka Primer",
      number: "160-0000123456-54",
      isDefault: false,
    });
    expect(errors).toEqual({});
  });

  it("odbija neispravan dinarski broj računa", () => {
    const errors = validirajRacunPodatke({
      type: "RSD",
      currency: "RSD",
      bank: "Banka Primer",
      number: "160-0000123456-00",
      isDefault: false,
    });
    expect(errors.number).toBeTruthy();
  });

  it("prihvata ispravan devizni račun (IBAN + SWIFT)", () => {
    const errors = validirajRacunPodatke({
      type: "devizni",
      currency: "EUR",
      bank: "Banka Primer",
      iban: "DE89370400440532013000",
      swift: "BANKRSBG",
      isDefault: false,
    });
    expect(errors).toEqual({});
  });

  it("odbija neispravan IBAN i SWIFT", () => {
    const errors = validirajRacunPodatke({
      type: "devizni",
      currency: "EUR",
      bank: "Banka Primer",
      iban: "RS00",
      swift: "X",
      isDefault: false,
    });
    expect(errors.iban).toBeTruthy();
    expect(errors.swift).toBeTruthy();
  });
});

describe("addAccount i samo jedan podrazumevani po valuti", () => {
  it("drugi podrazumevani račun iste valute otključava prvi", async () => {
    const korisnik = await napraviKorisnikaSaFirmom();

    const prvi = await addAccount(korisnik.id, {
      type: "devizni",
      currency: "EUR",
      bank: "Prva banka",
      iban: "DE89370400440532013000",
      swift: "BANKRSBG",
      isDefault: true,
    });
    const drugi = await addAccount(korisnik.id, {
      type: "devizni",
      currency: "EUR",
      bank: "Druga banka",
      iban: "GB82WEST12345698765432",
      swift: "BANKRSBG",
      isDefault: true,
    });

    const racuni = await getAccountsForUser(korisnik.id);
    const prviOsvezen = racuni.find((r) => r.id === prvi.id);
    const drugiOsvezen = racuni.find((r) => r.id === drugi.id);
    expect(prviOsvezen?.isDefault).toBe(false);
    expect(drugiOsvezen?.isDefault).toBe(true);
  });

  it("različite valute mogu svaka imati svoj podrazumevani račun", async () => {
    const korisnik = await napraviKorisnikaSaFirmom();

    const eur = await addAccount(korisnik.id, {
      type: "devizni",
      currency: "EUR",
      bank: "Banka",
      iban: "DE89370400440532013000",
      swift: "BANKRSBG",
      isDefault: true,
    });
    const usd = await addAccount(korisnik.id, {
      type: "devizni",
      currency: "USD",
      bank: "Banka",
      iban: "GB82WEST12345698765432",
      swift: "BANKRSBG",
      isDefault: true,
    });

    const racuni = await getAccountsForUser(korisnik.id);
    expect(racuni.find((r) => r.id === eur.id)?.isDefault).toBe(true);
    expect(racuni.find((r) => r.id === usd.id)?.isDefault).toBe(true);
  });
});

describe("izolacija: korisnik A ne vidi ni ne može da izmeni/ukloni račun korisnika B", () => {
  it("getAccountsForUser korisnika A ne vraća račune korisnika B", async () => {
    const korisnikA = await napraviKorisnikaSaFirmom();
    const korisnikB = await napraviKorisnikaSaFirmom();

    await addAccount(korisnikA.id, {
      type: "RSD",
      currency: "RSD",
      bank: "Banka A",
      number: "160-0000123456-54",
      isDefault: true,
    });
    const racunB = await addAccount(korisnikB.id, {
      type: "RSD",
      currency: "RSD",
      bank: "Banka B",
      number: "160-0000123456-54",
      isDefault: true,
    });

    const racuniA = await getAccountsForUser(korisnikA.id);
    expect(racuniA.find((r) => r.id === racunB.id)).toBeUndefined();
  });

  it("updateAccount korisnika A ne menja račun korisnika B (pogrešan id se ne nalazi)", async () => {
    const korisnikA = await napraviKorisnikaSaFirmom();
    const korisnikB = await napraviKorisnikaSaFirmom();

    const racunB = await addAccount(korisnikB.id, {
      type: "RSD",
      currency: "RSD",
      bank: "Banka B",
      number: "160-0000123456-54",
      isDefault: true,
    });

    await expect(
      updateAccount(korisnikA.id, racunB.id, { bank: "Pokušaj izmene", isDefault: false }),
    ).rejects.toThrow();

    const racunNepromenjen = await prisma.bankAccount.findUnique({ where: { id: racunB.id } });
    expect(racunNepromenjen?.bank).toBe("Banka B");
  });

  it("removeAccount korisnika A ne uklanja račun korisnika B", async () => {
    const korisnikA = await napraviKorisnikaSaFirmom();
    const korisnikB = await napraviKorisnikaSaFirmom();

    const racunB = await addAccount(korisnikB.id, {
      type: "RSD",
      currency: "RSD",
      bank: "Banka B",
      number: "160-0000123456-54",
      isDefault: true,
    });

    const rezultat = await removeAccount(korisnikA.id, racunB.id);
    expect(rezultat.ok).toBe(false);

    const racunPostoji = await prisma.bankAccount.findUnique({ where: { id: racunB.id } });
    expect(racunPostoji).not.toBeNull();
  });
});

describe("removeAccount: račun u upotrebi na nacrtu fakture traži zamenu", () => {
  it("odbija uklanjanje kad postoji nacrt fakture koji koristi taj račun", async () => {
    const korisnik = await napraviKorisnikaSaFirmom();
    const racun = await addAccount(korisnik.id, {
      type: "RSD",
      currency: "RSD",
      bank: "Banka",
      number: "160-0000123456-54",
      isDefault: true,
    });
    const biznis = await prisma.business.findFirstOrThrow({ where: { ownerId: korisnik.id } });
    const klijent = await prisma.client.create({
      data: { businessId: biznis.id, name: "Test klijent", billingEmail: "k@primer.rs" },
    });
    await prisma.invoice.create({
      data: {
        businessId: biznis.id,
        clientId: klijent.id,
        number: "1/26-1",
        currency: "RSD",
        issueDate: new Date(),
        dueDays: 7,
        accountId: racun.id,
        status: "nacrt",
      },
    });

    const rezultat = await removeAccount(korisnik.id, racun.id);
    expect(rezultat.ok).toBe(false);
    if (!rezultat.ok && rezultat.razlog === "u_upotrebi") {
      expect(rezultat.fakture).toContain("1/26-1");
    }

    const racunPostoji = await prisma.bankAccount.findUnique({ where: { id: racun.id } });
    expect(racunPostoji).not.toBeNull();
  });

  it("uklanja račun koji nije u upotrebi ni na jednom nacrtu", async () => {
    const korisnik = await napraviKorisnikaSaFirmom();
    const racun = await addAccount(korisnik.id, {
      type: "RSD",
      currency: "RSD",
      bank: "Banka",
      number: "160-0000123456-54",
      isDefault: true,
    });

    const rezultat = await removeAccount(korisnik.id, racun.id);
    expect(rezultat.ok).toBe(true);

    const racunPostoji = await prisma.bankAccount.findUnique({ where: { id: racun.id } });
    expect(racunPostoji).toBeNull();
  });
});
