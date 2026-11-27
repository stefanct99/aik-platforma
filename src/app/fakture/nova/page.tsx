import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { trebaPreusmeravanjeNaPrijavu } from "@/lib/auth-guard";
import { jeDozvoljenaAdminPrijava } from "@/lib/admin-dev-gate";
import { trebaPreusmeravanjeNaOnboarding } from "@/lib/onboarding-guard";
import { getBusinessForUser } from "@/lib/business";
import { getClientsForUser } from "@/lib/clients";
import { getAccountsForUser } from "@/lib/bank-accounts";
import { getInvoiceForUser, pogledajSledeciBroj } from "@/lib/invoices";
import { svaSablonaZaDodelu } from "@/lib/invoice-templates-db";
import { pocetakDanaUtc } from "@/lib/datum";
import { isValidTema } from "@/lib/theme";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";

// Standalone ruta (NAMERNO van (app) grupe - bez AppShell-a, isto obrazloženje kao
// /fakture/[id]/dokument/page.tsx): frejm Fak3 nema meni/gornju traku aplikacije, ovo je pun ekran preko
// svega, sa sopstvenom gornjom trakom ("Zatvori"/status) i plutajućim prekidačem teme.
export const instant = false;

export default async function NovaFakturaPage({
  searchParams,
}: {
  searchParams: Promise<{ dupliraj?: string }>;
}) {
  const { dupliraj } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (trebaPreusmeravanjeNaPrijavu(session, jeDozvoljenaAdminPrijava())) redirect("/prijava");

  const biznis = await getBusinessForUser(session!.user.id);
  if (trebaPreusmeravanjeNaOnboarding(biznis?.onboardingCompletedAt)) redirect("/onboarding");

  const [klijenti, racuni] = await Promise.all([
    getClientsForUser(session!.user.id),
    getAccountsForUser(session!.user.id),
  ]);

  let pocetniDuplikat = null;
  if (dupliraj) {
    const izvor = await getInvoiceForUser(session!.user.id, dupliraj);
    if (izvor) {
      pocetniDuplikat = {
        clientId: izvor.clientId,
        currency: izvor.currency,
        lang: (izvor.lang === "en" ? "en" : "sr") as "sr" | "en",
        dueDays: izvor.dueDays,
        accountId: izvor.accountId,
        note: izvor.note,
        items: izvor.items.map((st) => ({ desc: st.desc, qty: st.qty, price: st.price })),
      };
    }
  }

  const sledeciBroj = await pogledajSledeciBroj(biznis!.id, pocetakDanaUtc());
  // Nova faktura nikad nije poslata - zamrznutSablon je uvek null, uživo biranje po pravilu dodele
  // (Korak 8d-7b) počinje od onog što je korisnik izabrao kao klijenta/valutu/jezik u samoj formi.
  const sabloniZaDodelu = await svaSablonaZaDodelu(biznis!.id);

  return (
    <InvoiceEditor
      // key (bug nađen uživo, Korak 8b ispravka): Next.js App Router ne garantuje remount
      // InvoiceEditor-a samo zato što su se searchParams promenili na ISTOJ putanji (npr. Dupliraj sa
      // liste dok je korisnik VEĆ na /fakture/nova) - bez ovoga bi ostalo staro stanje forme (broj,
      // klijent, stavke od PRETHODNE fakture) i izazivalo pogrešne provere (npr. broj se više ne
      // poklapa sa novim datumom izdavanja). key tera React da napravi potpuno nov primerak.
      key={pocetniDuplikat ? `dupliraj-${dupliraj}` : "nova"}
      postojeca={null}
      pocetniDuplikat={pocetniDuplikat}
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
      sledeciBroj={sledeciBroj}
      tema={isValidTema(session!.user.theme) ? session!.user.theme : "sistem"}
      zamrznutSablon={null}
      sabloniZaDodelu={sabloniZaDodelu}
    />
  );
}
