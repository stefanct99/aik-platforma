// Značka (dizajn sistem, Korak 4). Videti dizajn-sistem/components/StatusBadge.

import type { HTMLAttributes } from "react";
import styles from "./Badge.module.css";

type Varijanta = "neutralno" | "upozorenje" | "info" | "uspeh" | "greska";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { varijanta?: Varijanta };

export function Badge({ varijanta = "neutralno", className, ...props }: BadgeProps) {
  const klase = [styles.znacka, styles[varijanta], className].filter(Boolean).join(" ");
  return <span className={klase} {...props} />;
}
