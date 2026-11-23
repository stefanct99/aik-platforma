"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isValidMb, isValidPib, isValidZip } from "@/lib/identifiers";
import { findKD2025, isValidKD2025Code } from "@/lib/kd-sifre";
import {
  finishOnboarding,
  saveOnboardingStep1,
  saveOnboardingStep2,
  setOnboardingStep,
} from "@/lib/business";
import { Prisma } from "../../../generated/prisma/client";

export type Step1Stanje = {
  errors: Partial<Record<"ownerName" | "name" | "pib" | "mb" | "delatnostCode" | "regDate", string>>;
  values: {
    ownerName: string;
    name: string;
    pib: string;
    mb: string;
    delatnostCode: string;
    delatnostName: string;
    regDate: string;
  };
};

export type Step2Stanje = {
  errors: Partial<Record<"street" | "city" | "zip", string>>;
  values: { street: string; city: string; zip: string };
};

async function trenutniKorisnik() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");
  return session.user;
}

export async function saveStep1Action(
  _prethodnoStanje: Step1Stanje,
  formData: FormData,
): Promise<Step1Stanje> {
  const korisnik = await trenutniKorisnik();

  const delatnostCode = String(formData.get("delatnostCode") || "");
  const values = {
    ownerName: String(formData.get("ownerName") || "").trim(),
    name: String(formData.get("name") || "").trim(),
    pib: String(formData.get("pib") || "").trim(),
    mb: String(formData.get("mb") || "").trim(),
    delatnostCode,
    delatnostName: findKD2025(delatnostCode)?.name ?? "",
    regDate: String(formData.get("regDate") || ""),
  };

  const errors: Step1Stanje["errors"] = {};
  if (!values.ownerName) errors.ownerName = "Unesi ime i prezime";
  if (!values.name) errors.name = "Unesi poslovno ime";
  if (!isValidPib(values.pib)) errors.pib = "PIB mora imati 9 cifara";
  if (!isValidMb(values.mb)) errors.mb = "Matični broj mora imati 8 cifara";
  if (!isValidKD2025Code(values.delatnostCode)) errors.delatnostCode = "Izaberi šifru delatnosti";
  if (!values.regDate) errors.regDate = "Unesi datum otvaranja";

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  const delatnost = findKD2025(values.delatnostCode)!;

  try {
    await saveOnboardingStep1(korisnik.id, {
      ownerName: values.ownerName,
      name: values.name,
      pib: values.pib,
      mb: values.mb,
      delatnostCode: delatnost.code,
      delatnostName: delatnost.name,
      regDate: new Date(values.regDate),
    });
  } catch (greska) {
    if (greska instanceof Prisma.PrismaClientKnownRequestError && greska.code === "P2002") {
      return { errors: { pib: "Ovaj PIB je već u upotrebi na drugom nalogu." }, values };
    }
    throw greska;
  }

  redirect("/onboarding");
}

export async function saveStep2Action(
  _prethodnoStanje: Step2Stanje,
  formData: FormData,
): Promise<Step2Stanje> {
  const korisnik = await trenutniKorisnik();

  const values = {
    street: String(formData.get("street") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    zip: String(formData.get("zip") || "").trim(),
  };

  const errors: Step2Stanje["errors"] = {};
  if (!values.street) errors.street = "Unesi ulicu i broj";
  if (!values.city) errors.city = "Unesi mesto";
  if (!isValidZip(values.zip)) errors.zip = "Poštanski broj mora imati 5 cifara";

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  await saveOnboardingStep2(korisnik.id, values);
  redirect("/onboarding");
}

export async function continueFromStep3Action() {
  const korisnik = await trenutniKorisnik();
  await setOnboardingStep(korisnik.id, 4);
  redirect("/onboarding");
}

export async function finishOnboardingAction() {
  const korisnik = await trenutniKorisnik();
  await finishOnboarding(korisnik.id);
  redirect("/pocetna");
}

export async function goBackAction(formData: FormData) {
  const korisnik = await trenutniKorisnik();
  const trenutniKorak = Number(formData.get("trenutniKorak")) || 1;
  await setOnboardingStep(korisnik.id, Math.max(1, trenutniKorak - 1));
  redirect("/onboarding");
}
