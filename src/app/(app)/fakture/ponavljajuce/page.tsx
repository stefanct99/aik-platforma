import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getInvoicesForUser, getInvoiceForUser } from "@/lib/invoices";
import { getClientsForUser } from "@/lib/clients";
import { getRecurringInvoicesForUser } from "@/lib/recurring-invoices";
import { PonavljajuceTab, type PonavljajucaListRed } from "./PonavljajuceTab";

export const instant = false;

// Tab Ponavljajuće (Korak 8c, frejm Fak13/Fak14/Fak16, spec 6.8). "odFakture" (Fak16 "Napravi
// ponavljajuću od ove") predpopunjava formu Nova ponavljajuća faktura sa klijentom/opisom/iznosom
// iz izvorne fakture (samo prvom stavkom - faktura sa više stavki nema jedinstven "opis/iznos" da se
// prenese, zadatak/frejm ovo ne pokrivaju za taj slučaj, preneta je samo prva stavka).
export default async function PonavljajucePage({
  searchParams,
}: {
  searchParams: Promise<{ odFakture?: string }>;
}) {
  const { odFakture } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const [fakture, klijenti, ponavljajuce] = await Promise.all([
    getInvoicesForUser(session!.user.id),
    getClientsForUser(session!.user.id),
    getRecurringInvoicesForUser(session!.user.id),
  ]);

  let prefill: { clientId: string; desc: string | null; amount: number | null } | null = null;
  if (odFakture) {
    const izvor = await getInvoiceForUser(session!.user.id, odFakture);
    if (izvor) {
      const prvaStavka = izvor.items[0];
      prefill = { clientId: izvor.clientId, desc: prvaStavka?.desc ?? null, amount: prvaStavka?.price ?? null };
    }
  }

  const stavke: PonavljajucaListRed[] = ponavljajuce.map((r) => ({
    id: r.id,
    clientId: r.clientId,
    clientName: r.client.name,
    currency: r.client.defaultCurrency,
    desc: r.desc,
    amount: r.amount,
    dayOfMonth: r.dayOfMonth,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate ? r.endDate.toISOString() : null,
    mode: r.mode as "ask" | "auto",
    status: r.status as "aktivna" | "pauzirana",
    nextDate: r.nextDate.toISOString(),
  }));

  return (
    <PonavljajuceTab
      stavke={stavke}
      klijenti={klijenti.map((k) => ({
        id: k.id,
        name: k.name,
        billingEmail: k.billingEmail,
        defaultItemDesc: k.defaultItemDesc,
        defaultItemAmount: k.defaultItemAmount,
      }))}
      brojevi={{ fakture: fakture.length, klijenti: klijenti.length, ponavljajuce: ponavljajuce.length }}
      prefill={prefill}
    />
  );
}
