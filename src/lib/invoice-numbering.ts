// Numeracija faktura (Korak 8a) - pravilo koje je Stefan odlučio i koje PREGAZI i specifikaciju (8.2) i
// prototip (invoiceNumbering.js): format "N/GG-M". N = redni broj fakture u KALENDARSKOJ GODINI
// IZDAVANJA za tu firmu (ne "poslovna godina"), GG = poslednje dve cifre godine datuma izdavanja, M =
// mesec datuma izdavanja BEZ vodeće nule (1-12). Primeri: "1/27-1", "25/26-11", "41/26-12".
//
// Ovo su čiste funkcije (format/parse), bez baze. Sam brojač (sledeći broj, po firmi i godini, atomski
// preko InvoiceCounter) živi u src/lib/invoices.ts, jer zahteva transakciju nad bazom.

export function formatBrojFakture(redniBroj: number, datumIzdavanja: Date): string {
  const godina2 = String(datumIzdavanja.getUTCFullYear()).slice(-2);
  const mesec = datumIzdavanja.getUTCMonth() + 1;
  return `${redniBroj}/${godina2}-${mesec}`;
}

export type ParsiraniBrojFakture = { redniBroj: number; godina2: string; mesec: number };

export function parseBrojFakture(broj: string): ParsiraniBrojFakture | null {
  const poklapanje = broj.trim().match(/^(\d+)\/(\d{2})-(\d{1,2})$/);
  if (!poklapanje) return null;

  const redniBroj = Number(poklapanje[1]);
  const mesec = Number(poklapanje[3]);
  if (mesec < 1 || mesec > 12) return null;
  if (redniBroj < 1) return null;

  return { redniBroj, godina2: poklapanje[2], mesec };
}
