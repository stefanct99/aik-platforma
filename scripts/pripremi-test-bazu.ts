// Priprema test baze (aik_test) za automatske testove: primenjuje sve Prisma migracije na nju, nikad na
// aik_dev. Pokreni sa:
//   npx tsx --env-file=.env.local scripts/pripremi-test-bazu.ts
// Ponovo pokreni posle svake nove migracije (prisma/migrations/).

import { execSync } from "node:child_process";
import { proveriDaJeTestBaza } from "../src/lib/test-db-safety";

const testUrl = process.env.DATABASE_URL_TEST;
proveriDaJeTestBaza(testUrl);

console.log("Primenjujem migracije na test bazu...");
execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: testUrl },
});
console.log("Test baza je spremna.");
