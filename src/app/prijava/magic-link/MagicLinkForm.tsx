"use client";

import { startTransition, useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth-shell/AuthShell";
import { PoljeAuth } from "@/components/auth-shell/PoljeAuth";
import { StatusIconCircle } from "@/components/auth-shell/StatusIconCircle";
import { BackLink } from "@/components/auth-shell/BackLink";
import { IkonaSanduce } from "@/components/auth-shell/auth-icons";
import styles from "@/components/auth-shell/AuthBits.module.css";
import { posaljiMagicLinkAction, type MagicLinkStanje } from "../actions";

const POCETNO_STANJE: MagicLinkStanje = { email: "", poslato: false, greska: null };

export function MagicLinkForm() {
  const [stanje, action, uToku] = useActionState<MagicLinkStanje, FormData>(
    posaljiMagicLinkAction,
    POCETNO_STANJE,
  );

  if (stanje.poslato) {
    return (
      <AuthShell>
        <div className={styles.statusBlok}>
          <StatusIconCircle Ikona={IkonaSanduce} bg="var(--color-lime-400)" fg="var(--color-forest-900)" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.025em" }}>
              Proveri mejl
            </h1>
            <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
              Poslali smo ti link za prijavu na {stanje.email}. Važi 15 minuta.
            </p>
          </div>
        </div>
        <Button
          varijanta="primarno"
          puniRed
          disabled
          title="U razvojnom režimu link je ispisan u terminalu servera, nema pravog poštanskog sandučeta"
        >
          Otvori mejl
        </Button>
        <p className={styles.sitanTekst}>
          Nije stigao? Proveri spam ili{" "}
          <button
            type="button"
            onClick={() => {
              const podaci = new FormData();
              podaci.set("email", stanje.email);
              startTransition(() => action(podaci));
            }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              font: "inherit",
              color: "var(--color-text)",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            pošalji ponovo
          </button>
          .
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BackLink href="/prijava">Nazad na prijavu</BackLink>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.025em" }}>
          Prijava bez lozinke
        </h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>Pošaljemo ti link za prijavu na mejl.</p>
      </div>
      <form action={action} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <PoljeAuth
          label="E-mail"
          name="email"
          type="email"
          placeholder="ime@firma.rs"
          error={stanje.greska ?? undefined}
          disabled={uToku}
        />
        <Button type="submit" varijanta="primarno" puniRed disabled={uToku}>
          {uToku ? "Šaljem..." : "Pošalji mi link za prijavu"}
        </Button>
      </form>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <BackLink href="/prijava">Nazad na prijavu</BackLink>
      </div>
    </AuthShell>
  );
}
