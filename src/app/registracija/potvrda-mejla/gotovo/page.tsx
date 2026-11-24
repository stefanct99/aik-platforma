import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth-shell/AuthShell";
import { StatusIconCircle } from "@/components/auth-shell/StatusIconCircle";
import { IkonaKvacicaKrug } from "@/components/auth-shell/auth-icons";

export default function PotvrdaMejlaGotovoPage() {
  return (
    <AuthShell>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
        <StatusIconCircle Ikona={IkonaKvacicaKrug} bg="var(--color-lime-400)" fg="var(--color-forest-900)" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.025em" }}>
            E-mail je potvrđen
          </h1>
          <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
            Nalog je aktivan. Još samo nekoliko podataka o tvojoj firmi.
          </p>
        </div>
      </div>
      <Button varijanta="primarno" puniRed>
        <Link href="/onboarding" style={{ color: "inherit", textDecoration: "none" }}>
          Nastavi
        </Link>
      </Button>
    </AuthShell>
  );
}
