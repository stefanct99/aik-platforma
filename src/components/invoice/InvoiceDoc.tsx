// Prikaz fakture na "papiru" (A4, Korak 8a tačka 6, prepravljeno u Korak 8d-2) - JEDNA ponovo upotrebljiva
// komponenta koja crta fakturu IZ ŠABLONA (src/lib/invoice-templates.ts): koji blokovi su vidljivi, u kom
// redosledu, i njihov stil (poravnanje, veličina, boja, pozadina, okvir), plus podešavanja tabele stavki i
// cele fakture (boja akcenta, margine, traka, žig, podnožje, logo). Ista komponenta se koristi za uživo
// pregled (pregled fakture, Nova faktura, Pošalji ponovo) i za PDF (src/lib/pdf.ts renderuje stranicu koja
// prikazuje SAMO ovu komponentu) - "mora da izgleda isto" je zato doslovno ispunjeno (isti kod).
// Sadržaj svakog bloka (koji tekst, bold, prelomi reda) je NEPROMENJEN od pre Koraka 8d-2 - samo je sada
// uslovljen time da li je blok uključen, i stilizovan prema blockProps umesto fiksnim CSS vrednostima.
// Papir je UVEK svetao (bg #fff/#111), bez obzira na temu aplikacije (potvrđeno: Dk_Fak15 crta isti beli
// papir u tamnoj temi).
import {
  bojaZaglavljaTabele,
  definicijeKolonaTabele,
  imaLinijeRedovaTabele,
  imaOkvirTabele,
  marginePapira,
  oblikLoga,
  poredakUGrupi,
  razmakRedovaTabele,
  stilBloka,
  velicinaLoga,
  vidljiviBlokovi,
  type PodaciSablona,
} from "@/lib/invoice-templates";
import { formatNovacKompaktno, formatNovacPuno } from "@/lib/money";
import { IkonaFakture } from "@/components/ui/icons";
import styles from "./InvoiceDoc.module.css";

const LABELS = {
  en: {
    date: "DATE",
    invoiceNo: "INVOICE No",
    to: "To:",
    address: "Address:",
    from: "From:",
    idNum: "Identification number:",
    taxId: "Tax identification number (PIB):",
    bankDetails: "Banking details:",
    beneficiary: "Beneficiary:",
    beneficiaryBank: "Beneficiary Bank:",
    accountNo: "Account number:",
    iban: "IBAN:",
    swift: "SWIFT:",
    vat: "VAT (0%)",
    total: "TOTAL AMOUNT",
    payWithin: (d: number) => `Pay within ${d} days`,
  },
  sr: {
    date: "DATUM",
    invoiceNo: "FAKTURA br.",
    to: "Kupac:",
    address: "Adresa:",
    from: "Izdavalac:",
    idNum: "Matični broj:",
    taxId: "PIB:",
    bankDetails: "Podaci za uplatu:",
    beneficiary: "Primalac:",
    beneficiaryBank: "Banka:",
    accountNo: "Broj računa:",
    iban: "IBAN:",
    swift: "SWIFT:",
    vat: "PDV (0%)",
    total: "UKUPNO",
    payWithin: (d: number) => `Rok plaćanja: ${d} dana.`,
  },
} as const;

export type StavkaDoc = { desc: string; qty: number; price: number };

export type InvoiceDocProps = {
  broj: string;
  valuta: string;
  jezik: "sr" | "en";
  datumIzdavanja: Date;
  dueDays: number;
  stavke: StavkaDoc[];
  klijent: { name: string; address?: string | null; country?: string | null } | null;
  firma: {
    ownerName: string;
    name: string;
    mb: string;
    pib: string;
    street?: string | null;
    city?: string | null;
  };
  racun: {
    type: string;
    bank: string;
    number?: string | null;
    iban?: string | null;
    swift?: string | null;
  } | null;
  sablon: PodaciSablona;
  // Polje "Napomena" sa forme fakture (Invoice.note) - blok "napomena" ga prikazuje SAMO ako je popunjeno
  // (Korak 8d-2, pravilo 3). Fiksna linija "Nisam u sistemu PDV." ostaje nezavisna od ovog bloka.
  napomena?: string | null;
};

