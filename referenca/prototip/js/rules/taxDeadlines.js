// Rokovi za porez (PLATFORMA_SPECIFIKACIJA.md 8.7): akontacija dospeva 15. u mesecu (za PRETHODNI mesec
// usluga), pomereno na sledeći RADNI dan kad 15. padne na vikend ili praznik.
//
// Round 30, nalaz 3: praznici se sad računaju OPŠTIM ALGORITMOM za bilo koju godinu (ne više fiksan
// spisak samo za 2026). Izvor: "Zakon o državnim i drugim praznicima u Republici Srbiji" ("Sl. glasnik
// RS", br. 43/2001, 101/2007, 92/2011) — konsolidovan tekst pročitan sa paragraf.rs (Round 30 istraživanje;
// NIJE primarni izvor/Službeni glasnik sâm, pa je ono što nisam mogao nezavisno da potvrdim označeno
// [PROVERITI] ispod). Državni/verski praznici (neradni dani), čl. 1/1a/2:
//   - Nova godina: 1. i 2. januar
//   - Božić (prvi dan): 7. januar
//   - Sretenje — Dan državnosti Srbije: 15. i 16. februar
//   - Vaskršnji praznici: od Velikog petka zaključno sa drugim danom Vaskrsa (4 uzastopna dana, datum
//     zavisi od pravoslavnog Uskrsa te godine — računato niže, orthodoxEaster)
//   - Praznik rada: 1. i 2. maj
//   - Dan primirja u Prvom svetskom ratu: 11. novembar
// NAMERNO izostavljeno (nisu neradni dani):
//   - Dan pobede (9. maj, čl. 1a) — zakon (čl. 3) ga IZRIČITO navodi kao RADNI dan uprkos tome što je
//     naveden kao praznik.
//   - "Radni praznici" (čl. 5: Sveti Sava 27.1, Dan sećanja na žrtve holokausta 22.4, Vidovdan 28.6, Dan
//     sećanja na srpske žrtve u Drugom svetskom ratu 21.10) — zakon kaže da se "praznuju i obeležavaju
//     RADNO", nisu neradni dani.
// čl. 3a (nadoknada): kad datum na koji se praznik slavi padne u NEDELJU, ne radi se ni prvog narednog
// radnog dana — primenjeno ovde na SVAKI pojedinačni datum iz spiska (ne samo "prvi dan" kad ih ima više
// uzastopnih). Ovo je moje tumačenje teksta pročitanog sa paragraf.rs, ne izvorni tekst Službenog
// glasnika — [PROVERITI] sa pravnikom pre prave platforme. [PROVERITI]: tekst koji sam pročitao ne
// pominje SUBOTU uopšte (samo nedelju) — ovde namerno NEMA nadoknade za praznik koji padne u subotu.
// [PROVERITI]: paragraf.rs stranica ne pokazuje datum konsolidacije niti potvrđuje da li postoji izmena
// posle 92/2011 (npr. pominjana 2023/2024 izmena) — ako takva izmena postoji i menja spisak/pravilo, ovaj
// spisak treba ažurirati.
// [PROVERITI]: Vaskrsna nedelja je PO DEFINICIJI uvek nedelja, pa nadoknada primenjena po POJEDINAČNOM
// datumu (ne po celom višednevnom prazniku) znači da Vaskršnji praznici dobijaju jedan dodatan neradni
// dan SVAKE godine (dan posle 2. dana Vaskrsa). Nisam mogao da potvrdim iz primarnog izvora da li zakon
// ovo stvarno primenjuje na višednevne praznike ili samo na proslave od jednog dana — dokumentovano kao
// pravna nedoumica, testirano kao TRENUTNO ponašanje (taxDeadlines.test.js), ne kao potvrđeno tačno.
//
// Pravoslavni Uskrs: Julijanski algoritam (Meeus/Jones/Butcher, varijanta za Julijanski kalendar) pa
// prevod u Gregorijanski (+13 dana, važi za 1900-2099 — [PROVERITI] van tog opsega, razlika kalendara
// nije konstantna kroz vekove). Nezavisno proverene vrednosti (Round 30): 2026 = 12. april, 2027 = 2. maj,
// 2028 = 16. april (calendardate.com i dr.).
// Čista funkcija: bez state-a, bez DOM-a, bez Date.now().
(function(){
  function addDays(date, n){ const d = new Date(date); d.setDate(d.getDate()+n); return d; }
  function isWeekend(d){ const day = new Date(d).getDay(); return day===0 || day===6; }
  function dateKey(d){ return new Date(d).getFullYear()+'-'+String(new Date(d).getMonth()+1).padStart(2,'0')+'-'+String(new Date(d).getDate()).padStart(2,'0'); }

  function orthodoxEaster(year){
    const a = year % 4, b = year % 7, c = year % 19;
    const d = (19*c + 15) % 30;
    const e = (2*a + 4*b - d + 34) % 7;
    const month = Math.floor((d + e + 114) / 31); // Julijanski, 1-indeksirano (3=mart, 4=april)
    const day = ((d + e + 114) % 31) + 1;
    return addDays(new Date(year, month-1, day), 13); // Julijanski -> Gregorijanski
  }

  // Osnovni (nepomereni) spisak neradnih dana za datu godinu, pre čl. 3a nadoknade.
  function stateHolidayAnchors(year){
    const E = orthodoxEaster(year);
    return [
      new Date(year,0,1), new Date(year,0,2),               // Nova godina
      new Date(year,0,7),                                    // Božić
      new Date(year,1,15), new Date(year,1,16),              // Sretenje / Dan državnosti
      addDays(E,-2), addDays(E,-1), E, addDays(E,1),         // Veliki petak .. 2. dan Vaskrsa
      new Date(year,4,1), new Date(year,4,2),                // Praznik rada
      new Date(year,10,11),                                  // Dan primirja u Prvom svetskom ratu
    ];
  }

  // Puna lista neradnih dana (uključujući čl. 3a nadoknadu), kao Set ISO-datum stringova.
  function holidaySetForYear(year){
    const anchors = stateHolidayAnchors(year);
    const keys = new Set(anchors.map(dateKey));
    anchors.forEach(d=>{
      if(new Date(d).getDay()===0){ // nedelja -> nadoknada prvog narednog STVARNO radnog dana
        let x = addDays(d,1);
        while(x.getDay()===0 || x.getDay()===6 || keys.has(dateKey(x))){ x = addDays(x,1); }
        keys.add(dateKey(x));
      }
    });
    return keys;
  }

  function isHoliday(d){ return holidaySetForYear(new Date(d).getFullYear()).has(dateKey(d)); }
  function nextBusinessDay(d){ let x = new Date(d); while(isWeekend(x) || isHoliday(x)){ x = addDays(x,1); } return x; }

  // key: "YYYY-MM" (mesec ZA KOJI akontacija dospeva 15. u tom mesecu).
  function taxDueDate(key){
    const y = Number(key.slice(0,4)), m = Number(key.slice(5,7));
    return nextBusinessDay(new Date(y, m-1, 15));
  }

  // Zadržano radi kompatibilnosti (utils.js ga re-eksportuje) — sad IZRAČUNATO, ne ručno prepisano.
  const HOLIDAYS_2026 = Array.from(holidaySetForYear(2026)).sort();

  const api = { orthodoxEaster, stateHolidayAnchors, holidaySetForYear, isWeekend, isHoliday, nextBusinessDay, taxDueDate, HOLIDAYS_2026 };
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  if(typeof window !== 'undefined'){ window.AIK = window.AIK || {}; window.AIK.Rules = window.AIK.Rules || {}; window.AIK.Rules.taxDeadlines = api; }
})();
