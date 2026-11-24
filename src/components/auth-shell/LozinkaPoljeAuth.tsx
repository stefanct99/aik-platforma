// Polje za lozinku sa prikaži/sakrij (Korak 5, spec 7.1), tačno po
// referenca/prototip/js/ui.js (PasswordInput).

"use client";

import { useState, type InputHTMLAttributes } from "react";
import { IkonaOko, IkonaOkoPreko, IkonaUpozorenje } from "./auth-icons";
import styles from "./PoljeAuth.module.css";

type LozinkaPoljeProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function LozinkaPoljeAuth({
  label,
  hint,
  error,
  id,
  className,
  ...inputProps
}: LozinkaPoljeProps) {
  const [prikazano, setPrikazano] = useState(false);
  const poljeId = id ?? inputProps.name;

  return (
    <div className={styles.polje}>
      <label htmlFor={poljeId}>{label}</label>
      <span className={styles.unosOmot}>
        <input
          id={poljeId}
          type={prikazano ? "text" : "password"}
          className={[styles.unos, styles.unosLozinka, error ? styles.greska : "", className]
            .filter(Boolean)
            .join(" ")}
          {...inputProps}
        />
        <button
          type="button"
          className={styles.dugmeOko}
          onClick={() => setPrikazano((v) => !v)}
          aria-label={prikazano ? "Sakrij lozinku" : "Prikaži lozinku"}
        >
          {prikazano ? <IkonaOkoPreko size={18} /> : <IkonaOko size={18} />}
        </button>
      </span>
      {error ? (
        <div className={styles.greskaPoruka}>
          <IkonaUpozorenje size={18} />
          <span>{error}</span>
        </div>
      ) : hint ? (
        <span className={styles.pomocniTekst}>{hint}</span>
      ) : null}
    </div>
  );
}
