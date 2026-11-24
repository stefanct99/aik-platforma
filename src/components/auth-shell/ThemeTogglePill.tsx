"use client";

import { useLayoutEffect, useState, useSyncExternalStore } from "react";
import { IkonaMesec, IkonaSunce } from "./auth-icons";
import { ID_AUTH_SHELL, sacuvajTemuPrijave, ucitajTemuPrijave, type TemaPrijave } from "./tema-prijava";
import styles from "./ThemeTogglePill.module.css";

function primeniTemu(tema: TemaPrijave) {
  document.getElementById(ID_AUTH_SHELL)?.setAttribute("data-theme", tema);
}

function pretplatiSeNaSistemskuTemu(najaviPromenu: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", najaviPromenu);
  return () => mq.removeEventListener("change", najaviPromenu);
}
function procitajSistemskuTemu() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function procitajSistemskuTemuNaServeru() {
  return false;
}

// Pilula ne čita localStorage pri učitavanju (ta vrednost je već primenjena na stranicu pre iscrtavanja,
// preko blokirajuće skripte u AuthShell-u) - samo koji je taster istaknut dok korisnik ne klikne, i
// nakon klika u ovoj poseti. Sistemska tema se prati uživo (useSyncExternalStore), da promena
// podešavanja uređaja dok je stranica otvorena odmah pomeri istaknuti taster.
export function ThemeTogglePill() {
  const sistemskiTamno = useSyncExternalStore(
    pretplatiSeNaSistemskuTemu,
    procitajSistemskuTemu,
    procitajSistemskuTemuNaServeru,
  );
  const [izabranaTema, setIzabranaTema] = useState<TemaPrijave | null>(null);

  // Blokirajuća skripta u AuthShell-u primeni sačuvanu temu samo na tvrdom učitavanju stranice (novi
  // HTTP zahtev) - React upozorava da <script> koji ubaci sam React (npr. klijentska navigacija sa
  // Link-a na drugu stranicu prijave) ne izvršava. useLayoutEffect ovde to nadoknađuje za taj slučaj:
  // ponovo primenjuje sačuvanu temu pre sledećeg iscrtavanja, bez direktnog postavljanja React stanja
  // (samo DOM atribut), da ne izazove upozorenje "setState u efektu".
  useLayoutEffect(() => {
    const sacuvano = ucitajTemuPrijave();
    if (sacuvano) primeniTemu(sacuvano);
  }, []);

  const efektivnoTamno = izabranaTema ? izabranaTema === "tamni" : sistemskiTamno;

  function izaberi(tema: TemaPrijave) {
    setIzabranaTema(tema);
    sacuvajTemuPrijave(tema);
    primeniTemu(tema);
  }

  return (
    <div className={styles.pilula} title="Izgled: svetli / tamni">
      <button
        type="button"
        className={`${styles.dugme} ${!efektivnoTamno ? styles.aktivno : ""}`}
        onClick={() => izaberi("svetli")}
        aria-label="Svetli izgled"
      >
        <IkonaSunce size={16} />
      </button>
      <button
        type="button"
        className={`${styles.dugme} ${efektivnoTamno ? styles.aktivno : ""}`}
        onClick={() => izaberi("tamni")}
        aria-label="Tamni izgled"
      >
        <IkonaMesec size={16} />
      </button>
    </div>
  );
}
