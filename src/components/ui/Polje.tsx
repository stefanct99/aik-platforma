// Polje za unos (dizajn sistem, Korak 4): labela iznad, pomoćni tekst ili greška ispod. Visina 48px.
// Videti dizajn-sistem/components/Input.

import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Polje.module.css";

type PoljeProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  desno?: ReactNode;
};

export function Polje({ label, hint, error, desno, id, className, ...inputProps }: PoljeProps) {
  const poljeId = id ?? inputProps.name;
  return (
    <div className={[styles.polje, error ? styles.greska : "", className].filter(Boolean).join(" ")}>
      <label htmlFor={poljeId}>{label}</label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input id={poljeId} className={styles.unos} style={{ width: "100%" }} {...inputProps} />
        {desno && (
          <span style={{ position: "absolute", right: 14, display: "flex", pointerEvents: "none" }}>
            {desno}
          </span>
        )}
      </div>
      {error ? (
        <span className={styles.pomocniTekst}>{error}</span>
      ) : hint ? (
        <span className={styles.pomocniTekst}>{hint}</span>
      ) : null}
    </div>
  );
}
