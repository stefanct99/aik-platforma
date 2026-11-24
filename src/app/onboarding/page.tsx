import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { trebaPreusmeravanjeNaPrijavu } from "@/lib/auth-guard";
import { jeDozvoljenaAdminPrijava } from "@/lib/admin-dev-gate";
import { trebaPreusmeravanjeNaPocetnu } from "@/lib/onboarding-guard";
import { getBusinessForUser } from "@/lib/business";
import { isValidTema } from "@/lib/theme";
import { composeInboundAddress } from "@/lib/inbound-mail";
import { Step1Form } from "./Step1Form";
import { Step2Form } from "./Step2Form";
import { Step3Mail } from "./Step3Mail";
import { Step4Summary } from "./Step4Summary";

// Zavisi od sesije (headers()), ne može da se unapred generiše statički (isto kao /pocetna).
export const instant = false;

function naDatumString(datum: Date | null | undefined): string {
  if (!datum) return "";
  return datum.toISOString().slice(0, 10);
}

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (trebaPreusmeravanjeNaPrijavu(session, jeDozvoljenaAdminPrijava())) {
    redirect("/prijava");
  }

  const biznis = await getBusinessForUser(session!.user.id);

  if (trebaPreusmeravanjeNaPocetnu(biznis?.onboardingCompletedAt)) {
    redirect("/pocetna");
  }

  const tema = isValidTema(session!.user.theme) ? session!.user.theme : "sistem";
  const korak = biznis?.onboardingStep ?? 1;

  if (korak <= 1) {
    return (
      <Step1Form
        tema={tema}
        initial={{
          name: biznis?.name ?? "",
          pib: biznis?.pib ?? "",
          mb: biznis?.mb ?? "",
          delatnostCode: biznis?.delatnostCode ?? "",
          delatnostName: biznis?.delatnostName ?? "",
          regDate: naDatumString(biznis?.regDate),
        }}
      />
    );
  }

  if (korak === 2) {
    return (
      <Step2Form
        tema={tema}
        initial={{
          street: biznis?.street ?? "",
          city: biznis?.city ?? "",
          zip: biznis?.zip ?? "",
        }}
      />
    );
  }

  if (korak === 3) {
    return (
      <Step3Mail tema={tema} adresa={composeInboundAddress(biznis!.inboundSlug, biznis!.inboundCode)} />
    );
  }

  return (
    <Step4Summary
      tema={tema}
      businessName={biznis!.name}
      pib={biznis!.pib}
      street={biznis!.street ?? ""}
      zip={biznis!.zip ?? ""}
      city={biznis!.city ?? ""}
    />
  );
}
