import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "./prisma";
import { saveOnboardingStep1 } from "./business";
import { createInvoiceWithHistory } from "./invoices";
import { jeFakturaKasni } from "./invoice-status";
import { dodajPrihod, ispraviPrihod, obrisiPrihod } from "./prihodi-db";

// Integracioni testovi (aik_test), isti obrazac kao invoices.test.ts/clients.test.ts - svaki test pravi
// sopstvenog korisnika/firmu sa nasumičnim podacima i briše sve na kraju.

const napravljeniKorisnici: string[] = [];

function nasumicniPib() {
  return String(Math.floor(100000000 + Math.random() * 899999999));
}

async function napraviKorisnikaSaFirmom() {
  const korisnik = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: "Test korisnik",
      email: `test-${randomUUID()}@primer.rs`,
    },
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
  const biznis = await prisma.business.findFirstOrThrow({
    where: { ownerId: korisnik.id },
  });
  return { korisnik, biznis };
}

function napraviPrihod(
  businessId: string,
  delimicno: Partial<Prisma.IncomeUncheckedCreateInput> = {},
) {
  return prisma.income.create({
    data: {
      businessId,
      date: new Date("2026-06-15"),
      currency: "EUR",
      amount: 100000,
      kind: "devizni",
      source: "rucno",
      ...delimicno,
    },
  });
}

// "Plaćena" faktura (Korak 9e) - createInvoiceWithHistory je isti kod koji scripts/e2e-db.ts
// create-paid-invoice koristi, pravi i njen Income zapis automatski.
async function napraviPlacenuFakturu(
  businessId: string,
  opts: { izdata: Date; dueDays?: number; iznos?: number },
) {
  const klijent = await prisma.client.create({
    data: { businessId, name: "Test klijent", address: "Test adresa 1" },
  });
  const faktura = await createInvoiceWithHistory(businessId, {
    clientId: klijent.id,
    currency: "RSD",
    lang: "sr",
    issueDate: opts.izdata,
    dueDays: opts.dueDays ?? 7,
    items: [{ desc: "Test", qty: 1, price: opts.iznos ?? 100_000 }],
    status: "placena",
    sentAt: opts.izdata,
    paidDate: new Date(),
  });
  const prihod = await prisma.income.findFirstOrThrow({
    where: { invoiceId: faktura.id },
  });
  return { faktura, prihod, klijent };
}

afterAll(async () => {
  await prisma.income.deleteMany({
    where: { business: { ownerId: { in: napravljeniKorisnici } } },
  });
  await prisma.invoice.deleteMany({
    where: { business: { ownerId: { in: napravljeniKorisnici } } },
  });
  await prisma.business.deleteMany({
    where: { ownerId: { in: napravljeniKorisnici } },
  });
  await prisma.user.deleteMany({ where: { id: { in: napravljeniKorisnici } } });
});

