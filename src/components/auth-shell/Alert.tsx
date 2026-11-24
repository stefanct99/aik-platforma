import type { ReactNode } from "react";
import { IkonaUpozorenje } from "./auth-icons";
import styles from "./AuthBits.module.css";

export function Alert({ children }: { children: ReactNode }) {
  return (
    <div className={styles.alert} role="alert">
      <IkonaUpozorenje size={20} />
      <span>{children}</span>
    </div>
  );
}
