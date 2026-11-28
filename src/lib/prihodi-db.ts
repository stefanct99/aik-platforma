// Knjiga prihoda (Korak 9a) - deo koji dotiče bazu, odvojen od prihodi.ts (čiste funkcije) iz istog
// razloga kao invoice-templates-db.ts/invoice-templates.ts: KnjigaPrihodaTab.tsx je klijentska komponenta
// i uvozi prihodi.ts direktno - uvoz Prisma klijenta tamo bi slomio build.
import { prisma } from "./prisma";
import { getBusinessForUser } from "./business";
import { izracunajIznosRsd, type PrihodRed } from "./prihodi";

// Devizni: Income.amountRsd/rate su null dok kurs nije upisan (ručno, Korak 9b - nema još NBS
// integracije, videti schema.prisma). Dinarski NEMA kurs - RSD protivvrednost je trivijalno jednaka
// iznosu, zato se ovde IZVODI, ne čita se iz baze.
//
// Klijent (Korak 9d-1): kad postoji faktura, klijent se čita preko nje (invoice.client) - isto kao do
// sada. Ručni prihod BEZ fakture ("Dodaj prihod") nema fakturu da bi klijenta izvukao preko nje, zato
// čita direktno Income.clientId/client. Kad nema NI jedno (klijent nepoznat/obrisan), klijentIme je
// tekst "Nije poznat" (zadatak, ne prazno/"–" kao što UI inače prikazuje za null - namerno drugačije:
// ovo NIJE "podatak koji nedostaje" kao kod drugih null polja, nego stvarna, imenovana vrednost iz
// prototipa/okvira AddIncomeModal-a, "Nije poznat" je prva stavka padajućeg menija Klijent).
function uPrihodRed(red: {
  id: string;
  date: Date;
  currency: string;
  amount: number;
  rate: number | null;
  amountRsd: number | null;
  source: string;
  kind: string;
  description: string | null;
  invoiceId: string | null;
  invoice: {
    number: string;
    clientId: string;
    client: { name: string };
  } | null;
  clientId: string | null;
  client: { name: string } | null;
}): PrihodRed {
  const vrsta = red.kind === "dinarski" ? "dinarski" : "devizni";
  return {
    id: red.id,
    datumIso: red.date.toISOString(),
    valuta: red.currency,
    vrsta,
    iznos: red.amount,
    kurs: red.rate,
    iznosRsd: vrsta === "dinarski" ? red.amount : red.amountRsd,
    izvor: red.source === "mejl_banke" ? "mejl_banke" : "rucno",
    fakturaId: red.invoiceId,
    brojFakture: red.invoice?.number ?? null,
    klijentId: red.invoice?.clientId ?? red.clientId ?? null,
    klijentIme: red.invoice?.client.name ?? red.client?.name ?? "Nije poznat",
    opis: red.description,
  };
}

