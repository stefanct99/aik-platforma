"use client";

import { useActionState } from "react";
import type { Tema } from "@/lib/theme";
import { IkonaUpload } from "@/components/auth-shell/auth-icons";
import { goBackAction, saveStep2Action, type Step2Stanje } from "./actions";
import { OnboardingShell } from "./OnboardingShell";
import { NavRow } from "./NavRow";
import { PoljeOnb } from "./PoljeOnb";
import styles from "./OnboardingBits.module.css";

export function Step2Form({ initial, tema }: { initial: Step2Stanje["values"]; tema: Tema }) {
  const [stanje, action, uToku] = useActionState<Step2Stanje, FormData>(saveStep2Action, {
    errors: {},
    values: initial,
  });

  return (
    <OnboardingShell
      korak={2}
      naslov="Podaci za fakture"
      podnaslov="Ovo se pojavljuje na svakoj fakturi koju pošalješ."
      tema={tema}
    >
      <form action={action} className={styles.forma}>
        <PoljeOnb
          label="Ulica i broj"
          name="street"
          placeholder="Ulica i broj"
          defaultValue={stanje.values.street}
          error={stanje.errors.street}
          disabled={uToku}
        />
        <div className={styles.parRed}>
          <PoljeOnb
            label="Mesto"
            name="city"
            placeholder="Mesto"
            defaultValue={stanje.values.city}
            error={stanje.errors.city}
            disabled={uToku}
          />
          <PoljeOnb
            label="Poštanski broj"
            name="zip"
            placeholder="5 cifara"
            maxLength={5}
            inputMode="numeric"
            defaultValue={stanje.values.zip}
            error={stanje.errors.zip}
            disabled={uToku}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: 8 }}>
            Logo (nije obavezno)
          </label>
          <div className={styles.dropzone}>
            <span className={styles.dropzoneIkona}>
              <IkonaUpload size={24} />
            </span>
            <span className={styles.dropzoneTekst}>
              Prevuci logo ovde ili <u>izaberi fajl</u>
            </span>
            <span className={styles.dropzonePomoc}>
              PNG ili SVG, do 2 MB. Možeš ga dodati i kasnije.
            </span>
          </div>
        </div>
        <NavRow onBack={() => void goBackAction(2)} loading={uToku} loadingLabel="Čuvam podatke..." />
      </form>
    </OnboardingShell>
  );
}
