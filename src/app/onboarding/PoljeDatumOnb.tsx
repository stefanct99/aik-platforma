// Datum otvaranja (onboarding Korak 1), tačno po frejmovima (OnbO1 i dr.): običan tekstualni unos u
// formatu dd.mm.gggg., ne <input type="date"> (koji frejm nema, i čiji izgled/natpis pregledač sam
// bira po jeziku, ne po frejmu). Dozvoljava samo cifre i tačke; stvarna provera datuma (31.02. se
// odbija) je u src/lib/datum.ts (parseDatumSrpski), poziva se u actions.ts pri čuvanju.

import { useState, type ChangeEvent } from "react";
import { IkonaKalendar, IkonaUpozorenjeKrug } from "@/components/auth-shell/auth-icons";
import styles from "@/components/auth-shell/PoljeAuth.module.css";
import bitsStyles from "./OnboardingBits.module.css";

export function PoljeDatumOnb({
  name,
  defaultValue,
  error,
  disabled,
}: {
  name: string;
  defaultValue: string;
  error?: string;
  disabled?: boolean;
}) {
  const [vrednost, setVrednost] = useState(defaultValue);

  function onChange(dogadjaj: ChangeEvent<HTMLInputElement>) {
    setVrednost(dogadjaj.target.value.replace(/[^0-9.]/g, ""));
  }

  return (
    <div className={styles.polje}>
      <label htmlFor={name}>Datum otvaranja</label>
      <span className={styles.unosOmot}>
        <input
          id={name}
          name={name}
          type="text"
          inputMode="numeric"
          placeholder="dd.mm.gggg."
          value={vrednost}
          onChange={onChange}
          disabled={disabled}
          className={[styles.unos, error ? styles.greska : ""].filter(Boolean).join(" ")}
          style={{ paddingRight: 48 }}
        />
        <span className={bitsStyles.ikonicaDesno}>
          <IkonaKalendar size={20} />
        </span>
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
