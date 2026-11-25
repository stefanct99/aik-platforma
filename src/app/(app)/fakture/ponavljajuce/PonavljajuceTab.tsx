// Tab Ponavljajuće (Korak 8c, frejm Fak13/PhFak13, spec 6.8). Red je klikljiv (otvara Uredi) I ima ⋯
// meni (Pauziraj/Nastavi, Uredi, Obriši) - frejm pokazuje ⋯ na svakom redu, za razliku od prototipa koji
// nema meni po redu (frejm pobeđuje, prijavljeno kao odstupanje u izveštaju).
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { IkonaPlus, IkonaFakture, IkonaSparkle } from "@/components/ui/icons";
import { FaktureHeader } from "@/components/fakture/FaktureHeader";
import { RedMenija, type StavkaMenija } from "@/components/fakture/RedMenija";
import { StatusZnackaPonavljajuce } from "@/components/fakture/StatusZnackaPonavljajuce";
import { formatDatumSrpski } from "@/lib/datum";
import { formatNovacKompaktno } from "@/lib/money";
import { postaviStatusPonavljajuceAction, obrisiPonavljajucuAction } from "../actions";
import { RecurringPanel, type KlijentZaPonavljajucu, type PonavljajucaRed } from "./RecurringPanel";
import styles from "./PonavljajuceTab.module.css";

export type PonavljajucaListRed = PonavljajucaRed & {
  clientName: string;
  currency: string;
  nextDate: string;
  status: "aktivna" | "pauzirana";
};

