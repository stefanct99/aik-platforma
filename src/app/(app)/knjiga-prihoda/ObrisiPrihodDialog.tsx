// Dijalog potvrde brisanja (Korak 9e, frejm Kp8, prototip js/knjiga.js DeleteConfirm). Centriran modal
// (Modal.tsx, 440px - isti kao Pd8/Pd9, frejm ovde ne uvodi novu veličinu). Dugme "Obriši prihod" je
// OBIČNO primarno dugme (frejm: ista boja kao svuda u aplikaciji za primarnu akciju), NE crveno/"opasno" -
// iako prototip kod ima variant:'danger', frejm (piksel po piksel) pobeđuje. Rečenica o fakturi je JEDINA
// dodata rečenica van frejma (odobreno zadatkom), prikazana SAMO kad brisanje stvarno menja status
// fakture (red.fakturaPrelazak, izvedeno u prihodi-db.ts preko POSTOJEĆE jeFakturaKasni logike).
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDatumSrpski } from "@/lib/datum";
import { formatNovacKompaktno, formatNovacPuno } from "@/lib/money";
import { LIMIT_PAUSALACA } from "@/lib/pausalni-limit";
import type { PrihodRed } from "@/lib/prihodi";
import { obrisiPrihodAction } from "./actions";
import styles from "./ObrisiPrihodDialog.module.css";

export function ObrisiPrihodDialog({
  red,
  onClose,
  onObrisano,
}: {
  red: PrihodRed;
  onClose: () => void;
  onObrisano: () => void;
}) {
  const [uToku, setUToku] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  const datum = formatDatumSrpski(new Date(red.datumIso));
  const klijentPoznat = red.klijentIme !== "Nije poznat";
  const ko = klijentPoznat ? `${red.klijentIme}, ${datum}` : datum;

  async function obrisi() {
    setUToku(true);
    setGreska(null);
    const rezultat = await obrisiPrihodAction(red.id);
    if (!rezultat.ok) {
      setGreska(rezultat.razlog);
      setUToku(false);
      return;
    }
    onObrisano();
  }

  return (
    <Modal naslov="Obrisati prihod?" onClose={onClose}>
      <div className={styles.sadrzaj}>
        <span className={styles.tekst}>
          {`Prihod od ${formatNovacPuno(red.iznos, red.valuta)} (${ko}) se uklanja iz knjige. Zbir i limit od ${formatNovacKompaktno(LIMIT_PAUSALACA, "RSD")} se ponovo računaju. Ovo ne može da se vrati.`}
        </span>
        {red.fakturaId && red.fakturaPrelazak && (
          <span className={styles.tekst}>
            {`Faktura ${red.brojFakture} se vraća na ${red.fakturaPrelazak === "kasni" ? "Kasni" : "Poslata"}.`}
          </span>
        )}
        {greska && <span className={styles.greska}>{greska}</span>}
        <div className={styles.dugmad}>
          <Button
            type="button"
            varijanta="primarno"
            disabled={uToku}
            onClick={obrisi}
          >
            {uToku ? "Brišem..." : "Obriši prihod"}
          </Button>
          <Button
            type="button"
            varijanta="sekundarno"
            disabled={uToku}
            onClick={onClose}
          >
            Odustani
          </Button>
        </div>
      </div>
    </Modal>
  );
}
