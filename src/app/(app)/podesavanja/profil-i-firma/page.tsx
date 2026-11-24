import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getBusinessForUser } from "@/lib/business";
import { formatDatumSrpski } from "@/lib/datum";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { ProfilFirmaForm } from "./ProfilFirmaForm";

// Zavisi od sesije (headers()). Prijava i onboarding su zaštićeni u src/app/(app)/layout.tsx.
export const instant = false;

export default async function ProfilFirmaPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const biznis = await getBusinessForUser(session!.user.id);

  return (
    <>
      <SettingsPageHeader
        naslov="Profil i firma"
        opis="Ovi podaci idu na tvoje fakture i izveštaje. Menjaš ih bez ponovnog podešavanja."
      />
      <ProfilFirmaForm
        initial={{
          ownerName: biznis!.ownerName,
          name: biznis!.name,
          pib: biznis!.pib,
          mb: biznis!.mb,
          delatnostCode: biznis!.delatnostCode,
          delatnostName: biznis!.delatnostName,
          regDate: formatDatumSrpski(biznis!.regDate),
          street: biznis!.street ?? "",
          city: biznis!.city ?? "",
          zip: biznis!.zip ?? "",
          contactEmail: biznis!.contactEmail ?? "",
          phone: biznis!.phone ?? "",
        }}
      />
    </>
  );
}
