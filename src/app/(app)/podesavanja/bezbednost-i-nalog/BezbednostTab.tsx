"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { prepoznajPregledacISistem, opisiKadaJeKorisceno } from "@/lib/user-agent";
import { odjaviUredjajAction } from "./actions";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { DeleteAccountModal } from "./DeleteAccountModal";
import styles from "./BezbednostTab.module.css";

export type UredjajPrikaz = {
  id: string;
  userAgent: string | null;
  updatedAt: Date;
  jeTrenutna: boolean;
};

export function BezbednostTab({
  poslednjaPromenaLozinkeOpis,
  sesije,
}: {
  poslednjaPromenaLozinkeOpis: string;
  sesije: UredjajPrikaz[];
}) {
  const [modalLozinka, setModalLozinka] = useState(false);
  const [modalBrisanje, setModalBrisanje] = useState(false);
  // Dvostepena prijava (Korak 7): samo prikaz prekidača iz frejma, nije u funkciji - lokalni state,
  // ne čuva se ništa i ne poziva se nijedna akcija (ekran za unos koda nije nacrtan).
  const [dvostepena, setDvostepena] = useState(false);
  const [odjavljujeSe, setOdjavljujeSe] = useState<string | null>(null);
  const [, pokreni] = useTransition();
  const router = useRouter();

  function odjaviUredjaj(sessionId: string) {
    setOdjavljujeSe(sessionId);
    pokreni(async () => {
      await odjaviUredjajAction(sessionId);
      router.refresh();
    });
  }

  return (
    <div className={styles.sadrzaj}>
      <div>
        <div className={styles.red}>
          <div className={styles.redTekst}>
            <span style={{ fontSize: "1rem" }}>Lozinka</span>
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              {poslednjaPromenaLozinkeOpis}
            </span>
          </div>
          <Button type="button" varijanta="sekundarno" onClick={() => setModalLozinka(true)}>
            Promeni
          </Button>
        </div>
        <div className={styles.red}>
          <div className={styles.redTekst}>
            <span style={{ fontSize: "1rem" }}>Dvostepena prijava</span>
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              Kod iz aplikacije za overu pri prijavi
            </span>
          </div>
          <Toggle on={dvostepena} onChange={setDvostepena} label="Dvostepena prijava" />
        </div>
      </div>

      <span style={{ fontSize: "1rem", paddingTop: 4 }}>Prijavljeni uređaji</span>
      <div>
        {sesije.map((sesija) => (
          <div key={sesija.id} className={styles.red}>
            <div className={styles.redTekst}>
              <span style={{ fontSize: "1rem" }}>{prepoznajPregledacISistem(sesija.userAgent)}</span>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                {sesija.jeTrenutna ? "Ovaj uređaj, aktivan sada" : opisiKadaJeKorisceno(sesija.updatedAt)}
              </span>
            </div>
            {sesija.jeTrenutna ? (
              <span className={styles.trenutniZnak}>Trenutni</span>
            ) : (
              <button
                type="button"
                className={styles.odjaviLink}
                disabled={odjavljujeSe === sesija.id}
                onClick={() => odjaviUredjaj(sesija.id)}
              >
                {odjavljujeSe === sesija.id ? "Odjavljujem..." : "Odjavi"}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className={styles.opasnaZona}>
        <div className={styles.redTekst}>
          <span style={{ fontSize: "1rem", color: "var(--color-danger-zone-title)" }}>
            Brisanje naloga
          </span>
          <span style={{ fontSize: "1rem", lineHeight: 1.5, color: "var(--color-text-muted)" }}>
            Briše se sve: fakture, knjiga prihoda i dokumenta.
          </span>
        </div>
        <Button type="button" varijanta="sekundarno" onClick={() => setModalBrisanje(true)}>
          Izbriši nalog
        </Button>
      </div>

      {modalLozinka && <ChangePasswordModal onClose={() => setModalLozinka(false)} />}
      {modalBrisanje && <DeleteAccountModal onClose={() => setModalBrisanje(false)} />}
    </div>
  );
}
