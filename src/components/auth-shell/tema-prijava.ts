// Tema na stranicama prijave/registracije/reseta (Korak 5, spec 7.1, tačka 6): prati podešavanje
// uređaja (prefers-color-scheme), jer korisnik još nije prijavljen - nema gde da se sačuva izbor.
// Prototip (referenca/prototip/js/ui.js ThemeTogglePill) ipak pokazuje ručnu pilulu svetlo/tamno na
// svakom ekranu prijave i u frejmovima (Prijava*.dc.html, "Izgled: svetli / tamni"), pa je po uputstvu
// ("ako prototip radi drugačije, radi kao prototip") ugrađena i ovde. Pošto nema naloga za koji bi se
// izbor sačuvao, čuva se samo u ovom pregledaču (localStorage), za ovu posetu.

export const KLJUC_TEME_PRIJAVE = "aik-tema-prijava";
export const ID_AUTH_SHELL = "auth-shell-root";

export type TemaPrijave = "svetli" | "tamni";

export function ucitajTemuPrijave(): TemaPrijave | null {
  try {
    const vrednost = window.localStorage.getItem(KLJUC_TEME_PRIJAVE);
    return vrednost === "svetli" || vrednost === "tamni" ? vrednost : null;
  } catch {
    return null;
  }
}

export function sacuvajTemuPrijave(tema: TemaPrijave): void {
  try {
    window.localStorage.setItem(KLJUC_TEME_PRIJAVE, tema);
  } catch {
    // Privatno pregledanje i sl.: samo se ne pamti, nije greška koja zaustavlja stranicu.
  }
}

// Skripta koja se izvršava sinhrono odmah posle #auth-shell-root u HTML-u, pre prvog iscrtavanja, da
// izabrana tema ne "trepne" nazad na sistemsku pri učitavanju (ista tehnika kao bez-treperenja primena
// teme u src/app/(app)/layout.tsx, samo preko localStorage jer ovde nema sesije).
export const SKRIPTA_BEZ_TREPERENJA = `
(function(){
  try {
    var t = window.localStorage.getItem(${JSON.stringify(KLJUC_TEME_PRIJAVE)});
    if (t === "svetli" || t === "tamni") {
      var el = document.getElementById(${JSON.stringify(ID_AUTH_SHELL)});
      if (el) el.setAttribute("data-theme", t);
    }
  } catch (e) {}
})();
`;
