"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { markInvoicePaid, removeDraftInvoice, sendReminder, voidInvoice } from "@/lib/invoices";
import { parseDatumSrpski } from "@/lib/datum";
import { createClient, removeOrArchiveClient, updateClient, type KlijentPodaci } from "@/lib/clients";

async function trenutniKorisnik() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");
  return session.user;
}

export type OznaciPlacenomStanje = { greska: string | null; sacuvano: boolean };

export async function oznaciPlacenomAction(
  invoiceId: string,
  _prethodnoStanje: OznaciPlacenomStanje,
  formData: FormData,
): Promise<OznaciPlacenomStanje> {
  const korisnik = await trenutniKorisnik();
  const datum = parseDatumSrpski(String(formData.get("datumUplate") || ""));
  if (!datum) return { greska: "Unesi ispravan datum u formatu dd.mm.gggg.", sacuvano: false };

  const rezultat = await markInvoicePaid(korisnik.id, invoiceId, datum);
  if (!rezultat.ok) return { greska: rezultat.razlog, sacuvano: false };

  revalidatePath("/fakture");
  revalidatePath(`/fakture/${invoiceId}`);
  return { greska: null, sacuvano: true };
}

export type StornoStanje = { greska: string | null; sacuvano: boolean };

export async function storinirajAction(
  invoiceId: string,
  _prethodnoStanje: StornoStanje,
  formData: FormData,
): Promise<StornoStanje> {
  const korisnik = await trenutniKorisnik();
  const obavesti = formData.get("obavesti") === "on";
  const rezultat = await voidInvoice(korisnik.id, invoiceId, obavesti);
  if (!rezultat.ok) {
    const poruka =
      rezultat.razlog === "placena_treba_potvrdu"
        ? "Faktura je već plaćena. Storniranje plaćene fakture zahteva da se uplata prvo ukloni iz prihoda (Knjiga prihoda) - to je van obima ovog koraka."
        : rezultat.razlog === "vec_stornirana"
          ? "Faktura je već stornirana."
          : "Faktura ne postoji.";
    return { greska: poruka, sacuvano: false };
  }

  revalidatePath("/fakture");
  revalidatePath(`/fakture/${invoiceId}`);
  return { greska: null, sacuvano: true };
}

export async function posaljiPodsetnikAction(invoiceId: string) {
  const korisnik = await trenutniKorisnik();
  await sendReminder(korisnik.id, invoiceId);
  revalidatePath(`/fakture/${invoiceId}`);
}

export async function obrisiNacrtAction(invoiceId: string) {
  const korisnik = await trenutniKorisnik();
  await removeDraftInvoice(korisnik.id, invoiceId);
  revalidatePath("/fakture");
}

function procitajKlijentPodatke(formData: FormData): KlijentPodaci {
  const itemDesc = String(formData.get("itemDesc") || "").trim();
  const itemAmount = String(formData.get("itemAmount") || "").trim();
  return {
    name: String(formData.get("name") || "").trim(),
    billingEmail: String(formData.get("billingEmail") || "").trim(),
    country: String(formData.get("country") || "").trim(),
    pib: String(formData.get("pib") || "").trim() || undefined,
    address: String(formData.get("address") || "").trim() || undefined,
    defaultCurrency: String(formData.get("defaultCurrency") || "EUR"),
    defaultLang: formData.get("defaultLang") === "en" ? "en" : "sr",
    defaultDueDays: Number(formData.get("defaultDueDays")) || 7,
    defaultAccountId: String(formData.get("defaultAccountId") || "") || null,
    defaultItemDesc: itemDesc || null,
    defaultItemAmount: itemDesc && itemAmount ? Math.round(Number(itemAmount) * 100) : null,
    autoSendMode: (String(formData.get("autoSendMode") || "nasledi") as KlijentPodaci["autoSendMode"]) || "nasledi",
    fxMode: (String(formData.get("fxMode") || "proknjizi") as KlijentPodaci["fxMode"]) || "proknjizi",
  };
}

export type KlijentStanje = { errors: Partial<Record<string, string>>; sacuvano: boolean };

function validirajKlijenta(podaci: KlijentPodaci): KlijentStanje["errors"] {
  const errors: KlijentStanje["errors"] = {};
  if (!podaci.name) errors.name = "Unesi naziv klijenta";
  if (!podaci.billingEmail || !podaci.billingEmail.includes("@")) {
    errors.billingEmail = "Unesi ispravan mejl za fakture";
  }
  return errors;
}

export async function dodajKlijentaAction(
  _prethodnoStanje: KlijentStanje,
  formData: FormData,
): Promise<KlijentStanje> {
  const korisnik = await trenutniKorisnik();
  const podaci = procitajKlijentPodatke(formData);
  const errors = validirajKlijenta(podaci);
  if (Object.keys(errors).length > 0) return { errors, sacuvano: false };

  await createClient(korisnik.id, podaci);
  revalidatePath("/fakture/klijenti");
  return { errors: {}, sacuvano: true };
}

export async function izmeniKlijentaAction(
  clientId: string,
  _prethodnoStanje: KlijentStanje,
  formData: FormData,
): Promise<KlijentStanje> {
  const korisnik = await trenutniKorisnik();
  const podaci = procitajKlijentPodatke(formData);
  const errors = validirajKlijenta(podaci);
  if (Object.keys(errors).length > 0) return { errors, sacuvano: false };

  await updateClient(korisnik.id, clientId, podaci);
  revalidatePath("/fakture/klijenti");
  return { errors: {}, sacuvano: true };
}

export async function obrisiIliArhivirajKlijentaAction(clientId: string) {
  const korisnik = await trenutniKorisnik();
  const rezultat = await removeOrArchiveClient(korisnik.id, clientId);
  revalidatePath("/fakture/klijenti");
  return rezultat;
}
