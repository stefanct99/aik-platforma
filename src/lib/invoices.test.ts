import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "./prisma";
import { saveOnboardingStep1 } from "./business";
import { napraviPodrazumevaniSablonPodatke } from "./invoice-templates";
import {
  createInvoiceWithHistory,
  getInvoiceForUser,
  markInvoicePaid,
  pogledajSledeciBroj,
  promeniBrojFakture,
  proveriJedinstvenostBroja,
  removeDraftInvoice,
  resendInvoice,
  sacuvajNacrt,
  sendInvoice,
  sendReminder,
  updateInvoiceWithItems,
  validirajFakturuPolja,
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
    data: { businessId: biznis.id, name: "Test klijent", billingEmail: "klijent@primer.rs", address: "Test adresa 1" },
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

describe("pogledajSledeciBroj (Korak 8b)", () => {
  it("predlaže 1 kad brojač za tu godinu još ne postoji, bez upisa", async () => {
    const { biznis } = await napraviKorisnikaSaFirmomIKlijentom();
    const predlog = await pogledajSledeciBroj(biznis.id, new Date("2026-05-10T00:00:00.000Z"));
    expect(predlog).toBe("1/26-5");
    // Pregled ne sme da rezerviše ništa - sledeća STVARNA faktura i dalje dobija 1.
    const stvarna = await createInvoiceWithHistory(biznis.id, {
      clientId: (await prisma.client.create({ data: { businessId: biznis.id, name: "K", billingEmail: "k@primer.rs", address: "Test adresa 1" } })).id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-05-10T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    expect(stvarna.number).toBe("1/26-5");
  });

  it("predlaže sledeći broj kad brojač već postoji", async () => {
    const { biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-06-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    const predlog = await pogledajSledeciBroj(biznis.id, new Date("2026-06-15T00:00:00.000Z"));
    expect(predlog).toBe("2/26-6");
  });
});

describe("validirajFakturuPolja (Korak 8b, spec 7.4/Fak19)", () => {
  it("vraća grešku za klijenta kad nije izabran", () => {
    const greske = validirajFakturuPolja({ clientId: null, items: [{ desc: "x", qty: 1, price: 100 }], dueDays: 7 });
    expect(greske.clientId).toBeTruthy();
    expect(greske.items).toBeUndefined();
  });

  it("vraća grešku za stavke kad nijedna nema opis i iznos > 0", () => {
    const greske = validirajFakturuPolja({ clientId: "c1", items: [{ desc: "", qty: 1, price: 0 }], dueDays: 7 });
    expect(greske.items).toBeTruthy();
  });

  it("prolazi kad je sve ispravno", () => {
    const greske = validirajFakturuPolja({ clientId: "c1", items: [{ desc: "Usluga", qty: 1, price: 100 }], dueDays: 7 });
    expect(Object.keys(greske)).toHaveLength(0);
  });

  it("vraća grešku za rok manji od 1 dana", () => {
    const greske = validirajFakturuPolja({ clientId: "c1", items: [{ desc: "x", qty: 1, price: 100 }], dueDays: 0 });
    expect(greske.dueDays).toBeTruthy();
  });
});

describe("sacuvajNacrt i updateInvoiceWithItems (Korak 8b)", () => {
  it("prvi poziv pravi novu fakturu (broj se rezerviše), drugi ažurira istu bez novog broja", async () => {
    const { korisnik, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const prvi = await sacuvajNacrt(korisnik.id, null, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
    });
    expect(prvi.ok).toBe(true);
    if (!prvi.ok) return;

    const drugi = await sacuvajNacrt(korisnik.id, prvi.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      dueDays: 14,
      items: [{ desc: "Usluga izmenjena", qty: 2, price: 2000 }],
    });
    expect(drugi.ok).toBe(true);
    if (!drugi.ok) return;
    expect(drugi.id).toBe(prvi.id);
    expect(drugi.broj).toBe(prvi.broj); // broj se NE menja na običnom čuvanju

    const ucitana = await getInvoiceForUser(korisnik.id, prvi.id);
    expect(ucitana?.dueDays).toBe(14);
    expect(ucitana?.items).toHaveLength(1);
    expect(ucitana?.items[0].desc).toBe("Usluga izmenjena");
    expect(ucitana?.items[0].qty).toBe(2);
  });

  it("updateInvoiceWithItems odbija izmenu plaćene ili stornirane fakture", async () => {
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
    const rezultat = await updateInvoiceWithItems(korisnik.id, f.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      dueDays: 7,
      items: [{ desc: "y", qty: 1, price: 200 }],
    });
    expect(rezultat.ok).toBe(false);
  });

  it("izolacija: korisnik A ne može da sačuva nacrt preko id-a fakture korisnika B", async () => {
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
    const rezultat = await sacuvajNacrt(a.korisnik.id, fB.id, {
      clientId: a.klijent.id,
      currency: "EUR",
      lang: "sr",
      dueDays: 7,
      items: [{ desc: "y", qty: 1, price: 200 }],
    });
    expect(rezultat.ok).toBe(false);
  });
});

describe("sendInvoice (Korak 8b, spec 8.1/6.4)", () => {
  it("prebacuje nacrt u poslata, beleži istoriju i vraća podatke za potvrdu", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 2, price: 1000 }],
      status: "nacrt",
    });
    const rezultat = await sendInvoice(korisnik.id, f.id);
    expect(rezultat.ok).toBe(true);
    if (!rezultat.ok) return;
    expect(rezultat.podaci.ukupno).toBe(2000);
    expect(rezultat.podaci.billingEmail).toBe(klijent.billingEmail);

    const ucitana = await getInvoiceForUser(korisnik.id, f.id);
    expect(ucitana?.status).toBe("poslata");
    expect(ucitana?.sentAt).not.toBeNull();
    const dogadjaji = await prisma.invoiceEvent.findMany({ where: { invoiceId: f.id } });
    expect(dogadjaji.filter((d) => d.tip === "poslata")).toHaveLength(1);
  });

  it("bezbedno od dvostrukog slanja: drugi poziv ne pravi duplu istoriju, i dalje vraća uspeh", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
      status: "nacrt",
    });
    const [prvi, drugi] = await Promise.all([sendInvoice(korisnik.id, f.id), sendInvoice(korisnik.id, f.id)]);
    expect(prvi.ok).toBe(true);
    expect(drugi.ok).toBe(true);

    const dogadjaji = await prisma.invoiceEvent.findMany({ where: { invoiceId: f.id, tip: "poslata" } });
    expect(dogadjaji).toHaveLength(1); // ne dva - nema duplog mejla/istorije
  });

  it("odbija slanje stornirane fakture", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "stornirana",
      sentAt: new Date("2026-09-01T00:00:00.000Z"),
      voidedAt: new Date("2026-09-02T00:00:00.000Z"),
    });
    const rezultat = await sendInvoice(korisnik.id, f.id);
    expect(rezultat.ok).toBe(false);
  });
});

