"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IkonaPlus } from "@/components/ui/icons";
import type { BankAccount } from "../../../../../generated/prisma/client";
import { AccountCard } from "./AccountCard";
import { AccountPanel } from "./AccountPanel";
import styles from "./RacuniTab.module.css";

export function RacuniTab({ racuni }: { racuni: BankAccount[] }) {
  const [dodajOtvoreno, setDodajOtvoreno] = useState(false);
  const router = useRouter();

  function osveziPoSnimanju() {
    router.refresh();
  }

  return (
    <div className={styles.forma}>
      {racuni.length === 0 ? (
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>Još nema dodatih računa.</p>
      ) : (
        <div className={styles.lista}>
          {racuni.map((racun) => (
            <AccountCard key={racun.id} racun={racun} onChanged={osveziPoSnimanju} />
          ))}
        </div>
      )}

      <div className={styles.akcijeDno}>
        <Button varijanta="primarno" onClick={() => setDodajOtvoreno(true)}>
          <IkonaPlus size={18} /> Dodaj račun
        </Button>
      </div>

      {dodajOtvoreno && (
        <AccountPanel
          onClose={() => setDodajOtvoreno(false)}
          onSaved={() => {
            setDodajOtvoreno(false);
            osveziPoSnimanju();
          }}
        />
      )}
    </div>
  );
}