describe("ispraviPrihod (Korak 9c, 'Ispravi')", () => {
  it("devizni: upisuje kurs (prvi put) i preračunava iznosRsd", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const prihod = await napraviPrihod(biznis.id);

    const rezultat = await ispraviPrihod(korisnik.id, prihod.id, {
      kurs: 117.2,
      opis: null,
    });
    expect(rezultat.ok).toBe(true);

    const ucitan = await prisma.income.findUniqueOrThrow({
      where: { id: prihod.id },
    });
    expect(ucitan.rate).toBe(117.2);
    expect(ucitan.amountRsd).toBe(11_720_000);
  });

  it("devizni: menja VEĆ upisan kurs i preračunava iznosRsd na novu vrednost", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const prihod = await napraviPrihod(biznis.id, {
      rate: 100,
      amountRsd: 10_000_000,
    });

    const rezultat = await ispraviPrihod(korisnik.id, prihod.id, {
      kurs: 110,
      opis: null,
    });
    expect(rezultat.ok).toBe(true);

    const ucitan = await prisma.income.findUniqueOrThrow({
      where: { id: prihod.id },
    });
    expect(ucitan.rate).toBe(110);
    expect(ucitan.amountRsd).toBe(11_000_000);
  });

  it.each([0, -5, NaN])(
    "devizni: nevažeći kurs (%s) vraća grešku i ne menja ništa",
    async (kurs) => {
      const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
      const prihod = await napraviPrihod(biznis.id);

      const rezultat = await ispraviPrihod(korisnik.id, prihod.id, {
        kurs,
        opis: null,
      });
      expect(rezultat).toEqual({
        ok: false,
        razlog: "Kurs mora biti broj veći od 0.",
      });

      const ucitan = await prisma.income.findUniqueOrThrow({
        where: { id: prihod.id },
      });
      expect(ucitan.rate).toBeNull();
      expect(ucitan.amountRsd).toBeNull();
    },
  );

  it("devizni: menja opis nezavisno od kursa", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const prihod = await napraviPrihod(biznis.id, {
      rate: 117.2,
      amountRsd: 11_720_000,
    });

    const rezultat = await ispraviPrihod(korisnik.id, prihod.id, {
      kurs: 117.2,
      opis: "Gotovinska uplata",
    });
    expect(rezultat.ok).toBe(true);

    const ucitan = await prisma.income.findUniqueOrThrow({
      where: { id: prihod.id },
    });
    expect(ucitan.description).toBe("Gotovinska uplata");
  });

  it("dinarski: nema polje za kurs - kurs se ignoriše čak i ako je poslat, samo opis se menja", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const prihod = await napraviPrihod(biznis.id, {
      kind: "dinarski",
      currency: "RSD",
      amount: 5_000_000,
    });

    const rezultat = await ispraviPrihod(korisnik.id, prihod.id, {
      kurs: 999,
      opis: "Gotovina",
    });
    expect(rezultat.ok).toBe(true);

    const ucitan = await prisma.income.findUniqueOrThrow({
      where: { id: prihod.id },
    });
    expect(ucitan.rate).toBeNull();
    expect(ucitan.amountRsd).toBeNull();
    expect(ucitan.description).toBe("Gotovina");
  });

  it("izolacija: korisnik A ne može da izmeni prihod korisnika B (preko akcije sa tuđim ID-om)", async () => {
    const a = await napraviKorisnikaSaFirmom();
    const b = await napraviKorisnikaSaFirmom();
    const prihodB = await napraviPrihod(b.biznis.id);

    const rezultat = await ispraviPrihod(a.korisnik.id, prihodB.id, {
      kurs: 200,
      opis: "Tuđa izmena",
    });
    expect(rezultat).toEqual({ ok: false, razlog: "Prihod ne postoji." });

    const ucitan = await prisma.income.findUniqueOrThrow({
      where: { id: prihodB.id },
    });
    expect(ucitan.rate).toBeNull();
    expect(ucitan.description).toBeNull();
  });

  it("nepostojeći ID vraća grešku", async () => {
    const { korisnik } = await napraviKorisnikaSaFirmom();
    const rezultat = await ispraviPrihod(korisnik.id, "ne-postoji-123", {
      kurs: 100,
      opis: null,
    });
    expect(rezultat).toEqual({ ok: false, razlog: "Prihod ne postoji." });
  });
});

