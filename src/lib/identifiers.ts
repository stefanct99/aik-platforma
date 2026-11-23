// Identifikatori firme (PLATFORMA_SPECIFIKACIJA.md 3.1): PIB je 9 cifara, matični broj je 8 cifara,
// poštanski broj je 5 cifara. Preneto iz referenca/prototip/js/rules/identifiers.js, ista pravila.
//
// NAPOMENA (razlika u odnosu na zadatak): tražena je "kontrolna provera" za PIB, ali ona ne postoji ni
// u prototipu (referenca/prototip/js/rules/identifiers.js) ni u specifikaciji (odeljak 3.1 samo kaže
// "PIB (9 cifara)"), nijedan izvor koji sam dobio ne sadrži algoritam kontrolne cifre. Nisam izmišljao
// kontrolnu cifru koja nije potvrđena u izvoru; isValidPib ostaje provera formata (9 cifara), kao u
// prototipu. Videti izveštaj Koraka 2.

export function sanitizeDigits(str: string | null | undefined, maxLen?: number): string {
  const digits = String(str == null ? "" : str).replace(/\D/g, "");
  return maxLen ? digits.slice(0, maxLen) : digits;
}

export function isValidPib(str: string | null | undefined): boolean {
  return /^\d{9}$/.test(String(str == null ? "" : str));
}

export function isValidMb(str: string | null | undefined): boolean {
  return /^\d{8}$/.test(String(str == null ? "" : str));
}

export function isValidZip(str: string | null | undefined): boolean {
  return /^\d{5}$/.test(String(str == null ? "" : str));
}
