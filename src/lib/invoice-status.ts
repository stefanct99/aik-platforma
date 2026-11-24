// Status fakture izveden iz datuma (Korak 8a, spec 8.1; prepisano iz
// referenca/prototip/js/rules/invoiceStatus.js u TypeScript, ista logika). Pet stanja: Nacrt, Poslata,
// Kasni (IZVEDENO, nikad upisano polje), Plaćena, Stornirana. "Kasni" se računa iz "danas" pri svakom
// pozivu - samo faktura sa upisanim statusom "poslata" može efektivno postati "kasni", i to tek pošto
// prođe rok (izdata + dueDays). Nacrt/Plaćena/Stornirana nikad ne "kasne".

export type StatusFakture = "nacrt" | "poslata" | "placena" | "stornirana";
export type EfektivniStatus = StatusFakture | "kasni";

export type StavkaFakture = { qty: number; price: number };

export function izracunajUkupno(stavke: StavkaFakture[]): number {
  return stavke.reduce((zbir, st) => zbir + (st.qty || 1) * (st.price || 0), 0);
}

export function rokFakture(izdata: Date, dueDays: number): Date {
  const d = new Date(izdata);
  d.setUTCDate(d.getUTCDate() + (dueDays || 0));
  return d;
}

export function jeFakturaKasni(status: StatusFakture, izdata: Date, dueDays: number, danas: Date): boolean {
  if (status !== "poslata") return false;
  return danas.getTime() > rokFakture(izdata, dueDays).getTime();
}

export function efektivniStatus(
  status: StatusFakture,
  izdata: Date,
  dueDays: number,
  danas: Date,
): EfektivniStatus {
  if (status === "poslata" && jeFakturaKasni(status, izdata, dueDays, danas)) return "kasni";
  return status;
}

export function brojDanaKasnjenja(izdata: Date, dueDays: number, danas: Date): number {
  const rok = rokFakture(izdata, dueDays);
  const dani = Math.round((danas.getTime() - rok.getTime()) / 86400000);
  return Math.max(0, dani);
}
