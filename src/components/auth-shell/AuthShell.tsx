// Zajednički okvir za prijavu/registraciju/reset lozinke (Korak 5), tačno po
// referenca/prototip/js/auth.js (Wrap) i frejmovima PrijavaD8/Dk_PrijavaD8. Tema prati podešavanje
// uređaja (prefers-color-scheme), sa ručnom pilulom kao u prototipu/frejmu (videti tema-prijava.ts).

import type { ReactNode } from "react";
import { Wordmark } from "@/components/ui/Wordmark";
import { ThemeTogglePill } from "./ThemeTogglePill";
import { ID_AUTH_SHELL, SKRIPTA_BEZ_TREPERENJA } from "./tema-prijava";
import styles from "./AuthShell.module.css";

export function AuthShell({
  zaglavljeDesno,
  children,
}: {
  zaglavljeDesno?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div id={ID_AUTH_SHELL} className={`appShell ${styles.omot}`} suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: SKRIPTA_BEZ_TREPERENJA }} />
      <div className={styles.zaglavlje}>
        <Wordmark />
        {zaglavljeDesno && <span className={styles.zaglavljeDesnoDesktop}>{zaglavljeDesno}</span>}
      </div>
      <div className={styles.kartica}>{children}</div>
      {zaglavljeDesno && <div className={styles.zaglavljeDesnoMobilno}>{zaglavljeDesno}</div>}
      <div className={styles.podnozje}>
        <span>© 2026 tvoj AI knjigovođa</span>
        <a href="/uslovi">Uslovi</a>
        <a href="/privatnost">Privatnost</a>
        <a href="#">Pomoć</a>
      </div>
      <ThemeTogglePill />
    </div>
  );
}
