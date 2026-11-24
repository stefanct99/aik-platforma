import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import {
  finishOnboarding,
  getBusinessForUser,
  imeVlasnikaIzNaloga,
  regenerateCalendarToken,
  saveOnboardingStep1,
  saveOnboardingStep2,
  setCalendarSyncEnabled,
  setOnboardingStep,
  updateBusinessProfile,
} from "./business";

// Integracioni testovi: povezuju se na pravu bazu, ALI na posebnu test bazu (aik_test, videti
// vitest.setup.ts i src/lib/test-db-safety.ts), nikad na razvojnu (aik_dev). Svaki test pravi sopstvene
// korisnike sa nasumičnim mejlom/PIB-om da ne sudara sa drugim testovima, i sve što napravi briše na
// kraju (afterAll).

const napravljeniKorisnici: string[] = [];

async function napraviKorisnika() {
  const korisnik = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: "Test korisnik",
      email: `test-${randomUUID()}@primer.rs`,
    },
  });
  napravljeniKorisnici.push(korisnik.id);
  return korisnik;
}

function nasumicniPib() {
  return String(Math.floor(100000000 + Math.random() * 899999999));
}

afterAll(async () => {
  await prisma.business.deleteMany({ where: { ownerId: { in: napravljeniKorisnici } } });
  await prisma.user.deleteMany({ where: { id: { in: napravljeniKorisnici } } });
});

describe("izolacija podataka firme", () => {
  it("getBusinessForUser korisnika A nikad ne vraća firmu korisnika B", async () => {
    const korisnikA = await napraviKorisnika();
    const korisnikB = await napraviKorisnika();

    await saveOnboardingStep1(korisnikA.id, {
      ownerName: "Korisnik A",
      name: "Firma A",
      pib: nasumicniPib(),
      mb: "11111111",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2024-01-01"),
    });
    const firmaB = await saveOnboardingStep1(korisnikB.id, {
      ownerName: "Korisnik B",
      name: "Firma B",
      pib: nasumicniPib(),
      mb: "22222222",
      delatnostCode: "6202",
      delatnostName: "Konsultantske delatnosti u vezi sa informacionom tehnologijom",
      regDate: new Date("2024-01-01"),
    });

    const nadjenoZaA = await getBusinessForUser(korisnikA.id);
    expect(nadjenoZaA?.name).toBe("Firma A");
    expect(nadjenoZaA?.id).not.toBe(firmaB.id);
  });

  it("saveOnboardingStep2 korisnika A ne može da izmeni firmu korisnika B", async () => {
    const korisnikA = await napraviKorisnika();
    const korisnikB = await napraviKorisnika();

    await saveOnboardingStep1(korisnikA.id, {
      ownerName: "Korisnik A",
      name: "Firma A2",
      pib: nasumicniPib(),
      mb: "33333333",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2024-01-01"),
    });
    await saveOnboardingStep1(korisnikB.id, {
      ownerName: "Korisnik B",
      name: "Firma B2",
      pib: nasumicniPib(),
      mb: "44444444",
      delatnostCode: "6202",
      delatnostName: "Konsultantske delatnosti u vezi sa informacionom tehnologijom",
      regDate: new Date("2024-01-01"),
    });

    // saveOnboardingStep2 uzima firmu ISKLJUČIVO preko getBusinessForUser(userId) iz lib/business.ts,
    // nikad preko id-a firme iz forme/klijenta, zato ovaj poziv ne može da dotakne firmu korisnika B,
    // bez obzira šta bi neki napadač pokušao da prosledi.
    await saveOnboardingStep2(korisnikA.id, { street: "Ulica A 1", city: "Novi Sad", zip: "21000" });

    const firmaB = await getBusinessForUser(korisnikB.id);
    expect(firmaB?.street).toBeNull();
    expect(firmaB?.city).toBeNull();
  });

  it("finishOnboarding korisnika A ne menja status onboardinga korisnika B", async () => {
    const korisnikA = await napraviKorisnika();
    const korisnikB = await napraviKorisnika();

    await saveOnboardingStep1(korisnikA.id, {
      ownerName: "A",
      name: "Firma A3",
      pib: nasumicniPib(),
      mb: "55555555",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2024-01-01"),
    });
    await saveOnboardingStep1(korisnikB.id, {
      ownerName: "B",
      name: "Firma B3",
      pib: nasumicniPib(),
      mb: "66666666",
      delatnostCode: "6202",
      delatnostName: "Konsultantske delatnosti u vezi sa informacionom tehnologijom",
      regDate: new Date("2024-01-01"),
    });

    await finishOnboarding(korisnikA.id);

    const firmaB = await getBusinessForUser(korisnikB.id);
    expect(firmaB?.onboardingCompletedAt).toBeNull();
  });
});

