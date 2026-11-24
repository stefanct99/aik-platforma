// Dijalog "Označi kao plaćenu" (Korak 8a, spec 6.7 tačka 4): NI Kl6 (frejm na koji zadatak upućuje) NI
// bilo koji drugi frejm za ovaj dijalog ne postoji u repou (proverено: samo Kl1 postoji od Kalendar
// frejmova) - napravljeno po obrascu ostalih dijaloga u dizajn sistemu (Modal, Polje), navedeno u
// izveštaju kao nepostojeći frejm.
"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Polje } from "@/components/ui/Polje";
import { formatDatumSrpski } from "@/lib/datum";
import { oznaciPlacenomAction, type OznaciPlacenomStanje } from "@/app/(app)/fakture/actions";

const POCETNO_STANJE: OznaciPlacenomStanje = { greska: null, sacuvano: false };

export function OznaciPlacenomDialog({
  invoiceId,
  broj,
  onClose,
  onSacuvano,
}: {
  invoiceId: string;
  broj: string;
  onClose: () => void;
  onSacuvano?: () => void;
}) {
  const action = oznaciPlacenomAction.bind(null, invoiceId);
  const [stanje, formAction, uToku] = useActionState(action, POCETNO_STANJE);

  useEffect(() => {
    if (stanje.sacuvano) {
      onSacuvano?.();
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stanje.sacuvano]);

  return (
    <Modal naslov={`Označi fakturu ${broj} kao plaćenu?`} onClose={onClose}>
      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <span style={{ fontSize: "1rem", lineHeight: 1.5, color: "var(--color-text-muted)" }}>
          Koristi ovo kad uplata nije stigla preko mejla banke (gotovina, drugi račun). Pravi se ručan unos
          u Knjigu prihoda.
        </span>
        <Polje
          label="Datum uplate"
          name="datumUplate"
          defaultValue={formatDatumSrpski(new Date())}
          placeholder="dd.mm.gggg."
          disabled={uToku}
          error={stanje.greska ?? undefined}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Button type="submit" varijanta="primarno" disabled={uToku}>
            {uToku ? "Čuvam..." : "Označi kao plaćenu"}
          </Button>
          <Button type="button" varijanta="sekundarno" disabled={uToku} onClick={onClose}>
            Odustani
          </Button>
        </div>
      </form>
    </Modal>
  );
}
