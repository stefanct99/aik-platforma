import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth-shell/AuthShell";
import { StatusIconCircle } from "@/components/auth-shell/StatusIconCircle";
import { BackLink } from "@/components/auth-shell/BackLink";
import { IkonaMejl } from "@/components/auth-shell/auth-icons";
import { preusmeriAkoPrijavljen } from "@/lib/guest-guard";
import { PosaljiPonovoDugme } from "./PosaljiPonovoDugme";

export const instant = false;

export default async function PotvrdaMejlaPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  await preusmeriAkoPrijavljen();
  const { email } = await searchParams;
  const prikazanEmail = email || "";

  return (
    <AuthShell>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
        <StatusIconCircle Ikona={IkonaMejl} bg="var(--color-lime-400)" fg="var(--color-forest-900)" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.025em" }}>
            Potvrdi e-mail
          </h1>
          <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
            Poslali smo ti link za potvrdu na {prikazanEmail || "tvoj e-mail"}. Nalog je neaktivan dok ga
            ne potvrdiš.
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
      <p style={{ margin: 0, fontSize: "0.875rem", textAlign: "center", color: "var(--color-text-muted)" }}>
        Nije stigao? Proveri spam ili {prikazanEmail && <PosaljiPonovoDugme email={prikazanEmail} />}.
      </p>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <BackLink href="/prijava">Promeni e-mail</BackLink>
      </div>
    </AuthShell>
  );
}
