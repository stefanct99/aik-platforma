export type SesijaKorisnika =
  | { user: { email: string; role?: string | null } }
  | null
  | undefined;

export function trebaPreusmeravanjeNaPrijavu(
  sesija: SesijaKorisnika,
  adminPrijavaDozvoljena: boolean,
): boolean {
  if (!sesija) return true;
  if (sesija.user.role === "admin" && !adminPrijavaDozvoljena) return true;
  return false;
}
