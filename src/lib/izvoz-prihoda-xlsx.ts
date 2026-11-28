// Excel izvoz Knjige prihoda (Korak 9g-1) - jedini fajl koji dotiče biblioteku xlsx (odvojeno od
// izvoz-prihoda.ts iz istog razloga kao pdf.ts: puppeteer-core je i dalje JEDINO u pdf.ts - teže
// biblioteke ostaju van čistih funkcija koje i drugi delovi uvoze).
//
// POZNATO OGRANIČENJE (potvrđeno uživo, Korak 9g-1 - odlučeno sa Stefanom pre pisanja ovog fajla):
// besplatna "xlsx" biblioteka (SheetJS Community Edition, instalirana verzija) NE upisuje ni stil ćelije
// (podebljan font) ni zamrznute redove u fajl - oba su isključivo u plaćenoj "Pro" verziji iste
// biblioteke. Zaglavlje kolona je zato OBIČAN tekst, nije podebljano ni zamrznuto, iako to zadatak
// traži - Stefan je odlučio da se ide dalje bez te dve stvari (vidi izveštaj), ne da se dodaje nova
// biblioteka (exceljs) samo zbog toga.
import * as XLSX from "xlsx";
import { formatDatumSrpski } from "./datum";
import { opisPerioda, type PeriodIzvoza, type TabelaIzvoza } from "./izvoz-prihoda";

// Isti simboli kao money.ts (SIMBOLI, neizvezeno odande) - namerno ponovljeno ovde, mali fajl, isti
// razlog kao PrihodPanel.module.css/KnjigaPrihodaTab.module.css (odvojena, mala kopija po fajlu).
const SIMBOLI: Record<string, string> = { EUR: "€", USD: "$", RSD: "din" };

// Excel-ov format broja koristi KORISNIKOVU regionalnu podešenost za razdvajanje hiljada/decimala (ne
// nešto što fajl sam nameće) - "#,##0.00" je zato ispravan, lokalno-nezavisan format kod (potvrđeno
// uživo), ne greška što ne piše tačno srpski zapis. Dodat je i simbol valute kao literalni tekst u
// formatu (potvrđeno uživo da xlsx biblioteka ovo upisuje ispravno), isto kao formatNovacPuno na ekranu.
function formatNovcanaKolona(valuta: string): string {
  const simbol = SIMBOLI[valuta] ?? valuta;
  return `#,##0.00" ${simbol}"`;
}

// Tačka u "dd.mm.yyyy" MORA biti escape-ovana (dd\.mm\.yyyy) - bez toga SheetJS-ov parser formata baca
// grešku ("bad second format: .") kad se fajl kasnije čita/otvara (potvrđeno uživo).
const DATUM_FORMAT = "dd\\.mm\\.yyyy";

// Redni broj Excel datuma (dani od 30.12.1899) IZ KALENDARSKIH (UTC) komponenti, NE iz Date objekta
// direktno (XLSX.utils.aoa_to_sheet + cellDates bi upisalo serijski broj pomeren za sat vremena na
// serveru čija je vremenska zona UTC+1 - potvrđeno uživo probnim fajlom). Isti razlog kao
// formatDatumSrpski (datum.ts): naši datumi su kalendarski dani, ne trenuci.
function excelSerijskiDatum(datum: Date): number {
  return Math.round(
    (Date.UTC(datum.getUTCFullYear(), datum.getUTCMonth(), datum.getUTCDate()) -
      Date.UTC(1899, 11, 30)) /
      86_400_000,
  );
}

const ZAGLAVLJE_KOLONA = [
  "Redni broj",
  "Datum uplate",
  "Klijent",
  "Faktura",
  "Opis",
  "Iznos",
  "Kurs",
  "U dinarima",
  "Izvor",
];

