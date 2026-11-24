// Prikaz fakture na "papiru" (A4, Korak 8a, tačka 6): JEDNA ponovo upotrebljiva komponenta koja crta
// fakturu iz podataka - frejmovi Fak3 (engleski, EUR) i Fak20 (srpski, dinarski sa pozivom na broj).
// Ista komponenta se koristi za uživo pregled (u pregledu fakture) i za PDF (src/lib/pdf.ts renderuje
// stranicu koja prikazuje SAMO ovu komponentu) - "mora da izgleda isto" iz zadatka je zato doslovno
// ispunjeno (isti kod, ne dva odvojena prikaza). Papir je UVEK svetao (bg #fff/#111), bez obzira na temu
// aplikacije (potvrđeno: Dk_Fak15 crta isti beli papir u tamnoj temi).
import { formatNovac } from "@/lib/money";
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
    description: "DESCRIPTION",
    amountCol: (c: string) => "AMOUNT " + c,
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
    description: "OPIS",
    amountCol: (c: string) => "IZNOS " + c,
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
}: InvoiceDocProps) {
  const L = LABELS[jezik];
  const jeRsd = valuta === "RSD";
  const ukupno = stavke.reduce((z, s) => z + (s.qty || 1) * (s.price || 0), 0);
  const drzava = jezik === "sr" ? "Srbija" : "Serbia";
  const imeFirme = `${(firma.ownerName || "").toUpperCase()} ${(firma.name || "").toUpperCase()}`.trim();

  return (
    <div className={styles.papir}>
      <div className={styles.zaglavljeRed}>
        <span className={styles.logo}>
          <IkonaFakture size={24} />
        </span>
        <b>
          {L.date}: {formatDatumZaFakturu(datumIzdavanja)}
        </b>
      </div>

      <div className={styles.dvaStupca}>
        <div className={styles.levo}>
          <span className={styles.brojFakture}>
            {L.invoiceNo}
            {jezik === "sr" ? " " : ": "}
            {broj}
          </span>
          <div>
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
        </div>
        <div className={styles.desno}>
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
          <br />
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
      </div>

      <div className={styles.tabela}>
        <div className={styles.tabelaRedZaglavlje}>
          <span>{L.description}</span>
          <span>{L.amountCol(valuta)}</span>
        </div>
        {stavke.map((st, i) => (
          <div className={styles.tabelaRed} key={i}>
            <span>{st.desc || "–"}</span>
            <span>{formatNovac((st.qty || 1) * (st.price || 0), valuta)}</span>
          </div>
        ))}
        <div className={styles.tabelaRed}>
          <span>{L.vat}</span>
          <b>{formatNovac(0, valuta)}</b>
        </div>
        <div className={`${styles.tabelaRed} ${styles.ukupnoRed}`}>
          <span>{L.total}</span>
          <span>{formatNovac(ukupno, valuta)}</span>
        </div>
      </div>

      <span>
        {L.payWithin(dueDays)}
        {jeRsd && jezik === "sr" ? ` Poziv na broj: 97 ${broj}.` : ""}
        {jezik === "sr" && (
          <>
            <br />
            Nisam u sistemu PDV.
          </>
        )}
      </span>
    </div>
  );
}
