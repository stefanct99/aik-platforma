// Pregled fakture (Korak 8a, frejmovi Fak15/16/17/21/22/23, spec 7.5).
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusZnacka } from "@/components/fakture/StatusZnacka";
import { RedMenija, type StavkaMenija } from "@/components/fakture/RedMenija";
import { OznaciPlacenomDialog } from "@/components/fakture/OznaciPlacenomDialog";
import { StornoDialog } from "@/components/fakture/StornoDialog";
import { PodsetnikDialog } from "@/components/fakture/PodsetnikDialog";
import { InvoiceDoc } from "@/components/invoice/InvoiceDoc";
import { efektivniStatus, izracunajUkupno, rokFakture } from "@/lib/invoice-status";
import { labelaStatusa } from "@/lib/invoice-display";
import { formatNovacPuno } from "@/lib/money";
import { formatDatumSrpski } from "@/lib/datum";
import { obrisiNacrtAction } from "../actions";
import styles from "./InvoiceDetailView.module.css";

type Faktura = {
  id: string;
  number: string;
  status: "nacrt" | "poslata" | "placena" | "stornirana";
  currency: string;
  lang: "sr" | "en";
  issueDate: string;
  dueDays: number;
  note: string | null;
  voidedAt: string | null;
  client: { id: string; name: string; billingEmail: string; address: string | null; country: string | null };
  account: {
    bank: string;
    type: string;
    number: string | null;
    iban: string | null;
    swift: string | null;
    currency: string;
  } | null;
  items: { desc: string; qty: number; price: number }[];
  events: { tip: string; datum: string }[];
  incomes: { source: string; date: string }[];
};

type Business = { ownerName: string; name: string; mb: string; pib: string; street: string | null; city: string | null };

const NAZIV_DOGADJAJA: Record<string, string> = {
  napravljena: "Napravljena",
  poslata: "Poslata",
  placena: "Plaćena",
  stornirana: "Stornirana",
  podsetnik_poslat: "Podsetnik poslat",
};

