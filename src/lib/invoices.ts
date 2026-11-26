// Fakture (Korak 8a, spec 3.4, 7.3, 7.5). Firma se, kao svuda, uzima ISKLJUČIVO preko
// getBusinessForUser(userId), nikad preko id-a iz forme/URL-a, da korisnik A ne može da vidi ni menja
// fakture korisnika B.

import { prisma } from "./prisma";
import { getBusinessForUser } from "./business";
import { formatBrojFakture, parseBrojFakture } from "./invoice-numbering";
import { izracunajUkupno, rokFakture } from "./invoice-status";
import { pocetakDanaUtc } from "./datum";
import { posaljiRazvojniMejl } from "./mail";

export type StavkaUnos = { desc: string; qty: number; price: number };

// Pregled sledećeg broja PRE čuvanja (Korak 8b, forma Nova faktura): čita brojač bez pisanja, da forma
// odmah prikaže predlog broja (frejmovi Fak3/9/20 ga uvek prikazuju popunjenog) - broj se STVARNO
// rezerviše tek pri prvom čuvanju nacrta ili slanju (createInvoiceWithHistory), kao do sada.
export async function pogledajSledeciBroj(businessId: string, datumIzdavanja: Date): Promise<string> {
  const godina = datumIzdavanja.getUTCFullYear();
  const brojac = await prisma.invoiceCounter.findUnique({ where: { businessId_year: { businessId, year: godina } } });
  return formatBrojFakture((brojac?.lastNumber ?? 0) + 1, datumIzdavanja);
}

export type GreskeFaktureForme = Partial<Record<"clientId" | "items" | "dueDays", string>>;

// Validacija forme Nova faktura (Korak 8b, spec 7.4, frejm Fak19) - zajedničko za čuvanje nacrta (gde se
// NE primenjuje, nacrt sme da bude nepotpun) i slanje (gde MORA da prođe bez grešaka).
export function validirajFakturuPolja(podaci: {
  clientId: string | null;
  items: StavkaUnos[];
  dueDays: number;
}): GreskeFaktureForme {
  const errors: GreskeFaktureForme = {};
  if (!podaci.clientId) errors.clientId = "Izaberi klijenta kome šalješ fakturu.";
  if (!podaci.items.some((st) => st.desc.trim() && st.price > 0)) {
    errors.items = "Upiši opis stavke i iznos veći od 0.";
  }
  if (!Number.isFinite(podaci.dueDays) || podaci.dueDays < 1) {
    errors.dueDays = "Rok plaćanja mora biti bar 1 dan.";
  }
  return errors;
}

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
    // Klijent bez sačuvanog mejla (zadatak Korak 8b ispravka) - nema kome da se pošalje, obaveštenje se
    // tiho preskače (storniranje samo po sebi i dalje uspeva, to nije deo ovog zahteva).
    if (klijent?.billingEmail) {
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
  if (klijent?.billingEmail) {
    await posaljiRazvojniMejl(
      klijent.billingEmail,
      `Reminder: invoice ${faktura.number}`,
      `Podsetnik: faktura ${faktura.number} čeka uplatu. U prilogu je PDF fakture (razvojni režim: prilog se ne generiše stvarno).`,
    );
  }
  return true;
}

export type PodaciIzmeneFakture = {
  clientId: string;
  currency: string;
  lang: "sr" | "en";
  dueDays: number;
  accountId?: string | null;
  note?: string | null;
  items: StavkaUnos[];
};

export type AzuriranjeFaktureRezultat = { ok: true } | { ok: false; razlog: string };

// Izmena postojeće fakture (Korak 8b): koristi i autosave/"Sačuvaj nacrt" nad VEĆ sačuvanim nacrtom, i
// "Izmeni fakturu" nad već poslatom (spec 6.9: dozvoljeno, uz upozorenje u formi - ovde se samo primenjuje
// izmena). Broj, status, issueDate i istorijski datumi se NE diraju ovde - issueDate i broj su zaključani
// od prvog čuvanja (spec 7.4: "broj... rezerviše tek pri slanju ili čuvanju nacrta, ne pri otvaranju
// forme"), status/sentAt menjaju isključivo sendInvoice/markInvoicePaid/voidInvoice.
export async function updateInvoiceWithItems(
  userId: string,
  invoiceId: string,
  podaci: PodaciIzmeneFakture,
): Promise<AzuriranjeFaktureRezultat> {
  const faktura = await nadjiFakturuKorisnika(userId, invoiceId);
  if (!faktura) return { ok: false, razlog: "Faktura ne postoji." };
  if (faktura.status === "placena" || faktura.status === "stornirana") {
    return { ok: false, razlog: "Plaćena ili stornirana faktura ne može da se menja." };
  }

  await prisma.$transaction([
    prisma.invoiceItem.deleteMany({ where: { invoiceId } }),
    prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        clientId: podaci.clientId,
        currency: podaci.currency,
        lang: podaci.lang,
        dueDays: podaci.dueDays,
        accountId: podaci.accountId ?? null,
        note: podaci.note ?? null,
        items: {
          create: podaci.items.map((st, i) => ({ desc: st.desc, qty: st.qty, price: st.price, redosled: i })),
        },
      },
    }),
  ]);

  return { ok: true };
}

