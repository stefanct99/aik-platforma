// Izolovana funkcija za slanje mejlova (Korak 5): ISTA funkcija za sve mejlove (magic link, potvrda
// e-maila, reset lozinke). TODO: zameniti pravim servisom za transakcione mejlove sa verifikovanim
// domenom (Plan prelaska, odeljak 2). Dok taj servis ne postoji, link se samo ispisuje ovde.
export async function posaljiRazvojniMejl(to: string, naslov: string, url: string): Promise<void> {
  console.log(`\n[RAZVOJNI REŽIM] ${naslov} za ${to}:\n${url}\n`);
}
