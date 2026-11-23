import { PageHeader } from "@/components/app-shell/PageHeader";
import { DolaziUskoro } from "@/components/app-shell/DolaziUskoro";

export default function KnjigaPrihodaPage() {
  return (
    <>
      <PageHeader naslov="Knjiga prihoda" opis="Prihodi se vode po datumu uplate." />
      <DolaziUskoro />
    </>
  );
}
