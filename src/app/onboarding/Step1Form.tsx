"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { IkonaUcitavanje } from "@/components/auth-shell/auth-icons";
import type { Tema } from "@/lib/theme";
import { saveStep1Action, type Step1Stanje } from "./actions";
import { OnboardingShell } from "./OnboardingShell";
import { PoljeOnb } from "./PoljeOnb";
import { SifraDelatnostiPolje } from "./SifraDelatnostiPolje";
import styles from "./OnboardingBits.module.css";

export function Step1Form({ initial, tema }: { initial: Step1Stanje["values"]; tema: Tema }) {
  const [stanje, action, uToku] = useActionState<Step1Stanje, FormData>(saveStep1Action, {
    errors: {},
    values: initial,
  });

  return (
    <OnboardingShell
      korak={1}
      naslov="O tvojoj firmi"
      podnaslov="Ovi podaci idu na tvoje fakture i u knjigu prihoda."
      tema={tema}
    >
      <form action={action} className={styles.forma}>
        <PoljeOnb
          label="Poslovno ime"
          name="name"
          placeholder="Poslovno ime"
          defaultValue={stanje.values.name}
          error={stanje.errors.name}
          disabled={uToku}
        />
        <div className={styles.parRed}>
          <PoljeOnb
            label="PIB"
            name="pib"
            placeholder="9 cifara"
            maxLength={9}
            inputMode="numeric"
            defaultValue={stanje.values.pib}
            error={stanje.errors.pib}
            disabled={uToku}
          />
          <PoljeOnb
            label="Matični broj"
            name="mb"
            placeholder="8 cifara"
            maxLength={8}
            inputMode="numeric"
            defaultValue={stanje.values.mb}
            error={stanje.errors.mb}
            disabled={uToku}
          />
        </div>
        <SifraDelatnostiPolje
          initialCode={stanje.values.delatnostCode}
          initialName={stanje.values.delatnostName}
          error={stanje.errors.delatnostCode}
          disabled={uToku}
        />
        <PoljeOnb
          label="Datum otvaranja"
          name="regDate"
          type="date"
          defaultValue={stanje.values.regDate}
          error={stanje.errors.regDate}
          disabled={uToku}
        />
        <Button type="submit" varijanta="primarno" puniRed disabled={uToku}>
          {uToku ? (
            <>
              <IkonaUcitavanje size={20} className={styles.spiner} />
              Čuvam podatke...
            </>
          ) : (
            "Nastavi"
          )}
        </Button>
      </form>
    </OnboardingShell>
  );
}
