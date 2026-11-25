// Padajući meni reda (⋯, Korak 8a, frejm Fak1/Fak16, ispravka "meni se seče" - deljena komponenta za
// SVE ⋯ menije u delu Fakture: lista faktura, Ponavljajuće i pregled fakture). Otvoren izgled (mere,
// redosled stavki, boje, senka, radijus) je i dalje tačno po Fak16 - ništa od toga nije menjano, samo
// NAČIN prikaza: meni se sad renderuje kroz portal sa position:fixed (src/lib/meni-pozicija.ts računa
// gde), umesto position:absolute unutar reda - kartice tabele (Fakture/Ponavljajuće) imaju overflow:
// hidden radi zaobljenih ivica (deo izgleda po okviru, ne diramo), pa je apsolutno pozicioniran meni
// unutar reda bio odsečen u poslednjim redovima. Portal cilja najbliži ".appShell" (ne document.body
// direktno) jer su boje teme skolirane na tu klasu (theme.css), ne na :root - portal u body bi ostao
// bez boja.
"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IkonaTacke } from "@/components/ui/icons";
import { izracunajPozicijuMenija, type PozicijaMenija } from "@/lib/meni-pozicija";
import styles from "./RedMenija.module.css";

export type StavkaMenija = {
  kljuc: string;
  tekst: string;
  opasno?: boolean;
  onClick?: () => void;
  href?: string;
};

const SIRINA_MENIJA = 260;
// Samo JEDAN meni otvoren u isto vreme - ostali se zatvaraju kad se ovaj otvori (dogadjaj na window-u,
// bez potrebe za Context providerom oko svih instanci).
const DOGADJAJ_OTVARANJA = "aik:red-menija-otvoren";

export function RedMenija({ stavke }: { stavke: StavkaMenija[] }) {
  const [otvoreno, setOtvoreno] = useState(false);
  const [pozicija, setPozicija] = useState<PozicijaMenija | null>(null);
  // Portal NIJE uvek u document.body: boje teme (--color-surface i ostalo, src/styles/theme.css) su
  // namerno skolirane na klasu "appShell" (ne na :root, da bi onboarding ostao bez teme) - meni mora da
  // se pojavi UNUTAR tog elementa da bi nasledio te promenljive, inače je proziran. "appShell" ipak nema
  // overflow/transform koji bi posekao ili pomerio position:fixed, pa i dalje pobeđuje odsecanje kartice.
  const [portalCilj, setPortalCilj] = useState<Element | null>(null);
  const dugmeRef = useRef<HTMLButtonElement>(null);
  const meniRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(Symbol("red-menija"));

  function zatvori() {
    setOtvoreno(false);
    setPozicija(null);
  }

  function naKlikDugmeta(e: React.MouseEvent) {
    e.stopPropagation();
    if (otvoreno) {
      zatvori();
      return;
    }
    window.dispatchEvent(new CustomEvent(DOGADJAJ_OTVARANJA, { detail: idRef.current }));
    setPortalCilj(dugmeRef.current?.closest(".appShell") ?? document.body);
    setOtvoreno(true);
  }

  useLayoutEffect(() => {
    if (!otvoreno) return;

    function naTudjeOtvaranje(e: Event) {
      if ((e as CustomEvent).detail !== idRef.current) zatvori();
    }
    function naKlikVan(e: MouseEvent) {
      const meta = e.target as Node;
      if (dugmeRef.current?.contains(meta) || meniRef.current?.contains(meta)) return;
      zatvori();
    }
    function naTaster(e: KeyboardEvent) {
      if (e.key === "Escape") zatvori();
    }
    // Scroll stranice ili promena veličine prozora zatvara meni (umesto da ga prati) - jednostavnije i
    // dovoljno, isti zahtev kao kod drugih padajućih menija u ovom koraku.
    function naScrollIliResize() {
      zatvori();
    }

    window.addEventListener(DOGADJAJ_OTVARANJA, naTudjeOtvaranje);
    document.addEventListener("mousedown", naKlikVan);
    document.addEventListener("keydown", naTaster);
    window.addEventListener("scroll", naScrollIliResize, true);
    window.addEventListener("resize", naScrollIliResize);
    return () => {
      window.removeEventListener(DOGADJAJ_OTVARANJA, naTudjeOtvaranje);
      document.removeEventListener("mousedown", naKlikVan);
      document.removeEventListener("keydown", naTaster);
      window.removeEventListener("scroll", naScrollIliResize, true);
      window.removeEventListener("resize", naScrollIliResize);
    };
  }, [otvoreno]);

  // Izmeri STVARNU visinu menija posle render-a (broj stavki je promenljiv) pa izračunaj da li ima
  // mesta ispod dugmeta ili meni mora da se otvori nagore (src/lib/meni-pozicija.ts, testirano zasebno).
  // Prvi render je van ekrana/sakriven (pozicija je null) da korisnik ne vidi skok pozicije.
  useLayoutEffect(() => {
    if (!otvoreno || !dugmeRef.current || !meniRef.current) return;
    const dugme = dugmeRef.current.getBoundingClientRect();
    const visinaMenija = meniRef.current.offsetHeight;
    setPozicija(
      izracunajPozicijuMenija(
        dugme,
        { width: SIRINA_MENIJA, height: visinaMenija },
        { width: window.innerWidth, height: window.innerHeight },
      ),
    );
  }, [otvoreno, stavke.length]);

  return (
    <span className={styles.omot}>
      <button type="button" ref={dugmeRef} className={styles.dugme} onClick={naKlikDugmeta} aria-label="Više opcija">
        <IkonaTacke size={20} />
      </button>
      {otvoreno &&
        portalCilj &&
        createPortal(
          <div
            ref={meniRef}
            className={styles.padajuci}
            style={{
              position: "fixed",
              top: pozicija?.top ?? 0,
              left: pozicija?.left ?? 0,
              visibility: pozicija ? "visible" : "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {stavke.map((st): ReactNode =>
              st.href ? (
                <a key={st.kljuc} href={st.href} className={`${styles.stavka} ${st.opasno ? styles.opasno : ""}`}>
                  {st.tekst}
                </a>
              ) : (
                <button
                  key={st.kljuc}
                  type="button"
                  className={`${styles.stavka} ${st.opasno ? styles.opasno : ""}`}
                  onClick={() => {
                    zatvori();
                    st.onClick?.();
                  }}
                >
                  {st.tekst}
                </button>
              ),
            )}
          </div>,
          portalCilj,
        )}
    </span>
  );
}