describe("sendInvoice - zamrzavanje šablona (Korak 8d-2, odluka 1)", () => {
  it("pri prvom slanju upisuje kopiju podrazumevanog šablona firme u templateSnapshot", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
      status: "nacrt",
    });
    const pre = await prisma.invoice.findUniqueOrThrow({ where: { id: f.id } });
    expect(pre.templateSnapshot).toBeNull();

    await sendInvoice(korisnik.id, f.id);

    const posle = await prisma.invoice.findUniqueOrThrow({ where: { id: f.id } });
    expect(posle.templateSnapshot).toEqual(napraviPodrazumevaniSablonPodatke());
  });

  it("nacrt (pre slanja) nema templateSnapshot - prati trenutni šablon firme", async () => {
    const { biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
      status: "nacrt",
    });
    expect(f.templateSnapshot).toBeNull();
  });
});

describe("sendInvoice - bira šablon po pravilu dodele (Korak 8d-7b)", () => {
  it("pri prvom slanju koristi šablon čije pravilo odgovara valuti fakture, ne uvek podrazumevani", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    await prisma.invoiceTemplate.create({
      data: {
        businessId: biznis.id,
        ...napraviPodrazumevaniSablonPodatke(),
        name: "RSD šablon",
        isDefault: false,
        accentColor: "#B4281E",
        assignRule: { tip: "valuta", valuta: "RSD" },
      },
    });
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "RSD",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
      status: "nacrt",
    });

    await sendInvoice(korisnik.id, f.id);

    const posle = await prisma.invoice.findUniqueOrThrow({ where: { id: f.id } });
    const snimak = posle.templateSnapshot as { name: string; accentColor: string };
    expect(snimak.name).toBe("RSD šablon");
    expect(snimak.accentColor).toBe("#B4281E");
  });

  it("faktura čija valuta ne odgovara nijednom pravilu i dalje dobija podrazumevani šablon", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    await prisma.invoiceTemplate.create({
      data: {
        businessId: biznis.id,
        ...napraviPodrazumevaniSablonPodatke(),
        name: "RSD šablon",
        isDefault: false,
        assignRule: { tip: "valuta", valuta: "RSD" },
      },
    });
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "USD", // ne RSD - nijedno pravilo ne odgovara
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
      status: "nacrt",
    });

    await sendInvoice(korisnik.id, f.id);

    const posle = await prisma.invoice.findUniqueOrThrow({ where: { id: f.id } });
    expect((posle.templateSnapshot as { name: string }).name).toBe("Moj izgled");
  });

  it("izmena pravila POSLE slanja ne menja već poslatu fakturu (snapshot ostaje zamrznut)", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const rsdSablon = await prisma.invoiceTemplate.create({
      data: {
        businessId: biznis.id,
        ...napraviPodrazumevaniSablonPodatke(),
        name: "RSD šablon",
        isDefault: false,
        assignRule: { tip: "valuta", valuta: "RSD" },
      },
    });
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "RSD",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
      status: "nacrt",
    });
    await sendInvoice(korisnik.id, f.id);
    const posleSlanja = await prisma.invoice.findUniqueOrThrow({ where: { id: f.id } });
    const snimak = posleSlanja.templateSnapshot;

    // Obriši RSD pravilo POSLE slanja (simulira korisnika koji kasnije menja podešavanja šablona).
    await prisma.invoiceTemplate.update({ where: { id: rsdSablon.id }, data: { assignRule: Prisma.JsonNull } });

    const posleIzmene = await prisma.invoice.findUniqueOrThrow({ where: { id: f.id } });
    expect(posleIzmene.templateSnapshot).toEqual(snimak);
  });
});

