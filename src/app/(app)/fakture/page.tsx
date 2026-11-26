import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getInvoicesForUser } from "@/lib/invoices";
import { getClientsForUser } from "@/lib/clients";
import { getRecurringInvoicesForUser } from "@/lib/recurring-invoices";
import { izracunajUkupno } from "@/lib/invoice-status";
import { pocetakDanaUtc } from "@/lib/datum";
import { FaktureHeader } from "@/components/fakture/FaktureHeader";
import { FaktureListTab } from "./FaktureListTab";
import type { FakturaRed } from "@/lib/invoice-row";

export const instant = false;

export default async function FakturePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");

  const [fakture, klijenti, ponavljajuce] = await Promise.all([
    getInvoicesForUser(session.user.id),
    getClientsForUser(session.user.id),
    getRecurringInvoicesForUser(session.user.id),
  ]);

  const redovi: FakturaRed[] = fakture.map((f) => ({
    id: f.id,
    number: f.number,
    status: f.status as FakturaRed["status"],
    currency: f.currency,
    issueDate: f.issueDate.toISOString(),
    dueDays: f.dueDays,
    clientId: f.clientId,
    clientName: f.client.name,
    clientEmail: f.client.billingEmail,
    total: izracunajUkupno(f.items),
    paidDate: f.paidDate ? f.paidDate.toISOString() : null,
  }));

  return (
    <>
      <FaktureHeader brojevi={{ fakture: fakture.length, klijenti: klijenti.length, ponavljajuce: ponavljajuce.length }} />
      <FaktureListTab redovi={redovi} danasIso={pocetakDanaUtc().toISOString()} />
    </>
  );
}
