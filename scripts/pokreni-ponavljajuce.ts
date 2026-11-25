// Razvojna skripta za ručno pokretanje generisanja ponavljajućih faktura (Korak 8c, zadatak tačka 8) -
// NIJE prava pozadinska dnevna obaveza (ta ne postoji još), samo omogućava da se generisanje testira
// bez čekanja stvarnog kalendarskog dana. NIKAD se ne pokreće u produkciji, isti obrazac kao
// seed-fakture.ts/make-admin.ts.
import { prisma } from "../src/lib/prisma";
import { generisiPonavljajuceFakture } from "../src/lib/recurring-invoices";

function procitajDatumArg(): Date {
  const arg = process.argv.find((a) => a.startsWith("--datum="));
  if (!arg) return new Date();
  const vrednost = arg.slice("--datum=".length);
  const datum = new Date(`${vrednost}T00:00:00.000Z`);
  if (Number.isNaN(datum.getTime())) {
    throw new Error(`Neispravan datum "${vrednost}" - koristi oblik GGGG-MM-DD.`);
  }
  return datum;
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Ova skripta ne sme da se pokreće u produkciji.");
    process.exitCode = 1;
    return;
  }

  const email = process.argv[2];
  if (!email) {
    console.error("Upotreba: npm run ponavljajuce:pokreni -- email@primer.rs [--datum=GGGG-MM-DD]");
    process.exitCode = 1;
    return;
  }

  const korisnik = await prisma.user.findUnique({ where: { email } });
  if (!korisnik) {
    console.error(`Korisnik sa mejlom ${email} ne postoji.`);
    process.exitCode = 1;
    return;
  }

  const datum = procitajDatumArg();
  const rezultati = await generisiPonavljajuceFakture(korisnik.id, datum);

  if (rezultati.length === 0) {
    console.log(`Nema ponavljajućih faktura koje su na redu za ${datum.toISOString().slice(0, 10)}.`);
    return;
  }

  for (const r of rezultati) {
    if (r.nacin === "poslata") {
      console.log(`[AUTO] ${r.clientName}: napravljena i poslata faktura ${r.broj}.`);
    } else if (r.razlogNacrta) {
      console.log(`[AUTO -> NACRT] ${r.clientName}: faktura ${r.broj} napravljena kao nacrt (${r.razlogNacrta}).`);
    } else {
      console.log(`[NACRT] ${r.clientName}: napravljena faktura ${r.broj}, čeka tvoje odobrenje za slanje.`);
    }
  }
  console.log(`Gotovo: ${rezultati.length} fakture napravljeno za ${email}.`);
}

main()
  .catch((greska) => {
    console.error(greska);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
