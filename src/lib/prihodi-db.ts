// Knjiga prihoda (Korak 9a) - deo koji dotiče bazu, odvojen od prihodi.ts (čiste funkcije) iz istog
// razloga kao invoice-templates-db.ts/invoice-templates.ts: KnjigaPrihodaTab.tsx je klijentska komponenta
// i uvozi prihodi.ts direktno - uvoz Prisma klijenta tamo bi slomio build.
import { prisma } from "./prisma";
import { getBusinessForUser } from "./business";
import { izracunajIznosRsd, type PrihodRed } from "./prihodi";

// Devizni: Income.amountRsd/rate su null dok kurs nije upisan (ručno, Korak 9b - nema još NBS
// integracije, videti schema.prisma). Dinarski NEMA kurs - RSD protivvrednost je trivijalno jednaka
// iznosu, zato se ovde IZVODI, ne čita se iz baze.
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
    klijentId: red.invoice?.clientId ?? null,
    klijentIme: red.invoice?.client.name ?? null,
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
