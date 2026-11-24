// Polje za unos na stranicama prijave (Korak 5), tačno po referenca/prototip/js/ui.js (Field, Input).

import type { InputHTMLAttributes } from "react";
import { IkonaUpozorenje } from "./auth-icons";
import styles from "./PoljeAuth.module.css";

type PoljeAuthProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function PoljeAuth({ label, hint, error, id, className, ...inputProps }: PoljeAuthProps) {
  const poljeId = id ?? inputProps.name;
  return (
    <div className={styles.polje}>
      <label htmlFor={poljeId}>{label}</label>
      <span className={styles.unosOmot}>
        <input
          id={poljeId}
          className={[styles.unos, error ? styles.greska : "", className].filter(Boolean).join(" ")}
          {...inputProps}
        />
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
