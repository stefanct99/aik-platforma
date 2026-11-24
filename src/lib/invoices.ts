// Fakture (Korak 8a, spec 3.4, 7.3, 7.5). Firma se, kao svuda, uzima ISKLJUČIVO preko
// getBusinessForUser(userId), nikad preko id-a iz forme/URL-a, da korisnik A ne može da vidi ni menja
// fakture korisnika B.

import { prisma } from "./prisma";
import { getBusinessForUser } from "./business";
import { formatBrojFakture, parseBrojFakture } from "./invoice-numbering";
import { posaljiRazvojniMejl } from "./mail";

export type StavkaUnos = { desc: string; qty: number; price: number };

// Atomski sledeći broj za firmu i GODINU IZDAVANJA (ne "danas") - jedna SQL izjava (INSERT ... ON
// CONFLICT DO UPDATE ... RETURNING), pa dve istovremene fakture ne mogu dobiti isti broj (@@id na
// InvoiceCounter je jedinstveno ograničenje iz zadatka). Mora da se zove UNUTAR iste transakcije u kojoj
// se faktura upisuje, inače rezervisan broj može ostati "vezan" ni za šta ako upis fakture posle pukne.
async function rezervisiSledeciBroj(
  tx: Pick<typeof prisma, "$queryRaw">,
  businessId: string,
  datumIzdavanja: Date,
): Promise<string> {
  const godina = datumIzdavanja.getUTCFullYear();
  const red = await tx.$queryRaw<{ lastNumber: number }[]>`
    INSERT INTO "invoice_counter" ("businessId", "year", "lastNumber")
    VALUES (${businessId}, ${godina}, 1)
    ON CONFLICT ("businessId", "year")
    DO UPDATE SET "lastNumber" = "invoice_counter"."lastNumber" + 1
    RETURNING "lastNumber"`;
  return formatBrojFakture(red[0].lastNumber, datumIzdavanja);
}

export async function proveriJedinstvenostBroja(
  businessId: string,
  broj: string,
  excludeInvoiceId?: string,
): Promise<boolean> {
  const postojeca = await prisma.invoice.findFirst({
    where: { businessId, number: broj, ...(excludeInvoiceId ? { id: { not: excludeInvoiceId } } : {}) },
  });
  return !postojeca;
}

export type NovaFakturaPodaci = {
  clientId: string;
  currency: string;
  lang: "sr" | "en";
  issueDate: Date;
  dueDays: number;
  accountId?: string | null;
  note?: string | null;
  items: StavkaUnos[];
  // Status i istorijski datumi: za seed podatke (razvojni seed pravi fakture koje su "oduvek" u datom
  // stanju) i za buduću formu (Korak 8b), koja uvek počinje od "nacrt".
  status: "nacrt" | "poslata" | "placena" | "stornirana";
  sentAt?: Date;
  paidDate?: Date;
  voidedAt?: Date;
};

