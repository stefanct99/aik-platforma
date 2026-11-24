import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getInvoicesForUser } from "@/lib/invoices";
import { getClientsForUser } from "@/lib/clients";
import { FaktureHeader } from "@/components/fakture/FaktureHeader";
import { DolaziUskoro } from "@/components/app-shell/DolaziUskoro";

export const instant = false;

// Podtab Ponavljajuće (Korak 8a, tačka 1): samo naslov i kratka poruka da stiže u narednom koraku -
// namerno BEZ izgleda iz frejma Fak13 (zadatak izričito traži da se ne izmišlja izgled pre nego što se
// stvarno gradi).
export default async function PonavljajucePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const [fakture, klijenti] = await Promise.all([
    getInvoicesForUser(session!.user.id),
    getClientsForUser(session!.user.id),
  ]);

  return (
    <>
      <FaktureHeader brojevi={{ fakture: fakture.length, klijenti: klijenti.length, ponavljajuce: 0 }} />
      <div style={{ marginTop: "var(--space-5)" }}>
        <DolaziUskoro />
      </div>
    </>
  );
}
