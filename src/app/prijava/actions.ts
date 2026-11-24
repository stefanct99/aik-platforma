"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth";
import { auth, jeAdminBlokiranZaPrijavu } from "@/lib/auth";
import { jeZakljucano, resetujNeuspehe, zabeleziNeuspeh } from "@/lib/login-lockout";

const PORUKA_POGRESNI_PODACI = "Pogrešan e-mail ili lozinka. Pokušaj ponovo ili resetuj lozinku.";

export type PrijavaStanje = {
  errors: Partial<Record<"email" | "password", string>>;
  formError: string | null;
  zakljucano: boolean;
  values: { email: string };
};

export async function prijaviSeAction(
  _prethodnoStanje: PrijavaStanje,
  formData: FormData,
): Promise<PrijavaStanje> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const errors: PrijavaStanje["errors"] = {};
  if (!email) errors.email = "Unesi e-mail adresu";
  if (!password) errors.password = "Unesi lozinku";
  if (Object.keys(errors).length > 0) {
    return { errors, formError: null, zakljucano: false, values: { email } };
  }

  if (await jeZakljucano(email)) {
    return { errors: {}, formError: null, zakljucano: true, values: { email } };
  }

  // Isti put kao pogrešna lozinka: ne otkriva da nalog postoji, a admin se ne prijavljuje lozinkom van
  // razvojnog režima (ista pravilo kao magic link, spec 7.1 + Korak 1).
  if (await jeAdminBlokiranZaPrijavu(email)) {
    const upravoZakljucano = await zabeleziNeuspeh(email);
    return {
      errors: {},
      formError: upravoZakljucano ? null : PORUKA_POGRESNI_PODACI,
      zakljucano: upravoZakljucano,
      values: { email },
    };
  }

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
      asResponse: false,
    });
  } catch (greska) {
    if (greska instanceof APIError && greska.body?.code === "EMAIL_NOT_VERIFIED") {
      redirect(`/registracija/potvrda-mejla?email=${encodeURIComponent(email)}`);
    }
    const upravoZakljucano = await zabeleziNeuspeh(email);
    return {
      errors: {},
      formError: upravoZakljucano ? null : PORUKA_POGRESNI_PODACI,
      zakljucano: upravoZakljucano,
      values: { email },
    };
  }

  await resetujNeuspehe(email);
  redirect("/pocetna");
}

export type MagicLinkStanje = { email: string; poslato: boolean; greska: string | null };

export async function posaljiMagicLinkAction(
  _prethodnoStanje: MagicLinkStanje,
  formData: FormData,
): Promise<MagicLinkStanje> {
  const email = String(formData.get("email") || "").trim();
  if (!email) {
    return { email, poslato: false, greska: "Unesi e-mail adresu" };
  }

  await auth.api.signInMagicLink({
    body: { email, callbackURL: "/pocetna", errorCallbackURL: "/prijava/link-istekao" },
    headers: await headers(),
    asResponse: false,
  });

  return { email, poslato: true, greska: null };
}
