// TODO: ukloni ovo ograničenje kad admin dobije TOTP dvostepenu prijavu (spec 4.1 / Korak 1 napomena).
// Dok TOTP ne postoji, admin se magic linkom prijavljuje samo u razvojnom režimu, nikad u produkciji.
export function jeDozvoljenaAdminPrijava(): boolean {
  return process.env.NODE_ENV === "development";
}
