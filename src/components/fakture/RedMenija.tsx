// Padajući meni reda (⋯, Korak 8a, frejm Fak1/Fak16): otvoren izgled potvrđen piksel-tačno iz Fak16 -
// obične tekstualne stavke bez ikonica (frejm ih nema), opasna stavka je obojena.
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IkonaTacke } from "@/components/ui/icons";
import styles from "./RedMenija.module.css";

export type StavkaMenija = {
  kljuc: string;
  tekst: string;
  opasno?: boolean;
  onClick?: () => void;
  href?: string;
};

export function RedMenija({ stavke }: { stavke: StavkaMenija[] }) {
  const [otvoreno, setOtvoreno] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!otvoreno) return;
    function naKlikVan(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOtvoreno(false);
    }
    document.addEventListener("mousedown", naKlikVan);
    return () => document.removeEventListener("mousedown", naKlikVan);
  }, [otvoreno]);

  return (
    <span className={styles.omot} ref={ref}>
      <button
        type="button"
        className={styles.dugme}
        onClick={(e) => {
          e.stopPropagation();
          setOtvoreno((v) => !v);
        }}
        aria-label="Više opcija"
      >
        <IkonaTacke size={20} />
      </button>
      {otvoreno && (
        <div className={styles.padajuci} onClick={(e) => e.stopPropagation()}>
          {stavke.map((st): ReactNode =>
            st.href ? (
              <a key={st.kljuc} href={st.href} className={`${styles.stavka} ${st.opasno ? styles.opasno : ""}`}>
                {st.tekst}
              </a>
            ) : (
              <button
                key={st.kljuc}
                type="button"
                className={`${styles.stavka} ${st.opasno ? styles.opasno : ""}`}
                onClick={() => {
                  setOtvoreno(false);
                  st.onClick?.();
                }}
              >
                {st.tekst}
              </button>
            ),
          )}
        </div>
      )}
    </span>
  );
}
