// Prikaz novca (Korak 8a, ispravka): iznos se čuva kao ceo broj u najmanjoj jedinici (para/cent), nikad
// float. Dva različita prikaza, tačno po zadatku:
// - formatNovacKompaktno (lista, kartice sa zbirom): okrugli iznosi bez decimala, neokrugli sa dve -
//   isto za svaku valutu (1.200 €, 850 €, 85.000 din, 2.100 $, ali 441,28 $).
// - formatNovacPuno (pregled fakture, forme, sam dokument fakture): UVEK dve decimale, bez obzira na
//   valutu (1.200,00 €, 85.000,00 din).
const SIMBOLI: Record<string, string> = { EUR: "€", USD: "$", RSD: "din" };

function simbolZaValutu(valuta: string): string {
  return SIMBOLI[valuta] ?? valuta;
}

export function formatNovacPuno(iznosUNajmanjojJedinici: number, valuta: string): string {
  const iznos = iznosUNajmanjojJedinici / 100;
  const broj = iznos.toLocaleString("sr-RS", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${broj} ${simbolZaValutu(valuta)}`;
}

export function formatNovacKompaktno(iznosUNajmanjojJedinici: number, valuta: string): string {
  const iznos = iznosUNajmanjojJedinici / 100;
  const broj = iznos.toLocaleString("sr-RS", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `${broj} ${simbolZaValutu(valuta)}`;
}

// Procenat limita (Korak 9a/9f: kartica "Ukupan prihod u [godina]" i baner upozorenja na limit) - jedna
// decimala, srpski format (zarez). Premešteno ovde iz KnjigaPrihodaTab.tsx (Korak 9f) da je ne duplira
// sadrzajLimitBanera u pausalni-limit.ts.
export function formatProcenat(p: number): string {
  return p.toLocaleString("sr-RS", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
