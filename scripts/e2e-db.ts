// Mali CLI koji E2E testovi (e2e/*.spec.ts) pozivaju kao poseban proces (execFileSync) kad im treba
// direktan upis/čitanje baze da provere nešto što UI sam ne pokazuje (npr. templateSnapshot). NIJE
// pozvano preko dinamičkog "import()" IZ Playwright testa - Playwright-ov sopstveni modul-loader za
// globalSetup/testove ne ume da učita generisanog Prisma klijenta (prisma/generated/client.ts koristi
// "import.meta", Node ga pod tim loader-om vidi kao CommonJS - "Cannot use import.meta outside a
// module"). tsx (ovaj proces) tu istu datoteku učitava bez problema - zato je ovo ODVOJEN proces.
//
// Upotreba: npx tsx --env-file=.env.local scripts/e2e-db.ts <komanda> '<json argumenti>'
// Ispisuje TAČNO JEDAN red JSON-a na stdout (rezultat), ili grešku na stderr + exit 1.
import { config } from "dotenv";
import { proveriDaJeTestBaza } from "../src/lib/test-db-safety";

config({ path: ".env.local" });
proveriDaJeTestBaza(process.env.DATABASE_URL_TEST);
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;

async function main() {
  const komanda = process.argv[2];
  const argumenti = process.argv[3] ? JSON.parse(process.argv[3]) : {};
  const { prisma } = await import("../src/lib/prisma");

  switch (komanda) {
    case "invoice-by-number": {
      const faktura = await prisma.invoice.findFirstOrThrow({ where: { number: argumenti.number } });
      console.log(JSON.stringify(faktura));
      break;
    }
    case "set-default-template-accent": {
      const biznis = await prisma.business.findFirstOrThrow({ where: { name: "E2E Probna Firma" } });
      await prisma.invoiceTemplate.updateMany({
        where: { businessId: biznis.id, isDefault: true },
        data: { accentColor: argumenti.accentColor },
      });
      console.log(JSON.stringify({ ok: true }));
      break;
    }
    case "create-draft-invoice": {
      const biznis = await prisma.business.findFirstOrThrow({ where: { name: "E2E Probna Firma" } });
      const klijent = await prisma.client.findFirstOrThrow({
        where: { businessId: biznis.id, name: { contains: "Acme" } },
      });
      const faktura = await prisma.invoice.create({
        data: {
          businessId: biznis.id,
          clientId: klijent.id,
          number: `VIZ-${Date.now()}`,
          currency: "EUR",
          lang: "en",
          issueDate: new Date(),
          dueDays: 7,
          status: "nacrt",
          items: { create: [{ desc: "Vizuelna provera", qty: 1, price: 10000 }] },
        },
      });
      console.log(JSON.stringify({ id: faktura.id }));
      break;
    }
    case "delete-invoice": {
      await prisma.invoice.deleteMany({ where: { id: argumenti.id } });
      console.log(JSON.stringify({ ok: true }));
      break;
    }
    default:
      throw new Error(`Nepoznata komanda: ${komanda}`);
  }
}

main()
  .catch((greska) => {
    console.error(greska);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { prisma } = await import("../src/lib/prisma");
    await prisma.$disconnect();
  });
