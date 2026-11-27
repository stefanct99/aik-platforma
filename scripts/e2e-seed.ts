// Pravi probni nalog za E2E testove (zadatak: "poseban probni nalog ... koji se pravi seed skriptom pre
// svakog pokretanja i čisti posle") - pokreće ga scripts/e2e-run.ts, PRE Playwright-a (NE Playwright-ov
// globalSetup - taj ne ume da učita generisanog Prisma klijenta, videti komentar u scripts/e2e-db.ts).
import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { config } from "dotenv";
import { proveriDaJeTestBaza } from "../src/lib/test-db-safety";

config({ path: ".env.local" });
proveriDaJeTestBaza(process.env.DATABASE_URL_TEST);
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;

const E2E_EMAIL = "e2e-test@aik-test.local";
const E2E_CREDS_FILE = ".playwright/.e2e-creds.json";

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const { auth } = await import("../src/lib/auth");
  const { saveOnboardingStep1, saveOnboardingStep2, finishOnboarding, getBusinessForUser } = await import(
    "../src/lib/business"
  );
  const { addAccount } = await import("../src/lib/bank-accounts");
  const { createClient } = await import("../src/lib/clients");

  // Idempotentno: obriši prethodni probni nalog (ako je ostao od prekinutog pokretanja) PRE nego što
  // napraviš nov - cascade (schema.prisma) nosi sa sobom firmu, klijente, račune, fakture, šablone.
  await prisma.user.deleteMany({ where: { email: E2E_EMAIL } });
  await prisma.loginAttempt.deleteMany({ where: { email: E2E_EMAIL } });
  await prisma.verification.deleteMany({ where: { identifier: E2E_EMAIL } });

  // Lozinka: nasumična pri svakom pokretanju, upisana SAMO u lokalni git-ignorisan fajl (zadatak tačka 1:
  // "ne štampaj je u izveštaju") - testovi je čitaju odatle, nikad se ne ispisuje na konzoli.
  const lozinka = `E2e-${randomBytes(9).toString("hex")}`;
  mkdirSync(dirname(E2E_CREDS_FILE), { recursive: true });
  writeFileSync(E2E_CREDS_FILE, JSON.stringify({ email: E2E_EMAIL, password: lozinka }, null, 2));

  await auth.api.signUpEmail({
    body: { name: "Probni Petrović", email: E2E_EMAIL, password: lozinka },
    headers: new Headers(),
    asResponse: false,
  });
  // Potvrda e-maila se preskače NAMERNO (zadatak testira funkcionalnost aplikacije, ne sâm tok potvrde
  // e-maila preko razvojnog mejla - taj tok već pokriva ljudska provera izgleda, ne ovi testovi).
  await prisma.user.update({ where: { email: E2E_EMAIL }, data: { emailVerified: true } });

  const korisnik = await prisma.user.findUniqueOrThrow({ where: { email: E2E_EMAIL } });

  await saveOnboardingStep1(korisnik.id, {
    ownerName: "Probni Petrović",
    name: "E2E Probna Firma",
    pib: "123456789",
    mb: "20123456",
    delatnostCode: "62.10",
    delatnostName: "Računarsko programiranje",
    regDate: new Date("2024-01-01"),
  });
  await saveOnboardingStep2(korisnik.id, { street: "Probna 1", city: "Beograd", zip: "11000" });
  await finishOnboarding(korisnik.id);

  const biznis = await getBusinessForUser(korisnik.id);
  if (!biznis) throw new Error("E2E seed: firma nije napravljena.");

  await addAccount(korisnik.id, {
    type: "devizni",
    currency: "EUR",
    bank: "Probna Banka",
    iban: "RS35123456789012345678",
    swift: "PROBRS22",
    isDefault: true,
  });
  await addAccount(korisnik.id, {
    type: "RSD",
    currency: "RSD",
    bank: "Probna Banka",
    number: "160000001234567890",
    isDefault: true,
  });

  // Dva klijenta sa namerno različitom valutom/jezikom (zadatak tačka 4: pravilo dodele po klijentu,
  // valuti i jeziku - ovi klijenti pokrivaju sve tri dimenzije u testovima).
  await createClient(korisnik.id, {
    name: "Acme Inc. (E2E)",
    address: "100 Market St, Wilmington, DE 19801",
    billingEmail: "e2e-acme@aik-test.local",
    country: "United States",
    defaultCurrency: "EUR",
    defaultLang: "en",
    defaultDueDays: 7,
  });
  await createClient(korisnik.id, {
    name: "Dinarska Firma (E2E)",
    address: "Knez Mihailova 1, Beograd",
    billingEmail: "e2e-dinar@aik-test.local",
    country: "Srbija",
    defaultCurrency: "RSD",
    defaultLang: "sr",
    defaultDueDays: 15,
  });

  console.log("E2E probni nalog je spreman.");
}

main()
  .catch((greska) => {
    console.error("Greška pri pravljenju E2E probnog naloga:", greska);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { prisma } = await import("../src/lib/prisma");
    await prisma.$disconnect();
  });
