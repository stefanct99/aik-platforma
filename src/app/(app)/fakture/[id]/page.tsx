import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBusinessForUser } from "@/lib/business";
import { getInvoiceForUser } from "@/lib/invoices";
import { ucitajSablonZaFakturu } from "@/lib/invoice-templates-db";
import { pocetakDanaUtc } from "@/lib/datum";
import { InvoiceDetailView } from "./InvoiceDetailView";

export const instant = false;

export default async function FakturaDetaljPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");

  const faktura = await getInvoiceForUser(session.user.id, id);
  if (!faktura) notFound();
  const biznis = await getBusinessForUser(session.user.id);
  if (!biznis) notFound();
  const sablon = await ucitajSablonZaFakturu(faktura);

  return (
    <InvoiceDetailView
      invoice={{
        id: faktura.id,
        number: faktura.number,
        status: faktura.status as "nacrt" | "poslata" | "placena" | "stornirana",
        currency: faktura.currency,
        lang: faktura.lang === "sr" ? "sr" : "en",
        issueDate: faktura.issueDate.toISOString(),
        dueDays: faktura.dueDays,
        note: faktura.note,
        voidedAt: faktura.voidedAt ? faktura.voidedAt.toISOString() : null,
        client: {
          id: faktura.client.id,
          name: faktura.client.name,
          billingEmail: faktura.client.billingEmail,
          address: faktura.client.address,
          country: faktura.client.country,
        },
        account: faktura.account
          ? {
              bank: faktura.account.bank,
              type: faktura.account.type,
              number: faktura.account.number,
              iban: faktura.account.iban,
              swift: faktura.account.swift,
              currency: faktura.account.currency,
            }
          : null,
        items: faktura.items.map((st) => ({ desc: st.desc, qty: st.qty, price: st.price })),
        events: faktura.events.map((e) => ({ tip: e.tip, datum: e.datum.toISOString() })),
        incomes: faktura.incomes.map((i) => ({ source: i.source, date: i.date.toISOString() })),
      }}
      business={{
        ownerName: biznis.ownerName,
        name: biznis.name,
        mb: biznis.mb,
        pib: biznis.pib,
        street: biznis.street,
        city: biznis.city,
      }}
      danasIso={pocetakDanaUtc().toISOString()}
      sablon={sablon}
    />
  );
}
