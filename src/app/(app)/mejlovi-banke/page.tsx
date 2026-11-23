import { PageHeader } from "@/components/app-shell/PageHeader";
import { DolaziUskoro } from "@/components/app-shell/DolaziUskoro";

export default function MejloviBankePage() {
  return (
    <>
      <PageHeader naslov="Mejlovi banke" opis="Banka mi šalje obrasce, ja ih popunim i vratim." />
      <DolaziUskoro />
    </>
  );
}
