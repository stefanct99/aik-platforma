// Rokovi za porez (Korak 10a) - prenos iz referenca/prototip/js/rules/taxDeadlines.js u TypeScript.
// LOGIKA SE NE MENJA (zadatak, PRAVILA.md: "funkcija treba da bude prepisana u TypeScript - logika se ne
// menja, samo se prepisuje"). Funkcije/promenljive su preimenovane na srpski, po konvenciji ostatka ovog
// projekta (izracunajPausalniLimit, formatDatumSrpski...) - originalni (engleski) nazivi iz prototipa su
// navedeni u komentaru uz svaku funkciju, da se lakše poveže sa izvorom/PRAVILA.md.
//
// Izvor pravila: "Zakon o državnim i drugim praznicima u Republici Srbiji" ("Sl. glasnik RS", br.
// 43/2001, 101/2007, 92/2011) - konsolidovan tekst pročitan sa paragraf.rs u prototipu (NIJE Službeni
// glasnik sâm). Neradni dani (čl. 1/1a/2): Nova godina (1-2. januar), Božić (7. januar), Sretenje/Dan
// državnosti (15-16. februar), Vaskršnji praznici (Veliki petak do 2. dana Vaskrsa, pravoslavni Uskrs po
// algoritmu ispod), Praznik rada (1-2. maj), Dan primirja u Prvom svetskom ratu (11. novembar). NAMERNO
// izostavljeno (zakon ih izričito NE tretira kao neradne): Dan pobede (9. maj, čl. 3 ga izuzima) i "radni
// praznici" iz čl. 5 (Sveti Sava, Dan sećanja na žrtve holokausta, Vidovdan, Dan sećanja na srpske žrtve u
// Drugom svetskom ratu - zakon kaže "praznuju se RADNO").
//
// [PROVERITI] nerešene pravne nedoumice iz originala - PRENETE, NE rešavane ovde (zadatak):
// 1. Tekst pročitan sa paragraf.rs ne pokazuje datum konsolidacije niti potvrđuje da li postoji izmena
//    posle 92/2011 (npr. pominjana 2023/2024 izmena).
// 2. čl. 3a (nadoknada): tekst pominje nadoknadu SAMO za nedelju, ne i za subotu - ovde NEMA nadoknade za
//    praznik koji padne u subotu (videti test "subota bez nadoknade" ispod).
// 3. Vaskršnja nedelja je PO DEFINICIJI uvek nedelja, pa nadoknada primenjena po POJEDINAČNOM datumu (ne
//    po celom višednevnom prazniku) znači da Vaskršnji praznici dobijaju dodatni neradni dan SVAKE
//    godine - nije potvrđeno iz primarnog izvora da li zakon ovo stvarno primenjuje na višednevne
//    praznike ili samo na jednodnevne proslave.
// 4. Pravoslavni Uskrs: Julijanski -> Gregorijanski pomak od +13 dana važi za 1900-2099 (van tog opsega
//    razlika kalendara nije konstantna) - nije provereno/menjano ovde, samo preneto.
//
// NAMERNO NIJE preneto: originalni `HOLIDAYS_2026` (fiksna lista za 2026) je u prototipu postojao SAMO
// radi kompatibilnosti sa starijim kodom (utils.js ga je re-eksportovao) - ovde nema takvog starog
// potrošača, a ista vrednost se dobija pozivom skupPraznikaZaGodinu(2026), pa poseban izvezeni konstantan
// spisak nije potreban.
function dodajDane(datum: Date, n: number): Date {
  const d = new Date(datum);
  d.setDate(d.getDate() + n);
  return d;
}

