// Matrica autonomije i slanje obrasca banci (PLATFORMA_SPECIFIKACIJA.md 4.1, 7.7, 8.5): globalno
// podešavanje (ask/auto, i režim prodaje deviza) sa IZUZETKOM po klijentu koji ga pregazi. Ovo JESU
// pravila matrice — "šta se dešava" za svaku kombinaciju je ono što effectiveAutoSend/effectiveFxMode/
// computeFxSale ispod računaju; sâmo IZVRŠENJE radnje (čuvanje u store, toast) ostaje u actions.js, jer
// to nije pravilo nego efekat.
// Čista funkcija: bez state-a (klijent i podešavanja se prosleđuju), bez DOM-a, bez vremena.
(function(){
  // client: {autoSend} ili null (nema izuzetka). autonomySettings: {globalMode:'ask'|'auto', ...}.
  function effectiveAutoSend(client, autonomySettings){
    return client ? !!client.autoSend : autonomySettings.globalMode==='auto';
  }

  // client: {fxMode:'book_only'|'sell_part'|'sell_all'|'none'|null} — 'none' znači "nema izuzetka,
  // koristi globalni" (isto kao null/odsutno; 'none' postoji kao eksplicitna vrednost u formi).
  function effectiveFxMode(client, autonomySettings){
    return (client && client.fxMode && client.fxMode!=='none') ? client.fxMode : autonomySettings.fxMode;
  }

  // Koliko deviza se prodaje za dati priliv, po efektivnom režimu. rate je NBS kurs na dan priliva
  // (prosleđen spolja, 8.3 — ne poziva se ovde, ta logika je van ovog modula).
  function computeFxSale(amount, currency, mode, pct, rate){
    if(mode==='sell_all') return { amount, currency, rate };
    if(mode==='sell_part'){
      const sold = Math.round(amount*pct)/100;
      return { amount: sold, currency, rate, percent: pct };
    }
    return null; // 'book_only' (ili bilo šta drugo) — knjiži se, ništa se ne prodaje.
  }

  const api = { effectiveAutoSend, effectiveFxMode, computeFxSale };
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  if(typeof window !== 'undefined'){ window.AIK = window.AIK || {}; window.AIK.Rules = window.AIK.Rules || {}; window.AIK.Rules.autonomy = api; }
})();