function listZaTabelu(
  tabela: TabelaIzvoza,
  firma: { naziv: string; pib: string },
  godina: number,
  period: PeriodIzvoza,
  danas: Date,
): XLSX.WorkSheet {
  const zaglavlje: string[][] = [[firma.naziv]];
  // PIB je u šemi obavezno polje (Business.pib, nikad null/praznina) - ipak provereno ovde, tačno po
  // zadatku ("ako ga biznis ima, inače izostavi red").
  if (firma.pib) zaglavlje.push([`PIB: ${firma.pib}`]);
  zaglavlje.push(["Knjiga prihoda"]);
  zaglavlje.push([opisPerioda(godina, period)]);
  zaglavlje.push([`Datum izrade: ${formatDatumSrpski(danas)}`]);
  zaglavlje.push([]);
  zaglavlje.push(ZAGLAVLJE_KOLONA);
  const brojRedaZaglavlja = zaglavlje.length;

  const podaci: (string | number)[][] = tabela.redovi.map((r) => [
    r.redniBroj,
    "", // Datum uplate - prava Excel vrednost se upisuje ispod (potreban je .z format na samoj ćeliji).
    r.klijentIme ?? "Nije poznat",
    r.brojFakture ?? "–",
    r.opis ?? "–",
    "", // Iznos - isto, uvek upisano ispod (zavisi od valute reda).
    r.kurs != null ? "" : "–", // devizni sa kursom se upisuje ispod; dinarski/bez kursa ostaje "–" (zadatak).
    r.iznosRsd != null ? "" : "–",
    r.izvor === "rucno" ? "Ručno" : "Mejl banke",
  ]);

  const sve: (string | number)[][] = [...zaglavlje, ...podaci];
  if (tabela.zbirRsd != null) {
    const naziv = tabela.naziv.charAt(0).toLowerCase() + tabela.naziv.slice(1);
    sve.push(["", "", `Ukupno ${naziv}`, "", "", "", "", "", ""]);
  }

  const list = XLSX.utils.aoa_to_sheet(sve);

  tabela.redovi.forEach((r, i) => {
    const red0 = brojRedaZaglavlja + i;
    list[XLSX.utils.encode_cell({ r: red0, c: 1 })] = {
      t: "n",
      v: excelSerijskiDatum(new Date(r.datumIso)),
      z: DATUM_FORMAT,
    };
    list[XLSX.utils.encode_cell({ r: red0, c: 5 })] = {
      t: "n",
      v: r.iznos / 100,
      z: formatNovcanaKolona(r.valuta),
    };
    if (r.kurs != null) {
      list[XLSX.utils.encode_cell({ r: red0, c: 6 })] = {
        t: "n",
        v: r.kurs,
        z: "#,##0.00",
      };
    }
    if (r.iznosRsd != null) {
      list[XLSX.utils.encode_cell({ r: red0, c: 7 })] = {
        t: "n",
        v: r.iznosRsd / 100,
        z: formatNovcanaKolona("RSD"),
      };
    }
  });

  if (tabela.zbirRsd != null) {
    const redZbira0 = brojRedaZaglavlja + tabela.redovi.length;
    list[XLSX.utils.encode_cell({ r: redZbira0, c: 7 })] = {
      t: "n",
      v: tabela.zbirRsd / 100,
      z: formatNovcanaKolona("RSD"),
    };
  }

  list["!cols"] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 28 },
    { wch: 14 },
    { wch: 30 },
    { wch: 14 },
    { wch: 10 },
    { wch: 16 },
    { wch: 14 },
  ];

  return list;
}

export function napraviIzvozExcel(
  tabele: TabelaIzvoza[],
  firma: { naziv: string; pib: string },
  godina: number,
  period: PeriodIzvoza,
  danas: Date,
): Buffer {
  const knjiga = XLSX.utils.book_new();
  for (const tabela of tabele) {
    const list = listZaTabelu(tabela, firma, godina, period, danas);
    XLSX.utils.book_append_sheet(knjiga, list, tabela.naziv);
  }
  return XLSX.write(knjiga, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
