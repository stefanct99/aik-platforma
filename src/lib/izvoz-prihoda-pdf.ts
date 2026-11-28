// PDF izvoz Knjige prihoda (Korak 9g-2) - čista funkcija koja gradi HTML dokument (bez baze/sesije/
// puppeteer-a), isti razlog odvajanja kao izvoz-prihoda-xlsx.ts. Rendering u sam PDF (puppeteer-core) je
// u pdf.ts (renderujIzvozUPdf) - ovaj fajl samo pravi HTML string koji ta funkcija prima.
//
// Nema frejma za sam dokument (zadatak) - raspored/boje su opisane u zadatku, ne iz okvira. Font: Inter
// (koji aplikacija koristi) nije praktično ugraditi u samostalnu HTML stranicu koju puppeteer renderuje
// preko page.setContent (next/font servira hešovane lokalne fajlove, ne stabilnu putanju; preuzimanje
// Google Fonts preko mreže pri SVAKOM izvozu bi PDF generisanje učinilo zavisnim od interneta) - zadatak
// eksplicitno dozvoljava "inače čitljiv sans-serif", zato se koristi sistemski sans-serif font, ne Inter.
import { formatDatumSrpski } from "./datum";
import { formatNovacPuno } from "./money";
import { opisPerioda, type IzvozRed, type PeriodIzvoza, type TabelaIzvoza } from "./izvoz-prihoda";

function escapeHtml(tekst: string): string {
  return tekst
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Isto kao formatNovacKompaktno/formatNovacPuno, ali bez " din" - kolona "U dinarima" ga nikad ne
// prikazuje (isti obrazac kao ekran, KnjigaPrihodaTab.tsx dinBezOznake/izvoz-prihoda-xlsx.ts).
function dinBezOznake(iznosRsd: number): string {
  return formatNovacPuno(iznosRsd, "RSD").replace(" din", "");
}

function formatKurs(kurs: number): string {
  return kurs.toLocaleString("sr-RS", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function redHtml(r: IzvozRed): string {
  const datum = escapeHtml(formatDatumSrpski(new Date(r.datumIso)));
  const klijent = escapeHtml(r.klijentIme ?? "Nije poznat");
  const faktura = escapeHtml(r.brojFakture ?? "–");
  const opis = escapeHtml(r.opis ?? "–");
  const iznos = escapeHtml(formatNovacPuno(r.iznos, r.valuta));
  const kurs = r.kurs != null ? formatKurs(r.kurs) : "–";
  const uDinarima = r.iznosRsd != null ? dinBezOznake(r.iznosRsd) : "–";
  const izvor = r.izvor === "rucno" ? "Ručno" : "Mejl banke";
  return `<tr>
    <td class="nowrap desno">${r.redniBroj}</td>
    <td class="nowrap">${datum}</td>
    <td>${klijent}</td>
    <td class="nowrap">${faktura}</td>
    <td>${opis}</td>
    <td class="nowrap desno">${iznos}</td>
    <td class="nowrap desno">${kurs}</td>
    <td class="nowrap desno">${uDinarima}</td>
    <td class="nowrap">${izvor}</td>
  </tr>`;
}

function tabelaHtml(tabela: TabelaIzvoza): string {
  const redovi = tabela.redovi.map(redHtml).join("");
  const nazivMalimSlovom =
    tabela.naziv.charAt(0).toLowerCase() + tabela.naziv.slice(1);
  const zbirRed =
    tabela.zbirRsd != null
      ? `<tr class="zbir">
          <td class="nowrap" colspan="7">Ukupno ${escapeHtml(nazivMalimSlovom)}</td>
          <td class="nowrap desno">${dinBezOznake(tabela.zbirRsd)}</td>
          <td></td>
        </tr>`
      : "";
  return `
    <div class="tabela-naslov">${escapeHtml(tabela.naziv)}</div>
    <table>
      <thead>
        <tr>
          <th class="nowrap desno">Redni broj</th>
          <th class="nowrap">Datum uplate</th>
          <th>Klijent</th>
          <th class="nowrap">Faktura</th>
          <th>Opis</th>
          <th class="nowrap desno">Iznos</th>
          <th class="nowrap desno">Kurs</th>
          <th class="nowrap desno">U dinarima</th>
          <th class="nowrap">Izvor</th>
        </tr>
      </thead>
      <tbody>${redovi}${zbirRed}</tbody>
    </table>`;
}

const STIL = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #161a17;
    background: #ffffff;
    font-size: 11px;
  }
  .zaglavlje { margin-bottom: 18px; }
  .naziv-firme { font-size: 18px; font-weight: 700; }
  .pib, .period, .datum-izrade { font-size: 11px; color: #4a524c; }
  .naslov { font-size: 15px; font-weight: 700; margin-top: 8px; }
  .tabela-naslov { font-size: 13px; font-weight: 700; margin: 16px 0 6px; }
  table { width: 100%; border-collapse: collapse; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
  th, td { padding: 4px 8px; font-size: 10px; border-bottom: 1px solid #e3e2da; }
  th { text-align: left; font-weight: 700; border-bottom: 1.5px solid #161a17; }
  .desno { text-align: right; }
  .nowrap { white-space: nowrap; }
  tr.zbir td { font-weight: 700; border-top: 1.5px solid #161a17; border-bottom: none; }
  .potpis {
    display: flex;
    justify-content: space-between;
    margin-top: 48px;
    break-inside: avoid;
  }
  .potpis-polje {
    width: 220px;
    border-top: 1px solid #161a17;
    padding-top: 4px;
    font-size: 10px;
    color: #4a524c;
    text-align: center;
  }
`;

// "Zvaničan KPO obrazac" je NAMERNO nigde pomenuto (zadatak: "Nigde ne tvrdi...") - naslov je samo
// "Knjiga prihoda", bez dodatnih pravnih formulacija.
export function napraviIzvozHtml(
  tabele: TabelaIzvoza[],
  firma: { naziv: string; pib: string },
  godina: number,
  period: PeriodIzvoza,
  danas: Date,
): string {
  const pibRed = firma.pib
    ? `<div class="pib">PIB: ${escapeHtml(firma.pib)}</div>`
    : "";
  return `<!doctype html>
<html lang="sr">
<head>
<meta charset="utf-8" />
<style>${STIL}</style>
</head>
<body>
  <div class="zaglavlje">
    <div class="naziv-firme">${escapeHtml(firma.naziv)}</div>
    ${pibRed}
    <div class="naslov">Knjiga prihoda</div>
    <div class="period">${escapeHtml(opisPerioda(godina, period))}</div>
    <div class="datum-izrade">Datum izrade: ${escapeHtml(formatDatumSrpski(danas))}</div>
  </div>
  ${tabele.map(tabelaHtml).join("")}
  <div class="potpis">
    <div class="potpis-polje">Mesto i datum</div>
    <div class="potpis-polje">Potpis</div>
  </div>
</body>
</html>`;
}
