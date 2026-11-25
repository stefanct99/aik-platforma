"use client";

import { IkonaMesec, IkonaSunce } from "@/components/auth-shell/auth-icons";
import { useTemaPrekidac } from "./use-tema-prekidac";
import styles from "@/components/auth-shell/ThemeTogglePill.module.css";

// Plutajuća pilula (fiksno dole desno), za SVAKI ceo ekran koji nema gornju traku aplikacije (TopBar) sa
// svojim ugrađenim prekidačem - pre-login ekrani (auth-shell), onboarding, i Nova faktura/Izmena (Korak
// 8b, frejm Fak3/Fak11/Fak12 "position:absolute;bottom:24px;right:24px", potvrđeno i na telefonu).
// Deli isto stanje (useTemaPrekidac/TemaContext) kao TopBar i Podešavanja, bez duple logike.
export function FixedThemeTogglePill() {
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
