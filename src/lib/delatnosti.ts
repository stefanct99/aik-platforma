// Preneto iz referenca/prototip/js/onboarding.js (DELATNOSTI). Samo 7 šifara, nije pun spisak
// šifara delatnosti iz Klasifikacije delatnosti (vidi izveštaj Koraka 2), ovo je demo spisak iz
// prototipa, ne zvanična lista.
export const DELATNOSTI: ReadonlyArray<readonly [code: string, name: string]> = [
  ["6201", "Računarsko programiranje"],
  ["6202", "Konsultantske delatnosti u vezi sa informacionom tehnologijom"],
  ["7410", "Specijalizovane dizajnerske delatnosti"],
  ["7021", "Odnosi sa javnošću i komunikacije"],
  ["7022", "Konsultantske aktivnosti u vezi s poslovanjem i ostalim upravljanjem"],
  ["7420", "Fotografske usluge"],
  ["9329", "Ostale zabavne i rekreativne delatnosti"],
];

export function findDelatnost(code: string): { code: string; name: string } | null {
  const nadjena = DELATNOSTI.find(([c]) => c === code);
  return nadjena ? { code: nadjena[0], name: nadjena[1] } : null;
}

export function isValidDelatnostCode(code: string): boolean {
  return DELATNOSTI.some(([c]) => c === code);
}
