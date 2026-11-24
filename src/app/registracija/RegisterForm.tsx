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
import { IkonaUpozorenje } from "@/components/auth-shell/auth-icons";
import styles from "@/components/auth-shell/AuthBits.module.css";
import { registrujSeAction, type RegistracijaStanje } from "./actions";

const POCETNO_STANJE: RegistracijaStanje = {
  errors: {},
  formError: null,
  values: { name: "", email: "" },
};

export function RegisterForm({ googlePodesen }: { googlePodesen: boolean }) {
  const [stanje, action, uToku] = useActionState<RegistracijaStanje, FormData>(
    registrujSeAction,
    POCETNO_STANJE,
  );

  const switchLink = (
    <span style={{ fontSize: "0.875rem" }}>
      Već imaš nalog? <Link href="/prijava" style={{ textDecoration: "underline" }}>Prijavi se</Link>
    </span>
  );

  return (
    <AuthShell zaglavljeDesno={switchLink}>
      <Tabs aktivna="registracija" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.025em" }}>
          Napravi nalog
        </h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>Prvih 30 dana je besplatno.</p>
      </div>

      {stanje.formError && <Alert>{stanje.formError}</Alert>}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <GoogleDugme podeseno={googlePodesen} />
        <div className={styles.divider}>ili</div>
        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <PoljeAuth
            label="Ime i prezime"
            name="name"
            defaultValue={stanje.values.name}
            error={stanje.errors.name}
            disabled={uToku}
          />
          <PoljeAuth
            label="E-mail"
            name="email"
            type="email"
            defaultValue={stanje.values.email}
            error={stanje.errors.email}
            disabled={uToku}
          />
          <LozinkaPoljeAuth
            label="Lozinka"
            name="password"
            error={stanje.errors.password}
            hint={!stanje.errors.password ? "Najmanje 8 karaktera, jedno veliko slovo i jedan broj." : undefined}
            disabled={uToku}
          />
          <label
            className={styles.prekidacRed + (stanje.errors.terms ? ` ${styles.greska}` : "")}
          >
            <input type="checkbox" name="terms" disabled={uToku} />
            <span>
              Prihvatam <Link href="/uslovi">Uslove korišćenja</Link> i{" "}
              <Link href="/privatnost">Politiku privatnosti</Link>
            </span>
          </label>
          {stanje.errors.terms && (
            <div className={styles.greskaPoruka} style={{ marginTop: -8 }}>
              <IkonaUpozorenje size={18} />
              <span>{stanje.errors.terms}</span>
            </div>
          )}
          <Button type="submit" varijanta="primarno" puniRed disabled={uToku}>
            {uToku ? "Pravim nalog..." : "Napravi nalog"}
          </Button>
          {!uToku && <p className={styles.napomena}>Prvih 30 dana je besplatno. Bez obaveze.</p>}
        </form>
      </div>
    </AuthShell>
  );
}
