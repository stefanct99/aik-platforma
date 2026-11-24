// Storno dijalog (Korak 8a, frejm Fak17/PhFak17, spec 6.9).
"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { storinirajAction, type StornoStanje } from "@/app/(app)/fakture/actions";

const POCETNO_STANJE: StornoStanje = { greska: null, sacuvano: false };

export function StornoDialog({
  invoiceId,
  broj,
  nazivKlijenta,
  onClose,
  onSacuvano,
}: {
  invoiceId: string;
  broj: string;
  nazivKlijenta: string;
  onClose: () => void;
  onSacuvano?: () => void;
}) {
  const action = storinirajAction.bind(null, invoiceId);
  const [stanje, formAction, uToku] = useActionState(action, POCETNO_STANJE);
  const [obavesti, setObavesti] = useState(true);

  useEffect(() => {
    if (stanje.sacuvano) {
      onSacuvano?.();
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stanje.sacuvano]);

  return (
    <Modal naslov={`Stornirati fakturu ${broj}?`} onClose={onClose}>
      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <span style={{ fontSize: "1rem", lineHeight: 1.5, color: "var(--color-text-muted)" }}>
          Stornirana faktura ostaje u istoriji, ali se ne računa u tvoj prihod. Ovo ne može da se vrati.
        </span>
        {stanje.greska && (
          <span style={{ fontSize: "0.875rem", color: "var(--color-alert-danger-text)" }}>
            {stanje.greska}
          </span>
        )}
        <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "1rem" }}>
          <input
            type="checkbox"
            name="obavesti"
            checked={obavesti}
            onChange={(e) => setObavesti(e.target.checked)}
            disabled={uToku}
          />
          Obavesti {nazivKlijenta} mejlom o storniranju
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Button type="submit" varijanta="opasno" disabled={uToku}>
            {uToku ? "Storniram..." : "Storniraj fakturu"}
          </Button>
          <Button type="button" varijanta="sekundarno" disabled={uToku} onClick={onClose}>
            Odustani
          </Button>
        </div>
      </form>
    </Modal>
  );
}
