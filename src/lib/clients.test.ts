import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import { saveOnboardingStep1 } from "./business";
import { createInvoiceWithHistory } from "./invoices";
import {
  createClient,
  getClientsForUser,
  imaFaktura,
  removeOrArchiveClient,
  updateClient,
  validirajKlijentaPodatke,
  type KlijentPodaci,
} from "./clients";

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
  const biznis = await prisma.business.findFirstOrThrow({ where: { ownerId: korisnik.id } });
  return { korisnik, biznis };
}

afterAll(async () => {
  await prisma.invoice.deleteMany({ where: { business: { ownerId: { in: napravljeniKorisnici } } } });
  await prisma.client.deleteMany({ where: { business: { ownerId: { in: napravljeniKorisnici } } } });
  await prisma.business.deleteMany({ where: { ownerId: { in: napravljeniKorisnici } } });
  await prisma.user.deleteMany({ where: { id: { in: napravljeniKorisnici } } });
});

describe("createClient (Korak 8b ispravka 2026-11-25: naziv i adresa obavezni, ostalo opciono)", () => {
  it("čuva klijenta sa samo nazivom i adresom (sve ostalo prazno)", async () => {
    const { korisnik } = await napraviKorisnikaSaFirmom();
    const klijent = await createClient(korisnik.id, {
      name: "Minimalan klijent",
      billingEmail: undefined,
      country: "",
      pib: undefined,
      address: "Neka ulica 5, Beograd",
      defaultCurrency: "EUR",
      defaultLang: "sr",
      defaultDueDays: 7,
    });
    expect(klijent.billingEmail).toBeNull();
    expect(klijent.pib).toBeNull();
    expect(klijent.address).toBe("Neka ulica 5, Beograd");
  });

  it("dozvoljava dva klijenta BEZ PIB-a u istoj firmi (nema jedinstvenosti za prazan PIB)", async () => {
    const { korisnik } = await napraviKorisnikaSaFirmom();
    const osnova = {
      billingEmail: undefined,
      country: "Srbija",
      address: "Adresa",
      defaultCurrency: "EUR" as const,
      defaultLang: "sr" as const,
      defaultDueDays: 7,
    };
    const prvi = await createClient(korisnik.id, { ...osnova, name: "Prvi bez PIB-a", pib: undefined });
    const drugi = await createClient(korisnik.id, { ...osnova, name: "Drugi bez PIB-a", pib: undefined });
    expect(prvi.id).not.toBe(drugi.id);
    expect(prvi.pib).toBeNull();
    expect(drugi.pib).toBeNull();
  });
});

describe("removeOrArchiveClient (spec 3.3/7.6)", () => {
  it("briše klijenta bez faktura", async () => {
    const { korisnik } = await napraviKorisnikaSaFirmom();
    const klijent = await createClient(korisnik.id, {
      name: "Bez faktura",
      billingEmail: "a@primer.rs",
      country: "Srbija",
      address: "Test ulica 1, Beograd",
      defaultCurrency: "EUR",
      defaultLang: "sr",
      defaultDueDays: 7,
    });
    const rezultat = await removeOrArchiveClient(korisnik.id, klijent.id);
    expect(rezultat.nacin).toBe("obrisan");
    expect(await prisma.client.findUnique({ where: { id: klijent.id } })).toBeNull();
  });

  it("arhivira (ne briše) klijenta koji ima fakture", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const klijent = await createClient(korisnik.id, {
      name: "Sa fakturom",
      billingEmail: "b@primer.rs",
      country: "Srbija",
      address: "Test ulica 1, Beograd",
      defaultCurrency: "EUR",
      defaultLang: "sr",
      defaultDueDays: 7,
    });
    await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-01-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });

    expect(await imaFaktura(klijent.id)).toBe(true);
    const rezultat = await removeOrArchiveClient(korisnik.id, klijent.id);
    expect(rezultat.nacin).toBe("arhiviran");

    const ucitan = await prisma.client.findUnique({ where: { id: klijent.id } });
    expect(ucitan?.archived).toBe(true);
  });

  it("arhivirani klijent se ne pojavljuje u podrazumevanoj listi, ali ostaje dohvatljiv", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const klijent = await createClient(korisnik.id, {
      name: "Za arhivu",
      billingEmail: "c@primer.rs",
      country: "Srbija",
      address: "Test ulica 1, Beograd",
      defaultCurrency: "EUR",
      defaultLang: "sr",
      defaultDueDays: 7,
    });
    await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-01-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    await removeOrArchiveClient(korisnik.id, klijent.id);

    const lista = await getClientsForUser(korisnik.id);
    expect(lista.find((k) => k.id === klijent.id)).toBeUndefined();

    const saArhiviranim = await getClientsForUser(korisnik.id, true);
    expect(saArhiviranim.find((k) => k.id === klijent.id)).toBeDefined();
  });

  it("izolacija: korisnik A ne može da obriše/arhivira klijenta korisnika B", async () => {
    const a = await napraviKorisnikaSaFirmom();
    const b = await napraviKorisnikaSaFirmom();
    const klijentB = await createClient(b.korisnik.id, {
      name: "Klijent B",
      billingEmail: "d@primer.rs",
      country: "Srbija",
      address: "Test ulica 1, Beograd",
      defaultCurrency: "EUR",
      defaultLang: "sr",
      defaultDueDays: 7,
    });
    await expect(removeOrArchiveClient(a.korisnik.id, klijentB.id)).rejects.toThrow();
    expect(await prisma.client.findUnique({ where: { id: klijentB.id } })).not.toBeNull();
  });
});

