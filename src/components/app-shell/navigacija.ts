// Jedinstven spisak sekcija menija (Korak 4, spec 5.2): isti redosled na desktopu (levi meni) i na
// telefonu (donja traka + "Više").

import type { ComponentType } from "react";
import {
  IkonaAi,
  IkonaFakture,
  IkonaKalendar,
  IkonaKnjigaPrihoda,
  IkonaMejlovi,
  IkonaPocetna,
  IkonaPodesavanja,
  IkonaPorez,
} from "@/components/ui/icons";

export type StavkaMenija = {
  href: string;
  naziv: string;
  Ikona: ComponentType<{ size?: number }>;
};

export const STAVKE_MENIJA: StavkaMenija[] = [
  { href: "/pocetna", naziv: "Početna", Ikona: IkonaPocetna },
  { href: "/fakture", naziv: "Fakture", Ikona: IkonaFakture },
  { href: "/knjiga-prihoda", naziv: "Knjiga prihoda", Ikona: IkonaKnjigaPrihoda },
  { href: "/kalendar", naziv: "Kalendar", Ikona: IkonaKalendar },
  { href: "/porez", naziv: "Porez i rokovi", Ikona: IkonaPorez },
  { href: "/mejlovi-banke", naziv: "Mejlovi banke", Ikona: IkonaMejlovi },
  { href: "/ai", naziv: "AI knjigovođa", Ikona: IkonaAi },
  { href: "/podesavanja", naziv: "Podešavanja", Ikona: IkonaPodesavanja },
];

// Donja traka na telefonu (spec 5.3): tačno ovih 5 stavki, "Faktura" vodi na /fakture (nema posebnog
// ekrana za novu fakturu u ovom koraku, pravljenje faktura dolazi kasnije).
export const STAVKE_MOBILNE_TRAKE = [
  STAVKE_MENIJA[0], // Početna
  STAVKE_MENIJA[1], // Fakture
  { href: "/fakture", naziv: "Faktura", Ikona: IkonaFakture },
  STAVKE_MENIJA[4], // Porez
];

// Ostatak menija, dostupan na telefonu kroz "Više" (spec 7.15).
export const STAVKE_VISE = [STAVKE_MENIJA[2], STAVKE_MENIJA[3], STAVKE_MENIJA[5], STAVKE_MENIJA[6], STAVKE_MENIJA[7]];
