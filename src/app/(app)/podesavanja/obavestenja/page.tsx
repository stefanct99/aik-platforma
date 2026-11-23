import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { DolaziUskoro } from "@/components/app-shell/DolaziUskoro";

export default function ObavestenjaPage() {
  return (
    <>
      <SettingsPageHeader
        naslov="Obaveštenja"
        opis="Rokovi za državu uvek stižu u aplikaciji. Ovde biraš gde ti ih još šaljem."
      />
      <DolaziUskoro />
    </>
  );
}
