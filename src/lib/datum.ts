// Srpski format datuma (spec 7.13: "paušalac od 14.03.2024."): DD.MM.GGGG. sa tačkom na kraju.
export function formatDatumSrpski(datum: Date): string {
  return formatDatum(datum, "dmy");
}

export type FormatDatuma = "dmy" | "iso";

// Deljena funkcija za SVAKI prikaz datuma u aplikaciji koji prati korisnikovo podešavanje iz Jezik i
// izgled (Korak 7, Pd7). "dmy" = 15.11.2026. (isto što formatDatumSrpski vraća), "iso" = 2026-11-15,
// potvrđeno protiv referenca/prototip/js/utils.js fmtDate(). Polja za UNOS datuma (onboarding, Profil i
// firma regDate) OSTAJU fiksno u dmy formatu nezavisno od ovog podešavanja, jer njihov parser
// (parseDatumSrpski) prihvata samo dmy - to je svesna odluka, navedena u izveštaju Koraka 7.
export function formatDatum(datum: Date, format: FormatDatuma): string {
  // UTC, ne lokalno vreme: datum se čuva kao kalendarski dan (iz <input type="date">), ne kao trenutak,
  // pa lokalna vremenska zona servera ne sme da ga pomeri za jedan dan.
  const dan = String(datum.getUTCDate()).padStart(2, "0");
  const mesec = String(datum.getUTCMonth() + 1).padStart(2, "0");
  const godina = datum.getUTCFullYear();
  return format === "iso" ? `${godina}-${mesec}-${dan}` : `${dan}.${mesec}.${godina}.`;
}

// Korak 6 (ispravka): onboarding Korak 1 unosi datum otvaranja kao tekst u ovom istom formatu
// (dd.mm.gggg.), ne preko <input type="date"> - frejmovi to tako pokazuju. Parsira i PROVERAVA da je
// stvaran kalendarski dan (31.02. se odbija, ne tiho prebacuje na 03.03. kako bi obično Date uradio),
// tačka na kraju je opciona pri unosu (korisnik je ne mora otkucati).
export function parseDatumSrpski(tekst: string): Date | null {
  const poklapanje = tekst.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?$/);
  if (!poklapanje) return null;

  const dan = Number(poklapanje[1]);
  const mesec = Number(poklapanje[2]);
  const godina = Number(poklapanje[3]);

  const datum = new Date(Date.UTC(godina, mesec - 1, dan));
  const jeIspravan =
    datum.getUTCFullYear() === godina && datum.getUTCMonth() === mesec - 1 && datum.getUTCDate() === dan;

  return jeIspravan ? datum : null;
}

// Korak 8a (Fakture): "danas" za računanje statusa/kašnjenja (Kasni N dana) MORA biti ponoć po UTC,
// isto kao issueDate/rok (oba su kalendarski dani, bez komponente vremena) - inače Math.round u
// brojDanaKasnjenja zaokružuje na gore/dole zavisno od doba dana kad se stranica otvori.
export function pocetakDanaUtc(datum: Date = new Date()): Date {
  const d = new Date(datum);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