describe("jedinstvenost PIB-a", () => {
  it("odbija da napravi drugu firmu sa istim PIB-om (druga greška od ostalih, ne silent uspeh)", async () => {
    const korisnikA = await napraviKorisnika();
    const korisnikB = await napraviKorisnika();
    const istiPib = nasumicniPib();

    await saveOnboardingStep1(korisnikA.id, {
      ownerName: "A",
      name: "Firma sa PIB-om",
      pib: istiPib,
      mb: "77777777",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2024-01-01"),
    });

    await expect(
      saveOnboardingStep1(korisnikB.id, {
        ownerName: "B",
        name: "Druga firma, isti PIB",
        pib: istiPib,
        mb: "88888888",
        delatnostCode: "6202",
        delatnostName: "Konsultantske delatnosti u vezi sa informacionom tehnologijom",
        regDate: new Date("2024-01-01"),
      }),
    ).rejects.toThrow();
  });
});

describe("updateBusinessProfile (Podešavanja > Profil i firma, Korak 4)", () => {
  function profilPodaci(overrides: Partial<Parameters<typeof updateBusinessProfile>[1]> = {}) {
    return {
      name: "Firma d.o.o.",
      ownerName: "Vlasnik Vlasnić",
      pib: nasumicniPib(),
      mb: "11112222",
      delatnostCode: "62.10",
      delatnostName: "Delatnosti računarskog programiranja",
      regDate: new Date("2024-06-01"),
      street: "Ulica 1",
      city: "Novi Sad",
      zip: "21000",
      contactEmail: "firma@primer.rs",
      phone: "+381 60 111 2222",
      ...overrides,
    };
  }

  it("čuva izmenjene podatke profila firme", async () => {
    const korisnik = await napraviKorisnika();
    await saveOnboardingStep1(korisnik.id, {
      ownerName: "Staro Ime",
      name: "Staro Ime d.o.o.",
      pib: nasumicniPib(),
      mb: "99998888",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2023-01-01"),
    });

    const sacuvano = await updateBusinessProfile(korisnik.id, profilPodaci({ name: "Novo Ime d.o.o." }));

    expect(sacuvano.name).toBe("Novo Ime d.o.o.");
    expect(sacuvano.street).toBe("Ulica 1");
    expect(sacuvano.contactEmail).toBe("firma@primer.rs");

    const ponovoUcitano = await getBusinessForUser(korisnik.id);
    expect(ponovoUcitano?.name).toBe("Novo Ime d.o.o.");
  });

  it("prazan kontakt mejl/telefon čuva kao null (polja su opciona)", async () => {
    const korisnik = await napraviKorisnika();
    await saveOnboardingStep1(korisnik.id, {
      ownerName: "Vlasnik",
      name: "Firma",
      pib: nasumicniPib(),
      mb: "33334444",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2023-01-01"),
    });

    const sacuvano = await updateBusinessProfile(
      korisnik.id,
      profilPodaci({ contactEmail: "", phone: "" }),
    );

    expect(sacuvano.contactEmail).toBeNull();
    expect(sacuvano.phone).toBeNull();
  });

  it("izolacija: korisnik A ne može da izmeni firmu korisnika B", async () => {
    const korisnikA = await napraviKorisnika();
    const korisnikB = await napraviKorisnika();

    await saveOnboardingStep1(korisnikA.id, {
      ownerName: "A",
      name: "Firma A",
      pib: nasumicniPib(),
      mb: "11111111",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2024-01-01"),
    });
    await saveOnboardingStep1(korisnikB.id, {
      ownerName: "B",
      name: "Firma B",
      pib: nasumicniPib(),
      mb: "22222222",
      delatnostCode: "6202",
      delatnostName: "Konsultantske delatnosti u vezi sa informacionom tehnologijom",
      regDate: new Date("2024-01-01"),
    });

    // updateBusinessProfile prima samo userId (izveden iz sesije u pravoj akciji), nikad id firme, pa
    // korisnik A fizički ne može da pogodi/pošalje id firme B ni da je izmeni ovim pozivom.
    await updateBusinessProfile(korisnikA.id, profilPodaci({ name: "Firma A izmenjena" }));

    const firmaB = await getBusinessForUser(korisnikB.id);
    expect(firmaB?.name).toBe("Firma B");
  });
});

describe("imeVlasnikaIzNaloga (Korak 6: ime vlasnika dolazi iz naloga, ne sa ekrana)", () => {
  it("koristi ime iz naloga kad postoji", () => {
    expect(imeVlasnikaIzNaloga({ name: "Petar Petrović", email: "petar@primer.rs" })).toBe(
      "Petar Petrović",
    );
  });

  it("kad nalog nema ime, koristi deo mejla pre @ kao zamenu", () => {
    expect(imeVlasnikaIzNaloga({ name: "", email: "petar@primer.rs" })).toBe("petar");
  });

  it("prazno ime (samo razmaci) se tretira kao da ga nema", () => {
    expect(imeVlasnikaIzNaloga({ name: "   ", email: "ana@primer.rs" })).toBe("ana");
  });
});

