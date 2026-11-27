// Pokreće Next.js server za E2E testove (Playwright webServer), na posebnom portu, nad test bazom
// (aik_test) - NIKAD nad aik_dev. Bezbednosna provera (proveriDaJeTestBaza) se radi OVDE, pre spawn-a, u
// istom duhu kao scripts/pripremi-test-bazu.ts.
import { spawn } from "node:child_process";
import { config } from "dotenv";
import { proveriDaJeTestBaza } from "../src/lib/test-db-safety";

config({ path: ".env.local" });
proveriDaJeTestBaza(process.env.DATABASE_URL_TEST);

const port = process.env.E2E_PORT ?? "3100";

const child = spawn("npx", ["next", "dev", "-p", port], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL_TEST,
    BETTER_AUTH_URL: `http://localhost:${port}`,
    NODE_ENV: "development",
  },
});

child.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGTERM", () => child.kill("SIGTERM"));
process.on("SIGINT", () => child.kill("SIGINT"));