describe("Ispravka: Napomena se ne gubi pri prvom slanju (nađeno uživo u Koraku 8d-4)", () => {
  // InvoiceSendStage.tsx (klijentska komponenta, "Pregledaj i pošalji") je pri PRVOM slanju uvek slala
  // praznu Napomenu na server (fd.set("note", "") bez obzira šta je stvarno upisano na formi) - ovde se
  // testira tačno ono što taj ekran radi iza scene: sacuvajNacrt (sa Napomenom) pa sendInvoice, isti
  // redosled poziva kao posaljiFakturuAction.
  it("Napomena sa forme ostaje na fakturi posle prvog slanja (nova faktura)", async () => {
    const { korisnik, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const nacrt = await sacuvajNacrt(korisnik.id, null, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      dueDays: 7,
      note: "Test napomena",
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
    });
    expect(nacrt.ok).toBe(true);
    if (!nacrt.ok) return;

    await sendInvoice(korisnik.id, nacrt.id);

    const ucitana = await getInvoiceForUser(korisnik.id, nacrt.id);
    expect(ucitana?.status).toBe("poslata");
    expect(ucitana?.note).toBe("Test napomena");
  });

  it("Napomena ostaje i kad se OTVORI već sačuvan nacrt pa pošalje (bez nove izmene Napomene)", async () => {
    const { korisnik, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const nacrt = await sacuvajNacrt(korisnik.id, null, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      dueDays: 7,
      note: "Napomena iz nacrta",
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
    });
    expect(nacrt.ok).toBe(true);
    if (!nacrt.ok) return;

    // "Otvaranje nacrta pa slanje" - InvoiceEditor učita postojeću Napomenu u formu (ovde: ponovo sačuva
    // ISTU vrednost, kao da je forma ponovo otvorena i odmah poslata bez izmene), pa šalje.
    await sacuvajNacrt(korisnik.id, nacrt.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      dueDays: 7,
      note: "Napomena iz nacrta",
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
    });
    await sendInvoice(korisnik.id, nacrt.id);

    const ucitana = await getInvoiceForUser(korisnik.id, nacrt.id);
    expect(ucitana?.note).toBe("Napomena iz nacrta");
  });

  it("prazna Napomena ostaje prazna (null) posle slanja - ne upisuje se prazan string", async () => {
    const { korisnik, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const nacrt = await sacuvajNacrt(korisnik.id, null, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      dueDays: 7,
      note: null,
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
    });
    expect(nacrt.ok).toBe(true);
    if (!nacrt.ok) return;

    await sendInvoice(korisnik.id, nacrt.id);

    const ucitana = await getInvoiceForUser(korisnik.id, nacrt.id);
    expect(ucitana?.note).toBeNull();
  });

  it("'Pošalji ponovo' ne menja postojeću Napomenu", async () => {
    const { korisnik, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const nacrt = await sacuvajNacrt(korisnik.id, null, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      dueDays: 7,
      note: "Napomena koja ne sme da nestane",
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
    });
    expect(nacrt.ok).toBe(true);
    if (!nacrt.ok) return;
    await sendInvoice(korisnik.id, nacrt.id);

    await resendInvoice(korisnik.id, nacrt.id);

    const ucitana = await getInvoiceForUser(korisnik.id, nacrt.id);
    expect(ucitana?.note).toBe("Napomena koja ne sme da nestane");
  });
});

