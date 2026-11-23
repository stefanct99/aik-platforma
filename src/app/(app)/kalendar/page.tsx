import { PageHeader } from "@/components/app-shell/PageHeader";
import { DolaziUskoro } from "@/components/app-shell/DolaziUskoro";

export default function KalendarPage() {
  return (
    <>
      <PageHeader
        naslov="Kalendar"
        opis="Rokovi za državu, fakture i ponavljajuće fakture na jednom mestu."
      />
      <DolaziUskoro />
    </>
  );
}
