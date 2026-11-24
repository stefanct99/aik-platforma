import { prisma } from "./prisma";

// Zaključavanje naloga po e-mailu (Korak 5, spec 7.1): 5 uzastopnih neuspešnih pokušaja zaključava
// prijavu na 15 minuta. Čuva se u bazi (LoginAttempt), ne u memoriji, i po e-mailu, ne po IP adresi.

const MAX_POKUSAJA = 5;
const TRAJANJE_ZAKLJUCAVANJA_MIN = 15;

function normalizujEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function jeZakljucano(email: string): Promise<boolean> {
  const red = await prisma.loginAttempt.findUnique({ where: { email: normalizujEmail(email) } });
  return !!red?.lockedUntil && red.lockedUntil > new Date();
}

// Poziva se posle neuspešnog pokušaja (pogrešna lozinka ili nepostojeći nalog, ista putanja za oba da
// se ne otkrije postojanje naloga). Vraća true ako je OVAJ pokušaj upravo zaključao nalog.
export async function zabeleziNeuspeh(email: string): Promise<boolean> {
  const normalizovan = normalizujEmail(email);
  const postojeci = await prisma.loginAttempt.findUnique({ where: { email: normalizovan } });

  // Ako je prethodno zaključavanje već isteklo, broj pokušaja kreće ponovo od 0.
  const bazniBroj = postojeci && (!postojeci.lockedUntil || postojeci.lockedUntil > new Date())
    ? postojeci.failedCount
    : 0;
  const noviBroj = bazniBroj + 1;
  const zakljucava = noviBroj >= MAX_POKUSAJA;
  const lockedUntil = zakljucava
    ? new Date(Date.now() + TRAJANJE_ZAKLJUCAVANJA_MIN * 60 * 1000)
    : null;

  await prisma.loginAttempt.upsert({
    where: { email: normalizovan },
    create: { email: normalizovan, failedCount: noviBroj, lockedUntil },
    update: { failedCount: noviBroj, lockedUntil },
  });

  return zakljucava;
}

export async function resetujNeuspehe(email: string): Promise<void> {
  const normalizovan = normalizujEmail(email);
  await prisma.loginAttempt.deleteMany({ where: { email: normalizovan } });
}
