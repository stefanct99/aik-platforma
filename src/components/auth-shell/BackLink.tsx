import Link from "next/link";
import type { ReactNode } from "react";
import { IkonaStrelicaLevo } from "./auth-icons";
import styles from "./AuthBits.module.css";

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={styles.nazadLink}>
      <IkonaStrelicaLevo size={16} />
      {children}
    </Link>
  );
}
