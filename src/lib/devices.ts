// Prijavljeni uređaji (Korak 7, spec 7.13): prave sesije korisnika (Session model, već postoji od
// Better Auth-a), ne izmišljeni spisak. "Odjavi" sme da ugasi SAMO sesiju koja pripada tom korisniku
// (provera userId), da korisnik A ne može da odjavi uređaj korisnika B pogađanjem id-a sesije.

import { prisma } from "./prisma";

export async function getSessionsForUser(userId: string) {
  return prisma.session.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
}

export async function logoutSession(userId: string, sessionId: string, tekucaSesijaToken: string) {
  const sesija = await prisma.session.findFirst({ where: { id: sessionId, userId } });
  if (!sesija) return;
  if (sesija.token === tekucaSesijaToken) return; // ne gasi sopstvenu trenutnu sesiju odavde
  await prisma.session.delete({ where: { id: sesija.id } });
}
