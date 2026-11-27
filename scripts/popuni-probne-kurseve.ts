// Razvojna, JEDNOKRATNA skripta (Korak 9b, zadatak tačka 3) - upisuje PRIBLIŽNE PROBNE kurseve (po
// valuti, ne po danu - prava NBS integracija je poseban, kasniji korak) za devizne prihode koji u
// razvojnoj bazi još nemaju upisan kurs (Income.rate === null). NIKAD se ne pokreće sama ni u
// produkciji - isti obrazac kao pokreni-ponavljajuce.ts/seed-fakture.ts.
//
// Vrednosti po valuti su PREUZETE iz pseudo-NBS funkcije prototipa (referenca/prototip/js/utils.js,
// nbsRate: EUR=117.2, USD=107.1) - realne za razvojno okruženje, ali IZMIŠLJENE/PROBNE, ne stvarni
// istorijski kurs NBS na dan priliva (to zahteva pravu NBS integraciju, van ovog koraka).
import { prisma } from "../src/lib/prisma";
import { izracunajIznosRsd } from "../src/lib/prihodi";

const PROBNI_KURSEVI: Record<string, number> = {
  EUR: 117.2,
  USD: 107.1,
};

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Ova skripta ne sme da se pokreće u produkciji.");
    process.exitCode = 1;
    return;
  }

  const redovi = await prisma.income.findMany({ where: { kind: "devizni", rate: null } });
  if (redovi.length === 0) {
    console.log("Nema deviznih prihoda bez kursa - ništa za upisati.");
    return;
  }

  const nepoznateValute = new Set(redovi.map((r) => r.currency).filter((v) => !(v in PROBNI_KURSEVI)));
  if (nepoznateValute.size > 0) {
    console.error(
      `Nema probnog kursa za valutu/e: ${[...nepoznateValute].join(", ")} - dopuni PROBNI_KURSEVI u skripti i pokreni ponovo.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Upisujem probne kurseve (RAZVOJNE, NE stvarne) za ${redovi.length} deviznih prihoda bez kursa:`);
  for (const [valuta, kurs] of Object.entries(PROBNI_KURSEVI)) {
    console.log(`  ${valuta}: ${kurs.toLocaleString("sr-RS", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  }

  for (const red of redovi) {
    const kurs = PROBNI_KURSEVI[red.currency];
    const amountRsd = izracunajIznosRsd(red.amount, kurs);
    await prisma.income.update({ where: { id: red.id }, data: { rate: kurs, amountRsd } });
    console.log(
      `  [${red.currency}] ${red.id}: iznos=${red.amount} -> kurs=${kurs}, iznosRsd=${amountRsd} (${red.date.toISOString().slice(0, 10)})`,
    );
  }

  console.log(`Gotovo: ${redovi.length} redova ažurirano.`);
}

main()
  .catch((greska) => {
    console.error(greska);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
