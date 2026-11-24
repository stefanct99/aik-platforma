"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Polje } from "@/components/ui/Polje";
import { SidePanel } from "@/components/ui/SidePanel";
import { Toggle } from "@/components/ui/Toggle";
import type { BankAccount } from "../../../../../generated/prisma/client";
import { dodajRacunAction, izmeniRacunAction, type RacunStanje } from "./actions";

const VALUTE = ["EUR", "USD", "GBP", "CHF"];

const POCETNO_STANJE: RacunStanje = { errors: {}, sacuvano: false };

export function AccountPanel({
  racun,
  onClose,
  onSaved,
}: {
  racun?: BankAccount;
  onClose: () => void;
  onSaved: () => void;
}) {
  const uredjivanje = !!racun;
  const [stanje, action, uToku] = useActionState<RacunStanje, FormData>(
    uredjivanje ? izmeniRacunAction : dodajRacunAction,
    POCETNO_STANJE,
  );
  const [tip, setTip] = useState<"RSD" | "devizni">(racun?.type === "RSD" ? "RSD" : "devizni");
  const [valuta, setValuta] = useState(racun?.currency && racun.currency !== "RSD" ? racun.currency : "EUR");
  const [podrazumevani, setPodrazumevani] = useState(racun?.isDefault ?? false);

  useEffect(() => {
    if (stanje.sacuvano) onSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stanje.sacuvano]);

  return (
    <form action={action}>
      <SidePanel
        naslov={uredjivanje ? "Izmeni račun" : "Dodaj račun"}
        onClose={onClose}
        footer={
          <>
            <Button type="button" varijanta="sekundarno" disabled={uToku} onClick={onClose}>
              Odustani
            </Button>
            <Button type="submit" varijanta="primarno" disabled={uToku}>
              {uToku ? "Čuvam..." : uredjivanje ? "Sačuvaj izmene" : "Sačuvaj račun"}
            </Button>
          </>
        }
      >
        {uredjivanje && <input type="hidden" name="racunId" value={racun!.id} />}
        <span style={{ fontSize: "1rem", lineHeight: 1.5, color: "var(--color-text-muted)" }}>
          Račun se pojavljuje na fakturama u izabranoj valuti.
        </span>

        {!uredjivanje && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Tip računa</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                type="button"
                varijanta={tip === "RSD" ? "primarno" : "sekundarno"}
                onClick={() => setTip("RSD")}
              >
                Dinarski
              </Button>
              <Button
                type="button"
                varijanta={tip === "devizni" ? "primarno" : "sekundarno"}
                onClick={() => setTip("devizni")}
              >
                Devizni
              </Button>
            </div>
            <input type="hidden" name="type" value={tip} />
          </div>
        )}
        {uredjivanje && <input type="hidden" name="type" value={tip} />}

        {tip === "devizni" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="currency" style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              Valuta
            </label>
            <select
              id="currency"
              name="currency"
              className="select"
              value={valuta}
              onChange={(dogadjaj) => setValuta(dogadjaj.target.value)}
              disabled={uToku || uredjivanje}
              style={{
                height: 48,
                borderRadius: "var(--radius-button)",
                border: "1px solid var(--color-border-input)",
                background: "var(--color-surface)",
                color: "var(--color-text)",
                padding: "0 14px",
                fontSize: "1rem",
              }}
            >
              {VALUTE.map((valutaOpcija) => (
                <option key={valutaOpcija} value={valutaOpcija}>
                  {valutaOpcija}
                </option>
              ))}
            </select>
          </div>
        )}

        <Polje
          label="Banka"
          name="bank"
          defaultValue={racun?.bank}
          error={stanje.errors.bank}
          disabled={uToku}
        />

        {tip === "RSD" ? (
          <Polje
            label="Broj računa"
            name="number"
            placeholder="160-0000123456-78"
            defaultValue={racun?.number ?? ""}
            error={stanje.errors.number}
            disabled={uToku}
          />
        ) : (
          <>
            <Polje
              label="IBAN"
              name="iban"
              defaultValue={racun?.iban ?? ""}
              error={stanje.errors.iban}
              disabled={uToku}
            />
            <Polje
              label="SWIFT"
              name="swift"
              defaultValue={racun?.swift ?? ""}
              error={stanje.errors.swift}
              disabled={uToku}
            />
          </>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "1rem" }}>Podrazumevani za fakture u ovoj valuti</span>
          <Toggle on={podrazumevani} onChange={setPodrazumevani} disabled={uToku} />
          <input type="hidden" name="isDefault" value={podrazumevani ? "on" : ""} />
        </div>
      </SidePanel>
    </form>
  );
}
