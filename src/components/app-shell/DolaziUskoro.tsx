import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Deljeno stanje za sekcije koje u Koraku 4 dobijaju samo rutu i naslov, bez funkcije (spec 5.1).

export function DolaziUskoro() {
  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "var(--space-3)",
      }}
    >
      <Badge varijanta="info">Dolazi uskoro</Badge>
      <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
        Ovaj deo aplikacije još nije napravljen. Javiće se u jednom od sledećih koraka.
      </p>
    </Card>
  );
}
