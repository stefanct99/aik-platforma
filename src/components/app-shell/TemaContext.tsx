"use client";

// Korak 8a (ispravka): JEDAN izvor istine za "koja tema je trenutno prikazana" (ne za čuvanje - to radi
// sacuvajTemuAction, već postojalo). Bez ovoga, gornja traka i Podešavanja > Jezik i izgled su bili DVE
// odvojene React komponente sa SOPSTVENIM lokalnim stanjem: klik na jednoj nije ažurirao istaknuto dugme
// na drugoj (iako je DOM atribut teme ispravno menjan), pa su mogle da pokazuju različito "istaknuto"
// dugme na istoj stranici. Provider se postavlja jednom u AppShell-u i u OnboardingShell-u (oba mesta
// gde postoji prekidač teme), sve komponente ispod čitaju/pišu isto stanje preko useTemaDeljena().
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Tema } from "@/lib/theme";

function primeniTemuNaStranici(tema: Tema) {
  const omot = document.querySelector<HTMLElement>(".appShell");
  if (!omot) return;
  if (tema === "sistem") omot.removeAttribute("data-theme");
  else omot.setAttribute("data-theme", tema);
}

type TemaContextValue = { tema: Tema; setTema: (tema: Tema) => void };

const TemaContext = createContext<TemaContextValue | null>(null);

export function TemaProvider({ initialTema, children }: { initialTema: Tema; children: ReactNode }) {
  const [tema, setTemaState] = useState<Tema>(initialTema);

  function setTema(nova: Tema) {
    setTemaState(nova);
    primeniTemuNaStranici(nova);
  }

  return <TemaContext.Provider value={{ tema, setTema }}>{children}</TemaContext.Provider>;
}

export function useTemaDeljena(): TemaContextValue {
  const kontekst = useContext(TemaContext);
  if (!kontekst) {
    throw new Error("useTemaDeljena mora da se koristi unutar <TemaProvider>.");
  }
  return kontekst;
}
