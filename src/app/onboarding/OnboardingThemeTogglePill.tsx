"use client";

import { startTransition, useActionState, useSyncExternalStore } from "react";
import { IkonaMesec, IkonaSunce } from "@/components/auth-shell/auth-icons";
import type { Tema } from "@/lib/theme";
import { sacuvajTemuAction, type TemaStanje } from "@/app/(app)/podesavanja/jezik-i-izgled/actions";
import styles from "@/components/auth-shell/ThemeTogglePill.module.css";

function primeniTemuNaStranici(tema: Tema) {
  document.querySelector(".appShell")?.setAttribute("data-theme", tema);
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

// Za razliku od pre-login ThemeTogglePill (Korak 5, localStorage), ovde korisnik VEĆ ima sesiju, pa
// klik odmah i trajno čuva temu preko iste akcije kao Podešavanja > Jezik i izgled (sacuvajTemuAction) -
// nema potrebe za localStorage ni blokirajućom skriptom, tema je već tačna iz SSR-a (videti
// OnboardingShell).
export function OnboardingThemeTogglePill({ tema: pocetnaTema }: { tema: Tema }) {
  const [stanje, action] = useActionState<TemaStanje, FormData>(sacuvajTemuAction, {
    tema: pocetnaTema,
    sacuvano: false,
  });
  const sistemskiTamno = useSyncExternalStore(
    pretplatiSeNaSistemskuTemu,
    procitajSistemskuTemu,
    procitajSistemskuTemuNaServeru,
  );
  const trenutnaTema = stanje.sacuvano ? stanje.tema : pocetnaTema;
  const efektivnoTamno = trenutnaTema === "sistem" ? sistemskiTamno : trenutnaTema === "tamni";

  function izaberi(tema: Tema) {
    primeniTemuNaStranici(tema);
    const podaci = new FormData();
    podaci.set("tema", tema);
    startTransition(() => action(podaci));
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
