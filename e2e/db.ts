// Poziva scripts/e2e-db.ts kao poseban proces (videti komentar tamo - Playwright ne ume da dinamički
// uveze generisanog Prisma klijenta). Koriste ga testovi kojima treba direktan uvid/upis u bazu (npr.
// templateSnapshot, koji UI sam ne prikazuje).
import { execFileSync } from "node:child_process";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- rezultat zavisi od komande (CLI iznad).
export function e2eDb(komanda: string, argumenti?: Record<string, unknown>): any {
  const izlaz = execFileSync(
    "npx",
    ["tsx", "--env-file=.env.local", "scripts/e2e-db.ts", komanda, JSON.stringify(argumenti ?? {})],
    { encoding: "utf-8" },
  );
  return JSON.parse(izlaz.trim().split("\n").pop()!);
}
