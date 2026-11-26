// Novi/Uredi klijenta (Korak 8a, frejm Fak7/Fak28, spec 7.6).
"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Polje } from "@/components/ui/Polje";
import { SidePanel } from "@/components/ui/SidePanel";
import { dodajKlijentaAction, izmeniKlijentaAction, type KlijentStanje, type NoviKlijent } from "../actions";
import type { KlijentRed } from "./klijenti-tipovi";
import styles from "./ClientPanel.module.css";

const POCETNO_STANJE: KlijentStanje = { errors: {}, sacuvano: false };

const AUTO_SEND_OPCIJE = [
  { kljuc: "nasledi" as const, naziv: "Kao u opštim podešavanjima", opis: "Trenutno: pripremim dokumenta, ti odobravaš slanje." },
  { kljuc: "ask" as const, naziv: "Uvek pitaj za odobrenje", opis: "Pripremim sve, ništa ne šaljem dok ne potvrdiš." },
  { kljuc: "auto" as const, naziv: "Obradi sve automatski", opis: "Pošaljem banci dokumenta i obavestim te kad je gotovo." },
];

const FX_OPCIJE = [
  { kljuc: "proknjizi" as const, naziv: "Samo proknjiži", opis: "Devize ostaju na deviznom računu." },
  { kljuc: "prodaj_deo" as const, naziv: "Prodaj deo po izboru", opis: "Prodajem onoliko koliko ti kažeš, na primer 50 %." },
  { kljuc: "prodaj_sve" as const, naziv: "Prodaj sve automatski", opis: "Ceo iznos odmah prelazi u dinare po kursu banke." },
];