describe("resendInvoice - ne dira templateSnapshot (Korak 8d-2, odluka 2)", () => {
  it("'Pošalji ponovo' ne menja postojeću zamrznutu kopiju šablona", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
      status: "nacrt",
    });
    await sendInvoice(korisnik.id, f.id);
    const posleSlanja = await prisma.invoice.findUniqueOrThrow({ where: { id: f.id } });
    const snimak = posleSlanja.templateSnapshot;
    expect(snimak).not.toBeNull();

    // Namerno izmeni šablon firme POSLE prvog slanja - ako bi "Pošalji ponovo" ponovo čitao trenutni
    // šablon, ova nova vrednost bi "procurila" u fakturu koja je već poslata.
    await prisma.invoiceTemplate.updateMany({
      where: { businessId: biznis.id, isDefault: true },
      data: { accentColor: "#B4281E" },
    });

    await resendInvoice(korisnik.id, f.id);

    const posleResenda = await prisma.invoice.findUniqueOrThrow({ where: { id: f.id } });
    expect(posleResenda.templateSnapshot).toEqual(snimak);
  });
});

describe("sendInvoice - klijent bez sačuvanog mejla (Korak 8b ispravka, 2026-11-25)", () => {
  it("odbija slanje bez ručno unete adrese kad klijent nema mejl", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmomIKlijentom();
    const klijentBezMejla = await prisma.client.create({
      data: { businessId: biznis.id, name: "Bez mejla", billingEmail: null, address: "Adresa 1" },
    });
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijentBezMejla.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
      status: "nacrt",
    });
    const rezultat = await sendInvoice(korisnik.id, f.id);
    expect(rezultat.ok).toBe(false);
  });

  it("prolazi (nacrt, slanje) kad klijent nema mejl ali je ručno uneta ispravna adresa", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmomIKlijentom();
    const klijentBezMejla = await prisma.client.create({
      data: { businessId: biznis.id, name: "Bez mejla", billingEmail: null, address: "Adresa 1" },
    });
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijentBezMejla.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
      status: "nacrt",
    });
    const rezultat = await sendInvoice(korisnik.id, f.id, "rucno-uneto@primer.rs");
    expect(rezultat.ok).toBe(true);
    if (rezultat.ok) expect(rezultat.podaci.billingEmail).toBe("rucno-uneto@primer.rs");

    const ucitana = await getInvoiceForUser(korisnik.id, f.id);
    expect(ucitana?.status).toBe("poslata");
  });
});

