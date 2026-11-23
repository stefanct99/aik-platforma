// Jedino mesto koje čita šifre delatnosti (src/data/kd/*). Ekrani i baza ne čitaju te spiskove
// direktno, uvek kroz ove funkcije, da promena klasifikacije kasnije (npr. KD 2030) ne traži
// prepravku ekrana, samo novi spisak ovde.
import { KD2025, type KDRazred } from "@/data/kd/kd2025";
import { KD2010 } from "@/data/kd/kd2010";
import { TABELA_VEZA_KD2010_KD2025 } from "@/data/kd/tabela-veza";

export const AKTIVNA_VERZIJA_KLASIFIKACIJE = "KD2025";

function samoCifre(sifra: string): string {
  return sifra.replace(/\D/g, "");
}

export function isValidKD2025Code(code: string): boolean {
  return KD2025.some((r) => r.code === code);
}

export function findKD2025(code: string): KDRazred | null {
  return KD2025.find((r) => r.code === code) ?? null;
}

// Prihvata i oblik sa tačkom ("62.01") i stari oblik bez tačke ("6201"), isključivo tačno poklapanje
// (ne pretraga), koristi je scripts/migrate-business-delatnost-kd2025.ts.
export function findKD2010ByLegacyCode(input: string): KDRazred | null {
  const cifre = samoCifre(input);
  if (cifre.length !== 4) return null;
  const sifra = `${cifre.slice(0, 2)}.${cifre.slice(2)}`;
  return KD2010.find((r) => r.code === sifra) ?? null;
}

export type RezultatPretrageKD = {
  code: string;
  name: string;
  // Postavljeno kad je pogodak nađen preko STARE (KD 2010) šifre, radi napomene "ranije šifra X" u UI.
  staraSifra?: string;
};

// Pretražuje KD 2025 po: šifri (sa ili bez tačke, i deo šifre), delu naziva (bez obzira na veličinu
// slova), ili STAROJ KD 2010 šifri (vraća nove šifre na koje se ona preslikava, obeležene staraSifra).
export function pretraziKD2025(upit: string): RezultatPretrageKD[] {
  const tekst = upit.trim().toLowerCase();
  if (!tekst) return [];

  const rezultati = new Map<string, RezultatPretrageKD>();

  const cifre = samoCifre(tekst);
  if (cifre.length > 0) {
    for (const razred of KD2025) {
      if (samoCifre(razred.code).startsWith(cifre)) {
        rezultati.set(razred.code, { code: razred.code, name: razred.name });
      }
    }

    for (const staraRazred of KD2010) {
      if (samoCifre(staraRazred.code) === cifre) {
        for (const par of TABELA_VEZA_KD2010_KD2025) {
          if (par.staraSifra === staraRazred.code) {
            const nova = findKD2025(par.novaSifra);
            if (nova) {
              rezultati.set(nova.code, { code: nova.code, name: nova.name, staraSifra: staraRazred.code });
            }
          }
        }
      }
    }
  }

  for (const razred of KD2025) {
    if (razred.name.toLowerCase().includes(tekst)) {
      const postojeci = rezultati.get(razred.code);
      if (!postojeci) {
        rezultati.set(razred.code, { code: razred.code, name: razred.name });
      }
    }
  }

  return [...rezultati.values()].sort((a, b) => a.code.localeCompare(b.code));
}
