"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { ispraviPrihod } from "@/lib/prihodi-db";

async function trenutniKorisnik() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");
  return session.user;
}

export type IspraviPrihodStanje = { greska: string | null; sacuvano: boolean };

// Korak 9c ("Ispravi" u bočnom panelu Kp4): kurs se parsira ovde (prazno/nepostojeće polje -> null, inače
// Number(...) - čak i ako je besmislen string, NaN propada do izracunajIznosRsd koji ga odbija istom
// porukom kao i negativan/nulti kurs). Da li se kurs uopšte KORISTI zavisi od red.kind iz baze
// (ispraviPrihod), ne od toga da li je ovo polje poslato - dinarski red ga tiho ignoriše.
export async function ispraviPrihodAction(
  incomeId: string,
  _prethodnoStanje: IspraviPrihodStanje,
  formData: FormData,
): Promise<IspraviPrihodStanje> {
  const korisnik = await trenutniKorisnik();

  const kursSirovo = formData.get("kurs");
  const kurs =
    kursSirovo == null || kursSirovo === "" ? null : Number(kursSirovo);
  const opisSirovo = String(formData.get("opis") ?? "").trim();
  const opis = opisSirovo || null;

  const rezultat = await ispraviPrihod(korisnik.id, incomeId, { kurs, opis });
  if (!rezultat.ok) return { greska: rezultat.razlog, sacuvano: false };

  revalidatePath("/knjiga-prihoda");
  return { greska: null, sacuvano: true };
}
