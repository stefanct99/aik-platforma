// Izvedene vrednosti iz stanja: limit, čeka tebe, badge brojevi. Raste kroz faze.
(function(){
  const U = window.AIK.Util;
  const TODAY = window.AIK.Seed.TODAY;
  const RulesLimit = window.AIK.Rules.limit;

  const LIMIT = RulesLimit.LIMIT;

  // Limit se prati kao zbir poslednjih 12 meseci (klizno), ne kalendarska godina (8.4, 7.9). Stvarna
  // čista logika je sad u js/rules/limit.js (sa testovima) — ovde samo dev-meni test-override grana
  // (nije poslovno pravilo, samo UI alatka za ručno postavljanje procenta radi testiranja izgleda).
  function limitInfo(state){
    if(state.dev.limitOverridePct != null){
      const total = Math.round(LIMIT * state.dev.limitOverridePct / 100);
      return { total, pct: state.dev.limitOverridePct, remaining: Math.max(0,LIMIT-total), limit:LIMIT, months: 12 };
    }
    return RulesLimit.computeLimitInfo({ fxIncomes: state.incomesFx, rsdIncomes: state.incomesRsd }, TODAY);
  }

  // Prenos dosadašnjeg poslovanja (28. krug, UVOZ_SPECIFIKACIJA.md odeljak 4): dok korisnik ne potvrdi
  // kompletnost (Uv6 kvačica), Limit svuda nosi napomenu o tačnosti — ali SAMO ako je uvoz uopšte
  // pokrenut i sačuvao bar nešto (nov nalog bez ikakvog uvoza nema šta da bude "nepotpuno").
  function importCaveat(state){
    const st = state.importState;
    if(!st || st.confirmed || !st.history.length) return null;
    const startDate = st.history[st.history.length-1].startDate;
    return 'Tačan je samo ako su uneti svi prihodi od '+U.fmtDate(startDate);
  }

  // Ukupan prihod po KALENDARSKOJ godini (za Knjigu prihoda — različito od 12-mesečnog klizećeg limita na Početnoj, 7.9).
  function calendarYearIncomes(state, year){
    const fx = state.incomesFx.filter(i=> !i.noInvoice && new Date(i.date).getFullYear()===year);
    const rsd = state.incomesRsd.filter(i=> !i.noInvoice && new Date(i.date).getFullYear()===year);
    let fxTotal = fx.reduce((s,i)=> s + i.amount*i.rate, 0);
    let rsdTotal = rsd.reduce((s,i)=> s + i.amount, 0);
    // Faza 10, dvanaesti krug, korak 1b: isti obrazac kao dev.limitOverridePct (limitInfo iznad) — Kp7
    // (83.7% limita) pretpostavlja 19+22 uplate koje seed ne sadrži (seed ima 5+5); kako Kp7 frejm uopšte NE
    // prikazuje tabelu uplata (samo zbirne kartice/baner), ovaj prekidač menja SAMO zbir za test ovog stanja,
    // ne izmišlja pojedinačne redove u tabeli.
    if(state.dev.calendarYearOverride && state.dev.calendarYearOverride.year===year){
      fxTotal = state.dev.calendarYearOverride.fxTotal; rsdTotal = state.dev.calendarYearOverride.rsdTotal;
    }
    const total = Math.round((fxTotal+rsdTotal)*100)/100;
    const pct = Math.round((total/LIMIT)*1000)/10;
    return { fx, rsd, fxTotal, rsdTotal, total, pct, remaining: Math.max(0,LIMIT-total), limit:LIMIT };
  }

  // "Počni ovde" (7.2, 6.1): 5 koraka posle onboardinga koje aplikacija ne forsira sama.
  function setupChecklist(state){
    return [
      {key:'nalog', title:'Nalog napravljen', sub:'Dobro došao.', done:true},
      {key:'firma', title:'Podaci o firmi sačuvani', sub:'Koristim ih za fakture.', done: !!(state.business && state.business.name)},
      {key:'resenje', title:'Dodaj rešenje Poreske uprave', sub:'Iz njega čitam porez i doprinose.', done: !!state.taxDecision, link:'Kako do rešenja', cta:'Dodaj rešenje', route:'app/porez'},
      {key:'mejlovi', title:'Poveži mejlove banke', sub:'Da sama vidim uplate iz inostranstva.', done: state.bankMails.length>0, cta:'Poveži', route:'app/mejlovi'},
      {key:'faktura', title:'Napravi prvu fakturu', sub:'Zadnji korak, traje par minuta.', done: state.invoices.length>0, cta:'Nova faktura', route:'app/fakture/nova'},
    ];
  }

  // "Čeka tebe" (7.2): stavke koje traže odluku korisnika, najhitnije prvo (rokovi, pa novac, pa ostalo).
  function waitingForYouItems(state){
    const items = [];
    if(taxDueThisMonth(state)>0) items.push({key:'tax', kind:'rok', title:'Rok za porez', sub:'Akontacija za ovaj mesec još nije plaćena.', cta:'Plati', route:'app/porez'});
    invoicesWithEffectiveStatus(state).filter(i=>i.effectiveStatus==='Kasni').forEach(i=> items.push({key:'late-'+i.id, kind:'rok',
      title:`Faktura ${i.number} kasni`, sub:(i.client?i.client.name:'')+', pošalji podsetnik.', cta:'Pošalji podsetnik', route:'app/fakture/'+i.id}));
    state.bankMails.filter(m=>m.status==='Čeka tvoje odobrenje').forEach(m=> items.push({key:'bm-'+m.id, kind:'novac',
      title:'Obrazac za banku', sub:'Spreman, pregledaj pa pošalji.', cta:'Pregledaj', route:'app/mejlovi'}));
    state.bankMails.filter(m=>m.status==='Treba mi tvoja pomoć' && m.problem==='no_invoice').forEach(m=> items.push({key:'nf-'+m.id, kind:'novac',
      title:'Uplata od '+(m.senderName||'nepoznatog pošiljaoca'), sub:'Nemam fakturu za '+U.fmtMoney(m.amount,m.currency)+'.', cta:'Poveži', route:'app/mejlovi'}));
    return items;
  }

  function invoicesWithEffectiveStatus(state){
    return state.invoices.map(inv=> Object.assign({}, inv, {
      effectiveStatus: U.invoiceEffectiveStatus(inv, TODAY),
      total: U.invoiceTotal(inv),
      client: state.clients.find(c=>c.id===inv.clientId),
    }));
  }

  function pendingBankMailsCount(state){
    return state.bankMails.filter(m=> m.status==='Čeka tvoje odobrenje' || m.status==='Treba mi tvoja pomoć').length;
  }

  // Mejlovi banke (7.7): svaki mejl dobija klijenta, fakturu i tab (Čeka tebe / Obrađeno / Problemi).
  function bankMailTab(mail){
    if(mail.status==='Čeka tvoje odobrenje') return 'ceka';
    if(mail.status==='Treba mi tvoja pomoć') return 'problem';
    return 'obradjeno';
  }
  function bankMailsWithMeta(state){
    return state.bankMails.map(m=> Object.assign({}, m, {
      client: m.clientId ? state.clients.find(c=>c.id===m.clientId) : null,
      invoice: m.invoiceId ? state.invoices.find(i=>i.id===m.invoiceId) : null,
      tab: bankMailTab(m),
    }));
  }
  function bankMailTabCounts(state){
    const all = bankMailsWithMeta(state);
    return { sve: all.length, ceka: all.filter(m=>m.tab==='ceka').length, obradjeno: all.filter(m=>m.tab==='obradjeno').length, problem: all.filter(m=>m.tab==='problem').length };
  }
  function lateInvoicesCount(state){
    return invoicesWithEffectiveStatus(state).filter(i=>i.effectiveStatus==='Kasni').length;
  }
  function currentMonthKey(){ return U.monthKey(TODAY); }
  // Broj mesečnih rokova koji čekaju (ne broj pojedinačnih stavki — frejm pokazuje "1" u bedžu kad
  // tekući mesec nije u celosti plaćen, ne "4" za četiri stavke rešenja).
  function taxDueThisMonth(state){
    if(!state.taxDecision || state.taxPaymentMode==='trajni_nalog') return 0;
    return taxMonthFullyPaid(state, currentMonthKey()) ? 0 : 1;
  }
  function waitingForYouCount(state){
    return pendingBankMailsCount(state) + lateInvoicesCount(state) + (taxDueThisMonth(state)>0?1:0);
  }

  // ===================== Faza 6: Porez i rokovi (6.2, 6.3, 7.8, 8.7) =====================
  // Akontacija dospeva 15. u mesecu ZA PRETHODNI mesec (plaćanje u novembru je "za oktobar").
  function taxMonthlyTotal(state){ return state.taxDecision ? state.taxDecision.items.reduce((s,i)=>s+i.amount,0) : 0; }
  function taxServiceMonthName(key){ const m = Number(key.slice(5,7)); return U.MONTHS_SR[(m-2+12)%12]; }
  function taxDueDate(key){ return window.AIK.Rules.taxDeadlines.taxDueDate(key); }
  function taxMonthPaidCount(state, key){ const pay = state.taxPayments[key]; if(!pay) return 0; return Object.values(pay).filter(v=>v==='Plaćeno').length; }
  function taxMonthFullyPaid(state, key){ return taxMonthPaidCount(state, key) === (state.taxDecision?state.taxDecision.items.length:4); }
  // Sledećih n meseci za koje dospeva akontacija, počev od prvog koji nije u celosti plaćen
  // (6.3.5: kad je mesec Plaćen, rok nestaje iz "Čeka tebe" — sledeći mesec postaje "due").
  function upcomingTaxMonths(state, n){
    const out = []; let y = TODAY.getFullYear(), m = TODAY.getMonth()+1;
    while(taxMonthFullyPaid(state, y+'-'+String(m).padStart(2,'0'))){ m++; if(m>12){ m=1; y++; } }
    for(let i=0;i<n;i++){ out.push(y+'-'+String(m).padStart(2,'0')); m++; if(m>12){ m=1; y++; } }
    return out;
  }

  // ===================== Faza 7: Kalendar i obaveštenja (7.11, 7.12, 3.13) =====================
  // Jedini izvor događaja za Mesec/Lista/Godina/Dan — svi računaju kroz POSTOJEĆE Sel.* funkcije
  // iznad (taxDueDate/taxMonthlyTotal/taxMonthFullyPaid, invoicesWithEffectiveStatus), nikad ponovo.
  function calendarEventsForMonth(state, year, month){
    const out = [];
    if(state.dev && state.dev.forceEmptyCalendar) return out; // Kl9/PhKl9 dev-prekidač
    const monthKey = year+'-'+String(month).padStart(2,'0');
    if(state.taxDecision){
      const due = taxDueDate(monthKey);
      if(due.getFullYear()===year && due.getMonth()+1===month){
        const paid = taxMonthFullyPaid(state, monthKey);
        out.push({id:'tax-'+monthKey, date:due, type:'drzava', title:'Porez i doprinosi', sub:'Za '+taxServiceMonthName(monthKey), amount:taxMonthlyTotal(state), currency:'RSD', status: paid?'Plaćeno':'Čeka plaćanje', route:'app/porez', monthKey});
      }
    }
    invoicesWithEffectiveStatus(state).forEach(inv=>{
      if(inv.effectiveStatus!=='Poslata' && inv.effectiveStatus!=='Kasni') return;
      const due = U.invoiceDueDate(inv);
      if(due.getFullYear()!==year || due.getMonth()+1!==month) return;
      const clientName = inv.client?inv.client.name:'';
      if(inv.effectiveStatus==='Kasni'){
        out.push({id:'inv-'+inv.id, date:due, type:'kasni', title:inv.number+', '+clientName, sub:'Dospelo '+U.fmtDateShort(due)+', kasni '+U.lateDays(inv,TODAY)+' '+U.dayWord(U.lateDays(inv,TODAY)), amount:inv.total, currency:inv.currency, route:'app/fakture/'+inv.id, invoiceId:inv.id});
      } else {
        out.push({id:'inv-'+inv.id, date:due, type:'dospeva', title:inv.number+', '+clientName, sub:'Dospeva', amount:inv.total, currency:inv.currency, route:'app/fakture/'+inv.id, invoiceId:inv.id});
      }
    });
    (state.recurring||[]).forEach(r=>{
      if(r.status!=='Aktivna' || !r.nextDate) return;
      const nd = new Date(r.nextDate);
      if(nd.getFullYear()!==year || nd.getMonth()+1!==month) return;
      const client = state.clients.find(c=>c.id===r.clientId);
      out.push({id:'rec-'+r.id, date:nd, type:'ponavljajuca', title:(client?client.name:'')+', '+r.desc, sub:'Ponavljajuća faktura se šalje', amount:r.amount, currency:r.currency, route:'app/fakture', recurringId:r.id});
    });
    (state.calendarEvents||[]).forEach(e=>{
      const d = new Date(e.date);
      if(d.getFullYear()!==year || d.getMonth()+1!==month) return;
      out.push({id:'man-'+e.id, date:d, type:'rucni', title:e.title, sub:e.note||'', amount:null, route:null, manualId:e.id});
    });
    out.sort((a,b)=> a.date-b.date);
    return out;
  }
  function calendarEventCountsByYear(state, year){
    const out = {};
    for(let m=1;m<=12;m++) out[m] = calendarEventsForMonth(state, year, m).length;
    return out;
  }

  // ===================== Faza 8: AI knjigovođa (4.1-4.5, 5.5, 6.11, 7.12) =====================
  const AI_DAILY_LIMIT = 20;
  function todayKey(){ return U.monthKey(TODAY)+'-'+String(TODAY.getDate()).padStart(2,'0'); }
  function aiQuotaInfo(state){
    const isTrial = state.subscription && state.subscription.status==='Probni';
    const used = (state.aiQuota && state.aiQuota.date===todayKey()) ? state.aiQuota.used : 0;
    const forced = !!(state.dev && state.dev.aiForceQuotaFull);
    const exhausted = isTrial && (forced || used>=AI_DAILY_LIMIT);
    return { isTrial, limit:AI_DAILY_LIMIT, used: forced?AI_DAILY_LIMIT:used, remaining: Math.max(0,AI_DAILY_LIMIT-used), exhausted };
  }
  // Ko mi duguje novac (Ak2-tip bez posebnog frejma): fakture koje čekaju uplatu, istim izvorom kao Fakture/Čeka tebe.
  function invoicesOwedToUser(state){
    return invoicesWithEffectiveStatus(state).filter(i=> i.effectiveStatus==='Poslata' || i.effectiveStatus==='Kasni')
      .sort((a,b)=> (b.effectiveStatus==='Kasni') - (a.effectiveStatus==='Kasni'));
  }
  // Najkasnija faktura, isto pravilo kao Kalendar Kl1 (Faza 7): sortiraj po danima kašnjenja, ne po redosledu niza.
  function mostLateInvoice(state){
    const late = invoicesWithEffectiveStatus(state).filter(i=>i.effectiveStatus==='Kasni');
    if(!late.length) return null;
    return late.slice().sort((a,b)=> U.lateDays(b,TODAY)-U.lateDays(a,TODAY))[0];
  }

  // ===================== Faza 9: Pretplata (3.12, 5.5, 6.10, 7.14, 8.11) =====================
  // 5.5: šta stanje naloga dozvoljava/pauzira. "Otkazana" radi normalno do accessUntil (kraj plaćenog
  // perioda), posle toga je isto kao "Istekla". Jedino ISTEKLA/isteklo-otkazana pauzira AI knjigovođu —
  // probni period (i dok traje, i kad je blizu isteka) NEMA ograničenje osim dnevne AI kvote (Ak14).
  function subscriptionAccess(state){
    return window.AIK.Rules.subscriptionAccess.effectiveAccess(state.subscription, state.freeAccess, TODAY);
  }
  // Koji baner (ako ima) Početna pokazuje iznad grida (Sub1/Sub2/Sub12 — 6.10.1, 5.5).
  // Poslednja ispravka: kind:'expired' (poruka "AI knjigovođa je pauziran") MORA da čita isti
  // Sel.subscriptionAccess(state).aiPaused koji koriste i ostala mesta (Početna panel, AI knjigovođa,
  // sidebar), ne posebnu proveru sub.status direktno — inače besplatan pristup (ADMIN_SPEC 6) ne sprečava
  // ovaj baner da i dalje pogrešno kaže "pauziran".
  function subscriptionBanner(state){
    const sub = state.subscription;
    if(sub.status==='Probni'){
      if(sub.trialDaysLeft<=0) return subscriptionAccess(state).aiPaused ? {kind:'expired'} : null;
      if(sub.trialDaysLeft<=5) return {kind:'trial_ending', days:sub.trialDaysLeft};
      return null;
    }
    if(subscriptionAccess(state).aiPaused) return {kind:'expired'};
    if(sub.status==='Aktivna' && sub.paymentMethod && sub.paymentMethod.type==='qr' && sub.nextChargeAt){
      const days = U.daysDiff(sub.nextChargeAt, TODAY);
      if(days>=0 && days<=3) return {kind:'qr_renewal', days, nextChargeAt:sub.nextChargeAt};
    }
    return null;
  }

  // Faza 10b (26. krug): koji šablon (7.6 "Pravilo dodele") se primenjuje na dato par faktura/klijent.
  // Prioritet (autorski, frejm ne precizira redosled kad se više pravila poklopi): po klijentu (domestic)
  // pa po valuti pa po jeziku, pa podrazumevani šablon — sve van podrazumevanog se tretira kao "izuzetak".
  function templateForInvoice(state, invoice, client){
    const list = state.invoiceTemplates||[];
    const cands = list.filter(t=>!t.isDefault && t.assignRule);
    const byDomestic = cands.find(t=> t.assignRule.domestic!==undefined && !!(client&&client.domestic)===t.assignRule.domestic);
    const byCurrency = !byDomestic && cands.find(t=> t.assignRule.currency && invoice && t.assignRule.currency===invoice.currency);
    const byLang = !byDomestic && !byCurrency && cands.find(t=> t.assignRule.lang && t.assignRule.lang===((invoice&&invoice.lang)||'sr'));
    return byDomestic || byCurrency || byLang || list.find(t=>t.isDefault) || list[0];
  }

  // ===================== Admin (Faza 11, ADMIN_SPEKIFIKACIJA odeljak 2) =====================
  // Jedina uloga je 'admin' (ADMIN_SPEC 2: "Postoji jedna uloga: admin. Samo jedan admin.").
  function isAdmin(state){ return !!(state.user && state.user.role==='admin'); }

  // Pregled (Adm1/PhAdm1, ADMIN_SPEC 4.1/5): jedini izvor brojki za Pregled. U Koraku 2 agregati
  // dolaze direktno iz Priloga B (state.adminData.overview — videti napomenu u seed.js); od Koraka 3,
  // kad lista od 128 naloga postoji, Ukupno/Probni/Aktivni/Naplata/Otkazani se preračunavaju iz nje da
  // ostanu TAČAN isti izvor kao filteri na Korisnicima (ADMIN_SPEC 5, "moraju da se poklapaju").
  function adminUsersAll(state){
    // "Svi" (Adm2 4.2): lista + besplatni, ADMIN_PAKET2 ("se vide u listi pod 'Svi' ali se ne broje
    // u Ukupno/pilule/MRR"). Istina frejma ("Prikazano 8 od 128") je snimljena PRE ove odluke — sa
    // Stefanom kao posebnim nalogom van 128, stvaran broj redova je 129, ne 128 (javljeno u izveštaju).
    // `status:'besplatno'` MORA biti poslednje — naloge koje je Korak 4 prebacio iz `users` u
    // `freeAccess` (grantFreeAccess) nosi i njihov STARI status (probni/aktivna/...) kao `priorStatus`,
    // pa bi Object.assign u obrnutom redosledu tiho zadržao taj stari status umesto 'besplatno'.
    return state.adminData.users.concat(state.adminData.freeAccess.map(u=>Object.assign({}, u, {status:'besplatno'})));
  }
  function adminOverview(state){
    const users = state.adminData.users;
    const counts = { probni:0, aktivna:0, naplata:0, otkazana:0 };
    users.forEach(u=> counts[u.status]++);
    const o = state.adminData.overview;
    const activePct = Math.round((counts.aktivna/users.length)*1000)/10;
    return Object.assign({}, o, {
      totalUsers: users.length, trial: counts.probni, active: counts.aktivna,
      paymentFailed: counts.naplata, canceled: counts.otkazana, activePct,
    });
  }

  window.AIK = window.AIK || {};
  window.AIK.Selectors = { limitInfo, calendarYearIncomes, setupChecklist, waitingForYouItems, invoicesWithEffectiveStatus, pendingBankMailsCount, lateInvoicesCount, taxDueThisMonth, waitingForYouCount, currentMonthKey, bankMailTab, bankMailsWithMeta, bankMailTabCounts,
    subscriptionAccess, subscriptionBanner,
    taxMonthlyTotal, taxServiceMonthName, taxDueDate, taxMonthPaidCount, taxMonthFullyPaid, upcomingTaxMonths,
    calendarEventsForMonth, calendarEventCountsByYear, aiQuotaInfo, invoicesOwedToUser, mostLateInvoice, templateForInvoice, importCaveat,
    isAdmin, adminOverview, adminUsersAll };
})();
