// Bočni panel "Prihod [datum]" (Korak 9c, frejm Kp4, prototip js/knjiga.js DetailPanel). Prikaz (VIEW)
// je tačno po frejmu - jedini konkretan primer je devizni/mejl_banke/sa-kursom red, pa su GRANAJA za
// druge slučajeve (dinarski, "Ručno", bez kursa, bez fakture) preuzete iz PONAŠANJA prototipa (client?...
// :'–' stil), uz ISTI frejmov stil za svaki red - nema posebnog frejma za njih.
//
// "Ispravi" (izmena kursa/opisa): frejm Kp4 pokazuje DUGME "Ispravi" u podnožju, ali NI frejm NI prototip
// (js/knjiga.js DetailPanel nema "Ispravi" uopšte, samo "Obriši prihod"/"Zatvori") ne pokazuju KAKO
// izgleda sâmo polje za izmenu - zato ovaj izgled NIJE iz frejma, nego sastavljen od POSTOJEĆIH delova
// dizajn sistema već korišćenih u ovoj aplikaciji (Polje - isti kao OznaciPlacenomDialog/ClientPanel), sa
// greškom ispod polja Kurs u istom stilu kao ostale forme. Opisano i u izveštaju Koraka 9c.
"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Polje } from "@/components/ui/Polje";
import { SidePanel } from "@/components/ui/SidePanel";
import { formatDatumSrpski } from "@/lib/datum";
import { formatNovacPuno } from "@/lib/money";
import type { PrihodRed } from "@/lib/prihodi";
import { ispraviPrihodAction, type IspraviPrihodStanje } from "./actions";
import styles from "./PrihodPanel.module.css";

const POCETNO_STANJE: IspraviPrihodStanje = { greska: null, sacuvano: false };

function KvRed({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className={styles.kv}>
      <span className={styles.k}>{k}</span>
      <span className={styles.v}>{v}</span>
    </div>
  );
}

