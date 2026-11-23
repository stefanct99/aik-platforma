import { randomInt } from "node:crypto";

// Spec 1.5: domen je "tvojaiknjigovodja.rs", adresa za prijem "<korisnik>@prijem.tvojaiknjigovodja.rs".
// Domen još nije stvaran (nema pravog mejl servisa), zato je konstanta iz env promenljive sa
// podrazumevanom vrednošću, ne hardkodovana za svaku upotrebu.
export const INBOUND_MAIL_DOMAIN = process.env.INBOUND_MAIL_DOMAIN || "prijem.tvojaiknjigovodja.rs";

function translit(tekst: string): string {
  return tekst
    .replace(/[čć]/g, "c")
    .replace(/đ/g, "dj")
    .replace(/š/g, "s")
    .replace(/ž/g, "z");
}

export function slugifyBusinessName(name: string): string {
  const osnovno = translit(name.toLowerCase())
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  return osnovno || "firma";
}

const ALFABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function generateInboundCode(duzina = 4): string {
  let kod = "";
  for (let i = 0; i < duzina; i++) {
    kod += ALFABET[randomInt(ALFABET.length)];
  }
  return kod;
}

export function composeInboundAddress(slug: string, code: string): string {
  return `${slug}-${code}@${INBOUND_MAIL_DOMAIN}`;
}
