"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type ResetStanje = { email: string; poslato: boolean; greska: string | null };

export async function posaljiResetAction(
  _prethodnoStanje: ResetStanje,
  formData: FormData,
): Promise<ResetStanje> {
  const email = String(formData.get("email") || "").trim();
  if (!email) {
    return { email, poslato: false, greska: "Unesi e-mail adresu" };
  }

  // Ista poruka bez obzira da li nalog postoji (spec 7.1): Better Auth već ovo radi -
  // requestPasswordReset ne baca grešku ni ne otkriva postojanje naloga kroz vreme odgovora ni kroz
  // poruku, samo tiho ne šalje mejl ako naloga nema.
  await auth.api.requestPasswordReset({
    body: { email, redirectTo: "/zaboravljena-lozinka/nova-lozinka" },
    headers: await headers(),
    asResponse: false,
  });

  return { email, poslato: true, greska: null };
}
