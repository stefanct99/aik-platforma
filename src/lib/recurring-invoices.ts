// Ponavljajuće fakture (Korak 8c, spec 3.5/6.8, frejmovi Fak13/Fak14/Fak16). Firma se, kao svuda, uzima
// ISKLJUČIVO preko getBusinessForUser (userId), nikad preko id-a iz forme (vidi clients.ts/invoices.ts).

import { prisma } from "./prisma";
import { getBusinessForUser } from "./business";
import { createInvoiceWithHistory, sendInvoice } from "./invoices";
import { prviDatumOdPocetka, proveriPonavljanje } from "./recurring-status";
import { pocetakDanaUtc } from "./datum";

export type PonavljajucaPodaci = {
  clientId: string;
  desc: string | null;
  amount: number | null; // u najmanjoj jedinici valute, null = "Iznos se upisuje pri slanju"
  dayOfMonth: number;
  startDate: Date;
  endDate: Date | null;
  mode: "ask" | "auto";
};

export type GreskePonavljajuce = Partial<Record<"clientId" | "dayOfMonth" | "startDate" | "endDate" | "mode", string>>;

// Validacija forme Nova/Uredi ponavljajuća faktura (Fak14). Dve dodatne provere NISU u frejmu ni u
// specifikaciji - dodate po zadatku Koraka 8c, tačka 2: klijent bez podrazumevane cene (amount praznog
// u formi, ne klijentovog defaultItemAmount - korisnik ga svaki put otkucava/menja) NE SME na "auto"
// (mora da pregleda iznos pre slanja), i klijent bez sačuvanog mejla NE SME na "auto" (nema kome da se
// pošalje automatski).
export function validirajPonavljajucuPodatke(
  podaci: PonavljajucaPodaci,
  klijent: { billingEmail: string | null } | null,
): GreskePonavljajuce {
  const errors: GreskePonavljajuce = {};
  if (!podaci.clientId) errors.clientId = "Izaberi klijenta.";
  if (!Number.isInteger(podaci.dayOfMonth) || podaci.dayOfMonth < 1 || podaci.dayOfMonth > 31) {
    errors.dayOfMonth = "Dan u mesecu mora biti između 1 i 31.";
  }
  if (!podaci.startDate || Number.isNaN(podaci.startDate.getTime())) errors.startDate = "Unesi datum početka.";
  if (podaci.endDate && podaci.startDate && podaci.endDate.getTime() < podaci.startDate.getTime()) {
    errors.endDate = "Datum završetka ne može biti pre datuma početka.";
  }
  if (podaci.mode === "auto" && podaci.amount == null) {
    errors.mode = "Klijent nema podrazumevanu cenu - ova ponavljajuća faktura mora da traži odobrenje.";
  }
  if (podaci.mode === "auto" && !klijent?.billingEmail) {
    errors.mode = "Klijent nema sačuvan mejl - automatsko slanje nema kome da ide, izaberi 'Traži odobrenje'.";
  }
  return errors;
}

function ukljuciKlijenta() {
  return { client: true } as const;
}

export async function getRecurringInvoicesForUser(userId: string) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return [];
  return prisma.recurringInvoice.findMany({
    where: { businessId: biznis.id },
    include: ukljuciKlijenta(),
    orderBy: { createdAt: "asc" },
  });
}

export async function getRecurringInvoiceForUser(userId: string, id: string) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return null;
  return prisma.recurringInvoice.findFirst({ where: { id, businessId: biznis.id }, include: ukljuciKlijenta() });
}

async function nadjiPonavljajucuKorisnika(userId: string, id: string) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return null;
  return prisma.recurringInvoice.findFirst({ where: { id, businessId: biznis.id } });
}

export async function createRecurringInvoice(userId: string, podaci: PonavljajucaPodaci) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) throw new Error("Firma ne postoji.");
  const sledeciDatum = prviDatumOdPocetka(pocetakDanaUtc(podaci.startDate), podaci.dayOfMonth);
  return prisma.recurringInvoice.create({
    data: {
      businessId: biznis.id,
      clientId: podaci.clientId,
      desc: podaci.desc,
      amount: podaci.amount,
      dayOfMonth: podaci.dayOfMonth,
      startDate: pocetakDanaUtc(podaci.startDate),
      endDate: podaci.endDate ? pocetakDanaUtc(podaci.endDate) : null,
      mode: podaci.mode,
      nextDate: sledeciDatum,
    },
  });
}

export type AzuriranjePonavljajuceRezultat = { ok: true } | { ok: false; razlog: string };

