import styles from "./PageHeader.module.css";

export function PageHeader({ naslov, opis }: { naslov: string; opis?: string }) {
  return (
    <div className={styles.zaglavlje}>
      <h1 className={styles.naslov}>{naslov}</h1>
      {opis && <p className={styles.opis}>{opis}</p>}
    </div>
  );
}
