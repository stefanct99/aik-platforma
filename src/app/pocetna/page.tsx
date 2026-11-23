import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { trebaPreusmeravanjeNaPrijavu } from "@/lib/auth-guard";
import { jeDozvoljenaAdminPrijava } from "@/lib/admin-dev-gate";
import { trebaPreusmeravanjeNaOnboarding } from "@/lib/onboarding-guard";
import { getBusinessForUser } from "@/lib/business";
import { OdjavaButton } from "./OdjavaButton";

// Stranica zavisi od sesije (headers()), ne može da se unapred generiše statički.
export const instant = false;

export default async function PocetnaPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (trebaPreusmeravanjeNaPrijavu(session, jeDozvoljenaAdminPrijava())) {
    redirect("/prijava");
  }

  const biznis = await getBusinessForUser(session!.user.id);

  if (trebaPreusmeravanjeNaOnboarding(biznis?.onboardingCompletedAt)) {
    redirect("/onboarding");
  }

  return (
    <main>
      <p>
        {biznis!.name}, PIB {biznis!.pib}
      </p>
      <OdjavaButton />
    </main>
  );
}
