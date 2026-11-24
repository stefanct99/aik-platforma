"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  isValidTema,
  isValidJezik,
  isValidFormatDatuma,
  updateUserTheme,
  updateUserJezikIFormat,
  type Tema,
  type Jezik,
} from "@/lib/theme";
import type { FormatDatuma } from "@/lib/datum";

// Zadržano za OnboardingThemeTogglePill (Korak 5/6, auth shell): ta pilula menja SAMO temu, ne prikazuje
// Jezik/Format datuma, pa joj treba uža akcija koja ne zahteva ta dva polja u formi.
export type TemaStanje = { tema: Tema; sacuvano: boolean };

export async function sacuvajTemuAction(
  _prethodnoStanje: TemaStanje,
  formData: FormData,
): Promise<TemaStanje> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");

  const tema = String(formData.get("tema") || "");
  if (!isValidTema(tema)) {
    return { tema: "sistem", sacuvano: false };
  }

  await updateUserTheme(session.user.id, tema);
  return { tema, sacuvano: true };
}

export type JezikIIzgledStanje = {
  tema: Tema;
  jezik: Jezik;
  formatDatuma: FormatDatuma;
  sacuvano: boolean;
};

export async function sacuvajIzgledAction(
  prethodnoStanje: JezikIIzgledStanje,
  formData: FormData,
): Promise<JezikIIzgledStanje> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");

  const tema = String(formData.get("tema") || "");
  const jezik = String(formData.get("jezik") || "");
  const formatDatuma = String(formData.get("formatDatuma") || "");

  if (!isValidTema(tema) || !isValidJezik(jezik) || !isValidFormatDatuma(formatDatuma)) {
    return { ...prethodnoStanje, sacuvano: false };
  }

  // userId dolazi isključivo iz sesije, nikad iz forme, zato korisnik A ne može ovim pozivom da promeni
  // podešavanje korisniku B.
  await updateUserTheme(session.user.id, tema);
  await updateUserJezikIFormat(session.user.id, jezik, formatDatuma);

  return { tema, jezik, formatDatuma, sacuvano: true };
}
