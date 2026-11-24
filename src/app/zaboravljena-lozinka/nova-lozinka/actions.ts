"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jeLozinkaIspravna } from "@/lib/password-rules";
import { resetujNeuspehe } from "@/lib/login-lockout";

export type NovaLozinkaStanje = { greska: string | null; sacuvano: boolean };

export async function sacuvajNovuLozinkuAction(
  _prethodnoStanje: NovaLozinkaStanje,
  formData: FormData,
): Promise<NovaLozinkaStanje> {
  const token = String(formData.get("token") || "");
  const p1 = String(formData.get("p1") || "");
  const p2 = String(formData.get("p2") || "");

  if (!jeLozinkaIspravna(p1)) {
    return { greska: "Lozinka ne ispunjava sve uslove", sacuvano: false };
  }
  if (p1 !== p2) {
    return { greska: "Lozinke se ne poklapaju", sacuvano: false };
  }

  // Čita se PRE reset-a (resetPassword troši/briše token), da se posle uspešnog reseta otključa
  // eventualno zaključan nalog - dokazao je da je on vlasnik naloga (kroz mejl), nema razloga da ostane
  // zaključan do isteka 15 minuta sa starom lozinkom koju više i ne zna.
  const verifikacija = await prisma.verification.findFirst({
    where: { identifier: `reset-password:${token}` },
  });
  const korisnik = verifikacija
    ? await prisma.user.findUnique({ where: { id: verifikacija.value } })
    : null;

  await auth.api.resetPassword({
    body: { newPassword: p1, token },
    headers: await headers(),
    asResponse: false,
  });

  if (korisnik) await resetujNeuspehe(korisnik.email);

  return { greska: null, sacuvano: true };
}
