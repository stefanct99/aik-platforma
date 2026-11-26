// Bočni panel sa desne strane (dizajn sistem, Korak 7): tačno po frejmu Pd10 (Dodaj račun) - 560px,
// zaglavlje sa naslovom i X, telo koje se skroluje, podnožje sa dugmadima. Na telefonu postaje "bottom
// sheet" (spec 5.3), videti SidePanel.module.css.

"use client";

import type { ReactNode } from "react";
import { IkonaX } from "@/components/ui/icons";
import styles from "./SidePanel.module.css";

export function SidePanel({
  naslov,
  onClose,
  footer,
  children,
  mobilnoDugmeZatvoriTekst,
}: {
  naslov: string;
  onClose: () => void;
  footer: ReactNode;
  children: ReactNode;
  // Korak 8 ispravka: frejmovi Fakture (PhFak7/PhFak14/PhFak28) na telefonu imaju pilulu "X + Zatvori"
  // umesto gole X ikonice - Pd10 (Dodaj račun, Korak 4/7) je nema, zato je ovo opciono i podrazumevano
  // isključeno (ne diramo postojeći Podešavanja panel). Desktop je nepromenjen u oba slučaja.
  mobilnoDugmeZatvoriTekst?: boolean;
}) {
  return (
    <div className={styles.senka} onMouseDown={onClose}>
      <div className={styles.panel} onMouseDown={(dogadjaj) => dogadjaj.stopPropagation()}>
        <div className={styles.zaglavlje}>
          <span className={styles.naslov}>{naslov}</span>
          <button
            type="button"
            className={`${styles.zatvoriDugme} ${mobilnoDugmeZatvoriTekst ? styles.zatvoriDugmeTekst : ""}`}
            onClick={onClose}
            aria-label="Zatvori"
          >
            <IkonaX size={20} />
            {mobilnoDugmeZatvoriTekst && <span className={styles.zatvoriTekst}>Zatvori</span>}
          </button>
        </div>
        <div className={styles.telo}>{children}</div>
        <div className={styles.podnozje}>{footer}</div>
      </div>
    </div>
  );
}
