// Nova/Uredi ponavljajuća faktura (Korak 8c, frejm Fak14/PhFak14, spec 3.5/6.8 tačka 2). SidePanel (560px,
// isti kao Pd10/ClientPanel) - frejm PhFak14 na telefonu ima tekstualno dugme "Zatvori" u zaglavlju umesto
// samog X, ali SidePanel je deljena komponenta (koristi je i "Dodaj račun" i ClientPanel) - ne menjam je za
// jednu formu, X ikonica ostaje ista na telefonu svuda u aplikaciji (odstupanje od frejma, prijavljeno u
// izveštaju). Footer ima SAMO "Odustani"/"Sačuvaj" (frejm, potvrđeno direktnom ekstrakcijom - brisanje
// postoji isključivo iz ⋯ menija na listi, ne iz forme).
"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Polje } from "@/components/ui/Polje";
import { SidePanel } from "@/components/ui/SidePanel";
import { formatDatum } from "@/lib/datum";
import { dodajPonavljajucuAction, izmeniPonavljajucuAction, type PonavljajucaStanje } from "../actions";
import styles from "./RecurringPanel.module.css";

const POCETNO_STANJE: PonavljajucaStanje = { errors: {}, sacuvano: false };

export type KlijentZaPonavljajucu = {
  id: string;
  name: string;
  billingEmail: string | null;
  defaultItemDesc: string | null;
  defaultItemAmount: number | null;
};

export type PonavljajucaRed = {
  id: string;
  clientId: string;
  desc: string | null;
  amount: number | null;
  dayOfMonth: number;
  startDate: string;
  endDate: string | null;
  mode: "ask" | "auto";
};

