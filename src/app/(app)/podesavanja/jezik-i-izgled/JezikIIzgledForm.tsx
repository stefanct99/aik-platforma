"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PillGroup } from "@/components/settings/PillGroup";
import { useTemaDeljena } from "@/components/app-shell/TemaContext";
import type { Tema, Jezik } from "@/lib/theme";
import type { FormatDatuma } from "@/lib/datum";
import { sacuvajIzgledAction, type JezikIIzgledStanje } from "./actions";
import styles from "./JezikIIzgledForm.module.css";

export function JezikIIzgledForm({
  initialJezik,
  initialFormatDatuma,
}: {
  initialJezik: Jezik;
  initialFormatDatuma: FormatDatuma;
}) {
  // Korak 8a (ispravka): "tema" dolazi iz TemaContext-a (deljeno sa prekidačem u gornjoj traci), ne iz
  // sopstvenog lokalnog stanja - PillGroup ovde i dalje samo PREGLEDA (čuva se tek na "Sačuvaj izmene",
  // frejm Pd7 ima jedno zajedničko dugme za sve troje), ali prikazano "istaknuto" dugme sad ostaje
  // usklađeno sa gornjom trakom čak i bez čuvanja.
  const { tema, setTema } = useTemaDeljena();
  const pocetnoStanje: JezikIIzgledStanje = {
    tema,
    jezik: initialJezik,
    formatDatuma: initialFormatDatuma,
    sacuvano: false,
  };
  const [stanje, action, uToku] = useActionState(sacuvajIzgledAction, pocetnoStanje);
  const [jezik, setJezik] = useState<Jezik>(initialJezik);
  const [formatDatuma, setFormatDatuma] = useState<FormatDatuma>(initialFormatDatuma);

  return (
    <form action={action} className={styles.sadrzaj}>
      {stanje.sacuvano && (
        <p className={styles.uspeh} role="status">
          Sačuvano.
        </p>
      )}

      <span>Jezik</span>
      <PillGroup
        name="jezik"
        options={[
          { value: "sr-lat" as Jezik, label: "Srpski (latinica)" },
          { value: "sr-cir" as Jezik, label: "Srpski (ćirilica)" },
          { value: "en" as Jezik, label: "English" },
        ]}
        value={jezik}
        disabled={uToku}
        onChange={setJezik}
      />
      <input type="hidden" name="jezik" value={jezik} />

      <span>Format datuma</span>
      <PillGroup
        name="formatDatuma"
        options={[
          { value: "dmy" as FormatDatuma, label: "15.11.2026." },
          { value: "iso" as FormatDatuma, label: "2026-11-15" },
        ]}
        value={formatDatuma}
        disabled={uToku}
        onChange={setFormatDatuma}
      />
      <input type="hidden" name="formatDatuma" value={formatDatuma} />

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
        onChange={setTema}
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
