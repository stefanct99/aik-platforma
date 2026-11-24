import { PageHeader } from "@/components/app-shell/PageHeader";
import { DolaziUskoro } from "@/components/app-shell/DolaziUskoro";

// Korak 7: dugme "Otvori Pretplatu" (Podešavanja > Pretplata) vodi ovde. Pretplata kao poseban ekran
// (Sub1, Sub2, Sub12...) nije nacrtana u ovom koraku (zadatak to izričito kaže), zato je ovo samo
// ruta + "Dolazi uskoro", isti obrazac kao ostali još-ne-napravljeni delovi aplikacije (spec 5.1).
export default function PretplataPage() {
  return (
    <>
      <PageHeader naslov="Pretplata" opis="Plan, kartica i istorija plaćanja." />
      <DolaziUskoro />
    </>
  );
}
