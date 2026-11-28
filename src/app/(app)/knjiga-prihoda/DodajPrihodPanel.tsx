// Bočni panel "Dodaj prihod" (Korak 9d-2, frejm Kp5, desktop). Prikazano stanje u frejmu je UVEK
// "Dinarski" (podrazumevano) - frejm NE pokazuje izgled "Devizni" stanja (Valuta/Kurs polja), zato su ta
// dva polja sastavljena od istih delova dizajn sistema (Polje/select) kao ostatak panela, bez posebnog
// frejma za njih (opisano u izveštaju). Frejm takođe NE pokazuje polje Faktura uopšte (namerno izostavljeno
// ovde, zadatak) i NEMA chevron ikonicu na polju Klijent - zato je Klijent ovde obična <select>, stilizovana
// kao ostala polja (height/boja/okvir iz frejma), NE "Svi klijenti" padajući meni iz filtera (koji ima
// brojeve po klijentu i chevron - nepotrebno ovde, nema brojeva da se prikažu uz dodavanje).
"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Polje } from "@/components/ui/Polje";
import { SidePanel } from "@/components/ui/SidePanel";
import { formatDatumSrpski } from "@/lib/datum";
import { dodajPrihodAction, type DodajPrihodStanje } from "./actions";
import styles from "./DodajPrihodPanel.module.css";

const POCETNO_STANJE: DodajPrihodStanje = {
  greska: null,
  polje: null,
  sacuvano: false,
};
const VALUTE = ["EUR", "USD", "GBP", "CHF"];

