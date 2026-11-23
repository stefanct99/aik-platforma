import { PageHeader } from "@/components/app-shell/PageHeader";
import { DolaziUskoro } from "@/components/app-shell/DolaziUskoro";

export default function FakturePage() {
  return (
    <>
      <PageHeader naslov="Fakture" opis="Sve tvoje fakture na jednom mestu, u svim valutama." />
      <DolaziUskoro />
    </>
  );
}
