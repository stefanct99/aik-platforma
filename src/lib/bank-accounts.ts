// Računi (Korak 7, spec 7.13): dinarski i devizni računi firme. Firma se, kao svuda, uzima ISKLJUČIVO
// preko getBusinessForUser(userId), nikad preko id-a firme iz forme, da korisnik A ne može da vidi ni
// menja račune korisnika B.

import { prisma } from "./prisma";
import { getBusinessForUser } from "./business";
import { isValidDinarskiRacun, isValidIban, isValidSwift, normalizujDinarskiRacun } from "./identifiers";

export type NoviRacunPodaci = {
  type: "RSD" | "devizni";
  currency: string;
  bank: string;
  number?: string;
  iban?: string;
  swift?: string;
  isDefault: boolean;
};

export async function getAccountsForUser(userId: string) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return [];
  return prisma.bankAccount.findMany({
    where: { businessId: biznis.id },
    orderBy: { createdAt: "asc" },
  });
}

async function nadjiRacunKorisnika(userId: string, racunId: string) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return null;
  return prisma.bankAccount.findFirst({ where: { id: racunId, businessId: biznis.id } });
}

// "Samo jedan podrazumevani po valuti" (spec 7.13): kad se novi račun označi kao podrazumevani, ostali
// računi ISTE valute za ISTU firmu se otključavaju. U transakciji, da ne ostanu dva podrazumevana ako
// upis pukne na pola.
async function postaviPodrazumevani(businessId: string, currency: string, racunId: string) {
  await prisma.$transaction([
    prisma.bankAccount.updateMany({
      where: { businessId, currency, NOT: { id: racunId } },
      data: { isDefault: false },
    }),
    prisma.bankAccount.update({ where: { id: racunId }, data: { isDefault: true } }),
  ]);
}

export async function addAccount(userId: string, podaci: NoviRacunPodaci) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) throw new Error("Firma ne postoji.");

  const racun = await prisma.bankAccount.create({
    data: {
      businessId: biznis.id,
      type: podaci.type,
      currency: podaci.currency,
      bank: podaci.bank,
      number: podaci.type === "RSD" ? normalizujDinarskiRacun(podaci.number) : null,
      iban: podaci.type === "devizni" ? podaci.iban!.replace(/\s+/g, "").toUpperCase() : null,
      swift: podaci.type === "devizni" ? podaci.swift!.replace(/\s+/g, "").toUpperCase() : null,
      isDefault: podaci.isDefault,
    },
  });

  if (podaci.isDefault) await postaviPodrazumevani(biznis.id, podaci.currency, racun.id);

  return racun;
}

export async function updateAccount(
  userId: string,
  racunId: string,
  podaci: { bank: string; number?: string; iban?: string; swift?: string; isDefault: boolean },
) {
  const racun = await nadjiRacunKorisnika(userId, racunId);
  if (!racun) throw new Error("Račun ne postoji.");

  const azuriran = await prisma.bankAccount.update({
    where: { id: racun.id },
    data: {
      bank: podaci.bank,
      number: racun.type === "RSD" ? normalizujDinarskiRacun(podaci.number) : null,
      iban: racun.type === "devizni" ? podaci.iban!.replace(/\s+/g, "").toUpperCase() : null,
      swift: racun.type === "devizni" ? podaci.swift!.replace(/\s+/g, "").toUpperCase() : null,
      isDefault: podaci.isDefault,
    },
  });

  if (podaci.isDefault) await postaviPodrazumevani(racun.businessId, racun.currency, racun.id);

  return azuriran;
}

export type UklanjanjeRacunaRezultat =
  | { ok: true }
  | { ok: false; razlog: "ne_postoji" }
  | { ok: false; razlog: "u_upotrebi"; fakture: string[] };

// Uklanjanje računa koji se koristi na nacrtu fakture traži zamenu (spec 7.13). Korak 8a: sad proverava
// STVARNE Invoice zapise (zamenjuje privremeni InvoiceDraftStub iz Koraka 7, pre nego što su Fakture
// postojale - vidi bank-accounts.test.ts).
export async function removeAccount(userId: string, racunId: string): Promise<UklanjanjeRacunaRezultat> {
  const racun = await nadjiRacunKorisnika(userId, racunId);
  if (!racun) return { ok: false, razlog: "ne_postoji" };

  const nacrti = await prisma.invoice.findMany({
    where: { accountId: racun.id, status: "nacrt" },
    select: { number: true },
  });
  if (nacrti.length > 0) {
    return { ok: false, razlog: "u_upotrebi", fakture: nacrti.map((n) => n.number) };
  }

  await prisma.bankAccount.delete({ where: { id: racun.id } });
  return { ok: true };
}

export function validirajRacunPodatke(podaci: NoviRacunPodaci): Partial<Record<string, string>> {
  const errors: Partial<Record<string, string>> = {};
  if (!podaci.bank.trim()) errors.bank = "Unesi banku";

  if (podaci.type === "RSD") {
    if (!isValidDinarskiRacun(podaci.number)) {
      errors.number = "Broj računa nije ispravan (format 160-0000123456-78)";
    }
  } else {
    if (!isValidIban(podaci.iban)) errors.iban = "IBAN nije ispravan";
    if (!isValidSwift(podaci.swift)) errors.swift = "SWIFT nije ispravan";
  }

  return errors;
}
