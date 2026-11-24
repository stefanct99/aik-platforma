"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth-shell/AuthShell";
import { LozinkaPoljeAuth } from "@/components/auth-shell/LozinkaPoljeAuth";
import { StatusIconCircle } from "@/components/auth-shell/StatusIconCircle";
import { UslovLozinke } from "@/components/auth-shell/UslovLozinke";
import { IkonaKvacicaKrug } from "@/components/auth-shell/auth-icons";
import { proveriLozinku } from "@/lib/password-rules";
import styles from "@/components/auth-shell/AuthBits.module.css";
import { sacuvajNovuLozinkuAction, type NovaLozinkaStanje } from "./actions";

const POCETNO_STANJE: NovaLozinkaStanje = { greska: null, sacuvano: false };

export function NovaLozinkaForm({ token }: { token: string }) {
  const [stanje, action, uToku] = useActionState<NovaLozinkaStanje, FormData>(
    sacuvajNovuLozinkuAction,
    POCETNO_STANJE,
  );
  const [p1, setP1] = useState("");
  const provera = proveriLozinku(p1);

  if (stanje.sacuvano) {
    return (
      <AuthShell>
        <div className={styles.statusBlok}>
          <StatusIconCircle Ikona={IkonaKvacicaKrug} bg="var(--color-lime-400)" fg="var(--color-forest-900)" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.025em" }}>
              Lozinka je promenjena
            </h1>
            <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
              Sada se možeš prijaviti novom lozinkom.
            </p>
          </div>
        </div>
        <Button varijanta="primarno" puniRed>
          <Link href="/prijava" style={{ color: "inherit", textDecoration: "none" }}>
            Idi na prijavu
          </Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.025em" }}>
          Nova lozinka
        </h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
          Izaberi lozinku koju ne koristiš nigde drugde.
        </p>
      </div>
      <form action={action} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <input type="hidden" name="token" value={token} />
        <LozinkaPoljeAuth
          label="Nova lozinka"
          name="p1"
          placeholder="Unesi novu lozinku"
          value={p1}
          onChange={(e) => setP1(e.target.value)}
          disabled={uToku}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <UslovLozinke ok={provera.najmanje8} label="Najmanje 8 karaktera" />
          <UslovLozinke ok={provera.velikoSlovo} label="Jedno veliko slovo" />
          <UslovLozinke ok={provera.broj} label="Jedan broj" />
        </div>
        <LozinkaPoljeAuth
          label="Ponovi lozinku"
          name="p2"
          placeholder="Ponovi lozinku"
          error={stanje.greska ?? undefined}
          disabled={uToku}
        />
        <Button type="submit" varijanta="primarno" puniRed disabled={uToku}>
          {uToku ? "Čuvam..." : "Sačuvaj lozinku"}
        </Button>
      </form>
    </AuthShell>
  );
}
