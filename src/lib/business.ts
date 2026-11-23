import { prisma } from "./prisma";
import { generateInboundCode, slugifyBusinessName } from "./inbound-mail";

export type Step1Podaci = {
  ownerName: string;
  name: string;
  pib: string;
  mb: string;
  delatnostCode: string;
  delatnostName: string;
  regDate: Date;
};

export type Step2Podaci = {
  street: string;
  city: string;
  zip: string;
};

export type ProfilFirmePodaci = {
  name: string;
  ownerName: string;
  pib: string;
  mb: string;
  delatnostCode: string;
  delatnostName: string;
  regDate: Date;
  street: string;
  city: string;
  zip: string;
  contactEmail: string;
  phone: string;
};

// JEDINO mesto koje čita firmu iz baze po korisniku. Svaka druga funkcija ovde prvo prolazi kroz ovu
// (ili kroz already-fetched instancu), nikad ne prima id firme spolja (iz forme/klijenta), zato
// korisnik A ne može ni da pročita ni da izmeni firmu korisnika B (vidi business.test.ts).
export async function getBusinessForUser(userId: string) {
  return prisma.business.findFirst({ where: { ownerId: userId } });
}

async function generateUniqueInbound(name: string) {
  const slug = slugifyBusinessName(name);
  for (let pokusaj = 0; pokusaj < 20; pokusaj++) {
    const code = generateInboundCode();
    const postoji = await prisma.business.findFirst({
      where: { inboundSlug: slug, inboundCode: code },
    });
    if (!postoji) return { inboundSlug: slug, inboundCode: code };
  }
  throw new Error("Nije moguće generisati jedinstvenu adresu za prijem mejlova.");
}

export async function saveOnboardingStep1(userId: string, podaci: Step1Podaci) {
  const postojeca = await getBusinessForUser(userId);

  // Nema registracionog ekrana (prijava je samo magic linkom), zato se ime i prezime vlasnika
  // upisuje i u ime korisnika (zahtev iz Koraka 2).
  await prisma.user.update({ where: { id: userId }, data: { name: podaci.ownerName } });

  if (postojeca) {
    return prisma.business.update({
      where: { id: postojeca.id },
      data: { ...podaci, onboardingStep: Math.max(postojeca.onboardingStep, 2) },
    });
  }

  const { inboundSlug, inboundCode } = await generateUniqueInbound(podaci.name);
  return prisma.business.create({
    data: {
      ownerId: userId,
      ...podaci,
      inboundSlug,
      inboundCode,
      onboardingStep: 2,
    },
  });
}

export async function saveOnboardingStep2(userId: string, podaci: Step2Podaci) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) throw new Error("Firma ne postoji. Prvo popuni Korak 1.");
  return prisma.business.update({
    where: { id: biznis.id },
    data: { ...podaci, onboardingStep: Math.max(biznis.onboardingStep, 3) },
  });
}

export async function setOnboardingStep(userId: string, step: number) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) throw new Error("Firma ne postoji.");
  return prisma.business.update({
    where: { id: biznis.id },
    data: { onboardingStep: step },
  });
}

// Podešavanja > Profil i firma (Korak 4, spec 7.13). Firma se, kao i svuda u ovom fajlu, uzima ISKLJUČIVO
// preko getBusinessForUser(userId), nikad preko id-a firme iz forme, da korisnik A ne može da izmeni
// firmu korisnika B.
export async function updateBusinessProfile(userId: string, podaci: ProfilFirmePodaci) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) throw new Error("Firma ne postoji.");

  await prisma.user.update({ where: { id: userId }, data: { name: podaci.ownerName } });

  return prisma.business.update({
    where: { id: biznis.id },
    data: {
      name: podaci.name,
      ownerName: podaci.ownerName,
      pib: podaci.pib,
      mb: podaci.mb,
      delatnostCode: podaci.delatnostCode,
      delatnostName: podaci.delatnostName,
      regDate: podaci.regDate,
      street: podaci.street,
      city: podaci.city,
      zip: podaci.zip,
      contactEmail: podaci.contactEmail || null,
      phone: podaci.phone || null,
    },
  });
}

export async function finishOnboarding(userId: string) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) throw new Error("Firma ne postoji.");
  return prisma.business.update({
    where: { id: biznis.id },
    data: { onboardingStep: 4, onboardingCompletedAt: new Date() },
  });
}
