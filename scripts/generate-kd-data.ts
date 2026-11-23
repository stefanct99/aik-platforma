// Generiše src/data/kd/*.ts iz zvaničnih fajlova Republičkog zavoda za statistiku (preuzetih u
// scripts/kd-izvori/, vidi scripts/kd-izvori/IZVORI.md). Pokreni sa:
//   npx tsx scripts/generate-kd-data.ts
// Izvori se ne menjaju ručno; ako RZS objavi noviju verziju, fajlove treba ponovo preuzeti i ovu
// skriptu ponovo pokrenuti.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import * as xlsx from "xlsx";
import { cirilicaULatinicu } from "../src/lib/cirilica";

const IZVORI_DIR = join(__dirname, "kd-izvori");
const IZLAZ_DIR = join(__dirname, "..", "src", "data", "kd");
const DATUM_PREUZIMANJA = "2026-11-23";

type Razred = { code: string; name: string };
type Preslikavanje = { staraSifra: string; novaSifra: string };

function ocisti(naziv: string): string {
  return cirilicaULatinicu(naziv.trim().replace(/\s+/g, " "));
}

function ucitajListu(fajl: string, sheet: string): string[][] {
  const putanja = join(IZVORI_DIR, fajl);
  const radnaKnjiga = xlsx.readFile(putanja);
  const list = radnaKnjiga.Sheets[sheet];
  if (!list) {
    throw new Error(`List "${sheet}" ne postoji u fajlu ${fajl}. Dostupni listovi: ${radnaKnjiga.SheetNames.join(", ")}`);
  }
  return xlsx.utils.sheet_to_json<string[]>(list, { header: 1, defval: "" });
}

// KD 2025: list "Grupe" je već filtriran na nivo "razred" (četvorocifrena šifra sa tačkom, npr. 62.10).
function ucitajKD2025(): Razred[] {
  const redovi = ucitajListu("kd2025_struktura.xlsx", "Grupe");
  return redovi
    .slice(1)
    .filter((red) => String(red[0] || "").trim() !== "")
    .map((red) => ({ code: String(red[0]).trim(), name: ocisti(String(red[1])) }));
}

// KD 2010: Sheet1 ima sve nivoe hijerarhije bez tačke (npr. "6201"). Razred je četvorocifren,
// normalizuje se na oblik sa tačkom (XX.XX) da bude dosledan formatu KD 2025 i Tabele veza.
function ucitajKD2010(): Razred[] {
  const redovi = ucitajListu("klasifikacija-delatnosti-2010-puni-nazivi.xls", "Sheet1");
  return redovi
    .slice(1)
    .filter((red) => /^\d{4}$/.test(String(red[0] || "").trim()))
    .map((red) => {
      const sifra = String(red[0]).trim();
      return { code: `${sifra.slice(0, 2)}.${sifra.slice(2)}`, name: ocisti(String(red[1])) };
    });
}

// Tabela veza: list "KD2010 - KD2025" ima jedan red po paru (stara šifra, nova šifra). Stara šifra se
// ponavlja kad se deli na više novih (jedan na više).
function ucitajTabeluVeza(): Preslikavanje[] {
  const redovi = ucitajListu("tabela-veza-kd2010-i-kd2025.xlsx", "KD2010 - KD2025");
  return redovi
    .slice(1)
    .filter((red) => String(red[0] || "").trim() !== "")
    .map((red) => ({
      staraSifra: String(red[0]).trim(),
      novaSifra: String(red[2]).trim(),
    }));
}

function napisiHeader(opis: string): string {
  return `// GENERISANO automatski skriptom scripts/generate-kd-data.ts, ne menjati ručno.
// Izvor: Republički zavod za statistiku Srbije (stat.gov.rs), stranica
// https://www.stat.gov.rs/istrazivanja/klasifikacije/, preuzeto ${DATUM_PREUZIMANJA}.
// ${opis}
`;
}

function main() {
  const kd2025 = ucitajKD2025();
  const kd2010 = ucitajKD2010();
  const tabelaVeza = ucitajTabeluVeza();

  // Provera pre pisanja: svaka stara šifra mora postojati u KD 2010, svaka nova u KD 2025. Ako ovo
  // padne, izvori se ne poklapaju i skripta se zaustavlja umesto da napiše neispravne podatke.
  const kd2010Sifre = new Set(kd2010.map((r) => r.code));
  const kd2025Sifre = new Set(kd2025.map((r) => r.code));
  for (const par of tabelaVeza) {
    if (!kd2010Sifre.has(par.staraSifra)) {
      throw new Error(`Stara šifra ${par.staraSifra} iz Tabele veza ne postoji u KD 2010 spisku.`);
    }
    if (!kd2025Sifre.has(par.novaSifra)) {
      throw new Error(`Nova šifra ${par.novaSifra} iz Tabele veza ne postoji u KD 2025 spisku.`);
    }
  }

  const brojacPoStaroj = new Map<string, number>();
  for (const par of tabelaVeza) {
    brojacPoStaroj.set(par.staraSifra, (brojacPoStaroj.get(par.staraSifra) || 0) + 1);
  }
  const staraSaViseNovih = [...brojacPoStaroj.values()].filter((n) => n > 1).length;

  writeFileSync(
    join(IZLAZ_DIR, "kd2025.ts"),
    napisiHeader(
      "Prilog 1 Uredbe o klasifikaciji delatnosti (KD 2025), nivo \"razred\" (četvorocifrena šifra sa tačkom).",
    ) +
      `\nexport type KDRazred = { code: string; name: string };\n\n` +
      `export const KD2025: readonly KDRazred[] = ${JSON.stringify(kd2025, null, 2)};\n`,
  );

  writeFileSync(
    join(IZLAZ_DIR, "kd2010.ts"),
    napisiHeader(
      "Klasifikacija delatnosti 2010 (KD 2010), nivo \"razred\". Šifre su normalizovane na oblik sa tačkom (XX.XX) da budu dosledne KD 2025 i Tabeli veza; izvorni fajl ih ima bez tačke (npr. \"6201\").",
    ) +
      `\nimport type { KDRazred } from "./kd2025";\n\n` +
      `export const KD2010: readonly KDRazred[] = ${JSON.stringify(kd2010, null, 2)};\n`,
  );

  writeFileSync(
    join(IZLAZ_DIR, "tabela-veza.ts"),
    napisiHeader(
      `Prilog 2 Uredbe: Tabela veza KD 2010 -> KD 2025. ${brojacPoStaroj.size} starih šifara ukupno, od toga ${staraSaViseNovih} se deli na više novih (jedna stara šifra -> više novih redova ovde).`,
    ) +
      `\nexport type KDPreslikavanje = { staraSifra: string; novaSifra: string };\n\n` +
      `export const TABELA_VEZA_KD2010_KD2025: readonly KDPreslikavanje[] = ${JSON.stringify(tabelaVeza, null, 2)};\n`,
  );

  console.log(`KD2025: ${kd2025.length} razreda`);
  console.log(`KD2010: ${kd2010.length} razreda`);
  console.log(`Tabela veza: ${tabelaVeza.length} redova, ${brojacPoStaroj.size} jedinstvenih starih šifara, ${staraSaViseNovih} starih šifara se deli na više novih.`);
}

main();
