import { PageHeader } from "@/components/app-shell/PageHeader";
import { DolaziUskoro } from "@/components/app-shell/DolaziUskoro";

export default function PorezPage() {
  return (
    <>
      <PageHeader
        naslov="Porez i rokovi"
        opis="Rešenje Poreske uprave, mesečne uplate i rokovi na jednom mestu."
      />
      <DolaziUskoro />
    </>
  );
}
