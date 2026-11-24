import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import { saveOnboardingStep1 } from "./business";
import {
  createInvoiceWithHistory,
  getInvoiceForUser,
  markInvoicePaid,
  proveriJedinstvenostBroja,
  removeDraftInvoice,
  sendReminder,
  voidInvoice,
} from "./invoices";

// Integracioni testovi (aik_test). Svaki test pravi sopstvenog korisnika/firmu/klijenta sa nasumičnim
// podacima i briše sve na kraju.

const napravljeniKorisnici: string[] = [];

function nasumicniPib() {
  return String(Math.floor(100000000 + Math.random() * 899999999));
}

async function napraviKorisnikaSaFirmomIKlijentom() {
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
  const klijent = await prisma.client.create({
    data: { businessId: biznis.id, name: "Test klijent", billingEmail: "klijent@primer.rs" },
  });
  return { korisnik, biznis, klijent };
}

afterAll(async () => {
  await prisma.invoice.deleteMany({ where: { business: { ownerId: { in: napravljeniKorisnici } } } });
  await prisma.client.deleteMany({ where: { business: { ownerId: { in: napravljeniKorisnici } } } });
  await prisma.business.deleteMany({ where: { ownerId: { in: napravljeniKorisnici } } });
  await prisma.user.deleteMany({ where: { id: { in: napravljeniKorisnici } } });
});

describe("createInvoiceWithHistory - numeracija", () => {
  it("prva faktura u godini dobija broj 1", async () => {
    const { biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-03-10T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 10000 }],
      status: "nacrt",
    });
    expect(f.number).toBe("1/26-3");
  });

  it("druga faktura iste godine nastavlja na 2, čak i u drugom mesecu", async () => {
    const { biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-03-10T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 10000 }],
      status: "nacrt",
    });
    const f2 = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-04-05T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 10000 }],
      status: "nacrt",
    });
    expect(f2.number).toBe("2/26-4");
  });

  it("decembar na januar: brojač se vraća na 1 sledeće kalendarske godine", async () => {
    const { biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const decembarska = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-12-28T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 10000 }],
      status: "nacrt",
    });
    const januarska = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2027-01-03T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 10000 }],
      status: "nacrt",
    });
    expect(decembarska.number).toBe("1/26-12");
    expect(januarska.number).toBe("1/27-1");
  });

  it("izolacija: brojač je po firmi, ne deljen globalno", async () => {
    const a = await napraviKorisnikaSaFirmomIKlijentom();
    const b = await napraviKorisnikaSaFirmomIKlijentom();
    await createInvoiceWithHistory(a.biznis.id, {
      clientId: a.klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-05-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    const prviZaB = await createInvoiceWithHistory(b.biznis.id, {
      clientId: b.klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-05-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    expect(prviZaB.number).toBe("1/26-5");
  });

  it("odgovarajuća istorija (InvoiceEvent) za status 'placena'", async () => {
    const { biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const placenaDatum = new Date("2026-06-20T00:00:00.000Z");
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-06-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 2, price: 5000 }],
      status: "placena",
      sentAt: new Date("2026-06-01T00:00:00.000Z"),
      paidDate: placenaDatum,
    });
    const dogadjaji = await prisma.invoiceEvent.findMany({ where: { invoiceId: f.id } });
    expect(dogadjaji.map((d) => d.tip).sort()).toEqual(["napravljena", "placena", "poslata"].sort());
    const uplata = await prisma.income.findFirst({ where: { invoiceId: f.id } });
    expect(uplata?.amount).toBe(10000);
    expect(uplata?.source).toBe("rucno");
    expect(uplata?.kind).toBe("devizni");
  });
});

describe("proveriJedinstvenostBroja", () => {
  it("prijavljuje broj kao zauzet/slobodan ispravno", async () => {
    const { biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-07-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    expect(await proveriJedinstvenostBroja(biznis.id, f.number)).toBe(false);
    expect(await proveriJedinstvenostBroja(biznis.id, f.number, f.id)).toBe(true);
    expect(await proveriJedinstvenostBroja(biznis.id, "999/26-1")).toBe(true);
  });
});

describe("markInvoicePaid", () => {
  it("pravi uplatu sa izvorom 'rucno' i dinarskim vrstom za RSD fakturu", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "RSD",
      lang: "sr",
      issueDate: new Date("2026-08-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 600000 }],
      status: "poslata",
      sentAt: new Date("2026-08-01T00:00:00.000Z"),
    });
    const datumUplate = new Date("2026-08-05T00:00:00.000Z");
    const rezultat = await markInvoicePaid(korisnik.id, f.id, datumUplate);
    expect(rezultat.ok).toBe(true);

    const ucitana = await getInvoiceForUser(korisnik.id, f.id);
    expect(ucitana?.status).toBe("placena");
    expect(ucitana?.paidDate?.toISOString()).toBe(datumUplate.toISOString());

    const uplata = await prisma.income.findFirst({ where: { invoiceId: f.id } });
    expect(uplata?.kind).toBe("dinarski");
    expect(uplata?.rate).toBeNull();
    expect(uplata?.amountRsd).toBeNull();
  });

  it("odbija označavanje stornirane fakture kao plaćene", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-08-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "stornirana",
      sentAt: new Date("2026-08-01T00:00:00.000Z"),
      voidedAt: new Date("2026-08-03T00:00:00.000Z"),
    });
    const rezultat = await markInvoicePaid(korisnik.id, f.id, new Date());
    expect(rezultat.ok).toBe(false);
  });

  it("izolacija: korisnik A ne može da označi fakturu korisnika B kao plaćenu", async () => {
    const a = await napraviKorisnikaSaFirmomIKlijentom();
    const b = await napraviKorisnikaSaFirmomIKlijentom();
    const fB = await createInvoiceWithHistory(b.biznis.id, {
      clientId: b.klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-08-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "poslata",
      sentAt: new Date("2026-08-01T00:00:00.000Z"),
    });
    const rezultat = await markInvoicePaid(a.korisnik.id, fB.id, new Date());
    expect(rezultat.ok).toBe(false);

    const ucitanaKaoB = await getInvoiceForUser(b.korisnik.id, fB.id);
    expect(ucitanaKaoB?.status).toBe("poslata");
  });
});

