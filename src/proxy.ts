import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { trebaPreusmeravanjeNaPrijavu } from "@/lib/auth-guard";
import { jeDozvoljenaAdminPrijava } from "@/lib/admin-dev-gate";
import { trebaPreusmeravanjeNaOnboarding, trebaPreusmeravanjeNaPocetnu } from "@/lib/onboarding-guard";
import { getBusinessForUser } from "@/lib/business";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (trebaPreusmeravanjeNaPrijavu(session, jeDozvoljenaAdminPrijava())) {
    return NextResponse.redirect(new URL("/prijava", request.url));
  }

  const biznis = await getBusinessForUser(session!.user.id);
  const naOnboardingu = request.nextUrl.pathname.startsWith("/onboarding");

  if (trebaPreusmeravanjeNaOnboarding(biznis?.onboardingCompletedAt) && !naOnboardingu) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (trebaPreusmeravanjeNaPocetnu(biznis?.onboardingCompletedAt) && naOnboardingu) {
    return NextResponse.redirect(new URL("/pocetna", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/pocetna",
    "/onboarding",
    "/fakture",
    "/knjiga-prihoda",
    "/kalendar",
    "/porez",
    "/mejlovi-banke",
    "/ai",
    "/podesavanja",
    "/podesavanja/:path*",
  ],
};
