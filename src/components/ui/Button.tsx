// Dugme (dizajn sistem, Korak 4): primarno, akcent, sekundarno, tiho, opasno. Visina najmanje 44px.
// Videti referenca/korak4/KORAK4_PAKET/dizajn-sistem/components/Button/README.md.

import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Varijanta = "primarno" | "akcent" | "sekundarno" | "tiho" | "opasno";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  varijanta?: Varijanta;
  puniRed?: boolean;
};

export function Button({
  varijanta = "primarno",
  puniRed = false,
  className,
  ...props
}: ButtonProps) {
  const klase = [styles.dugme, styles[varijanta], puniRed ? styles.puniRed : "", className]
    .filter(Boolean)
    .join(" ");
  return <button className={klase} {...props} />;
}
