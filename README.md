# tvoj AI knjigovođa — platforma

Ovo je pravi razvojni projekat aplikacije "tvoj AI knjigovođa" (AI knjigovođa za paušalce u Srbiji).
Next.js (App Router) sa TypeScript u strogom režimu i PostgreSQL bazom.

Prototip (`referenca/prototip`) i specifikacije (`referenca/specifikacije`) su u ovom repozitorijumu kao
referenca za čitanje. Ne menjaju se i nisu deo koda koji se isporučuje.

## Komande

Instalacija paketa (jednom, i posle svake izmene `package.json`):

```bash
npm install
```

Pokretanje razvojnog servera (http://localhost:3000):

```bash
npm run dev
```

Pokretanje testova:

```bash
npm run test
```

Provera tipova (TypeScript):

```bash
npx tsc --noEmit
```

Provera koda (ESLint):

```bash
npm run lint
```

Provera formatiranja (Prettier), i automatsko sređivanje:

```bash
npm run format:check
npm run format
```

## Promenljive okruženja

Kopiraj `.env.example` u `.env.local` i popuni stvarne vrednosti. `.env.local` se nikad ne komituje u git
(vidi `.gitignore`).

```bash
cp .env.example .env.local
```

## Baza podataka

Razvojna baza se zove `aik_dev`, lokalni PostgreSQL. Uputstvo za instalaciju je u razgovoru sa Claude
Code-om (Sektor 2, Korak 0) — ukratko: Homebrew, zatim `brew install postgresql@17` (ili aktuelna stabilna
verzija), pa `createdb aik_dev`.

## Struktura

- `src/app` — Next.js App Router (ekrani i API rute).
- `src/lib` — pomoćne funkcije bez UI-a i bez stanja (testirane Vitest-om).
- `referenca/prototip` — stari HTML/CSS/JS prototip, samo za čitanje, izvor istine za izgled dok se ekrani
  ne prenesu.
- `referenca/specifikacije` — specifikacija platforme i admina, samo za čitanje.
