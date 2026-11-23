import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { trebaPreusmeravanjeNaPrijavu } from "@/lib/auth-guard";
import { jeDozvoljenaAdminPrijava } from "@/lib/admin-dev-gate";
import { trebaPreusmeravanjeNaPocetnu } from "@/lib/onboarding-guard";
import { getBusinessForUser } from "@/lib/business";
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

  const korak = biznis?.onboardingStep ?? 1;

  if (korak <= 1) {
    return (
      <Step1Form
        initial={{
          ownerName: session!.user.name || "",
          name: biznis?.name ?? "",
          pib: biznis?.pib ?? "",
          mb: biznis?.mb ?? "",
          delatnostCode: biznis?.delatnostCode ?? "6201",
          regDate: naDatumString(biznis?.regDate),
        }}
      />
    );
  }

  if (korak === 2) {
    return (
      <Step2Form
        initial={{
          street: biznis?.street ?? "",
          city: biznis?.city ?? "",
          zip: biznis?.zip ?? "",
        }}
      />
    );
  }

  if (korak === 3) {
    return <Step3Mail />;
  }

  return (
    <Step4Summary
      businessName={biznis!.name}
      pib={biznis!.pib}
      street={biznis!.street ?? ""}
      zip={biznis!.zip ?? ""}
      city={biznis!.city ?? ""}
    />
  );
}
