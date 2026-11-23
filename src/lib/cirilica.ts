// Standardna srpska ćirilica-latinica transliteracija (1 na 1 preslikavanje slova, bez izuzetaka
// zavisnih od značenja reči, za razliku od npr. ruske ćirilice). Koristi se za obradu zvaničnih
// RZS fajlova (KD 2025, KD 2010, Tabela veza), koji su objavljeni na ćirilici, u aplikaciju koja je
// na srpskoj latinici (spec 4.5).
const MALA_SLOVA: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  ђ: "đ",
  е: "e",
  ж: "ž",
  з: "z",
  и: "i",
  ј: "j",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  ћ: "ć",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "č",
  ш: "š",
};

const VELIKA_SLOVA: Record<string, string> = {
  А: "A",
  Б: "B",
  В: "V",
  Г: "G",
  Д: "D",
  Ђ: "Đ",
  Е: "E",
  Ж: "Ž",
  З: "Z",
  И: "I",
  Ј: "J",
  К: "K",
  Л: "L",
  М: "M",
  Н: "N",
  О: "O",
  П: "P",
  Р: "R",
  С: "S",
  Т: "T",
  Ћ: "Ć",
  У: "U",
  Ф: "F",
  Х: "H",
  Ц: "C",
  Ч: "Č",
  Ш: "Š",
};

// Dva slova (dvoglasi) se u latinici pišu kao dva znaka, i to zavisi od toga da li je CELA reč
// (string) pisana velikim slovima (npr. naslov sektora) ili samo prvo slovo (normalna rečenica).
const DIGRAFI_MALA: Record<string, string> = { љ: "lj", њ: "nj", џ: "dž" };
const DIGRAFI_VELIKA_SVE: Record<string, string> = { Љ: "LJ", Њ: "NJ", Џ: "DŽ" };
const DIGRAFI_VELIKA_PRVO: Record<string, string> = { Љ: "Lj", Њ: "Nj", Џ: "Dž" };

export function cirilicaULatinicu(tekst: string): string {
  const sveVelikoSlova = tekst === tekst.toUpperCase();
  let rezultat = "";
  for (const slovo of tekst) {
    if (slovo in DIGRAFI_MALA) {
      rezultat += DIGRAFI_MALA[slovo];
    } else if (slovo in DIGRAFI_VELIKA_SVE) {
      rezultat += sveVelikoSlova ? DIGRAFI_VELIKA_SVE[slovo] : DIGRAFI_VELIKA_PRVO[slovo];
    } else if (slovo in MALA_SLOVA) {
      rezultat += MALA_SLOVA[slovo];
    } else if (slovo in VELIKA_SLOVA) {
      rezultat += VELIKA_SLOVA[slovo];
    } else {
      rezultat += slovo;
    }
  }
  return rezultat;
}
