import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { DolaziUskoro } from "@/components/app-shell/DolaziUskoro";

export default function RacuniPage() {
  return (
    <>
      <SettingsPageHeader
        naslov="Računi"
        opis="Na fakturama se prikazuje račun koji odgovara valuti fakture."
      />
      <DolaziUskoro />
    </>
  );
}