describe("voidInvoice (storno, spec 6.9)", () => {
  it("storno obične poslate fakture uspeva i čuva kvačicu za obaveštavanje", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-08-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "poslata",
      sentAt: new Date("2026-08-01T00:00:00.000Z"),
    });
    const rezultat = await voidInvoice(korisnik.id, f.id, true);
    expect(rezultat.ok).toBe(true);
    const ucitana = await getInvoiceForUser(korisnik.id, f.id);
    expect(ucitana?.status).toBe("stornirana");
    expect(ucitana?.voidNotifyClient).toBe(true);
  });

  it("blokira direktan storno PLAĆENE fakture (spec 6.9), traži potvrdu/objašnjenje umesto toga", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-08-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "placena",
      sentAt: new Date("2026-08-01T00:00:00.000Z"),
      paidDate: new Date("2026-08-05T00:00:00.000Z"),
    });
    const rezultat = await voidInvoice(korisnik.id, f.id, false);
    expect(rezultat.ok).toBe(false);
    if (!rezultat.ok) expect(rezultat.razlog).toBe("placena_treba_potvrdu");

    const ucitana = await getInvoiceForUser(korisnik.id, f.id);
    expect(ucitana?.status).toBe("placena");
  });

  it("ne dozvoljava dvostruki storno", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-08-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "stornirana",
      sentAt: new Date("2026-08-01T00:00:00.000Z"),
      voidedAt: new Date("2026-08-03T00:00:00.000Z"),
    });
    const rezultat = await voidInvoice(korisnik.id, f.id, false);
    expect(rezultat.ok).toBe(false);
    if (!rezultat.ok) expect(rezultat.razlog).toBe("vec_stornirana");
  });
});

describe("sendReminder", () => {
  it("beleži podsetnik u istoriji fakture", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "en",
      issueDate: new Date("2026-08-01T00:00:00.000Z"),
      dueDays: 3,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "poslata",
      sentAt: new Date("2026-08-01T00:00:00.000Z"),
    });
    const uspeh = await sendReminder(korisnik.id, f.id);
    expect(uspeh).toBe(true);
    const dogadjaji = await prisma.invoiceEvent.findMany({ where: { invoiceId: f.id } });
    expect(dogadjaji.some((d) => d.tip === "podsetnik_poslat")).toBe(true);
  });
});

describe("removeDraftInvoice - vraćanje broja (spec 8.2)", () => {
  it("vraća broj kad se obriše POSLEDNJI nacrt u toj godini", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const prva = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    expect(prva.number).toBe("1/26-9");
    const rezultat = await removeDraftInvoice(korisnik.id, prva.id);
    expect(rezultat.ok).toBe(true);

    const sledeca = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-09-02T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    expect(sledeca.number).toBe("1/26-9"); // broj je vraćen, ne "2/26-9"
  });

  it("NE vraća broj kad nacrt NIJE poslednji dodeljen (ostaje rupa)", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const prva = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-10-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-10-02T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "poslata",
      sentAt: new Date("2026-10-02T00:00:00.000Z"),
    });
    const rezultat = await removeDraftInvoice(korisnik.id, prva.id);
    expect(rezultat.ok).toBe(true);

    const treca = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-10-03T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    expect(treca.number).toBe("3/26-10"); // 1 je ostao "rupa", broj se NE vraća
  });

  it("izolacija: korisnik A ne može da obriše nacrt korisnika B", async () => {
    const a = await napraviKorisnikaSaFirmomIKlijentom();
    const b = await napraviKorisnikaSaFirmomIKlijentom();
    const fB = await createInvoiceWithHistory(b.biznis.id, {
      clientId: b.klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-08-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    const rezultat = await removeDraftInvoice(a.korisnik.id, fB.id);
    expect(rezultat.ok).toBe(false);

    const postoji = await prisma.invoice.findUnique({ where: { id: fB.id } });
    expect(postoji).not.toBeNull();
  });

  it("odbija brisanje fakture koja nije nacrt", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-08-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "poslata",
      sentAt: new Date("2026-08-01T00:00:00.000Z"),
    });
    const rezultat = await removeDraftInvoice(korisnik.id, f.id);
    expect(rezultat.ok).toBe(false);
  });
});