// Pravi fakturu SA ODGOVARAJUĆOM istorijom (InvoiceEvent) za zadati status - koristi i buduća forma
// (8b, uvek status:"nacrt") i razvojni seed (scripts/seed-fakture.ts, svi statusi odjednom).
export async function createInvoiceWithHistory(businessId: string, podaci: NovaFakturaPodaci) {
  return prisma.$transaction(async (tx) => {
    const broj = await rezervisiSledeciBroj(tx, businessId, podaci.issueDate);

    const faktura = await tx.invoice.create({
      data: {
        businessId,
        clientId: podaci.clientId,
        number: broj,
        currency: podaci.currency,
        lang: podaci.lang,
        issueDate: podaci.issueDate,
        dueDays: podaci.dueDays,
        accountId: podaci.accountId ?? null,
        note: podaci.note ?? null,
        status: podaci.status,
        sentAt: podaci.sentAt ?? null,
        paidDate: podaci.paidDate ?? null,
        voidedAt: podaci.voidedAt ?? null,
        items: {
          create: podaci.items.map((st, i) => ({
            desc: st.desc,
            qty: st.qty,
            price: st.price,
            redosled: i,
          })),
        },
      },
    });

    const dogadjaji: { tip: string; datum: Date }[] = [{ tip: "napravljena", datum: podaci.issueDate }];
    if (podaci.status !== "nacrt") dogadjaji.push({ tip: "poslata", datum: podaci.sentAt ?? podaci.issueDate });
    if (podaci.status === "placena") dogadjaji.push({ tip: "placena", datum: podaci.paidDate! });
    if (podaci.status === "stornirana") dogadjaji.push({ tip: "stornirana", datum: podaci.voidedAt! });
    await tx.invoiceEvent.createMany({
      data: dogadjaji.map((d) => ({ invoiceId: faktura.id, tip: d.tip, datum: d.datum })),
    });

    if (podaci.status === "placena") {
      const ukupno = podaci.items.reduce((z, st) => z + (st.qty || 1) * (st.price || 0), 0);
      await tx.income.create({
        data: {
          businessId,
          invoiceId: faktura.id,
          date: podaci.paidDate!,
          currency: podaci.currency,
          amount: ukupno,
          kind: podaci.currency === "RSD" ? "dinarski" : "devizni",
          source: "rucno",
        },
      });
    }

    return faktura;
  });
}

function ukljuciSve() {
  return {
    client: true,
    account: true,
    items: { orderBy: { redosled: "asc" as const } },
    events: { orderBy: { datum: "asc" as const } },
    incomes: true,
  };
}

export async function getInvoicesForUser(userId: string) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return [];
  return prisma.invoice.findMany({
    where: { businessId: biznis.id },
    include: { client: true, items: true },
    orderBy: { issueDate: "desc" },
  });
}

export async function getInvoiceForUser(userId: string, invoiceId: string) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return null;
  return prisma.invoice.findFirst({
    where: { id: invoiceId, businessId: biznis.id },
    include: ukljuciSve(),
  });
}

async function nadjiFakturuKorisnika(userId: string, invoiceId: string) {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return null;
  return prisma.invoice.findFirst({ where: { id: invoiceId, businessId: biznis.id } });
}

export type OznaciPlacenomRezultat = { ok: true } | { ok: false; razlog: string };

// Ručno "Označi kao plaćenu" (spec 6.7, tačka 4): dozvoljeno kad uplata nije stigla preko mejla banke.
// Pravi Income zapis sa izvorom "rucno".
export async function markInvoicePaid(
  userId: string,
  invoiceId: string,
  datumUplate: Date,
): Promise<OznaciPlacenomRezultat> {
  const faktura = await nadjiFakturuKorisnika(userId, invoiceId);
  if (!faktura) return { ok: false, razlog: "Faktura ne postoji." };
  if (faktura.status === "stornirana") return { ok: false, razlog: "Stornirana faktura ne može da se označi kao plaćena." };
  if (faktura.status === "placena") return { ok: false, razlog: "Faktura je već plaćena." };

  const stavke = await prisma.invoiceItem.findMany({ where: { invoiceId: faktura.id } });
  const ukupno = stavke.reduce((z, st) => z + st.qty * st.price, 0);

  await prisma.$transaction([
    prisma.invoice.update({ where: { id: faktura.id }, data: { status: "placena", paidDate: datumUplate } }),
    prisma.invoiceEvent.create({ data: { invoiceId: faktura.id, tip: "placena", datum: datumUplate } }),
    prisma.income.create({
      data: {
        businessId: faktura.businessId,
        invoiceId: faktura.id,
        date: datumUplate,
        currency: faktura.currency,
        amount: ukupno,
        kind: faktura.currency === "RSD" ? "dinarski" : "devizni",
        source: "rucno",
      },
    }),
  ]);

  return { ok: true };
}

