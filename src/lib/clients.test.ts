import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import { saveOnboardingStep1 } from "./business";
import { createInvoiceWithHistory } from "./invoices";
import { createClient, getClientsForUser, imaFaktura, removeOrArchiveClient, updateClient } from "./clients";

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

describe("removeOrArchiveClient (spec 3.3/7.6)", () => {
  it("briše klijenta bez faktura", async () => {
    const { korisnik } = await napraviKorisnikaSaFirmom();
    const klijent = await createClient(korisnik.id, {
      name: "Bez faktura",
      billingEmail: "a@primer.rs",
      country: "Srbija",
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
      defaultCurrency: "EUR",
      defaultLang: "sr",
      defaultDueDays: 7,
    });
    await expect(
      updateClient(a.korisnik.id, klijentB.id, {
        name: "Izmenjeno",
        billingEmail: "e@primer.rs",
        country: "Srbija",
        defaultCurrency: "EUR",
        defaultLang: "sr",
        defaultDueDays: 7,
      }),
    ).rejects.toThrow();

    const ucitan = await prisma.client.findUnique({ where: { id: klijentB.id } });
    expect(ucitan?.name).toBe("Original");
  });
});
