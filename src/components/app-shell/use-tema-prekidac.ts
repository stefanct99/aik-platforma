"use client";

import { startTransition, useActionState, useSyncExternalStore } from "react";
import type { Tema } from "@/lib/theme";
import { sacuvajTemuAction, type TemaStanje } from "@/app/(app)/podesavanja/jezik-i-izgled/actions";
import { useTemaDeljena } from "./TemaContext";

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

// Korak 8a (ispravka): deljena logika za SAMOSTALNE prekidače teme koji čuvaju odmah na klik (gornja
// traka aplikacije, onboarding pilula) - za razliku od "Izgled" u Podešavanja > Jezik i izgled, koji
// samo pregleda dok se ne klikne "Sačuvaj izmene" (frejm Pd7 ima jedno zajedničko dugme za sve). Oba
// ipak dele ISTO prikazano stanje preko TemaContext-a (useTemaDeljena), da ne ostanu nesinhronizovana na
// istoj stranici (ranije su bila dva odvojena lokalna stanja, pa je jedno moglo da pokaže "istaknuto"
// drugo dugme od onoga što je stvarno prikazano).
export function useTemaPrekidac() {
  const { tema, setTema } = useTemaDeljena();
  const [, action] = useActionState<TemaStanje, FormData>(sacuvajTemuAction, { tema, sacuvano: false });
  const sistemskiTamno = useSyncExternalStore(
    pretplatiSeNaSistemskuTemu,
    procitajSistemskuTemu,
    procitajSistemskuTemuNaServeru,
  );
  const efektivnoTamno = tema === "sistem" ? sistemskiTamno : tema === "tamni";

  function izaberi(novaTema: Tema) {
    setTema(novaTema);
    const podaci = new FormData();
    podaci.set("tema", novaTema);
    startTransition(() => action(podaci));
  }

  return { efektivnoTamno, izaberi };
}
