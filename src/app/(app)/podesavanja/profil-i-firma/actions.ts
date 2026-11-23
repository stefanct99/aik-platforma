"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isValidMb, isValidPib, isValidZip, jePibFormatIspravan } from "@/lib/identifiers";
import { findKD2025, isValidKD2025Code } from "@/lib/kd-sifre";
import { updateBusinessProfile } from "@/lib/business";

export type ProfilFirmeStanje = {
  errors: Partial<
    Record<
      | "ownerName"
      | "name"
      | "pib"
      | "mb"
      | "delatnostCode"
      | "regDate"
      | "street"
      | "city"
      | "zip",
      string
    >
  >;
  values: {
    ownerName: string;
    name: string;
    pib: string;
    mb: string;
    delatnostCode: string;
    delatnostName: string;
    regDate: string;
    street: string;
    city: string;
    zip: string;
    contactEmail: string;
    phone: string;
  };
  sacuvano: boolean;
};

async function trenutniKorisnik() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");
  return session.user;
}

export async function sacuvajProfilFirmeAction(
  _prethodnoStanje: ProfilFirmeStanje,
  formData: FormData,
): Promise<ProfilFirmeStanje> {
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
    street: String(formData.get("street") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    zip: String(formData.get("zip") || "").trim(),
    contactEmail: String(formData.get("contactEmail") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
  };

  const errors: ProfilFirmeStanje["errors"] = {};
  if (!values.ownerName) errors.ownerName = "Unesi ime i prezime";
  if (!values.name) errors.name = "Unesi poslovno ime";
  if (!jePibFormatIspravan(values.pib)) errors.pib = "PIB mora imati 9 cifara";
  else if (!isValidPib(values.pib)) errors.pib = "PIB nije ispravan, proveri cifre";
  if (!isValidMb(values.mb)) errors.mb = "Matični broj mora imati 8 cifara";
  if (!isValidKD2025Code(values.delatnostCode)) errors.delatnostCode = "Izaberi šifru delatnosti";
  if (!values.regDate) errors.regDate = "Unesi datum registracije";
  if (!values.street) errors.street = "Unesi ulicu i broj";
  if (!values.city) errors.city = "Unesi mesto";
  if (!isValidZip(values.zip)) errors.zip = "Poštanski broj mora imati 5 cifara";

  if (Object.keys(errors).length > 0) {
    return { errors, values, sacuvano: false };
  }

  await updateBusinessProfile(korisnik.id, {
    name: values.name,
    ownerName: values.ownerName,
    pib: values.pib,
    mb: values.mb,
    delatnostCode: values.delatnostCode,
    delatnostName: values.delatnostName,
    regDate: new Date(values.regDate),
    street: values.street,
    city: values.city,
    zip: values.zip,
    contactEmail: values.contactEmail,
    phone: values.phone,
  });

  return { errors: {}, values, sacuvano: true };
}
