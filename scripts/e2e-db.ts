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
      const faktura = await prisma.invoice.findFirstOrThrow({
        where: { number: argumenti.number },
      });
      console.log(JSON.stringify(faktura));
      break;
    }
    case "set-default-template-accent": {
      const biznis = await prisma.business.findFirstOrThrow({
        where: { name: "E2E Probna Firma" },
      });
      await prisma.invoiceTemplate.updateMany({
        where: { businessId: biznis.id, isDefault: true },
        data: { accentColor: argumenti.accentColor },
      });
      console.log(JSON.stringify({ ok: true }));
      break;
    }
    case "create-draft-invoice": {
      const biznis = await prisma.business.findFirstOrThrow({
        where: { name: "E2E Probna Firma" },
      });
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
          items: {
            create: [{ desc: "Vizuelna provera", qty: 1, price: 10000 }],
          },
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
    case "create-other-business": {
      // Druga, NEZAVISNA probna firma (drugi korisnik) - samo za proveru izolacije šablona po firmi
      // (template-isolation.spec.ts). Isti obrazac kao glavni probni nalog (scripts/e2e-seed.ts): pravi se
      // preko auth.api.signUpEmail + saveOnboardingStep1/2/finishOnboarding (ne ručnim Prisma.create, da bi
      // Business dobio sva obavezna izvedena polja - inboundSlug/inboundCode/calendarToken). Ne loguje se
      // nikad - testu treba samo businessId/templateId, za pokušaj pristupa IZ sesije glavnog probnog naloga.
      const { randomBytes } = await import("node:crypto");
      const { auth } = await import("../src/lib/auth");
      const {
        saveOnboardingStep1,
        saveOnboardingStep2,
        finishOnboarding,
        getBusinessForUser,
      } = await import("../src/lib/business");
      const sufiks = randomBytes(6).toString("hex");
      const email = `e2e-druga-firma-${sufiks}@aik-test.local`;
      await auth.api.signUpEmail({
        body: {
          name: "Druga Firma Vlasnik",
          email,
          password: `E2e-${randomBytes(9).toString("hex")}`,
        },
        headers: new Headers(),
        asResponse: false,
      });
      const korisnik = await prisma.user.findUniqueOrThrow({
        where: { email },
      });
      await prisma.user.update({
        where: { id: korisnik.id },
        data: { emailVerified: true },
      });
      await saveOnboardingStep1(korisnik.id, {
        ownerName: "Drugi Probni",
        name: "Druga Probna Firma (E2E)",
        pib: `E2E${sufiks}`.slice(0, 9),
        mb: `E2E${sufiks}`.slice(0, 8),
        delatnostCode: "62.10",
        delatnostName: "Računarsko programiranje",
        regDate: new Date("2024-01-01"),
      });
      await saveOnboardingStep2(korisnik.id, {
        street: "Druga 2",
        city: "Novi Sad",
        zip: "21000",
      });
      await finishOnboarding(korisnik.id);
      const biznis = await getBusinessForUser(korisnik.id);
      if (!biznis) throw new Error("Druga probna firma nije napravljena.");
      // saveOnboardingStep1 već pravi podrazumevani šablon - samo ga preimenuj/oboji da bude
      // raspoznatljiv (ime/boja koji ne postoje ni u jednoj drugoj probnoj firmi).
      const postojeciSablon = await prisma.invoiceTemplate.findFirstOrThrow({
        where: { businessId: biznis.id },
      });
      const sablon = await prisma.invoiceTemplate.update({
        where: { id: postojeciSablon.id },
        data: { name: "Tuđi šablon (E2E izolacija)", accentColor: "#FF00FF" },
      });
      console.log(
        JSON.stringify({
          userId: korisnik.id,
          businessId: biznis.id,
          templateId: sablon.id,
        }),
      );
      break;
    }
    case "delete-other-business": {
      // Cascade (schema.prisma) nosi sa sobom Business + InvoiceTemplate.
      await prisma.user.deleteMany({ where: { id: argumenti.userId } });
      console.log(JSON.stringify({ ok: true }));
      break;
    }
    case "create-paid-invoice": {
      // Faktura NASTAJE već kao "placena" (ne nacrt pa posle oznaka) - createInvoiceWithHistory (isti kod
      // koji koristi i razvojni seed) tad SAMA pravi Income zapis (src/lib/invoices.ts) - baš ono što
      // Knjiga prihoda (Korak 9a) čita. Namerno BEZ rate/amountRsd (to je stvarno današnje stanje, Korak
      // 9b ih tek popunjava) - test:e2e za Knjigu prihoda ovo i proverava ("–" u koloni Kurs/U dinarima).
      const { createInvoiceWithHistory } = await import("../src/lib/invoices");
      const biznis = await prisma.business.findFirstOrThrow({
        where: { name: "E2E Probna Firma" },
      });
      const klijent = await prisma.client.findFirstOrThrow({
        where: {
          businessId: biznis.id,
          name: { contains: argumenti.klijent as string },
        },
      });
      const datum = new Date(argumenti.datum as string);
      const faktura = await createInvoiceWithHistory(biznis.id, {
        clientId: klijent.id,
        currency: argumenti.valuta as string,
        lang: "en",
        issueDate: datum,
        dueDays: 7,
        items: [
          { desc: "E2E uplata", qty: 1, price: argumenti.iznos as number },
        ],
        status: "placena",
        sentAt: datum,
        paidDate: datum,
      });
      // "broj" opciono - samo da test (knjiga-prihoda.spec.ts) može da zada TAČAN, namerno dug broj fakture
      // (npr. "100/26-12") umesto automatski dodeljenog, da proveri da takav broj nikad ne bude skraćen u
      // koloni Faktura. Jedinstvenost brojeva po firmi (@@unique([businessId, number])) ostaje na testu.
      let broj = faktura.number;
      if (argumenti.broj) {
        broj = argumenti.broj as string;
        await prisma.invoice.update({
          where: { id: faktura.id },
          data: { number: broj },
        });
      }
      // "kurs" opciono (Korak 9b) - createInvoiceWithHistory NIKAD sam ne upisuje rate/amountRsd (markPaid
      // tok to ne radi, videti izveštaj Korak 9b); test za PRIKAZ stvarnog kursa (ne "–") mora da ga upiše
      // posebno, baš kao što to danas radi JEDINO scripts/popuni-probne-kurseve.ts za razvojnu bazu.
      if (argumenti.kurs) {
        const { izracunajIznosRsd } = await import("../src/lib/prihodi");
        const kurs = argumenti.kurs as number;
        const income = await prisma.income.findFirstOrThrow({
          where: { invoiceId: faktura.id },
        });
        await prisma.income.update({
          where: { id: income.id },
          data: {
            rate: kurs,
            amountRsd: izracunajIznosRsd(income.amount, kurs),
          },
        });
      }
      console.log(JSON.stringify({ id: faktura.id, broj }));
      break;
    }
    case "delete-manual-incomes": {
      // Čišćenje za e2e/dodaj-prihod.spec.ts (Korak 9d-2) - briše SAMO ono što "Dodaj prihod" pravi
      // (invoiceId null, source "rucno"), bez obzira koliko je testova dodalo redove ili kojim redosledom
      // su išli. Bezbedno za ostale spec fajlove: create-paid-invoice UVEK postavlja invoiceId, "Ispravi"
      // (ispraviPrihod) samo MENJA postojeće redove, nikad ne pravi nove bez fakture.
      const biznis = await prisma.business.findFirstOrThrow({
        where: { name: "E2E Probna Firma" },
      });
      const rezultat = await prisma.income.deleteMany({
        where: { businessId: biznis.id, invoiceId: null, source: "rucno" },
      });
      console.log(JSON.stringify({ obrisano: rezultat.count }));
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
