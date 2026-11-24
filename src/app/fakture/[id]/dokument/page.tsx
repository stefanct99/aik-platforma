import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBusinessForUser } from "@/lib/business";
import { getInvoiceForUser } from "@/lib/invoices";
import { InvoiceDoc } from "@/components/invoice/InvoiceDoc";

// Standalone ruta (NAMERNO van (app) grupe - bez AppShell-a): ovo je stranica koju otvara headless Chrome
// (src/lib/pdf.ts) da napravi PDF, i koju "Kako je klijent vidi" koristi za uživo pregled. Vlasništvo se
// proverava ovde (getInvoiceForUser već filtrira po firmi prijavljenog korisnika), isto kao svuda.
export const instant = false;

export default async function DokumentFakturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");

  const faktura = await getInvoiceForUser(session.user.id, id);
  if (!faktura) notFound();
  const biznis = await getBusinessForUser(session.user.id);
  if (!biznis) notFound();

  return (
    <div style={{ margin: 0, background: "#fff" }}>
      <InvoiceDoc
        broj={faktura.number}
        valuta={faktura.currency}
        jezik={faktura.lang === "sr" ? "sr" : "en"}
        datumIzdavanja={faktura.issueDate}
        dueDays={faktura.dueDays}
        stavke={faktura.items.map((st) => ({ desc: st.desc, qty: st.qty, price: st.price }))}
        klijent={faktura.client}
        firma={{
          ownerName: biznis.ownerName,
          name: biznis.name,
          mb: biznis.mb,
          pib: biznis.pib,
          street: biznis.street,
          city: biznis.city,
        }}
        racun={faktura.account}
      />
    </div>
  );
}
