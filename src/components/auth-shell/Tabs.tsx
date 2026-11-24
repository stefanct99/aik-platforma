import Link from "next/link";
import styles from "./AuthBits.module.css";

export function Tabs({ aktivna }: { aktivna: "prijava" | "registracija" }) {
  return (
    <div className={styles.tabs}>
      <Link href="/prijava" className={aktivna === "prijava" ? styles.aktivan : ""}>
        Prijava
      </Link>
      <Link href="/registracija" className={aktivna === "registracija" ? styles.aktivan : ""}>
        Registracija
      </Link>
    </div>
  );
}
