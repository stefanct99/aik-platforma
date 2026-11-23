// Limit od 6.000.000 din (PLATFORMA_SPECIFIKACIJA.md 8.4): klizni prozor od 12 meseci (365 dana unazad
// od "danas"), NE kalendarska godina. Uplate "bez fakture" (noInvoice) NE ulaze u zbir — eksplicitna
// odluka iz spec 8.4 ("Uplate bez fakture ne ulaze, 4.2, 7.10"), potvrđena i NEPROMENJENA u 29. krugu
// (STATUS.md) uprkos privremenom zahtevu da uđu — ne menjati ovo pravilo bez nove, jasne odluke.
// Čista funkcija: bez state-a, bez DOM-a, bez Date.now() — "now" je uvek parametar.
(function(){
  const LIMIT = 6000000;

  function addDays(date, n){ const d = new Date(date); d.setDate(d.getDate()+n); return d; }
  function daysDiff(a, b){ return Math.round((new Date(a) - new Date(b)) / 86400000); }

  // incomes: {date, amount, rate, noInvoice} — rate je 1 za RSD (već tako svuda u store-u), kurs NBS na
  // dan uplate za devizne (8.3, odluka: kurs se čuva uz uplatu, ne preračunava naknadno).
  function computeLimitInfo({ fxIncomes, rsdIncomes }, now){
    const since = addDays(now, -365);
    const fx = (fxIncomes||[]).filter(i=> !i.noInvoice && new Date(i.date) >= since);
    const rsd = (rsdIncomes||[]).filter(i=> !i.noInvoice && new Date(i.date) >= since);
    const fxTotal = fx.reduce((s,i)=> s + i.amount*i.rate, 0);
    const rsdTotal = rsd.reduce((s,i)=> s + i.amount, 0);
    const total = Math.round(fxTotal + rsdTotal);
    const pct = Math.round((total/LIMIT)*1000)/10;
    const oldestMonths = fx.concat(rsd).reduce((min,i)=> Math.min(min, -daysDiff(i.date, now)/30), 12);
    return {
      total, pct, remaining: Math.max(0, LIMIT-total), limit: LIMIT,
      monthsOfHistory: Math.max(0, Math.min(12, Math.round(oldestMonths))),
    };
  }

  // Praćenje praga (spec 8.4): 80% upozorenje, 90% jače upozorenje, 100%+ kritično. Samo tri nivoa —
  // preko 100% ostaje "kritično" (100), nema četvrtog, jačeg nivoa iznad toga.
  function limitWarningTier(pct){
    if(pct>=100) return 100;
    if(pct>=90) return 90;
    if(pct>=80) return 80;
    return null;
  }

  const api = { LIMIT, computeLimitInfo, limitWarningTier };
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  if(typeof window !== 'undefined'){ window.AIK = window.AIK || {}; window.AIK.Rules = window.AIK.Rules || {}; window.AIK.Rules.limit = api; }
})();
