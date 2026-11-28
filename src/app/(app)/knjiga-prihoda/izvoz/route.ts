// Izvoz Knjige prihoda (Korak 9g-1, dijalog Kp6, "Izvezi") - GET ruta, isti obrazac kao
// /api/izvoz-podataka (sesija -> 401, inače obrada -> binarni odgovor). businessId NIKAD iz parametara -
// uvek iz sesije (pripremiIzvoz -> getBusinessForUser(userId), ista izolacija kao ostatak Knjige prihoda).
// Ruta je namerno TANKA (sva logika je u izvoz-prihoda.ts/-db.ts, koji se testiraju vitest-om) - isti
// razlog kao actions.ts, zato ova datoteka nema sopstveni vitest test (vidi izveštaj).
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { napraviIzvozExcel } from "@/lib/izvoz-prihoda-xlsx";
import {
  imeFajlaIzvoza,
  jePrazanIzvoz,
  parsirajBool,
  parsirajFormat,
  parsirajGodinu,
  parsirajPeriod,
} from "@/lib/izvoz-prihoda";
import { pripremiIzvoz } from "@/lib/izvoz-prihoda-db";
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
  // PDF (Korak 9g-2) - dijalog ovu granu ne zove (poruku "PDF izvoz stiže uskoro." prikazuje sam, bez
  // poziva rute, vidi IzveziDialog.tsx), ali ruta ipak ne sme tiho da "uspe" za format koji ne ume da
  // napravi ako je neko pozove direktno.
  if (format === "pdf") {
    return NextResponse.json(
      { greska: "PDF izvoz stiže uskoro." },
      { status: 400 },
    );
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
