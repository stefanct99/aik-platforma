import { prisma } from "./prisma";
import type { FormatDatuma } from "./datum";

const VALIDNI_FORMATI_DATUMA: readonly FormatDatuma[] = ["dmy", "iso"];
export function isValidFormatDatuma(vrednost: string | null | undefined): vrednost is FormatDatuma {
  return VALIDNI_FORMATI_DATUMA.includes(vrednost as FormatDatuma);
}

// Izgled (Korak 4b, spec 7.13, Pd7/Dk_Pd7): lično podešavanje korisnika, čuva se na User.theme.
export type Tema = "svetli" | "tamni" | "sistem";

const VALIDNE_TEME: readonly Tema[] = ["svetli", "tamni", "sistem"];

export function isValidTema(vrednost: string | null | undefined): vrednost is Tema {
  return VALIDNE_TEME.includes(vrednost as Tema);
}

// Menja ISKLJUČIVO temu trenutnog korisnika (userId dolazi iz sesije u akciji, nikad iz forme), zato
// korisnik A ne može ovim pozivom da promeni temu korisniku B.
export async function updateUserTheme(userId: string, tema: Tema) {
  return prisma.user.update({ where: { id: userId }, data: { theme: tema } });
}

// Jezik (Korak 7, Pd7): čuva se, ali NE prevodi interfejs u ovom koraku (nema prevoda teksta - ekran ne
// dobija nikakav novi tekst zbog ovoga, navedeno u izveštaju).
export type Jezik = "sr-lat" | "sr-cir" | "en";
const VALIDNI_JEZICI: readonly Jezik[] = ["sr-lat", "sr-cir", "en"];
export function isValidJezik(vrednost: string | null | undefined): vrednost is Jezik {
  return VALIDNI_JEZICI.includes(vrednost as Jezik);
}

export async function updateUserJezikIFormat(
  userId: string,
  jezik: Jezik,
  formatDatuma: FormatDatuma,
) {
  return prisma.user.update({ where: { id: userId }, data: { jezik, formatDatuma } });
}
