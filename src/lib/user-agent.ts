// Prijavljeni uređaji (Korak 7, spec 7.13): minimalno raspoznavanje pregledača i sistema iz User-Agent
// stringa sesije (Better Auth već čuva userAgent na Session). Nema spoljašnje biblioteke - dovoljno
// tačno za prikaz ("Chrome, Windows"), ne pokušava da bude potpuno precizno za svaki moguć string.
// Grad NIJE deo ovoga (zadatak Koraka 7: nema pouzdanog izvora za lokaciju po IP adresi, pa se ne
// izmišlja - vidi izveštaj).

export function prepoznajPregledacISistem(userAgent: string | null | undefined): string {
  if (!userAgent) return "Nepoznat uređaj";

  let pregledac = "Nepoznat pregledač";
  if (/Edg\//.test(userAgent)) pregledac = "Edge";
  else if (/OPR\//.test(userAgent)) pregledac = "Opera";
  else if (/Chrome\//.test(userAgent)) pregledac = "Chrome";
  else if (/Firefox\//.test(userAgent)) pregledac = "Firefox";
  else if (/Safari\//.test(userAgent)) pregledac = "Safari";

  let sistem = "";
  if (/iPhone/.test(userAgent)) sistem = "iPhone";
  else if (/iPad/.test(userAgent)) sistem = "iPad";
  else if (/Android/.test(userAgent)) sistem = "Android";
  else if (/Mac OS X/.test(userAgent)) sistem = "macOS";
  else if (/Windows/.test(userAgent)) sistem = "Windows";
  else if (/Linux/.test(userAgent)) sistem = "Linux";

  return sistem ? `${pregledac}, ${sistem}` : pregledac;
}

export function opisiKadaJeKorisceno(datum: Date, sada: Date = new Date()): string {
  const razlikaMs = sada.getTime() - datum.getTime();
  const minuti = Math.floor(razlikaMs / 60000);
  if (minuti < 5) return "aktivan sada";
  if (minuti < 60) return `Pre ${minuti} min`;
  const sati = Math.floor(minuti / 60);
  if (sati < 24) return `Pre ${sati} h`;
  const dani = Math.floor(sati / 24);
  if (dani === 1) return "Pre 1 dan";
  return `Pre ${dani} dana`;
}

// Za duže periode (Bezbednost i nalog, "Poslednja promena pre 3 meseca" iz frejma Pd6) - meseci/godine,
// ne samo dani, pošto lozinka često nije menjana mesecima.
export function opisiProtekloVremeDuze(datum: Date, sada: Date = new Date()): string {
  const dani = Math.floor((sada.getTime() - datum.getTime()) / (1000 * 60 * 60 * 24));
  if (dani < 1) return "danas";
  if (dani === 1) return "pre 1 dan";
  if (dani < 30) return `pre ${dani} dana`;
  const meseci = Math.floor(dani / 30);
  if (meseci === 1) return "pre 1 mesec";
  if (meseci < 12) return `pre ${meseci} meseci`;
  const godine = Math.floor(meseci / 12);
  return godine === 1 ? "pre 1 godinu" : `pre ${godine} godina`;
}
