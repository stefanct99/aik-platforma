import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getBusinessForUser } from "@/lib/business";
import { composeInboundAddress } from "@/lib/inbound-mail";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { PovezivanjeTab } from "./PovezivanjeTab";

export const instant = false;

export default async function PovezivanjePage() {
  const zaglavlja = await headers();
  const session = await auth.api.getSession({ headers: zaglavlja });
  const biznis = await getBusinessForUser(session!.user.id);

  const host = zaglavlja.get("host") ?? "localhost:3000";
  const protokol = host.startsWith("localhost") ? "http" : "https";
  const kalendarUrl = `${protokol}://${host}/cal/${biznis!.calendarToken}`;

  return (
    <>
      <SettingsPageHeader naslov="Povezivanje" opis="Šta je povezano sa tvojim nalogom." />
      <PovezivanjeTab
        adresaZaPrijem={composeInboundAddress(biznis!.inboundSlug, biznis!.inboundCode)}
        kalendarUrl={kalendarUrl}
        kalendarSyncEnabled={biznis!.calendarSyncEnabled}
      />
    </>
  );
}
