// Polje za unos u onboardingu (Korak 6). Deli CSS sa PoljeAuth (Korak 5, isti izgled polja/okvira), ali
// koristi IkonaUpozorenjeKrug umesto IkonaUpozorenje - frejmovi Koraka 6 (OnbO2 i dr.) za grešku polja
// koriste krug sa uzvičnikom, ne trougao kao frejmovi Koraka 5 (videti auth-icons.tsx).

import type { InputHTMLAttributes } from "react";
import { IkonaUpozorenjeKrug } from "@/components/auth-shell/auth-icons";
import styles from "@/components/auth-shell/PoljeAuth.module.css";

type PoljeOnbProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function PoljeOnb({ label, error, id, className, ...inputProps }: PoljeOnbProps) {
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
      {error && (
        <div className={styles.greskaPoruka}>
          <IkonaUpozorenjeKrug size={18} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
