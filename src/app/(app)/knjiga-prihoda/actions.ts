"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { parseDatumSrpski } from "@/lib/datum";
import { dodajPrihod, ispraviPrihod } from "@/lib/prihodi-db";

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

// "polje" (Korak 9d-2): koje polje je greška - panel prikazuje poruku ISPOD odgovarajućeg polja, ne kao
// jedinstvenu poruku na dnu forme (zadatak). dodajPrihod (prihodi-db.ts, Korak 9d-1) ostaje nepromenjen -
// mapiranje teksta poruke na polje je ovde, u akciji, koja jedina zna redosled/značenje polja forme.
export type DodajPrihodStanje = {
  greska: string | null;
  polje: "datum" | "iznos" | "valuta" | "kurs" | "klijent" | null;
  sacuvano: boolean;
};

function poljeZaGresku(razlog: string): DodajPrihodStanje["polje"] {
  switch (razlog) {
    case "Unesi ispravan datum u formatu dd.mm.gggg.":
    case "Unesi ispravan datum uplate.":
      return "datum";
    case "Iznos mora biti broj veći od 0.":
      return "iznos";
    case "Izaberi valutu.":
      return "valuta";
    case "Kurs mora biti broj veći od 0.":
      return "kurs";
    case "Klijent ne postoji.":
      return "klijent";
    default:
      return null;
  }
}

// Korak 9d-1 (podloga, dugme "Dodaj prihod" je i dalje inertno - povezuje ga tek 9d-2): "datumUplate" u
// istom dd.mm.gggg. formatu kao "Ispravi"/OznaciPlacenomDialog (parseDatumSrpski), "iznos" kao obično
// decimalno polje (npr. "450.00") pretvoreno ovde u najmanju jedinicu (Math.round(x*100) - isti obrazac
// kao stavke fakture, src/app/(app)/fakture/actions.ts). "kurs" parsiran isto kao u ispraviPrihodAction.
export async function dodajPrihodAction(
  _prethodnoStanje: DodajPrihodStanje,
  formData: FormData,
): Promise<DodajPrihodStanje> {
  const korisnik = await trenutniKorisnik();

  const vrsta = formData.get("vrsta") === "devizni" ? "devizni" : "dinarski";
  const datum = parseDatumSrpski(String(formData.get("datumUplate") || ""));
  if (!datum) {
    return {
      greska: "Unesi ispravan datum u formatu dd.mm.gggg.",
      polje: "datum",
      sacuvano: false,
    };
  }

  const clientIdSirovo = String(formData.get("clientId") ?? "").trim();
  const clientId = clientIdSirovo || null;

  const iznosSirovo = formData.get("iznos");
  const iznos =
    iznosSirovo == null || iznosSirovo === ""
      ? NaN
      : Math.round(Number(iznosSirovo) * 100);

  const kursSirovo = formData.get("kurs");
  const kurs =
    kursSirovo == null || kursSirovo === "" ? null : Number(kursSirovo);

  const valuta = String(formData.get("valuta") ?? "");
  const opisSirovo = String(formData.get("opis") ?? "").trim();
  const opis = opisSirovo || null;

  const rezultat = await dodajPrihod(korisnik.id, {
    vrsta,
    datum,
    clientId,
    valuta,
    iznos,
    kurs,
    opis,
  });
  if (!rezultat.ok) {
    return {
      greska: rezultat.razlog,
      polje: poljeZaGresku(rezultat.razlog),
      sacuvano: false,
    };
  }

  revalidatePath("/knjiga-prihoda");
  return { greska: null, polje: null, sacuvano: true };
}