export type StorniranjeRezultat =
  | { ok: true }
  | { ok: false; razlog: "vec_stornirana" | "ne_postoji" }
  | { ok: false; razlog: "placena_treba_potvrdu" };

// Storniranje (spec 6.9): "Ako je faktura već plaćena, storniranje zahteva dodatnu potvrdu da se uplata
// uklanja iz prihoda" - u 8a NE dozvoljavamo direktno storno plaćene fakture (blokiramo i objašnjavamo),
// vodič za povraćaj/storno+nova faktura je van obima ovog koraka (nema chat/AI tok još).
export async function voidInvoice(
  userId: string,
  invoiceId: string,
  obavestiMejlom: boolean,
): Promise<StorniranjeRezultat> {
  const faktura = await nadjiFakturuKorisnika(userId, invoiceId);
  if (!faktura) return { ok: false, razlog: "ne_postoji" };
  if (faktura.status === "stornirana") return { ok: false, razlog: "vec_stornirana" };
  if (faktura.status === "placena") return { ok: false, razlog: "placena_treba_potvrdu" };

  const sad = new Date();
  await prisma.$transaction([
    prisma.invoice.update({
      where: { id: faktura.id },
      data: { status: "stornirana", voidedAt: sad, voidNotifyClient: obavestiMejlom },
    }),
    prisma.invoiceEvent.create({ data: { invoiceId: faktura.id, tip: "stornirana", datum: sad } }),
  ]);

  if (obavestiMejlom) {
    const klijent = await prisma.client.findUnique({ where: { id: faktura.clientId } });
    if (klijent) {
      await posaljiRazvojniMejl(
        klijent.billingEmail,
        `Faktura ${faktura.number} je stornirana`,
        `Faktura ${faktura.number} je stornirana i više ne važi.`,
      );
    }
  }

  return { ok: true };
}

export async function sendReminder(userId: string, invoiceId: string): Promise<boolean> {
  const faktura = await nadjiFakturuKorisnika(userId, invoiceId);
  if (!faktura) return false;

  const klijent = await prisma.client.findUnique({ where: { id: faktura.clientId } });
  const sad = new Date();
  await prisma.$transaction([
    prisma.invoiceEvent.create({ data: { invoiceId: faktura.id, tip: "podsetnik_poslat", datum: sad } }),
  ]);
  if (klijent) {
    await posaljiRazvojniMejl(
      klijent.billingEmail,
      `Reminder: invoice ${faktura.number}`,
      `Podsetnik: faktura ${faktura.number} čeka uplatu. U prilogu je PDF fakture (razvojni režim: prilog se ne generiše stvarno).`,
    );
  }
  return true;
}

export type BrisanjeNacrtaRezultat = { ok: true } | { ok: false; razlog: string };

// Brisanje nacrta (spec 8.2): broj se vraća u optok SAMO ako je bio poslednji dodeljen u toj godini -
// CAS (compare-and-swap) preko WHERE lastNumber=očekivano u updateMany, da konkurentno dodeljen noviji
// broj ne bude "pojeden" netačnim vraćanjem.
export async function removeDraftInvoice(userId: string, invoiceId: string): Promise<BrisanjeNacrtaRezultat> {
  const faktura = await nadjiFakturuKorisnika(userId, invoiceId);
  if (!faktura) return { ok: false, razlog: "Faktura ne postoji." };
  if (faktura.status !== "nacrt") return { ok: false, razlog: "Samo nacrt može da se obriše ovde." };

  const parsirano = parseBrojFakture(faktura.number);

  await prisma.$transaction(async (tx) => {
    await tx.invoice.delete({ where: { id: faktura.id } });
    if (parsirano) {
      const godina = faktura.issueDate.getUTCFullYear();
      await tx.invoiceCounter.updateMany({
        where: { businessId: faktura.businessId, year: godina, lastNumber: parsirano.redniBroj },
        data: { lastNumber: { decrement: 1 } },
      });
    }
  });

  return { ok: true };
}
