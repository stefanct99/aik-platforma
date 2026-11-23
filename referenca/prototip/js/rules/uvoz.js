// Uvoz / Prenos dosadašnjeg poslovanja (UVOZ_SPECIFIKACIJA.md odeljci 4-6): parsiranje sopstvenog CSV
// šablona, srpski format datuma/broja, prepoznavanje mogućih duplikata, i efekat na limit (8.4, deli isti
// LIMIT i isto pravilo isključivanja "bez fakture"/365 dana kao js/rules/limit.js — namerno ne duplirano,
// ovaj modul zahteva limit.js da bude učitan pre njega u pregledaču, ili require-ovan pre njega u testu).
// Čista funkcija: bez state-a, bez DOM-a, bez Date.now() — "now" je uvek parametar gde je vreme bitno.
(function(){
  const UVOZ_CSV_HEADERS = ['Datum uplate','Klijent','Broj fakture','Valuta','Iznos','Kurs (opciono)'];
  function uvozCsvTemplate(){
    const rows = [UVOZ_CSV_HEADERS.join(','), '15.03.2026.,Acme Inc.,25/26-01,EUR,"1.200,00",', '02.04.2026.,Marko Petrović PR,25/26-02,RSD,"85.000,00",'];
    return rows.join('\r\n')+'\r\n';
  }

  // Parsira SAMO sopstveni šablon (gore) — polja mogu biti pod navodnicima (iznos sa tačkom-hiljada).
  function parseUvozCsv(text){
    const lines = String(text||'').split(/\r\n|\n|\r/).map(l=>l.trim()).filter(l=>l.length);
    if(!lines.length) return [];
    return lines.slice(1).map(line=>{
      const cols = []; let cur=''; let inQ=false;
      for(let i=0;i<line.length;i++){
        const c = line[i];
        if(c==='"'){ inQ=!inQ; continue; }
        if(c===',' && !inQ){ cols.push(cur); cur=''; continue; }
        cur+=c;
      }
      cols.push(cur);
      return { date:(cols[0]||'').trim(), client:(cols[1]||'').trim(), invoiceNumber:(cols[2]||'').trim(),
        currency:(cols[3]||'').trim().toUpperCase(), amount:(cols[4]||'').trim(), rate:(cols[5]||'').trim() };
    }).filter(r=> r.date || r.client || r.amount);
  }

  function daysInMonth(year, month){ return new Date(year, month, 0).getDate(); } // month 1-indeksiran

  // Round 30, nalaz 4 (fix): dan se proverava protiv STVARNOG broja dana u datom mesecu (daysInMonth,
  // uključujući prestupne godine za februar), ne više samo protiv fiksnog opsega 1-31 — "31.04.2026"
  // (april ima 30 dana) i "29.02.2026" (2026 nije prestupna) sad ispravno vraćaju null umesto da se tiho
  // prelome u sledeći dan/mesec. dd.mm.gggg[.] (format iz šablona) ili gggg-mm-dd (iso). Mesec/dan se
  // proveravaju PRE konstrukcije Date-a — new Date(g,m,d) inače TIHO prelama van-opsega vrednosti u
  // sledeći mesec/godinu bez greške ("32.13.2026" bi postalo 01.02.2027, validan ali POGREŠAN datum).
  function parseSrDateFlexible(str){
    str = String(str||'').trim().replace(/\.$/, '');
    let m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if(m){
      const day=Number(m[1]), month=Number(m[2]), year=Number(m[3]);
      if(month<1||month>12) return null;
      if(day<1||day>daysInMonth(year,month)) return null;
      return new Date(year, month-1, day);
    }
    m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if(m){
      const year=Number(m[1]), month=Number(m[2]), day=Number(m[3]);
      if(month<1||month>12) return null;
      if(day<1||day>daysInMonth(year,month)) return null;
      return new Date(year, month-1, day);
    }
    return null;
  }

  // Da li raw tekst bar IZGLEDA kao datum (oblik, bez obzira da li je VREDNOST moguć datum) — koristi se
  // u buildItem da razlikuje "Taj datum ne postoji." (prepoznat oblik, nemoguća vrednost, npr. "31.04.")
  // od "Nisam prepoznala datum" (ne liči na datum uopšte).
  function looksLikeDateShape(str){
    str = String(str||'').trim().replace(/\.$/, '');
    return /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(str) || /^\d{4}-\d{1,2}-\d{1,2}$/.test(str);
  }

  // Srpski format broja sa tačkom-hiljada i zarezom-decimalom ("1.200,00") u pravi Number.
  function parseSrNumber(str){
    str = String(str==null?'':str).trim();
    if(!str) return NaN;
    return Number(str.replace(/\./g,'').replace(',', '.'));
  }

  function findClientId(clients, name){
    if(!name) return null;
    const found = (clients||[]).find(c=> c.name.toLowerCase()===String(name).toLowerCase());
    return found ? found.id : null;
  }

  // Duplikat (5.4): ista kombinacija datum + iznos (±0,5, zaokruživanje kursa) + broj fakture (ako
  // postoji) već postoji MEĐU SAČUVANIM stavkama (ne proverava protiv drugih redova u istom pregledu).
  function isDuplicate({ incomesRsd, incomesFx, invoices }, cand){
    const pool = cand.currency==='RSD' ? (incomesRsd||[]) : (incomesFx||[]);
    const day = String(cand.dateIso).slice(0,10);
    return pool.some(e=>{
      if(String(e.date).slice(0,10)!==day) return false;
      if(Math.abs(e.amount-cand.amount)>0.5) return false;
      if(cand.invoiceNumber){
        const inv = e.invoiceId ? (invoices||[]).find(i=>i.id===e.invoiceId) : null;
        if(!inv || inv.number!==cand.invoiceNumber) return false;
      }
      return true;
    });
  }

  // raw: {date, client, invoiceNumber, currency, amount, noInvoice, dateRaw, amountRaw} (dateRaw/amountRaw
  // postoje SAMO za redove koji dolaze iz CSV-a — razlikuje "nije prepoznao" od praznog ručnog reda).
  // deps: {clients, incomesRsd, incomesFx, invoices}. nbsRateFn(dateIso, currency)->broj — injektovano, ne
  // pozvano direktno (NBS kurs je sopstveno pravilo, van ovog modula).
  function buildItem(raw, deps, nbsRateFn, now){
    const dateIso = raw.date ? new Date(raw.date).toISOString() : '';
    const clientId = findClientId(deps.clients, raw.client);
    const rate = (!raw.currency || raw.currency==='RSD') ? 1 : nbsRateFn(dateIso || now, raw.currency);
    const amount = Number(raw.amount)||0;
    const amountDin = Math.round(amount*rate);
    const dup = dateIso ? isDuplicate(deps, {dateIso, currency:raw.currency, amount, invoiceNumber:raw.invoiceNumber}) : false;
    const issues = [];
    if(!dateIso && raw.dateRaw){
      // Round 30, nalaz 4: oblik prepoznat ali vrednost ne postoji (npr. "31.04.") dobija precizniju
      // poruku od onoga što se uopšte ne prepoznaje kao datum.
      issues.push(looksLikeDateShape(raw.dateRaw)
        ? 'Taj datum ne postoji ("'+raw.dateRaw+'"). Uredi stavku i unesi ispravan datum, ili je ukloni.'
        : 'Nisam prepoznala datum ("'+raw.dateRaw+'"). Uredi stavku i unesi ga ručno, ili je ukloni.');
    }
    if(amount<=0 && raw.amountRaw!=null && raw.amountRaw!=='') issues.push('Nisam prepoznala iznos ("'+raw.amountRaw+'"). Uredi stavku i unesi ga ručno, ili je ukloni.');
    if(raw.noInvoice) issues.push('Nema fakturu. Poveži je sa fakturom ili je ostavi kao prihod bez fakture.');
    if(dup) issues.push('Moguć duplikat: ista kombinacija datum, iznos i broj fakture već postoji u knjizi prihoda.');
    return {
      date: raw.date||'', dateIso, client: raw.client||'', clientId,
      needsNewClient: !!raw.client && !clientId, invoiceNumber: raw.invoiceNumber||'',
      currency: raw.currency||'EUR', amount, rate, amountDin,
      noInvoice: !!raw.noInvoice, status: issues.length?'review':'ok', issues, removed:false,
    };
  }

  // Projektovan efekat na limit (8.4): ISTO pravilo kao js/rules/limit.js (isključuje "bez fakture" i sve
  // van poslednjih 365 dana) primenjeno na stavke koje će se DODATI — mora da se slaže sa limit.js, inače
  // "Šta će se promeniti" pokazuje drugačiji broj od onoga što Knjiga prihoda stvarno prikaže posle čuvanja
  // (nađena i ispravljena greška, 28. krug Korak 6, STATUS.md).
  function projectedLimitAdd(items, now){
    const since = new Date(now); since.setDate(since.getDate()-365);
    return (items||[]).reduce((sum,it)=> sum + (!it.noInvoice && it.dateIso && new Date(it.dateIso)>=since ? it.amountDin : 0), 0);
  }

  const api = { uvozCsvTemplate, parseUvozCsv, parseSrDateFlexible, looksLikeDateShape, parseSrNumber, findClientId, isDuplicate, buildItem, projectedLimitAdd };
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  if(typeof window !== 'undefined'){ window.AIK = window.AIK || {}; window.AIK.Rules = window.AIK.Rules || {}; window.AIK.Rules.uvoz = api; }
})();
