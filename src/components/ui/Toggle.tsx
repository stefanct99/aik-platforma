// Prekidač (dizajn sistem, Korak 7): tačno po frejmovima Pd4/Pd5/Pd6 (40x24px, uključen #0F2A22 /
// isključen #D9D6D0 u svetloj, obrnuto po temi preko postojećih --btn-primary-bg/--color-border tokena).

"use client";

import styles from "./Toggle.module.css";

export function Toggle({
  on,
  onChange,
  disabled,
  label,
}: {
  on: boolean;
  onChange: (vrednost: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      className={`${styles.prekidac} ${on ? styles.ukljucen : ""}`}
      onClick={() => onChange(!on)}
    >
      <span className={styles.klizac} />
    </button>
  );
}
