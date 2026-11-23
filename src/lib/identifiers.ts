// Identifikatori firme (PLATFORMA_SPECIFIKACIJA.md 3.1): PIB je 9 cifara, matični broj je 8 cifara,
// poštanski broj je 5 cifara. Preneto iz referenca/prototip/js/rules/identifiers.js, ista pravila.
//
// KONTROLNA CIFRA PIB-a (Korak 3): potvrđena iz zvaničnog izvora, Pravilnik o poreskom identifikacionom
// broju ("Sl. glasnik RS", br. 57/2003, 68/2003, 32/2009, 48/2010 i 44/2018 - dr. zakon), član 2: PIB ima
// 9 cifara, prvih 8 je redni broj registracije, 9. je kontrolni broj, koji se "računa za niz od osam
// numeričkih cifara po međunarodnom standardu ISO 7064, MODUL (11,10)". Sam postupak računanja (koji
// Pravilnik ne opisuje korak po korak) preuzet je iz te međunarodne norme, proveren test-primerom iz
// biblioteke python-stdnum (stdnum.iso7064.mod_11_10, otvoreni kod) i potvrđen na tri stvarna PIB-a iz
// zvaničnog registra Agencije za privredne registre (pretraga.apr.gov.rs, 23.11.2026): Agencija za
// privredne registre 103445385, Telekom Srbija a.d. 100002887, Kompanija Dunav osiguranje a.d.o.
// 100001958. Sva tri prolaze proveru, izmenjena poslednja cifra ne prolazi.
//
// KONTROLNA CIFRA matičnog broja: NIJE ugrađena. Nijedan zvaničan izvor (zakon, pravilnik, APR, RZS)
// koji sam pronašao ne navodi da matični broj uopšte ima kontrolnu cifru niti opisuje postupak računanja.
// Postoji samo jedan neuzvaničan izvor (blog), koji sam izneo i proverio u izveštaju Koraka 3, ali pošto
// nije zvaničan ni ravnopravno pouzdan, nije ugrađen ovde. isValidMb ostaje provera samog formata (8
// cifara), kao u prototipu.

export function sanitizeDigits(str: string | null | undefined, maxLen?: number): string {
  const digits = String(str == null ? "" : str).replace(/\D/g, "");
  return maxLen ? digits.slice(0, maxLen) : digits;
}

export function jePibFormatIspravan(str: string | null | undefined): boolean {
  return /^\d{9}$/.test(String(str == null ? "" : str));
}

// ISO 7064, MODUL (11,10), primenjeno na niz cifara (uključujući kontrolnu cifru na kraju). Ispravan
// niz daje kontrolnu sumu 1. Videti napomenu iznad za izvor i proveru.
function iso7064Mod1110ValidanNiz(cifre: string): boolean {
  let kontrola = 5;
  for (const znak of cifre) {
    const cifra = Number(znak);
    kontrola = (((kontrola || 10) * 2) % 11 + cifra) % 10;
  }
  return kontrola === 1;
}

// Provera formata (9 cifara) I kontrolne cifre (ISO 7064 MODUL (11,10), videti napomenu iznad).
export function isValidPib(str: string | null | undefined): boolean {
  const pib = String(str == null ? "" : str);
  if (!jePibFormatIspravan(pib)) return false;
  return iso7064Mod1110ValidanNiz(pib);
}

// Samo provera formata (8 cifara). Kontrolna cifra namerno nije uključena, videti napomenu iznad.
export function isValidMb(str: string | null | undefined): boolean {
  return /^\d{8}$/.test(String(str == null ? "" : str));
}

export function isValidZip(str: string | null | undefined): boolean {
  return /^\d{5}$/.test(String(str == null ? "" : str));
}
