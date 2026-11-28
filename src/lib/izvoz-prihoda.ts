// Izvoz Knjige prihoda (Korak 9g-1, dijalog Kp6) - čiste funkcije (bez baze/sesije/xlsx biblioteke) za
// period/godinu, filtriranje, numerisanje i oblikovanje tabela za izvoz. Isti razlog odvajanja kao
// prihodi.ts/prihodi-db.ts: ovo lako testira vitest, bez baze. PDF (Korak 9g-2) će PONOVO koristiti ove
// iste funkcije (zadatak) - ništa ovde nije specifično za Excel.
import type { PrihodRed } from "./prihodi";

export type PeriodIzvoza =
  | { tip: "godina" }
  | { tip: "kvartal"; kvartal: 1 | 2 | 3 | 4 }
  | { tip: "mesec"; mesec: number }; // 1-12

const NAZIV_MESECA = [
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
const RIMSKI_KVARTAL = { 1: "I", 2: "II", 3: "III", 4: "IV" } as const;

// Zaglavlje Excel/PDF dokumenta (Korak 9g-1 zadatak, npr. "2026, cela godina" / "2026, II kvartal").
export function opisPerioda(godina: number, period: PeriodIzvoza): string {
  if (period.tip === "godina") return `${godina}, cela godina`;
  if (period.tip === "kvartal")
    return `${godina}, ${RIMSKI_KVARTAL[period.kvartal]} kvartal`;
  return `${godina}, ${NAZIV_MESECA[period.mesec - 1]}`;
}

// Ime fajla (zadatak, tačni primeri): knjiga-prihoda-2026.xlsx, knjiga-prihoda-2026-II-kvartal.xlsx,
// knjiga-prihoda-2026-03.xlsx (mesec je uvek dvocifren, kvartal rimskim brojem).
export function imeFajlaIzvoza(
  godina: number,
  period: PeriodIzvoza,
  format: "excel" | "pdf",
): string {
  const ekstenzija = format === "excel" ? "xlsx" : "pdf";
  const deoPerioda =
    period.tip === "godina"
      ? ""
      : period.tip === "kvartal"
        ? `-${RIMSKI_KVARTAL[period.kvartal]}-kvartal`
        : `-${String(period.mesec).padStart(2, "0")}`;
  return `knjiga-prihoda-${godina}${deoPerioda}.${ekstenzija}`;
}

function opsegMeseca(period: PeriodIzvoza): { od: number; doMeseca: number } | null {
  if (period.tip === "godina") return null;
  if (period.tip === "mesec") return { od: period.mesec, doMeseca: period.mesec };
  const prvi = (period.kvartal - 1) * 3 + 1;
  return { od: prvi, doMeseca: prvi + 2 };
}

export function pripadaPeriodu(
  red: PrihodRed,
  godina: number,
  period: PeriodIzvoza,
): boolean {
  const datum = new Date(red.datumIso);
  if (datum.getUTCFullYear() !== godina) return false;
  const opseg = opsegMeseca(period);
  if (!opseg) return true;
  const mesec = datum.getUTCMonth() + 1;
  return mesec >= opseg.od && mesec <= opseg.doMeseca;
}

// Isto sortiranje kao grupisiPoGodini (prihodi.ts): najnoviji prvo - i na ekranu i u izvozu (zadatak).
function noviPre(a: PrihodRed, b: PrihodRed): number {
  return new Date(b.datumIso).getTime() - new Date(a.datumIso).getTime();
}

export function filtrirajZaIzvoz(
  redovi: PrihodRed[],
  godina: number,
  period: PeriodIzvoza,
): PrihodRed[] {
  return redovi.filter((r) => pripadaPeriodu(r, godina, period)).sort(noviPre);
}

export type IzvozRed = PrihodRed & { redniBroj: number };

// Redni broj kreće od 1 u svakoj tabeli (zadatak), u redosledu u kom su redovi prosleđeni (već sortirani
// najnoviji prvo pre ovoga - filtrirajZaIzvoz).
export function uBrojevaniRedovi(redovi: PrihodRed[]): IzvozRed[] {
  return redovi.map((r, i) => ({ ...r, redniBroj: i + 1 }));
}

// Isti zbir kao ukupanPrihodUGodini (KnjigaPrihodaTab.tsx/prihodi.ts): red bez upisanog kursa (iznosRsd
// null) ne učestvuje - isto ponašanje kao postojeći prikaz na ekranu, ne nova odluka.
export function zbirIznosaRsd(redovi: PrihodRed[]): number {
  return redovi.reduce((s, r) => s + (r.iznosRsd ?? 0), 0);
}

export type TabelaIzvoza = {
  naziv: string;
  redovi: IzvozRed[];
  // null kad je kućica "Ukupan zbir na kraju" isključena - nema reda sa zbirom.
  zbirRsd: number | null;
};

// Tabele spremne za pisanje u fajl (Excel u 9g-1, PDF u 9g-2 - zadatak). "zaPeriod" je već filtriran i
// sortiran (filtrirajZaIzvoz) - odvojeno/spojeno samo deli ili ne deli po vrsti, ne menja redosled.
export function napraviTabeleIzvoza(
  zaPeriod: PrihodRed[],
  odvojeno: boolean,
  zbir: boolean,
): TabelaIzvoza[] {
  if (!odvojeno) {
    return [
      {
        naziv: "Prihodi",
        redovi: uBrojevaniRedovi(zaPeriod),
        zbirRsd: zbir ? zbirIznosaRsd(zaPeriod) : null,
      },
    ];
  }
  const devizni = zaPeriod.filter((r) => r.vrsta === "devizni");
  const dinarski = zaPeriod.filter((r) => r.vrsta === "dinarski");
  return [
    {
      naziv: "Devizni prihodi",
      redovi: uBrojevaniRedovi(devizni),
      zbirRsd: zbir ? zbirIznosaRsd(devizni) : null,
    },
    {
      naziv: "Dinarski prihodi",
      redovi: uBrojevaniRedovi(dinarski),
      zbirRsd: zbir ? zbirIznosaRsd(dinarski) : null,
    },
  ];
}

export function jePrazanIzvoz(tabele: TabelaIzvoza[]): boolean {
  return tabele.every((t) => t.redovi.length === 0);
}

// --- Parsiranje/provera parametara rute (GET /knjiga-prihoda/izvoz) - čisto, bez headers()/sesije, da bi
// se "nevalidni parametri" testirali vitest-om (zadatak), ne samo E2E-om. ---

// Godina je striktno jedna od onih koje dijalog i stranica nude (godinePrihoda, prihodi.ts) - ne bilo koji
// broj (zadatak: "stroga validacija parametara").
export function parsirajGodinu(
  vrednost: string | null,
  dozvoljeneGodine: number[],
): number | null {
  if (vrednost == null) return null;
  const broj = Number(vrednost);
  if (!Number.isInteger(broj) || !dozvoljeneGodine.includes(broj)) return null;
  return broj;
}

// Kodiranje u URL-u: "cela-godina" | "q1".."q4" | "m01".."m12" - jednoznačno, bez sudara (zadatak:
// Period padajući meni nudi "Cela godina", "I".."IV kvartal", "Januar".."Decembar").
export function parsirajPeriod(vrednost: string | null): PeriodIzvoza | null {
  if (vrednost === "cela-godina") return { tip: "godina" };
  const kvartal = vrednost?.match(/^q([1-4])$/);
  if (kvartal) {
    return { tip: "kvartal", kvartal: Number(kvartal[1]) as 1 | 2 | 3 | 4 };
  }
  const mesec = vrednost?.match(/^m(0[1-9]|1[0-2])$/);
  if (mesec) return { tip: "mesec", mesec: Number(mesec[1]) };
  return null;
}

export function parsirajFormat(vrednost: string | null): "pdf" | "excel" | null {
  return vrednost === "pdf" || vrednost === "excel" ? vrednost : null;
}

export function parsirajBool(vrednost: string | null): boolean {
  return vrednost === "1";
}