export type NacrtRezultat = { ok: true; id: string; broj: string } | { ok: false; razlog: string };

// Čuva nacrt - pravi novu fakturu (prvi put, broj se tad rezerviše) ili ažurira postojeću (bez diranja
// broja). Koristi i automatsko čuvanje i dugme "Sačuvaj nacrt" (Korak 8b, tačka 3).
export async function sacuvajNacrt(
  userId: string,
  postojeciId: string | null,
  podaci: PodaciIzmeneFakture,
): Promise<NacrtRezultat> {
  if (postojeciId) {
    const rezultat = await updateInvoiceWithItems(userId, postojeciId, podaci);
    if (!rezultat.ok) return rezultat;
    const osvezena = await nadjiFakturuKorisnika(userId, postojeciId);
    if (!osvezena) return { ok: false, razlog: "Faktura ne postoji." };
    return { ok: true, id: osvezena.id, broj: osvezena.number };
  }

  const biznis = await getBusinessForUser(userId);
  if (!biznis) return { ok: false, razlog: "Firma ne postoji." };

  const faktura = await createInvoiceWithHistory(biznis.id, {
    clientId: podaci.clientId,
    currency: podaci.currency,
    lang: podaci.lang,
    issueDate: pocetakDanaUtc(),
    dueDays: podaci.dueDays,
    accountId: podaci.accountId,
    note: podaci.note,
    items: podaci.items,
    status: "nacrt",
  });
  return { ok: true, id: faktura.id, broj: faktura.number };
}

export type SlanjePodaci = {
  id: string;
  broj: string;
  klijentIme: string;
  billingEmail: string;
  ukupno: number;
  valuta: string;
  rok: Date;
};

export type SlanjeFaktureRezultat = { ok: true; podaci: SlanjePodaci } | { ok: false; razlog: string };

// Slanje fakture (Korak 8b, spec 8.1, tačka 6): atomski prelaz nacrt->poslata preko updateMany sa
// WHERE status='nacrt' - ako je faktura u međuvremenu (dupli klik) VEĆ poslata, count je 0 i mejl se NE
// šalje ponovo (bez dvostrukog mejla), ali se potvrda ipak vraća korisniku kao uspeh. Mejl servis još ne
// postoji (zadatak, tačka 6) - koristi se ista razvojna funkcija kao svuda u aplikaciji (posaljiRazvojniMejl),
// koja samo ispisuje "[RAZVOJNI REŽIM]" u terminal.
// prijemnaAdresa (zadatak Korak 8b ispravka, tačka 4): kad klijent nema sačuvan mejl, ekran slanja trazi
// RUČAN unos adrese pre slanja - ovde se samo koristi za TU jednu poruku, ne čuva se trajno na klijentu
// (korisnik nije tražio da se profil klijenta menja usput).
export async function sendInvoice(
  userId: string,
  invoiceId: string,
  prijemnaAdresa?: string,
): Promise<SlanjeFaktureRezultat> {
  const faktura = await nadjiFakturuKorisnika(userId, invoiceId);
  if (!faktura) return { ok: false, razlog: "Faktura ne postoji." };
  if (faktura.status !== "nacrt" && faktura.status !== "poslata") {
    return { ok: false, razlog: "Faktura ne može da se pošalje u ovom stanju." };
  }

  const postojeca = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { client: true } });
  const adresaZaSlanje = postojeca.client.billingEmail?.trim() || prijemnaAdresa?.trim();
  if (!adresaZaSlanje || !adresaZaSlanje.includes("@")) {
    return { ok: false, razlog: "Klijent nema sačuvan mejl - upiši ispravnu adresu pre slanja." };
  }

  const sad = new Date();
  if (faktura.status === "nacrt") {
    const rezultat = await prisma.invoice.updateMany({
      where: { id: invoiceId, status: "nacrt" },
      data: { status: "poslata", sentAt: sad },
    });
    if (rezultat.count === 1) {
      await prisma.invoiceEvent.create({ data: { invoiceId, tip: "poslata", datum: sad } });
    }
  }

  const puna = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { client: true, items: true, business: true },
  });

  if (faktura.status === "nacrt") {
    const imeFirme = `${(puna.business.ownerName || "").trim()} ${puna.business.name}`.trim();
    await posaljiRazvojniMejl(
      adresaZaSlanje,
      `Invoice ${puna.number} from ${imeFirme}`,
      `Faktura ${puna.number} je poslata. PDF: /api/fakture/${puna.id}/pdf (razvojni režim: prilog se ne šalje stvarno).`,
    );
  }

  return {
    ok: true,
    podaci: {
      id: puna.id,
      broj: puna.number,
      klijentIme: puna.client.name,
      billingEmail: adresaZaSlanje,
      ukupno: izracunajUkupno(puna.items),
      valuta: puna.currency,
      rok: rokFakture(puna.issueDate, puna.dueDays),
    },
  };
}

