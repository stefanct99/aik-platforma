import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAccountsForUser } from "@/lib/bank-accounts";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { RacuniTab } from "./RacuniTab";

export const instant = false;

export default async function RacuniPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");

  const racuni = await getAccountsForUser(session.user.id);

  return (
    <>
      <SettingsPageHeader
        naslov="Računi"
        opis="Na fakturama se prikazuje račun koji odgovara valuti fakture."
      />
      <RacuniTab racuni={racuni} />
    </>
  );
}
