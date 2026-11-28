// Izvoz Knjige prihoda (Korak 9g-1) - deo koji dotiče bazu. Integracioni test (aik_test), isti obrazac kao
// prihodi-db.test.ts: svaki test pravi sopstvenog korisnika/firmu, briše sve na kraju. Ruta (route.ts)
// sama nema test - ona je tanak omotač oko OVE funkcije (vidi komentar u route.ts/izveštaj).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import { saveOnboardingStep1 } from "./business";
import { pripremiIzvoz } from "./izvoz-prihoda-db";

const napravljeniKorisnici: string[] = [];

function nasumicniPib() {
  return String(Math.floor(100000000 + Math.random() * 899999999));
}

async function napraviKorisnikaSaFirmom(nazivFirme: string) {
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
    name: nazivFirme,
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
  datumIso: string,
  delimicno: Partial<{
    currency: string;
    amount: number;
    kind: string;
    rate: number | null;
    amountRsd: number | null;
  }> = {},
) {
  return prisma.income.create({
    data: {
      businessId,
      date: new Date(datumIso),
      currency: "EUR",
      amount: 100_000,
      rate: 117,
      amountRsd: 11_700_000,
      kind: "devizni",
      source: "rucno",
      ...delimicno,
    },
  });
}

afterAll(async () => {
  await prisma.income.deleteMany({
    where: { business: { ownerId: { in: napravljeniKorisnici } } },
  });
  await prisma.business.deleteMany({
    where: { ownerId: { in: napravljeniKorisnici } },
  });
  await prisma.user.deleteMany({ where: { id: { in: napravljeniKorisnici } } });
});

describe("pripremiIzvoz (Korak 9g-1)", () => {
  it("vraća naziv/PIB firme i tabele filtrirane po periodu", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom(
      "Izvoz Test Firma",
    );
    await napraviPrihod(biznis.id, "2026-03-10T00:00:00.000Z");
    await napraviPrihod(biznis.id, "2026-07-01T00:00:00.000Z"); // van perioda (I kvartal)

    const rezultat = await pripremiIzvoz(
      korisnik.id,
      2026,
      { tip: "kvartal", kvartal: 1 },
      false,
      false,
    );

    expect(rezultat?.firma.naziv).toBe("Izvoz Test Firma");
    expect(rezultat?.firma.pib).toBe(biznis.pib);
    expect(rezultat?.tabele).toHaveLength(1);
    expect(rezultat?.tabele[0].redovi).toHaveLength(1);
  });

  it("odvojeno: devizni i dinarski u dve tabele", async () => {
    const { korisnik, biznis } = await napraviKorisnikaSaFirmom(
      "Izvoz Test Firma 2",
    );
    await napraviPrihod(biznis.id, "2026-05-01T00:00:00.000Z", {
      kind: "devizni",
    });
    await napraviPrihod(biznis.id, "2026-05-02T00:00:00.000Z", {
      kind: "dinarski",
      currency: "RSD",
      amount: 500_000,
      rate: null,
      amountRsd: 500_000,
    });

    const rezultat = await pripremiIzvoz(
      korisnik.id,
      2026,
      { tip: "godina" },
      true,
      false,
    );

    expect(rezultat?.tabele.map((t) => t.naziv)).toEqual([
      "Devizni prihodi",
      "Dinarski prihodi",
    ]);
    expect(rezultat?.tabele[0].redovi).toHaveLength(1);
    expect(rezultat?.tabele[1].redovi).toHaveLength(1);
  });

  it("izolacija: korisnik A ne vidi prihode korisnika B", async () => {
    const a = await napraviKorisnikaSaFirmom("Izvoz Firma A");
    const b = await napraviKorisnikaSaFirmom("Izvoz Firma B");
    await napraviPrihod(a.biznis.id, "2026-06-01T00:00:00.000Z");
    await napraviPrihod(b.biznis.id, "2026-06-01T00:00:00.000Z");

    const rezultat = await pripremiIzvoz(
      a.korisnik.id,
      2026,
      { tip: "godina" },
      false,
      false,
    );

    expect(rezultat?.tabele[0].redovi).toHaveLength(1);
    expect(rezultat?.firma.naziv).toBe("Izvoz Firma A");
  });

  it("prazan period: tabele postoje, bez redova (ne null)", async () => {
    const { korisnik } = await napraviKorisnikaSaFirmom("Izvoz Test Firma 3");

    const rezultat = await pripremiIzvoz(
      korisnik.id,
      2026,
      { tip: "godina" },
      false,
      false,
    );

    expect(rezultat).not.toBeNull();
    expect(rezultat?.tabele[0].redovi).toEqual([]);
  });

  it("korisnik bez firme (nije završio onboarding): vraća null", async () => {
    const korisnik = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: "Bez firme",
        email: `test-${randomUUID()}@primer.rs`,
      },
    });
    napravljeniKorisnici.push(korisnik.id);

    const rezultat = await pripremiIzvoz(
      korisnik.id,
      2026,
      { tip: "godina" },
      false,
      false,
    );

    expect(rezultat).toBeNull();
  });
});