export function ClientPanel({
  klijent,
  racuni,
  onClose,
  onSaved,
  onObrisi,
}: {
  klijent: KlijentRed | null;
  racuni: { id: string; currency: string; bank: string; iban: string | null; number: string | null }[];
  onClose: () => void;
  onSaved: (noviKlijent?: NoviKlijent) => void;
  onObrisi?: () => void;
}) {
  const isNew = !klijent;
  const action = isNew ? dodajKlijentaAction : izmeniKlijentaAction.bind(null, klijent!.id);
  const [stanje, formAction, uToku] = useActionState(action, POCETNO_STANJE);

  const [valuta, setValuta] = useState(klijent?.defaultCurrency ?? "EUR");
  const [jezik, setJezik] = useState<"sr" | "en">((klijent?.defaultLang as "sr" | "en") ?? "sr");
  const [autoSendMode, setAutoSendMode] = useState(klijent?.autoSendMode ?? "nasledi");
  const [fxMode, setFxMode] = useState(klijent?.fxMode ?? "proknjizi");

  // Kontrolisana polja (Korak 8b, otkriveno uzgred dok se gradio modal "Novi klijent" u formi fakture):
  // React 19 posle svake izmene stanja iz <form action={...}> SAMA vraća nekontrolisana polja (ona sa
  // samo defaultValue) na početnu vrednost - i kad akcija uspe, i kad vrati greške. Dok su polja bila
  // nekontrolisana, neuspela validacija (npr. PIB) je brisala sve što je korisnik otkucao, uključujući
  // Naziv i Mejl - prava greška, ne nešto namerno. Ispravljeno ovde (u 8b, jer je modal iz forme fakture
  // prvi put stvarno isprobao ponovnu validaciju), važi i za postojeći tab Klijenti (ista komponenta).
  const [name, setName] = useState(klijent?.name ?? "");
  const [billingEmail, setBillingEmail] = useState(klijent?.billingEmail ?? "");
  const [country, setCountry] = useState(klijent?.country ?? "");
  const [pib, setPib] = useState(klijent?.pib ?? "");
  const [address, setAddress] = useState(klijent?.address ?? "");
  const [itemDesc, setItemDesc] = useState(klijent?.defaultItemDesc ?? "");
  const [itemAmount, setItemAmount] = useState(
    klijent?.defaultItemAmount != null ? String(klijent.defaultItemAmount / 100) : "",
  );
  const [defaultDueDays, setDefaultDueDays] = useState(String(klijent?.defaultDueDays ?? 7));

  useEffect(() => {
    if (stanje.sacuvano) onSaved(stanje.klijent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stanje.sacuvano]);

  return (
    <form action={formAction}>
      <SidePanel
        naslov={isNew ? "Novi klijent" : "Uredi klijenta"}
        onClose={onClose}
        mobilnoDugmeZatvoriTekst
        footer={
          <div className={styles.podnozjeRed}>
            {!isNew && (
              <button type="button" className={styles.obrisiLink} onClick={onObrisi}>
                {klijent!.imaFaktura ? "Arhiviraj klijenta" : "Obriši klijenta"}
              </button>
            )}
            <div className={styles.podnozjeDugmad}>
              <Button type="button" varijanta="sekundarno" disabled={uToku} onClick={onClose}>
                Odustani
              </Button>
              <Button type="submit" varijanta="primarno" disabled={uToku}>
                {uToku ? "Čuvam..." : isNew ? "Sačuvaj klijenta" : "Sačuvaj izmene"}
              </Button>
            </div>
          </div>
        }
      >
        <div className={styles.sekcija}>
          <span className={styles.naslovSekcije}>Podaci o klijentu</span>
          <Polje
            label="Naziv klijenta"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={stanje.errors.name}
            disabled={uToku}
          />
          <Polje
            label="Mejl za fakture"
            name="billingEmail"
            type="email"
            hint="Fakture šaljem na ovu adresu."
            value={billingEmail}
            onChange={(e) => setBillingEmail(e.target.value)}
            error={stanje.errors.billingEmail}
            disabled={uToku}
          />
          <div className={styles.red}>
            <Polje label="Država" name="country" value={country} onChange={(e) => setCountry(e.target.value)} disabled={uToku} />
            <Polje
              label="PIB ili VAT"
              name="pib"
              value={pib}
              onChange={(e) => setPib(e.target.value)}
              error={stanje.errors.pib}
              placeholder="–"
              disabled={uToku}
            />
          </div>
          <Polje
            label="Adresa"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={stanje.errors.address}
            disabled={uToku}
          />
        </div>

        <hr className={styles.linija} />

        <div className={styles.sekcija}>
          <div>
            <span className={styles.naslovSekcije}>Podrazumevano za fakture ovom klijentu</span>
            <p className={styles.pomocniTekst}>
              Kad izabereš klijenta, ovo se popuni samo. Na svakoj fakturi možeš da promeniš.
            </p>
          </div>
          <div className={styles.segmentiran}>
            {["EUR", "USD", "RSD"].map((c) => (
              <button
                key={c}
                type="button"
                className={valuta === c ? styles.aktivno : ""}
                onClick={() => setValuta(c)}
                disabled={uToku}
              >
                {c}
              </button>
            ))}
          </div>
          <input type="hidden" name="defaultCurrency" value={valuta} />

          <span className={styles.labelaPolja}>Jezik fakture</span>
          <div className={styles.segmentiran}>
            {(["sr", "en"] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={jezik === k ? styles.aktivno : ""}
                onClick={() => setJezik(k)}
                disabled={uToku}
              >
                {k === "sr" ? "Srpski" : "Engleski"}
              </button>
            ))}
          </div>
          <input type="hidden" name="defaultLang" value={jezik} />

          <Polje
            label="Rok plaćanja (dana)"
            name="defaultDueDays"
            type="number"
            min={1}
            value={defaultDueDays}
            onChange={(e) => setDefaultDueDays(e.target.value)}
            disabled={uToku}
          />

          <div className={styles.polje}>
            <label className={styles.labelaPolja} htmlFor="defaultAccountId">
              Račun za uplatu
            </label>
            <select
              id="defaultAccountId"
              name="defaultAccountId"
              className={styles.select}
              defaultValue={klijent?.defaultAccountId ?? ""}
              disabled={uToku}
            >
              <option value="">–</option>
              {racuni
                .filter((r) => r.currency === valuta)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.bank}, {r.currency}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <span className={styles.labelaPolja}>Podrazumevana stavka (nije obavezno)</span>
            <p className={styles.pomocniTekst}>
              Ako klijent uvek plaća isto. Ako se iznos menja, ostavi prazno i upisaću ga na fakturi.
            </p>
            <div className={styles.red}>
              <input
                className={styles.unosProst}
                name="itemDesc"
                placeholder="Opis"
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                disabled={uToku}
              />
              <input
                className={styles.unosProst}
                name="itemAmount"
                type="number"
                step="0.01"
                placeholder="Cena"
                value={itemAmount}
                onChange={(e) => setItemAmount(e.target.value)}
                disabled={uToku}
              />
            </div>
          </div>
        </div>

        {!isNew && (
          <>
            <hr className={styles.linija} />
            <div className={styles.sekcija}>
              <div>
                <span className={styles.naslovSekcije}>Mejlovi banke za ovog klijenta</span>
                <p className={styles.pomocniTekst}>Šta radim kad banka javi uplatu od {klijent!.name}</p>
              </div>
              {AUTO_SEND_OPCIJE.map((op) => (
                <button
                  key={op.kljuc}
                  type="button"
                  className={`${styles.radioKartica} ${autoSendMode === op.kljuc ? styles.radioAktivna : ""}`}
                  onClick={() => setAutoSendMode(op.kljuc)}
                  disabled={uToku}
                >
                  <span className={styles.radioTacka} />
                  <span className={styles.radioTekst}>
                    <span>{op.naziv}</span>
                    <span className={styles.pomocniTekst}>{op.opis}</span>
                  </span>
                </button>
              ))}
              <input type="hidden" name="autoSendMode" value={autoSendMode} />

              {valuta !== "RSD" && (
                <>
                  <div>
                    <span className={styles.naslovSekcije}>Devizni priliv od ovog klijenta</span>
                    <p className={styles.pomocniTekst}>
                      Važi samo uz automatsku obradu. Za dinarske uplate ništa ne prodajem.
                    </p>
                  </div>
                  {FX_OPCIJE.map((op) => (
                    <button
                      key={op.kljuc}
                      type="button"
                      className={`${styles.radioKartica} ${fxMode === op.kljuc ? styles.radioAktivna : ""}`}
                      onClick={() => setFxMode(op.kljuc)}
                      disabled={uToku}
                    >
                      <span className={styles.radioTacka} />
                      <span className={styles.radioTekst}>
                        <span>{op.naziv}</span>
                        <span className={styles.pomocniTekst}>{op.opis}</span>
                      </span>
                    </button>
                  ))}
                  <input type="hidden" name="fxMode" value={fxMode} />
                </>
              )}
            </div>
          </>
        )}
      </SidePanel>
    </form>
  );
}
