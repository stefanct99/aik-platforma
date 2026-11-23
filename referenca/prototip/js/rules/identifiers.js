// Identifikatori firme (PLATFORMA_SPECIFIKACIJA.md 3.1): PIB je 9 cifara, matični broj je 8 cifara.
// sanitizeDigits je opšti pomoćnik za polja "samo cifre" (ukucan ili nalepljen tekst sa razmacima,
// crtama ili drugim znacima oko cifara — nalepi se ceo tekst, zadrže se samo cifre).
// Čista funkcija: bez state-a, bez DOM-a.
(function(){
  function sanitizeDigits(str, maxLen){
    const digits = String(str==null?'':str).replace(/\D/g,'');
    return maxLen ? digits.slice(0, maxLen) : digits;
  }
  function isValidPib(str){ return /^\d{9}$/.test(String(str==null?'':str)); }
  function isValidMb(str){ return /^\d{8}$/.test(String(str==null?'':str)); }

  const api = { sanitizeDigits, isValidPib, isValidMb };
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  if(typeof window !== 'undefined'){ window.AIK = window.AIK || {}; window.AIK.Rules = window.AIK.Rules || {}; window.AIK.Rules.identifiers = api; }
})();
