import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { trebaPreusmeravanjeNaOnboarding, trebaPreusmeravanjeNaPocetnu } from "./onboarding-guard";
import { getBusinessForUser } from "./business";

// Spec 7.1: prijavljen korisnik koji otvori /prijava ili /registracija (i srodne stranice: magic link,
// zaboravljena lozinka) ide na /pocetna, ili na /onboarding ako nije završen. Poziva se na vrhu svake
// takve stranice, pre render-a.
export async function preusmeriAkoPrijavljen(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return;

  const biznis = await getBusinessForUser(session.user.id);
  if (trebaPreusmeravanjeNaOnboarding(biznis?.onboardingCompletedAt)) redirect("/onboarding");
  if (trebaPreusmeravanjeNaPocetnu(biznis?.onboardingCompletedAt)) redirect("/pocetna");
}
