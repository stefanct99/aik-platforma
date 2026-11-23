// TODO: zameniti pravim servisom za transakcione mejlove sa verifikovanim domenom
// (Plan prelaska, odeljak 2). Dok taj servis ne postoji, link se samo ispisuje ovde.
export async function sendMagicLinkEmail(to: string, url: string): Promise<void> {
  console.log(`\n[RAZVOJNI REŽIM] Link za prijavu za ${to}:\n${url}\n`);
}
