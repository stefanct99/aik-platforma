import type { ReactNode } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getBusinessForUser } from "@/lib/business";
import { formatDatum } from "@/lib/datum";
import { isValidFormatDatuma } from "@/lib/theme";
import { PodesavanjaShell } from "@/components/settings/PodesavanjaShell";

// Zavisi od sesije (headers()). Prijava i onboarding su već zaštićeni u src/app/(app)/layout.tsx.
export const instant = false;

export default async function PodesavanjaLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const biznis = await getBusinessForUser(session!.user.id);
  const formatDatuma = isValidFormatDatuma(session!.user.formatDatuma) ? session!.user.formatDatuma : "dmy";

  return (
    <PodesavanjaShell naziv={biznis!.name} pausalacOd={formatDatum(biznis!.regDate, formatDatuma)}>
      {children}
    </PodesavanjaShell>
  );
}
