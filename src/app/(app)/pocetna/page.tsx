import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getBusinessForUser } from "@/lib/business";
import { Card } from "@/components/ui/Card";

// Zavisi od sesije (headers()), ne može da se unapred generiše statički. Zaštita (prijava, onboarding)
// je u src/app/(app)/layout.tsx, zajednička za sve ekrane u okviru aplikacije.
export const instant = false;

export default async function PocetnaPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const biznis = await getBusinessForUser(session!.user.id);

  return (
    <Card>
      <p style={{ margin: 0 }}>
        {biznis!.name}, PIB {biznis!.pib}
      </p>
    </Card>
  );
}