describe("dodajPrihod (Korak 9d-1, 'Dodaj prihod')", () => {
  it("dinarski: ispravan unos - amountRsd = iznos, rate null, izvor 'rucno', bez fakture", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const klijent = await prisma.client.create({
      data: {
        businessId: biznis.id,
        name: "Test klijent",
        address: "Test adresa 1",
      },
    });

    const rezultat = await dodajPrihod(korisnik.id, {
      vrsta: "dinarski",
      datum: new Date("2026-07-01"),
      clientId: klijent.id,
      valuta: "",
      iznos: 4_500_000,
      kurs: null,
      opis: "Gotovinska uplata",
    });
    expect(rezultat.ok).toBe(true);

    const prihod = await prisma.income.findFirstOrThrow({
      where: { businessId: biznis.id },
    });
    expect(prihod).toMatchObject({
      kind: "dinarski",
      currency: "RSD",
      amount: 4_500_000,
      rate: null,
      amountRsd: 4_500_000,
      source: "rucno",
      invoiceId: null,
      clientId: klijent.id,
      description: "Gotovinska uplata",
    });
  });

  it("devizni: ispravan unos - amountRsd preračunat preko izracunajIznosRsd", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();

    const rezultat = await dodajPrihod(korisnik.id, {
      vrsta: "devizni",
      datum: new Date("2026-07-01"),
      clientId: null,
      valuta: "EUR",
      iznos: 100_000,
      kurs: 117.2,
      opis: null,
    });
    expect(rezultat.ok).toBe(true);

    const prihod = await prisma.income.findFirstOrThrow({
      where: { businessId: biznis.id },
    });
    expect(prihod).toMatchObject({
      kind: "devizni",
      currency: "EUR",
      amount: 100_000,
      rate: 117.2,
      amountRsd: 11_720_000,
      invoiceId: null,
      clientId: null,
    });
  });

  it("radi bez klijenta (clientId null)", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const rezultat = await dodajPrihod(korisnik.id, {
      vrsta: "dinarski",
      datum: new Date("2026-07-01"),
      clientId: null,
      valuta: "",
      iznos: 1000,
      kurs: null,
      opis: null,
    });
    expect(rezultat.ok).toBe(true);
    const prihod = await prisma.income.findFirstOrThrow({
      where: { businessId: biznis.id },
    });
    expect(prihod.clientId).toBeNull();
  });

  it("greška: iznos 0 ili negativan", async () => {
    const { korisnik } = await napraviKorisnikaSaFirmom();
    const rezultat = await dodajPrihod(korisnik.id, {
      vrsta: "dinarski",
      datum: new Date("2026-07-01"),
      clientId: null,
      valuta: "",
      iznos: 0,
      kurs: null,
      opis: null,
    });
    expect(rezultat).toEqual({
      ok: false,
      razlog: "Iznos mora biti broj veći od 0.",
    });
  });

  it("greška: nedostaje/neispravan datum", async () => {
    const { korisnik } = await napraviKorisnikaSaFirmom();
    const rezultat = await dodajPrihod(korisnik.id, {
      vrsta: "dinarski",
      datum: new Date(NaN),
      clientId: null,
      valuta: "",
      iznos: 1000,
      kurs: null,
      opis: null,
    });
    expect(rezultat).toEqual({
      ok: false,
      razlog: "Unesi ispravan datum uplate.",
    });
  });

  it("greška: devizni sa nepoznatom valutom", async () => {
    const { korisnik } = await napraviKorisnikaSaFirmom();
    const rezultat = await dodajPrihod(korisnik.id, {
      vrsta: "devizni",
      datum: new Date("2026-07-01"),
      clientId: null,
      valuta: "JPY",
      iznos: 1000,
      kurs: 1,
      opis: null,
    });
    expect(rezultat).toEqual({ ok: false, razlog: "Izaberi valutu." });
  });

  it.each([0, -5, NaN])(
    "greška: devizni sa nevažećim kursom (%s)",
    async (kurs) => {
      const { korisnik } = await napraviKorisnikaSaFirmom();
      const rezultat = await dodajPrihod(korisnik.id, {
        vrsta: "devizni",
        datum: new Date("2026-07-01"),
        clientId: null,
        valuta: "EUR",
        iznos: 1000,
        kurs,
        opis: null,
      });
      expect(rezultat).toEqual({
        ok: false,
        razlog: "Kurs mora biti broj veći od 0.",
      });
    },
  );

  it("izolacija: ne može da upiše prihod sa klijentom koji pripada tuđem biznisu", async () => {
    const a = await napraviKorisnikaSaFirmom();
    const b = await napraviKorisnikaSaFirmom();
    const klijentB = await prisma.client.create({
      data: {
        businessId: b.biznis.id,
        name: "Tuđi klijent",
        address: "Tuđa adresa 1",
      },
    });

    const rezultat = await dodajPrihod(a.korisnik.id, {
      vrsta: "dinarski",
      datum: new Date("2026-07-01"),
      clientId: klijentB.id,
      valuta: "",
      iznos: 1000,
      kurs: null,
      opis: null,
    });
    expect(rezultat).toEqual({ ok: false, razlog: "Klijent ne postoji." });

    const prihodiA = await prisma.income.count({
      where: { businessId: a.biznis.id },
    });
    expect(prihodiA).toBe(0);
  });
});

