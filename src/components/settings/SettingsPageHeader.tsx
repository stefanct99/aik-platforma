import styles from "./SettingsPageHeader.module.css";

export function SettingsPageHeader({ naslov, opis }: { naslov: string; opis: string }) {
  return (
    <div className={styles.zaglavlje}>
      <h2 className={styles.naslov}>{naslov}</h2>
      <p className={styles.opis}>{opis}</p>
    </div>
  );
}
