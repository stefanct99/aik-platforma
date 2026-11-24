// Značka statusa fakture (Korak 8a, frejm Fak1/Dk_Fak1): boje su PREUZETE iz postojećih tokena teme
// (potvrđeno piksel-tačno protiv frejma u obe teme, bez novih tokena):
// nacrt -> --color-bg/--color-nav-text, poslata -> --color-badge-warning-*,
// placena -> --color-icon-chip-*, stornirana -> --color-bg/--color-text-muted,
// kasni -> --color-alert-danger-* (svetla tema je 1 heks cifru druga boja od frejma - zanemarljivo,
// navedeno u izveštaju).
import type { EfektivniStatus } from "@/lib/invoice-status";
import styles from "./StatusZnacka.module.css";

export function StatusZnacka({ status, tekst }: { status: EfektivniStatus; tekst: string }) {
  return <span className={`${styles.znacka} ${styles[status]}`}>{tekst}</span>;
}
