// Kartica (dizajn sistem, Korak 4): radius-lg, padding 24px na desktopu i 16px na mobilnom.

import type { HTMLAttributes } from "react";
import styles from "./Card.module.css";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={[styles.kartica, className].filter(Boolean).join(" ")} {...props} />;
}
