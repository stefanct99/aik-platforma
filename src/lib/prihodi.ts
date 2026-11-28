// Knjiga prihoda (Korak 9a, spec 7.9) - čiste funkcije (bez baze) za grupisanje/filtriranje redova,
// lako se testiraju odvojeno od servera/Reacta. Baza (upit + mapiranje u PrihodRed) je u prihodi-db.ts -
// NAMERNO odvojeno (isti razlog kao invoice-templates.ts/invoice-templates-db.ts): ovaj fajl uvozi i
// klijentska komponenta (KnjigaPrihodaTab.tsx), uvoz Prisma klijenta ovde bi slomio build.
export type PrihodRed = {
  id: string;
  datumIso: string;
  valuta: string;
  vrsta: "devizni" | "dinarski";
  iznos: number; // u najmanjoj jedinici valute UPLATE (amount)
  kurs: number | null;
  // RSD protivvrednost (najmanja jedinica, para) - za dinarski UVEK jednaka iznosu; za devizni null dok
  // kurs nije upisan (Korak 9b). Izvedeno pri mapiranju iz baze, ne čuva se ovako u Income.amountRsd.
  iznosRsd: number | null;
  izvor: "mejl_banke" | "rucno";
  fakturaId: string | null;
  brojFakture: string | null;
  klijentId: string | null;
  klijentIme: string | null;
  opis: string | null;
};

// Izbor godine (Kp3/27. krug u prototipu): mora da uključi i NAREDNU godinu (da prazno stanje naredne
// godine uopšte može da se izabere pre nego što stvarno počne). Isti redosled kao prototip (js/knjiga.js
// YEARS()): naredna prva, pa unazad.
export function godinePrihoda(danas: Date): number[] {
  const g = danas.getUTCFullYear();
  return [g + 1, g, g - 1, g - 2];
}

export function pripadaGodini(red: PrihodRed, godina: number): boolean {
  return new Date(red.datumIso).getUTCFullYear() === godina;
}

export function pripadaMesecu(red: PrihodRed, mesec: number): boolean {
  return new Date(red.datumIso).getUTCMonth() + 1 === mesec;
}

// Redovi za IZABRANU godinu, razdvojeni po vrsti, sortirani po datumu uplate (najnoviji prvo) - isto
// razdvajanje kao podtabovi "Devizni prihodi"/"Dinarski prihodi" u okvirima (Kp1/Kp2). Ovo je i osnova za
// brojeve na pilulama podtabova (NE menja se filterom meseca/klijenta - zadatak tačka 2).
export function grupisiPoGodini(
  redovi: PrihodRed[],
  godina: number,
): { devizni: PrihodRed[]; dinarski: PrihodRed[] } {
  const zaGodinu = redovi.filter((r) => pripadaGodini(r, godina));
  const noviPre = (a: PrihodRed, b: PrihodRed) =>
    new Date(b.datumIso).getTime() - new Date(a.datumIso).getTime();
  return {
    devizni: zaGodinu.filter((r) => r.vrsta === "devizni").sort(noviPre),
    dinarski: zaGodinu.filter((r) => r.vrsta === "dinarski").sort(noviPre),
  };
}

// Dodatni filteri za PRIKAZ U TABELI (Mesec, Klijent) - kartice zbira (grupisiPoGodini/ukupanPrihod) se
// NE diraju ovim (zadatak tačka 2: "Filter Godina menja kartice, filteri Mesec i Klijent ih ne menjaju").
export function filtrirajRedove(
  redovi: PrihodRed[],
  mesec: number | null,
  klijentId: string | null,
): PrihodRed[] {
  return redovi
    .filter((r) => mesec == null || pripadaMesecu(r, mesec))
    .filter((r) => klijentId == null || r.klijentId === klijentId);
}

