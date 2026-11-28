// Dijalog izvoza Knjige prihoda (Korak 9g-1, frejm Kp6, "Izvezi"). Centriran modal (Modal.tsx, isti kao
// dijalog brisanja - zadatak), 440px. Sopstveno stanje (Godina/Period/Format/kućice) - NE prati filtere
// stranice osim početne vrednosti Godine (zadatak: "Godina... podrazumevano godina koja je izabrana na
// stranici"). "Odustani" i zatvaranje odbacuju izmene jer se dijalog UNMOUNT-uje (isti obrazac kao
// DodajPrihodPanel/PrihodPanel - roditelj ga renderuje samo kad je otvoren) - sledeće otvaranje zato
// počinje sa podrazumevanim vrednostima bez ikakve posebne reset logike.
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { IkonaChevronDole, IkonaKvacica } from "@/components/ui/icons";
import { imeFajlaIzvoza, parsirajPeriod } from "@/lib/izvoz-prihoda";
import styles from "./IzveziDialog.module.css";

const MESECI = [
  "Januar",
  "Februar",
  "Mart",
  "April",
  "Maj",
  "Jun",
  "Jul",
  "Avgust",
  "Septembar",
  "Oktobar",
  "Novembar",
  "Decembar",
];

// Vrednosti su isto kodiranje kao parsirajPeriod (izvoz-prihoda.ts) - "cela-godina"/"q1".."q4"/"m01".."m12".
const PERIOD_OPCIJE: { vrednost: string; naziv: string }[] = [
  { vrednost: "cela-godina", naziv: "Cela godina" },
  { vrednost: "q1", naziv: "I kvartal" },
  { vrednost: "q2", naziv: "II kvartal" },
  { vrednost: "q3", naziv: "III kvartal" },
  { vrednost: "q4", naziv: "IV kvartal" },
  ...MESECI.map((naziv, i) => ({
    vrednost: `m${String(i + 1).padStart(2, "0")}`,
    naziv,
  })),
];

export function IzveziDialog({
  godina,
  godine,
  onClose,
}: {
  godina: number;
  godine: number[];
  onClose: () => void;
}) {
  const [godinaIzabrana, setGodinaIzabrana] = useState(godina);
  const [period, setPeriod] = useState("cela-godina");
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");
  const [odvojeno, setOdvojeno] = useState(true);
  const [zbir, setZbir] = useState(true);
  const [poruka, setPoruka] = useState<string | null>(null);
  const [uToku, setUToku] = useState(false);

  async function izvezi() {
    setUToku(true);
    setPoruka(null);
    try {
      const parametri = new URLSearchParams({
        godina: String(godinaIzabrana),
        period,
        format,
        odvojeno: odvojeno ? "1" : "0",
        zbir: zbir ? "1" : "0",
      });
      const odgovor = await fetch(`/knjiga-prihoda/izvoz?${parametri}`);

      // JSON odgovor = nešto nije uspelo (prazan period, pogrešni parametri, PDF render nije uspeo -
      // Korak 9g-2) - "greska" je tekst koji ruta sama smisli (route.ts), prikazuje se direktno, bez
      // nagađanja ovde KOJA je poruka u pitanju.
      if ((odgovor.headers.get("content-type") ?? "").includes("application/json")) {
        const podaci = await odgovor.json();
        setPoruka(
          podaci.prazno
            ? "Nema uplata za izabrani period."
            : (podaci.greska ?? "Nije moguće izvesti knjigu prihoda. Pokušaj ponovo."),
        );
        return;
      }
      if (!odgovor.ok) {
        setPoruka("Nije moguće izvesti knjigu prihoda. Pokušaj ponovo.");
        return;
      }

      const blob = await odgovor.blob();
      const url = URL.createObjectURL(blob);
      const privremeniLink = document.createElement("a");
      privremeniLink.href = url;
      privremeniLink.download = imeFajlaIzvoza(
        godinaIzabrana,
        parsirajPeriod(period)!,
        format,
      );
      document.body.appendChild(privremeniLink);
      privremeniLink.click();
      privremeniLink.remove();
      URL.revokeObjectURL(url);
      onClose();
    } finally {
      setUToku(false);
    }
  }

  return (
    <Modal naslov="Izvezi knjigu prihoda" onClose={onClose}>
      <p className={styles.podnaslov}>
        Dobijaš dokument koji možeš da pošalješ knjigovođi ili priložiš uz
        prijavu.
      </p>
      <div className={styles.polja}>
        <div className={styles.polje}>
          <label htmlFor="izvoziGodina" className={styles.labela}>
            Godina
          </label>
          <span className={styles.padajuciOmot}>
            <select
              id="izvoziGodina"
              className={styles.padajuci}
              value={godinaIzabrana}
              onChange={(e) => setGodinaIzabrana(Number(e.target.value))}
            >
              {godine.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <IkonaChevronDole size={16} className={styles.padajuciIkonica} />
          </span>
        </div>
        <div className={styles.polje}>
          <label htmlFor="izvoziPeriod" className={styles.labela}>
            Period
          </label>
          <span className={styles.padajuciOmot}>
            <select
              id="izvoziPeriod"
              className={styles.padajuci}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {PERIOD_OPCIJE.map((p) => (
                <option key={p.vrednost} value={p.vrednost}>
                  {p.naziv}
                </option>
              ))}
            </select>
            <IkonaChevronDole size={16} className={styles.padajuciIkonica} />
          </span>
        </div>
        <div className={styles.polje}>
          <span className={styles.labela}>Format</span>
          <div className={styles.format}>
            <button
              type="button"
              className={format === "pdf" ? styles.formatAktivan : styles.formatDugme}
              onClick={() => setFormat("pdf")}
            >
              PDF
            </button>
            <button
              type="button"
              className={format === "excel" ? styles.formatAktivan : styles.formatDugme}
              onClick={() => setFormat("excel")}
            >
              Excel
            </button>
          </div>
        </div>
        <button
          type="button"
          role="checkbox"
          aria-checked={odvojeno}
          className={styles.kucicaRed}
          onClick={() => setOdvojeno((v) => !v)}
        >
          <span className={odvojeno ? styles.kucicaUkljucena : styles.kucica}>
            {odvojeno && <IkonaKvacica size={14} />}
          </span>
          Devizni i dinarski prihodi u dve odvojene tabele
        </button>
        <button
          type="button"
          role="checkbox"
          aria-checked={zbir}
          className={styles.kucicaRed}
          onClick={() => setZbir((v) => !v)}
        >
          <span className={zbir ? styles.kucicaUkljucena : styles.kucica}>
            {zbir && <IkonaKvacica size={14} />}
          </span>
          Ukupan zbir na kraju
        </button>
      </div>
      {poruka && <span className={styles.poruka}>{poruka}</span>}
      <div className={styles.dugmad}>
        <Button type="button" varijanta="primarno" disabled={uToku} onClick={izvezi}>
          {uToku ? "Izvozim..." : "Izvezi"}
        </Button>
        <Button type="button" varijanta="sekundarno" disabled={uToku} onClick={onClose}>
          Odustani
        </Button>
      </div>
    </Modal>
  );
}
