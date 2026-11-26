"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  markInvoicePaid,
  promeniBrojFakture,
  removeDraftInvoice,
  resendInvoice,
  sacuvajNacrt,
  sendInvoice,
  sendReminder,
  validirajFakturuPolja,
  voidInvoice,
  type PodaciIzmeneFakture,
  type StavkaUnos,
} from "@/lib/invoices";
import { parseDatumSrpski, formatVremeSrpski, pocetakDanaUtc } from "@/lib/datum";
import {
  createClient,
  getClientForUser,
  removeOrArchiveClient,
  updateClient,
  validirajKlijentaPodatke,
  type KlijentPodaci,
} from "@/lib/clients";
import {
  createRecurringInvoice,
  postaviStatusPonavljajuce,
  removeRecurringInvoice,
  updateRecurringInvoice,
  validirajPonavljajucuPodatke,
  type PonavljajucaPodaci,
} from "@/lib/recurring-invoices";

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
    billingEmail: String(formData.get("billingEmail") || "").trim() || undefined,
    country: String(formData.get("country") || "").trim(),
    pib: String(formData.get("pib") || "").trim() || undefined,
    address: String(formData.get("address") || "").trim(),
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

export type NoviKlijent = {
  id: string;
  name: string;
  billingEmail: string | null;
  defaultCurrency: string;
  defaultLang: "sr" | "en";
  defaultDueDays: number;
  defaultAccountId: string | null;
  defaultItemDesc: string | null;
  defaultItemAmount: number | null;
  country: string | null;
  pib: string | null;
  address: string | null;
};

export type KlijentStanje = { errors: Partial<Record<string, string>>; sacuvano: boolean; klijent?: NoviKlijent };

export async function dodajKlijentaAction(
  _prethodnoStanje: KlijentStanje,
  formData: FormData,
): Promise<KlijentStanje> {
  const korisnik = await trenutniKorisnik();
  const podaci = procitajKlijentPodatke(formData);
  const errors = validirajKlijentaPodatke(podaci);
  if (Object.keys(errors).length > 0) return { errors, sacuvano: false };

  const klijent = await createClient(korisnik.id, podaci);
  revalidatePath("/fakture/klijenti");
  return {
    errors: {},
    sacuvano: true,
    klijent: {
      id: klijent.id,
      name: klijent.name,
      billingEmail: klijent.billingEmail,
      defaultCurrency: klijent.defaultCurrency,
      defaultLang: klijent.defaultLang as "sr" | "en",
      defaultDueDays: klijent.defaultDueDays,
      defaultAccountId: klijent.defaultAccountId,
      defaultItemDesc: klijent.defaultItemDesc,
      defaultItemAmount: klijent.defaultItemAmount,
      country: klijent.country,
      pib: klijent.pib,
      address: klijent.address,
    },
  };
}