describe("updateClient", () => {
  it("izolacija: korisnik A ne može da izmeni klijenta korisnika B", async () => {
    const a = await napraviKorisnikaSaFirmom();
    const b = await napraviKorisnikaSaFirmom();
    const klijentB = await createClient(b.korisnik.id, {
      name: "Original",
      billingEmail: "e@primer.rs",
      country: "Srbija",
      address: "Test ulica 1, Beograd",
      defaultCurrency: "EUR",
      defaultLang: "sr",
      defaultDueDays: 7,
    });
    await expect(
      updateClient(a.korisnik.id, klijentB.id, {
        name: "Izmenjeno",
        billingEmail: "e@primer.rs",
        country: "Srbija",
        address: "Test ulica 1, Beograd",
        defaultCurrency: "EUR",
        defaultLang: "sr",
        defaultDueDays: 7,
      }),
    ).rejects.toThrow();

    const ucitan = await prisma.client.findUnique({ where: { id: klijentB.id } });
    expect(ucitan?.name).toBe("Original");
  });
});

describe("validirajKlijentaPodatke (Korak 8b ispravka 2026-11-25: naziv i adresa obavezni, ostalo opciono)", () => {
  const osnova: KlijentPodaci = {
    name: "Test klijent",
    billingEmail: "test@primer.rs",
    country: "Srbija",
    address: "Test ulica 1, Beograd",
    defaultCurrency: "EUR",
    defaultLang: "sr",
    defaultDueDays: 7,
  };

  it("prolazi sa samo nazivom i adresom (sve ostalo prazno)", () => {
    const greske = validirajKlijentaPodatke({
      ...osnova,
      billingEmail: undefined,
      country: "",
      pib: undefined,
    });
    expect(Object.keys(greske)).toHaveLength(0);
  });

  it("blokira kad nedostaje naziv", () => {
    const greske = validirajKlijentaPodatke({ ...osnova, name: "" });
    expect(greske.name).toBeTruthy();
  });

  it("blokira kad nedostaje adresa", () => {
    const greske = validirajKlijentaPodatke({ ...osnova, address: "" });
    expect(greske.address).toBeTruthy();
  });

  it("ne zahteva mejl ni za domaćeg ni za inostranog klijenta", () => {
    expect(validirajKlijentaPodatke({ ...osnova, defaultCurrency: "EUR", billingEmail: undefined }).billingEmail).toBeUndefined();
    expect(validirajKlijentaPodatke({ ...osnova, defaultCurrency: "RSD", billingEmail: undefined }).billingEmail).toBeUndefined();
  });

  it("validira format mejla SAMO kad je nešto uneto", () => {
    expect(validirajKlijentaPodatke({ ...osnova, billingEmail: "nije-mejl" }).billingEmail).toBeTruthy();
    expect(validirajKlijentaPodatke({ ...osnova, billingEmail: "ok@primer.rs" }).billingEmail).toBeUndefined();
  });

  it("ne zahteva PIB ni za domaćeg ni za inostranog klijenta - prazan PIB nije greška", () => {
    expect(validirajKlijentaPodatke({ ...osnova, defaultCurrency: "EUR", pib: undefined }).pib).toBeUndefined();
    expect(validirajKlijentaPodatke({ ...osnova, defaultCurrency: "RSD", pib: undefined }).pib).toBeUndefined();
  });

  it("proverava ispravnost PIB-a (ISO 7064 MOD 11,10) ČIM je unet, bez obzira na valutu", () => {
    expect(validirajKlijentaPodatke({ ...osnova, defaultCurrency: "EUR", pib: "103445380" }).pib).toBeTruthy();
    expect(validirajKlijentaPodatke({ ...osnova, defaultCurrency: "RSD", pib: "103445380" }).pib).toBeTruthy();
  });

  it("prihvata ispravan PIB", () => {
    const greske = validirajKlijentaPodatke({ ...osnova, pib: "103445385" });
    expect(greske.pib).toBeUndefined();
  });
});