export function PrihodPanel({
  red,
  onClose,
}: {
  red: PrihodRed;
  onClose: () => void;
}) {
  const router = useRouter();
  const [izmena, setIzmena] = useState(false);
  const action = ispraviPrihodAction.bind(null, red.id);
  const [stanje, formAction, uToku] = useActionState(action, POCETNO_STANJE);
  const jeDevizni = red.vrsta === "devizni";

  // Vraća panel iz režima izmene u pregled ODMAH po uspešnom čuvanju - namerno TOKOM renderovanja
  // ("Adjusting state when a prop changes" iz React dokumentacije), ne u useEffect-u, da bi se izbeglo
  // react-hooks/set-state-in-effect (sinhrono pozivanje setState unutar efekta).
  const [poslednjeSacuvano, setPoslednjeSacuvano] = useState(stanje.sacuvano);
  if (stanje.sacuvano !== poslednjeSacuvano) {
    setPoslednjeSacuvano(stanje.sacuvano);
    if (stanje.sacuvano) setIzmena(false);
  }

  useEffect(() => {
    // router.refresh() nije React setState - ovde je u redu (sinhronizacija sa spoljnim sistemom,
    // ponovno učitavanje server podataka posle uspešnog čuvanja).
    if (stanje.sacuvano) router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stanje.sacuvano]);

  const obrisiDugme = (
    <button type="button" className={styles.obrisiLink}>
      Obriši prihod
    </button>
  );

  if (izmena) {
    return (
      <form action={formAction}>
        <SidePanel
          naslov={`Prihod ${formatDatumSrpski(new Date(red.datumIso))}`}
          onClose={onClose}
          footer={
            <div className={styles.podnozjeRed}>
              {obrisiDugme}
              <div className={styles.podnozjeDugmad}>
                <Button
                  type="button"
                  varijanta="sekundarno"
                  disabled={uToku}
                  onClick={() => setIzmena(false)}
                >
                  Odustani
                </Button>
                <Button type="submit" varijanta="primarno" disabled={uToku}>
                  {uToku ? "Čuvam..." : "Sačuvaj"}
                </Button>
              </div>
            </div>
          }
        >
          <div className={styles.glavnaVrednost}>
            <span className={styles.labelaMuted}>
              Uplata od {red.klijentIme ?? "nepoznatog pošiljaoca"}
            </span>
            <span className={styles.vrednostVelika}>
              {formatNovacPuno(red.iznos, red.valuta)}
            </span>
          </div>
          {jeDevizni && (
            <Polje
              label="Kurs"
              name="kurs"
              type="number"
              step="0.01"
              defaultValue={red.kurs ?? ""}
              error={stanje.greska ?? undefined}
              disabled={uToku}
            />
          )}
          <Polje
            label="Opis"
            name="opis"
            defaultValue={red.opis ?? ""}
            placeholder="Nije obavezno"
            disabled={uToku}
          />
        </SidePanel>
      </form>
    );
  }

  return (
    <SidePanel
      naslov={`Prihod ${formatDatumSrpski(new Date(red.datumIso))}`}
      onClose={onClose}
      footer={
        <div className={styles.podnozjeRed}>
          {obrisiDugme}
          <div className={styles.podnozjeDugmad}>
            <Button type="button" varijanta="sekundarno" onClick={onClose}>
              Zatvori
            </Button>
            <Button
              type="button"
              varijanta="primarno"
              onClick={() => setIzmena(true)}
            >
              Ispravi
            </Button>
          </div>
        </div>
      }
    >
      <div className={styles.glavnaVrednost}>
        <span className={styles.labelaMuted}>
          Uplata od {red.klijentIme ?? "nepoznatog pošiljaoca"}
        </span>
        <span className={styles.vrednostVelika}>
          {formatNovacPuno(red.iznos, red.valuta)}
        </span>
      </div>

      <div className={styles.redovi}>
        <KvRed k="Datum uplate" v={formatDatumSrpski(new Date(red.datumIso))} />
        <KvRed k="Klijent" v={red.klijentIme ?? "–"} />
        <KvRed
          k="Faktura"
          v={
            red.fakturaId ? (
              <>
                {red.brojFakture}{" "}
                <a
                  href={`/fakture/${red.fakturaId}`}
                  className={styles.otvoriLink}
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    router.push(`/fakture/${red.fakturaId}`);
                  }}
                >
                  Otvori
                </a>
              </>
            ) : (
              "–"
            )
          }
        />
        <KvRed
          k="Izvor"
          v={
            red.izvor === "mejl_banke" ? (
              <>
                {`Mejl banke od ${formatDatumSrpski(new Date(red.datumIso))}`}{" "}
                {/* Mejlovi banke (povezivanje sa konkretnim mejlom) nisu još izgrađeni - link je zato
                    namerno inertan (isti obrazac kao "Izvezi"/"Dodaj prihod" u Koraku 9a). */}
                <a
                  href="#"
                  className={styles.otvoriLink}
                  onClick={(e) => e.preventDefault()}
                >
                  Otvori mejl
                </a>
              </>
            ) : (
              "Ručno"
            )
          }
        />
        {jeDevizni && (
          <>
            <KvRed
              k="Kurs"
              v={
                red.kurs != null
                  ? red.kurs.toLocaleString("sr-RS", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "–"
              }
            />
            <KvRed
              k="Upisano u dinarima"
              v={
                <b className={styles.podebljano}>
                  {red.iznosRsd != null
                    ? formatNovacPuno(red.iznosRsd, "RSD")
                    : "–"}
                </b>
              }
            />
          </>
        )}
        {red.opis && <KvRed k="Opis" v={red.opis} />}
      </div>
      {jeDevizni && (
        <span className={styles.napomena}>
          Kurs je onaj po kom je banka preračunala priliv. Ako se razlikuje od
          onoga što vidiš u banci, ispravi ga ovde.
        </span>
      )}
    </SidePanel>
  );
}
