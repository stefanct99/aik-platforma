"use client";

import { useState, useTransition } from "react";
import { posaljiPotvrduPonovoAction } from "./actions";
import styles from "@/components/auth-shell/AuthBits.module.css";

export function PosaljiPonovoDugme({ email }: { email: string }) {
  const [poslato, setPoslato] = useState(false);
  const [uToku, pokreni] = useTransition();

  return (
    <button
      type="button"
      disabled={uToku || poslato}
      onClick={() => pokreni(async () => {
        await posaljiPotvrduPonovoAction(email);
        setPoslato(true);
      })}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        font: "inherit",
        color: "var(--color-text)",
        textDecoration: "underline",
        cursor: uToku || poslato ? "default" : "pointer",
      }}
      className={styles.sitanTekst}
    >
      {poslato ? "poslato ponovo" : "pošalji ponovo"}
    </button>
  );
}
