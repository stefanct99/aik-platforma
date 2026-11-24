import { prisma } from "./prisma";

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
