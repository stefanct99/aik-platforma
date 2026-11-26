// Jednokratna skripta (Korak 8d-4b): "linije" tabele stavki je do sada MOGLA da ima samo vrednost koju je
// davala napraviPodrazumevaniSablonPodatke() ("horizontalne") - editor nije imao kontrolu da je korisnik
// promeni (ta kontrola je upravo ovaj korak). Zbog greške u Koraku 8d-2, "horizontalne" je tada CRTALO
// ISTO što i "okvir" (spoljašnji okvir + linije između redova - današnja slika). Korak 8d-4b ispravlja tu
// grešku da "okvir" i "horizontalne" stvarno budu različiti (vidi komentar u invoice-templates.ts), i
// menja PODRAZUMEVANU vrednost na "okvir". Ali postojeći redovi u bazi (InvoiceTemplate.table i zamrznute
// kopije u Invoice.templateSnapshot) i dalje doslovno sadrže "horizontalne" - bez ove skripte bi se njihov
// izgled PROMENIO (izgubili bi spoljašnji okvir), što krši pravilo da postojeće/poslate fakture ne smeju da
// se menjaju. Ova skripta prepisuje SAMO string "horizontalne" -> "okvir" (ništa drugo), svuda gde se
// nalazi - bezbedno je pokrenuti je više puta (drugi put ne nalazi ništa za izmenu).
import { prisma } from "../src/lib/prisma";
import { Prisma } from "../generated/prisma/client";
import type { PodaciSablona } from "../src/lib/invoice-templates";

async function main() {
  const sabloni = await prisma.invoiceTemplate.findMany();
  let izmenjenoSablona = 0;
  for (const sablon of sabloni) {
    const tabela = sablon.table as PodaciSablona["table"];
    if (tabela.lines === "horizontalne") {
      await prisma.invoiceTemplate.update({
        where: { id: sablon.id },
        data: { table: { ...tabela, lines: "okvir" } },
      });
      izmenjenoSablona++;
      console.log(`InvoiceTemplate ${sablon.id} (${sablon.name}): lines "horizontalne" -> "okvir"`);
    }
  }

  const fakture = await prisma.invoice.findMany({ where: { templateSnapshot: { not: Prisma.JsonNull } } });
  let izmenjenoFaktura = 0;
  for (const faktura of fakture) {
    const snapshot = faktura.templateSnapshot as PodaciSablona | null;
    if (snapshot?.table.lines === "horizontalne") {
      const noviSnapshot: PodaciSablona = { ...snapshot, table: { ...snapshot.table, lines: "okvir" } };
      await prisma.invoice.update({
        where: { id: faktura.id },
        data: { templateSnapshot: noviSnapshot },
      });
      izmenjenoFaktura++;
      console.log(`Invoice ${faktura.id} (${faktura.number}): zamrznuta kopija, lines "horizontalne" -> "okvir"`);
    }
  }

  console.log(`Gotovo. Izmenjeno šablona: ${izmenjenoSablona}, izmenjeno zamrznutih kopija: ${izmenjenoFaktura}.`);
}

main()
  .catch((greska) => {
    console.error(greska);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