function formatDatumZaFakturu(datum: Date): string {
  const dan = String(datum.getUTCDate()).padStart(2, "0");
  const mesec = String(datum.getUTCMonth() + 1).padStart(2, "0");
  return `${dan}.${mesec}.${datum.getUTCFullYear()}.`;
}

export function InvoiceDoc({
  broj,
  valuta,
  jezik,
  datumIzdavanja,
  dueDays,
  stavke,
  klijent,
  firma,
  racun,
  sablon,
  napomena,
}: InvoiceDocProps) {
  const L = LABELS[jezik];
  const jeRsd = valuta === "RSD";
  const ukupno = stavke.reduce((z, s) => z + (s.qty || 1) * (s.price || 0), 0);
  const drzava = jezik === "sr" ? "Srbija" : "Serbia";
  const imeFirme = `${(firma.ownerName || "").toUpperCase()} ${(firma.name || "").toUpperCase()}`.trim();

  const vidljivi = vidljiviBlokovi(sablon);
  const prikazi = (b: (typeof vidljivi)[number]) => vidljivi.includes(b);
  const levoBlokovi = poredakUGrupi(sablon, ["broj", "klijent"]);
  const desnoBlokovi = poredakUGrupi(sablon, ["firma", "banka"]);

  const prikazujStavke = prikazi("stavke");
  const prikazujUkupno = prikazi("ukupno");
  const kolone = definicijeKolonaTabele(jezik, valuta);
  const aktivneKolone = sablon.table.cols.filter((c) => kolone[c]);

  const pozivNaBroj = jeRsd && jezik === "sr" ? ` Poziv na broj: 97 ${broj}.` : "";
  const prikazujRok = prikazi("rok");
  const prikazujNapomenu = prikazi("napomena") && !!napomena;
  const prikazujFooter = prikazujRok || prikazujNapomenu || jezik === "sr";

  const velLoga = velicinaLoga(sablon);

  return (
    <div
      className={styles.papir}
      style={{
        padding: marginePapira(sablon),
        fontFamily: `${sablon.doc.textFont}, Inter, sans-serif`,
      }}
    >
      {sablon.doc.topBar && <div className={styles.trakaVrh} style={{ background: sablon.accentColor }} />}
      {sablon.doc.sideBar && <div className={styles.trakaStrana} style={{ background: sablon.accentColor }} />}

      {(prikazi("logo") || prikazi("datum")) && (
        <div className={styles.zaglavljeRed}>
          {prikazi("logo") && (
            <span
              className={styles.logo}
              style={{ width: velLoga, height: velLoga, borderRadius: oblikLoga(sablon) }}
            >
              <IkonaFakture size={Math.round(velLoga * 0.55)} />
            </span>
          )}
          {prikazi("datum") && (
            <b style={stilBloka(sablon, "datum")}>
              {L.date}: {formatDatumZaFakturu(datumIzdavanja)}
            </b>
          )}
        </div>
      )}

      {(levoBlokovi.length > 0 || desnoBlokovi.length > 0) && (
        <div className={styles.dvaStupca}>
          {levoBlokovi.length > 0 && (
            <div className={styles.levo}>
              {levoBlokovi.map((b) =>
                b === "broj" ? (
                  <span key="broj" className={styles.brojFakture} style={stilBloka(sablon, "broj")}>
                    {L.invoiceNo}
                    {jezik === "sr" ? " " : ": "}
                    {broj}
                  </span>
                ) : (
                  <div key="klijent" style={stilBloka(sablon, "klijent")}>
                    <b>
                      {L.to} {klijent?.name ?? "–"}
                    </b>
                    {klijent?.address && (
                      <>
                        <br />
                        {L.address} {klijent.address}
                      </>
                    )}
                    {klijent?.country && (
                      <>
                        <br />
                        {klijent.country}
                      </>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
          {desnoBlokovi.length > 0 && (
            <div className={styles.desno} style={{ width: sablon.blockProps.firma.w }}>
              {desnoBlokovi.map((b) =>
                b === "firma" ? (
                  <div key="firma" style={stilBloka(sablon, "firma")}>
                    <b>
                      {L.from} {imeFirme}
                    </b>
                    <br />
                    {L.idNum} {firma.mb}
                    <br />
                    {L.taxId} {firma.pib}
                    <br />
                    {L.address} {firma.street ? `${firma.street}, ` : ""}
                    {firma.city ?? ""}, {drzava}
                  </div>
                ) : (
                  <div key="banka" style={stilBloka(sablon, "banka")}>
                    {/* Samo JEDAN <br/> (ne dva kao kod "firma" koja je i dalje jedan flat blok): originalni
                        kod je imao "adresa<br/><br/>Podaci za uplatu" (1 prazan red) u JEDNOM div-u; otkad
                        su firma/banka razdvojeni u dva <div>-a, granica div-ova već daje taj PRVI prelom
                        reda - drugi <br/> bi dodao jedan prazan red previše (uživo potvrđeno, 26.11.2026). */}
                    <br />
                    {L.bankDetails}
                    <br />
                    {L.beneficiary} {imeFirme}
                    <br />
                    {L.beneficiaryBank} {racun?.bank ?? "–"}
                    <br />
                    {jeRsd ? (
                      <>
                        {L.accountNo} {racun?.number ?? "–"}
                      </>
                    ) : (
                      <>
                        {L.iban} {racun?.iban ?? "–"}
                        <br />
                        {L.swift} {racun?.swift ?? "–"}
                      </>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      )}

      {(prikazujStavke || prikazujUkupno) && (
        <div className={`${styles.tabela} ${imaOkvirTabele(sablon) ? styles.tabelaOkvir : ""}`}>
          {prikazujStavke && (
            <div style={stilBloka(sablon, "stavke")}>
              <div
                className={styles.tabelaRedZaglavlje}
                style={{ padding: razmakRedovaTabele(sablon), background: bojaZaglavljaTabele(sablon) }}
              >
                {aktivneKolone.map((c) => (
                  <span key={c} className={kolone[c].poravnanje === "right" ? styles.desnoPoravnato : undefined}>
                    {kolone[c].label}
                  </span>
                ))}
              </div>
              {stavke.map((st, i) => (
                <div
                  className={`${styles.tabelaRed} ${imaLinijeRedovaTabele(sablon) ? styles.linijaReda : ""} ${sablon.table.zebra && i % 2 === 1 ? styles.zebra : ""}`}
                  style={{ padding: razmakRedovaTabele(sablon) }}
                  key={i}
                >
                  {aktivneKolone.map((c) => (
                    <span key={c} className={kolone[c].poravnanje === "right" ? styles.desnoPoravnato : undefined}>
                      {kolone[c].get(st)}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
          {prikazujUkupno && (
            <div style={stilBloka(sablon, "ukupno")}>
              <div
                className={`${styles.tabelaRed} ${imaLinijeRedovaTabele(sablon) ? styles.linijaReda : ""}`}
                style={{ padding: razmakRedovaTabele(sablon) }}
              >
                <span>{L.vat}</span>
                <b>{formatNovacKompaktno(0, valuta)}</b>
              </div>
              <div
                className={`${styles.tabelaRed} ${imaLinijeRedovaTabele(sablon) ? styles.linijaReda : ""} ${styles.ukupnoRed}`}
                style={{ padding: razmakRedovaTabele(sablon) }}
              >
                <span>{L.total}</span>
                <span>{formatNovacPuno(ukupno, valuta)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {prikazujFooter && (
        <div className={styles.footer}>
          {prikazujRok && (
            <span style={stilBloka(sablon, "rok")}>
              {L.payWithin(dueDays)}
              {pozivNaBroj}
            </span>
          )}
          {prikazujNapomenu && (
            <span style={stilBloka(sablon, "napomena")}>
              {prikazujRok && <br />}
              {napomena}
            </span>
          )}
          {jezik === "sr" && (
            <>
              {(prikazujRok || prikazujNapomenu) && <br />}
              Nisam u sistemu PDV.
            </>
          )}
        </div>
      )}

      {sablon.doc.footerText && <div className={styles.footerText}>{sablon.doc.footerText}</div>}
    </div>
  );
}
