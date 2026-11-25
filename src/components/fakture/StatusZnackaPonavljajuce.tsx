// Značka statusa ponavljajuće fakture (Korak 8c, frejm Fak13): boje PREUZETE iz postojećih tokena teme,
// potvrđene piksel-tačno protiv frejma (Aktivna #EEF8D2/#2F5D12 = isti tokeni kao StatusZnacka "placena";
// Pauzirana #F4F2F0/#4A524C = isti tokeni kao "nacrt"/"stornirana") - bez novih tokena, isti princip kao
// StatusZnacka.tsx.
import styles from "./StatusZnackaPonavljajuce.module.css";

export function StatusZnackaPonavljajuce({ status }: { status: "aktivna" | "pauzirana" }) {
  return <span className={`${styles.znacka} ${styles[status]}`}>{status === "aktivna" ? "Aktivna" : "Pauzirana"}</span>;
}
