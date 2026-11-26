import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBusinessForUser } from "@/lib/business";
import { formatDatum } from "@/lib/datum";
import { isValidFormatDatuma } from "@/lib/theme";
import { PodesavanjaShell } from "@/components/settings/PodesavanjaShell";

// Zavisi od sesije (headers()). Prijava i onboarding su već zaštićeni u src/app/(app)/layout.tsx, ali
// ovaj sopstveni redirect je i dalje potreban (ispravka "Cannot read properties of null") - stranica
// bez njega direktno čita session!.user pre nego što spoljašnji layout stigne da preusmeri.
export const instant = false;

export default async function PodesavanjaLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");

  const biznis = await getBusinessForUser(session.user.id);
  const formatDatuma = isValidFormatDatuma(session.user.formatDatuma) ? session.user.formatDatuma : "dmy";

  return (
    <PodesavanjaShell naziv={biznis!.name} pausalacOd={formatDatum(biznis!.regDate, formatDatuma)}>
      {children}
    </PodesavanjaShell>
  );
}
