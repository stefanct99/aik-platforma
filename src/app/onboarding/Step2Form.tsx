"use client";

import { useActionState } from "react";
import { goBackAction, saveStep2Action, type Step2Stanje } from "./actions";
import { OnboardingShell } from "./OnboardingShell";
import { Polje } from "./Polje";

export function Step2Form({ initial }: { initial: Step2Stanje["values"] }) {
  const [stanje, action, uToku] = useActionState<Step2Stanje, FormData>(saveStep2Action, {
    errors: {},
    values: initial,
  });

  return (
    <OnboardingShell
      korak={2}
      naslov="Podaci za fakture"
      podnaslov="Ovo se pojavljuje na svakoj fakturi koju pošalješ."
    >
      <form action={action}>
        <Polje label="Ulica i broj" error={stanje.errors.street}>
          <input name="street" defaultValue={stanje.values.street} disabled={uToku} />
        </Polje>
        <Polje label="Mesto" error={stanje.errors.city}>
          <input name="city" defaultValue={stanje.values.city} disabled={uToku} />
        </Polje>
        <Polje label="Poštanski broj" error={stanje.errors.zip}>
          <input
            name="zip"
            defaultValue={stanje.values.zip}
            maxLength={5}
            inputMode="numeric"
            placeholder="5 cifara"
            disabled={uToku}
          />
        </Polje>
        <button type="submit" disabled={uToku}>
          {uToku ? "Čuvam..." : "Nastavi"}
        </button>
      </form>
      <form action={goBackAction}>
        <input type="hidden" name="trenutniKorak" value={2} />
        <button type="submit" disabled={uToku}>
          Nazad
        </button>
      </form>
    </OnboardingShell>
  );
}
