"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { BankAccount } from "../../../../../generated/prisma/client";
import { ukloniRacunAction } from "./actions";
import { AccountPanel } from "./AccountPanel";
import styles from "./RacuniTab.module.css";

export function AccountCard({ racun, onChanged }: { racun: BankAccount; onChanged: () => void }) {
  const [izmeniOtvoreno, setIzmeniOtvoreno] = useState(false);
  const [ukloniOtvoreno, setUkloniOtvoreno] = useState(false);
  const [greskaUklanjanja, setGreskaUklanjanja] = useState<string | null>(null);
  const [uToku, pokreni] = useTransition();
  const jeDinarski = racun.type === "RSD";

  function ukloni() {
    pokreni(async () => {
      const rezultat = await ukloniRacunAction(racun.id);
      if (!rezultat.ok) {
        if (rezultat.razlog === "u_upotrebi") {
          setGreskaUklanjanja(
            `Ovaj račun koristi nacrt fakture (${rezultat.fakture.join(", ")}). Izaberi drugi račun na toj fakturi pre uklanjanja.`,
          );
        } else {
          setGreskaUklanjanja("Račun ne postoji.");
        }
        return;
      }
      setUkloniOtvoreno(false);
      onChanged();
    });
  }

  return (
    <div className={styles.kartica}>
      <div className={styles.karticaZaglavlje}>
        <span className={styles.karticaNaslov}>
          {jeDinarski ? "Dinarski račun" : "Devizni račun"}
          <span className={styles.pilulaNeutralna}>{racun.currency}</span>
        </span>
        {racun.isDefault && <span className={styles.pilulaIstaknuta}>Za fakture</span>}
      </div>
      <div className={styles.red}>
        <span className={styles.kljuc}>Banka</span>
        <span className={styles.vrednost}>{racun.bank}</span>
      </div>
      {jeDinarski ? (
        <div className={styles.red}>
          <span className={styles.kljuc}>Broj računa</span>
          <span className={styles.vrednost}>{formatRacun(racun.number ?? "")}</span>
        </div>
      ) : (
        <>
          <div className={styles.red}>
            <span className={styles.kljuc}>IBAN</span>
            <span className={styles.vrednost}>{racun.iban}</span>
          </div>
          <div className={styles.red}>
            <span className={styles.kljuc}>SWIFT</span>
            <span className={styles.vrednost}>{racun.swift}</span>
          </div>
        </>
      )}
      <div className={styles.akcije}>
        <button type="button" className={styles.izmeniLink} onClick={() => setIzmeniOtvoreno(true)}>
          Izmeni
        </button>
        <button type="button" className={styles.ukloniLink} onClick={() => setUkloniOtvoreno(true)}>
          Ukloni
        </button>
      </div>

      {izmeniOtvoreno && (
        <AccountPanel
          racun={racun}
          onClose={() => setIzmeniOtvoreno(false)}
          onSaved={() => {
            setIzmeniOtvoreno(false);
            onChanged();
          }}
        />
      )}

      {ukloniOtvoreno && (
        <Modal naslov={`Ukloniti ${jeDinarski ? "dinarski" : "devizni"} račun ${racun.currency}?`} onClose={() => setUkloniOtvoreno(false)}>
          <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
            Fakture koje ga koriste ostaju nepromenjene.
          </p>
          {greskaUklanjanja && (
            <p style={{ margin: 0, color: "var(--color-alert-danger-text)" }}>{greskaUklanjanja}</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <Button varijanta="opasno" disabled={uToku} onClick={ukloni}>
              Ukloni
            </Button>
            <Button varijanta="sekundarno" disabled={uToku} onClick={() => setUkloniOtvoreno(false)}>
              Odustani
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function formatRacun(cifre18: string): string {
  if (!/^\d{18}$/.test(cifre18)) return cifre18;
  const banka = cifre18.slice(0, 3);
  const broj = cifre18.slice(3, 16).replace(/^0+(?=\d)/, "");
  const kontrola = cifre18.slice(16);
  return `${banka}-${broj}-${kontrola}`;
}
