import { config } from "dotenv";

// Next.js sam učitava .env.local pri pokretanju aplikacije, ali Vitest ne; neki testovi
// (src/lib/business.test.ts) se povezuju na pravu lokalnu bazu, pa im treba DATABASE_URL.
config({ path: ".env.local" });
