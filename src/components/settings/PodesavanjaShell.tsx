"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { IkonaStrelicaDesno } from "@/components/ui/icons";
import { SettingsNav } from "./SettingsNav";
import styles from "./PodesavanjaShell.module.css";

export function PodesavanjaShell({
  naziv,
  pausalacOd,
  children,
}: {
  naziv: string;
  pausalacOd: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const naPregledu = pathname === "/podesavanja";

  return (
    <div>
      <div className={styles.desktopZaglavlje}>
        <PageHeader naslov="Podešavanja" opis={`${naziv}, paušalac od ${pausalacOd}`} />
      </div>

      <div className={styles.raspored} style={{ marginTop: "var(--space-5)" }}>
        <SettingsNav />
        <div className={naPregledu ? styles.sadrzaj : styles.sadrzajKartica}>
          {!naPregledu && (
            <Link href="/podesavanja" className={styles.mobilnaCrumb}>
              <span className={styles.strelicaNazad}>
                <IkonaStrelicaDesno size={16} />
              </span>
              Podešavanja
            </Link>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
