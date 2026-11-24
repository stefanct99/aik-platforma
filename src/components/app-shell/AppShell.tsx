// Okvir aplikacije za sve ekrane prijavljenih korisnika sa završenim onboardingom (Korak 4, spec 5.2,
// 5.3). Desktop: levi meni (Sidebar) + gornja traka. Telefon: gornja traka + donja traka (BottomNav).
// Tema (Korak 4b): klasa "appShell" (src/styles/theme.css) nosi semantičke boje za obe teme; data-theme
// se postavlja na serveru iz sačuvanog podešavanja korisnika, da se izgled ne menja (treperi) pri učitavanju.

import type { ReactNode } from "react";
import type { Tema } from "@/lib/theme";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import styles from "./AppShell.module.css";

export function AppShell({
  ime,
  firma,
  tema,
  children,
}: {
  ime: string;
  firma: string;
  tema: Tema;
  children: ReactNode;
}) {
  const inicijal = (ime.trim().charAt(0) || "?").toUpperCase();

  return (
    <div className="appShell" data-theme={tema === "sistem" ? undefined : tema}>
      <Sidebar ime={ime} firma={firma} inicijal={inicijal} />
      <div className={styles.sadrzaj}>
        <TopBar inicijal={inicijal} />
        <main className={styles.glavni}>{children}</main>
      </div>
      <BottomNav ime={ime} firma={firma} inicijal={inicijal} />
    </div>
  );
}