describe("resendInvoice - 'Pošalji ponovo' (zadatak tačka 3, Korak 8d ispravka)", () => {
  it("odbija nacrt - mora prvo da bude poslata", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
      status: "nacrt",
    });
    const rezultat = await resendInvoice(korisnik.id, f.id);
    expect(rezultat.ok).toBe(false);
  });

  it("poslata faktura: dodaje 'ponovo_poslata' u Istoriju, ne menja broj/status/rok/stavke", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 2, price: 1000 }],
      status: "poslata",
      sentAt: new Date("2026-09-01T00:00:00.000Z"),
    });
    const pre = await getInvoiceForUser(korisnik.id, f.id);

    const rezultat = await resendInvoice(korisnik.id, f.id);
    expect(rezultat.ok).toBe(true);
    if (!rezultat.ok) return;
    expect(rezultat.podaci.ukupno).toBe(2000);
    expect(rezultat.podaci.billingEmail).toBe(klijent.billingEmail);

    const posle = await getInvoiceForUser(korisnik.id, f.id);
    expect(posle?.number).toBe(pre?.number);
    expect(posle?.status).toBe("poslata");
    expect(posle?.dueDays).toBe(pre?.dueDays);
    expect(posle?.items.map((s) => s.price)).toEqual(pre?.items.map((s) => s.price));

    const dogadjaji = await prisma.invoiceEvent.findMany({ where: { invoiceId: f.id, tip: "ponovo_poslata" } });
    expect(dogadjaji).toHaveLength(1);
  });

  it("plaćena faktura: i dalje može da se pošalje ponovo, status ostaje placena", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
      status: "placena",
      sentAt: new Date("2026-09-01T00:00:00.000Z"),
      paidDate: new Date("2026-09-10T00:00:00.000Z"),
    });
    const rezultat = await resendInvoice(korisnik.id, f.id);
    expect(rezultat.ok).toBe(true);

    const posle = await getInvoiceForUser(korisnik.id, f.id);
    expect(posle?.status).toBe("placena");
  });

  it("dva uzastopna poziva dodaju DVE odvojene stavke u Istoriju (svako ponovno slanje se beleži)", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
      status: "poslata",
      sentAt: new Date("2026-09-01T00:00:00.000Z"),
    });
    await resendInvoice(korisnik.id, f.id);
    await resendInvoice(korisnik.id, f.id);

    const dogadjaji = await prisma.invoiceEvent.findMany({ where: { invoiceId: f.id, tip: "ponovo_poslata" } });
    expect(dogadjaji).toHaveLength(2);
  });

  it("odbija kad klijent nema mejl i nije ručno uneta adresa", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmomIKlijentom();
    const klijentBezMejla = await prisma.client.create({
      data: { businessId: biznis.id, name: "Bez mejla", billingEmail: null, address: "Adresa 1" },
    });
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijentBezMejla.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-09-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "Usluga", qty: 1, price: 1000 }],
      status: "poslata",
      sentAt: new Date("2026-09-01T00:00:00.000Z"),
    });
    const rezultat = await resendInvoice(korisnik.id, f.id);
    expect(rezultat.ok).toBe(false);
  });
});

