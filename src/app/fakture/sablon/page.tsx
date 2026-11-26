import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { trebaPreusmeravanjeNaPrijavu } from "@/lib/auth-guard";
import { jeDozvoljenaAdminPrijava } from "@/lib/admin-dev-gate";
import { trebaPreusmeravanjeNaOnboarding } from "@/lib/onboarding-guard";
import { getBusinessForUser } from "@/lib/business";
import { getAccountsForUser } from "@/lib/bank-accounts";
import { ucitajPodrazumevaniSablon } from "@/lib/invoice-templates-db";
import { isValidTema } from "@/lib/theme";
import { TemplateEditorClient } from "./TemplateEditorClient";

// Standalone ruta (van (app) grupe, isto obrazloženje kao /fakture/nova): editor šablona je pun ekran
// preko svega, sa sopstvenom gornjom trakom (Fak18), ne stranica unutar AppShell-a.
export const instant = false;

export default async function SablonFakturePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (trebaPreusmeravanjeNaPrijavu(session, jeDozvoljenaAdminPrijava())) redirect("/prijava");

  const biznis = await getBusinessForUser(session!.user.id);
  if (trebaPreusmeravanjeNaOnboarding(biznis?.onboardingCompletedAt)) redirect("/onboarding");

  const sablon = await ucitajPodrazumevaniSablon(biznis!.id);
  const racuni = await getAccountsForUser(session!.user.id);
  // "Primer podataka" (Korak 8d-4 tačka 4, frejm Fak18): platno crta probnu fakturu sa stvarnim podacima
  // firme/računa prijavljenog korisnika (isto kao u prototipu, gde je firma takođe stvarna), ali sa
  // izmišljenim klijentom/stavkama (isti klijent i stavke kao u prototipovoj TemplateEditor funkciji -
  // "Acme Inc.", "Webflow development"/"Additional design revisions", EUR, engleski) - fakture sa ovim
  // brojem NE postoji u bazi, ovo se nigde ne čuva.
  const racunZaPrikaz = racuni.find((r) => r.currency === "EUR") ?? racuni[0] ?? null;

  return (
    <TemplateEditorClient
      sablon={sablon}
      firma={{
        ownerName: biznis!.ownerName,
        name: biznis!.name,
        mb: biznis!.mb,
        pib: biznis!.pib,
        street: biznis!.street,
        city: biznis!.city,
      }}
      racun={
        racunZaPrikaz
          ? {
              id: racunZaPrikaz.id,
              currency: racunZaPrikaz.currency,
              type: racunZaPrikaz.type,
              bank: racunZaPrikaz.bank,
              iban: racunZaPrikaz.iban,
              swift: racunZaPrikaz.swift,
              number: racunZaPrikaz.number,
            }
          : null
      }
      tema={isValidTema(session!.user.theme) ? session!.user.theme : "sistem"}
    />
  );
}
