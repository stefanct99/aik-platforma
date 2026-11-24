// Centriran dijalog (dizajn sistem, Korak 7): tačno po frejmovima Pd8 (Promeni lozinku) i Pd9 (Izbriši
// nalog) - 440px, zaobljenje 16px, senka --shadow-overlay. Telefon: PhPd8/PhPd9 - isti raspored, samo
// širi (spec 5.3: "Dijalozi potvrde ostaju centrirani").

"use client";

import type { ReactNode } from "react";
import styles from "./Modal.module.css";

export function Modal({
  naslov,
  children,
  onClose,
}: {
  naslov: string;
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className={styles.senka} onMouseDown={onClose}>
      <div className={styles.kartica} onMouseDown={(dogadjaj) => dogadjaj.stopPropagation()}>
        <span className={styles.naslov}>{naslov}</span>
        {children}
      </div>
    </div>
  );
}
