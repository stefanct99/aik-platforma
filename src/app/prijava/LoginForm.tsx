"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth-shell/AuthShell";
import { Tabs } from "@/components/auth-shell/Tabs";
import { Alert } from "@/components/auth-shell/Alert";
import { PoljeAuth } from "@/components/auth-shell/PoljeAuth";
import { LozinkaPoljeAuth } from "@/components/auth-shell/LozinkaPoljeAuth";
import { GoogleDugme } from "@/components/auth-shell/GoogleDugme";
import { StatusIconCircle } from "@/components/auth-shell/StatusIconCircle";
import { BackLink } from "@/components/auth-shell/BackLink";
import { IkonaKatanac, IkonaMejl } from "@/components/auth-shell/auth-icons";
import styles from "@/components/auth-shell/AuthBits.module.css";
import { prijaviSeAction, type PrijavaStanje } from "./actions";

const POCETNO_STANJE: PrijavaStanje = {
  errors: {},
  formError: null,
  zakljucano: false,
  values: { email: "" },
};

export function LoginForm({ googlePodesen }: { googlePodesen: boolean }) {
  const [stanje, action, uToku] = useActionState<PrijavaStanje, FormData>(
    prijaviSeAction,
    POCETNO_STANJE,
  );

  const switchLink = (
    <span style={{ fontSize: "0.875rem" }}>
      Nemaš nalog? <Link href="/registracija" style={{ textDecoration: "underline" }}>Registruj se</Link>
    </span>
  );

  if (stanje.zakljucano) {
    return (
      <AuthShell zaglavljeDesno={switchLink}>
        <div className={styles.statusBlok}>
          <StatusIconCircle Ikona={IkonaKatanac} bg="var(--color-alert-danger-bg)" fg="var(--color-alert-danger-text)" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.025em" }}>
              Nalog je privremeno zaključan
            </h1>
            <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
              Previše neuspešnih pokušaja prijave. Pokušaj ponovo za 15 minuta ili resetuj lozinku.
            </p>
          </div>
        </div>
        <Button varijanta="primarno" puniRed>
          <Link href="/zaboravljena-lozinka" style={{ color: "inherit", textDecoration: "none" }}>
            Resetuj lozinku
          </Link>
        </Button>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BackLink href="/prijava">Nazad na prijavu</BackLink>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell zaglavljeDesno={switchLink}>
      <Tabs aktivna="prijava" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.025em" }}>
          Dobro došao nazad
        </h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>Prijavi se u svoj nalog.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {stanje.formError && <Alert>{stanje.formError}</Alert>}
        <GoogleDugme podeseno={googlePodesen} />
        <div className={styles.divider}>ili</div>
        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <PoljeAuth
            label="E-mail"
            name="email"
            type="email"
            placeholder="ime@firma.rs"
            defaultValue={stanje.values.email}
            error={stanje.errors.email}
            disabled={uToku}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <LozinkaPoljeAuth
              label="Lozinka"
              name="password"
              placeholder="Unesi lozinku"
              error={stanje.errors.password}
              disabled={uToku}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link
                href="/zaboravljena-lozinka"
                style={{ fontSize: "0.875rem", color: "var(--color-text)", textDecoration: "underline" }}
              >
                Zaboravljena lozinka?
              </Link>
            </div>
          </div>
          <Button type="submit" varijanta="primarno" puniRed disabled={uToku}>
            {uToku ? "Prijavljivanje..." : "Prijavi se"}
          </Button>
          <Link
            href="/prijava/magic-link"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              height: 32,
              color: "var(--color-text)",
              textDecoration: "underline",
              fontSize: "1rem",
            }}
          >
            <IkonaMejl size={18} /> Pošalji mi link za prijavu
          </Link>
        </form>
      </div>
    </AuthShell>
  );
}