describe("onboarding: čuvanje po koraku i nastavak od prvog nezavršenog (Korak 6)", () => {
  it("svaki korak pomera onboardingStep napred odmah po čuvanju", async () => {
    const korisnik = await napraviKorisnika();

    const posleKoraka1 = await saveOnboardingStep1(korisnik.id, {
      ownerName: "Test",
      name: "Firma Koraci",
      pib: nasumicniPib(),
      mb: "12121212",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2024-01-01"),
    });
    expect(posleKoraka1.onboardingStep).toBe(2);

    const posleKoraka2 = await saveOnboardingStep2(korisnik.id, {
      street: "Ulica 5",
      city: "Niš",
      zip: "18000",
    });
    expect(posleKoraka2.onboardingStep).toBe(3);

    // Korak 3 (mejlovi banke) nema svoju "save" funkciju - preskakanje i "Nastavi" samo pomeraju
    // pokazivač na 4 (setOnboardingStep), pošto stvarno povezivanje mejlova banke još ne postoji.
    const posleKoraka3 = await setOnboardingStep(korisnik.id, 4);
    expect(posleKoraka3.onboardingStep).toBe(4);

    const zavrsen = await finishOnboarding(korisnik.id);
    expect(zavrsen.onboardingCompletedAt).not.toBeNull();
  });

  it("nastavak posle prekida: onboardingStep ostaje tačno na prvom nezavršenom koraku", async () => {
    const korisnik = await napraviKorisnika();

    await saveOnboardingStep1(korisnik.id, {
      ownerName: "Test",
      name: "Firma Prekid",
      pib: nasumicniPib(),
      mb: "13131313",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2024-01-01"),
    });

    // Simulira zatvaranje pregledača posle koraka 1: sledeća poseta /onboarding čita baš ovu vrednost
    // (vidi src/app/onboarding/page.tsx) da odluči koji korak da prikaže - mora biti 2, ne 1.
    const biznis = await getBusinessForUser(korisnik.id);
    expect(biznis?.onboardingStep).toBe(2);
  });

  it('"Nazad" ne čuva: pomeranje koraka unazad ne menja već sačuvane podatke firme', async () => {
    const korisnik = await napraviKorisnika();

    await saveOnboardingStep1(korisnik.id, {
      ownerName: "Test",
      name: "Firma Nazad",
      pib: nasumicniPib(),
      mb: "14141414",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2024-01-01"),
    });
    await saveOnboardingStep2(korisnik.id, { street: "Prava ulica 1", city: "Kragujevac", zip: "34000" });

    // goBackAction (src/app/onboarding/actions.ts) poziva samo setOnboardingStep, nikad saveOnboardingStep2
    // - ovo potvrđuje da "Nazad" sa koraka 3 na korak 2 ne dira već sačuvane podatke koraka 2.
    await setOnboardingStep(korisnik.id, 2);

    const biznis = await getBusinessForUser(korisnik.id);
    expect(biznis?.onboardingStep).toBe(2);
    expect(biznis?.street).toBe("Prava ulica 1");
    expect(biznis?.city).toBe("Kragujevac");
  });
});

describe("kalendar token (Korak 7, Povezivanje)", () => {
  it("svaka firma dobija svoj token pri kreiranju", async () => {
    const korisnik = await napraviKorisnika();
    const biznis = await saveOnboardingStep1(korisnik.id, {
      ownerName: "Test",
      name: "Firma Kalendar",
      pib: nasumicniPib(),
      mb: "15151515",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2024-01-01"),
    });
    expect(biznis.calendarToken).toMatch(/^[0-9a-f]{24}$/);
  });

  it('"Generiši novi" menja token, stari odmah prestaje da važi', async () => {
    const korisnik = await napraviKorisnika();
    const biznis = await saveOnboardingStep1(korisnik.id, {
      ownerName: "Test",
      name: "Firma Kalendar 2",
      pib: nasumicniPib(),
      mb: "16161616",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2024-01-01"),
    });
    const stariToken = biznis.calendarToken;

    const azurirana = await regenerateCalendarToken(korisnik.id);
    expect(azurirana.calendarToken).not.toBe(stariToken);

    const pronadjenPoStarom = await prisma.business.findUnique({
      where: { calendarToken: stariToken },
    });
    expect(pronadjenPoStarom).toBeNull();
  });

  it("setCalendarSyncEnabled menja samo taj prekidač", async () => {
    const korisnik = await napraviKorisnika();
    await saveOnboardingStep1(korisnik.id, {
      ownerName: "Test",
      name: "Firma Kalendar 3",
      pib: nasumicniPib(),
      mb: "17171717",
      delatnostCode: "6201",
      delatnostName: "Računarsko programiranje",
      regDate: new Date("2024-01-01"),
    });

    const azurirana = await setCalendarSyncEnabled(korisnik.id, false);
    expect(azurirana.calendarSyncEnabled).toBe(false);
  });
});
