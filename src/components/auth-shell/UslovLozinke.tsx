import { IkonaKvacica } from "./auth-icons";
import styles from "./AuthBits.module.css";

export function UslovLozinke({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={styles.uslovRed}>
      <span className={`${styles.uslovIkonica} ${ok ? styles.uslovIkonicaOk : ""}`}>
        {ok && <IkonaKvacica size={12} />}
      </span>
      <span className={ok ? styles.uslovTekstOk : styles.uslovTekst}>{label}</span>
    </span>
  );
}
