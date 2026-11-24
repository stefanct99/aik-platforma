// Zaglavlje Fakture (Korak 8a, frejm Fak1/Fak6/Fak13): naslov i opis su ISTI na sva tri podtaba, dugme
// u istom redu se menja po tabu (Fakture: nema - globalno dugme u gornjoj traci već postoji; Klijenti:
// "Novi klijent", frejm Fak6; Ponavljajuće: nema, podtab je samo poruka u ovom koraku).
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./FaktureHeader.module.css";

const TABOVI = [
  { slug: "", naziv: "Fakture", kljuc: "fakture" as const },
  { slug: "/klijenti", naziv: "Klijenti", kljuc: "klijenti" as const },
  { slug: "/ponavljajuce", naziv: "Ponavljajuće", kljuc: "ponavljajuce" as const },
];

export function FaktureHeader({
  dugme,
  brojevi,
}: {
  dugme?: ReactNode;
  brojevi: { fakture: number; klijenti: number; ponavljajuce: number };
}) {
  const pathname = usePathname();

  return (
    <div>
      <div className={styles.red}>
        <div className={styles.tekst}>
          <h1 className={styles.naslov}>Fakture</h1>
          <p className={styles.opis}>Sve tvoje fakture na jednom mestu, u svim valutama.</p>
        </div>
        {dugme}
      </div>
      <nav className={styles.tabovi}>
        {TABOVI.map((tab) => {
          const href = `/fakture${tab.slug}`;
          const aktivan = pathname === href;
          return (
            <Link key={tab.kljuc} href={href} className={`${styles.tab} ${aktivan ? styles.tabAktivan : ""}`}>
              {tab.naziv}
              <span className={styles.broj}>{brojevi[tab.kljuc]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
