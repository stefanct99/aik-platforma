// Sedam tabova Podešavanja (spec 5.1, 7.13; dizajn Pd0/Pd1..Pd7).

import type { ComponentType } from "react";
import {
  IkonaBezbednost,
  IkonaFakture,
  IkonaMejlovi,
  IkonaPodesavanja,
  IkonaProfilFirma,
  IkonaRacuni,
  IkonaZvonce,
} from "@/components/ui/icons";

export type PodesavanjaStavka = {
  slug: string;
  naziv: string;
  opis: string;
  Ikona: ComponentType<{ size?: number }>;
};

export const PODESAVANJA_STAVKE: PodesavanjaStavka[] = [
  { slug: "profil-i-firma", naziv: "Profil i firma", opis: "Podaci koji idu na fakture", Ikona: IkonaProfilFirma },
  { slug: "racuni", naziv: "Računi", opis: "Dinarski i devizni računi", Ikona: IkonaRacuni },
  { slug: "pretplata", naziv: "Pretplata", opis: "Plan i naplata", Ikona: IkonaFakture },
  { slug: "obavestenja", naziv: "Obaveštenja", opis: "Šta i kako te obaveštavam", Ikona: IkonaZvonce },
  { slug: "povezivanje", naziv: "Povezivanje", opis: "Mejl banke, kalendar, izvoz", Ikona: IkonaMejlovi },
  {
    slug: "bezbednost-i-nalog",
    naziv: "Bezbednost i nalog",
    opis: "Lozinka i prijava",
    Ikona: IkonaBezbednost,
  },
  { slug: "jezik-i-izgled", naziv: "Jezik i izgled", opis: "Jezik, formati, tema", Ikona: IkonaPodesavanja },
];
