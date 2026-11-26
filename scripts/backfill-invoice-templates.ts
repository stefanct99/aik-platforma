// Jednokratna skripta (Korak 8d-1): firme napravljene PRE ovog koraka nemaju nijedan šablon fakture.
// Ovo svakoj takvoj firmi doda tačno jedan podrazumevani šablon (osigurajPodrazumevaniSablon je
// idempotentno - firma koja već ima podrazumevani šablon se preskače, ništa se ne duplira).
// Pokreni sa: npx tsx --env-file=.env.local scripts/backfill-invoice-templates.ts
import { prisma } from "../src/lib/prisma";
import { osigurajPodrazumevaniSablon } from "../src/lib/invoice-templates-db";

async function main() {
  const firme = await prisma.business.findMany({ select: { id: true, name: true } });
  for (const firma of firme) {
    const postojeci = await prisma.invoiceTemplate.findFirst({ where: { businessId: firma.id, isDefault: true } });
    if (postojeci) {
      console.log(`${firma.name}: već ima podrazumevani šablon, ništa ne radim.`);
      continue;
    }
    await osigurajPodrazumevaniSablon(firma.id);
    console.log(`${firma.name}: napravljen podrazumevani šablon.`);
  }
  console.log(`Gotovo: ${firme.length} firma(e) provereno.`);
}

main()
  .catch((greska) => {
    console.error(greska);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
