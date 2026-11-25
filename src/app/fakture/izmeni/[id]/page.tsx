import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { trebaPreusmeravanjeNaPrijavu } from "@/lib/auth-guard";
import { jeDozvoljenaAdminPrijava } from "@/lib/admin-dev-gate";
import { trebaPreusmeravanjeNaOnboarding } from "@/lib/onboarding-guard";
import { getBusinessForUser } from "@/lib/business";
import { getClientsForUser } from "@/lib/clients";
import { getAccountsForUser } from "@/lib/bank-accounts";
import { getInvoiceForUser } from "@/lib/invoices";
import { isValidTema } from "@/lib/theme";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";

// Standalone ruta (van (app) grupe, isto kao /fakture/nova) - "Nastavi uređivanje" (nacrt) I "Izmeni
// fakturu" (poslata, spec 6.9: dozvoljeno uz upozorenje) dele ISTU formu/komponentu, samo se razlikuje
// koji dugmad/upozorenje InvoiceEditor prikazuje za dati status. Plaćena/Stornirana se ne uređuju (zadatak
// tačka 7) - vraća na pregled fakture umesto 404 (jasnije za korisnika nego prazna stranica).
export const instant = false;

export default async function IzmeniFakturuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (trebaPreusmeravanjeNaPrijavu(session, jeDozvoljenaAdminPrijava())) redirect("/prijava");

  const biznis = await getBusinessForUser(session!.user.id);
  if (trebaPreusmeravanjeNaOnboarding(biznis?.onboardingCompletedAt)) redirect("/onboarding");

  const faktura = await getInvoiceForUser(session!.user.id, id);
  if (!faktura) notFound();
  if (faktura.status !== "nacrt" && faktura.status !== "poslata") redirect(`/fakture/${id}`);

  const [klijenti, racuni] = await Promise.all([
    getClientsForUser(session!.user.id),
    getAccountsForUser(session!.user.id),
  ]);

  return (
    <InvoiceEditor
      // key (bug nađen uživo, Korak 8b ispravka): bez ovoga, prelazak sa izmene JEDNE fakture na
      // drugu (isti page.tsx, samo drugačiji [id]) ne mora da remontira InvoiceEditor - ostalo bi staro
      // stanje forme (broj, trenutniId...) od PRETHODNE fakture. key=id tera pravi, nov primerak.
      key={id}
      postojeca={{
        id: faktura.id,
        broj: faktura.number,
        status: faktura.status as "nacrt" | "poslata",
        clientId: faktura.clientId,
        currency: faktura.currency,
        lang: faktura.lang === "en" ? "en" : "sr",
        issueDate: faktura.issueDate.toISOString(),
        dueDays: faktura.dueDays,
        accountId: faktura.accountId,
        note: faktura.note,
        items: faktura.items.map((st) => ({ desc: st.desc, qty: st.qty, price: st.price })),
      }}
      pocetniDuplikat={null}
      klijenti={klijenti.map((k) => ({
        id: k.id,
        name: k.name,
        billingEmail: k.billingEmail,
        defaultCurrency: k.defaultCurrency,
        defaultLang: (k.defaultLang === "en" ? "en" : "sr") as "sr" | "en",
        defaultDueDays: k.defaultDueDays,
        defaultAccountId: k.defaultAccountId,
        defaultItemDesc: k.defaultItemDesc,
        defaultItemAmount: k.defaultItemAmount,
        country: k.country,
        pib: k.pib,
        address: k.address,
      }))}
      racuni={racuni.map((r) => ({
        id: r.id,
        currency: r.currency,
        type: r.type,
        bank: r.bank,
        iban: r.iban,
        swift: r.swift,
        number: r.number,
      }))}
      firma={{
        ownerName: biznis!.ownerName,
        name: biznis!.name,
        mb: biznis!.mb,
        pib: biznis!.pib,
        street: biznis!.street,
        city: biznis!.city,
      }}
      sledeciBroj={faktura.number}
      tema={isValidTema(session!.user.theme) ? session!.user.theme : "sistem"}
    />
  );
}
