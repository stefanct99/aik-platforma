// Jedna komanda (zadatak tačka 3): npm run test:e2e [-- <filter>]. Pravi probni nalog (scripts/e2e-seed.ts),
// pokreće Playwright, PA UVEK (čak i ako testovi padnu, ili ih korisnik prekine) čisti probni nalog
// (scripts/e2e-cleanup.ts - zadatak tačka 1: "čisti posle") i ispisuje kratak sažetak na srpskom iz JSON
// izveštaja, i putanju do HTML izveštaja.
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const TSX = ["npx", "tsx", "--env-file=.env.local"];

const filter = process.argv.slice(2);

console.log("Pravim probni E2E nalog...");
const seed = spawnSync(TSX[0], [...TSX.slice(1), "scripts/e2e-seed.ts"], { stdio: "inherit" });
if (seed.status !== 0) {
  console.error("\nSeed probnog naloga nije uspeo - testovi se NE pokreću (videti grešku iznad).");
  process.exit(seed.status ?? 1);
}

let rezultat: ReturnType<typeof spawnSync>;
try {
  rezultat = spawnSync("npx", ["playwright", "test", ...filter], { stdio: "inherit" });
} finally {
  console.log("\nČistim probni E2E nalog...");
  spawnSync(TSX[0], [...TSX.slice(1), "scripts/e2e-cleanup.ts"], { stdio: "inherit" });
}

const JSON_IZVESTAJ = "test-results/results.json";
const HTML_IZVESTAJ = "test-results/html-report/index.html";

function sazetak() {
  if (!existsSync(JSON_IZVESTAJ)) {
    console.log("\n(Nema JSON izveštaja - Playwright se verovatno nije ni pokrenuo, videti grešku iznad.)");
    return;
  }

  const izvestaj = JSON.parse(readFileSync(JSON_IZVESTAJ, "utf-8"));
  let prosloUkupno = 0;
  let paloUkupno = 0;
  let preskocenoUkupno = 0;
  const pali: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Playwright-ov JSON izveštaj, nije vredno pun tip.
  function obidjiSpec(spec: any, putanja: string[]) {
    for (const test of spec.tests ?? []) {
      const poslednji = test.results?.[test.results.length - 1];
      const status = poslednji?.status ?? test.status;
      if (status === "passed") prosloUkupno++;
      else if (status === "skipped") preskocenoUkupno++;
      else {
        paloUkupno++;
        const razlog = poslednji?.error?.message?.split("\n")[0] ?? "nepoznata greška";
        pali.push(`${[...putanja, spec.title].join(" > ")}: ${razlog}`);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function obidjiSuite(suite: any, putanja: string[] = []) {
    for (const spec of suite.specs ?? []) obidjiSpec(spec, putanja);
    for (const pod of suite.suites ?? []) obidjiSuite(pod, [...putanja, pod.title]);
  }

  for (const file of izvestaj.suites ?? []) obidjiSuite(file, [file.title]);

  console.log("\n===== Sažetak (E2E testovi) =====");
  console.log(`Prošlo: ${prosloUkupno}   Palo: ${paloUkupno}   Preskočeno: ${preskocenoUkupno}`);
  if (pali.length > 0) {
    console.log("\nPali testovi:");
    for (const p of pali) console.log(`  - ${p}`);
  }
  console.log(`\nHTML izveštaj: ${HTML_IZVESTAJ}`);
  console.log("===================================\n");
}

sazetak();
process.exit(rezultat.status ?? 1);
