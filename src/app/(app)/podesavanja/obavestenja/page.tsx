import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getNotificationSettings, VRSTE_OBAVESTENJA } from "@/lib/notification-settings";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { ObavestenjaTab } from "./ObavestenjaTab";

export const instant = false;

export default async function ObavestenjaPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");

  const podesavanja = await getNotificationSettings(session.user.id);

  const pocetneVrednosti = Object.fromEntries(
    VRSTE_OBAVESTENJA.map(({ kljuc }) => [
      kljuc,
      {
        mail: podesavanja[`${kljuc}Mail` as keyof typeof podesavanja] as boolean,
        push: podesavanja[`${kljuc}Push` as keyof typeof podesavanja] as boolean,
      },
    ]),
  ) as Record<(typeof VRSTE_OBAVESTENJA)[number]["kljuc"], { mail: boolean; push: boolean }>;

  return (
    <>
      <SettingsPageHeader
        naslov="Obaveštenja"
        opis="Rokovi za državu uvek stižu u aplikaciji. Ovde biraš gde ti ih još šaljem."
      />
      <ObavestenjaTab pocetneVrednosti={pocetneVrednosti} />
    </>
  );
}
