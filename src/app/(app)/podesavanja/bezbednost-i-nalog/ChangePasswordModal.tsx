"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Polje } from "@/components/ui/Polje";
import { IkonaKatanac } from "@/components/ui/icons";
import { promeniLozinkuAction, type PromenaLozinkeStanje } from "./actions";

const POCETNO_STANJE: PromenaLozinkeStanje = { greska: null, sacuvano: false };

// Uspeh nikad ne stiže ovde kao stanje: promeniLozinkuAction na uspehu radi redirect() na istu stranicu
// (videti komentar u actions.ts - izbegava trku sa starim kolačićem posle revokeOtherSessions), što samo
// po sebi zatvara ovaj modal (puno ponovno učitavanje stranice).
export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [stanje, action, uToku] = useActionState(promeniLozinkuAction, POCETNO_STANJE);

  return (
    <Modal naslov="Promeni lozinku" onClose={onClose}>
      <form action={action} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Polje
            label="Trenutna lozinka"
            name="trenutna"
            type="password"
            autoComplete="current-password"
            disabled={uToku}
            desno={<IkonaKatanac />}
          />
          <Polje
            label="Nova lozinka"
            name="nova"
            type="password"
            autoComplete="new-password"
            disabled={uToku}
            desno={<IkonaKatanac />}
          />
          <Polje
            label="Ponovi novu lozinku"
            name="ponovljena"
            type="password"
            autoComplete="new-password"
            disabled={uToku}
            desno={<IkonaKatanac />}
            error={stanje.greska ?? undefined}
            hint={
              stanje.greska
                ? undefined
                : "Najmanje 8 znakova. Posle promene ostajemo prijavljeni samo na ovom uređaju."
            }
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Button type="submit" varijanta="primarno" disabled={uToku}>
            {uToku ? "Čuvam..." : "Sačuvaj lozinku"}
          </Button>
          <Button type="button" varijanta="sekundarno" disabled={uToku} onClick={onClose}>
            Odustani
          </Button>
        </div>
      </form>
    </Modal>
  );
}
