import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { DolaziUskoro } from "@/components/app-shell/DolaziUskoro";

export default function JezikIIzgledPage() {
  return (
    <>
      <SettingsPageHeader naslov="Jezik i izgled" opis="Jezik, formati, tema." />
      <DolaziUskoro />
    </>
  );
}
