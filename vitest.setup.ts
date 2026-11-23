import { config } from "dotenv";
import { proveriDaJeTestBaza } from "./src/lib/test-db-safety";

// Next.js sam učitava .env.local pri pokretanju aplikacije, ali Vitest ne; neki testovi
// (src/lib/business.test.ts) se povezuju na pravu bazu, pa im treba DATABASE_URL.
config({ path: ".env.local" });

// Korak 3: testovi NIKAD ne smeju da rade nad aik_dev. Umesto DATABASE_URL (razvojna baza), testovi
// koriste DATABASE_URL_TEST (aik_test). Bezbednosna provera prekida testove pre ikakvog upisa ako ime
// baze ne završava na "_test" (videti src/lib/test-db-safety.ts).
proveriDaJeTestBaza(process.env.DATABASE_URL_TEST);
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
