// Čista funkcija za pametno pozicioniranje padajućeg ⋯ menija (Fakture: lista, Klijenti, Ponavljajuće,
// pregled fakture - ispravka "meni se seče"). Meni se renderuje kroz portal (position:fixed), pa mora
// sam da računa gde stane - ne oslanja se više na roditeljski overflow/position:relative.

export type Pravougaonik = { top: number; left: number; right: number; bottom: number };
export type VelicinaMenija = { width: number; height: number };
export type VelicinaProzora = { width: number; height: number };
export type PozicijaMenija = { top: number; left: number; otvorenNagore: boolean };

const RAZMAK = 8; // razmak između dugmeta i menija (frejm: 40px top - 32px dugme = 8px)
const IVICA = 8; // minimalna udaljenost menija od ivice ekrana

// dugme: getBoundingClientRect() dugmeta ⋯. meni: STVARNO izmerena širina/visina menija (broj stavki je
// promenljiv). prozor: window.innerWidth/innerHeight.
export function izracunajPozicijuMenija(
  dugme: Pravougaonik,
  meni: VelicinaMenija,
  prozor: VelicinaProzora,
): PozicijaMenija {
  const prostorDole = prozor.height - dugme.bottom;
  const prostorGore = dugme.top;
  // Otvori nagore SAMO ako dole stvarno nema mesta, a gore ima - inače ostaje dole (podrazumevano),
  // čak i ako ni gore ne bi stvarno stalo (nema boljeg izbora, donja granica ispod čisti ivicu ekrana).
  const otvorenNagore = prostorDole < meni.height + RAZMAK && prostorGore >= meni.height + RAZMAK;

  let top = otvorenNagore ? dugme.top - meni.height - RAZMAK : dugme.bottom + RAZMAK;
  top = Math.max(IVICA, Math.min(top, prozor.height - meni.height - IVICA));

  // Desno poravnat sa dugmetom (isto kao ranije right:0 u omotu), klampovano da ne izađe van ekrana.
  let left = dugme.right - meni.width;
  left = Math.max(IVICA, Math.min(left, prozor.width - meni.width - IVICA));

  return { top, left, otvorenNagore };
}
