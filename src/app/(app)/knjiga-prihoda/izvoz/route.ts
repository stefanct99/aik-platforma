// Izvoz Knjige prihoda (Korak 9g-1/9g-2, dijalog Kp6, "Izvezi") - GET ruta, isti obrazac kao
// /api/izvoz-podataka (sesija -> 401, inače obrada -> binarni odgovor). businessId NIKAD iz parametara -
// uvek iz sesije (pripremiIzvoz -> getBusinessForUser(userId), ista izolacija kao ostatak Knjige prihoda).
// Ruta je namerno TANKA (sva logika je u izvoz-prihoda*.ts, koji se testiraju vitest-om) - isti razlog kao
// actions.ts, zato ova datoteka nema sopstveni vitest test (vidi izveštaj).
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { napraviIzvozExcel } from "@/lib/izvoz-prihoda-xlsx";
import { napraviIzvozHtml } from "@/lib/izvoz-prihoda-pdf";
import {
  imeFajlaIzvoza,
  jePrazanIzvoz,
  parsirajBool,
  parsirajFormat,
  parsirajGodinu,
  parsirajPeriod,
} from "@/lib/izvoz-prihoda";
import { pripremiIzvoz } from "@/lib/izvoz-prihoda-db";
import { renderujIzvozUPdf } from "@/lib/pdf";
import { godinePrihoda } from "@/lib/prihodi";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ greska: "Nisi prijavljen." }, { status: 401 });
  }

  const danas = new Date();
  const parametri = new URL(request.url).searchParams;
  const godina = parsirajGodinu(
    parametri.get("godina"),
    godinePrihoda(danas),
  );
  const period = parsirajPeriod(parametri.get("period"));
  const format = parsirajFormat(parametri.get("format"));
  const odvojeno = parsirajBool(parametri.get("odvojeno"));
  const zbir = parsirajBool(parametri.get("zbir"));

  if (godina == null || period == null || format == null) {
    return NextResponse.json({ greska: "Nevažeći parametri." }, { status: 400 });
  }

  const podaci = await pripremiIzvoz(
    session.user.id,
    godina,
    period,
    odvojeno,
    zbir,
    danas,
  );
  if (!podaci) {
    return NextResponse.json({ greska: "Firma ne postoji." }, { status: 400 });
  }

  if (jePrazanIzvoz(podaci.tabele)) {
    return NextResponse.json({ prazno: true });
  }

  if (format === "pdf") {
    let bafer: Buffer;
    try {
      const html = napraviIzvozHtml(podaci.tabele, podaci.firma, godina, period, danas);
      bafer = await renderujIzvozUPdf(html);
    } catch {
      // Chrome nije dostupan ili render nije uspeo (zadatak) - jedina dodata poruka, dijalog je prikazuje
      // direktno (IzveziDialog.tsx čita "greska" iz JSON odgovora).
      return NextResponse.json(
        { greska: "Izvoz nije uspeo. Pokušaj ponovo." },
        { status: 500 },
      );
    }
    const imeFajla = imeFajlaIzvoza(godina, period, "pdf");
    return new NextResponse(new Uint8Array(bafer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${imeFajla}"`,
      },
    });
  }

  const bafer = napraviIzvozExcel(
    podaci.tabele,
    podaci.firma,
    godina,
    period,
    danas,
  );
  const imeFajla = imeFajlaIzvoza(godina, period, "excel");
  return new NextResponse(new Uint8Array(bafer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${imeFajla}"`,
    },
  });
}
