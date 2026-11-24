import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth-shell/AuthShell";
import { StatusIconCircle } from "@/components/auth-shell/StatusIconCircle";
import { BackLink } from "@/components/auth-shell/BackLink";
import { IkonaSat } from "@/components/auth-shell/auth-icons";
import { preusmeriAkoPrijavljen } from "@/lib/guest-guard";

export const instant = false;

export default async function LinkIstekaoPage() {
  await preusmeriAkoPrijavljen();

  return (
    <AuthShell>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
        <StatusIconCircle Ikona={IkonaSat} bg="var(--color-badge-warning-bg)" fg="var(--color-badge-warning-text)" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.025em" }}>
            Link je istekao
          </h1>
          <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
            Ovaj link više ne važi jer je istekao ili je već iskorišćen. Pošalji novi i pokušaj ponovo.
          </p>
        </div>
      </div>
      <Button varijanta="primarno" puniRed>
        <Link href="/prijava/magic-link" style={{ color: "inherit", textDecoration: "none" }}>
          Pošalji novi link
        </Link>
      </Button>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <BackLink href="/prijava">Nazad na prijavu</BackLink>
      </div>
    </AuthShell>
  );
}