// Ukupan prihod u kalendarskoj godini (zadatak, odluka 1: ZASEBNO od kliznog limita u pausalni-limit.ts) -
// zbir RSD protivvrednosti oba podtaba, isključujući redove bez upisanog kursa (iznosRsd null).
export function ukupanPrihodUGodini(
  devizni: PrihodRed[],
  dinarski: PrihodRed[],
): number {
  const zbir = (redovi: PrihodRed[]) =>
    redovi.reduce((s, r) => s + (r.iznosRsd ?? 0), 0);
  return zbir(devizni) + zbir(dinarski);
}

// Srpska brojna saglasnost za "uplata" (Kp1/Kp2: "5 uplata", ne postojeći dvooblični obrazac
// "X faktura/fakture" iz FaktureListTab.tsx - za OVU reč oblik za 1 i oblik za "mnogo" su ISTA reč
// ("uplata"), pa pojednostavljeni dvooblik ne bi pogodio frejm; standardno pravilo zadnje dve cifre
// (11-14 uvek "mnogo", inače zadnja cifra 1/2-4/ostalo).
export function uplataRec(n: number): string {
  const poslednje2 = Math.abs(n) % 100;
  const poslednja = poslednje2 % 10;
  if (poslednje2 >= 11 && poslednje2 <= 14) return "uplata";
  if (poslednja === 1) return "uplata";
  if (poslednja >= 2 && poslednja <= 4) return "uplate";
  return "uplata";
}

// Dinarska protivvrednost deviznog prihoda (Korak 9b) - iznos JE VEĆ u najmanjoj jedinici valute uplate
// (amount, npr. cent EUR), kurs je RSD za 1 jedinicu te valute (npr. 117,20) - proizvod iznos*kurs daje
// DIREKTNO rezultat u para (najmanjoj jedinici RSD), bez dodatnog skaliranja: 1000,00 EUR (iznos=100000)
// * 117,20 = 117.200,00 din = 11720000 para. Kurs se PRE množenja zaokružuje na ceo broj u 1/10000
// jedinicama (Math.round(kurs*10000)) da bi množenje sa iznosom (ceo broj) ostalo tačna celobrojna
// aritmetika - direktno iznos*kurs (oba kao floating point) bi za pojedine kurseve unelo grešku
// zaokruživanja pre finalnog zaokruživanja na paru. Dinarski prihodi nemaju kurs, ova funkcija ih se ne
// tiče (iznosRsd im je uvek jednak iznosu, videti prihodi-db.ts).
export function izracunajIznosRsd(
  iznosUNajmanjojJedinici: number,
  kurs: number,
): number {
  if (!Number.isFinite(kurs) || kurs <= 0) {
    throw new Error("Kurs mora biti broj veći od 0.");
  }
  const kursNa10000 = Math.round(kurs * 10000);
  return Math.round((iznosUNajmanjojJedinici * kursNa10000) / 10000);
}

export type BrojUplataPoKlijentu = {
  klijentId: string;
  klijentIme: string;
  broj: number;
}[];

// Za padajući meni filtera "Klijent" (Kp9): broj uplata PO KLIJENTU, računat iz redova TRENUTNOG podtaba
// i meseca (ali PRE filtera po klijentu - isti obrazac kao prototip, da brojevi ne nestanu kad se klijent
// izabere). Samo klijenti koji imaju bar jednu uplatu se prikazuju.
export function brojUplataPoKlijentu(
  redovi: PrihodRed[],
): BrojUplataPoKlijentu {
  const mapa = new Map<string, { klijentIme: string; broj: number }>();
  for (const r of redovi) {
    if (!r.klijentId) continue;
    const postojeci = mapa.get(r.klijentId);
    if (postojeci) postojeci.broj += 1;
    else mapa.set(r.klijentId, { klijentIme: r.klijentIme ?? "–", broj: 1 });
  }
  return Array.from(mapa.entries())
    .map(([klijentId, v]) => ({ klijentId, ...v }))
    .sort((a, b) => a.klijentIme.localeCompare(b.klijentIme, "sr"));
}
