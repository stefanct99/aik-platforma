// Knjiga prihoda (Korak 9a) - deo koji dotiče bazu, odvojen od prihodi.ts (čiste funkcije) iz istog
// razloga kao invoice-templates-db.ts/invoice-templates.ts: KnjigaPrihodaTab.tsx je klijentska komponenta
// i uvozi prihodi.ts direktno - uvoz Prisma klijenta tamo bi slomio build.
import { prisma } from "./prisma";
import { getBusinessForUser } from "./business";
import type { PrihodRed } from "./prihodi";

// Income.amountRsd/rate su danas UVEK null (Korak 9b ih tek popunjava, videti schema.prisma) - za
// dinarsku uplatu je RSD protivvrednost trivijalno jednaka iznosu (nema kursa), zato se ovde IZVODI, ne
// čita se iz baze.
function uPrihodRed(red: {
  id: string;
  date: Date;
  currency: string;
  amount: number;
  rate: number | null;
  amountRsd: number | null;
  source: string;
  kind: string;
  invoiceId: string | null;
  invoice: { number: string; clientId: string; client: { name: string } } | null;
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
  };
}

export async function getPrihodiZaKorisnika(userId: string): Promise<PrihodRed[]> {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return [];
  const redovi = await prisma.income.findMany({
    where: { businessId: biznis.id },
    include: { invoice: { select: { number: true, clientId: true, client: { select: { name: true } } } } },
    orderBy: { date: "desc" },
  });
  return redovi.map(uPrihodRed);
}
