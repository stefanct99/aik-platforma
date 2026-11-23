// Množina i vokativ (srpski jezik). Množina (plural) je OPŠTE pravilo srpske brojne saglasnosti, važi za
// bilo koju imenicu uz tri data oblika. Vokativ (firstNameVoc) NIJE opšte pravilo — videti napomenu dole,
// POZNATO OGRANIČENJE koje se ovde ne pokušava rešiti, samo dokumentuje testom koji pokazuje gde greši.
// Čista funkcija: bez state-a, bez DOM-a, bez vremena.
(function(){
  // Zadnja dva digita broja odlučuju: 11-14 su UVEK "mnogo" (čak i 111, 211...), inače zadnja cifra
  // 1→jednina, 2-4→malo (genitiv jednine), inače mnogo (genitiv množine).
  function pluralIdx(n){
    const last2 = Math.abs(n)%100, last1 = last2%10;
    if(last2>=11 && last2<=14) return 2;
    if(last1===1) return 0;
    if(last1>=2 && last1<=4) return 1;
    return 2;
  }
  function plural(n, forms){ return forms[pluralIdx(n)]; }

  // POZNATO OGRANIČENJE (namerno NEREŠENO ovde): ovo je JEDNO prosto pravilo (ime na samoglasnik ostaje
  // isto, inače se dodaje "e"), ne pravi srpski gramatički motor. Radi za većinu imena korišćenih u
  // aplikaciji (Stefan→Stefane, Marko→Marko, Nikola→Nikola, Jelena→Jelena...), ali daje POGREŠAN oblik za
  // imena sa ispadanjem samoglasnika u vokativu — npr. "Petar" bi po ovom pravilu dobilo "Petare", a
  // ispravan srpski vokativ je "Petre". Test ispod to eksplicitno pokazuje kao poznatu grešku, ne kao
  // nešto što treba popraviti u ovoj fazi.
  function firstNameVoc(fullName){
    const first = (fullName||'').split(' ')[0];
    if(!first) return first;
    if(/[aeiouAEIOU]$/.test(first)) return first;
    return first+'e';
  }

  const api = { plural, pluralIdx, firstNameVoc };
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  if(typeof window !== 'undefined'){ window.AIK = window.AIK || {}; window.AIK.Rules = window.AIK.Rules || {}; window.AIK.Rules.text = api; }
})();
