"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Polje } from "@/components/ui/Polje";
import { obrisiNalogAction, type BrisanjeNalogaStanje } from "./actions";

const POCETNO_STANJE: BrisanjeNalogaStanje = { greska: null };

export function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const [stanje, action, uToku] = useActionState(obrisiNalogAction, POCETNO_STANJE);
  const [potvrda, setPotvrda] = useState("");

  return (
    <Modal naslov="Izbrisati nalog?" onClose={onClose}>
      <form action={action} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <span style={{ fontSize: "1rem", lineHeight: 1.5, color: "var(--color-text-muted)" }}>
          Brišu se fakture, knjiga prihoda, dokumenta i razgovori sa AI knjigovođom. Pre toga izvezi
          podatke, jer ovo ne može da se vrati.
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <span style={{ fontSize: "1rem", lineHeight: 1.5, color: "var(--color-text-muted)" }}>
            Napiši IZBRISI da potvrdiš.
          </span>
          <Polje
            label="Potvrda"
            name="potvrda"
            placeholder="IZBRISI"
            value={potvrda}
            onChange={(dogadjaj) => setPotvrda(dogadjaj.target.value)}
            disabled={uToku}
            error={stanje.greska ?? undefined}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Button type="submit" varijanta="primarno" disabled={uToku || potvrda.trim() !== "IZBRISI"}>
            {uToku ? "Brišem..." : "Trajno izbriši nalog"}
          </Button>
          <Button type="button" varijanta="sekundarno" disabled={uToku} onClick={onClose}>
            Odustani
          </Button>
        </div>
      </form>
    </Modal>
  );
}
