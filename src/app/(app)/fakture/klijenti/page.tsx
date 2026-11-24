import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getClientsForUser } from "@/lib/clients";
import { getInvoicesForUser } from "@/lib/invoices";
import { getAccountsForUser } from "@/lib/bank-accounts";
import { KlijentiTab } from "./KlijentiTab";
import type { KlijentRed } from "./klijenti-tipovi";

export const instant = false;

export default async function KlijentiPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const [klijenti, fakture, racuni] = await Promise.all([
    getClientsForUser(session!.user.id),
    getInvoicesForUser(session!.user.id),
    getAccountsForUser(session!.user.id),
  ]);

  const poslednjaPoKlijentu = new Map<string, Date>();
  const brojFakturaPoKlijentu = new Map<string, number>();
  for (const f of fakture) {
    brojFakturaPoKlijentu.set(f.clientId, (brojFakturaPoKlijentu.get(f.clientId) ?? 0) + 1);
    const trenutna = poslednjaPoKlijentu.get(f.clientId);
    if (!trenutna || f.issueDate > trenutna) poslednjaPoKlijentu.set(f.clientId, f.issueDate);
  }

  const redovi: KlijentRed[] = klijenti.map((k) => ({
    id: k.id,
    name: k.name,
    billingEmail: k.billingEmail,
    country: k.country,
    pib: k.pib,
    address: k.address,
    defaultCurrency: k.defaultCurrency,
    defaultLang: k.defaultLang,
    defaultDueDays: k.defaultDueDays,
    defaultAccountId: k.defaultAccountId,
    defaultItemDesc: k.defaultItemDesc,
    defaultItemAmount: k.defaultItemAmount,
    autoSendMode: k.autoSendMode,
    fxMode: k.fxMode,
    archived: k.archived,
    poslednjaFaktura: poslednjaPoKlijentu.get(k.id)?.toISOString() ?? null,
    imaFaktura: (brojFakturaPoKlijentu.get(k.id) ?? 0) > 0,
  }));

  return (
    <KlijentiTab
      klijenti={redovi}
      racuni={racuni.map((r) => ({ id: r.id, currency: r.currency, bank: r.bank, iban: r.iban, number: r.number }))}
      brojevi={{ fakture: fakture.length, klijenti: klijenti.length, ponavljajuce: 0 }}
    />
  );
}
