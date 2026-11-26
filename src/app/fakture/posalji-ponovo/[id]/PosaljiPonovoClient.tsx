// "Pošalji ponovo" na već poslatoj/plaćenoj fakturi (zadatak tačka 3, Korak 8d ispravka) - ISTI ekran
// slanja (InvoiceSendStage, Fak11/Fak12) kao prvo slanje, popunjen već postojećim podacima fakture
// (klijent, mejl, stavke se ne menjaju - rezim="ponovo" u InvoiceSendStage sprečava čuvanje nacrta).
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TemaProvider } from "@/components/app-shell/TemaContext";
import { InvoiceSendStage, type PotvrdaSlanja } from "@/components/invoice/InvoiceSendStage";
import type { KlijentZaFakturu, RacunZaFakturu, StavkaForme } from "@/components/invoice/InvoiceEditor";
import type { Tema } from "@/lib/theme";

export function PosaljiPonovoClient({
  id,
  broj,
  klijent,
  valuta,
  jezik,
  ukupno,
  rokDana,
  firma,
  account,
  stavke,
  datumIzdavanja,
  tema,
}: {
  id: string;
  broj: string;
  klijent: KlijentZaFakturu | null;
  valuta: string;
  jezik: "sr" | "en";
  ukupno: number;
  rokDana: number;
  firma: { ownerName: string; name: string; mb: string; pib: string; street: string | null; city: string | null };
  account: RacunZaFakturu | null;
  stavke: StavkaForme[];
  datumIzdavanja: Date;
  tema: Tema;
}) {
  const router = useRouter();
  const [potvrda, setPotvrda] = useState<PotvrdaSlanja | null>(null);

  return (
    <div className="appShell" data-theme={tema === "sistem" ? undefined : tema}>
      <TemaProvider initialTema={tema}>
        <InvoiceSendStage
          id={id}
          broj={broj}
          klijent={klijent}
          valuta={valuta}
          jezik={jezik}
          ukupno={ukupno}
          rokDana={rokDana}
          firma={firma}
          account={account}
          stavke={stavke}
          datumIzdavanja={datumIzdavanja}
          posalji={potvrda}
          onPosalji={setPotvrda}
          onNazad={() => router.push(`/fakture/${id}`)}
          onZatvoriPoslato={() => router.push(`/fakture/${id}`)}
          rezim="ponovo"
        />
      </TemaProvider>
    </div>
  );
}
