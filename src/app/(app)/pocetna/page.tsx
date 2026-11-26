import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBusinessForUser } from "@/lib/business";
import { Card } from "@/components/ui/Card";

// Zavisi od sesije (headers()), ne može da se unapred generiše statički. Zaštita (prijava, onboarding)
// je i u src/app/(app)/layout.tsx, zajednička za sve ekrane u okviru aplikacije - ovaj sopstveni
// redirect ovde je odbrambeni (Korak 8d ispravka: ista stranica je pucala sa "Cannot read properties
// of null" kad bi se server-ska komponenta pokrenula bez sesije pre nego layout stigne da preusmeri).
export const instant = false;

export default async function PocetnaPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");

  const biznis = await getBusinessForUser(session.user.id);

  return (
    <Card>
      <p style={{ margin: 0 }}>
        {biznis!.name}, PIB {biznis!.pib}
      </p>
    </Card>
  );
}