export function InvoiceDetailView({
  invoice,
  business,
  danasIso,
}: {
  invoice: Faktura;
  business: Business;
  danasIso: string;
}) {
  const router = useRouter();
  const danas = new Date(danasIso);
  const izdata = new Date(invoice.issueDate);
  const efektivni = efektivniStatus(invoice.status, izdata, invoice.dueDays, danas);
  const ukupno = izracunajUkupno(invoice.items);
  const rok = rokFakture(izdata, invoice.dueDays);

  const [modal, setModal] = useState<"placeno" | "storno" | "podsetnik" | null>(null);

  function osveziIZatvori() {
    setModal(null);
    router.refresh();
  }

  const menuItems: StavkaMenija[] = [
    { kljuc: "izmeni", tekst: "Izmeni fakturu", href: "/fakture/nova" },
    { kljuc: "dupliraj", tekst: "Dupliraj fakturu", href: "/fakture/nova" },
    { kljuc: "pdf", tekst: "Preuzmi PDF", href: `/api/fakture/${invoice.id}/pdf` },
    { kljuc: "ponavljajuca", tekst: "Napravi ponavljajuću od ove", href: "/fakture/ponavljajuce" },
    { kljuc: "storno", tekst: "Storniraj fakturu", opasno: true, onClick: () => setModal("storno") },
  ];

  const racunOpis = invoice.account
    ? `${invoice.account.bank}, ${invoice.account.currency}`
    : "–";

  const tekstUplate = (() => {
    if (efektivni === "nacrt") return "Faktura još nije poslata.";
    if (efektivni === "placena") {
      const uplata = invoice.incomes[0];
      return `Uplata je stigla ${uplata ? formatDatumSrpski(new Date(uplata.date)) : ""} (ručno označeno kao plaćeno).`;
    }
    if (efektivni === "kasni") return "Uplata još nije stigla. Svakog dana proveravam mejlove banke.";
    if (efektivni === "stornirana") return "Stornirana faktura se ne prati za uplatu.";
    return "Uplata još nije stigla. Čim banka pošalje mejl, povezaću je sa ovom fakturom.";
  })();

  return (
    <div className={styles.sadrzaj}>
      <div className={styles.mrvice}>
        <Link href="/fakture">Fakture</Link>
        <span>/</span>
        <span className={styles.mrvicaAktivna}>{invoice.number}</span>
      </div>

      <div className={styles.glava}>
        <div className={styles.glavaTekst}>
          <h1 className={styles.naslov}>
            Faktura {invoice.number}{" "}
            <StatusZnacka status={efektivni} tekst={labelaStatusa(efektivni, izdata, invoice.dueDays, danas)} />
          </h1>
          <p className={styles.opis}>
            {invoice.client.name}, {formatNovacPuno(ukupno, invoice.currency)}
          </p>
        </div>
        <div className={styles.akcije}>
          {efektivni === "nacrt" && (
            <>
              <Button varijanta="primarno" onClick={() => router.push("/fakture/nova")}>
                Nastavi uređivanje
              </Button>
              <Button
                varijanta="sekundarno"
                onClick={async () => {
                  await obrisiNacrtAction(invoice.id);
                  router.push("/fakture");
                }}
              >
                Obriši
              </Button>
            </>
          )}
          {efektivni === "poslata" && (
            <>
              <Button varijanta="sekundarno" onClick={() => router.push("/fakture/nova")}>
                Pošalji ponovo
              </Button>
              <Button varijanta="primarno" onClick={() => setModal("placeno")}>
                Označi kao plaćenu
              </Button>
              <RedMenija stavke={menuItems} />
            </>
          )}
          {efektivni === "kasni" && (
            <>
              <Button varijanta="sekundarno" onClick={() => setModal("placeno")}>
                Označi kao plaćenu
              </Button>
              <Button varijanta="primarno" onClick={() => setModal("podsetnik")}>
                Pošalji podsetnik
              </Button>
              <RedMenija stavke={menuItems} />
            </>
          )}
          {efektivni === "placena" && (
            <>
              <Button varijanta="sekundarno" onClick={() => router.push(`/api/fakture/${invoice.id}/pdf`)}>
                Preuzmi PDF
              </Button>
              <Button varijanta="primarno" onClick={() => router.push("/fakture/nova")}>
                Pošalji ponovo
              </Button>
            </>
          )}
        </div>
      </div>

      {efektivni === "kasni" && (
        <div className={styles.banerKasni}>
          <b>
            Klijent kasni {labelaStatusa(efektivni, izdata, invoice.dueDays, danas).replace("Kasni ", "")}
          </b>
          <span>Rok je istekao {formatDatumSrpski(rok)} Mogu da mu pošaljem ljubazan podsetnik.</span>
        </div>
      )}

      <div className={styles.kolone}>
        <div className={styles.levaKolona}>
          <div className={styles.karta}>
            <span className={styles.kartaNaslov}>Detalji</span>
            <div className={styles.kv}>
              <span className={styles.k}>Klijent</span>
              <span className={styles.v}>
                {invoice.client.name}
                <br />
                <span className={styles.podnaslov}>{invoice.client.billingEmail}</span>
              </span>
            </div>
            <div className={styles.kv}>
              <span className={styles.k}>Iznos</span>
              <span className={styles.v}>{formatNovacPuno(ukupno, invoice.currency)}</span>
            </div>
            <div className={styles.kv}>
              <span className={styles.k}>Izdata</span>
              <span className={styles.v}>{formatDatumSrpski(izdata)}</span>
            </div>
            <div className={styles.kv}>
              <span className={styles.k}>Rok za uplatu</span>
              <span className={styles.v}>{efektivni === "nacrt" ? "Nije poslata" : formatDatumSrpski(rok)}</span>
            </div>
            <div className={`${styles.kv} ${styles.kvPoslednji}`}>
              <span className={styles.k}>Račun za uplatu</span>
              <span className={styles.v}>{racunOpis}</span>
            </div>
          </div>

          <div className={styles.karta}>
            <span className={styles.kartaNaslov}>Istorija</span>
            <div className={styles.vremenskaLinija}>
              {invoice.events.map((d, i) => (
                <div className={styles.linijaStavka} key={i}>
                  <span className={styles.t1}>
                    {d.tip === "poslata" ? `Poslata na ${invoice.client.billingEmail}` : NAZIV_DOGADJAJA[d.tip] ?? d.tip}
                  </span>
                  <span>{formatDatumSrpski(new Date(d.datum))}</span>
                </div>
              ))}
              {efektivni === "kasni" && (
                <div className={styles.linijaStavka}>
                  <span className={styles.t1}>Rok je istekao</span>
                  <span>
                    {formatDatumSrpski(rok)}, {labelaStatusa(efektivni, izdata, invoice.dueDays, danas).toLowerCase()}
                  </span>
                </div>
              )}
              {efektivni === "poslata" && (
                <div className={styles.linijaStavka}>
                  <span className={styles.t1}>Čeka uplatu</span>
                  <span>Rok je {formatDatumSrpski(rok)}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.karta}>
            <span className={styles.kartaNaslov}>Uplata</span>
            <p className={styles.uplataTekst}>{tekstUplate}</p>
          </div>
        </div>

        <div className={styles.desnaKolona}>
          <div className={styles.desnaGlava}>
            <span>Kako je klijent vidi</span>
            <Link href={`/api/fakture/${invoice.id}/pdf`} className={styles.preuzmiLink}>
              Preuzmi PDF
            </Link>
          </div>
          <div className={styles.papirOmot}>
            <div className={styles.papirSkaliran}>
              <InvoiceDoc
                broj={invoice.number}
                valuta={invoice.currency}
                jezik={invoice.lang}
                datumIzdavanja={izdata}
                dueDays={invoice.dueDays}
                stavke={invoice.items}
                klijent={invoice.client}
                firma={business}
                racun={invoice.account}
              />
            </div>
          </div>
        </div>
      </div>

      {modal === "placeno" && (
        <OznaciPlacenomDialog
          invoiceId={invoice.id}
          broj={invoice.number}
          onClose={() => setModal(null)}
          onSacuvano={osveziIZatvori}
        />
      )}
      {modal === "storno" && (
        <StornoDialog
          invoiceId={invoice.id}
          broj={invoice.number}
          nazivKlijenta={invoice.client.name}
          onClose={() => setModal(null)}
          onSacuvano={osveziIZatvori}
        />
      )}
      {modal === "podsetnik" && (
        <PodsetnikDialog
          invoiceId={invoice.id}
          broj={invoice.number}
          billingEmail={invoice.client.billingEmail}
          jezik={invoice.lang}
          onClose={() => setModal(null)}
          onPoslato={() => router.refresh()}
        />
      )}
    </div>
  );
}
