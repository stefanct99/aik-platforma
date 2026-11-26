import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { trebaPreusmeravanjeNaPrijavu } from "@/lib/auth-guard";
import { jeDozvoljenaAdminPrijava } from "@/lib/admin-dev-gate";
import { trebaPreusmeravanjeNaOnboarding } from "@/lib/onboarding-guard";
import { getBusinessForUser } from "@/lib/business";
import { getInvoiceForUser } from "@/lib/invoices";
import { izracunajUkupno } from "@/lib/invoice-status";
import { isValidTema } from "@/lib/theme";
import { PosaljiPonovoClient } from "./PosaljiPonovoClient";

// Standalone ruta (van (app) grupe, isto kao /fakture/nova i /fakture/izmeni/[id]) - "Pošalji ponovo"
// (zadatak tačka 3) otvara isti ekran slanja (InvoiceSendStage) kao prvo slanje, popunjen već
// postojećim podacima fakture. Dozvoljeno samo za poslata/placena (nacrt nema šta da se "pošalje
// ponovo", još nije ni poslat prvi put; stornirana se ne šalje uopšte) - u svim ostalim stanjima se
// vraća na pregled fakture.
export const instant = false;

export default async function PosaljiPonovoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (trebaPreusmeravanjeNaPrijavu(session, jeDozvoljenaAdminPrijava())) redirect("/prijava");

  const biznis = await getBusinessForUser(session!.user.id);
  if (trebaPreusmeravanjeNaOnboarding(biznis?.onboardingCompletedAt)) redirect("/onboarding");

  const faktura = await getInvoiceForUser(session!.user.id, id);
  if (!faktura) notFound();
  if (faktura.status !== "poslata" && faktura.status !== "placena") redirect(`/fakture/${id}`);

  return (
    <PosaljiPonovoClient
      id={faktura.id}
      broj={faktura.number}
      klijent={{
        id: faktura.client.id,
        name: faktura.client.name,
        billingEmail: faktura.client.billingEmail,
        defaultCurrency: faktura.client.defaultCurrency,
        defaultLang: (faktura.client.defaultLang === "en" ? "en" : "sr") as "sr" | "en",
        defaultDueDays: faktura.client.defaultDueDays,
        defaultAccountId: faktura.client.defaultAccountId,
        defaultItemDesc: faktura.client.defaultItemDesc,
        defaultItemAmount: faktura.client.defaultItemAmount,
        country: faktura.client.country,
        pib: faktura.client.pib,
        address: faktura.client.address,
      }}
      valuta={faktura.currency}
      jezik={faktura.lang === "en" ? "en" : "sr"}
      ukupno={izracunajUkupno(faktura.items)}
      rokDana={faktura.dueDays}
      firma={{
        ownerName: biznis!.ownerName,
        name: biznis!.name,
        mb: biznis!.mb,
        pib: biznis!.pib,
        street: biznis!.street,
        city: biznis!.city,
      }}
      account={
        faktura.account
          ? {
              id: faktura.account.id,
              currency: faktura.account.currency,
              type: faktura.account.type,
              bank: faktura.account.bank,
              iban: faktura.account.iban,
              swift: faktura.account.swift,
              number: faktura.account.number,
            }
          : null
      }
      stavke={faktura.items.map((st) => ({ desc: st.desc, qty: st.qty, price: st.price }))}
      datumIzdavanja={faktura.issueDate}
      tema={isValidTema(session!.user.theme) ? session!.user.theme : "sistem"}
    />
  );
}
