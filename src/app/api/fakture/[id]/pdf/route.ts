import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInvoiceForUser } from "@/lib/invoices";
import { renderujFakturuUPdf } from "@/lib/pdf";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const zaglavlja = await headers();
  const session = await auth.api.getSession({ headers: zaglavlja });
  if (!session) return new NextResponse("Nisi prijavljen.", { status: 401 });

  // Vlasništvo se proverava i OVDE (ne samo u /fakture/[id]/dokument koju headless Chrome otvara) - da
  // greška u puppeteer sloju nikad ne bude jedina linija odbrane.
  const faktura = await getInvoiceForUser(session.user.id, id);
  if (!faktura) return new NextResponse("Faktura ne postoji.", { status: 404 });

  const host = zaglavlja.get("host") ?? "localhost:3000";
  const protokol = host.startsWith("localhost") ? "http" : "https";
  const url = `${protokol}://${host}/fakture/${id}/dokument`;
  const kolacic = request.headers.get("cookie") ?? "";

  const pdf = await renderujFakturuUPdf(url, kolacic);
  const nazivFajla = `Invoice ${faktura.number.replace(/\//g, "-")}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nazivFajla}"`,
    },
  });
}
