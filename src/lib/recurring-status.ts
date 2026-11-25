// Čista logika datuma za ponavljajuće fakture (Korak 8c, spec 3.5/6.8). Svi datumi su UTC kalendarski
// dani (isto kao issueDate/rok u invoice-status.ts) - nema vremenske komponente, pa lokalna vremenska
// zona servera ne pomera dan.

function poslednjiDanUMesecu(godina: number, mesec0: number): number {
  return new Date(Date.UTC(godina, mesec0 + 1, 0)).getUTCDate();
}

function danUMesecuKlampovan(godina: number, mesec0: number, danUMesecu: number): number {
  return Math.min(danUMesecu, poslednjiDanUMesecu(godina, mesec0));
}

// Isti dan u mesecu, u SLEDEĆEM kalendarskom mesecu (klampovan ako je kraći, npr. 31. jan -> 28/29. feb).
// Prelazak godine je prirodan - Date.UTC prihvata mesec0=12 kao januar sledeće godine.
export function sledeciMesecSaDanom(datum: Date, danUMesecu: number): Date {
  const godina = datum.getUTCFullYear();
  const mesec0 = datum.getUTCMonth() + 1;
  const stvarnaGodina = godina + Math.floor(mesec0 / 12);
  const stvarniMesec0 = mesec0 % 12;
  return new Date(Date.UTC(stvarnaGodina, stvarniMesec0, danUMesecuKlampovan(stvarnaGodina, stvarniMesec0, danUMesecu)));
}

// Prvi validan datum NA ILI POSLE pocetniDatum, sa zadatim danom u mesecu (klampovanim ako je potrebno).
// Koristi se samo pri pravljenju/izmeni ponavljajuće fakture, da se postavi početni nextDate.
export function prviDatumOdPocetka(pocetniDatum: Date, danUMesecu: number): Date {
  const godina = pocetniDatum.getUTCFullYear();
  const mesec0 = pocetniDatum.getUTCMonth();
  const kandidat = new Date(Date.UTC(godina, mesec0, danUMesecuKlampovan(godina, mesec0, danUMesecu)));
  if (kandidat.getTime() >= pocetniDatum.getTime()) return kandidat;
  return sledeciMesecSaDanom(kandidat, danUMesecu);
}

export type PodaciZaProveru = {
  danUMesecu: number;
  sledeciDatum: Date; // trenutno zakazan datum generisanja (UTC ponoć)
  krajnjiDatum: Date | null; // null = "Nikad"
  status: "aktivna" | "pauzirana";
};

export type RezultatProvere =
  | { trebaGenerisati: false }
  | { trebaGenerisati: true; datumFakture: Date; noviSledeciDatum: Date };

// Da li treba generisati fakturu na dan `danasnjiDatum` (UTC ponoć). Obrađuje NAJVIŠE JEDAN ciklus po
// pozivu - ako je sledeciDatum davno prošao (skripta nije pokretana neko vreme), generiše SAMO za taj
// (najstariji neobrađeni) ciklus i pomera sledeciDatum za tačno jedan mesec unapred, umesto da
// "preskoči" sve propuštene cikluse odjednom (zadatak tačka 6: "nadoknada propuštenih dana, bez
// duplikata" - pozivaoc koji ponovo pokrene generisanje će tako uhvatiti i ostale propuštene cikluse,
// jedan po jedan, nikad dva odjednom za isti ciklus). Pauzirana nikad nije due. Serija koja je prešla
// krajnji datum ostaje due:false trajno - spec ne definiše poseban "Završena" status, pa se status u
// bazi ne menja, generisanje samo tiho prestaje.
export function proveriPonavljanje(podaci: PodaciZaProveru, danasnjiDatum: Date): RezultatProvere {
  if (podaci.status === "pauzirana") return { trebaGenerisati: false };
  if (podaci.sledeciDatum.getTime() > danasnjiDatum.getTime()) return { trebaGenerisati: false };
  if (podaci.krajnjiDatum && podaci.sledeciDatum.getTime() > podaci.krajnjiDatum.getTime()) {
    return { trebaGenerisati: false };
  }

  return {
    trebaGenerisati: true,
    datumFakture: podaci.sledeciDatum,
    noviSledeciDatum: sledeciMesecSaDanom(podaci.sledeciDatum, podaci.danUMesecu),
  };
}
