"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { IkonaPlus } from "@/components/ui/icons";
import { OdjaviSeDugme } from "./OdjaviSeDugme";
import { STAVKE_MENIJA } from "./navigacija";
import styles from "./Sidebar.module.css";

export function Sidebar({ ime, firma, inicijal }: { ime: string; firma: string; inicijal: string }) {
  const putanja = usePathname();

  return (
    <nav className={styles.sidebar} aria-label="Glavni meni">
      <Link href="/pocetna">
        <Wordmark />
      </Link>

      <Button varijanta="akcent" puniRed>
        <IkonaPlus size={18} /> Nova faktura
      </Button>

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
