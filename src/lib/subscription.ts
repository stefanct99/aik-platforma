// Pretplata (Korak 7, spec 7.13, kratak rezime u Podešavanjima): probni period je 30 dana od
// REGISTRACIJE NALOGA (User.createdAt), ne od datuma registracije FIRME kod Poreske uprave
// (Business.regDate) - to je potpuno drugi datum. Pretplata kao plaćanje ne postoji još (budući korak),
// zato je ovde uvek "Probni period", nikad "Aktivna" ni "Istekla" - to dolazi sa pravim plaćanjem.

const TRAJANJE_PROBNOG_PERIODA_DANA = 30;

export type StanjePretplate = {
  danaOstalo: number;
  istekaoJe: boolean;
};

export function izracunajProbniPeriod(nalogKreiran: Date, sada: Date = new Date()): StanjePretplate {
  const proteklihMs = sada.getTime() - nalogKreiran.getTime();
  const proteklihDana = Math.floor(proteklihMs / (1000 * 60 * 60 * 24));
  const danaOstalo = Math.max(0, TRAJANJE_PROBNOG_PERIODA_DANA - proteklihDana);
  return { danaOstalo, istekaoJe: danaOstalo === 0 };
}

// Srpska pluralizacija za "dan": 1, 21, 31... -> "dan"; 11-14 i sve ostalo -> "dana" (uobičajeno
// slovensko pravilo, nije posebno nacrtano u frejmu koji pokazuje samo jedan broj - "23 dana").
export function recDan(broj: number): string {
  const poslednjaCifra = broj % 10;
  const poslednjeDveCifre = broj % 100;
  if (poslednjaCifra === 1 && poslednjeDveCifre !== 11) return "dan";
  return "dana";
}
