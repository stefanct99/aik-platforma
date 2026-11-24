"use client";

import { useState, useTransition } from "react";
import { Toggle } from "@/components/ui/Toggle";
import { VRSTE_OBAVESTENJA, type Kanal, type VrstaObavestenja } from "@/lib/notification-settings-types";
import { promeniObavestenjeAction } from "./actions";
import styles from "./ObavestenjaTab.module.css";

type Vrednosti = Record<VrstaObavestenja, { mail: boolean; push: boolean }>;

export function ObavestenjaTab({ pocetneVrednosti }: { pocetneVrednosti: Vrednosti }) {
  const [vrednosti, setVrednosti] = useState(pocetneVrednosti);
  const [, pokreni] = useTransition();

  function promeni(kljuc: VrstaObavestenja, kanal: Kanal, vrednost: boolean) {
    setVrednosti((prethodno) => ({
      ...prethodno,
      [kljuc]: { ...prethodno[kljuc], [kanal]: vrednost },
    }));
    pokreni(async () => {
      await promeniObavestenjeAction(kljuc, kanal, vrednost);
    });
  }

  return (
    <div className={styles.tabela}>
      <div className={`${styles.red} ${styles.zaglavlje}`}>
        <span style={{ flex: 1 }}>Obaveštenje</span>
        <span className={styles.kolona}>Mejl</span>
        <span className={styles.kolona}>Push</span>
      </div>
      {VRSTE_OBAVESTENJA.map(({ kljuc, naziv, opis }) => (
        <div key={kljuc} className={styles.red}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: "1rem" }}>{naziv}</span>
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>{opis}</span>
          </div>
          <span className={styles.kolona}>
            <span className={styles.kanalNaziv}>Mejl</span>
            <Toggle
              on={vrednosti[kljuc].mail}
              onChange={(vrednost) => promeni(kljuc, "mail", vrednost)}
              label={`${naziv} - mejl`}
            />
          </span>
          <span className={styles.kolona}>
            <span className={styles.kanalNaziv}>Push</span>
            <Toggle
              on={vrednosti[kljuc].push}
              onChange={(vrednost) => promeni(kljuc, "push", vrednost)}
              label={`${naziv} - push`}
            />
          </span>
        </div>
      ))}
    </div>
  );
}