// Izmena (Fak14 "Uredi"): nextDate (sledeći datum generisanja) se NE dira ovde, bez obzira šta se
// menja - ostaje tačno onaj datum koji je već zakazan (napravljen pri createRecurringInvoice ili
// pomeren pri generisanju). Ovo nije pokriveno frejmom ni zadatkom izričito - odluka implementacije,
// da izmena opisa/iznosa/režima ne pomera već napravljen raspored unazad ili unapred. Prijavljeno u
// izveštaju kao otvorena odluka.
export async function updateRecurringInvoice(
  userId: string,
  id: string,
  podaci: PonavljajucaPodaci,
): Promise<AzuriranjePonavljajuceRezultat> {
  const postojeca = await nadjiPonavljajucuKorisnika(userId, id);
  if (!postojeca) return { ok: false, razlog: "Ponavljajuća faktura ne postoji." };

  await prisma.recurringInvoice.update({
    where: { id },
    data: {
      clientId: podaci.clientId,
      desc: podaci.desc,
      amount: podaci.amount,
      dayOfMonth: podaci.dayOfMonth,
      startDate: pocetakDanaUtc(podaci.startDate),
      endDate: podaci.endDate ? pocetakDanaUtc(podaci.endDate) : null,
      mode: podaci.mode,
    },
  });
  return { ok: true };
}

// Pauziraj/Nastavi (spec 6.8 tačka 4): "Status Pauzirana zaustavlja generisanje bez brisanja."
export async function postaviStatusPonavljajuce(
  userId: string,
  id: string,
  status: "aktivna" | "pauzirana",
): Promise<AzuriranjePonavljajuceRezultat> {
  const postojeca = await nadjiPonavljajucuKorisnika(userId, id);
  if (!postojeca) return { ok: false, razlog: "Ponavljajuća faktura ne postoji." };
  await prisma.recurringInvoice.update({ where: { id }, data: { status } });
  return { ok: true };
}

export async function removeRecurringInvoice(userId: string, id: string): Promise<AzuriranjePonavljajuceRezultat> {
  const postojeca = await nadjiPonavljajucuKorisnika(userId, id);
  if (!postojeca) return { ok: false, razlog: "Ponavljajuća faktura ne postoji." };
  await prisma.recurringInvoice.delete({ where: { id } });
  return { ok: true };
}

export type GenerisanCiklus = {
  recurringInvoiceId: string;
  clientName: string;
  invoiceId: string;
  broj: string;
  nacin: "nacrt" | "poslata";
  razlogNacrta?: string; // kad je mode "auto" ali je slanje ipak preskočeno (npr. klijent izgubio mejl u međuvremenu)
};

// Generisanje (spec 6.8 tačka 3, zadatak tačka 7): za SVAKU aktivnu ponavljajuću fakturu firme, provери
// je li due na dan `danasnjiDatum` (proveriPonavljanje, najviše jedan ciklus po pozivu - "nadoknada
// propuštenih dana, bez duplikata"). mode "ask" -> napravi NACRT, samo štampa u terminal (zadatak
// tačka 9: "stavke 'poslato mi je obaveštenje' NIJE deo ovog koraka" - zvonce/kalendar OSTAJU neaktivni,
// jedino terminalski ispis je u obimu). mode "auto" -> napravi nacrt i ODMAH ga pošalje (isti sendInvoice
// tok kao ručno slanje - "jedan izvor istine", zadatak tačka 7). Ako klijent u međuvremenu izgubi mejl
// (obrisan posle čuvanja na "auto"), slanje se bezbedno vraća na nacrt umesto da baci grešku - ne gubi
// se ciklus, samo ostaje da čeka ručno slanje, prijavljeno u razlogNacrta.
export async function generisiPonavljajuceFakture(userId: string, danasnjiDatum: Date): Promise<GenerisanCiklus[]> {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return [];
  const danas = pocetakDanaUtc(danasnjiDatum);

  const sve = await prisma.recurringInvoice.findMany({ where: { businessId: biznis.id }, include: ukljuciKlijenta() });
  const rezultati: GenerisanCiklus[] = [];

  for (const r of sve) {
    const provera = proveriPonavljanje(
      {
        danUMesecu: r.dayOfMonth,
        sledeciDatum: pocetakDanaUtc(r.nextDate),
        krajnjiDatum: r.endDate ? pocetakDanaUtc(r.endDate) : null,
        status: r.status as "aktivna" | "pauzirana",
      },
      danas,
    );
    if (!provera.trebaGenerisati) continue;

    const faktura = await createInvoiceWithHistory(biznis.id, {
      clientId: r.clientId,
      currency: r.client.defaultCurrency,
      lang: (r.client.defaultLang as "sr" | "en") ?? "sr",
      issueDate: provera.datumFakture,
      dueDays: r.client.defaultDueDays,
      accountId: r.client.defaultAccountId,
      items: [{ desc: r.desc || "Usluga", qty: 1, price: r.amount ?? 0 }],
      status: "nacrt",
    });

    let nacin: GenerisanCiklus["nacin"] = "nacrt";
    let razlogNacrta: string | undefined;
    if (r.mode === "auto") {
      const posalji = await sendInvoice(userId, faktura.id);
      if (posalji.ok) nacin = "poslata";
      else razlogNacrta = posalji.razlog;
    }

    await prisma.recurringInvoice.update({ where: { id: r.id }, data: { nextDate: provera.noviSledeciDatum } });

    rezultati.push({
      recurringInvoiceId: r.id,
      clientName: r.client.name,
      invoiceId: faktura.id,
      broj: faktura.number,
      nacin,
      razlogNacrta,
    });
  }

  return rezultati;
}
