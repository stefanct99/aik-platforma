// Godišnji limit za paušalno oporezivanje (Korak 9a, spec 8.4): 6.000.000 din, praćen kao KLIZNI period
// od 365 dana unazad od "danas" (NE kalendarska godina - to je ODVOJEN zbir, "Ukupan prihod u [godina].",
// koji se računa drugde, u src/lib/prihodi.ts). Ovo je zajednička, čista funkcija (bez baze, bez Date.now())
// - "danas" je uvek parametar - da je kasnije mogu koristiti i Početna i Porez i rokovi bez dupliranja.
//
// Iznosi su u najmanjoj jedinici valute (para), isti princip kao svuda u aplikaciji (src/lib/money.ts) -
// LIMIT_PAUSALACA je zato 600.000.000 (= 6.000.000 din), ne 6000000.
import { formatNovacKompaktno, formatNovacPuno, formatProcenat } from "./money";

export const LIMIT_PAUSALACA = 600_000_000;

export type PausalniLimitRezultat = {
  ukupno: number;
  procenat: number;
  preostalo: number;
  limit: number;
};

// Uplata čiji je iznosRsd null (devizna uplata bez upisanog kursa - Korak 9a, kurs dolazi tek u 9b) se
// NE RAČUNA u zbir - isto pravilo kao za uplate "bez fakture" u prototipu (nema čime da se sabere).
export function izracunajPausalniLimit(
  uplate: { datum: Date; iznosRsd: number | null }[],
  danas: Date,
): PausalniLimitRezultat {
  const pre365Dana = new Date(danas);
  pre365Dana.setUTCDate(pre365Dana.getUTCDate() - 365);

  const ukupno = uplate
    .filter((u) => u.iznosRsd != null && u.datum >= pre365Dana && u.datum <= danas)
    .reduce((zbir, u) => zbir + u.iznosRsd!, 0);

  const procenat = Math.round((ukupno / LIMIT_PAUSALACA) * 1000) / 10;
  return { ukupno, procenat, preostalo: Math.max(0, LIMIT_PAUSALACA - ukupno), limit: LIMIT_PAUSALACA };
}

// Baner upozorenja na limit (Korak 9f, frejm Kp7 - samo prag 80%; 90/100 su odluka zadatka, bez frejma).
// Tri prага, >= (80,0% VEĆ je prag 80, ne 79,99%); preko 100% ostaje na nivou 100 (nema četvrtog nivoa).
export function pragLimitBanera(procenat: number): 80 | 90 | 100 | null {
  if (procenat >= 100) return 100;
  if (procenat >= 90) return 90;
  if (procenat >= 80) return 80;
  return null;
}

export type NivoLimitBanera = "upozorenje" | "opasnost";

export type SadrzajLimitBanera = {
  nivo: NivoLimitBanera;
  naslov: string;
  poruka: string;
} | null;

// Tekst banera po pragu. 80% i 90% imaju ISTU poruku (zadatak), razlikuje se samo naslov i nivo boje
// (90/100 su "opasnost" - crvenkasta varijanta, izvedena iz --color-alert-danger-* u komponenti, ne
// ovde). 100% ima drugačiju poruku (preostalo tu više nema smisla - limit je već pređen).
export function sadrzajLimitBanera(
  procenat: number,
  preostalo: number,
): SadrzajLimitBanera {
  const prag = pragLimitBanera(procenat);
  if (prag === null) return null;

  const limitKompaktno = formatNovacKompaktno(LIMIT_PAUSALACA, "RSD");
  if (prag === 100) {
    return {
      nivo: "opasnost",
      naslov: "Prešao si limit za paušalce",
      poruka: `Prešao si ${limitKompaktno}. Menja se način oporezivanja, pa se javi knjigovođi da vidiš šta dalje.`,
    };
  }

  const poruka = `Do ${limitKompaktno} ti je ostalo ${formatNovacPuno(preostalo, "RSD")}. Kad ga pređeš, gubiš pravo na paušalno oporezivanje, pa te upozoravam unapred.`;
  if (prag === 90) {
    return {
      nivo: "opasnost",
      naslov: `Dostigao si ${formatProcenat(procenat)}% godišnjeg limita`,
      poruka,
    };
  }
  return { nivo: "upozorenje", naslov: "Približavaš se limitu za paušalce", poruka };
}
