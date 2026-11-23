"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PODESAVANJA_STAVKE } from "./podesavanjaStavke";
import styles from "./SettingsNav.module.css";

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Podešavanja">
      {PODESAVANJA_STAVKE.map(({ slug, naziv, Ikona }) => {
        const href = `/podesavanja/${slug}`;
        const aktivno = pathname === href;
        return (
          <Link
            key={slug}
            href={href}
            className={`${styles.stavka} ${aktivno ? styles.stavkaAktivna : ""}`}
          >
            <Ikona size={18} />
            {naziv}
          </Link>
        );
      })}
    </nav>
  );
}