export async function getPrihodiZaKorisnika(
  userId: string,
): Promise<PrihodRed[]> {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return [];
  const redovi = await prisma.income.findMany({
    where: { businessId: biznis.id },
    include: {
      invoice: {
        select: {
          number: true,
          clientId: true,
          client: { select: { name: true } },
        },
      },
      client: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });
  return redovi.map(uPrihodRed);
}

export type IspraviPrihodRezultat =
  { ok: true } | { ok: false; razlog: string };

// "Ispravi" (Korak 9c, bočni panel Kp4): menja SAMO kurs (devizni, preračunava iznosRsd preko
// izracunajIznosRsd iz Koraka 9b) i opis - datum/iznos/klijent/faktura su zaključani (odluka zadatka).
// Dinarski prihod nema kurs, kurs se tad ignoriše čak i ako je nekako poslat (red.kind je AUTORITATIVAN,
// ne ono što klijent pošalje). Provera firme (businessId) je ISTA izolacija kao markInvoicePaid/
// obrisiIliArhivirajKlijenta - findFirst sa businessId umesto findUnique sa samo id.
export async function ispraviPrihod(
  userId: string,
  incomeId: string,
  podaci: { kurs: number | null; opis: string | null },
): Promise<IspraviPrihodRezultat> {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return { ok: false, razlog: "Prihod ne postoji." };

  const red = await prisma.income.findFirst({
    where: { id: incomeId, businessId: biznis.id },
  });
  if (!red) return { ok: false, razlog: "Prihod ne postoji." };

  if (red.kind === "devizni") {
    let amountRsd: number;
    try {
      amountRsd = izracunajIznosRsd(red.amount, podaci.kurs as number);
    } catch {
      return { ok: false, razlog: "Kurs mora biti broj veći od 0." };
    }
    await prisma.income.update({
      where: { id: red.id },
      data: { rate: podaci.kurs, amountRsd, description: podaci.opis },
    });
  } else {
    await prisma.income.update({
      where: { id: red.id },
      data: { description: podaci.opis },
    });
  }
  return { ok: true };
}

// Isti spisak kao AccountPanel.tsx VALUTE (devizni računi) - prototip (js/knjiga.js AddIncomeModal) nudi
// iste četiri valute za devizni ručni prihod.
const DOZVOLJENE_VALUTE = ["EUR", "USD", "GBP", "CHF"];

export type DodajPrihodPodaci = {
  vrsta: "dinarski" | "devizni";
  datum: Date;
  clientId: string | null;
  valuta: string; // ignoriše se za dinarski (uvek RSD)
  iznos: number; // VEĆ u najmanjoj jedinici valute (para/cent) - konverzija je na akciji (actions.ts)
  kurs: number | null; // samo za devizni
  opis: string | null;
};

export type DodajPrihodRezultat = { ok: true } | { ok: false; razlog: string };

// "Dodaj prihod" (Korak 9d-1, frejm Kp5): ručni prihod BEZ fakture - invoiceId uvek null, izvor uvek
// "rucno", businessId UVEK iz sesije (nikad iz ulaza). Ulazi normalno u zbir i limit (odluka zadatka) -
// nema posebnog tretmana kao "uplata bez fakture preko mejla banke" (ta siva/neuračunata logika je za
// NEPOVEZANE mejl-banke uplate, vidi izveštaj Koraka 9d - potpuno druga stvar).
export async function dodajPrihod(
  userId: string,
  podaci: DodajPrihodPodaci,
): Promise<DodajPrihodRezultat> {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return { ok: false, razlog: "Firma ne postoji." };

  if (!podaci.datum || Number.isNaN(podaci.datum.getTime())) {
    return { ok: false, razlog: "Unesi ispravan datum uplate." };
  }
  if (!Number.isFinite(podaci.iznos) || podaci.iznos <= 0) {
    return { ok: false, razlog: "Iznos mora biti broj veći od 0." };
  }
  if (podaci.clientId) {
    const klijent = await prisma.client.findFirst({
      where: { id: podaci.clientId, businessId: biznis.id },
    });
    if (!klijent) return { ok: false, razlog: "Klijent ne postoji." };
  }

  if (podaci.vrsta === "devizni") {
    if (!DOZVOLJENE_VALUTE.includes(podaci.valuta)) {
      return { ok: false, razlog: "Izaberi valutu." };
    }
    let amountRsd: number;
    try {
      amountRsd = izracunajIznosRsd(podaci.iznos, podaci.kurs as number);
    } catch {
      return { ok: false, razlog: "Kurs mora biti broj veći od 0." };
    }
    await prisma.income.create({
      data: {
        businessId: biznis.id,
        clientId: podaci.clientId,
        date: podaci.datum,
        currency: podaci.valuta,
        amount: podaci.iznos,
        rate: podaci.kurs,
        amountRsd,
        source: "rucno",
        kind: "devizni",
        description: podaci.opis,
      },
    });
  } else {
    await prisma.income.create({
      data: {
        businessId: biznis.id,
        clientId: podaci.clientId,
        date: podaci.datum,
        currency: "RSD",
        amount: podaci.iznos,
        rate: null,
        amountRsd: podaci.iznos,
        source: "rucno",
        kind: "dinarski",
        description: podaci.opis,
      },
    });
  }
  return { ok: true };
}
