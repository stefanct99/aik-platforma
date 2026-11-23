import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { DolaziUskoro } from "@/components/app-shell/DolaziUskoro";

export default function PovezivanjePage() {
  return (
    <>
      <SettingsPageHeader naslov="Povezivanje" opis="Mejl banke, kalendar, izvoz." />
      <DolaziUskoro />
    </>
  );
}
