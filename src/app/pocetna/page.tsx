import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { trebaPreusmeravanjeNaPrijavu } from "@/lib/auth-guard";
import { jeDozvoljenaAdminPrijava } from "@/lib/admin-dev-gate";
import { OdjavaButton } from "./OdjavaButton";

// Stranica zavisi od sesije (headers()), ne može da se unapred generiše statički.
export const instant = false;

export default async function PocetnaPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (trebaPreusmeravanjeNaPrijavu(session, jeDozvoljenaAdminPrijava())) {
    redirect("/prijava");
  }

  return (
    <main>
      <p>Prijavljen si kao {session!.user.email}.</p>
      <OdjavaButton />
    </main>
  );
}
