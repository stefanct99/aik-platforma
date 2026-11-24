"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PillGroup } from "@/components/settings/PillGroup";
import type { Tema } from "@/lib/theme";
import { sacuvajTemuAction, type TemaStanje } from "./actions";
import styles from "./JezikIIzgledForm.module.css";

// Primenjuje izabranu temu odmah na ekranu (spec 7.13: "Prikaz se menja odmah"), pre nego što se
// sačuva. .appShell je obično ime klase (iz src/styles/theme.css), ne iz CSS modula, zato je stabilno
// za querySelector.
function primeniTemuNaStranici(tema: Tema) {
  const omot = document.querySelector<HTMLElement>(".appShell");
  if (!omot) return;
  if (tema === "sistem") omot.removeAttribute("data-theme");
  else omot.setAttribute("data-theme", tema);
}

export function JezikIIzgledForm({ initialTema }: { initialTema: Tema }) {
  const [stanje, action, uToku] = useActionState<TemaStanje, FormData>(sacuvajTemuAction, {
    tema: initialTema,
    sacuvano: false,
  });
  const [tema, setTema] = useState<Tema>(initialTema);

  return (
    <form action={action} className={styles.sadrzaj}>
      {stanje.sacuvano && (
        <p className={styles.uspeh} role="status">
          Sačuvano.
        </p>
      )}

      <div className={styles.naslovRed}>
        <span>Jezik</span>
        <Badge varijanta="info">Dolazi uskoro</Badge>
      </div>
      <PillGroup
        options={[
          { value: "sr-lat", label: "Srpski (latinica)" },
          { value: "sr-cir", label: "Srpski (ćirilica)" },
          { value: "en", label: "English" },
        ]}
        value="sr-lat"
        disabled
      />

      <div className={styles.naslovRed}>
        <span>Format datuma</span>
        <Badge varijanta="info">Dolazi uskoro</Badge>
      </div>
      <PillGroup
        options={[
          { value: "dmy", label: "15.11.2026." },
          { value: "iso", label: "2026-11-15" },
        ]}
        value="dmy"
        disabled
      />

      <span>Izgled</span>
      <PillGroup
        name="tema"
        options={[
          { value: "svetli" as Tema, label: "Svetli" },
          { value: "tamni" as Tema, label: "Tamni" },
          { value: "sistem" as Tema, label: "Kao na uređaju" },
        ]}
        value={tema}
        disabled={uToku}
        onChange={(izabrano) => {
          setTema(izabrano);
          primeniTemuNaStranici(izabrano);
        }}
      />
      <input type="hidden" name="tema" value={tema} />

      <div className={styles.dugmad}>
        <Button type="submit" varijanta="primarno" disabled={uToku}>
          {uToku ? "Čuvam..." : "Sačuvaj izmene"}
        </Button>
      </div>
    </form>
  );
}
