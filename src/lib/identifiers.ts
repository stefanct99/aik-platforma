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

// DINARSKI BROJ RAČUNA (Korak 7, spec 7.13): format 3-13-2 (18 cifara), potvrđeno iz zvaničnog izvora -
// Odluka o jedinstvenoj strukturi tekućih računa, "Sl. glasnik RS" br. 55/2015, tačke 3-6: prve tri
// cifre su fiksni broj pružaoca platnih usluga (banke), sledećih 13 je broj računa, poslednje dve su
// kontrolni broj. Kontrolni broj se računa za niz od 16 cifara (banka + broj računa) po ISO 7064 MODUL
// 97: taj niz se pomnoži sa 100, podeli sa 97, ostatak se oduzme od 98, rezultat se piše kao dve cifre
// (dozvoljena vodeća nula). U pisanom obliku se piše sa crtama (npr. "160-0000123456-78"), vodeće nule
// u srednjem delu mogu da se izostave - zato se unos normalizuje (dopuni nulama do 13 cifara) pre
// provere kontrolnog broja.
export function normalizujDinarskiRacun(str: string | null | undefined): string {
  const delovi = String(str == null ? "" : str)
    .trim()
    .split("-");
  if (delovi.length !== 3) return sanitizeDigits(str);
  const [banka, broj, kontrola] = delovi.map((deo) => sanitizeDigits(deo));
  return `${banka.padStart(3, "0")}${broj.padStart(13, "0")}${kontrola.padStart(2, "0")}`;
}

export function isValidDinarskiRacun(str: string | null | undefined): boolean {
  const cifre = normalizujDinarskiRacun(str);
  if (!/^\d{18}$/.test(cifre)) return false;
  const osnova = cifre.slice(0, 16);
  const kontrola = cifre.slice(16);
  const ostatak = Number((BigInt(osnova) * BigInt(100)) % BigInt(97));
  const izracunata = String(98 - ostatak).padStart(2, "0");
  return izracunata === kontrola;
}

// IBAN (Korak 7): standardna provera ISO 13616, MOD 97-10 (ista porodica algoritama kao dinarski račun
// iznad, samo primenjena na ceo IBAN sa pomerenim prefiksom). Srpski IBAN ima 22 karaktera (RS + 2
// kontrolne cifre + 3 banka + 13 račun + 2 nacionalna kontrola), ali provera ispod radi za IBAN bilo koje
// zemlje (dužina i format se razlikuju po zemlji, ovde se ne ograničava samo na RS).
export function isValidIban(str: string | null | undefined): boolean {
  const ociscen = String(str == null ? "" : str)
    .replace(/\s+/g, "")
    .toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(ociscen)) return false;

  const premesten = ociscen.slice(4) + ociscen.slice(0, 4);
  const brojcano = premesten.replace(/[A-Z]/g, (slovo) => String(slovo.charCodeAt(0) - 55));
  let ostatak = 0;
  for (const cifra of brojcano) {
    ostatak = (ostatak * 10 + Number(cifra)) % 97;
  }
  return ostatak === 1;
}

// SWIFT/BIC (Korak 7): 8 ili 11 znakova - 4 slova (banka), 2 slova (zemlja), 2 slova/cifre (lokacija),
// opciono 3 slova/cifre (filijala). Standardan format (ISO 9362), bez posebne kontrolne cifre.
export function isValidSwift(str: string | null | undefined): boolean {
  const ociscen = String(str == null ? "" : str)
    .replace(/\s+/g, "")
    .toUpperCase();
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(ociscen);
}