export function DodajPrihodPanel({
  klijenti,
  danasIso,
  onClose,
}: {
  klijenti: { id: string; name: string }[];
  danasIso: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [vrsta, setVrsta] = useState<"dinarski" | "devizni">("dinarski");
  // SVA polja su KONTROLISANA (ne defaultValue/nekontrolisano kao OznaciPlacenomDialog/PrihodPanel) -
  // React posle SVAKOG pokušaja slanja forme sa Server akcijom (action={formAction}) resetuje
  // nekontrolisana polja na njihov defaultValue, bez obzira da li je akcija vratila uspeh ili grešku
  // (React-ovo ponašanje za <form action=...>, ne nešto što ova aplikacija kontroliše). Bez ovoga bi
  // korisnik posle SVAKE greške morao da otkuca SVE ispočetka, ne samo polje koje je pogrešno.
  const [datumUnos, setDatumUnos] = useState(() =>
    formatDatumSrpski(new Date(danasIso)),
  );
  const [clientIdUnos, setClientIdUnos] = useState("");
  const [valuta, setValuta] = useState("EUR");
  const [iznosUnos, setIznosUnos] = useState("");
  const [kursUnos, setKursUnos] = useState("");
  const [opisUnos, setOpisUnos] = useState("");

  const [greskaDatum, setGreskaDatum] = useState<string | null>(null);
  const [greskaKlijent, setGreskaKlijent] = useState<string | null>(null);
  const [greskaIznos, setGreskaIznos] = useState<string | null>(null);
  const [greskaValuta, setGreskaValuta] = useState<string | null>(null);
  const [greskaKurs, setGreskaKurs] = useState<string | null>(null);

  const [stanje, formAction, uToku] = useActionState(
    dodajPrihodAction,
    POCETNO_STANJE,
  );

  // Isti obrazac kao PrihodPanel.tsx ("Ispravi"): prati prelazak "uToku" (menja se pri SVAKOM pokušaju),
  // ne "sacuvano". Ovde SAMO za postavljanje greške po polju - to je state OVE komponente, sme da se radi
  // tokom renderovanja. Zatvaranje panela (onClose, state RODITELJA - KnjigaPrihodaTab) NE sme ovde: React
  // baca "Cannot update a component while rendering a different component" - ide u useEffect ispod.
  const [bioUToku, setBioUToku] = useState(uToku);
  if (uToku !== bioUToku) {
    setBioUToku(uToku);
    if (!uToku && !stanje.sacuvano && stanje.greska) {
      setGreskaDatum(stanje.polje === "datum" ? stanje.greska : null);
      setGreskaKlijent(stanje.polje === "klijent" ? stanje.greska : null);
      setGreskaIznos(stanje.polje === "iznos" ? stanje.greska : null);
      setGreskaValuta(stanje.polje === "valuta" ? stanje.greska : null);
      setGreskaKurs(stanje.polje === "kurs" ? stanje.greska : null);
    }
  }

  // Uspeh se dešava NAJVIŠE jednom po otvaranju panela (posle njega se panel zatvara/unmount-uje, nema
  // "drugog uspeha u istom panelu" kao kod "Ispravi") - "sacuvano" kao zavisnost je zato dovoljno pouzdano
  // ovde, za razliku od PrihodPanel.tsx gde se panel NE zatvara posle čuvanja.
  useEffect(() => {
    if (stanje.sacuvano) {
      router.refresh();
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stanje.sacuvano]);

  return (
    <form action={formAction}>
      <input type="hidden" name="vrsta" value={vrsta} />
      <SidePanel
        naslov="Dodaj prihod"
        onClose={onClose}
        footer={
          <>
            <Button
              type="button"
              varijanta="sekundarno"
              disabled={uToku}
              onClick={onClose}
            >
              Odustani
            </Button>
            <Button type="submit" varijanta="primarno" disabled={uToku}>
              {uToku ? "Čuvam..." : "Sačuvaj prihod"}
            </Button>
          </>
        }
      >
        <div className={styles.polje}>
          <span className={styles.labela}>Vrsta prihoda</span>
          <div className={styles.segment}>
            <button
              type="button"
              className={
                vrsta === "dinarski"
                  ? styles.segmentAktivan
                  : styles.segmentDugme
              }
              onClick={() => setVrsta("dinarski")}
            >
              Dinarski
            </button>
            <button
              type="button"
              className={
                vrsta === "devizni"
                  ? styles.segmentAktivan
                  : styles.segmentDugme
              }
              onClick={() => setVrsta("devizni")}
            >
              Devizni
            </button>
          </div>
        </div>

        <Polje
          label="Datum uplate"
          name="datumUplate"
          value={datumUnos}
          placeholder="dd.mm.gggg."
          error={greskaDatum ?? undefined}
          onChange={(e) => {
            setDatumUnos(e.target.value);
            setGreskaDatum(null);
          }}
          disabled={uToku}
        />

        <div
          className={[styles.polje, greskaKlijent ? styles.greska : ""].join(
            " ",
          )}
        >
          <label htmlFor="dodajPrihodKlijent" className={styles.labela}>
            Klijent
          </label>
          <select
            id="dodajPrihodKlijent"
            name="clientId"
            className={styles.select}
            value={clientIdUnos}
            onChange={(e) => {
              setClientIdUnos(e.target.value);
              setGreskaKlijent(null);
            }}
            disabled={uToku}
          >
            <option value="">Nije poznat</option>
            {klijenti.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
          {greskaKlijent && (
            <span className={styles.pomocniTekst}>{greskaKlijent}</span>
          )}
        </div>

        {vrsta === "devizni" && (
          <div
            className={[styles.polje, greskaValuta ? styles.greska : ""].join(
              " ",
            )}
          >
            <label htmlFor="dodajPrihodValuta" className={styles.labela}>
              Valuta
            </label>
            <select
              id="dodajPrihodValuta"
              name="valuta"
              className={styles.select}
              value={valuta}
              onChange={(e) => {
                setValuta(e.target.value);
                setGreskaValuta(null);
              }}
              disabled={uToku}
            >
              {VALUTE.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            {greskaValuta && (
              <span className={styles.pomocniTekst}>{greskaValuta}</span>
            )}
          </div>
        )}

        <Polje
          label={vrsta === "devizni" ? `Iznos u ${valuta}` : "Iznos u dinarima"}
          name="iznos"
          type="number"
          step="0.01"
          value={iznosUnos}
          error={greskaIznos ?? undefined}
          onChange={(e) => {
            setIznosUnos(e.target.value);
            setGreskaIznos(null);
          }}
          disabled={uToku}
        />

        {vrsta === "devizni" && (
          <Polje
            label="Kurs"
            name="kurs"
            type="number"
            step="0.01"
            value={kursUnos}
            error={greskaKurs ?? undefined}
            onChange={(e) => {
              setKursUnos(e.target.value);
              setGreskaKurs(null);
            }}
            disabled={uToku}
          />
        )}

        <Polje
          label="Opis (nije obavezno)"
          name="opis"
          value={opisUnos}
          placeholder="npr. Gotovinska uplata, usluge dizajna"
          onChange={(e) => setOpisUnos(e.target.value)}
          disabled={uToku}
        />

        <span className={styles.napomena}>
          Kod deviznog prihoda tražim još valutu i kurs.
        </span>
      </SidePanel>
    </form>
  );
}
