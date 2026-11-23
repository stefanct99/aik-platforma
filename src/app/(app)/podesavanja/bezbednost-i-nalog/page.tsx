import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { DolaziUskoro } from "@/components/app-shell/DolaziUskoro";

export default function BezbednostINalogPage() {
  return (
    <>
      <SettingsPageHeader naslov="Bezbednost i nalog" opis="Lozinka, prijava i brisanje naloga." />
      <DolaziUskoro />
    </>
  );
}
