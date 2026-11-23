// Okvir aplikacije za sve ekrane prijavljenih korisnika sa završenim onboardingom (Korak 4, spec 5.2,
// 5.3). Desktop: levi meni (Sidebar) + gornja traka. Telefon: gornja traka + donja traka (BottomNav).

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import styles from "./AppShell.module.css";

export function AppShell({
  ime,
  firma,
  children,
}: {
  ime: string;
  firma: string;
  children: ReactNode;
}) {
  const inicijal = (ime.trim().charAt(0) || "?").toUpperCase();

  return (
    <div>
      <Sidebar ime={ime} firma={firma} inicijal={inicijal} />
      <div className={styles.sadrzaj}>
        <TopBar inicijal={inicijal} />
        <main className={styles.glavni}>{children}</main>
      </div>
      <BottomNav ime={ime} firma={firma} inicijal={inicijal} />
    </div>
  );
}
