"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { IkonaKopiraj, IkonaKvacica } from "@/components/ui/icons";
import { generisiNoviKalendarTokenAction, promeniKalendarSinhronizacijuAction } from "./actions";
import styles from "./PovezivanjeTab.module.css";

function KopirajDugme({ vrednost }: { vrednost: string }) {
  const [kopirano, setKopirano] = useState(false);
  function kopiraj() {
    navigator.clipboard
      .writeText(vrednost)
      .then(() => {
        setKopirano(true);
        setTimeout(() => setKopirano(false), 1800);
      })
      .catch(() => {});
  }
  return (
    <button type="button" className={styles.kopirajIkonica} onClick={kopiraj} aria-label="Kopiraj">
      {kopirano ? <IkonaKvacica size={18} /> : <IkonaKopiraj size={18} />}
    </button>
  );
}

export function PovezivanjeTab({
  adresaZaPrijem,
  kalendarUrl: pocetniKalendarUrl,
  kalendarSyncEnabled,
}: {
  adresaZaPrijem: string;
  kalendarUrl: string;
  kalendarSyncEnabled: boolean;
}) {
  const [kalendarUrl, setKalendarUrl] = useState(pocetniKalendarUrl);
  const [sinhronizacija, setSinhronizacija] = useState(kalendarSyncEnabled);
  const [, pokreni] = useTransition();
  const [generisanjeUToku, setGenerisanjeUToku] = useState(false);

  function generisiNoviToken() {
    setGenerisanjeUToku(true);
    pokreni(async () => {
      const noviToken = await generisiNoviKalendarTokenAction();
      const bazniUrl = kalendarUrl.slice(0, kalendarUrl.lastIndexOf("/") + 1);
      setKalendarUrl(bazniUrl + noviToken);
      setGenerisanjeUToku(false);
    });
  }

  function promeniSinhronizaciju(vrednost: boolean) {
    setSinhronizacija(vrednost);
    pokreni(async () => {
      await promeniKalendarSinhronizacijuAction(vrednost);
    });
  }

  return (
    <div className={styles.forma}>
      <div className={styles.kartica}>
        <div className={styles.zaglavljeKartice}>
          <div>
            <div className={styles.naslov}>Mejlovi banke</div>
            <div className={styles.opis}>Banka šalje obaveštenja o prilivima na ovu adresu.</div>
          </div>
          {/* Frejm Pd5 prikazuje "Povezano", ali prijem mejlova banke stvarno još ne postoji (nema mail
              servisa koji bi ga potvrdio) - zato je ovde stanje čekanja, isto kao OnbO7/OnbO8 u
              onboardingu, ne lažno "Povezano". Videti izveštaj. */}
          <span className={styles.pilulaNeutralna}>Čeka prvi mejl</span>
        </div>
        <div className={styles.red}>
          <span className={styles.redTekst}>{adresaZaPrijem}</span>
          <KopirajDugme vrednost={adresaZaPrijem} />
        </div>
        <a href="/mejlovi-banke" className={styles.link}>
          Podešavanja slanja
        </a>
      </div>

      <div className={styles.kartica}>
        <div className={styles.zaglavljeKartice}>
          <div>
            <div className={styles.naslov}>Kalendar</div>
            <div className={styles.opis}>Rokovi i podsetnici u tvom Google ili Apple kalendaru.</div>
          </div>
          <Toggle on={sinhronizacija} onChange={promeniSinhronizaciju} label="Sinhronizacija kalendara" />
        </div>
        <span className={styles.opis}>Link za pretplatu na kalendar</span>
        <div className={styles.red}>
          <span className={styles.redTekst}>{kalendarUrl}</span>
          <KopirajDugme vrednost={kalendarUrl} />
        </div>
        <div>
          <Button varijanta="sekundarno" disabled={generisanjeUToku} onClick={generisiNoviToken}>
            {generisanjeUToku ? "Generišem..." : "Generiši novi"}
          </Button>
        </div>
      </div>

      <div className={styles.kartica}>
        <div className={styles.zaglavljeKartice}>
          <div>
            <div className={styles.naslov}>Izvoz podataka</div>
            <div className={styles.opis}>Sve fakture, prihode i dokumenta u jednom paketu.</div>
          </div>
          <a href="/api/izvoz-podataka">
            <Button varijanta="sekundarno">Preuzmi</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
