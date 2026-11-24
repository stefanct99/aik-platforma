import { PageHeader } from "@/components/app-shell/PageHeader";
import { Card } from "@/components/ui/Card";

// Nova faktura (Korak 8b): forma za novu/izmenu fakture gradi se u sledećem koraku. Sve akcije koje
// zavise od nje (Dupliraj, Izmeni, Nastavi uređivanje, Pošalji ponovo, Napravi ponavljajuću od ove, i
// dugme "Nova faktura") vode ovde (zadatak Koraka 8a, tačka 2 - tačan tekst poruke je iz zadatka).
export default function NovaFakturaPage() {
  return (
    <>
      <PageHeader naslov="Nova faktura" />
      <Card style={{ marginTop: "var(--space-5)" }}>
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>Nova faktura stiže u sledećem koraku.</p>
      </Card>
    </>
  );
}
