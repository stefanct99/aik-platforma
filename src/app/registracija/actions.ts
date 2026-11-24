"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jeLozinkaIspravna } from "@/lib/password-rules";

export type RegistracijaStanje = {
  errors: Partial<Record<"name" | "email" | "password" | "terms", string>>;
  formError: string | null;
  values: { name: string; email: string };
};

function jeEmailIspravan(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email);
}

export async function registrujSeAction(
  _prethodnoStanje: RegistracijaStanje,
  formData: FormData,
): Promise<RegistracijaStanje> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const terms = formData.get("terms") === "on";

  const errors: RegistracijaStanje["errors"] = {};
  if (!name) errors.name = "Unesi ime i prezime";
  if (!email || !jeEmailIspravan(email)) errors.email = "Unesi ispravnu e-mail adresu";
  // Spec 7.1: lozinka najmanje 8 karaktera, jedno veliko slovo, jedan broj. Prototip
  // (referenca/prototip/js/auth.js Register) proverava samo dužinu - sledim spec, ne prototip, jer je
  // spec eksplicitan i imenovan (R2), navedeno u izveštaju kao odstupanje.
  if (!password || !jeLozinkaIspravna(password)) {
    errors.password = "Lozinka mora imati najmanje 8 karaktera, jedno veliko slovo i jedan broj";
  }
  if (!terms) errors.terms = "Moraš da prihvatiš uslove da bi nastavio";

  if (Object.keys(errors).length > 0) {
    return { errors, formError: null, values: { name, email } };
  }

  const normalizovanEmail = email.toLowerCase();
  const postojeci = await prisma.user.findUnique({ where: { email: normalizovanEmail } });
  if (postojeci) {
    return {
      errors: {},
      formError: "Nalog sa ovim e-mailom već postoji. Prijavi se ili resetuj lozinku.",
      values: { name, email },
    };
  }

  await auth.api.signUpEmail({
    body: { name, email, password, callbackURL: "/registracija/potvrda-mejla/gotovo" },
    headers: await headers(),
    asResponse: false,
  });

  redirect(`/registracija/potvrda-mejla?email=${encodeURIComponent(normalizovanEmail)}`);
}
