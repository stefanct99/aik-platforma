import { useId, useState, type KeyboardEvent } from "react";
import { pretraziKD2025, type RezultatPretrageKD } from "@/lib/kd-sifre";

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
    <div>
      <label>
        <span>Šifra delatnosti</span>
        <input
          role="combobox"
          aria-expanded={otvoreno}
          aria-controls={listaId}
          value={upit}
          disabled={disabled}
          placeholder="Upiši šifru (62.10 ili 6201) ili deo naziva, npr. programiranje"
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
      </label>
      <input type="hidden" name="delatnostCode" value={izabranaSifra} />
      {otvoreno && rezultati.length > 0 && (
        <ul id={listaId} role="listbox">
          {rezultati.map((rezultat, i) => (
            <li key={rezultat.code} role="option" aria-selected={i === istaknuto}>
              <button
                type="button"
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
      {error && <p>{error}</p>}
    </div>
  );
}
