import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSessionsForUser } from "@/lib/devices";
import { opisiProtekloVremeDuze } from "@/lib/user-agent";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { BezbednostTab } from "./BezbednostTab";

export const instant = false;

export default async function BezbednostINalogPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");

  const sesije = await getSessionsForUser(session.user.id);
  const nalogSaLozinkom = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "credential" },
  });

  const poslednjaPromenaLozinkeOpis = nalogSaLozinkom
    ? `Poslednja promena ${opisiProtekloVremeDuze(nalogSaLozinkom.updatedAt)}`
    : "Lozinka još nije menjana";

  return (
    <>
      <SettingsPageHeader naslov="Bezbednost i nalog" opis="Lozinka, prijava i brisanje naloga." />
      <BezbednostTab
        poslednjaPromenaLozinkeOpis={poslednjaPromenaLozinkeOpis}
        sesije={sesije.map((s) => ({
          id: s.id,
          userAgent: s.userAgent,
          updatedAt: s.updatedAt,
          jeTrenutna: s.token === session.session.token,
        }))}
      />
    </>
  );
}
