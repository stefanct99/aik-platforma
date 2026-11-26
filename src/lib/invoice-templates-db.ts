// Deo src/lib/invoice-templates.ts koji dotiče bazu (Korak 8d-1/8d-2) - NAMERNO odvojen fajl: čisti,
// bez-baze deo (tipovi + funkcije koje InvoiceDoc i InvoiceEditor crtaju) sme da se uveze u klijentske
// komponente, a ovaj (sa Prisma klijentom) NE sme - uvezen iz "use client" fajla bi pokušao da spakuje
// server-only "pg" paket u browser bandl i slomio build. Zato ovo pozivaju ISKLJUČIVO server komponente
// (page.tsx fajlovi) i drugi server-side moduli (src/lib/business.ts, src/lib/invoices.ts).
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "./prisma";
import {
  napraviPodrazumevaniSablonPodatke,
  sablonRedUPodatke,
  validirajSvojstvaBloka,
  NAZIVI_BLOKOVA,
  type BlokKljuc,
  type SvojstvaBloka,
  type PodaciSablona,
  type PodesavanjaTabele,
  type PodesavanjaDokumenta,
  type Raspored,
} from "./invoice-templates";

// Idempotentno: ako firma već ima podrazumevani šablon, vraća njega (ne pravi drugi). Ovim se - isto kao
// kod BankAccount.isDefault (vidi komentar u schema.prisma) - na nivou aplikacije obezbeđuje da firma
// nikad ne dobije dva podrazumevana šablona, bez posebnog ograničenja u bazi.
export async function osigurajPodrazumevaniSablon(businessId: string) {
  const postojeci = await prisma.invoiceTemplate.findFirst({ where: { businessId, isDefault: true } });
  if (postojeci) return postojeci;

  const podaci = napraviPodrazumevaniSablonPodatke();
  return prisma.invoiceTemplate.create({
    data: { businessId, ...podaci, assignRule: podaci.assignRule ?? Prisma.JsonNull },
  });
}

// Podrazumevani šablon firme, kao čisti podaci (koristi se za NOVU fakturu koja još ne postoji u bazi -
// nema šta da bude "zamrznuto", i za postojeću fakturu bez templateSnapshot-a).
export async function ucitajPodrazumevaniSablon(businessId: string): Promise<PodaciSablona> {
  const red = await osigurajPodrazumevaniSablon(businessId);
  return sablonRedUPodatke(red);
}

// Koji šablon se crta za DATU fakturu (Korak 8d-2, pravilo 2): zamrznuta kopija ako postoji, inače
// podrazumevani šablon firme. Biranje po pravilu dodele (klijent/valuta/jezik) NIJE deo ovog koraka -
// dolazi u 8d-3 (Sel.templateForInvoice u prototipu).
export async function ucitajSablonZaFakturu(faktura: {
  businessId: string;
  templateSnapshot: unknown;
}): Promise<PodaciSablona> {
  if (faktura.templateSnapshot) return faktura.templateSnapshot as PodaciSablona;
  return ucitajPodrazumevaniSablon(faktura.businessId);
}

// ===================== Editor šablona (Korak 8d-4) =====================

export type IzmenaSablona = {
  blocks: BlokKljuc[];
  blocksOff: BlokKljuc[];
  blockProps: Record<BlokKljuc, SvojstvaBloka>;
  table: PodesavanjaTabele;
  doc: PodesavanjaDokumenta;
  accentColor: string;
  layout: Raspored;
};

export type SacuvajSablonRezultat = { ok: true; sablon: PodaciSablona } | { ok: false; razlog: string };

// Upisuje izmene u PODRAZUMEVANI šablon firme (za sada postoji samo jedan šablon po firmi - izbor između
// više šablona dolazi u 8d-7). Menja blocks/blocksOff/blockProps (nivo Blok), table/doc/accentColor
// (nivoi Tabela i Cela faktura, Korak 8d-4b) i, od Koraka 8d-6, i layout (dijalog "Raspored").
// Već poslate fakture ovo ne dotiče - one crtaju iz svoje zamrznute kopije (Invoice.templateSnapshot),
// ne iz ovog reda (videti ucitajSablonZaFakturu).
export async function sacuvajSablon(businessId: string, izmena: IzmenaSablona): Promise<SacuvajSablonRezultat> {
  for (const blok of Object.keys(izmena.blockProps) as BlokKljuc[]) {
    const greske = validirajSvojstvaBloka(izmena.blockProps[blok]);
    if (Object.keys(greske).length > 0) {
      return { ok: false, razlog: `Neispravna vrednost za blok "${NAZIVI_BLOKOVA[blok]}".` };
    }
  }

  const postojeci = await prisma.invoiceTemplate.findFirst({ where: { businessId, isDefault: true } });
  if (!postojeci) return { ok: false, razlog: "Šablon ne postoji." };

  const azuriran = await prisma.invoiceTemplate.update({
    where: { id: postojeci.id },
    data: {
      blocks: izmena.blocks,
      blocksOff: izmena.blocksOff,
      blockProps: izmena.blockProps,
      table: izmena.table,
      doc: izmena.doc,
      accentColor: izmena.accentColor,
      layout: izmena.layout,
    },
  });
  return { ok: true, sablon: sablonRedUPodatke(azuriran) };
}

// "Vrati na podrazumevano" (Korak 8d-4 tačka 6) - vraća CEO red na fabrička podešavanja iz Koraka 8d-1,
// ne samo blockProps (tako da kasniji nivoi Tabela/Cela faktura zateknu čiste podatke ako je korisnik
// prethodno nešto menjao u njima kroz buduće korake).
export async function vratiSablonNaPodrazumevano(businessId: string): Promise<PodaciSablona> {
  const postojeci = await prisma.invoiceTemplate.findFirst({ where: { businessId, isDefault: true } });
  const podaci = napraviPodrazumevaniSablonPodatke();
  if (!postojeci) {
    const novi = await osigurajPodrazumevaniSablon(businessId);
    return sablonRedUPodatke(novi);
  }
  await prisma.invoiceTemplate.update({
    where: { id: postojeci.id },
    data: { ...podaci, assignRule: podaci.assignRule ?? Prisma.JsonNull },
  });
  return podaci;
}
