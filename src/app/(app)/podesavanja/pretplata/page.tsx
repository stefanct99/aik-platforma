import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { DolaziUskoro } from "@/components/app-shell/DolaziUskoro";

export default function PretplataPage() {
  return (
    <>
      <SettingsPageHeader naslov="Pretplata" opis="Ukratko o tvom planu." />
      <DolaziUskoro />
    </>
  );
}