function kljucDatuma(d: Date): string {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

// isWeekend
export function jeVikend(d: Date): boolean {
  const dan = new Date(d).getDay();
  return dan === 0 || dan === 6;
}

// orthodoxEaster - Julijanski algoritam (Meeus/Jones/Butcher, varijanta za Julijanski kalendar), pa
// prevod u Gregorijanski (+13 dana).
export function pravoslavniUskrs(godina: number): Date {
  const a = godina % 4;
  const b = godina % 7;
  const c = godina % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const mesec = Math.floor((d + e + 114) / 31); // Julijanski, 1-indeksirano (3=mart, 4=april)
  const dan = ((d + e + 114) % 31) + 1;
  return dodajDane(new Date(godina, mesec - 1, dan), 13);
}

// stateHolidayAnchors - osnovni (nepomereni) spisak neradnih dana za datu godinu, pre čl. 3a nadoknade.
export function praznickiDatumi(godina: number): Date[] {
  const uskrs = pravoslavniUskrs(godina);
  return [
    new Date(godina, 0, 1),
    new Date(godina, 0, 2), // Nova godina
    new Date(godina, 0, 7), // Božić
    new Date(godina, 1, 15),
    new Date(godina, 1, 16), // Sretenje / Dan državnosti
    dodajDane(uskrs, -2),
    dodajDane(uskrs, -1),
    uskrs,
    dodajDane(uskrs, 1), // Veliki petak .. 2. dan Vaskrsa
    new Date(godina, 4, 1),
    new Date(godina, 4, 2), // Praznik rada
    new Date(godina, 10, 11), // Dan primirja u Prvom svetskom ratu
  ];
}

// holidaySetForYear - puna lista neradnih dana (uključujući čl. 3a nadoknadu), kao Set ISO-datum stringova.
export function skupPraznikaZaGodinu(godina: number): Set<string> {
  const osnova = praznickiDatumi(godina);
  const kljucevi = new Set(osnova.map(kljucDatuma));
  osnova.forEach((d) => {
    if (new Date(d).getDay() === 0) {
      // nedelja -> nadoknada prvog narednog STVARNO radnog dana
      let x = dodajDane(d, 1);
      while (jeVikend(x) || kljucevi.has(kljucDatuma(x))) {
        x = dodajDane(x, 1);
      }
      kljucevi.add(kljucDatuma(x));
    }
  });
  return kljucevi;
}

// isHoliday
export function jePraznik(d: Date): boolean {
  return skupPraznikaZaGodinu(new Date(d).getFullYear()).has(kljucDatuma(d));
}

// nextBusinessDay
export function sledeciRadniDan(d: Date): Date {
  let x = new Date(d);
  while (jeVikend(x) || jePraznik(x)) {
    x = dodajDane(x, 1);
  }
  return x;
}

// taxDueDate - kljucMeseca je "YYYY-MM" (mesec ZA KOJI akontacija dospeva 15. u tom mesecu).
export function rokPoreza(kljucMeseca: string): Date {
  const godina = Number(kljucMeseca.slice(0, 4));
  const mesec = Number(kljucMeseca.slice(5, 7));
  return sledeciRadniDan(new Date(godina, mesec - 1, 15));
}

// --- Ispod: prenos iz referenca/prototip/js/selectors.js (ne taxDeadlines.js) - iste računice, ali
// prilagođene potpisom novoj šemi (Prisma modeli iz Dela 1 ove izmene), umesto prototipskog globalnog
// store state-a. "Logika se ne menja" i ovde važi (isti obrazac kao filtrirajZaIzvoz/izvoz-prihoda-
// db.ts): čiste funkcije koje baza/sesija samo POZIVA sa stvarnim podacima, ne čitaju ih same.

const MESECI_SR = [
  "januar",
  "februar",
  "mart",
  "april",
  "maj",
  "jun",
  "jul",
  "avgust",
  "septembar",
  "oktobar",
  "novembar",
  "decembar",
];

// taxServiceMonthName - "mesec usluge" je PRETHODNI mesec u odnosu na kljucMeseca (akontacija za oktobar
// dospeva u mesecu "2026-11").
export function nazivMesecaUsluge(kljucMeseca: string): string {
  const mesec = Number(kljucMeseca.slice(5, 7));
  return MESECI_SR[(mesec - 2 + 12) % 12];
}

// taxMonthlyTotal
export function ukupnoMesecno(stavke: { monthlyAmount: number }[]): number {
  return stavke.reduce((zbir, s) => zbir + s.monthlyAmount, 0);
}

// taxMonthPaidCount
export function brojPlacenih(statusi: string[]): number {
  return statusi.filter((s) => s === "placeno").length;
}

// taxMonthFullyPaid
export function jeMesecPlacen(statusi: string[], brojStavki: number): boolean {
  return brojPlacenih(statusi) === brojStavki;
}

// upcomingTaxMonths - sledećih n ključeva meseci ("YYYY-MM") za koje akontacija dospeva, počev od prvog
// koji NIJE u potpunosti plaćen (isto pravilo kao prototip: kad je mesec plaćen u potpunosti, rok nestaje
// iz "Čeka tebe", sledeći mesec postaje "due"). "jePotpunoPlacen" se ubrizgava (ne čita bazu ovde, isti
// razlog kao gore) - poziva se sa kljucMeseca ("YYYY-MM") i treba da vrati da li je TAJ mesec u potpunosti
// plaćen.
export function sledeciMeseciZaPlacanje(
  danas: Date,
  jePotpunoPlacen: (kljucMeseca: string) => boolean,
  n: number,
): string[] {
  let godina = danas.getFullYear();
  let mesec = danas.getMonth() + 1;
  const kljuc = () => `${godina}-${String(mesec).padStart(2, "0")}`;
  const sledeci = () => {
    mesec++;
    if (mesec > 12) {
      mesec = 1;
      godina++;
    }
  };
  while (jePotpunoPlacen(kljuc())) {
    sledeci();
  }
  const rezultat: string[] = [];
  for (let i = 0; i < n; i++) {
    rezultat.push(kljuc());
    sledeci();
  }
  return rezultat;
}
