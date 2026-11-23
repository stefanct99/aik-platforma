import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { trebaPreusmeravanjeNaPrijavu } from "@/lib/auth-guard";
import { jeDozvoljenaAdminPrijava } from "@/lib/admin-dev-gate";
import { trebaPreusmeravanjeNaOnboarding } from "@/lib/onboarding-guard";
import { getBusinessForUser } from "@/lib/business";
import { AppShell } from "@/components/app-shell/AppShell";

// Zavisi od sesije (headers()), ne može da se unapred generiše statički.
export const instant = false;

// Zajednički okvir (Korak 4) za sve ekrane prijavljenih korisnika sa završenim onboardingom: isti
// zaštitni kod kao ranije u svakoj stranici posebno (/pocetna, /onboarding), sad na jednom mestu.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (trebaPreusmeravanjeNaPrijavu(session, jeDozvoljenaAdminPrijava())) {
    redirect("/prijava");
  }

  const biznis = await getBusinessForUser(session!.user.id);

  if (trebaPreusmeravanjeNaOnboarding(biznis?.onboardingCompletedAt)) {
    redirect("/onboarding");
  }

  return (
    <AppShell ime={session!.user.name || "Korisnik"} firma={biznis!.name}>
      {children}
    </AppShell>
  );
}
