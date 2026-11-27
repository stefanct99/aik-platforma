// Godišnji limit za paušalno oporezivanje (Korak 9a, spec 8.4): 6.000.000 din, praćen kao KLIZNI period
// od 365 dana unazad od "danas" (NE kalendarska godina - to je ODVOJEN zbir, "Ukupan prihod u [godina].",
// koji se računa drugde, u src/lib/prihodi.ts). Ovo je zajednička, čista funkcija (bez baze, bez Date.now())
// - "danas" je uvek parametar - da je kasnije mogu koristiti i Početna i Porez i rokovi bez dupliranja.
//
// Iznosi su u najmanjoj jedinici valute (para), isti princip kao svuda u aplikaciji (src/lib/money.ts) -
// LIMIT_PAUSALACA je zato 600.000.000 (= 6.000.000 din), ne 6000000.
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