export function PonavljajuceTab({
  stavke,
  klijenti,
  brojevi,
  prefill,
}: {
  stavke: PonavljajucaListRed[];
  klijenti: KlijentZaPonavljajucu[];
  brojevi: { fakture: number; klijenti: number; ponavljajuce: number };
  prefill?: { clientId: string; desc: string | null; amount: number | null } | null;
}) {
  const router = useRouter();
  // Prefill stiže iz "Napravi ponavljajuću od ove" (Fak16) - otvara formu odmah pri dolasku na stranicu
  // (početno stanje, ne efekat - stranica se iznova učitava sa punim URL-om svaki put kad se stigne
  // ovamo iz Fak16, nema potrebe da se ovo osveži posle prve izmene stanja).
  const [uredjivanje, setUredjivanje] = useState<"new" | string | null>(prefill ? "new" : null);
  const [brisanje, setBrisanje] = useState<string | null>(null);

  const stavkaUredjivanje = uredjivanje && uredjivanje !== "new" ? stavke.find((s) => s.id === uredjivanje) ?? null : null;

  function stavkaTekst(r: PonavljajucaListRed) {
    if (r.desc && r.amount != null) return `${r.desc}, ${formatNovacKompaktno(r.amount, r.currency)}`;
    if (r.desc) return `${r.desc}, Iznos se upisuje pri slanju`;
    return "Iznos se upisuje pri slanju";
  }

  function menuStavke(r: PonavljajucaListRed): StavkaMenija[] {
    return [
      {
        kljuc: "status",
        tekst: r.status === "aktivna" ? "Pauziraj" : "Nastavi",
        onClick: async () => {
          await postaviStatusPonavljajuceAction(r.id, r.status === "aktivna" ? "pauzirana" : "aktivna");
          router.refresh();
        },
      },
      { kljuc: "uredi", tekst: "Uredi", onClick: () => setUredjivanje(r.id) },
      { kljuc: "obrisi", tekst: "Obriši", opasno: true, onClick: () => setBrisanje(r.id) },
    ];
  }

  async function potvrdiBrisanje() {
    if (!brisanje) return;
    await obrisiPonavljajucuAction(brisanje);
    setBrisanje(null);
    router.refresh();
  }

  if (stavke.length === 0) {
    return (
      <>
        <FaktureHeader
          brojevi={brojevi}
          dugme={
            <Button varijanta="primarno" onClick={() => setUredjivanje("new")}>
              <IkonaPlus size={18} /> Nova ponavljajuća faktura
            </Button>
          }
        />
        <div className={styles.sadrzaj}>
          <div className={styles.prazno}>
            <span className={styles.praznaIkonica}>
              <IkonaFakture size={32} />
            </span>
            <div className={styles.praznoTekst}>
              <span className={styles.praznoNaslov}>Još nemaš ponavljajuću fakturu</span>
              <span className={styles.praznoOpis}>
                Na zadati dan ja pripremim fakturu, a ti samo proveriš iznos i odobriš.
              </span>
            </div>
            <Button varijanta="primarno" onClick={() => setUredjivanje("new")}>
              Nova ponavljajuća faktura
            </Button>
          </div>
        </div>
        {uredjivanje && (
          <RecurringPanel
            item={stavkaUredjivanje}
            prefill={uredjivanje === "new" ? prefill : null}
            klijenti={klijenti}
            onClose={() => setUredjivanje(null)}
            onSaved={() => {
              setUredjivanje(null);
              router.refresh();
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <FaktureHeader
        brojevi={brojevi}
        dugme={
          <Button varijanta="primarno" onClick={() => setUredjivanje("new")}>
            <IkonaPlus size={18} /> Nova ponavljajuća faktura
          </Button>
        }
      />
      <div className={styles.sadrzaj}>
        <div className={styles.baner}>
          <span className={styles.banerIkonica}>
            <IkonaSparkle size={18} />
          </span>
          <span>
            Na zadati dan ja pripremim fakturu, a ti samo proveriš iznos i odobriš. Slanje bez pitanja uključuješ
            posebno za svakog klijenta.
          </span>
        </div>

        <div className={styles.tabelaWrap}>
          <div className={`${styles.tRed} ${styles.tZaglavlje}`}>
            <span className={styles.cKlijent}>Klijent</span>
            <span className={styles.cStavka}>Stavka</span>
            <span className={styles.cPonavlja}>Ponavlja se</span>
            <span className={styles.cSledeca}>Sledeća faktura</span>
            <span className={styles.cSlanje}>Slanje</span>
            <span className={styles.cStatus}>Status</span>
            <span className={styles.cMeni}></span>
          </div>
          {stavke.map((r) => (
            <div key={r.id} className={`${styles.tRed} ${styles.red}`} onClick={() => setUredjivanje(r.id)}>
              <span className={`${styles.cKlijent} ${styles.ellip}`} title={r.clientName}>
                {r.clientName}
              </span>
              <span className={`${styles.cStavka} ${styles.ellip}`} title={stavkaTekst(r)}>
                {r.desc == null && r.amount == null ? (
                  <span className={styles.podnaslov}>{stavkaTekst(r)}</span>
                ) : (
                  stavkaTekst(r)
                )}
              </span>
              <span className={styles.cPonavlja}>Mesečno, {r.dayOfMonth}. u mesecu</span>
              <span className={styles.cSledeca}>
                {r.status === "pauzirana" ? (
                  <span className={styles.podnaslov}>Pauzirano</span>
                ) : (
                  formatDatumSrpski(new Date(r.nextDate))
                )}
              </span>
              <span className={styles.cSlanje}>{r.mode === "auto" ? "Šalje se automatski" : "Traži moje odobrenje"}</span>
              <span className={styles.cStatus}>
                <StatusZnackaPonavljajuce status={r.status} />
              </span>
              <span className={styles.cMeni} onClick={(e) => e.stopPropagation()}>
                <RedMenija stavke={menuStavke(r)} />
              </span>
            </div>
          ))}
        </div>

        <div className={styles.karticeMobilne}>
          {stavke.map((r) => (
            <div key={r.id} className={styles.kartaRed} onClick={() => setUredjivanje(r.id)}>
              <div className={styles.kartaGore}>
                <span>{r.clientName}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <StatusZnackaPonavljajuce status={r.status} />
                  <span onClick={(e) => e.stopPropagation()}>
                    <RedMenija stavke={menuStavke(r)} />
                  </span>
                </div>
              </div>
              <span className={styles.kartaStavka}>{stavkaTekst(r)}</span>
              <div className={styles.kartaDole}>
                <span>Mesečno, {r.dayOfMonth}. u mesecu</span>
                <span>{r.status === "pauzirana" ? "Pauzirano" : `Sledeća: ${formatDatumSrpski(new Date(r.nextDate))}`}</span>
              </div>
              <span className={styles.kartaRezim}>{r.mode === "auto" ? "Šalje se automatski" : "Traži moje odobrenje"}</span>
            </div>
          ))}
        </div>
      </div>

      {uredjivanje && (
        <RecurringPanel
          item={stavkaUredjivanje}
          prefill={uredjivanje === "new" ? prefill : null}
          klijenti={klijenti}
          onClose={() => setUredjivanje(null)}
          onSaved={() => {
            setUredjivanje(null);
            router.refresh();
          }}
        />
      )}

      {brisanje && (
        <Modal naslov="Obrisati ponavljajuću fakturu?" onClose={() => setBrisanje(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <span style={{ fontSize: "1rem", lineHeight: 1.5, color: "var(--color-text-muted)" }}>
              Ovo ne briše već napravljene fakture, samo zaustavlja dalje pravljenje novih. Ne može se poništiti.
            </span>
            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
              <Button type="button" varijanta="sekundarno" onClick={() => setBrisanje(null)}>
                Odustani
              </Button>
              <Button type="button" varijanta="opasno" onClick={potvrdiBrisanje}>
                Obriši
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
