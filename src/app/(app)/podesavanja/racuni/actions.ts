"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  addAccount,
  removeAccount,
  updateAccount,
  validirajRacunPodatke,
  type NoviRacunPodaci,
} from "@/lib/bank-accounts";

async function trenutniKorisnik() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");
  return session.user;
}

function procitajPodatke(formData: FormData): NoviRacunPodaci {
  const type = formData.get("type") === "RSD" ? "RSD" : "devizni";
  return {
    type,
    currency: type === "RSD" ? "RSD" : String(formData.get("currency") || "EUR"),
    bank: String(formData.get("bank") || "").trim(),
    number: String(formData.get("number") || "").trim(),
    iban: String(formData.get("iban") || "").trim(),
    swift: String(formData.get("swift") || "").trim(),
    isDefault: formData.get("isDefault") === "on",
  };
}

export type RacunStanje = {
  errors: Partial<Record<string, string>>;
  sacuvano: boolean;
};

export async function dodajRacunAction(
  _prethodnoStanje: RacunStanje,
  formData: FormData,
): Promise<RacunStanje> {
  const korisnik = await trenutniKorisnik();
  const podaci = procitajPodatke(formData);

  const errors = validirajRacunPodatke(podaci);
  if (Object.keys(errors).length > 0) return { errors, sacuvano: false };

  await addAccount(korisnik.id, podaci);
  return { errors: {}, sacuvano: true };
}

export async function izmeniRacunAction(
  _prethodnoStanje: RacunStanje,
  formData: FormData,
): Promise<RacunStanje> {
  const korisnik = await trenutniKorisnik();
  const racunId = String(formData.get("racunId") || "");
  const podaci = procitajPodatke(formData);

  const errors = validirajRacunPodatke(podaci);
  if (Object.keys(errors).length > 0) return { errors, sacuvano: false };

  await updateAccount(korisnik.id, racunId, {
    bank: podaci.bank,
    number: podaci.number,
    iban: podaci.iban,
    swift: podaci.swift,
    isDefault: podaci.isDefault,
  });
  return { errors: {}, sacuvano: true };
}

export async function ukloniRacunAction(racunId: string) {
  const korisnik = await trenutniKorisnik();
  return removeAccount(korisnik.id, racunId);
}
