"use client";

import { IkonaMesec, IkonaSunce } from "@/components/auth-shell/auth-icons";
import { useTemaPrekidac } from "@/components/app-shell/use-tema-prekidac";
import styles from "@/components/auth-shell/ThemeTogglePill.module.css";

// Za razliku od pre-login ThemeTogglePill (Korak 5, localStorage), ovde korisnik VEĆ ima sesiju, pa
// klik odmah i trajno čuva temu preko iste akcije kao Podešavanja > Jezik i izgled (useTemaPrekidac,
// deljeno i sa gornjom trakom aplikacije - Korak 8a) - nema potrebe za localStorage ni blokirajućom
// skriptom, tema je već tačna iz SSR-a (videti OnboardingShell, koji postavlja TemaProvider).
export function OnboardingThemeTogglePill() {
  const { efektivnoTamno, izaberi } = useTemaPrekidac();

  return (
    <div className={styles.pilula} title="Izgled: svetli / tamni">
      <button
        type="button"
        className={`${styles.dugme} ${!efektivnoTamno ? styles.aktivno : ""}`}
        onClick={() => izaberi("svetli")}
        aria-label="Svetli izgled"
      >
        <IkonaSunce size={16} />
      </button>
      <button
        type="button"
        className={`${styles.dugme} ${efektivnoTamno ? styles.aktivno : ""}`}
        onClick={() => izaberi("tamni")}
        aria-label="Tamni izgled"
      >
        <IkonaMesec size={16} />
      </button>
    </div>
  );
}
