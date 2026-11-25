// Klijenti (Korak 8a, spec 3.3, 7.6). Firma se, kao svuda, uzima ISKLJUČIVO preko getBusinessForUser
// (userId), nikad preko id-a iz forme, da korisnik A ne može da vidi ni menja klijente korisnika B.

import { prisma } from "./prisma";
import { getBusinessForUser } from "./business";
import { isValidPib } from "./identifiers";

export type KlijentPodaci = {
  name: string;
  billingEmail: string;
  country: string;
  pib?: string;
  address?: string;
  defaultCurrency: string;
  defaultLang: "sr" | "en";
  defaultDueDays: number;
  defaultAccountId?: string | null;
  defaultItemDesc?: string | null;
  defaultItemAmount?: number | null;
  autoSendMode?: "nasledi" | "ask" | "auto";
  fxMode?: "proknjizi" | "prodaj_deo" | "prodaj_sve";
};

export type GreskeKlijentaPodataka = Partial<Record<"name" | "billingEmail" | "pib", string>>;

// Validacija forme Klijent (Korak 8a tab Klijenti, Korak 8b modal "Novi klijent" iz forme fakture - ISTA
// validacija, zadatak 8b tačka 4). PIB (ISO 7064 MOD 11,10) se proverava SAMO za domaćeg (dinarskog)
// klijenta - "Tip (domaći dinarski ili inostrani)" je izvedeno iz defaultCurrency==="RSD" (videti komentar
// na Client u schema.prisma). Za inostranog klijenta polje ostaje slobodno (spec 3.3: neobavezno).
export function validirajKlijentaPodatke(podaci: KlijentPodaci): GreskeKlijentaPodataka {
  const errors: GreskeKlijentaPodataka = {};
  if (!podaci.name) errors.name = "Unesi naziv klijenta";
  if (!podaci.billingEmail || !podaci.billingEmail.includes("@")) {
    errors.billingEmail = "Unesi ispravan mejl za fakture";
  }
  if (podaci.defaultCurrency === "RSD" && !isValidPib(podaci.pib)) {
    errors.pib = "Unesi ispravan PIB (9 cifara) za domaćeg klijenta.";
  }
  return errors;
}

export async function getClientsForUser(userId: string, ukljuciArhivirane = false) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return [];
  return prisma.client.findMany({
    where: { businessId: biznis.id, ...(ukljuciArhivirane ? {} : { archived: false }) },
    orderBy: { name: "asc" },
  });
}

export async function getClientForUser(userId: string, clientId: string) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return null;
  return prisma.client.findFirst({ where: { id: clientId, businessId: biznis.id } });
}

export async function createClient(userId: string, podaci: KlijentPodaci) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) throw new Error("Firma ne postoji.");
  return prisma.client.create({ data: { businessId: biznis.id, ...podaci } });
}

export async function updateClient(userId: string, clientId: string, podaci: KlijentPodaci) {
  const klijent = await getClientForUser(userId, clientId);
  if (!klijent) throw new Error("Klijent ne postoji.");
  return prisma.client.update({ where: { id: klijent.id }, data: podaci });
}

export type UklanjanjeKlijentaRezultat = { nacin: "obrisan" } | { nacin: "arhiviran" };

// "Klijent bez faktura može da se obriše" (spec 3.3), inače se arhivira (spec 7.6: "Obriši klijenta
// samo ako nema faktura, inače Arhiviraj"). Nikad obe opcije u isto dugme - UI zove removeOrArchiveClient
// i prikazuje tačno onaj natpis koji je ponašanje stvarno izvršilo.
export async function removeOrArchiveClient(
  userId: string,
  clientId: string,
): Promise<UklanjanjeKlijentaRezultat> {
  const klijent = await getClientForUser(userId, clientId);
  if (!klijent) throw new Error("Klijent ne postoji.");

  const brojFaktura = await prisma.invoice.count({ where: { clientId: klijent.id } });
  if (brojFaktura > 0) {
    await prisma.client.update({ where: { id: klijent.id }, data: { archived: true } });
    return { nacin: "arhiviran" };
  }

  await prisma.client.delete({ where: { id: klijent.id } });
  return { nacin: "obrisan" };
}

// Da li klijent SME da se obriše direktno (za prikaz pravog natpisa dugmeta u panelu, spec 7.6).
export async function imaFaktura(clientId: string): Promise<boolean> {
  const broj = await prisma.invoice.count({ where: { clientId } });
  return broj > 0;
}
