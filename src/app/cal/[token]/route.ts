import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generisiPrazanIcs } from "@/lib/calendar-ics";

// Javna ruta (spec 7.13, Povezivanje): token u putanji JESTE autentikacija (kao svaki privatni link za
// pretplatu na kalendar - Google/Apple kalendar ga pozivaju bez prijave). Zato nema provere sesije ovde,
// samo provere da token postoji. "Generiši novi" (vidi actions.ts) odmah poništava stari token.
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const biznis = await prisma.business.findUnique({ where: { calendarToken: token } });
  if (!biznis) {
    return new NextResponse("Link nije pronađen.", { status: 404 });
  }

  const ics = generisiPrazanIcs(`${biznis.name} - tvoj AI knjigovođa`);
  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "inline; filename=kalendar.ics",
      "Cache-Control": "no-store",
    },
  });
}
