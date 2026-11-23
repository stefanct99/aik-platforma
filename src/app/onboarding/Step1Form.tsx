"use client";

import { useActionState } from "react";
import { DELATNOSTI } from "@/lib/delatnosti";
import { saveStep1Action, type Step1Stanje } from "./actions";
import { OnboardingShell } from "./OnboardingShell";
import { Polje } from "./Polje";

export function Step1Form({ initial }: { initial: Step1Stanje["values"] }) {
  const [stanje, action, uToku] = useActionState<Step1Stanje, FormData>(saveStep1Action, {
    errors: {},
    values: initial,
  });

  return (
    <OnboardingShell
      korak={1}
      naslov="O tvojoj firmi"
      podnaslov="Ovi podaci idu na tvoje fakture i u knjigu prihoda."
    >
      <form action={action}>
        <Polje label="Ime i prezime" error={stanje.errors.ownerName}>
          <input name="ownerName" defaultValue={stanje.values.ownerName} disabled={uToku} />
        </Polje>
        <Polje label="Poslovno ime" error={stanje.errors.name}>
          <input name="name" defaultValue={stanje.values.name} disabled={uToku} />
        </Polje>
        <Polje label="PIB" error={stanje.errors.pib}>
          <input
            name="pib"
            defaultValue={stanje.values.pib}
            maxLength={9}
            inputMode="numeric"
            placeholder="9 cifara"
            disabled={uToku}
          />
        </Polje>
        <Polje label="Matični broj" error={stanje.errors.mb}>
          <input
            name="mb"
            defaultValue={stanje.values.mb}
            maxLength={8}
            inputMode="numeric"
            placeholder="8 cifara"
            disabled={uToku}
          />
        </Polje>
        <Polje label="Šifra delatnosti" error={stanje.errors.delatnostCode}>
          <select name="delatnostCode" defaultValue={stanje.values.delatnostCode} disabled={uToku}>
            {DELATNOSTI.map(([code, name]) => (
              <option key={code} value={code}>
                {code} {name}
              </option>
            ))}
          </select>
        </Polje>
        <Polje label="Datum otvaranja" error={stanje.errors.regDate}>
          <input type="date" name="regDate" defaultValue={stanje.values.regDate} disabled={uToku} />
        </Polje>
        <button type="submit" disabled={uToku}>
          {uToku ? "Čuvam..." : "Nastavi"}
        </button>
      </form>
    </OnboardingShell>
  );
}
