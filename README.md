# tvoj AI knjigovođa: platforma

Ovo je pravi razvojni projekat aplikacije "tvoj AI knjigovođa" (AI knjigovođa za paušalce u Srbiji).
Next.js (App Router) sa TypeScript u strogom režimu, PostgreSQL bazom, Prisma ORM-om i Better Auth
prijavom.

Prototip (`referenca/prototip`) i specifikacije (`referenca/specifikacije`) su u ovom repozitorijumu kao
referenca za čitanje. Ne menjaju se i nisu deo koda koji se isporučuje.

## Pokretanje, prvi put na novom računaru

1. Instaliraj pakete:

   ```bash
   npm install
   ```

2. Pobrini se da lokalni PostgreSQL radi i da baza `aik_dev` postoji:

   ```bash
   brew services start postgresql@17
   createdb aik_dev
   ```

3. Kopiraj `.env.example` u `.env.local` i popuni stvarne vrednosti (`DATABASE_URL`,
   `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`). `.env.local` se nikad ne komituje u git (vidi `.gitignore`).

   ```bash
   cp .env.example .env.local
   ```

4. Generiši Prisma klijent i primeni migracije (pravi tabele u bazi):

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Pokreni razvojni server:

   ```bash
   npm run dev
   ```

   Otvori `http://localhost:3000/prijava`. Pošalji link za prijavu, pa ga u razvojnom režimu nađi u
   terminalu u kom radi server (pravi mejl servis još ne postoji, vidi `src/lib/magic-link-mail.ts`).

## Uloga admina

Niko ne postaje admin kroz aplikaciju. Korisnik se prvo bar jednom prijavi (magic linkom), pa se njegova
uloga ručno promeni skriptom:

```bash
npm run make-admin -- mejl@primer.rs
```

Dok ne postoji dvostepena (TOTP) prijava za admina, admin se magic linkom može prijaviti samo u
razvojnom režimu (vidi `src/lib/admin-dev-gate.ts`).

## Ostale komande

```bash
npm run test          # Vitest
npx tsc --noEmit       # provera tipova
npm run lint           # ESLint
npm run format:check   # Prettier, samo provera
npm run format         # Prettier, sređuje fajlove
npm run build           # produkcioni build
```

## Struktura

- `src/app`: Next.js App Router (ekrani i API rute).
- `src/lib`: pomoćne funkcije i podešavanja (Prisma klijent, Better Auth, pravila), testirane Vitest-om.
- `src/proxy.ts`: štiti `/pocetna` od neprijavljenih korisnika.
- `prisma/`: šema baze i migracije.
- `scripts/`: skripte koje se pokreću ručno (npr. `make-admin`).
- `referenca/prototip`: stari HTML/CSS/JS prototip, samo za čitanje, izvor istine za izgled dok se ekrani
  ne prenesu.
- `referenca/specifikacije`: specifikacija platforme i admina, samo za čitanje.
