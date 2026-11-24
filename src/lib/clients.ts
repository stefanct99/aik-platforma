// Klijenti (Korak 8a, spec 3.3, 7.6). Firma se, kao svuda, uzima ISKLJUČIVO preko getBusinessForUser
// (userId), nikad preko id-a iz forme, da korisnik A ne može da vidi ni menja klijente korisnika B.

import { prisma } from "./prisma";
import { getBusinessForUser } from "./business";

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
