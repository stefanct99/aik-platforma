"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isValidTema, updateUserTheme, type Tema } from "@/lib/theme";

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

  // userId dolazi isključivo iz sesije, nikad iz forme, zato korisnik A ne može ovim pozivom da promeni
  // temu korisniku B.
  await updateUserTheme(session.user.id, tema);

  return { tema, sacuvano: true };
}
