"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/ui/Wordmark";
import { OdjaviSeDugme } from "./OdjaviSeDugme";
import { STAVKE_MENIJA } from "./navigacija";
import styles from "./Sidebar.module.css";

// "Nova faktura" NIJE u levom meniju (Korak 4b): frejmovi Poc1/Dk_Poc1 je pokazuju u gornjoj traci
// (TopBar), ne u sidebar-u, pa je tako i ovde iako je Korak 4 pogrešno pretpostavio suprotno.
export function Sidebar({ ime, firma, inicijal }: { ime: string; firma: string; inicijal: string }) {
  const putanja = usePathname();

  return (
    <nav className={styles.sidebar} aria-label="Glavni meni">
      <Link href="/pocetna">
        <Wordmark />
      </Link>

      <ul className={styles.lista} style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {STAVKE_MENIJA.map(({ href, naziv, Ikona }) => {
          const aktivno = putanja === href || putanja.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`${styles.stavka} ${aktivno ? styles.stavkaAktivna : ""}`}
              >
                <Ikona size={20} />
                {naziv}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className={styles.donjiDeo}>
        <div className={styles.korisnik}>
          <span className={styles.avatar}>{inicijal}</span>
          <div className={styles.korisnikTekst}>
            <span className={styles.korisnikIme}>{ime}</span>
            <span className={styles.korisnikFirma}>{firma}</span>
          </div>
        </div>
        <OdjaviSeDugme className={styles.odjava} />
      </div>
    </nav>
  );
}
