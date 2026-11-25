// Podsetnik klijentu (Korak 8a, frejm Fak23, spec 6.7): razvojni mejl (ispis u terminalu), beleži se u
// istoriji fakture.
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Polje } from "@/components/ui/Polje";
import poljeStyles from "@/components/ui/Polje.module.css";
import { IkonaSpajalica } from "@/components/ui/icons";
import { posaljiPodsetnikAction } from "@/app/(app)/fakture/actions";

export function PodsetnikDialog({
  invoiceId,
  broj,
  billingEmail,
  jezik,
  onClose,
  onPoslato,
}: {
  invoiceId: string;
  broj: string;
  billingEmail: string | null;
  jezik: "sr" | "en";
  onClose: () => void;
  onPoslato?: () => void;
}) {
  const [uToku, pokreni] = useTransition();
  // Spec 6.7: poruka je na JEZIKU FAKTURE ("Napisao sam ljubazan podsetnik na engleskom jer je to jezik
  // fakture"), naslov ostaje fiksno na engleskom (tako i frejm Fak23 pokazuje - "Reminder: invoice ...").
  const [poruka] = useState(
    jezik === "en"
      ? `Dear team,\n\nThis is a friendly reminder that invoice ${broj} is now overdue.\n\nBest regards.`
      : `Poštovani,\n\nOvo je ljubazan podsetnik da faktura ${broj} kasni sa uplatom.\n\nHvala.`,
  );

  function posalji() {
    pokreni(async () => {
      await posaljiPodsetnikAction(invoiceId);
      onPoslato?.();
      onClose();
    });
  }

  return (
    <Modal naslov="Pošalji podsetnik" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <Polje label="Za" name="za" defaultValue={billingEmail ?? ""} readOnly disabled />
        <Polje label="Naslov" name="naslov" defaultValue={`Reminder: invoice ${broj}`} readOnly disabled />
        <div className={poljeStyles.polje}>
          <label htmlFor="poruka">Poruka</label>
          <textarea
            id="poruka"
            className={poljeStyles.unos}
            style={{ height: "auto", minHeight: 110, padding: "10px 12px", resize: "vertical" }}
            defaultValue={poruka}
            disabled
          />
          <span className={poljeStyles.pomocniTekst}>
            {jezik === "en"
              ? "Napisao sam ljubazan podsetnik na engleskom jer je to jezik fakture. Slobodno ga izmeni."
              : "Napisao sam ljubazan podsetnik. Slobodno ga izmeni."}
          </span>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", color: "var(--color-text-muted)" }}>
          <IkonaSpajalica size={18} />
          <span style={{ fontSize: "0.875rem" }}>
            Invoice {broj.replace("/", "-")}.pdf - napravljen iz tvog šablona
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Button type="button" varijanta="primarno" disabled={uToku} onClick={posalji}>
            {uToku ? "Šaljem..." : "Pošalji podsetnik"}
          </Button>
          <Button type="button" varijanta="sekundarno" disabled={uToku} onClick={onClose}>
            Odustani
          </Button>
        </div>
      </div>
    </Modal>
  );
}
