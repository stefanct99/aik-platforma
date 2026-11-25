"use client";

import { IkonaMesec, IkonaSunce } from "@/components/auth-shell/auth-icons";
import { useTemaPrekidac } from "./use-tema-prekidac";
import styles from "./TopBarTemaPrekidac.module.css";

export function TopBarTemaPrekidac() {
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