// "Pošalji ponovo" (Korak 8d ispravka, zadatak tačka 3) - za VEĆ poslatu ili plaćenu fakturu: isti ekran
// slanja (ista komponenta InvoiceSendStage, rezim="ponovo"), ali ovo NIJE prvo slanje (sendInvoice) - broj,
// status, rok i stavke se uopšte ne diraju (nema sacuvajNacrt/updateMany prelaza statusa), samo se upiše
// NOVI događaj u Istoriju i ponovo pošalje razvojni mejl. Prototip/okviri Fak11/Fak12 ne definišu ponašanje
// za ponovno slanje (prototip "Pošalji ponovo" je samo toast bez stvarnog toka) - ovo je napravljeno tačno
// po opisu iz zadatka.
export async function resendInvoice(
  userId: string,
  invoiceId: string,
  prijemnaAdresa?: string,
): Promise<SlanjeFaktureRezultat> {
  const faktura = await nadjiFakturuKorisnika(userId, invoiceId);
  if (!faktura) return { ok: false, razlog: "Faktura ne postoji." };
  if (faktura.status !== "poslata" && faktura.status !== "placena") {
    return { ok: false, razlog: "Faktura mora prvo da bude poslata." };
  }

  const puna = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { client: true, items: true, business: true },
  });
  const adresaZaSlanje = puna.client.billingEmail?.trim() || prijemnaAdresa?.trim();
  if (!adresaZaSlanje || !adresaZaSlanje.includes("@")) {
    return { ok: false, razlog: "Klijent nema sačuvan mejl - upiši ispravnu adresu pre slanja." };
  }

  const sad = new Date();
  await prisma.invoiceEvent.create({ data: { invoiceId, tip: "ponovo_poslata", datum: sad } });

  const imeFirme = `${(puna.business.ownerName || "").trim()} ${puna.business.name}`.trim();
  await posaljiRazvojniMejl(
    adresaZaSlanje,
    `Invoice ${puna.number} from ${imeFirme}`,
    `Faktura ${puna.number} je ponovo poslata. PDF: /api/fakture/${puna.id}/pdf (razvojni režim: prilog se ne šalje stvarno).`,
  );

  return {
    ok: true,
    podaci: {
      id: puna.id,
      broj: puna.number,
      klijentIme: puna.client.name,
      billingEmail: adresaZaSlanje,
      ukupno: izracunajUkupno(puna.items),
      valuta: puna.currency,
      rok: rokFakture(puna.issueDate, puna.dueDays),
    },
  };
}

export type PromenaBrojaRezultat = { ok: true } | { ok: false; razlog: string };

// Ručna promena broja (spec 8.2, zadatak tačka 5): format + jedinstvenost unutar firme. Godina i mesec u
// unetom broju moraju odgovarati STVARNOM datumu izdavanja (broj je po definiciji vezan za taj datum -
// vidi formatBrojFakture), inače bi ručni unos mogao da napravi besmislen broj. Ako je uneti redni broj
// veći od trenutnog brojača za tu godinu, brojač se pomera napred da budući automatski brojevi ne upadnu
// u isti broj kasnije (najbolji napor - nije atomski protiv istovremene ručne izmene, retka akcija).
export async function promeniBrojFakture(
  userId: string,
  invoiceId: string,
  noviBroj: string,
): Promise<PromenaBrojaRezultat> {
  const faktura = await nadjiFakturuKorisnika(userId, invoiceId);
  if (!faktura) return { ok: false, razlog: "Faktura ne postoji." };
  if (faktura.status === "placena" || faktura.status === "stornirana") {
    return { ok: false, razlog: "Broj ne može da se menja na plaćenoj ili storniranoj fakturi." };
  }

  const parsirano = parseBrojFakture(noviBroj);
  if (!parsirano) return { ok: false, razlog: "Broj mora biti u obliku N/GG-M, na primer 25/26-11." };

  const godina = faktura.issueDate.getUTCFullYear();
  const ocekivanaGodina2 = String(godina).slice(-2);
  const ocekivaniMesec = faktura.issueDate.getUTCMonth() + 1;
  if (parsirano.godina2 !== ocekivanaGodina2 || parsirano.mesec !== ocekivaniMesec) {
    return {
      ok: false,
      razlog: `Godina i mesec u broju moraju odgovarati datumu izdavanja (${ocekivanaGodina2}-${ocekivaniMesec}).`,
    };
  }

  const slobodan = await proveriJedinstvenostBroja(faktura.businessId, noviBroj, faktura.id);
  if (!slobodan) return { ok: false, razlog: `Broj ${noviBroj} je već zauzet.` };

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({ where: { id: faktura.id }, data: { number: noviBroj } });
    const trenutni = await tx.invoiceCounter.findUnique({
      where: { businessId_year: { businessId: faktura.businessId, year: godina } },
    });
    if ((trenutni?.lastNumber ?? 0) < parsirano.redniBroj) {
      await tx.invoiceCounter.upsert({
        where: { businessId_year: { businessId: faktura.businessId, year: godina } },
        update: { lastNumber: parsirano.redniBroj },
        create: { businessId: faktura.businessId, year: godina, lastNumber: parsirano.redniBroj },
      });
    }
  });

  return { ok: true };
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
