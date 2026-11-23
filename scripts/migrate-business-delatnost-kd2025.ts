// Jednokratna skripta (Korak 2b): postojeći razvojni redovi u tabeli business su sačuvani sa starim
// demo šiframa iz prototipa (KD 2010 format, bez tačke, npr. "6201"). Ovo ih prevodi na KD 2025 preko
// zvanične Tabele veza. Ako je prevod jednoznačan, upisuje novu šifru. Ako jedna stara šifra ima više
// mogućih novih (jedan na više), NE pogađa koja je tačna, samo prijavljuje, red ostaje nepromenjen.
import { findKD2010ByLegacyCode } from "../src/lib/kd-sifre";
import { TABELA_VEZA_KD2010_KD2025 } from "../src/data/kd/tabela-veza";
import { KD2025 } from "../src/data/kd/kd2025";
import { prisma } from "../src/lib/prisma";

async function main() {
  const firme = await prisma.business.findMany();
  for (const firma of firme) {
    if (firma.delatnostVerzija === "KD2025" && firma.delatnostCode.includes(".")) {
      const postoji = KD2025.some((r) => r.code === firma.delatnostCode);
      if (postoji) {
        console.log(`${firma.name}: već KD2025 (${firma.delatnostCode}), ništa ne radim.`);
        continue;
      }
    }

    const staraKD2010 = findKD2010ByLegacyCode(firma.delatnostCode);
    if (!staraKD2010) {
      console.log(`${firma.name}: šifra "${firma.delatnostCode}" nije prepoznata ni kao KD2010 ni kao KD2025. NAPOMENA: ostavljeno nepromenjeno, treba ručno pregledati.`);
      continue;
    }

    const moguce = TABELA_VEZA_KD2010_KD2025.filter((p) => p.staraSifra === staraKD2010.code);
    if (moguce.length === 1) {
      const nova = KD2025.find((r) => r.code === moguce[0].novaSifra)!;
      await prisma.business.update({
        where: { id: firma.id },
        data: { delatnostCode: nova.code, delatnostName: nova.name, delatnostVerzija: "KD2025" },
      });
      console.log(`${firma.name}: ${firma.delatnostCode} -> ${nova.code} (${nova.name})`);
    } else {
      console.log(
        `${firma.name}: NAPOMENA, stara šifra ${staraKD2010.code} se deli na ${moguce.length} nove (${moguce
          .map((m) => m.novaSifra)
          .join(", ")}). Ostavljeno nepromenjeno, bira korisnik ručno kroz podešavanja (budući korak).`,
      );
    }
  }
}

main()
  .catch((greska) => {
    console.error(greska);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
