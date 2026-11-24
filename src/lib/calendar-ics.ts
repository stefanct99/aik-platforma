// Kalendar (Korak 7, spec 7.13, Povezivanje): privatan ICS fajl za token korisnika. Za sada bez
// događaja (rokovi za porez/fakture dolaze u budućim koracima) - samo validan prazan kalendar, da link
// već radi u Google/Apple kalendaru čim se doda prvi događaj.

export function generisiPrazanIcs(nazivKalendara: string): string {
  const redovi = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//tvoj AI knjigovođa//Kalendar//SR",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${ocistiTekst(nazivKalendara)}`,
    "END:VCALENDAR",
  ];
  return redovi.join("\r\n") + "\r\n";
}

function ocistiTekst(tekst: string): string {
  return tekst.replace(/[\r\n]/g, " ").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
