import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { trebaPreusmeravanjeNaPrijavu } from "@/lib/auth-guard";
import { jeDozvoljenaAdminPrijava } from "@/lib/admin-dev-gate";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (trebaPreusmeravanjeNaPrijavu(session, jeDozvoljenaAdminPrijava())) {
    return NextResponse.redirect(new URL("/prijava", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/pocetna"],
};
