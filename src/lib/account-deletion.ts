// Brisanje naloga (Korak 7, spec 6.12, Pd9): stvarno briše SVE podatke korisnika. User je koren svih
// relacija (Session, Account, Business -> BankAccount -> InvoiceDraftStub, NotificationSettings), sve je
// @@relation(onDelete: Cascade) u schema.prisma, zato brisanje samog User reda briše sve ostalo. Jedini
// izuzetak je LoginAttempt (Korak 5): čuva se po e-mailu, nema FK vezu ka User-u, zato se briše posebno.
// Admin nalog se NE briše ovim putem (zahtev zadatka Koraka 7).

import { prisma } from "./prisma";

export class AdminNalogNeMozeDaSeObriseError extends Error {
  constructor() {
    super("Admin nalog ne može da se obriše ovim putem.");
  }
}

export async function obrisiNalogKorisnika(userId: string): Promise<void> {
  const korisnik = await prisma.user.findUnique({ where: { id: userId } });
  if (!korisnik) return;
  if (korisnik.role === "admin") throw new AdminNalogNeMozeDaSeObriseError();

  await prisma.loginAttempt.deleteMany({ where: { email: korisnik.email } });
  await prisma.user.delete({ where: { id: userId } });
}
