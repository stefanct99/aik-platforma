// Zajednički okvir za sva 4 koraka onboardinga (Korak 6), tačno po referenca/prototip/js/onboarding.js
// (Shell) i frejmovima OnbO*/TelOnbO*. Za razliku od AuthShell-a (Korak 5, stranice bez sesije), ovde
// korisnik VEĆ ima sesiju, pa se tema čita direktno iz nje na serveru - nema treperenja, nije potrebna
// blokirajuća skripta ni localStorage.

import type { ReactNode } from "react";
import { Wordmark } from "@/components/ui/Wordmark";
import type { Tema } from "@/lib/theme";
import { TemaProvider } from "@/components/app-shell/TemaContext";
import { FixedThemeTogglePill } from "@/components/app-shell/FixedThemeTogglePill";
import styles from "./OnboardingShell.module.css";

export function OnboardingShell({
  korak,
  naslov,
  podnaslov,
  tema,
  children,
}: {
  korak: 1 | 2 | 3 | 4;
  naslov: string;
  podnaslov: string;
  tema: Tema;
  children: ReactNode;
}) {
  return (
    <div className={`appShell ${styles.omot}`} data-theme={tema === "sistem" ? undefined : tema}>
      <TemaProvider initialTema={tema}>
        <div className={styles.zaglavlje}>
          <Wordmark />
          <span className={styles.zaglavljeDesno}>
            <a href="/pomoc">Pomoć</a>
          </span>
        </div>
        <div className={styles.kartica}>
          <div className={styles.progresOmot}>
            <span className={styles.progresKorak}>Korak {korak} od 4</span>
            <div className={styles.progresTraka}>
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={n <= korak ? styles.gotovo : ""} />
              ))}
            </div>
          </div>
          <div className={styles.naslovOmot}>
            <h1 className={styles.naslov}>{naslov}</h1>
            <p className={styles.podnaslov}>{podnaslov}</p>
          </div>
          {children}
        </div>
        <div className={styles.podnozje}>
          <span>© 2026 tvoj AI knjigovođa</span>
          <a href="/uslovi">Uslovi</a>
          <a href="/privatnost">Privatnost</a>
          <a href="/pomoc">Pomoć</a>
        </div>
        <FixedThemeTogglePill />
      </TemaProvider>
    </div>
  );
}
