(function(){
  // Faza 0 (js/rules/): plural/firstNameVoc su sad čiste funkcije u js/rules/text.js, sa testovima
  // (node --test). Ovde samo delegiramo, da se ponašanje i poziv-mesta (U.plural, U.firstNameVoc) ne
  // menjaju nigde drugde u kodu — videti js/rules/PRAVILA.md.
  const RulesText = window.AIK.Rules.text;
  const firstNameVoc = RulesText.firstNameVoc;
  const pluralIdx = RulesText.pluralIdx;
  const plural = RulesText.plural;
  // "dan"/"dana" — "malo" i "mnogo" se slučajno isto pišu za ovu imenicu ("2 dana" i "5 dana").
  function dayWord(n){ return plural(n, ['dan','dana','dana']); }

  // Faza 10, sedmi krug, korak 1c: boja avatar-inicijala PO KLIJENTU (Poslednje uplate, Poc2/Dash4_*) —
  // izvučeno direktno iz frejmova za 3 klijenta koji se tamo pojavljuju sa sopstvenom bojom (tekst je uvek
  // --suma/--text, menja se samo pozadina). Za klijente BEZ frejma (nema referentnog podatka), boja se
  // generiše deterministički po imenu (ista nijansa svaki put, hue se razlikuje po klijentu) — nije iz
  // dizajna, nego inženjerski popunjen razmak dok se ne pojavi frejm koji ga potvrdi ili ospori.
  const CLIENT_BG = { 'Acme Inc.':'#EEF8D2', 'Northwind Ltd.':'#F4E9D8', 'Bluebird GmbH':'#E3ECE8' };
  function hexToRgb(hex){ const n = parseInt(hex.slice(1),16); return [(n>>16)&255,(n>>8)&255,n&255]; }
  function hslToHex(h,s,l){
    s/=100; l/=100;
    const k=n=>(n+h/30)%12, a=s*Math.min(l,1-l);
    const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
    const toHex=x=>Math.round(255*x).toString(16).padStart(2,'0');
    return '#'+toHex(f(0))+toHex(f(8))+toHex(f(4));
  }
  function clientAvatarColors(name){
    let bg = CLIENT_BG[name];
    if(!bg){
      let hash=0; for(let i=0;i<(name||'').length;i++) hash=(hash*31+name.charCodeAt(i))|0;
      bg = hslToHex(Math.abs(hash)%360, 45, 90);
    }
    const [r,g,b] = hexToRgb(bg);
    return { bg, bgDark:`rgba(${r},${g},${b},0.14)` };
  }
  function fmtMoney(amount, currency){
    amount = Number(amount)||0;
    const sym = currency==='EUR'?'€':currency==='USD'?'$':currency==='RSD'?'din':currency||'';
    const s = amount.toLocaleString('sr-RS', {minimumFractionDigits:2, maximumFractionDigits:2});
    return currency==='RSD' ? `${s} ${sym}` : `${s} ${sym}`;
  }
  // Ceo broj dinara bez decimala — koristi se na Početnoj za limit (Poc1-3: "3.840.000", "od 6.000.000 din").
  function fmtInt(amount, currency){
    amount = Math.round(Number(amount)||0);
    const sym = currency==='RSD'?'din':currency||'';
    return `${amount.toLocaleString('sr-RS')}${sym?' '+sym:''}`;
  }
  // Goli broj (kurs, procenat) u srpskom formatu — decimale zarezom, NIKAD .toFixed()/template-literal
  // konkatenacija direktno (JS broj-u-string uvek koristi tačku za decimale).
  function fmtNum(x, decimals){
    decimals = decimals==null ? 2 : decimals;
    return Number(x||0).toLocaleString('sr-RS', {minimumFractionDigits:decimals, maximumFractionDigits:decimals});
  }
  function fmtDate(iso, format, opts){
    if(!iso) return '';
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    if(format==='iso') return `${yyyy}-${mm}-${dd}`;
    return `${dd}.${mm}.${yyyy}.`;
  }
  // Kratak oblik bez godine, za Kalendar liste/kartice ("16.11.", Kl1/Kl3).
  function fmtDateShort(iso){
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.`;
  }
  const MONTHS_SR = ['januar','februar','mart','april','maj','jun','jul','avgust','septembar','oktobar','novembar','decembar'];
  const MONTHS_SR_GEN = ['januara','februara','marta','aprila','maja','juna','jula','avgusta','septembra','oktobra','novembra','decembra'];
  const DAYS_SR = ['nedelja','ponedeljak','utorak','sreda','četvrtak','petak','subota'];
  // Akuzativ za "pada u ___" (6.3.2) — DAYS_SR+'u' ne radi za ženski rod (nedelja/sreda/subota).
  const DAYS_SR_ACC = ['nedelju','ponedeljak','utorak','sredu','četvrtak','petak','subotu'];
  // Kalendar (7.11): nedelja počinje ponedeljkom (Kl1 "Pon...Ned"), pun naziv za DayPanel naslov ("Ponedeljak, 16. novembar").
  const DAYS_SR_WEEK = ['Pon','Uto','Sre','Čet','Pet','Sub','Ned'];
  const DAYS_SR_FULL = ['Ponedeljak','Utorak','Sreda','Četvrtak','Petak','Subota','Nedelja'];
  function fmtLong(iso){ const d=new Date(iso); return `${d.getDate()}. ${MONTHS_SR[d.getMonth()]}`; }
  function fmtLongGen(iso){ const d=new Date(iso); return `${d.getDate()}. ${MONTHS_SR_GEN[d.getMonth()]}`; }
  function fmtDow(iso){ const d=new Date(iso); return DAYS_SR[d.getDay()]; }
  function addDays(date, n){ const d=new Date(date); d.setDate(d.getDate()+n); return d; }
  function addMonths(date, n){ const d=new Date(date); d.setMonth(d.getMonth()+n); return d; }
  // Faza 0 (js/rules/taxDeadlines.js): isWeekend/isHoliday/nextBusinessDay su sad čiste funkcije sa
  // testovima — ovde samo delegirano, poznato ograničenje (praznici samo za 2026.) dokumentovano tamo.
  const RulesTax = window.AIK.Rules.taxDeadlines;
  const isWeekend = RulesTax.isWeekend;
  const HOLIDAYS_2026 = RulesTax.HOLIDAYS_2026;
  const isHoliday = RulesTax.isHoliday;
  const nextBusinessDay = RulesTax.nextBusinessDay;
  function daysDiff(a,b){ return Math.round((new Date(a)-new Date(b))/86400000); }
  function monthKey(d){ const dt=new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`; }
  function monthNameSr(d){ const dt=new Date(d); return MONTHS_SR[dt.getMonth()]; }

  // pseudo NBS srednji kurs — deterministički po datumu i valuti, u realnom opsegu
  function nbsRate(dateIso, currency){
    if(currency==='RSD') return 1;
    const base = currency==='EUR'?117.2: currency==='USD'?107.1: currency==='GBP'?134.5: currency==='CHF'?121.3:117;
    const d = new Date(dateIso); const seed = d.getFullYear()*372+d.getMonth()*31+d.getDate();
    const wiggle = Math.sin(seed*0.9)*0.6;
    return Math.round((base+wiggle)*100)/100;
  }

  function uid(prefix){ return (prefix||'id')+'_'+Math.random().toString(36).slice(2,9); }

  // Faza 0 (js/rules/uvoz.js): parsiranje CSV šablona/srpski datum i broj su sad čiste funkcije sa
  // testovima — ovde samo delegirano, poziv-mesta (U.parseUvozCsv itd.) se ne menjaju.
  const RulesUvoz = window.AIK.Rules.uvoz;
  const uvozCsvTemplate = RulesUvoz.uvozCsvTemplate;
  const parseUvozCsv = RulesUvoz.parseUvozCsv;
  const parseSrDateFlexible = RulesUvoz.parseSrDateFlexible;
  const parseSrNumber = RulesUvoz.parseSrNumber;
  // Pravi fajl-za-preuzimanje (prvi stvaran download u ovom prototipu — sve ostalo, npr. "Preuzmi PDF",
  // ostaje simulirano toast-om jer nema pravog dokumenta iza njega; CSV šablon stvarno postoji kao tekst).
  // Koristi DOM (Blob/URL/document) — ostaje ovde, NE u js/rules/ (čiste funkcije ne smeju da diraju DOM).
  function downloadTextFile(filename, content, mime){
    try{
      const blob = new Blob([content], {type: mime||'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url), 1000);
      return true;
    }catch(e){ return false; }
  }

  // Faza 0 (js/rules/invoiceStatus.js): status fakture izveden iz datuma je sad čista funkcija sa
  // testovima — ovde samo delegirano.
  const RulesInv = window.AIK.Rules.invoiceStatus;
  const invoiceTotal = RulesInv.invoiceTotal;
  const invoiceDueDate = RulesInv.invoiceDueDate;
  const isInvoiceLate = RulesInv.isInvoiceLate;
  const invoiceEffectiveStatus = RulesInv.invoiceEffectiveStatus;
  const lateDays = RulesInv.lateDays;

  window.AIK = window.AIK || {};
  window.AIK.Util = {
    fmtMoney, fmtInt, fmtNum, fmtDate, fmtDateShort, fmtLong, fmtLongGen, fmtDow, firstNameVoc, dayWord, plural, pluralIdx, clientAvatarColors, addDays, addMonths, isWeekend, isHoliday, nextBusinessDay,
    daysDiff, monthKey, monthNameSr, nbsRate, uid,
    invoiceTotal, invoiceDueDate, isInvoiceLate, invoiceEffectiveStatus, lateDays,
    MONTHS_SR, MONTHS_SR_GEN, DAYS_SR, DAYS_SR_ACC, DAYS_SR_WEEK, DAYS_SR_FULL,
    uvozCsvTemplate, parseUvozCsv, parseSrDateFlexible, parseSrNumber, downloadTextFile,
  };
})();
