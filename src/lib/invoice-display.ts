// Prikaz statusa fakture (Korak 8a, spec 7.3/7.5/8.1): labela i "vrsta" značke za dati efektivni status.
// Čisto za prikaz, bez baze - koristi se i u listi i u pregledu fakture.

import { brojDanaKasnjenja, type EfektivniStatus } from "./invoice-status";

export function labelaStatusa(status: EfektivniStatus, izdata: Date, dueDays: number, danas: Date): string {
  if (status === "kasni") {
    const dani = brojDanaKasnjenja(izdata, dueDays, danas);
    return `Kasni ${dani} ${recDan(dani)}`;
  }
  const mapa: Record<Exclude<EfektivniStatus, "kasni">, string> = {
    nacrt: "Nacrt",
    poslata: "Poslata",
    placena: "Plaćena",
    stornirana: "Stornirana",
  };
  return mapa[status];
}

// Vrsta značke (CSS varijanta) po efektivnom statusu - videti StatusZnacka.module.css za boje.
export function vrstaZnacke(status: EfektivniStatus): "nacrt" | "poslata" | "kasni" | "placena" | "stornirana" {
  return status;
}

export function recDan(n: number): string {
  const poslednjeDveCifre = n % 100;
  if (poslednjeDveCifre >= 11 && poslednjeDveCifre <= 14) return "dana";
  const poslednjaCifra = n % 10;
  if (poslednjaCifra === 1) return "dan";
  return "dana";
}