describe("obrisiPrihod (Korak 9e, 'Obriši prihod')", () => {
  it("prihod bez fakture: briše se, ne dira nijednu fakturu", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const prihod = await napraviPrihod(biznis.id);

    const rezultat = await obrisiPrihod(korisnik.id, prihod.id);
    expect(rezultat).toEqual({ ok: true, fakturaId: null });

    await expect(
      prisma.income.findUniqueOrThrow({ where: { id: prihod.id } }),
    ).rejects.toThrow();
  });

  it("faktura čiji rok NIJE prošao: prelazi iz 'Plaćena' u 'poslata', paidDate se briše, upisuje se događaj", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const danas = new Date();
    const { faktura, prihod } = await napraviPlacenuFakturu(biznis.id, {
      izdata: danas,
      dueDays: 30,
    });

    const rezultat = await obrisiPrihod(korisnik.id, prihod.id);
    expect(rezultat).toEqual({ ok: true, fakturaId: faktura.id });

    const ucitanaFaktura = await prisma.invoice.findUniqueOrThrow({
      where: { id: faktura.id },
    });
    expect(ucitanaFaktura.status).toBe("poslata");
    expect(ucitanaFaktura.paidDate).toBeNull();

    const dogadjaji = await prisma.invoiceEvent.findMany({
      where: { invoiceId: faktura.id, tip: "uplata_obrisana" },
    });
    expect(dogadjaji).toHaveLength(1);

    await expect(
      prisma.income.findUniqueOrThrow({ where: { id: prihod.id } }),
    ).rejects.toThrow();
  });

  it("faktura čiji je rok PROŠAO: status u bazi je i dalje 'poslata' (ne postoji 'kasni' u bazi), ali je efektivno kasni", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const davno = new Date("2020-01-01");
    const { faktura, prihod } = await napraviPlacenuFakturu(biznis.id, {
      izdata: davno,
      dueDays: 7,
    });

    const rezultat = await obrisiPrihod(korisnik.id, prihod.id);
    expect(rezultat.ok).toBe(true);

    const ucitanaFaktura = await prisma.invoice.findUniqueOrThrow({
      where: { id: faktura.id },
    });
    // "kasni" se NIKAD ne upisuje - uvek se izvodi iz poslata+rok (invoice-status.ts).
    expect(ucitanaFaktura.status).toBe("poslata");
    expect(
      jeFakturaKasni(
        "poslata",
        ucitanaFaktura.issueDate,
        ucitanaFaktura.dueDays,
        new Date(),
      ),
    ).toBe(true);
  });

  it("stornirana faktura ostaje stornirana (ne dira se, samo prihod nestaje)", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom();
    const { faktura, prihod } = await napraviPlacenuFakturu(biznis.id, {
      izdata: new Date(),
      dueDays: 7,
    });
    // Ručno postavljeno u testu (van normalnog toka - voidInvoice ne dozvoljava storno "placena"
    // fakture bez potvrde; ovde samo proveravamo da obrisiPrihod poštuje VEĆ stornirano stanje).
    await prisma.invoice.update({
      where: { id: faktura.id },
      data: { status: "stornirana" },
    });

    const rezultat = await obrisiPrihod(korisnik.id, prihod.id);
    expect(rezultat).toEqual({ ok: true, fakturaId: faktura.id });

    const ucitanaFaktura = await prisma.invoice.findUniqueOrThrow({
      where: { id: faktura.id },
    });
    expect(ucitanaFaktura.status).toBe("stornirana");

    const dogadjaji = await prisma.invoiceEvent.findMany({
      where: { invoiceId: faktura.id, tip: "uplata_obrisana" },
    });
    expect(dogadjaji).toHaveLength(0);
  });

  it("izolacija: korisnik A ne može da obriše prihod korisnika B - ništa se ne menja (ni prihod ni faktura)", async () => {
    const a = await napraviKorisnikaSaFirmom();
    const b = await napraviKorisnikaSaFirmom();
    const { faktura, prihod } = await napraviPlacenuFakturu(b.biznis.id, {
      izdata: new Date(),
      dueDays: 7,
    });

    const rezultat = await obrisiPrihod(a.korisnik.id, prihod.id);
    expect(rezultat).toEqual({ ok: false, razlog: "Prihod ne postoji." });

    // Transakcija se nikad nije ni pokrenula - ni prihod ni faktura nisu dirnuti.
    await expect(
      prisma.income.findUniqueOrThrow({ where: { id: prihod.id } }),
    ).resolves.toBeTruthy();
    const ucitanaFaktura = await prisma.invoice.findUniqueOrThrow({
      where: { id: faktura.id },
    });
    expect(ucitanaFaktura.status).toBe("placena");
  });

  it("nepostojeći ID vraća grešku", async () => {
    const { korisnik } = await napraviKorisnikaSaFirmom();
    const rezultat = await obrisiPrihod(korisnik.id, "ne-postoji-123");
    expect(rezultat).toEqual({ ok: false, razlog: "Prihod ne postoji." });
  });
});
