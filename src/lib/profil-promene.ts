// Podešavanja > Profil i firma (Korak 4, spec 7.13): promena PIB-a ili naziva firme upozorava da se
// odnosi samo na buduće fakture. Čista funkcija da se poređenje može testirati bez renderovanja forme.

export function suNazivIliPibPromenjeni(
  trenutno: { naziv: string; pib: string },
  sacuvano: { naziv: string; pib: string },
): boolean {
  return trenutno.naziv !== sacuvano.naziv || trenutno.pib !== sacuvano.pib;
}
