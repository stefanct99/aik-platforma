import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import { saveOnboardingStep1 } from "./business";
import {
  createRecurringInvoice,
  generisiPonavljajuceFakture,
  postaviStatusPonavljajuce,
  validirajPonavljajucuPodatke,
} from "./recurring-invoices";

// Integracioni testovi (aik_test), isti obrazac kao invoices.test.ts - svaki test pravi sopstvenog
// korisnika/firmu/klijenta i briše sve na kraju.

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

async function napraviKlijenta(businessId: string, podaci: Partial<{ billingEmail: string | null }> = {}) {
  return prisma.client.create({
    data: {
      businessId,
      name: "Test klijent",
      billingEmail: podaci.billingEmail === undefined ? "klijent@primer.rs" : podaci.billingEmail,
      address: "Test adresa 1",
    },
  });
}

afterAll(async () => {
  await prisma.recurringInvoice.deleteMany({ where: { business: { ownerId: { in: napravljeniKorisnici } } } });
  await prisma.invoice.deleteMany({ where: { business: { ownerId: { in: napravljeniKorisnici } } } });
  await prisma.client.deleteMany({ where: { business: { ownerId: { in: napravljeniKorisnici } } } });
  await prisma.business.deleteMany({ where: { ownerId: { in: napravljeniKorisnici } } });
  await prisma.user.deleteMany({ where: { id: { in: napravljeniKorisnici } } });
});

describe("validirajPonavljajucuPodatke", () => {
  it("klijent bez podrazumevane cene ne može na auto", () => {
    const errors = validirajPonavljajucuPodatke(
      { clientId: "c1", desc: "Usluga", amount: null, dayOfMonth: 1, startDate: new Date(), endDate: null, mode: "auto" },
      { billingEmail: "a@b.rs" },
    );
    expect(errors.mode).toBeDefined();
  });

  it("klijent bez mejla ne može na auto", () => {
    const errors = validirajPonavljajucuPodatke(
      { clientId: "c1", desc: "Usluga", amount: 1000, dayOfMonth: 1, startDate: new Date(), endDate: null, mode: "auto" },
      { billingEmail: null },
    );
    expect(errors.mode).toBeDefined();
  });

  it("ispravni podaci na ask prolaze bez greške", () => {
    const errors = validirajPonavljajucuPodatke(
      { clientId: "c1", desc: null, amount: null, dayOfMonth: 15, startDate: new Date(), endDate: null, mode: "ask" },
      { billingEmail: null },
    );
    expect(errors).toEqual({});
  });

  it("dan u mesecu van opsega 1-31 je greška", () => {
    const errors = validirajPonavljajucuPodatke(
      { clientId: "c1", desc: null, amount: null, dayOfMonth: 32, startDate: new Date(), endDate: null, mode: "ask" },
      null,
    );
    expect(errors.dayOfMonth).toBeDefined();
  });
});

describe("generisiPonavljajuceFakture", () => {
  it("mode ask pravi SAMO nacrt, ne šalje", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const klijent = await napraviKlijenta(biznis.id, { billingEmail: null });
    const r = await createRecurringInvoice(korisnik.id, {
      clientId: klijent.id,
      desc: "Usluga",
      amount: 10000,
      dayOfMonth: 1,
      startDate: new Date("2026-11-01T00:00:00.000Z"),
      endDate: null,
      mode: "ask",
    });
    expect(r.nextDate.toISOString()).toBe("2026-11-01T00:00:00.000Z");

    const rez = await generisiPonavljajuceFakture(korisnik.id, new Date("2026-11-01T00:00:00.000Z"));
    expect(rez).toHaveLength(1);
    expect(rez[0].nacin).toBe("nacrt");

    const faktura = await prisma.invoice.findUniqueOrThrow({ where: { id: rez[0].invoiceId } });
    expect(faktura.status).toBe("nacrt");
  });

  it("mode auto pravi fakturu i odmah je šalje (isti tok kao ručno slanje)", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const klijent = await napraviKlijenta(biznis.id, { billingEmail: "klijent@primer.rs" });
    await createRecurringInvoice(korisnik.id, {
      clientId: klijent.id,
      desc: "Održavanje",
      amount: 240000,
      dayOfMonth: 28,
      startDate: new Date("2026-10-28T00:00:00.000Z"),
      endDate: null,
      mode: "auto",
    });

    const rez = await generisiPonavljajuceFakture(korisnik.id, new Date("2026-10-28T00:00:00.000Z"));
    expect(rez).toHaveLength(1);
    expect(rez[0].nacin).toBe("poslata");

    const faktura = await prisma.invoice.findUniqueOrThrow({ where: { id: rez[0].invoiceId } });
    expect(faktura.status).toBe("poslata");
  });

  it("drugo pokretanje istog dana ne pravi duplikat (sledeći ciklus je u budućnosti)", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const klijent = await napraviKlijenta(biznis.id);
    await createRecurringInvoice(korisnik.id, {
      clientId: klijent.id,
      desc: "Usluga",
      amount: 5000,
      dayOfMonth: 1,
      startDate: new Date("2026-11-01T00:00:00.000Z"),
      endDate: null,
      mode: "ask",
    });

    const prvi = await generisiPonavljajuceFakture(korisnik.id, new Date("2026-11-01T00:00:00.000Z"));
    expect(prvi).toHaveLength(1);

    const drugi = await generisiPonavljajuceFakture(korisnik.id, new Date("2026-11-01T00:00:00.000Z"));
    expect(drugi).toHaveLength(0);

    const brojFaktura = await prisma.invoice.count({ where: { clientId: klijent.id } });
    expect(brojFaktura).toBe(1);
  });

  it("pauzirana ponavljajuća faktura se ne generiše", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const klijent = await napraviKlijenta(biznis.id);
    const r = await createRecurringInvoice(korisnik.id, {
      clientId: klijent.id,
      desc: "Usluga",
      amount: 5000,
      dayOfMonth: 1,
      startDate: new Date("2026-11-01T00:00:00.000Z"),
      endDate: null,
      mode: "ask",
    });
    await postaviStatusPonavljajuce(korisnik.id, r.id, "pauzirana");

    const rez = await generisiPonavljajuceFakture(korisnik.id, new Date("2026-11-01T00:00:00.000Z"));
    expect(rez).toHaveLength(0);
  });
});
