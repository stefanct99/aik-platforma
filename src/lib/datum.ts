// Srpski format datuma (spec 7.13: "paušalac od 14.03.2024."): DD.MM.GGGG. sa tačkom na kraju.
export function formatDatumSrpski(datum: Date): string {
  // UTC, ne lokalno vreme: datum se čuva kao kalendarski dan (iz <input type="date">), ne kao trenutak,
  // pa lokalna vremenska zona servera ne sme da ga pomeri za jedan dan.
  const dan = String(datum.getUTCDate()).padStart(2, "0");
  const mesec = String(datum.getUTCMonth() + 1).padStart(2, "0");
  const godina = datum.getUTCFullYear();
  return `${dan}.${mesec}.${godina}.`;
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
