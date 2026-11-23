// Numeracija faktura (PLATFORMA_SPECIFIKACIJA.md 8.2): format "<prefix>-<broj>" (npr. "25/26-6", BEZ
// vodeće nule), sledeći broj nastavlja posle NAJVEĆEG postojećeg (ne posle broja stavki — storno
// zadržava svoj broj, pa niz može imati rupe). Nevažeći/nebrojčani nastavci (korisnik ručno upiše broj iz
// starog sistema knjigovođe pri uvozu, Uvoz Korak 6) se IGNORIŠU, ne truju Math.max. Prazna lista počinje
// od 1. Čista funkcija: bez state-a, uzima gotov niz brojeva faktura (stringova), ne ceo state.
(function(){
  // numbers: niz stringova oblika "<bilo šta>-<sufiks>" (npr. "25/26-6"), tipično inv.number za sve
  // postojeće fakture — uključujući UVEZENE (Uvoz.commit ih dodaje u isti niz, spec zahteva da se i one
  // računaju u "najveći").
  function nextInvoiceNumber(numbers, prefix){
    prefix = prefix==null ? '25/26' : prefix;
    const nums = (numbers||[]).map(n=> parseInt(String(n||'').split('-')[1]||'0', 10)).filter(n=> !isNaN(n));
    const max = nums.length ? Math.max.apply(null, nums) : 0;
    return prefix+'-'+(max+1);
  }

  const api = { nextInvoiceNumber };
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  if(typeof window !== 'undefined'){ window.AIK = window.AIK || {}; window.AIK.Rules = window.AIK.Rules || {}; window.AIK.Rules.invoiceNumbering = api; }
})();
