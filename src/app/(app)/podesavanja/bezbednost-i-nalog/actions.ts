"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth";
import { auth } from "@/lib/auth";
import { jeLozinkaIspravna } from "@/lib/password-rules";
import { logoutSession } from "@/lib/devices";
import { obrisiNalogKorisnika, AdminNalogNeMozeDaSeObriseError } from "@/lib/account-deletion";

async function trenutnaSesija() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");
  return session;
}

export type PromenaLozinkeStanje = { greska: string | null; sacuvano: boolean };

export async function promeniLozinkuAction(
  _prethodnoStanje: PromenaLozinkeStanje,
  formData: FormData,
): Promise<PromenaLozinkeStanje> {
  await trenutnaSesija();

  const trenutna = String(formData.get("trenutna") || "");
  const nova = String(formData.get("nova") || "");
  const ponovljena = String(formData.get("ponovljena") || "");

  if (!jeLozinkaIspravna(nova)) {
    return { greska: "Nova lozinka ne ispunjava sve uslove (najmanje 8 znakova)", sacuvano: false };
  }
  if (nova !== ponovljena) {
    return { greska: "Lozinke se ne poklapaju", sacuvano: false };
  }

  try {
    await auth.api.changePassword({
      body: { currentPassword: trenutna, newPassword: nova, revokeOtherSessions: true },
      headers: await headers(),
      asResponse: false,
    });
  } catch (greska) {
    if (greska instanceof APIError && greska.body?.code === "INVALID_PASSWORD") {
      return { greska: "Trenutna lozinka nije ispravna", sacuvano: false };
    }
    throw greska;
  }

  // changePassword sa revokeOtherSessions pravi NOVU sesiju (nov kolačić) za OVAJ uređaj i briše
  // trenutnu - zahtevi posle ove tačke u OVOM istom request-u (Next.js automatski ponovo iscrtava
  // stranicu posle akcije) i dalje nose STARI kolačić iz headers(), pa bi getSession() tu vratio null i
  // srušio stranicu. redirect() presreće to: odgovor nosi i Set-Cookie i Location zajedno, pregledač
  // primeni nov kolačić PRE nego što isprati redirekciju, pa sledeći zahtev (GET na istu stranicu) ima
  // ispravnu, novu sesiju. Isti razlog zbog kog obrisiNalogAction ispod takođe koristi redirect().
  redirect("/podesavanja/bezbednost-i-nalog");
}

export async function odjaviUredjajAction(sessionId: string) {
  const session = await trenutnaSesija();
  await logoutSession(session.user.id, sessionId, session.session.token);
}

export type BrisanjeNalogaStanje = { greska: string | null };

export async function obrisiNalogAction(
  _prethodnoStanje: BrisanjeNalogaStanje,
  formData: FormData,
): Promise<BrisanjeNalogaStanje> {
  const session = await trenutnaSesija();

  const potvrda = String(formData.get("potvrda") || "");
  if (potvrda.trim() !== "IZBRISI") {
    return { greska: 'Otkucaj tačno "IZBRISI" da potvrdiš.' };
  }

  try {
    await obrisiNalogKorisnika(session.user.id);
  } catch (greska) {
    if (greska instanceof AdminNalogNeMozeDaSeObriseError) {
      return { greska: greska.message };
    }
    throw greska;
  }

  redirect("/prijava");
}