export async function izmeniKlijentaAction(
  clientId: string,
  _prethodnoStanje: KlijentStanje,
  formData: FormData,
): Promise<KlijentStanje> {
  const korisnik = await trenutniKorisnik();
  const podaci = procitajKlijentPodatke(formData);
  const errors = validirajKlijentaPodatke(podaci);
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

// ===================== Nova faktura / izmena (Korak 8b) =====================

// Stavke putuju kao JSON string u skrivenom polju (ista ideja kao ostala "izvedena" skrivena polja u
// ClientPanel-u, samo za niz, ne pojedinačnu vrednost) - broj stavki je promenljiv, FormData nema prirodan
// oblik za niz objekata.
function procitajFakturuPodatke(formData: FormData): PodaciIzmeneFakture {
  let sirove: { desc?: string; qty?: string | number; price?: string | number }[] = [];
  try {
    sirove = JSON.parse(String(formData.get("stavke") || "[]"));
  } catch {
    sirove = [];
  }
  const items: StavkaUnos[] = sirove.map((s) => ({
    desc: String(s.desc || "").trim(),
    qty: Math.max(1, Math.round(Number(s.qty) || 1)),
    price: Math.round((Number(s.price) || 0) * 100),
  }));

  return {
    clientId: String(formData.get("clientId") || ""),
    currency: String(formData.get("currency") || "EUR"),
    lang: formData.get("lang") === "en" ? "en" : "sr",
    dueDays: Number(formData.get("dueDays")) || 0,
    accountId: String(formData.get("accountId") || "") || null,
    note: String(formData.get("note") || "").trim() || null,
    items,
  };
}

export type NacrtStanje = { id: string | null; broj: string | null; sacuvanoU: string | null; greska: string | null };

// Čuva nacrt (automatsko čuvanje, nekoliko sekundi posle poslednje izmene, i dugme "Sačuvaj nacrt",
// zadatak tačka 3). BEZ validacije sadržaja - nacrt sme da bude nepotpun, validacija je samo pri slanju.
export async function sacuvajNacrtAction(
  postojeciId: string | null,
  _prethodnoStanje: NacrtStanje,
  formData: FormData,
): Promise<NacrtStanje> {
  const korisnik = await trenutniKorisnik();
  const podaci = procitajFakturuPodatke(formData);
  if (!podaci.clientId) {
    return { id: postojeciId, broj: null, sacuvanoU: null, greska: "Izaberi klijenta kome šalješ fakturu." };
  }

  const rezultat = await sacuvajNacrt(korisnik.id, postojeciId, podaci);
  if (!rezultat.ok) return { id: postojeciId, broj: null, sacuvanoU: null, greska: rezultat.razlog };

  revalidatePath("/fakture");
  return { id: rezultat.id, broj: rezultat.broj, sacuvanoU: formatVremeSrpski(new Date()), greska: null };
}

export type SlanjeFaktureStanje = {
  id: string | null;
  errors: Partial<Record<"clientId" | "items" | "dueDays" | "email", string>>;
  posalji: {
    broj: string;
    klijentIme: string;
    billingEmail: string;
    ukupno: number;
    valuta: string;
    rokIso: string;
  } | null;
};

// "Pregledaj i pošalji" -> "Pošalji fakturu" (zadatak tačka 6): prvo potpuna validacija (spec/Fak19), pa
// čuvanje (da faktura ima id/broj pre slanja), pa stvarno slanje (sendInvoice je samo po sebi bezbedno od
// dvostrukog klika - videti komentar tamo). "adresa" (zadatak Korak 8b ispravka, tačka 4): kad klijent
// nema sačuvan mejl, ekran slanja šalje ručno upisanu adresu ovde - sendInvoice je koristi SAMO za ovu
// poruku, ne menja trajno klijentov profil.
export async function posaljiFakturuAction(
  postojeciId: string | null,
  _prethodnoStanje: SlanjeFaktureStanje,
  formData: FormData,
): Promise<SlanjeFaktureStanje> {
  const korisnik = await trenutniKorisnik();
  const podaci = procitajFakturuPodatke(formData);
  const adresa = String(formData.get("adresa") || "").trim();

  const greske = validirajFakturuPolja({ clientId: podaci.clientId || null, items: podaci.items, dueDays: podaci.dueDays });
  if (Object.keys(greske).length > 0) return { id: postojeciId, errors: greske, posalji: null };

  const sacuvano = await sacuvajNacrt(korisnik.id, postojeciId, podaci);
  if (!sacuvano.ok) return { id: postojeciId, errors: { clientId: sacuvano.razlog }, posalji: null };

  const rezultat = await sendInvoice(korisnik.id, sacuvano.id, adresa);
  if (!rezultat.ok) return { id: sacuvano.id, errors: { email: rezultat.razlog }, posalji: null };

  revalidatePath("/fakture");
  revalidatePath(`/fakture/${sacuvano.id}`);
  return {
    id: sacuvano.id,
    errors: {},
    posalji: {
      broj: rezultat.podaci.broj,
      klijentIme: rezultat.podaci.klijentIme,
      billingEmail: rezultat.podaci.billingEmail,
      ukupno: rezultat.podaci.ukupno,
      valuta: rezultat.podaci.valuta,
      rokIso: rezultat.podaci.rok.toISOString(),
    },
  };
}

export type PonovnoSlanjeStanje = {
  errors: Partial<Record<"email", string>>;
  posalji: {
    broj: string;
    klijentIme: string;
    billingEmail: string;
    ukupno: number;
    valuta: string;
    rokIso: string;
  } | null;
};

// "Pošalji ponovo" (zadatak tačka 3) - za VEĆ poslatu/plaćenu fakturu: isti ekran (InvoiceSendStage,
// rezim="ponovo"), ali drugačija server akcija od prvog slanja - ne čuva nikakve izmene (broj/status/
// rok/stavke ostaju netaknuti), samo upisuje novi događaj u Istoriju i šalje razvojni mejl ponovo.
export async function posaljiPonovoAction(
  invoiceId: string,
  _prethodnoStanje: PonovnoSlanjeStanje,
  formData: FormData,
): Promise<PonovnoSlanjeStanje> {
  const korisnik = await trenutniKorisnik();
  const adresa = String(formData.get("adresa") || "").trim();

  const rezultat = await resendInvoice(korisnik.id, invoiceId, adresa);
  if (!rezultat.ok) return { errors: { email: rezultat.razlog }, posalji: null };

  revalidatePath(`/fakture/${invoiceId}`);
  return {
    errors: {},
    posalji: {
      broj: rezultat.podaci.broj,
      klijentIme: rezultat.podaci.klijentIme,
      billingEmail: rezultat.podaci.billingEmail,
      ukupno: rezultat.podaci.ukupno,
      valuta: rezultat.podaci.valuta,
      rokIso: rezultat.podaci.rok.toISOString(),
    },
  };
}

export type BrojStanje = { ok: boolean; greska: string | null };

// Ručna promena broja (zadatak tačka 5) - pozvano direktno (ne kao <form action>) pri izlasku iz polja.
export async function promeniBrojAction(invoiceId: string, noviBroj: string): Promise<BrojStanje> {
  const korisnik = await trenutniKorisnik();
  const rezultat = await promeniBrojFakture(korisnik.id, invoiceId, noviBroj);
  if (!rezultat.ok) return { ok: false, greska: rezultat.razlog };
  revalidatePath("/fakture");
  return { ok: true, greska: null };
}

// ===================== Ponavljajuće fakture (Korak 8c) =====================

// Isto pravilo kao procitajKlijentPodatke/itemAmount: amount se upisuje SAMO ako je i opis unet (isti
// obrazac, bez dupliranja odluke) - oboje prazno je "Iznos se upisuje pri slanju" (spec 3.5).
function procitajPonavljajucuPodatke(formData: FormData): PonavljajucaPodaci {
  const desc = String(formData.get("desc") || "").trim();
  const amount = String(formData.get("amount") || "").trim();
  const endDate = String(formData.get("endDate") || "").trim();
  return {
    clientId: String(formData.get("clientId") || ""),
    desc: desc || null,
    amount: desc && amount ? Math.round(Number(amount) * 100) : null,
    dayOfMonth: Number(formData.get("dayOfMonth")) || 1,
    startDate: pocetakDanaUtc(new Date(String(formData.get("startDate") || ""))),
    endDate: endDate ? pocetakDanaUtc(new Date(endDate)) : null,
    mode: formData.get("mode") === "auto" ? "auto" : "ask",
  };
}

export type PonavljajucaStanje = {
  errors: Partial<Record<"clientId" | "dayOfMonth" | "startDate" | "endDate" | "mode", string>>;
  sacuvano: boolean;
};

export async function dodajPonavljajucuAction(
  _prethodnoStanje: PonavljajucaStanje,
  formData: FormData,
): Promise<PonavljajucaStanje> {
  const korisnik = await trenutniKorisnik();
  const podaci = procitajPonavljajucuPodatke(formData);
  const klijent = podaci.clientId ? await getClientForUser(korisnik.id, podaci.clientId) : null;
  const errors = validirajPonavljajucuPodatke(podaci, klijent);
  if (Object.keys(errors).length > 0) return { errors, sacuvano: false };

  await createRecurringInvoice(korisnik.id, podaci);
  revalidatePath("/fakture/ponavljajuce");
  revalidatePath("/fakture");
  revalidatePath("/fakture/klijenti");
  return { errors: {}, sacuvano: true };
}

export async function izmeniPonavljajucuAction(
  id: string,
  _prethodnoStanje: PonavljajucaStanje,
  formData: FormData,
): Promise<PonavljajucaStanje> {
  const korisnik = await trenutniKorisnik();
  const podaci = procitajPonavljajucuPodatke(formData);
  const klijent = podaci.clientId ? await getClientForUser(korisnik.id, podaci.clientId) : null;
  const errors = validirajPonavljajucuPodatke(podaci, klijent);
  if (Object.keys(errors).length > 0) return { errors, sacuvano: false };

  const rezultat = await updateRecurringInvoice(korisnik.id, id, podaci);
  if (!rezultat.ok) return { errors: { clientId: rezultat.razlog }, sacuvano: false };

  revalidatePath("/fakture/ponavljajuce");
  revalidatePath("/fakture");
  revalidatePath("/fakture/klijenti");
  return { errors: {}, sacuvano: true };
}

export async function postaviStatusPonavljajuceAction(id: string, status: "aktivna" | "pauzirana") {
  const korisnik = await trenutniKorisnik();
  await postaviStatusPonavljajuce(korisnik.id, id, status);
  revalidatePath("/fakture/ponavljajuce");
}

export async function obrisiPonavljajucuAction(id: string) {
  const korisnik = await trenutniKorisnik();
  await removeRecurringInvoice(korisnik.id, id);
  revalidatePath("/fakture/ponavljajuce");
  revalidatePath("/fakture");
  revalidatePath("/fakture/klijenti");
}
