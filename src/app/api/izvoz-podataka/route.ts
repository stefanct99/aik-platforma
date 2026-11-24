import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { napraviIzvozPodataka } from "@/lib/data-export";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new NextResponse("Nisi prijavljen.", { status: 401 });

  const zip = await napraviIzvozPodataka(session.user.id);
  return new NextResponse(new Uint8Array(zip), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="izvoz-podataka.zip"',
    },
  });
}
