// Deo src/lib/notification-settings.ts koji NEMA zavisnost od prisma (Korak 7): u sopstvenom fajlu da ga
// klijentska komponenta (ObavestenjaTab.tsx) može uvesti bez povlačenja "pg" u browser snop (next build
// je prijavljivao "Module not found: tls/util/types" jer bi inače ceo notification-settings.ts, sa
// njegovim top-level `import { prisma }`, ušao u klijentski bundle).

export const VRSTE_OBAVESTENJA = [
  { kljuc: "rokovi", naziv: "Rokovi za porez", opis: "Podsetnik pre isteka roka" },
  { kljuc: "kasne", naziv: "Kasne fakture", opis: "Kad faktura probije rok plaćanja" },
  { kljuc: "mejl", naziv: "Novi mejl banke", opis: "Kad stigne priliv ili zahtev banke" },
  { kljuc: "primetio", naziv: "AI je nešto primetio", opis: "Uplata bez fakture, blizu limita" },
  { kljuc: "propisi", naziv: "Promena propisa", opis: "Kad se promeni nešto što te se tiče" },
  { kljuc: "nedeljni", naziv: "Nedeljni pregled", opis: "Kratak rezime svakog ponedeljka" },
] as const;

export type VrstaObavestenja = (typeof VRSTE_OBAVESTENJA)[number]["kljuc"];
export type Kanal = "mail" | "push";
