// Pravila lozinke (Korak 5, spec 7.1): najmanje 8 karaktera, jedno veliko slovo, jedan broj. Isto za
// registraciju i za novu lozinku posle reseta. Čiste funkcije, direktno testabilne.

export type ProveraLozinke = {
  najmanje8: boolean;
  velikoSlovo: boolean;
  broj: boolean;
};

export function proveriLozinku(lozinka: string): ProveraLozinke {
  return {
    najmanje8: lozinka.length >= 8,
    velikoSlovo: /[A-ZČĆŽŠĐ]/.test(lozinka),
    broj: /[0-9]/.test(lozinka),
  };
}

export function jeLozinkaIspravna(lozinka: string): boolean {
  const provera = proveriLozinku(lozinka);
  return provera.najmanje8 && provera.velikoSlovo && provera.broj;
}
