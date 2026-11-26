// Deo src/lib/invoice-templates.ts koji dotiče bazu (Korak 8d-1/8d-2) - NAMERNO odvojen fajl: čisti,
// bez-baze deo (tipovi + funkcije koje InvoiceDoc i InvoiceEditor crtaju) sme da se uveze u klijentske
// komponente, a ovaj (sa Prisma klijentom) NE sme - uvezen iz "use client" fajla bi pokušao da spakuje
// server-only "pg" paket u browser bandl i slomio build. Zato ovo pozivaju ISKLJUČIVO server komponente
// (page.tsx fajlovi) i drugi server-side moduli (src/lib/business.ts, src/lib/invoices.ts).
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "./prisma";
import { napraviPodrazumevaniSablonPodatke, sablonRedUPodatke, type PodaciSablona } from "./invoice-templates";

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
