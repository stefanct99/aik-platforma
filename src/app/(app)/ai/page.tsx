import { PageHeader } from "@/components/app-shell/PageHeader";
import { DolaziUskoro } from "@/components/app-shell/DolaziUskoro";

export default function AiPage() {
  return (
    <>
      <PageHeader naslov="AI knjigovođa" opis="Pitaj o fakturama, prilivima i porezu." />
      <DolaziUskoro />
    </>
  );
}
