"use client";

import { useState } from "react";
import type { Tema } from "@/lib/theme";
import { IkonaKopiraj, IkonaKvacica, IkonaUcitavanje } from "@/components/auth-shell/auth-icons";
import { continueFromStep3Action, goBackAction } from "./actions";
import { OnboardingShell } from "./OnboardingShell";
import { NavRow } from "./NavRow";
import styles from "./OnboardingBits.module.css";

const KORACI = [
  "Otvori mejl na koji ti stižu obaveštenja banke.",
  "Podesi da se mejlovi banke prosleđuju na adresu iznad.",
  "Čim stigne prvi mejl, javićemo ti ovde.",
];

export function Step3Mail({ adresa, tema }: { adresa: string; tema: Tema }) {
  const [kopirano, setKopirano] = useState(false);

  function kopirajAdresu() {
    navigator.clipboard
      .writeText(adresa)
      .then(() => {
        setKopirano(true);
        setTimeout(() => setKopirano(false), 1800);
      })
      .catch(() => {});
  }

  return (
    <OnboardingShell
      korak={3}
      naslov="Poveži mejlove banke"
      podnaslov="Banka ti šalje obaveštenje o svakoj uplati. Mi ga pročitamo i sami uparimo uplatu sa fakturom. Ne tražimo lozinku za e-banking."
      tema={tema}
    >
      <div className={styles.forma}>
        <div className={styles.adresaOmot}>
          <span className={styles.adresaLabela}>Tvoja adresa za prijem</span>
          <div className={styles.adresaRed}>
            <span className={styles.adresaTekst}>{adresa}</span>
            <button
              type="button"
              className={`${styles.kopirajDugme} ${kopirano ? styles.kopirano : ""}`}
              onClick={kopirajAdresu}
            >
              {kopirano ? <IkonaKvacica size={14} /> : <IkonaKopiraj size={16} />}
              {kopirano ? "Kopirano" : "Kopiraj"}
            </button>
          </div>
        </div>
        <div className={styles.koraci}>
          {KORACI.map((tekst, i) => (
            <div key={tekst} className={styles.korakRed}>
              <span className={styles.korakBroj}>{i + 1}</span>
              <span className={styles.korakTekst}>{tekst}</span>
            </div>
          ))}
        </div>
        <div className={styles.status}>
          <IkonaUcitavanje size={20} className={styles.spiner} />
          <span className={styles.statusTekst}>Čekamo prvi mejl</span>
        </div>
        <form action={continueFromStep3Action}>
          <NavRow onBack={() => void goBackAction(3)} nextLabel="Nastavi" />
        </form>
        <div className={styles.preskociOmot}>
          <a
            href="/onboarding"
            className={styles.preskociLink}
            onClick={(dogadjaj) => {
              dogadjaj.preventDefault();
              void continueFromStep3Action();
            }}
          >
            Podesiću ovo kasnije
          </a>
        </div>
      </div>
    </OnboardingShell>
  );
}
