"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IkonaPlus, IkonaTacke, IkonaX } from "@/components/ui/icons";
import { OdjaviSeDugme } from "./OdjaviSeDugme";
import { STAVKE_MENIJA, STAVKE_VISE } from "./navigacija";
import styles from "./BottomNav.module.css";

export function BottomNav({ ime, firma, inicijal }: { ime: string; firma: string; inicijal: string }) {
  const putanja = usePathname();
  const [otvoreno, setOtvoreno] = useState(false);

  const pocetna = STAVKE_MENIJA[0];
  const fakture = STAVKE_MENIJA[1];
  // Spec 5.3: donja traka kaže kratko "Porez" (ne pun naziv "Porez i rokovi" kao u sidebar-u/naslovu).
  const porez = { ...STAVKE_MENIJA[4], naziv: "Porez" };

  const naVise = STAVKE_VISE.some((s) => putanja === s.href || putanja.startsWith(`${s.href}/`));

  function aktivno(href: string) {
    return putanja === href || putanja.startsWith(`${href}/`);
  }

  return (
    <>
      <nav className={styles.traka} aria-label="Glavni meni">
        <Link
          href={pocetna.href}
          className={`${styles.stavka} ${aktivno(pocetna.href) ? styles.stavkaAktivna : ""}`}
        >
          <pocetna.Ikona size={24} />
          {pocetna.naziv}
        </Link>
        <Link
          href={fakture.href}
          className={`${styles.stavka} ${aktivno(fakture.href) ? styles.stavkaAktivna : ""}`}
        >
          <fakture.Ikona size={24} />
          {fakture.naziv}
        </Link>
        <Link href="/fakture" className={styles.centralnoDugme}>
          <span className={styles.centralniKrug}>
            <IkonaPlus size={24} />
          </span>
          Faktura
        </Link>
        <Link
          href={porez.href}
          className={`${styles.stavka} ${aktivno(porez.href) ? styles.stavkaAktivna : ""}`}
        >
          <porez.Ikona size={24} />
          {porez.naziv}
        </Link>
        <button
          type="button"
          className={`${styles.stavka} ${naVise ? styles.stavkaAktivna : ""}`}
          onClick={() => setOtvoreno(true)}
          aria-haspopup="dialog"
          aria-expanded={otvoreno}
        >
          <IkonaTacke size={24} />
          Više
        </button>
      </nav>

      {otvoreno && (
        <div className={styles.list} role="dialog" aria-modal="true" aria-label="Više">
          <button
            type="button"
            className={styles.pozadina}
            aria-label="Zatvori"
            onClick={() => setOtvoreno(false)}
          />
          <div className={styles.sheet}>
            <div className={styles.sheetZaglavlje}>
              <span className={styles.sheetNaslov}>Više</span>
              <button
                type="button"
                className={styles.sheetZatvori}
                onClick={() => setOtvoreno(false)}
                aria-label="Zatvori"
              >
                <IkonaX size={18} />
              </button>
            </div>

            <div className={styles.profil}>
              <span className={styles.avatar}>{inicijal}</span>
              <div>
                <div>{ime}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>{firma}</div>
              </div>
            </div>

            <div className={styles.lista}>
              {STAVKE_VISE.map(({ href, naziv, Ikona }) => (
                <Link
                  key={href}
                  href={href}
                  className={styles.listaStavka}
                  onClick={() => setOtvoreno(false)}
                >
                  <Ikona size={20} />
                  {naziv}
                </Link>
              ))}
            </div>

            <OdjaviSeDugme className={styles.odjava} />
          </div>
        </div>
      )}
    </>
  );
}
