"use client";

import { useActionState, useRef, useState, type ChangeEvent } from "react";
import { Polje } from "@/components/ui/Polje";
import { Button } from "@/components/ui/Button";
import { DelatnostCombobox } from "@/components/ui/DelatnostCombobox";
import { IkonaKalendar, IkonaUpload } from "@/components/ui/icons";
import { suNazivIliPibPromenjeni } from "@/lib/profil-promene";
import { sacuvajProfilFirmeAction, type ProfilFirmeStanje } from "./actions";
import styles from "./ProfilFirmaForm.module.css";

export function ProfilFirmaForm({ initial }: { initial: ProfilFirmeStanje["values"] }) {
  const [stanje, action, uToku] = useActionState<ProfilFirmeStanje, FormData>(
    sacuvajProfilFirmeAction,
    { errors: {}, values: initial, sacuvano: false },
  );

  // Prati trenutni naziv/PIB da bi se pokazalo upozorenje (spec 7.13) čim se razlikuju od sačuvanih, pre
  // slanja forme. Ne kontroliše polje (ostaje defaultValue), samo osluškuje promenu.
  const [trenutniNaziv, setTrenutniNaziv] = useState(initial.name);
  const [trenutniPib, setTrenutniPib] = useState(initial.pib);
  const promenjenNazivIliPib = suNazivIliPibPromenjeni(
    { naziv: trenutniNaziv, pib: trenutniPib },
    { naziv: initial.name, pib: initial.pib },
  );

  const [regDate, setRegDate] = useState(initial.regDate);
  const [resetToken, setResetToken] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  function onReset() {
    setTrenutniNaziv(initial.name);
    setTrenutniPib(initial.pib);
    setRegDate(initial.regDate);
    setResetToken((t) => t + 1);
  }

  return (
    <form ref={formRef} action={action} onReset={onReset} className={styles.forma}>
      {promenjenNazivIliPib && (
        <p className={styles.upozorenje} role="status">
          Promena PIB-a ili naziva firme važi samo za buduće fakture, stare ostaju nepromenjene.
        </p>
      )}
      {stanje.sacuvano && (
        <p className={styles.uspeh} role="status">
          Sačuvano.
        </p>
      )}

      <div className={styles.red}>
        <Polje
          label="Naziv firme"
          name="name"
          defaultValue={stanje.values.name}
          error={stanje.errors.name}
          disabled={uToku}
          onChange={(e) => setTrenutniNaziv(e.target.value)}
        />
        <Polje
          label="Ime i prezime vlasnika"
          name="ownerName"
          defaultValue={stanje.values.ownerName}
          error={stanje.errors.ownerName}
          disabled={uToku}
        />
      </div>

      <div className={styles.red}>
        <Polje
          label="PIB"
          name="pib"
          defaultValue={stanje.values.pib}
          maxLength={9}
          inputMode="numeric"
          placeholder="9 cifara"
          error={stanje.errors.pib}
          disabled={uToku}
          onChange={(e) => setTrenutniPib(e.target.value)}
        />
        <Polje
          label="Matični broj"
          name="mb"
          defaultValue={stanje.values.mb}
          maxLength={8}
          inputMode="numeric"
          placeholder="8 cifara"
          error={stanje.errors.mb}
          disabled={uToku}
        />
        <Polje
          label="Datum registracije"
          name="regDate"
          type="text"
          inputMode="numeric"
          placeholder="dd.mm.gggg."
          value={regDate}
          onChange={(dogadjaj: ChangeEvent<HTMLInputElement>) =>
            setRegDate(dogadjaj.target.value.replace(/[^0-9.]/g, ""))
          }
          desno={<IkonaKalendar size={18} />}
          error={stanje.errors.regDate}
          disabled={uToku}
        />
      </div>

      <div className={styles.red}>
        <Polje
          label="Ulica i broj"
          name="street"
          defaultValue={stanje.values.street}
          error={stanje.errors.street}
          disabled={uToku}
        />
        <Polje
          label="Mesto"
          name="city"
          defaultValue={stanje.values.city}
          error={stanje.errors.city}
          disabled={uToku}
        />
        <Polje
          label="Poštanski broj"
          name="zip"
          defaultValue={stanje.values.zip}
          maxLength={5}
          inputMode="numeric"
          placeholder="5 cifara"
          error={stanje.errors.zip}
          disabled={uToku}
        />
      </div>

      <DelatnostCombobox
        key={resetToken}
        initialCode={stanje.values.delatnostCode}
        initialName={stanje.values.delatnostName}
        error={stanje.errors.delatnostCode}
        disabled={uToku}
      />

      <div className={styles.red}>
        <Polje
          label="Kontakt mejl"
          name="contactEmail"
          type="email"
          defaultValue={stanje.values.contactEmail}
          hint="Nije obavezno."
          disabled={uToku}
        />
        <Polje
          label="Telefon"
          name="phone"
          defaultValue={stanje.values.phone}
          hint="Nije obavezno."
          disabled={uToku}
        />
      </div>

      <div className={styles.logoPolje}>
        <span className={styles.logoLabela}>Logo (nije obavezno)</span>
        <div className={styles.dropzone}>
          <span className={styles.dropzoneIkona}>
            <IkonaUpload size={24} />
          </span>
          <span className={styles.dropzoneTekst}>
            Prevuci logo ovde ili <u>izaberi fajl</u>
          </span>
          <span className={styles.dropzonePomoc}>PNG ili SVG, do 2 MB. Možeš ga dodati i kasnije.</span>
        </div>
      </div>

      <div className={styles.dugmad}>
        <Button type="reset" varijanta="sekundarno" disabled={uToku}>
          Odustani
        </Button>
        <Button type="submit" varijanta="primarno" disabled={uToku}>
          {uToku ? "Čuvam..." : "Sačuvaj izmene"}
        </Button>
      </div>
    </form>
  );
}
