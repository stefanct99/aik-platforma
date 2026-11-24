import type { ComponentType } from "react";
import styles from "./AuthBits.module.css";

export function StatusIconCircle({
  Ikona,
  bg,
  fg,
}: {
  Ikona: ComponentType<{ size?: number }>;
  bg: string;
  fg: string;
}) {
  return (
    <span className={styles.ikonaKrug} style={{ background: bg, color: fg }}>
      <Ikona size={26} />
    </span>
  );
}
