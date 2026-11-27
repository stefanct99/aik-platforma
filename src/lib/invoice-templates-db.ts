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

// ===================== Više šablona (Korak 8d-7a, frejm Fak27) =====================
// Šema (name/isDefault) je postojala od Koraka 8d-1 - baš zato da ovaj korak ne traži migraciju baze,
// samo nove funkcije koje čitaju/pišu VIŠE redova po firmi umesto uvek "onog sa isDefault:true".

export type StavkaListeSablona = { id: string; name: string; isDefault: boolean };

// Lista svih šablona firme za padajući meni "Šablon: <ime>" - podrazumevani uvek prvi (kao u Fak27),
// ostali po redosledu pravljenja (najstariji prvo).
export async function listaSablona(businessId: string): Promise<StavkaListeSablona[]> {
  await osigurajPodrazumevaniSablon(businessId);
  return prisma.invoiceTemplate.findMany({
    where: { businessId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    select: { id: true, name: true, isDefault: true },
  });
}

// Učitavanje KONKRETNOG šablona po id-u (biranje u padajućem meniju) - provera vlasništva (businessId)
// kao svuda u ovom fajlu: korisnik A ne može da učita šablon firme korisnika B ni da pogodi tuđ id.
export async function ucitajSablonPoId(
  businessId: string,
  id: string,
): Promise<{ id: string; sablon: PodaciSablona } | null> {
  const red = await prisma.invoiceTemplate.findFirst({ where: { id, businessId } });
  if (!red) return null;
  return { id: red.id, sablon: sablonRedUPodatke(red) };
}

// "+ Novi šablon" (Fak27): uvek Klasičan izgled (napraviPodrazumevaniSablonPodatke), nikad podrazumevani.
export async function kreirajSablon(businessId: string, ime: string): Promise<{ id: string; sablon: PodaciSablona }> {
  const podaci = napraviPodrazumevaniSablonPodatke();
  const novi = await prisma.invoiceTemplate.create({
    data: { businessId, ...podaci, name: ime, isDefault: false, assignRule: Prisma.JsonNull },
  });
  return { id: novi.id, sablon: sablonRedUPodatke(novi) };
}

// "Dupliraj ovaj šablon" (Fak27): tačna kopija svih polja trenutno otvorenog šablona, ime "<ime> (kopija)",
// nikad podrazumevani (čak ni ako je original bio).
export async function duplirajSablon(
  businessId: string,
  id: string,
): Promise<{ id: string; sablon: PodaciSablona } | null> {
  const izvor = await prisma.invoiceTemplate.findFirst({ where: { id, businessId } });
  if (!izvor) return null;
  const novi = await prisma.invoiceTemplate.create({
    data: {
      businessId,
      name: `${izvor.name} (kopija)`,
      isDefault: false,
      layout: izvor.layout,
      accentColor: izvor.accentColor,
      blocks: izvor.blocks as Prisma.InputJsonValue,
      blocksOff: izvor.blocksOff as Prisma.InputJsonValue,
      blockProps: izvor.blockProps as Prisma.InputJsonValue,
      table: izvor.table as Prisma.InputJsonValue,
      doc: izvor.doc as Prisma.InputJsonValue,
      assignRule: (izvor.assignRule ?? Prisma.JsonNull) as Prisma.InputJsonValue,
    },
  });
  return { id: novi.id, sablon: sablonRedUPodatke(novi) };
}

// Promena imena (zadatak tačka 3) - frejm ne pokazuje GDE se ovo pokreće (nema posebnog dijaloga ni
// ikonice za izmenu u Fak27), zato je u editoru rešeno kao stavka u istom padajućem meniju (izveštaj).
export async function preimenujSablon(
  businessId: string,
  id: string,
  novoIme: string,
): Promise<{ id: string; sablon: PodaciSablona } | null> {
  const postojeci = await prisma.invoiceTemplate.findFirst({ where: { id, businessId } });
  if (!postojeci) return null;
  const azuriran = await prisma.invoiceTemplate.update({ where: { id }, data: { name: novoIme } });
  return { id: azuriran.id, sablon: sablonRedUPodatke(azuriran) };
}

// "Postavi kao podrazumevani" (zadatak tačka 3) - tačno jedan podrazumevani po firmi, UVEK: transakcija
// skida isDefault sa svih ostalih i postavlja ga na izabrani, atomično (isti princip kao
// osigurajPodrazumevaniSablon, primenjen i na promenu, ne samo na prvo pravljenje).
export async function postaviKaoPodrazumevani(
  businessId: string,
  id: string,
): Promise<{ id: string; sablon: PodaciSablona } | null> {
  const postojeci = await prisma.invoiceTemplate.findFirst({ where: { id, businessId } });
  if (!postojeci) return null;
  const [, azuriran] = await prisma.$transaction([
    prisma.invoiceTemplate.updateMany({ where: { businessId, isDefault: true }, data: { isDefault: false } }),
    prisma.invoiceTemplate.update({ where: { id }, data: { isDefault: true } }),
  ]);
  return { id: azuriran.id, sablon: sablonRedUPodatke(azuriran) };
}

export type ObrisiSablonRezultat = { ok: true } | { ok: false; razlog: string };

// "Obriši ovaj šablon" (Korak 8d-7a dopuna, frejm Fak27 je NE pokazuje - stavka je u meniju, izveštaj).
// Podrazumevani se nikad ne briše (zadatak tačka 2) - provereno OVDE, na serveru, ne samo u dugmetu u
// interfejsu (koje je samo onemogućeno, da se ne osloni samo na to). Bezbedno je obrisati red: Invoice
// NEMA polje koje upućuje na konkretan InvoiceTemplate.id (poslate fakture crtaju iz templateSnapshot-a,
// zamrznute kopije podataka, ne iz žive veze ka ovom redu; nacrti uvek prate TRENUTNO podrazumevani šablon
// firme, biran dinamički po businessId, ne po id-u nekog određenog šablona) - brisanje bilo kog
// NE-podrazumevanog šablona zato ne može da ostavi "obešenu" referencu nigde (izveštaj).
export async function obrisiSablon(businessId: string, id: string): Promise<ObrisiSablonRezultat> {
  const postojeci = await prisma.invoiceTemplate.findFirst({ where: { id, businessId } });
  if (!postojeci) return { ok: false, razlog: "Šablon ne postoji." };
  if (postojeci.isDefault) {
    return { ok: false, razlog: "Podrazumevani šablon se ne može obrisati. Prvo postavi drugi šablon kao podrazumevani." };
  }
  await prisma.invoiceTemplate.delete({ where: { id } });
  return { ok: true };
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

// Upisuje izmene u KONKRETAN šablon (templateId - od Koraka 8d-7a firma može imati više njih, editor šalje
// id šablona koji je trenutno otvoren). Menja blocks/blocksOff/blockProps (nivo Blok), table/doc/accentColor
// (nivoi Tabela i Cela faktura, Korak 8d-4b) i, od Koraka 8d-6, i layout (dijalog "Raspored"). Ime i status
// podrazumevanog se NE diraju ovde (menjaju ih preimenujSablon/postaviKaoPodrazumevani).
// Već poslate fakture ovo ne dotiče - one crtaju iz svoje zamrznute kopije (Invoice.templateSnapshot),
// ne iz ovog reda (videti ucitajSablonZaFakturu).
export async function sacuvajSablon(
  businessId: string,
  templateId: string,
  izmena: IzmenaSablona,
): Promise<SacuvajSablonRezultat> {
  for (const blok of Object.keys(izmena.blockProps) as BlokKljuc[]) {
    const greske = validirajSvojstvaBloka(izmena.blockProps[blok]);
    if (Object.keys(greske).length > 0) {
      return { ok: false, razlog: `Neispravna vrednost za blok "${NAZIVI_BLOKOVA[blok]}".` };
    }
  }

  const postojeci = await prisma.invoiceTemplate.findFirst({ where: { id: templateId, businessId } });
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

// "Vrati na podrazumevano" (Korak 8d-4 tačka 6, od 8d-7a tačka 5: radi na KONKRETNOM šablonu, ne uvek na
// onom sa isDefault:true) - vraća samo IZGLED (blocks/blocksOff/blockProps/table/doc/accentColor/layout)
// na fabrička podešavanja iz Koraka 8d-1. Ime i status podrazumevanog tog šablona OSTAJU (zadatak,
// tačka 5) - zato se ovde ne upisuje ...podaci u celini kao pre 8d-7a (to bi prepisalo i name/isDefault).
export async function vratiSablonNaPodrazumevano(
  businessId: string,
  templateId: string,
): Promise<PodaciSablona | null> {
  const postojeci = await prisma.invoiceTemplate.findFirst({ where: { id: templateId, businessId } });
  if (!postojeci) return null;
  const podaci = napraviPodrazumevaniSablonPodatke();
  const azuriran = await prisma.invoiceTemplate.update({
    where: { id: postojeci.id },
    data: {
      layout: podaci.layout,
      accentColor: podaci.accentColor,
      blocks: podaci.blocks,
      blocksOff: podaci.blocksOff,
      blockProps: podaci.blockProps,
      table: podaci.table,
      doc: podaci.doc,
    },
  });
  return sablonRedUPodatke(azuriran);
}
