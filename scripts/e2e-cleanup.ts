// Briše probni E2E nalog POSLE pokretanja (zadatak tačka 1: "čisti posle"), bez obzira da li su testovi
// prošli ili pali - scripts/e2e-run.ts ovo pokreće u "finally" grani.
import { unlinkSync } from "node:fs";
import { config } from "dotenv";
import { proveriDaJeTestBaza } from "../src/lib/test-db-safety";

config({ path: ".env.local" });
proveriDaJeTestBaza(process.env.DATABASE_URL_TEST);
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;

const E2E_EMAIL = "e2e-test@aik-test.local";
const E2E_CREDS_FILE = ".playwright/.e2e-creds.json";

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  await prisma.user.deleteMany({ where: { email: E2E_EMAIL } });
  await prisma.loginAttempt.deleteMany({ where: { email: E2E_EMAIL } });
  await prisma.verification.deleteMany({ where: { identifier: E2E_EMAIL } });
  try {
    unlinkSync(E2E_CREDS_FILE);
  } catch {
    // već ne postoji - u redu je.
  }
  console.log("E2E probni nalog je obrisan.");
}

main()
  .catch((greska) => {
    console.error("Greška pri čišćenju E2E probnog naloga:", greska);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { prisma } = await import("../src/lib/prisma");
    await prisma.$disconnect();
  });