export function RecurringPanel({
  item,
  prefill,
  klijenti,
  onClose,
  onSaved,
}: {
  item: PonavljajucaRed | null;
  prefill?: { clientId: string; desc: string | null; amount: number | null } | null;
  klijenti: KlijentZaPonavljajucu[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !item;
  const action = isNew ? dodajPonavljajucuAction : izmeniPonavljajucuAction.bind(null, item!.id);
  const [stanje, formAction, uToku] = useActionState(action, POCETNO_STANJE);

  const pocetniClientId = item?.clientId ?? prefill?.clientId ?? klijenti[0]?.id ?? "";
  const pocetniKlijent = klijenti.find((k) => k.id === pocetniClientId) ?? null;
  const [clientId, setClientId] = useState(pocetniClientId);
  // Pri izmeni postojeće (item) ili predpopunjavanju iz fakture (prefill): tačno ono što je uneto/
  // preneto, bez obzira da li je prazno (npr. Marko nema stavku - "" se NE sme zameniti podrazumevanom
  // klijentovom cenom). Samo za SASVIM novu formu bez prefill-a popuni se iz podrazumevanih vrednosti
  // početno izabranog klijenta (isto kao kad korisnik sam promeni klijenta u padajućem meniju).
  const [desc, setDesc] = useState(() => {
    if (item) return item.desc ?? "";
    if (prefill) return prefill.desc ?? "";
    return pocetniKlijent?.defaultItemDesc ?? "";
  });
  const [amount, setAmount] = useState(() => {
    if (item) return item.amount != null ? String(item.amount / 100) : "";
    if (prefill) return prefill.amount != null ? String(prefill.amount / 100) : "";
    return pocetniKlijent?.defaultItemAmount != null ? String(pocetniKlijent.defaultItemAmount / 100) : "";
  });
  const [stavkaDodirnuta, setStavkaDodirnuta] = useState(!isNew || !!prefill);
  const [dayOfMonth, setDayOfMonth] = useState(String(item?.dayOfMonth ?? 1));
  const [startDate, setStartDate] = useState(item?.startDate.slice(0, 10) ?? formatDatum(new Date(), "iso"));
  const [endMode, setEndMode] = useState<"nikad" | "datum">(item?.endDate ? "datum" : "nikad");
  const [endDate, setEndDate] = useState(item?.endDate?.slice(0, 10) ?? "");
  const [mode, setMode] = useState<"ask" | "auto">(item?.mode ?? "ask");

  const klijent = klijenti.find((k) => k.id === clientId) ?? null;

  useEffect(() => {
    if (stanje.sacuvano) onSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stanje.sacuvano]);

  // Klijent bez podrazumevane cene ili bez mejla ne može na "auto" (zadatak tačka 2) - resetovano
  // direktno u event handlerima koji mogu da pokvare već izabrano "auto" (ne u efektu - isto rešenje
  // kao već jednom primenjeno u ovom projektu za react-hooks/set-state-in-effect, vidi InvoiceEditor).
  function naPromenuKlijenta(noviId: string) {
    setClientId(noviId);
    const noviKlijent = klijenti.find((k) => k.id === noviId);
    // Popuni opis/iznos iz klijentovih podrazumevanih vrednosti SAMO ako korisnik još nije sam
    // dirao ta polja (isto načelo kao InvoiceEditor "postaviIzKlijenta") - ne gazi ručni unos.
    const noviAmount = !stavkaDodirnuta
      ? noviKlijent?.defaultItemAmount != null
        ? String(noviKlijent.defaultItemAmount / 100)
        : ""
      : amount;
    if (!stavkaDodirnuta) {
      setDesc(noviKlijent?.defaultItemDesc ?? "");
      setAmount(noviAmount);
    }
    if (mode === "auto" && (noviAmount === "" || !noviKlijent?.billingEmail)) setMode("ask");
  }

  function naPromenuIznosa(novoAmount: string) {
    setStavkaDodirnuta(true);
    setAmount(novoAmount);
    if (mode === "auto" && novoAmount === "") setMode("ask");
  }

  return (
    <form
      action={(formData) => {
        formData.set("endDate", endMode === "datum" ? endDate : "");
        formAction(formData);
      }}
    >
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="dayOfMonth" value={dayOfMonth} />
      <input type="hidden" name="startDate" value={startDate} />
      <input type="hidden" name="mode" value={mode} />
      <SidePanel
        naslov={isNew ? "Nova ponavljajuća faktura" : "Izmeni ponavljajuću fakturu"}
        onClose={onClose}
        footer={
          <>
            <Button type="button" varijanta="sekundarno" disabled={uToku} onClick={onClose}>
              Odustani
            </Button>
            <Button type="submit" varijanta="primarno" disabled={uToku}>
              {uToku ? "Čuvam..." : "Sačuvaj"}
            </Button>
          </>
        }
      >
        <div className={styles.sekcija}>
          <span className={styles.naslovSekcije}>Kome i šta</span>
          <div className={styles.polje}>
            <label className={styles.labelaPolja} htmlFor="ponavljajucaClientId">
              Klijent
            </label>
            <select
              id="ponavljajucaClientId"
              className={styles.select}
              value={clientId}
              onChange={(e) => naPromenuKlijenta(e.target.value)}
              disabled={uToku}
            >
              {klijenti.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
            {stanje.errors.clientId && <span className={styles.greska}>{stanje.errors.clientId}</span>}
          </div>
          <Polje
            label="Opis"
            name="desc"
            value={desc}
            onChange={(e) => {
              setStavkaDodirnuta(true);
              setDesc(e.target.value);
            }}
            disabled={uToku}
          />
          <Polje
            label="Iznos"
            name="amount"
            type="number"
            step="0.01"
            min={0}
            placeholder="Iznos se upisuje pri slanju"
            value={amount}
            onChange={(e) => naPromenuIznosa(e.target.value)}
            disabled={uToku}
          />
        </div>

        <hr className={styles.linija} />

        <div className={styles.sekcija}>
          <span className={styles.naslovSekcije}>Kad se ponavlja</span>
          <div className={styles.polje}>
            <label className={styles.labelaPolja} htmlFor="ponavljajucaFreq">
              Učestalost
            </label>
            <select id="ponavljajucaFreq" className={styles.select} value="mesecno" disabled>
              <option value="mesecno">Mesečno</option>
            </select>
          </div>
          <Polje
            label="Dan u mesecu"
            type="number"
            min={1}
            max={31}
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            error={stanje.errors.dayOfMonth}
            disabled={uToku}
          />
          <Polje
            label="Počinje"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            error={stanje.errors.startDate}
            disabled={uToku}
          />
          <div className={styles.polje}>
            <span className={styles.labelaPolja}>Završava</span>
            <div className={styles.segmentiran}>
              <button
                type="button"
                className={endMode === "nikad" ? styles.aktivno : ""}
                onClick={() => setEndMode("nikad")}
                disabled={uToku}
              >
                Nikad
              </button>
              <button
                type="button"
                className={endMode === "datum" ? styles.aktivno : ""}
                onClick={() => setEndMode("datum")}
                disabled={uToku}
              >
                Na datum
              </button>
            </div>
            {endMode === "datum" && (
              <Polje
                label="Datum završetka"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                error={stanje.errors.endDate}
                disabled={uToku}
              />
            )}
          </div>
        </div>

        <hr className={styles.linija} />

        <div className={styles.sekcija}>
          <div>
            <span className={styles.naslovSekcije}>Šta radim kad dođe taj dan</span>
            <p className={styles.pomocniTekst}>Iznos možeš da promeniš pre svakog slanja.</p>
          </div>
          <button
            type="button"
            className={`${styles.radioKartica} ${mode === "ask" ? styles.radioAktivna : ""}`}
            onClick={() => setMode("ask")}
            disabled={uToku}
          >
            <span className={styles.radioTacka} />
            <span className={styles.radioTekst}>
              <span>
                Pripremim fakturu i pitam te za odobrenje <span className={styles.preporuceno}>Preporučeno</span>
              </span>
              <span className={styles.pomocniTekst}>Dobiješ obaveštenje, proveriš iznos i šalješ jednim klikom.</span>
            </span>
          </button>
          <button
            type="button"
            className={`${styles.radioKartica} ${mode === "auto" ? styles.radioAktivna : ""}`}
            onClick={() => setMode("auto")}
            disabled={uToku || amount === "" || !klijent?.billingEmail}
          >
            <span className={styles.radioTacka} />
            <span className={styles.radioTekst}>
              <span>Šaljem automatski, bez pitanja</span>
              <span className={styles.pomocniTekst}>Faktura ide klijentu odmah. Koristi samo ako je iznos uvek isti.</span>
            </span>
          </button>
          {amount === "" && (
            <span className={styles.pomocniTekst}>
              Ovaj klijent nema iznos - ponavljajuća faktura mora da traži odobrenje.
            </span>
          )}
          {amount !== "" && !klijent?.billingEmail && (
            <span className={styles.pomocniTekst}>
              Klijent nema sačuvan mejl - automatsko slanje nema kome da ide, dok ne dodaš mejl klijentu.
            </span>
          )}
          {stanje.errors.mode && <span className={styles.greska}>{stanje.errors.mode}</span>}
        </div>
      </SidePanel>
    </form>
  );
}