describe("promeniBrojFakture (Korak 8b, spec 8.2, ručna izmena)", () => {
  it("menja broj kad je format ispravan i broj slobodan", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-05-10T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    const rezultat = await promeniBrojFakture(korisnik.id, f.id, "50/26-5");
    expect(rezultat.ok).toBe(true);
    const ucitana = await getInvoiceForUser(korisnik.id, f.id);
    expect(ucitana?.number).toBe("50/26-5");
  });

  it("odbija broj sa pogrešnim formatom", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-05-10T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    const rezultat = await promeniBrojFakture(korisnik.id, f.id, "nije-broj");
    expect(rezultat.ok).toBe(false);
  });

  it("odbija godinu/mesec koji se ne poklapaju sa stvarnim datumom izdavanja", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-05-10T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    const rezultat = await promeniBrojFakture(korisnik.id, f.id, "5/27-5");
    expect(rezultat.ok).toBe(false);
  });

  it("odbija broj koji je već zauzet drugom fakturom iste firme", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const prva = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-05-10T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    const druga = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-05-20T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    const rezultat = await promeniBrojFakture(korisnik.id, druga.id, prva.number);
    expect(rezultat.ok).toBe(false);
  });

  it("pomera brojač unapred kad je ručno unet broj veći od trenutnog - budući auto-broj se ne sudara", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-05-10T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    await promeniBrojFakture(korisnik.id, f.id, "10/26-5");

    const sledeca = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-05-21T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "y", qty: 1, price: 100 }],
      status: "nacrt",
    });
    expect(sledeca.number).toBe("11/26-5"); // ne "2/26-5" - brojač je pomeren posle ručne izmene
  });

  it("odbija promenu broja na plaćenoj fakturi", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-05-10T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "placena",
      sentAt: new Date("2026-05-10T00:00:00.000Z"),
      paidDate: new Date("2026-05-15T00:00:00.000Z"),
    });
    const rezultat = await promeniBrojFakture(korisnik.id, f.id, "99/26-5");
    expect(rezultat.ok).toBe(false);
  });
});

describe("promeniBrojFakture - poklapanje godine/meseca (Korak 8b ispravka, nalaz vlasnika)", () => {
  it("prihvata TAČAN slučaj iz prijave: broj 1/26-11 sa datumom izdavanja 25.11.2026", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-11-25T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    const rezultat = await promeniBrojFakture(korisnik.id, f.id, "1/26-11");
    expect(rezultat.ok).toBe(true);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])("prihvata ispravan mesec %i (bez vodeće nule)", async (mesec) => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const dan = String(mesec).padStart(2, "0");
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date(`2026-${dan}-15T00:00:00.000Z`),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    const rezultat = await promeniBrojFakture(korisnik.id, f.id, `1/26-${mesec}`);
    expect(rezultat.ok).toBe(true);
  });

  it("granica 31.12/1.1: decembarska faktura prihvata GG-M decembra te godine", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-12-31T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    const rezultat = await promeniBrojFakture(korisnik.id, f.id, "5/26-12");
    expect(rezultat.ok).toBe(true);
  });

  it("granica 31.12/1.1: januarska faktura prihvata GG-M januara NAREDNE godine (ne 12 od prošle)", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2027-01-01T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    const rezultat = await promeniBrojFakture(korisnik.id, f.id, "1/27-1");
    expect(rezultat.ok).toBe(true);
  });

  it("odbija broj čiji mesec stvarno NE odgovara datumu izdavanja (1/26-10 sa datumom iz novembra)", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-11-25T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    const rezultat = await promeniBrojFakture(korisnik.id, f.id, "1/26-10");
    expect(rezultat.ok).toBe(false);
    if (!rezultat.ok) expect(rezultat.razlog).toContain("26-11");
  });

  it("odbija broj čija godina ne odgovara datumu izdavanja", async () => {
    const { korisnik, biznis, klijent } = await napraviKorisnikaSaFirmomIKlijentom();
    const f = await createInvoiceWithHistory(biznis.id, {
      clientId: klijent.id,
      currency: "EUR",
      lang: "sr",
      issueDate: new Date("2026-11-25T00:00:00.000Z"),
      dueDays: 7,
      items: [{ desc: "x", qty: 1, price: 100 }],
      status: "nacrt",
    });
    const rezultat = await promeniBrojFakture(korisnik.id, f.id, "1/27-11");
    expect(rezultat.ok).toBe(false);
  });
});
