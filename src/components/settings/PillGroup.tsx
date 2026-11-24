// Grupa pilula (frejm Pd7/Dk_Pd7, "Jezik i izgled"). Koristi se i za funkcionalan izbor (Izgled) i za
// onemogućene redove (Jezik, Format datuma), koji samo pokazuju frejm bez prave funkcije.

import styles from "./PillGroup.module.css";

export function PillGroup<T extends string>({
  options,
  value,
  onChange,
  disabled,
  name,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange?: (vrednost: T) => void;
  disabled?: boolean;
  name?: string;
}) {
  return (
    <div className={styles.grupa} role={onChange ? "radiogroup" : undefined} aria-label={name}>
      {options.map((opcija) => {
        const aktivna = opcija.value === value;
        return (
          <button
            key={opcija.value}
            type="button"
            role={onChange ? "radio" : undefined}
            aria-checked={onChange ? aktivna : undefined}
            disabled={disabled}
            className={`${styles.pilula} ${aktivna ? styles.pilulaAktivna : ""}`}
            onClick={() => onChange?.(opcija.value)}
          >
            {opcija.label}
          </button>
        );
      })}
    </div>
  );
}
