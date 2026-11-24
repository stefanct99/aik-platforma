import { useId, useState, type KeyboardEvent } from "react";
import { pretraziKD2025, type RezultatPretrageKD } from "@/lib/kd-sifre";
import { IkonaStrelicaDole, IkonaUpozorenjeKrug } from "@/components/auth-shell/auth-icons";
import styles from "@/components/auth-shell/PoljeAuth.module.css";
import listaStyles from "./SifraDelatnostiPolje.module.css";

export function SifraDelatnostiPolje({
  initialCode,
  initialName,
  error,
  disabled,
}: {
  initialCode: string;
  initialName: string;
  error?: string;
  disabled?: boolean;
}) {
  const [upit, setUpit] = useState(initialCode && initialName ? `${initialCode} ${initialName}` : "");
  const [izabranaSifra, setIzabranaSifra] = useState(initialCode);
  const [otvoreno, setOtvoreno] = useState(false);
  const [istaknuto, setIstaknuto] = useState(0);
  const listaId = useId();

  const rezultati = otvoreno ? pretraziKD2025(upit).slice(0, 30) : [];

  function izaberi(rezultat: RezultatPretrageKD) {
    setIzabranaSifra(rezultat.code);
    setUpit(`${rezultat.code} ${rezultat.name}`);
    setOtvoreno(false);
  }

  function onKeyDown(dogadjaj: KeyboardEvent<HTMLInputElement>) {
    if (!otvoreno || rezultati.length === 0) return;
    if (dogadjaj.key === "ArrowDown") {
      dogadjaj.preventDefault();
      setIstaknuto((i) => Math.min(i + 1, rezultati.length - 1));
    } else if (dogadjaj.key === "ArrowUp") {
      dogadjaj.preventDefault();
      setIstaknuto((i) => Math.max(i - 1, 0));
    } else if (dogadjaj.key === "Enter") {
      dogadjaj.preventDefault();
      izaberi(rezultati[istaknuto]);
    } else if (dogadjaj.key === "Escape") {
      setOtvoreno(false);
    }
  }

  return (
    <div className={styles.polje}>
      <label htmlFor={listaId}>Šifra delatnosti</label>
      <span className={styles.unosOmot}>
        <input
          id={listaId}
          role="combobox"
          aria-expanded={otvoreno}
          aria-controls={`${listaId}-lista`}
          className={[styles.unos, error ? styles.greska : ""].filter(Boolean).join(" ")}
          style={{ paddingRight: 48 }}
          value={upit}
          disabled={disabled}
          placeholder="Izaberi šifru delatnosti"
          autoComplete="off"
          onChange={(dogadjaj) => {
            setUpit(dogadjaj.target.value);
            setIzabranaSifra("");
            setOtvoreno(true);
            setIstaknuto(0);
          }}
          onFocus={() => setOtvoreno(true)}
          onBlur={() => setOtvoreno(false)}
          onKeyDown={onKeyDown}
        />
        <span className={listaStyles.strelica}>
          <IkonaStrelicaDole size={20} />
        </span>
        {otvoreno && rezultati.length > 0 && (
          <ul id={`${listaId}-lista`} role="listbox" className={listaStyles.lista}>
            {rezultati.map((rezultat, i) => (
              <li key={rezultat.code} role="option" aria-selected={i === istaknuto}>
                <button
                  type="button"
                  className={listaStyles.stavka}
                  onMouseDown={(dogadjaj) => {
                    dogadjaj.preventDefault();
                    izaberi(rezultat);
                  }}
                >
                  {rezultat.code} {rezultat.name}
                  {rezultat.staraSifra && <span> (ranije šifra {rezultat.staraSifra})</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </span>
      <input type="hidden" name="delatnostCode" value={izabranaSifra} />
      {error && (
        <div className={styles.greskaPoruka}>
          <IkonaUpozorenjeKrug size={18} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
