// Status fakture izveden iz datuma i uplata (PLATFORMA_SPECIFIKACIJA.md 8.1). Pet stanja: Nacrt, Poslata,
// Kasni (izvedeno, ne upisano polje), Plaćena, Stornirana. "Kasni" se računa pri svakom pozivu iz
// trenutnog "today" — u pravoj aplikaciji bi se status "Kasni" preračunavao dnevnim poslom u ponoć (8.1),
// ovde je potpuno ekvivalentno jer je izveden svaki put iznova, ne razlika u ponašanju, samo u MEHANIZMU
// (nema pravog proticanja vremena u prototipu osim kroz "today" parametar).
// Čista funkcija: bez state-a, bez DOM-a, bez Date.now() — "today" je uvek parametar.
(function(){
  function addDays(date, n){ const d = new Date(date); d.setDate(d.getDate()+n); return d; }
  function daysDiff(a, b){ return Math.round((new Date(a) - new Date(b)) / 86400000); }

  function invoiceTotal(inv){ return (inv.items||[]).reduce((s,it)=> s + (it.qty||1)*(it.price||0), 0); }
  function invoiceDueDate(inv){ return addDays(inv.issueDate, inv.dueDays||0); }
  // Nacrt/Plaćena/Stornirana nikad ne "kasne" — samo Poslata može preći u Kasni.
  function isInvoiceLate(inv, today){
    if(inv.status==='Nacrt' || inv.status==='Plaćena' || inv.status==='Stornirana') return false;
    return new Date(today) > invoiceDueDate(inv);
  }
  function invoiceEffectiveStatus(inv, today){
    if(inv.status==='Poslata' && isInvoiceLate(inv, today)) return 'Kasni';
    return inv.status;
  }
  function lateDays(inv, today){
    const due = invoiceDueDate(inv);
    return Math.max(0, daysDiff(today, due));
  }

  const api = { invoiceTotal, invoiceDueDate, isInvoiceLate, invoiceEffectiveStatus, lateDays };
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  if(typeof window !== 'undefined'){ window.AIK = window.AIK || {}; window.AIK.Rules = window.AIK.Rules || {}; window.AIK.Rules.invoiceStatus = api; }
})();
