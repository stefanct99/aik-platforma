import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import {
  finishOnboarding,
  getBusinessForUser,
  saveOnboardingStep1,
  saveOnboardingStep2,
} from "./business";

// Integracioni testovi: povezuju se na pravu lokalnu bazu (aik_dev), isto kao aplikacija. Svaki test
// pravi sopstvene korisnike sa nasumičnim mejlom/PIB-om da ne sudara sa drugim testovima ili sa
// podacima iz ručne provere, i sve što napravi briše na kraju (afterAll).

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
