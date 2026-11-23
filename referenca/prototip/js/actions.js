(function(){
  const store = window.AIK.store;
  const DEMO_PASSWORD = 'demo1234';

  function patchSession(p){ store.setState(s=> ({session: Object.assign({}, s.session, p)})); }

  const Auth = {
    register(data){
      store.setState(s=> ({
        user: Object.assign({}, s.user, {name:data.name, email:data.email}),
        session: Object.assign({}, s.session, {loggedIn:true, emailVerified:false, emailForVerify:data.email, onboardingComplete:false, onboardingStep:1}),
      }));
      store.navigate('verify');
    },
    resendVerify(){ store.toast('Mejl je ponovo poslat.'); },
    openSimulatedVerify(){ store.setState({simInbox:{type:'verify', email: store.getState().session.emailForVerify || store.getState().user.email}}); },
    confirmVerify(){ patchSession({emailVerified:true}); store.setState({simInbox:null}); store.navigate('verify-done'); },
    continueAfterVerify(){
      const s = store.getState();
      store.navigate(s.session.onboardingComplete ? 'app/pocetna' : 'onboarding');
    },
    login(email, password){
      const s = store.getState();
      if(s.session.lockedUntil && Date.now() < s.session.lockedUntil){ return {ok:false, reason:'locked'}; }
      if(email && email.toLowerCase() === s.user.email.toLowerCase() && password === DEMO_PASSWORD){
        patchSession({loginAttempts:0, lockedUntil:null, loggedIn:true});
        store.navigate(s.session.onboardingComplete ? 'app/pocetna' : (s.session.emailVerified ? 'onboarding' : 'verify'));
        return {ok:true};
      }
      const attempts = (s.session.loginAttempts||0) + 1;
      if(attempts >= 5){ patchSession({loginAttempts:attempts, lockedUntil: Date.now()+15*60*1000}); return {ok:false, reason:'locked'}; }
      patchSession({loginAttempts:attempts});
      return {ok:false, reason:'credentials'};
    },
    googleLogin(){
      if(store.getState().dev.forceGoogleError){ return {ok:false}; }
      patchSession({loggedIn:true, emailVerified:true});
      const s = store.getState();
      store.navigate(s.session.onboardingComplete ? 'app/pocetna' : 'onboarding');
      return {ok:true};
    },
    sendMagicLink(email){ patchSession({pendingMagicEmail:email}); store.navigate('magic-sent'); },
    openSimulatedMagic(){
      if(store.getState().dev.forceMagicExpired){ store.navigate('link-expired'); return; }
      const s = store.getState();
      patchSession({loggedIn:true, emailVerified:true});
      store.navigate(s.session.onboardingComplete ? 'app/pocetna' : 'onboarding');
    },
    sendPasswordReset(email){ patchSession({pendingResetEmail:email}); store.navigate('forgot-sent'); },
    openSimulatedReset(){
      if(store.getState().dev.forceMagicExpired){ store.navigate('link-expired'); return; }
      store.navigate('forgot-newpass');
    },
    submitNewPassword(){ store.navigate('forgot-success'); },
    logout(){
      patchSession({loggedIn:false});
      store.navigate('login');
    },
  };

  const Dev = {
    // Vodič kroz aplikaciju (25. krug, Korak 3): "Pomoć i vodič" (meni korisnika) i WelcomeTourModal-ovo
    // "Pokaži mi" oba vode ovde — vraća na Početnu (ciljevi vodiča postoje samo tamo) i pokreće korak 1.
    startTour(){ store.navigate('app/pocetna'); store.setState(s=>({dev:Object.assign({},s.dev,{tourStep:1})})); },
    setTheme(theme){ store.setState({theme}); },
    setLang(lang){ store.setState({lang}); window.AIK.i18n.setLang(lang); },
    setDateFormat(f){ store.setState({dateFormat:f}); },
    toggleMenu(){ store.setState(s=>({devMenuOpen:!s.devMenuOpen})); },
    reset(){ const fresh = window.AIK.freshState(); store.setState(()=>fresh); store.navigate('login'); },
    setPreset(key){
      const s = store.getState();
      const U = window.AIK.Util, TODAY = window.AIK.Seed.TODAY;
      const base = { accountStatePreset:key };
      // 9: svako stanje naloga postavlja DOSLEDNO period/način plaćanja/istoriju/sledeću naplatu —
      // ne samo status — jer Sel.subscriptionAccess i Pretplata ekrani čitaju sva ta polja zajedno.
      const paidHistory = [
        {id:'sh0', date:U.addDays(TODAY,-99).toISOString(), desc:'Probni period, 30 dana', amount:0, currency:'EUR'},
        {id:'sh1', date:TODAY.toISOString(), desc:'Pretplata, 12 meseci', amount:276, currency:'EUR'},
      ];
      const presets = {
        new: ()=>({ session: Object.assign({}, s.session, {loggedIn:true, emailVerified:false, onboardingComplete:false, onboardingStep:1}), route:'verify' }),
        onboarding: ()=>({ session: Object.assign({}, s.session, {loggedIn:true, emailVerified:true, onboardingComplete:false, onboardingStep:1}), route:'onboarding' }),
        trial: ()=>({ session: Object.assign({}, s.session, {loggedIn:true, emailVerified:true, onboardingComplete:true}),
          subscription: Object.assign({}, s.subscription, {status:'Probni', trialDaysLeft:23, trialEndsAt:U.addDays(TODAY,23).toISOString(),
            period:null, paymentMethod:null, nextChargeAt:null, history:[], cancelReason:null, accessUntil:null}), route:'app/pocetna' }),
        trial_ending: ()=>({ session: Object.assign({}, s.session, {loggedIn:true, emailVerified:true, onboardingComplete:true}),
          subscription: Object.assign({}, s.subscription, {status:'Probni', trialDaysLeft:5, trialEndsAt:U.addDays(TODAY,5).toISOString(),
            period:null, paymentMethod:null, nextChargeAt:null, history:[], cancelReason:null, accessUntil:null}), route:'app/pocetna' }),
        expired: ()=>({ session: Object.assign({}, s.session, {loggedIn:true, emailVerified:true, onboardingComplete:true}),
          subscription: Object.assign({}, s.subscription, {status:'Istekla', trialDaysLeft:0, trialEndsAt:U.addDays(TODAY,-5).toISOString(),
            period:null, paymentMethod:null, nextChargeAt:null, history:[], cancelReason:null, accessUntil:null}), route:'app/pocetna' }),
        active: ()=>({ session: Object.assign({}, s.session, {loggedIn:true, emailVerified:true, onboardingComplete:true}),
          subscription: Object.assign({}, s.subscription, {status:'Aktivna', period:12, paymentMethod:{type:'card', last4:'4417', exp:'08/28'},
            nextChargeAt:U.addMonths(TODAY,12).toISOString(), history:paidHistory, cancelReason:null, accessUntil:null}), route:'app/pocetna' }),
        payment_failed: ()=>({ session: Object.assign({}, s.session, {loggedIn:true, emailVerified:true, onboardingComplete:true}),
          subscription: Object.assign({}, s.subscription, {status:'Naplata nije uspela', period:12, paymentMethod:{type:'card', last4:'4417', exp:'08/28'},
            nextChargeAt:TODAY.toISOString(), history:paidHistory, cancelReason:null, accessUntil:null}), route:'app/pocetna' }),
        canceled: ()=>({ session: Object.assign({}, s.session, {loggedIn:true, emailVerified:true, onboardingComplete:true}),
          subscription: Object.assign({}, s.subscription, {status:'Otkazana', period:12, paymentMethod:{type:'card', last4:'4417', exp:'08/28'},
            nextChargeAt:null, accessUntil:U.addMonths(TODAY,12).toISOString(), history:paidHistory, cancelReason:'Preskupo je'}), route:'app/pocetna' }),
      };
      if(presets[key]) store.setState(presets[key]());
    },
    setLimitOverride(pct){ store.setState(s=> ({dev: Object.assign({}, s.dev, {limitOverridePct: pct})})); },
    // Round 30, nalaz 5: test-prekidač za besplatan pristup (ADMIN_SPEC 6) na STVARNOM nalogu — isti
    // dev.* obrazac kao limitOverridePct, jer prikaz u korisnikovoj aplikaciji nije nacrtan (ne postoji
    // pravi put da admin dodeli besplatan pristup SVOM nalogu kroz UI, samo kroz fejk 128-pool).
    setFreeAccess(on){ store.setState(s=> ({freeAccess: on ? {noEnd:true} : null})); },
    // Faza 11, Korak 1 (ADMIN_SPEC 8): prekidač uloge u dev meniju — jedini nalog u prototipu se
    // ponaša kao admin ili kao obican korisnik, nema posebnog admin naloga.
    setRole(role){ store.setState(s=> ({user: Object.assign({}, s.user, {role})})); },
    toggleFlag(key){ store.setState(s=> ({dev: Object.assign({}, s.dev, {[key]: !s.dev[key]})})); },
    goto(route){ store.navigate(route); },
    // Faza 10, korak 1: alat za poređenje izgleda trenutnog ekrana sa frejmom. Pošto frejmovi nisu dostupni u
    // runtime-u (stižu kao .dc.html fajlovi van ovog projekta), alat ne učitava frejm sam — snima computed
    // style SVIH named-class elemenata trenutnog ekrana (font/boje/razmaci/okviri), grupisano po klasi, da se
    // ručno uporedi sa vrednostima pročitanim iz frejma. Rezultat ide u dev.styleAudit (prikazano u Dev meniju).
    auditStyles(){
      const PROPS = ['fontSize','fontWeight','color','backgroundColor','padding','margin','borderRadius','border','gap','width','height'];
      const seen = new Map();
      document.querySelectorAll('main [class]').forEach(el=>{
        const cls = (el.className+'').toString().trim().split(/\s+/).filter(Boolean).join('.');
        if(!cls || seen.has(cls)) return;
        const cs = getComputedStyle(el);
        const styles = {};
        PROPS.forEach(p=> styles[p]=cs[p]);
        const text = (el.textContent||'').trim().slice(0,40);
        seen.set(cls, {cls, tag:el.tagName.toLowerCase(), text, styles});
      });
      const rows = Array.from(seen.values());
      store.setState(s=>({dev: Object.assign({}, s.dev, {styleAudit:{route:s.route, theme:document.documentElement.getAttribute('data-theme')||'system', width:window.innerWidth, rows, at:Date.now()}})}));
      store.toast('Snimljeno '+rows.length+' klasa sa trenutnog ekrana.');
    },
    // Faza 10, korak 4 (drugi krug): automatska detekcija duplih CSS selektora na istom (top) nivou —
    // tačno ovaj propust je prouzrokovao .sub-tabs bag (Mejlovi banke vs Pretplata). Selektori koji se
    // ponavljaju UNUTAR @media bloka (responsive override istog selektora) su normalni i nisu prijavljeni —
    // samo oni van svakog @media/@supports uslova, gde kasnija definicija tiho prepisuje raniju.
    auditDuplicateCSS(){
      const counts = new Map();
      for(const sheet of document.styleSheets){
        let rules;
        try{ rules = sheet.cssRules; }catch(e){ continue; }
        if(!rules) continue;
        for(const rule of rules){
          if(!(rule instanceof CSSStyleRule)) continue; // preskače @media/@font-face/@keyframes itd. na top nivou
          rule.selectorText.split(',').forEach(sel=>{
            sel = sel.trim(); if(!sel) return;
            if(!counts.has(sel)) counts.set(sel, []);
            counts.get(sel).push(rule.style.cssText);
          });
        }
      }
      const dupes = Array.from(counts.entries()).filter(([sel,defs])=> defs.length>1 && new Set(defs).size>1)
        .map(([sel,defs])=>({selector:sel, count:defs.length, defs}));
      store.setState(s=>({dev: Object.assign({}, s.dev, {cssDuplicateAudit:{dupes, scannedAt:Date.now()}})}));
      store.toast(dupes.length ? ('Nađeno '+dupes.length+' sudar(a) selektora.') : 'Nema duplih selektora van @media.');
    },
  };

  const Onboarding = {
    saveStep1(data){
      store.setState(s=> ({ business: Object.assign({}, s.business, data), session: Object.assign({}, s.session, {onboardingStep:2}) }));
    },
    saveStep2(data){
      store.setState(s=> ({ business: Object.assign({}, s.business, data), session: Object.assign({}, s.session, {onboardingStep:3}) }));
    },
    // Faza 10 (18. krug): isti mehanizam kao dev meni "Simuliraj novi mejl banke" — pravi stvaran mejl
    // (ne samo zastavicu), da "Prvi mejl je stigao" vodi u pravi, obradljiv zapis u Mejlovima banke.
    simulateFirstMail(){
      const r = BankMails.simulateNewMail('devizni');
      if(r && r.ok) store.setState(s=> ({ session: Object.assign({}, s.session, {inboxConnected:true}) }));
    },
    toStep3(){ store.setState(s=> ({session: Object.assign({}, s.session, {onboardingStep:3})})); },
    toStep4(skippedMail){
      store.setState(s=> ({session: Object.assign({}, s.session, {onboardingStep:4, mailSkipped: !!skippedMail || s.session.inboxConnected ? s.session.mailSkipped : true})}));
    },
    skipMail(){ store.setState(s=> ({session: Object.assign({}, s.session, {onboardingStep:4, mailSkipped:true})})); },
    backStep(n){ store.setState(s=> ({session: Object.assign({}, s.session, {onboardingStep:n})})); },
    finish(){
      store.setState(s=> ({session: Object.assign({}, s.session, {onboardingComplete:true})}));
      setTimeout(()=> store.navigate('app/pocetna'), 900);
    },
  };

  function uid(p){ return window.AIK.Util.uid(p); }

  const Business = {
    update(patch){ store.setState(s=> ({business: Object.assign({}, s.business, patch)})); store.toast('Sačuvano.'); },
    addAccount(data){
      store.setState(s=> ({accounts: s.accounts.concat(Object.assign({id:uid('acc')}, data))}));
      store.toast('Račun je dodat.');
    },
    updateAccount(id, patch){
      store.setState(s=> ({accounts: s.accounts.map(a=> a.id===id? Object.assign({}, a, patch): a)}));
      store.toast('Sačuvano.');
    },
    removeAccount(id){
      store.setState(s=> ({accounts: s.accounts.filter(a=>a.id!==id)}));
      store.toast('Račun je uklonjen.');
    },
    setDefaultAccount(id, currency){
      store.setState(s=> ({accounts: s.accounts.map(a=> a.currency===currency ? Object.assign({}, a, {isDefault:a.id===id}) : a)}));
    },
    // Round 30, nalaz 2 (spec 8.4 + 8.10 "deduplikacija: isti događaj se ne šalje dvaput"): poziva se iz
    // svakog ekrana koji prikazuje baner limita (Početna, Knjiga prihoda) kad god se pokaže neki prag.
    // Baner ostaje TRAJNO vidljiv dok uslov važi (kao i ostale trake stanja u aplikaciji) — ali zvonce
    // dobija zapis samo JEDNOM po pragu, prvi put kad se taj prag dostigne, ne na svaki ponovni prikaz.
    checkLimitThreshold(){
      const s = store.getState();
      const Sel = window.AIK.Selectors, RulesLimit = window.AIK.Rules.limit;
      const tier = RulesLimit.limitWarningTier(Sel.limitInfo(s).pct);
      if(!tier || tier<=(s.limitNotifTier||0)) return;
      const TEXT = {
        80: {title:'Približavaš se limitu za paušalce', body:'Dostigao si 80% godišnjeg limita od 6.000.000 din.'},
        90: {title:'Dostigao si 90% godišnjeg limita', body:'Još malo pa prelaziš limit za paušalce — proveri šta to znači pre nove velike fakture.'},
        100: {title:'Prešao si limit za paušalce', body:'Menja se način oporezivanja za ovu godinu.'},
      }[tier];
      const notif = {id:uid('ntf'), read:false, type:'Limit za paušalce', title:TEXT.title, body:TEXT.body, at:window.AIK.Seed.TODAY.toISOString(), route:'app/pocetna'};
      store.setState(s2=> ({notifications: [notif].concat(s2.notifications), limitNotifTier: tier}));
    },
  };

  const Settings = {
    toggleNotif(key, channel){
      store.setState(s=> ({notifSettings: Object.assign({}, s.notifSettings, {[key]: Object.assign({}, s.notifSettings[key], {[channel]: !s.notifSettings[key][channel]})})}));
    },
    toggleAutonomyFlag(key){ store.setState(s=> ({dev: Object.assign({}, s.dev, {[key]: !s.dev[key]})})); },
    setTwoFactor(on){ store.setState(s=> ({dev: Object.assign({}, s.dev, {twoFactor: on})})); },
    setCalendarSync(on){ store.setState(s=> ({dev: Object.assign({}, s.dev, {calendarSync: on})})); },
    changePassword(){ store.toast('Lozinka je promenjena.'); },
    logoutDevice(name){ store.toast(name+' je odjavljen.'); },
    deleteAccount(){
      Dev.reset();
      store.toast('Nalog je trajno izbrisan.');
    },
    markAllNotifsRead(){ store.setState(s=> ({notifications: s.notifications.map(n=> Object.assign({}, n, {read:true}))})); },
    markNotifRead(id){ store.setState(s=> ({notifications: s.notifications.map(n=> n.id===id?Object.assign({}, n, {read:true}):n)})); },
  };

  // Faza 0 (js/rules/invoiceNumbering.js): čista logika sad ima sopstvene testove — ovde samo
  // izvlačenje brojeva iz s.invoices (uključujući UVEZENE, Uvoz.commit ih dodaje u isti niz) i poziv.
  function nextInvoiceNumber(s){
    return window.AIK.Rules.invoiceNumbering.nextInvoiceNumber(s.invoices.map(i=>i.number), '25/26');
  }

  const Invoices = {
    create(data){
      const s = store.getState();
      const inv = Object.assign({id:uid('inv'), number: nextInvoiceNumber(s), issueDate:new Date().toISOString(),
        dueDays:7, items:[], status:'Nacrt', lang:'sr', currency:'EUR', note:'Hvala na saradnji'}, data);
      store.setState(s2=> ({invoices: s2.invoices.concat(inv)}));
      return inv;
    },
    update(id, patch){ store.setState(s=> ({invoices: s.invoices.map(i=> i.id===id? Object.assign({}, i, patch): i)})); },
    remove(id){ store.setState(s=> ({invoices: s.invoices.filter(i=>i.id!==id)})); store.toast('Nacrt je obrisan.'); },
    saveDraft(id, patch){ Invoices.update(id, Object.assign({status:'Nacrt'}, patch)); store.toast('Nacrt je sačuvan.'); },
    send(id, extra){ Invoices.update(id, Object.assign({status:'Poslata', sentAt:new Date().toISOString()}, extra||{})); },
    markPaid(id){ Invoices.update(id, {status:'Plaćena', paidDate:new Date().toISOString()}); store.toast('Faktura je označena kao plaćena.'); },
    void(id){ Invoices.update(id, {status:'Stornirana', voidedAt:new Date().toISOString()}); store.toast('Faktura je stornirana.'); },
    duplicate(id){
      const s = store.getState(); const inv = s.invoices.find(i=>i.id===id); if(!inv) return null;
      const copy = Object.assign({}, inv, {id:uid('inv'), number:nextInvoiceNumber(s), status:'Nacrt', issueDate:new Date().toISOString(), paidDate:null, sentAt:null, voidedAt:null});
      store.setState(s2=>({invoices: s2.invoices.concat(copy)}));
      store.toast('Faktura je duplirana kao nacrt.');
      return copy;
    },
    sendReminder(){ store.toast('Podsetnik je poslat.'); },
  };

  const Clients = {
    create(data){
      const c = Object.assign({id:uid('c'), country:'', address:'', defaultCurrency:'EUR', defaultLang:'sr', defaultDueDays:7, defaultAccountId:null, defaultItem:null, autoSend:false, fxMode:null}, data);
      store.setState(s=>({clients: s.clients.concat(c)})); store.toast('Klijent je sačuvan.'); return c;
    },
    update(id, patch){ store.setState(s=>({clients: s.clients.map(c=> c.id===id? Object.assign({},c,patch): c)})); store.toast('Sačuvano.'); },
    remove(id){ store.setState(s=>({clients: s.clients.filter(c=>c.id!==id)})); store.toast('Klijent je obrisan.'); },
  };

  const Recurring = {
    create(data){ const r = Object.assign({id:uid('r'), status:'Aktivna', mode:'ask'}, data); store.setState(s=>({recurring: s.recurring.concat(r)})); store.toast('Ponavljajuća faktura je sačuvana.'); return r; },
    update(id, patch){ store.setState(s=>({recurring: s.recurring.map(r=> r.id===id? Object.assign({},r,patch): r)})); store.toast('Sačuvano.'); },
    toggleStatus(id){ store.setState(s=>({recurring: s.recurring.map(r=> r.id===id? Object.assign({},r,{status: r.status==='Aktivna'?'Pauzirana':'Aktivna'}): r)})); },
    remove(id){ store.setState(s=>({recurring: s.recurring.filter(r=>r.id!==id)})); store.toast('Ponavljajuća faktura je obrisana.'); },
  };

  const Templates = {
    update(id, patch){ store.setState(s=>({invoiceTemplates: s.invoiceTemplates.map(t=> t.id===id? Object.assign({},t,patch): t)})); },
    toggleBlock(id, key){
      store.setState(s=> ({invoiceTemplates: s.invoiceTemplates.map(t=> t.id!==id ? t :
        Object.assign({}, t, {blocksOff: t.blocksOff.includes(key) ? t.blocksOff.filter(k=>k!==key) : t.blocksOff.concat(key)}))}));
    },
    moveBlock(id, key, dir){
      store.setState(s=> ({invoiceTemplates: s.invoiceTemplates.map(t=>{
        if(t.id!==id) return t;
        const arr = t.blocks.slice(); const i = arr.indexOf(key); const j = i+dir;
        if(i<0||j<0||j>=arr.length) return t;
        const tmp = arr[i]; arr[i]=arr[j]; arr[j]=tmp;
        return Object.assign({}, t, {blocks:arr});
      })}));
    },
    // 26. krug, Korak 2b/c: pozicija/veličina i osobine BLOKA na platnu — jedini izvor i za editor i za
    // pravi pregled/"PDF" (InvoiceDoc čita isto polje). updateBlockProps radi plitko spajanje patch-a.
    updateBlockProps(id, key, patch){
      store.setState(s=> ({invoiceTemplates: s.invoiceTemplates.map(t=> t.id!==id ? t :
        Object.assign({}, t, {blockProps: Object.assign({}, t.blockProps, {[key]: Object.assign({}, t.blockProps[key], patch)})}))}));
    },
    updateTable(id, patch){
      store.setState(s=> ({invoiceTemplates: s.invoiceTemplates.map(t=> t.id!==id ? t :
        Object.assign({}, t, {table: Object.assign({}, t.table, patch)}))}));
    },
    toggleTableCol(id, col){
      store.setState(s=> ({invoiceTemplates: s.invoiceTemplates.map(t=>{
        if(t.id!==id) return t;
        const has = t.table.cols.includes(col);
        return Object.assign({}, t, {table: Object.assign({}, t.table, {cols: has ? t.table.cols.filter(c=>c!==col) : t.table.cols.concat(col)})});
      })}));
    },
    updateDoc(id, patch){
      store.setState(s=> ({invoiceTemplates: s.invoiceTemplates.map(t=> t.id!==id ? t :
        Object.assign({}, t, {doc: Object.assign({}, t.doc, patch)}))}));
    },
    setAssignRule(id, rule){ Templates.update(id, {assignRule: rule}); },
    selectActive(id){ store.setState({activeTemplateId:id}); },
    // Fak27, "+ Novi šablon": prazan šablon (DEFAULT_TEMPLATE), bez pravila dodele (ne otima fakture
    // od postojećih šablona dok vlasnik sam ne izabere "Pravilo dodele").
    createNew(){
      const id = uid('tpl');
      const n = store.getState().invoiceTemplates.length;
      const fresh = Object.assign(JSON.parse(JSON.stringify(window.AIK.DEFAULT_TEMPLATE)), {id, name:'Novi šablon '+n, isDefault:false, assignRule:null});
      store.setState(s=>({invoiceTemplates: s.invoiceTemplates.concat(fresh), activeTemplateId:id}));
      store.toast('Novi šablon je napravljen.');
    },
    // Fak27, "Dupliraj ovaj šablon": kopija trenutnog (sve osobine), bez pravila dodele (kopija ne nasleđuje
    // originalovo pravilo — dva šablona sa istim pravilom bi se sudarila, vlasnik bira novo).
    duplicate(id){
      const src = store.getState().invoiceTemplates.find(t=>t.id===id);
      if(!src) return;
      const nid = uid('tpl');
      const copy = Object.assign(JSON.parse(JSON.stringify(src)), {id:nid, name:'Kopija – '+src.name, isDefault:false, assignRule:null});
      store.setState(s=>({invoiceTemplates: s.invoiceTemplates.concat(copy), activeTemplateId:nid}));
      store.toast('Šablon je dupliran.');
    },
    remove(id){
      const t = store.getState().invoiceTemplates.find(x=>x.id===id);
      if(!t || t.isDefault) return;
      store.setState(s=>({invoiceTemplates: s.invoiceTemplates.filter(x=>x.id!==id), activeTemplateId: s.activeTemplateId===id ? (s.invoiceTemplates.find(x=>x.isDefault)||s.invoiceTemplates[0]).id : s.activeTemplateId}));
      store.toast('Šablon je obrisan.');
    },
    // Fak24, "Raspored" dijalog: "Kad primeniš novi raspored, blokove koje si ručno pomerio vraćam na
    // njihova mesta." — resetuje SAMO x/y/w/h po preset-u (window.AIK.TEMPLATE_LAYOUTS), boje/poravnanje/
    // font/pozadina/okvir po bloku ostaju ("tvoji podaci i boje ostaju").
    applyLayout(id, layoutKey){
      const preset = window.AIK.TEMPLATE_LAYOUTS[layoutKey];
      if(!preset) return;
      store.setState(s=> ({invoiceTemplates: s.invoiceTemplates.map(t=>{
        if(t.id!==id) return t;
        const blockProps = {};
        Object.keys(t.blockProps).forEach(k=>{
          const p = preset.positions[k];
          blockProps[k] = p ? Object.assign({}, t.blockProps[k], {x:p.x, y:p.y, w:p.w, h:p.h}) : t.blockProps[k];
        });
        return Object.assign({}, t, {layout:layoutKey, blockProps, doc: Object.assign({}, t.doc, {topBar:preset.topBar, sideBar:preset.sideBar})});
      })}));
      store.toast('Raspored je primenjen.');
    },
    resetDefault(id){
      store.setState(s=> ({invoiceTemplates: s.invoiceTemplates.map(t=> t.id!==id? t :
        Object.assign({}, t, JSON.parse(JSON.stringify(window.AIK.DEFAULT_TEMPLATE)), {id:t.id, name:t.name, isDefault:t.isDefault, assignRule:t.assignRule}))}));
      store.toast('Vraćeno na podrazumevano.');
    },
    save(){ store.toast('Šablon je sačuvan.'); },
  };

  const Income = {
    // Ručni unos prihoda (7.9, Kp5). Devizni ide u incomesFx (sa kursom), dinarski u incomesRsd.
    add(data){
      if(data.kind==='Devizni'){
        const entry = {id:uid('inc'), date:new Date(data.date).toISOString(), clientId:data.clientId||null, invoiceId:data.invoiceId||null,
          currency:data.currency, amount:Number(data.amount)||0, rate:Number(data.rate)||1, source:'Ručno', desc:data.desc||''};
        store.setState(s=> ({incomesFx: s.incomesFx.concat(entry)}));
      } else {
        const entry = {id:uid('incr'), date:new Date(data.date).toISOString(), clientId:data.clientId||null, invoiceId:data.invoiceId||null,
          amount:Number(data.amount)||0, source:'Ručno', desc:data.desc||''};
        store.setState(s=> ({incomesRsd: s.incomesRsd.concat(entry)}));
      }
      if(data.invoiceId) Invoices.markPaid(data.invoiceId); else store.toast('Prihod je sačuvan.');
    },
    remove(id, kind){
      // Uvoz 5.5: brisanje UVEZENE stavke se beleži u istoriji uvoza (ne samo opšti "obrisano" toast).
      const s0 = store.getState();
      const entry = (kind==='fx'?s0.incomesFx:s0.incomesRsd).find(i=>i.id===id);
      if(kind==='fx') store.setState(s=> ({incomesFx: s.incomesFx.filter(i=>i.id!==id)}));
      else store.setState(s=> ({incomesRsd: s.incomesRsd.filter(i=>i.id!==id)}));
      if(entry && entry.source==='Uvoz'){
        store.setState(s=> ({importState: Object.assign({}, s.importState, {history: s.importState.history.concat(
          {id:uid('uvh'), at:new Date().toISOString(), kind:'brisanje', itemsCount:1, note:'Obrisana uvezena stavka od '+U.fmtDate(entry.date)})})}));
      }
      store.toast('Prihod je obrisan. Zbir i limit su ponovo izračunati.');
    },
    // Isti slučaj kao BankMails.resolveNoInvoice (6.6, Mb6), ali za uplatu koja već postoji u knjizi
    // prihoda bez mejla banke (npr. AI chat Ak7/Ak9/Ak11, Kp10). "noInvoice" izlazi, uplata ulazi u zbir.
    linkNoInvoice(incomeId, mode, data){
      const s = store.getState();
      const kind = s.incomesFx.some(i=>i.id===incomeId) ? 'fx' : 'rsd';
      const list = kind==='fx' ? s.incomesFx : s.incomesRsd;
      const entry = list.find(i=>i.id===incomeId); if(!entry) return;
      if(mode==='reject'){
        if(kind==='fx') store.setState(s2=>({incomesFx: s2.incomesFx.filter(i=>i.id!==incomeId)}));
        else store.setState(s2=>({incomesRsd: s2.incomesRsd.filter(i=>i.id!==incomeId)}));
        store.toast('Uplata je odbačena.');
        return;
      }
      let invoiceId = null, clientId = entry.clientId;
      if(mode==='make_invoice'){
        if(data.clientId){ clientId = data.clientId; }
        else { const client = Clients.create({name:data.clientName, defaultCurrency:entry.currency||'RSD'}); clientId = client.id; }
        const inv = Invoices.create({clientId, currency:entry.currency||'RSD', items:[{desc:data.desc||'Usluge', qty:1, price:entry.amount}], status:'Poslata'});
        invoiceId = inv.id;
      } else if(mode==='existing_invoice'){
        invoiceId = data.invoiceId;
        const inv = s.invoices.find(i=>i.id===invoiceId);
        clientId = inv ? inv.clientId : clientId;
      }
      const patch = {noInvoice:false, clientId, invoiceId};
      if(kind==='fx') store.setState(s2=>({incomesFx: s2.incomesFx.map(i=> i.id===incomeId? Object.assign({},i,patch): i)}));
      else store.setState(s2=>({incomesRsd: s2.incomesRsd.map(i=> i.id===incomeId? Object.assign({},i,patch): i)}));
      if(invoiceId) Invoices.markPaid(invoiceId);
      store.toast('Uplata je povezana. Zbir i limit su ponovo izračunati.');
    },
  };

  // ===================== Prenos dosadašnjeg poslovanja (28. krug, UVOZ_SPECIFIKACIJA.md) =====================
  // IZMIŠLJENI, UVEK ISTI skup od 6 stavki za SVAKI uvoz u prototipu — nema pravog čitanja dokumenata
  // (odeljak 6: "Učitavanje bilo kog fajla daje isti izmišljen skup... Izmišljeni podaci se jasno
  // obeležavaju u kodu"). Tačno primer iz Uv4.dc.html/Uv5.dc.html (5 stavki sa fakturom + 1 bez nje, koja
  // traži proveru). "Bluebird SRL" i "Domaći klijent DOO" NE postoje u Prilogu B (postojeći klijenti su
  // "Bluebird GmbH" itd.) — namerno iz frejma, testira granu "nov klijent se pravi pri uvozu".
  const UVOZ_DEMO_ITEMS = [
    {date:'2026-03-12', client:'Acme Inc.', invoiceNumber:'25/26-01', currency:'EUR', amount:1200},
    {date:'2026-03-28', client:'Northwind Ltd.', invoiceNumber:'25/26-02', currency:'EUR', amount:900},
    {date:'2026-04-14', client:'Bluebird SRL', invoiceNumber:'25/26-03', currency:'EUR', amount:650},
    {date:'2026-05-02', client:'Acme Inc.', invoiceNumber:'25/26-04', currency:'EUR', amount:1200},
    {date:'2026-05-18', client:'Domaći klijent DOO', invoiceNumber:'25/26-05', currency:'RSD', amount:85000},
    {date:'2026-06-03', client:null, invoiceNumber:null, currency:'USD', amount:500, noInvoice:true},
  ];
  // Faza 0 (js/rules/uvoz.js): čista logika (parsiranje, duplikati, izgradnja stavke) sad ima sopstvene
  // testove — ovo je tanak omotač koji iz state-a izvuče samo ono što pravilu treba, i doda "key"
  // (React lista, nije poslovno pravilo pa ne ide u js/rules/).
  function uvozBuildItem(raw, s, U){
    const item = window.AIK.Rules.uvoz.buildItem(raw, s, U.nbsRate, window.AIK.Seed.TODAY);
    return Object.assign({ key: uid('uvi') }, item);
  }
  const Uvoz = {
    // Ulaz (Uv0/PhUv0): dugme u zaglavlju Knjige prihoda i baner otvaraju tok preko celog ekrana (Uv1).
    openEntry(){ store.navigate('app/uvoz'); },
    // Korak 1 (Uv1): podrazumevani datum "Prihodi od" — 12 meseci unazad od danas (spec odeljak 2.1).
    // `.toISOString()` bi ovde pomerio datum za jedan dan unazad u vremenskim zonama ispred UTC
    // (lokalna ponoć postaje prethodni dan u UTC-u) — `U.fmtDate(...,'iso')` čita lokalne get*() delove,
    // bezbedno za čist kalendarski datum bez vremena.
    defaultStartDate(){ const TODAY = window.AIK.Seed.TODAY; const U = window.AIK.Util; return U.fmtDate(U.addMonths(TODAY, -12), 'iso'); },
    // Korak 3 (Uv3): simulirano čitanje — UVEK isti skup, obeleženo gore. Vraća stavke već razrešene
    // protiv TRENUTNOG stanja (postojeći klijenti, duplikati).
    simulateRead(){
      const s = store.getState(); const U = window.AIK.Util;
      return UVOZ_DEMO_ITEMS.map(raw=> uvozBuildItem(raw, s, U));
    },
    // Ručni unos (Uv5): prazan red za tabelu, korisnik popunjava sam.
    emptyManualRow(){ return uvozBuildItem({date:'', client:'', invoiceNumber:'', currency:'EUR', amount:0}, store.getState(), window.AIK.Util); },
    // Ponovo izračunaj IZVEDENA polja (kurs, iznos u dinarima, duplikat, novi-klijent) kad korisnik
    // ručno promeni datum/valutu/iznos/klijenta jednog reda (Uv4 "Uredi stavku" ili Uv5 unos).
    recalcItem(item){
      const s = store.getState(); const U = window.AIK.Util;
      return Object.assign({}, uvozBuildItem({date:item.date, client:item.client, invoiceNumber:item.invoiceNumber, currency:item.currency, amount:item.amount, noInvoice:item.noInvoice}, s, U), {key:item.key, removed:item.removed});
    },
    // Desna kartica "Šta će se promeniti" (Uv4): projektovan limit i sledeći broj fakture BEZ čuvanja
    // (nextInvoiceNumber se poziva nad HIPOTETIČKIM nizom faktura, ne nad pravim stanjem).
    computeSummary(items){
      const s = store.getState();
      const Sel = window.AIK.Selectors, U = window.AIK.Util;
      const active = (items||[]).filter(it=>!it.removed);
      // Limit (Sel.limitInfo) isključuje stavke "Bez fakture" (noInvoice) i sve van poslednjih 365 dana —
      // ovaj projektovani zbir mora da prati ISTO pravilo, inače "Šta će se promeniti"/Uv6 rezime pokazuje
      // veći limit nego što Knjiga prihoda posle čuvanja stvarno prikaže (nađeno u Koraku 6, test "nov
      // nalog od aprila": 601.826 projektovano, 547.995,50 stvarno — razlika je tačno devizna stavka bez
      // fakture iz UVOZ_DEMO_ITEMS).
      const added = window.AIK.Rules.uvoz.projectedLimitAdd(active, window.AIK.Seed.TODAY);
      const current = Sel.limitInfo(s).total;
      const projected = current + added;
      const LIMIT = window.AIK.Rules.limit.LIMIT;
      const hypothetical = Object.assign({}, s, {invoices: s.invoices.concat(active.filter(it=>it.invoiceNumber).map(it=>({number:it.invoiceNumber})))});
      return {
        count: active.length,
        okCount: active.filter(it=>it.status==='ok').length,
        reviewCount: active.filter(it=>it.status==='review').length,
        total12m: projected, pct: Math.round(projected/LIMIT*1000)/10, remaining: Math.max(0, LIMIT-projected),
        nextInvoiceNumber: nextInvoiceNumber(hypothetical),
      };
    },
    // Korak 4 "Potvrdi i sačuvaj" (Uv4) ili Uv5 "Sačuvaj prihode" — JEDINO mesto gde se stvarno piše u
    // Knjigu prihoda (spec 5.1: "Ništa se ne upisuje bez potvrde na ekranu provere"). Pravi klijente za
    // neuparena imena, lagane fakture (imported:true, bez šablona/PDF-a — vidi fakture.js) za stavke sa
    // brojem fakture, upisuje prihod sa source:'Uvoz'.
    commit(items, meta){
      // Stavka bez prepoznatog datuma ne može da uđe u Knjigu prihoda (nema po čemu da se sortira/filtrira
      // po godini), a stavka sa iznosom 0 ili manje nije stvaran prihod — obe se tiho preskaču ovde ako ih
      // korisnik ipak potvrdi nepopravljene (već su označene "Proveri" sa objašnjenjem u uvozBuildItem).
      const active = (items||[]).filter(it=>!it.removed && it.dateIso && it.amount>0);
      if(!active.length) return null;
      const s0 = store.getState();
      const snapshot = JSON.parse(JSON.stringify(s0)); // tačno pre čuvanja — "Resetuj uvoz" (dev meni) ovo vraća
      const newClients = [], newInvoices = [], newFx = [], newRsd = [];
      const newClientsByName = new Map(); // dve stavke istog neuparenog imena u ISTOM uvozu (npr. "Acme Inc."
      // dva puta) dele JEDNOG novog klijenta — bez ovoga svaka stavka pravi sopstvenog (duplikat klijenta),
      // jer se clientId proverava samo protiv stanja OD PRE uvoza, ne protiv onih napravljenih u istoj petlji.
      active.forEach(it=>{
        let clientId = it.clientId;
        if(!clientId && it.client){
          const nameKey = it.client.toLowerCase();
          if(newClientsByName.has(nameKey)){
            clientId = newClientsByName.get(nameKey);
          } else {
            const domestic = it.currency==='RSD';
            const c = {id:uid('c'), name:it.client, country:domestic?'Srbija':'', billingEmail:'', address:'', domestic,
              defaultCurrency:it.currency, defaultLang:domestic?'sr':'en', defaultDueDays:10, defaultAccountId:null, defaultItem:null, autoSend:false, fxMode: domestic?'none':'book_only'};
            newClients.push(c); clientId = c.id;
            newClientsByName.set(nameKey, clientId);
          }
        }
        let invoiceId = null;
        if(it.invoiceNumber){
          const inv = {id:uid('inv'), number:it.invoiceNumber, clientId, currency:it.currency, lang: it.currency==='RSD'?'sr':'en',
            issueDate:it.dateIso, dueDays:0, items:[{desc:'Uvezena stavka', qty:1, price:it.amount}], accountId:null,
            status:'Plaćena', paidDate:it.dateIso, imported:true, note:''};
          newInvoices.push(inv); invoiceId = inv.id;
        }
        const base = {id:uid(it.currency==='RSD'?'incr':'inc'), date:it.dateIso, clientId, invoiceId,
          amount:it.amount, source:'Uvoz', imported:true, docNames:(meta&&meta.docNames)||[], noInvoice:!!it.noInvoice};
        if(it.currency==='RSD') newRsd.push(base);
        else newFx.push(Object.assign({}, base, {currency:it.currency, rate:it.rate}));
      });
      store.setState(s=>({
        clients: s.clients.concat(newClients),
        invoices: s.invoices.concat(newInvoices),
        incomesFx: s.incomesFx.concat(newFx),
        incomesRsd: s.incomesRsd.concat(newRsd),
        importState: Object.assign({}, s.importState, { snapshot,
          history: s.importState.history.concat({id:uid('uvh'), at:new Date().toISOString(), kind:'uvoz', itemsCount:active.length, startDate: (meta&&meta.startDate)||null}) }),
      }));
      store.toast('Prihodi su preneti.');
      return {itemsCount:active.length, newClients:newClients.length};
    },
    // Uv6: akontacije po izboru + obavezna kvačica potvrde kompletnosti (gasi napomenu o tačnosti limita).
    confirmDone(paidPastChoice){
      const s = store.getState();
      if(paidPastChoice==='all' && s.taxDecision){
        const TODAY = window.AIK.Seed.TODAY; const Sel = window.AIK.Selectors; const Porez = window.AIK.Actions.Porez;
        const lastRun = s.importState.history[s.importState.history.length-1];
        const start = (lastRun && lastRun.startDate) ? new Date(lastRun.startDate) : window.AIK.Util.addMonths(TODAY,-12);
        const limitKey = start.getFullYear()+'-'+String(start.getMonth()+1).padStart(2,'0');
        let y = TODAY.getFullYear(), m = TODAY.getMonth()+1, guard = 0;
        while(guard++<24){
          m--; if(m<1){ m=12; y--; }
          const key = y+'-'+String(m).padStart(2,'0');
          if(key < limitKey) break;
          if(!Sel.taxMonthFullyPaid(store.getState(), key)) Porez.markAllPaid(key);
        }
      }
      store.setState(s2=> ({importState: Object.assign({}, s2.importState, {confirmed:true})}));
      store.toast('Hvala, zabeleženo.');
    },
    // Uv1 "Počni od nule": korisnik eksplicitno kaže da nema prethodnih prihoda — isto "uvoz je završen"
    // kao i puna potvrda, samo bez ičega sačuvanog.
    startFromZero(){
      store.setState(s=> ({importState: Object.assign({}, s.importState, {confirmed:true})}));
      store.navigate('app/pocetna');
    },
    // Dev meni: vraća stanje TAČNO pre poslednjeg "Potvrdi i sačuvaj"/"Sačuvaj prihode" (spec odeljak 6).
    resetImport(){
      const s = store.getState();
      if(!s.importState.snapshot){ store.toast('Nema prethodnog uvoza da se vrati.'); return; }
      const snap = s.importState.snapshot;
      store.setState(()=> Object.assign({}, snap, {importState: Object.assign({}, snap.importState, {snapshot:null})}));
      store.toast('Uvoz je vraćen na prethodno stanje.');
    },
    // CSV šablon/učitavanje (6. odeljak: "Šablon je pravi fajl za preuzimanje... učitavanje radi stvarno").
    downloadTemplate(){ window.AIK.Util.downloadTextFile('uvoz-prihoda-sablon.csv', window.AIK.Util.uvozCsvTemplate()); },
    parseCsvText(text){
      const U = window.AIK.Util; const s = store.getState();
      const rows = U.parseUvozCsv(text);
      return rows.map(r=>{
        const d = U.parseSrDateFlexible(r.date);
        const amount = U.parseSrNumber(r.amount);
        return uvozBuildItem({date: d?d.toISOString():'', dateRaw:r.date, client:r.client, invoiceNumber:r.invoiceNumber,
          currency:r.currency||'EUR', amount: isNaN(amount)?0:amount, amountRaw:r.amount}, s, U);
      });
    },
  };

  function bmUpdate(id, patch){ store.setState(s=> ({bankMails: s.bankMails.map(m=> m.id===id? Object.assign({},m,patch): m)})); }
  function bmPushHistory(id, label){
    store.setState(s=> ({bankMails: s.bankMails.map(m=> m.id===id? Object.assign({},m,{history:(m.history||[]).concat({label, at:new Date().toISOString()})}): m)}));
  }

  // Mejlovi banke (7.7, 6.5, 6.6, 8.5): AI pripremi, korisnik odobri (ili je uključena automatska obrada).
  const BankMails = {
    // Knjiži priliv u Knjigu prihoda (8.3: kurs NBS na dan priliva) i označi fakturu plaćenom.
    // Napomena (Kp1/Kp4/Mb3): priliv za jednu fakturu može već biti uknjižen u Knjizi prihoda PRE odobrenja
    // mejla banke (npr. bm1/Acme, bm4/Joam u seed-u) — zato se ovde ne knjiži dupli unos ako već postoji
    // prihod vezan za istu fakturu, nego se samo faktura označava plaćenom.
    _book(mail){
      const s = store.getState();
      const date = mail.receivedAt || new Date().toISOString();
      const already = mail.invoiceId && (mail.kind==='dinarski'
        ? s.incomesRsd.some(i=>i.invoiceId===mail.invoiceId)
        : s.incomesFx.some(i=>i.invoiceId===mail.invoiceId));
      if(!already){
        if(mail.kind==='dinarski'){
          const entry = {id:uid('incr'), date, clientId:mail.clientId, invoiceId:mail.invoiceId||null, amount:mail.amount, source:'Mejl banke'};
          store.setState(s2=> ({incomesRsd: s2.incomesRsd.concat(entry)}));
        } else {
          const rate = window.AIK.Util.nbsRate(date, mail.currency);
          const entry = {id:uid('inc'), date, clientId:mail.clientId, invoiceId:mail.invoiceId||null, currency:mail.currency, amount:mail.amount, rate, source:'Mejl banke'};
          store.setState(s2=> ({incomesFx: s2.incomesFx.concat(entry)}));
        }
      }
      if(mail.invoiceId) Invoices.markPaid(mail.invoiceId);
    },
    // Efektivna podešavanja za klijenta: njegov izuzetak pregazi globalni izbor (7.7). Čista logika je
    // sad u js/rules/autonomy.js (sa testovima) — ovde samo čitanje state-a i poziv.
    effectiveAutoSend(client){
      const s = store.getState();
      return window.AIK.Rules.autonomy.effectiveAutoSend(client, s.autonomySettings);
    },
    effectiveFxMode(client){
      const s = store.getState();
      return window.AIK.Rules.autonomy.effectiveFxMode(client, s.autonomySettings);
    },
    // Ručno odobrenje i slanje banci (Mb4/Mb12). sellPercent je override iz "Promeni iznos", inače se koristi efektivni fxMode.
    // opts: {mode: 'book_only'|'sell_part'|'sell_all' (override; inače efektivni klijent/globalni izbor), sellPercent}
    approveSend(id, opts){
      const s = store.getState();
      const mail = s.bankMails.find(m=>m.id===id); if(!mail) return;
      // 5.5: pauziran AI knjigovođa ne priprema dokumenta ni ne šalje banci u tvoje ime.
      if(window.AIK.Selectors.subscriptionAccess(s).aiPaused){
        store.toast('AI knjigovođa je pauziran. Izaberi plan da nastavi.');
        return {ok:false};
      }
      this._book(mail);
      let fxSale = null;
      if(mail.kind==='devizni'){
        const client = mail.clientId ? s.clients.find(c=>c.id===mail.clientId) : null;
        const mode = (opts && opts.mode) ? opts.mode : this.effectiveFxMode(client);
        const pct = (opts && opts.sellPercent!=null) ? opts.sellPercent : (s.autonomySettings.fxPercent||50);
        const rate = window.AIK.Util.nbsRate(mail.receivedAt, mail.currency);
        fxSale = window.AIK.Rules.autonomy.computeFxSale(mail.amount, mail.currency, mode, pct, rate);
      }
      // 7.7: automatski režim (globalni ili izuzetak po klijentu) dobija status 'Poslato automatski'
      // (isti string kao seed bm2/bm5) umesto ručnog 'Poslato banci' — isto knjiženje, drugačija etiketa.
      const autoSent = !!(opts && opts.auto);
      const label = autoSent ? 'Poslato automatski' : 'Poslato banci';
      bmUpdate(id, {status:label, fxSale});
      bmPushHistory(id, label);
      if(fxSale) bmPushHistory(id, 'Devize prodate');
      if(!autoSent) store.toast('Dokumenta su poslata banci.');
      return {ok:true};
    },
    reject(id){
      store.setState(s=> ({bankMails: s.bankMails.filter(m=>m.id!==id)}));
      store.toast('Mejl je odbačen.');
    },
    // Priliv bez fakture (6.6, Mb6): tri ishoda.
    resolveNoInvoice(id, mode, data){
      const s = store.getState();
      const mail = s.bankMails.find(m=>m.id===id); if(!mail) return;
      if(mode==='reject'){ this.reject(id); return {ok:true}; }
      if(window.AIK.Selectors.subscriptionAccess(s).aiPaused){
        store.toast('AI knjigovođa je pauziran. Izaberi plan da nastavi.');
        return {ok:false};
      }
      let invoiceId = null, resolvedClientId = null;
      if(mode==='make_invoice'){
        if(data.clientId){ resolvedClientId = data.clientId; }
        else { const client = Clients.create({name:data.clientName, defaultCurrency:mail.currency}); resolvedClientId = client.id; }
        const inv = Invoices.create({clientId:resolvedClientId, currency:mail.currency, items:[{desc:data.desc||'Usluge', qty:1, price:mail.amount}], status:'Poslata'});
        invoiceId = inv.id;
        bmUpdate(id, {clientId:resolvedClientId});
      } else if(mode==='existing_invoice'){
        invoiceId = data.invoiceId;
        const inv = s.invoices.find(i=>i.id===invoiceId);
        resolvedClientId = inv?inv.clientId:null;
        bmUpdate(id, {clientId: resolvedClientId});
      }
      // Postojeći "bez fakture" prihod (7.10, Kp10) dobija fakturu i izlazi iz zbira-bez-fakture stanja.
      const match = s.incomesFx.find(i=> i.noInvoice && i.amount===mail.amount && i.currency===mail.currency);
      if(match) store.setState(s2=> ({incomesFx: s2.incomesFx.map(i=> i.id===match.id? Object.assign({},i,{invoiceId, noInvoice:false, clientId: i.clientId||resolvedClientId}): i)}));
      if(invoiceId) Invoices.markPaid(invoiceId);
      bmUpdate(id, {invoiceId, problem:null, status:'Poslato banci'});
      bmPushHistory(id, 'Povezano sa fakturom');
      store.toast('Priliv je povezan. Zbir i limit su ponovo izračunati.');
      return {ok:true};
    },
    // Banka traži nestandardan dokument (6.6, Mb7).
    respondExtraDoc(id){
      bmUpdate(id, {status:'Poslato banci', problem:null});
      bmPushHistory(id, 'Odgovor poslat banci');
      store.toast('Odgovor je poslat banci.');
    },
    updateAutonomy(patch){
      store.setState(s=> ({autonomySettings: Object.assign({}, s.autonomySettings, patch, {sendingSettingsSeen:true})}));
      store.toast('Podešavanja su sačuvana.');
    },
    markSettingsSeen(){ store.setState(s=> ({autonomySettings: Object.assign({}, s.autonomySettings, {sendingSettingsSeen:true})})); },
    // Faza 10 (18. krug): dev meni "Simuliraj novi mejl banke" i onboarding "Čekamo prvi mejl" zovu ovo
    // isto, da bi mejl koji stigne bio stvaran (nova faktura + klijent, ne samo zastavica). kind je
    // 'devizni'|'dinarski'|'no_invoice'. Istekao nalog: mejl se NE dodaje u listu (6.10/5.5, isto kao approveSend).
    simulateNewMail(kind){
      const s = store.getState();
      if(window.AIK.Selectors.subscriptionAccess(s).aiPaused){
        store.toast('AI knjigovođa je pauziran. Novi mejl nije ušao u obradu.');
        return {ok:false};
      }
      const receivedAt = new Date().toISOString();
      let mail, notifBody;
      if(kind==='no_invoice'){
        const names = ['Delta Studio SRL','Nova Vizija d.o.o.','Horizon Partners Ltd.','Silverline GmbH'];
        const senderName = names[Math.floor(Math.random()*names.length)];
        const amount = Math.round((300+Math.random()*1500)*100)/100;
        const amountFmt = window.AIK.Util.fmtNum(amount,2);
        mail = {id:uid('bm'), kind:'problem_no_invoice', amount, currency:'EUR', clientId:null, invoiceId:null,
          sender:'obavestenja@erstebank.rs', replyTo:'devizni.dokumenta@erstebank.rs',
          subject:`Priliv ${amountFmt} EUR, potrebna dokumentacija`,
          status:'Treba mi tvoja pomoć', problem:'no_invoice', senderName, receivedAt,
          body:`Poštovani,\n\nobaveštavamo vas da je na vaš devizni račun evidentiran priliv od ${amountFmt} EUR od pošiljaoca ${senderName}. Molimo da dostavite dokumentaciju na adresu devizni.dokumenta@erstebank.rs.\n\nSrdačan pozdrav,\nErste Bank`};
        notifBody = `Priliv od ${window.AIK.Util.fmtMoney(amount,'EUR')}, pošiljalac ${senderName} — treba mi tvoja pomoć.`;
      } else {
        const domestic = kind==='dinarski';
        const pool = domestic ? ['c5','c7','c8','c9'] : ['c1','c2','c3','c4','c6'];
        const clientId = pool[Math.floor(Math.random()*pool.length)];
        const client = s.clients.find(c=>c.id===clientId);
        const currency = domestic ? 'RSD' : (client.defaultCurrency==='RSD' ? 'EUR' : client.defaultCurrency);
        const amount = domestic ? Math.round(50000+Math.random()*200000) : Math.round((300+Math.random()*2000)*100)/100;
        const inv = Invoices.create({clientId, currency, items:[{desc:(client.defaultItem&&client.defaultItem.desc)||'Usluge', qty:1, price:amount}], status:'Poslata'});
        const amountFmt = window.AIK.Util.fmtNum(amount,2);
        mail = {id:uid('bm'), kind: domestic?'dinarski':'devizni', amount, currency, clientId, invoiceId:inv.id,
          sender:'obavestenja@erstebank.rs', replyTo:'devizni.dokumenta@erstebank.rs',
          subject:`Priliv ${amountFmt} ${currency}, potrebna ${domestic?'faktura':'dokumentacija'}`,
          status:'Čeka tvoje odobrenje', problem:null, receivedAt,
          body: domestic
            ? `Poštovani,\n\nobaveštavamo vas da je na vaš dinarski račun evidentiran priliv od ${amountFmt} RSD od pošiljaoca ${client.name}. Za knjiženje priliva molimo da dostavite fakturu na adresu devizni.dokumenta@erstebank.rs.\n\nSrdačan pozdrav,\nErste Bank, Sektor platnog prometa`
            : `Poštovani,\n\nobaveštavamo vas da je na vaš devizni račun evidentiran priliv od ${amountFmt} ${currency} od pošiljaoca ${client.name}. Radi evidentiranja priliva molimo vas da dostavite fakturu, raspored priliva i nalog za prodaju deviza.\n\nDokumentaciju pošaljite na adresu devizni.dokumenta@erstebank.rs.\n\nSrdačan pozdrav,\nErste Bank, Sektor platnog prometa`};
        notifBody = `Uplata od ${client.name}, ${window.AIK.Util.fmtMoney(amount,currency)}.`;
      }
      store.setState(s2=> ({bankMails: s2.bankMails.concat(mail)}));
      const notif = {id:uid('ntf'), read:false, type:'Novi mejl banke', title:'Stigao je novi mejl banke', body:notifBody, at:receivedAt, route:'app/mejlovi'};
      store.setState(s3=> ({notifications: [notif].concat(s3.notifications)}));
      // 7.7: automatsko slanje (globalno ili izuzetak po klijentu) odmah obrađuje mejl, bez pitanja.
      let autoSent = false;
      if(mail.kind!=='problem_no_invoice'){
        const client = mail.clientId ? s.clients.find(c=>c.id===mail.clientId) : null;
        if(this.effectiveAutoSend(client)){ this.approveSend(mail.id, {auto:true}); autoSent = true; }
      }
      store.toast(autoSent ? 'Stigao je novi mejl banke — poslat automatski banci.' : 'Stigao je novi mejl banke.');
      return {ok:true, id:mail.id, autoSent};
    },
  };

  // Faza 6: Porez i rokovi (6.2, 6.3, 7.8, 8.7).
  const Porez = {
    setPaymentMode(mode){ store.setState({taxPaymentMode: mode}); },
    // 6.2 korak 4/6: čuva rešenje (iz čitanja ili ručnog unosa) i pokreće naredne mesece kao Neplaćeno.
    saveResenje(items, opts){
      const TODAY = window.AIK.Seed.TODAY;
      const s = store.getState();
      store.setState({taxDecision: {
        id:'td'+uid(), year: TODAY.getFullYear(), fileName:(opts&&opts.fileName)||'Resenje_'+TODAY.getFullYear()+'.pdf',
        pib: s.business.pib, addedAt: new Date(TODAY).toISOString(), items,
      }});
      const keys = window.AIK.Selectors.upcomingTaxMonths(store.getState(), 3);
      store.setState(s2=>{
        const taxPayments = Object.assign({}, s2.taxPayments);
        keys.forEach(k=>{ if(!taxPayments[k]) taxPayments[k] = {porez:'Neplaćeno', pio:'Neplaćeno', zdravstveno:'Neplaćeno', nezaposlenost:'Neplaćeno'}; });
        return {taxPayments};
      });
    },
    markPaid(monthKey, itemKey){
      store.setState(s=>{
        const month = Object.assign({}, s.taxPayments[monthKey], {[itemKey]:'Plaćeno'});
        return {taxPayments: Object.assign({}, s.taxPayments, {[monthKey]: month})};
      });
      store.toast('Označeno kao plaćeno.');
    },
    // Pay2/PhPay2: "Poništi" na telefonu vraća stavku u Neplaćeno (desktop nema ovo dugme).
    markUnpaid(monthKey, itemKey){
      store.setState(s=>{
        const month = Object.assign({}, s.taxPayments[monthKey], {[itemKey]:'Neplaćeno'});
        return {taxPayments: Object.assign({}, s.taxPayments, {[monthKey]: month})};
      });
      store.toast('Vraćeno na neplaćeno.');
    },
    markAllPaid(monthKey){
      store.setState(s=>{
        const keys = s.taxDecision.items.map(i=>i.key);
        const month = {}; keys.forEach(k=> month[k]='Plaćeno');
        return {taxPayments: Object.assign({}, s.taxPayments, {[monthKey]: month})};
      });
    },
    // 6.2 korak 8 (PorNov): primeni novo rešenje — zamenjuje iznose, čuva stare uplate netaknute.
    applyNewResenje(items, year){
      const TODAY = window.AIK.Seed.TODAY;
      store.setState(s=> ({taxDecision: Object.assign({}, s.taxDecision, {items, year, addedAt:new Date(TODAY).toISOString()})}));
      store.toast('Novo rešenje je primenjeno.');
    },
  };

  // 7.11: ručni događaji su samo korisnikovi, ne utiču na druge ekrane (Kl1 "Dodaj događaj").
  const Calendar = {
    addEvent(ev){
      const id = uid('ce');
      store.setState(s=> ({calendarEvents: s.calendarEvents.concat([Object.assign({id}, ev)])}));
      store.toast('Događaj je dodat.');
    },
  };

  // ===================== Faza 9: Pretplata (3.12, 5.5, 6.10, 7.14, 8.11) =====================
  // Prototip nema pravo plaćanje (sandbox): forma prihvata bilo koji unos, ishod zavisi od dev
  // prekidača `paymentForceFail`. Forma kartice se NIKAD ne čuva (ni broj, ni rok, ni CVC) — ni u
  // state-u ni u localStorage — samo poslednje 4 cifre i tip, kako Sub9 prikazuje ("Kartica •••• 4417").
  const PLAN_PRICES = { 1:{monthly:29, total:29}, 3:{monthly:27, total:81}, 6:{monthly:25, total:150}, 12:{monthly:23, total:276} };
  const Subscription = {
    PLAN_PRICES,
    // Pojednostavljeno (sandbox, spec 7.14 "[PREDLOG]"): svaka uspešna poseta ovom ekranu — bilo nova
    // pretplata, promena perioda ili samo promena kartice — ponovo naplaćuje punu cenu izabranog
    // perioda od danas i upisuje novi red u istoriju; nema proporcionalnog obračuna.
    confirmCardPayment(period, last4, exp){
      const s = store.getState();
      if(s.dev.paymentForceFail) return {ok:false};
      const TODAY = window.AIK.Seed.TODAY, U = window.AIK.Util;
      const price = PLAN_PRICES[period];
      const hadTrialRow = s.subscription.history.some(h=>h.desc==='Probni period, 30 dana');
      const history = (hadTrialRow ? s.subscription.history : s.subscription.history.concat([
        {id:uid('sh'), date:U.addDays(TODAY,-30).toISOString(), desc:'Probni period, 30 dana', amount:0, currency:'EUR'}]))
        .concat([{id:uid('sh'), date:TODAY.toISOString(), desc:'Pretplata, '+period+' '+U.plural(period,['mesec','meseca','meseci']), amount:price.total, currency:'EUR'}]);
      store.setState(s2=> ({subscription: Object.assign({}, s2.subscription, {
        status:'Aktivna', period, paymentMethod:{type:'card', last4, exp},
        nextChargeAt:U.addMonths(TODAY,period).toISOString(), history, cancelReason:null, accessUntil:null,
      })}));
      return {ok:true};
    },
    // QR nema pravi polling — dev dugme "Simuliraj da je uplata stigla" zove ovo direktno (6.10.6).
    confirmQrPayment(period){
      const s = store.getState();
      const TODAY = window.AIK.Seed.TODAY, U = window.AIK.Util;
      const price = PLAN_PRICES[period];
      const hadTrialRow = s.subscription.history.some(h=>h.desc==='Probni period, 30 dana');
      const history = (hadTrialRow ? s.subscription.history : s.subscription.history.concat([
        {id:uid('sh'), date:U.addDays(TODAY,-30).toISOString(), desc:'Probni period, 30 dana', amount:0, currency:'EUR'}]))
        .concat([{id:uid('sh'), date:TODAY.toISOString(), desc:'Pretplata, '+period+' '+U.plural(period,['mesec','meseca','meseci']), amount:price.total, currency:'EUR'}]);
      store.setState(s2=> ({subscription: Object.assign({}, s2.subscription, {
        status:'Aktivna', period, paymentMethod:{type:'qr'},
        nextChargeAt:U.addMonths(TODAY,period).toISOString(), history, cancelReason:null, accessUntil:null,
      })}));
    },
    // Sub11 "Pokušaj ponovo": isti ishod zavisi od istog dev prekidača.
    retryPayment(){
      const s = store.getState();
      if(s.dev.paymentForceFail) return {ok:false};
      const TODAY = window.AIK.Seed.TODAY, U = window.AIK.Util;
      const period = s.subscription.period;
      const price = PLAN_PRICES[period];
      const history = s.subscription.history.concat([{id:uid('sh'), date:TODAY.toISOString(), desc:'Pretplata, '+period+' '+U.plural(period,['mesec','meseca','meseci']), amount:price.total, currency:'EUR'}]);
      store.setState(s2=> ({subscription: Object.assign({}, s2.subscription, {
        status:'Aktivna', nextChargeAt:U.addMonths(TODAY,period).toISOString(), history,
      })}));
      return {ok:true};
    },
    cancelSubscription(reason){
      store.setState(s=> ({subscription: Object.assign({}, s.subscription, {
        status:'Otkazana', accessUntil: s.subscription.nextChargeAt, nextChargeAt:null, cancelReason: reason||null,
      })}));
      store.toast('Pretplata je otkazana.');
    },
    downloadInvoicePdf(){ store.toast('Račun je preuzet (PDF).'); },
  };

  // ===================== Faza 8: AI knjigovođa (4.1-4.5, 4.8, 6.11, 7.12) =====================
  // Prototip bez pravog modela: odgovori su unapred napisani po scenariju, ali SVI brojevi dolaze
  // iz istih Sel.*/state kao Početna, Fakture, Porez i Kalendar — nikad izmišljeni (4.1, 4.8).
  function aiTodayKey(){
    const T = window.AIK.Seed.TODAY, U = window.AIK.Util;
    return U.monthKey(T)+'-'+String(T.getDate()).padStart(2,'0');
  }
  // "Sada" u prototipu je uvek u okviru fiksnog TODAY-a (isto kao js/mejlovi.js timeAgoHours), nikad
  // pravi sistemski sat — inače bi novi razgovori imali datum van opsega seed podataka (npr. 2024/2025).
  let aiNowOffsetSec = 0;
  function aiNow(){ aiNowOffsetSec += 1; return new Date(window.AIK.Seed.TODAY.getTime() + 16*3600*1000 + aiNowOffsetSec*1000); }
  function aiLogAction(label, undo){
    store.setState(s=> ({aiActions: s.aiActions.concat([{id:uid('aia'), label, at:aiNow().toISOString(), undo: undo||null}])}));
  }

  // Svaki builder je čista funkcija stanja -> sadržaj AI poruke (bez id/at/role). 4.4/4.5/8.4 brojevi.
  const AI_SCENARIOS = {
    limit(s){
      const Sel = window.AIK.Selectors, U = window.AIK.Util;
      const li = Sel.limitInfo(s);
      return { kind:'data', text:`Ove godine si zaradio ${U.fmtInt(li.total,'RSD')}, što je ${U.fmtNum(li.pct,1)} % limita. Ostalo ti je još oko ${U.fmtInt(li.remaining,'RSD')}.`,
        card:{ label:`Do limita od ${U.fmtInt(li.limit,'RSD')}`, value:U.fmtInt(li.remaining,'RSD') },
        note:'Brojevi su iz tvoje knjige prihoda, računato po datumu uplate.',
        buttons:[{label:'Otvori Knjigu prihoda', nav:'app/knjiga'},{label:'Pogledaj kalendar', nav:'app/kalendar'}] };
    },
    'ko-duguje'(s){
      const Sel = window.AIK.Selectors, U = window.AIK.Util;
      const owed = Sel.invoicesOwedToUser(s);
      if(!owed.length) return { kind:'text', text:'Trenutno ti niko ne duguje — sve poslate fakture su plaćene.' };
      const rows = owed.slice(0,5).map(i=> ({label:(i.client?i.client.name:'—')+' · '+i.number, value:U.fmtMoney(U.invoiceTotal(i),i.currency), status:i.effectiveStatus==='Kasni'?`Kasni ${U.lateDays(i,window.AIK.Seed.TODAY)} ${U.dayWord(U.lateDays(i,window.AIK.Seed.TODAY))}`:'Čeka uplatu'}));
      return { kind:'list', text:`${owed.length} ${U.plural(owed.length,['faktura čeka','fakture čekaju','faktura čeka'])} uplatu.`, rows,
        buttons:[{label:'Otvori Fakture', nav:'app/fakture'}] };
    },
    'prijava-inostranstvo'(){
      return { kind:'regulation', text:'Da, prihod od inostranog klijenta ulazi u tvoj prihod i upisuje se u knjigu prihoda po kursu na dan uplate. Već sam ga tako upisao za uplate koje je banka javila.',
        sources:[{title:'Zakon o porezu na dohodak građana', note:'važi 2026.'},{title:'Uputstvo Poreske uprave', note:'2025.'}] };
    },
    'limit-prekoracen'(s){
      const U = window.AIK.Util;
      return { kind:'regulation', text:`Godišnji limit za paušalno oporezivanje je ${U.fmtMoney(6000000,'RSD')}. Ako ga pređeš, gubiš pravo na paušalno oporezivanje od naredne godine i prelaziš u redovno knjigovodstvo — javljam ti čim se približiš na 80% i 90%.`,
        sources:[{title:'Zakon o porezu na dohodak građana', note:'važi 2026.'}] };
    },
    'pdv-prag'(){
      return { kind:'regulation', text:'Prag za obavezan ulazak u sistem PDV-a je 8.000.000 din prometa u poslednjih 12 meseci — to je iznad paušalnog limita, pa ga paušalci retko dostignu dok su paušalci. Javiću ti ako se približiš.',
        sources:[{title:'Zakon o porezu na dodatu vrednost', note:'važi 2026.'}] };
    },
    povracaj(){
      return { kind:'scenario', text:'Postupak zavisi od razloga povraćaja, pa evo oba slučaja.',
        cases:[
          {label:'Slučaj 1', title:'Faktura je bila pogrešna', body:'Izdaš storno fakturu i novu ispravnu. Prihod se smanjuje za vraćeni iznos u mesecu u kom si ga primio.'},
          {label:'Slučaj 2', title:'Dao si popust posle uplate', body:'Evidentiraš povraćaj kao umanjenje prihoda i čuvaš dokaz o dogovoru sa klijentom.'}],
        recommendation:{title:'Moja preporuka', body:'Ako ne želiš da rizikuješ, postupi po prvom slučaju i napravi storno fakturu. Tako ti ostaje jasan trag u knjizi prihoda.'},
        sources:[{title:'Zakon o porezu na dohodak građana', note:'važi 2026.'},{title:'Mišljenje Ministarstva finansija', note:'2025.'}],
        followupQuestion:'Koji je tvoj slučaj? Reci mi pa ti dam tačan postupak.',
        chips:['Pogrešna faktura','Popust posle uplate','Nešto drugo'] };
    },
    'napravi-fakturu'(s, args){
      const client = s.clients.find(c=>c.id==='c1'); // Acme — jedini kvalifikovan klijent u brzim pitanjima (Ak1)
      const item = (args&&args.item) || (client&&client.defaultItem) || {desc:'Usluge', amount:0};
      const number = nextInvoiceNumber(s);
      return { kind:'action', actionKind:'create_invoice', resolved:null,
        text:'Spremio sam nacrt iz profila klijenta. Pregledaj ga pa potvrdi, ništa se ne šalje dok ne kažeš.',
        draft:{ number, badge:'Nacrt', clientId:client?client.id:null, clientName:client?client.name:'—',
          itemDesc:item.desc, amount:item.amount, currency:client?client.defaultCurrency:'EUR', dueDays:client?client.defaultDueDays:7 } };
    },
    'podsetnik-kasne'(s){
      const Sel = window.AIK.Selectors, U = window.AIK.Util;
      const inv = Sel.mostLateInvoice(s);
      if(!inv) return { kind:'text', text:'Trenutno nijedna faktura ne kasni.' };
      return { kind:'reminder', resolved:null, invoiceId:inv.id,
        text:`Faktura ${inv.number} (${inv.client?inv.client.name:'—'}) kasni ${U.lateDays(inv,window.AIK.Seed.TODAY)} ${U.dayWord(U.lateDays(inv,window.AIK.Seed.TODAY))}, ${U.fmtMoney(U.invoiceTotal(inv),inv.currency)}. Spremio sam podsetnik.` };
    },
    // Ak9/PhAk9, brzi panel sa konteksta Knjige prihoda (6.6, Kp10): "Zašto ova uplata nije u zbiru?"
    'zasto-nije-u-zbiru'(s){
      const U = window.AIK.Util;
      const unknown = s.incomesFx.find(i=>i.noInvoice) || s.incomesRsd.find(i=>i.noInvoice);
      if(!unknown) return { kind:'text', text:'Trenutno nemam nijednu uplatu bez fakture — sve ulaze u zbir.' };
      return { kind:'action', actionKind:'link_unknown', resolved:null, incomeId:unknown.id,
        text:`Uplata od ${U.fmtMoney(unknown.amount,unknown.currency||'RSD')} nema fakturu, pa je ne računam u zbir dok je ne povežeš. Hoćeš da napravim fakturu za nju?` };
    },
    offtopic(){
      return { kind:'refusal', text:'Ja sam tvoj knjigovođa, pa pomažem samo oko poslovanja: fakture, uplate, porez, rokovi i propisi za paušalce. Za ovo pitanje nisam prava adresa.',
        suggestions:['Šta moram da platim sledeće?','Ko mi duguje novac?','Napravi fakturu'] };
    },
  };

  function matchScenario(text){
    const t = (text||'').toLowerCase();
    if(/koliko (sam )?(zaradio|do limita)|limit.*(zaradio|ostvar)/.test(t)) return 'limit';
    if(/duguje/.test(t)) return 'ko-duguje';
    if(/(inostran|nemačk).*(prijav|priliv)|prijavljujem priliv/.test(t)) return 'prijava-inostranstvo';
    if(/pređem limit|premaš.*limit/.test(t)) return 'limit-prekoracen';
    if(/pdv/.test(t)) return 'pdv-prag';
    if(/vratio|povraćaj|povrat.*novc/.test(t)) return 'povracaj';
    if(/napravi fakturu|fakturu za acme/.test(t)) return 'napravi-fakturu';
    if(/podsetnik.*kasn|kasne fakture/.test(t)) return 'podsetnik-kasne';
    if(/zašto.*(zbir|zbiru)|nije u zbiru/.test(t)) return 'zasto-nije-u-zbiru';
    return 'offtopic';
  }

  const AI = {
    matchScenario, AI_SCENARIOS,
    newConversation(){
      const id = uid('conv');
      store.setState(s=> ({conversations: [{id, title:'Novi razgovor', updatedAt:aiNow().toISOString(), messages:[]}].concat(s.conversations), activeConversationId:id}));
      store.navigate('app/ai/'+id);
      return id;
    },
    openConversation(id){ store.setState({activeConversationId:id}); store.navigate('app/ai/'+id); },
    renameConversation(id, title){ store.setState(s=>({conversations: s.conversations.map(c=>c.id===id?Object.assign({},c,{title}):c)})); store.toast('Razgovor je preimenovan.'); },
    copyConversation(id){
      const s = store.getState(); const c = s.conversations.find(x=>x.id===id); if(!c) return;
      const copy = Object.assign({}, c, {id:uid('conv'), title:c.title+' (kopija)', updatedAt:aiNow().toISOString()});
      store.setState(s2=>({conversations:[copy].concat(s2.conversations)}));
      store.toast('Razgovor je kopiran.');
    },
    exportPdf(){ store.toast('Razgovor je izvezen kao PDF.'); },
    deleteConversation(id){
      store.setState(s=>{
        const conversations = s.conversations.filter(c=>c.id!==id);
        const activeConversationId = s.activeConversationId===id ? null : s.activeConversationId;
        return {conversations, activeConversationId};
      });
      store.toast('Razgovor je obrisan.');
      store.navigate('app/ai');
    },
    // 5.5, Ak14: kvota se broji samo u probnom periodu.
    // Ak12: odgovor stiže sa simuliranim kašnjenjem (~1.2s, kao frejm) — prvo se ubaci
    // 'loading' poruka, pa se posle timeout-a zameni stvarnim sadržajem (isti id, da UI ne skoči).
    sendMessage(conversationId, text, attachment){
      const s = store.getState();
      if(window.AIK.Selectors.subscriptionAccess(s).aiPaused) return {ok:false, reason:'paused'};
      const quota = window.AIK.Selectors.aiQuotaInfo(s);
      if(quota.exhausted) return {ok:false, reason:'quota'};
      const userMsg = {id:uid('msg'), role:'user', at:aiNow().toISOString(), text: text||undefined, attachment: attachment||undefined};
      const loadingId = uid('msg');
      const loadingMsg = {id:loadingId, role:'ai', at:aiNow().toISOString(), kind:'loading'};
      store.setState(s2=>{
        const todayKey = aiTodayKey();
        const prevQuota = s2.aiQuota && s2.aiQuota.date===todayKey ? s2.aiQuota.used : 0;
        return {
          conversations: s2.conversations.map(c=> c.id===conversationId
            ? Object.assign({}, c, {messages:c.messages.concat([userMsg, loadingMsg]), updatedAt:aiNow().toISOString(),
                title: (c.messages.length===0 && text) ? text.slice(0,60) : c.title})
            : c),
          aiQuota: {date:todayKey, used:prevQuota+1},
        };
      });
      setTimeout(()=>{
        const s3 = store.getState();
        let aiMsg;
        if(s3.dev.aiForceError){
          aiMsg = {id:loadingId, role:'ai', at:aiNow().toISOString(), kind:'error'};
        } else if(attachment){
          aiMsg = Object.assign({id:loadingId, role:'ai', at:aiNow().toISOString()}, buildAttachmentMessage(s3));
        } else {
          const scenarioId = matchScenario(text);
          const builder = AI_SCENARIOS[scenarioId];
          aiMsg = Object.assign({id:loadingId, role:'ai', at:aiNow().toISOString(), scenarioId}, builder(s3));
        }
        store.setState(s4=> ({
          conversations: s4.conversations.map(c=> c.id!==conversationId ? c : Object.assign({}, c, {
            messages: c.messages.map(m=> m.id===loadingId ? aiMsg : m) })),
        }));
      }, 1200);
      return {ok:true};
    },
    retry(conversationId, messageId){
      const s = store.getState();
      const conv = s.conversations.find(c=>c.id===conversationId); if(!conv) return;
      const idx = conv.messages.findIndex(m=>m.id===messageId);
      const prevUser = idx>0 ? conv.messages[idx-1] : null;
      store.setState(s2=> ({conversations: s2.conversations.map(c=> c.id!==conversationId ? c : Object.assign({}, c, {
        messages: c.messages.filter(m=>m.id!==messageId && !(prevUser && m.id===prevUser.id)) }))}));
      if(prevUser && prevUser.role==='user') AI.sendMessage(conversationId, prevUser.text, prevUser.attachment);
    },
    rate(conversationId, messageId, useful, reason, comment){
      store.setState(s=> ({conversations: s.conversations.map(c=> c.id!==conversationId ? c : Object.assign({}, c, {
        messages: c.messages.map(m=> m.id===messageId ? Object.assign({}, m, {feedback:{useful, reason:reason||null, comment:comment||null}}) : m) }))}));
      store.toast(useful?'Hvala na oceni.':'Hvala, uzeću u obzir.');
    },
    // Radnja iz kartice odgovora (Ak5/Ak7/Ak11): izvršava se TEK na klik, nikad sama (4.1, 7.12).
    runMessageAction(conversationId, messageId, action, payload){
      payload = payload || {};
      const s = store.getState();
      const conv = s.conversations.find(c=>c.id===conversationId); if(!conv) return;
      const msg = conv.messages.find(m=>m.id===messageId); if(!msg) return;
      // 5.5: dok je AI knjigovođa pauziran, ne priprema fakture/podsetnike/knjiženje u tvoje ime —
      // "dismiss" (samo zatvori karticu) ostaje dozvoljen, ne radi ništa u tvoje ime.
      if(action!=='dismiss' && window.AIK.Selectors.subscriptionAccess(s).aiPaused){
        store.toast('AI knjigovođa je pauziran. Izaberi plan da nastavi.');
        return;
      }
      function resolve(patch){
        if(payload.itemIdx!=null) patch = Object.assign({}, patch, {itemResolved: Object.assign({}, msg.itemResolved, {[payload.itemIdx]: (patch.resolved||patch.rowResolved&&'done')||'done'})});
        store.setState(s2=> ({conversations: s2.conversations.map(c=> c.id!==conversationId ? c : Object.assign({}, c, {
          messages: c.messages.map(m=> m.id===messageId ? Object.assign({}, m, patch) : m) }))}));
      }
      if(action==='create_invoice'){
        const d = msg.draft;
        const inv = Invoices.create({clientId:d.clientId, currency:d.currency, dueDays:d.dueDays, items:[{desc:d.itemDesc, qty:1, price:d.amount}], status:'Nacrt', number:d.number});
        aiLogAction('Napravio nacrt fakture '+d.number, {label:'Vrati', run:()=> Invoices.remove(inv.id)});
        resolve({resolved:'created', invoiceId:inv.id});
        store.toast('Nacrt fakture je napravljen.');
      } else if(action==='discard_invoice'){
        resolve({resolved:'discarded'});
      } else if(action==='send_reminder'){
        Invoices.sendReminder(payload.invoiceId||msg.invoiceId);
        aiLogAction('Poslao podsetnik za fakturu');
        resolve({resolved:'sent'});
      } else if(action==='book_unknown'){
        Income.linkNoInvoice(payload.incomeId, 'make_invoice', {clientName:'Nepoznat pošiljalac'});
        aiLogAction('Dodao nepoznatu uplatu u knjigu prihoda', {label:'Vrati', run:()=> Income.remove(payload.incomeId,'fx')});
        resolve({rowResolved: Object.assign({}, msg.rowResolved, {[payload.incomeId]:'booked'})});
      } else if(action==='link_invoice'){
        Income.linkNoInvoice(payload.incomeId, 'existing_invoice', {invoiceId:payload.invoiceId});
        aiLogAction('Povezao uplatu sa fakturom');
        resolve({rowResolved: Object.assign({}, msg.rowResolved, {[payload.incomeId]:'linked'})});
      } else if(action==='mark_tax_paid'){
        window.AIK.Actions.Porez.markAllPaid(payload.monthKey);
        aiLogAction('Označio porez kao plaćen');
        resolve({resolved:'done'});
      } else if(action==='dismiss'){
        resolve({});
      }
    },
    maybeTriggerProactive,
  };

  function buildAttachmentMessage(s){
    const U = window.AIK.Util;
    const known = s.incomesFx.filter(i=> !i.noInvoice).slice(-2);
    const unknown = s.incomesFx.find(i=>i.noInvoice);
    const rows = known.map(i=>{ const c = s.clients.find(x=>x.id===i.clientId); return {label:c?c.name:'—', sub:U.fmtDate(i.date), amount:U.fmtMoney(i.amount,i.currency), known:true}; });
    if(unknown) rows.push({label:'Nepoznata uplata', sub:U.fmtDate(unknown.date), amount:U.fmtMoney(unknown.amount,unknown.currency), known:false, incomeId:unknown.id});
    return { kind:'attachment', text:`Pročitao sam izvod. ${known.length} ${U.plural(known.length,['uplata je','uplate su','uplata je'])} već u tvojoj knjizi prihoda${unknown?', a jednu nemam':''}.`, rows, rowResolved:{} };
  }

  // Ak11, 7.12 "Proaktivni AI": isti izvori kao Početna "Čeka tebe" — nikad nova logika na drugom mestu.
  function buildProactiveItems(s){
    const Sel = window.AIK.Selectors, U = window.AIK.Util;
    const items = [];
    const unknown = s.incomesFx.find(i=>i.noInvoice);
    if(unknown) items.push({ title:`Uplata bez fakture, ${U.fmtMoney(unknown.amount,unknown.currency)}`,
      body:`Stigla je ${U.fmtDate(unknown.date)} i nema fakturu, pa je ne računam u zbir.`,
      buttons:[{label:'Napravi fakturu', action:'book_unknown', payload:{incomeId:unknown.id}},{label:'Poveži', action:'link_invoice_prompt', payload:{incomeId:unknown.id}}] });
    const lateInv = Sel.mostLateInvoice(s);
    if(lateInv) items.push({ title:`Faktura ${lateInv.number} kasni ${U.lateDays(lateInv,window.AIK.Seed.TODAY)} ${U.dayWord(U.lateDays(lateInv,window.AIK.Seed.TODAY))}`,
      body:`${lateInv.client?lateInv.client.name:'—'} nije platio ${U.fmtMoney(U.invoiceTotal(lateInv),lateInv.currency)}. Spremio sam podsetnik.`,
      buttons:[{label:'Pošalji podsetnik', action:'send_reminder', payload:{invoiceId:lateInv.id}},{label:'Kasnije', action:'dismiss'}] });
    const taxKey = Sel.currentMonthKey();
    if(!Sel.taxMonthFullyPaid(s, taxKey)){
      const due = Sel.taxDueDate(taxKey), days = U.daysDiff(due, window.AIK.Seed.TODAY);
      items.push({ title: days<=0 ? 'Rok za porez je danas' : `Rok za porez za ${days} ${U.dayWord(days)}`,
        body:`Akontacija ${U.fmtDate(due)} iznosi ${U.fmtMoney(Sel.taxMonthlyTotal(s),'RSD')}. Uplatnica je spremna.`,
        buttons:[{label:'Prikaži uplatnicu', nav:'app/porez/plati/'+taxKey}] });
    }
    return items.slice(0,3);
  }
  function maybeTriggerProactive(){
    const U = window.AIK.Util;
    const s = store.getState();
    const todayKey = aiTodayKey();
    if(s.aiProactiveShownDate===todayKey) return null;
    const items = buildProactiveItems(s);
    if(!items.length) return null;
    const id = uid('conv');
    // 27. krug (završna provera, Korak 3): isto hardkodovano ime kao Greeting (ai.js) — ispravljeno
    // na isti način, iz s.user.name.
    const name = s.user && s.user.name ? U.firstNameVoc(s.user.name) : 'Stefane';
    const msg = {id:uid('msg'), role:'ai', at:aiNow().toISOString(), kind:'proactive', scenarioId:'proactive',
      text:'Zdravo '+name+'. Dok te nije bilo, primetio sam '+(items.length===1?'jednu stvar':items.length+' '+U.plural(items.length,['stvar','stvari','stvari']))+':', items};
    store.setState(s2=> ({
      conversations: [{id, title:'Primetio sam '+(items.length===1?'jednu stvar':items.length+' '+U.plural(items.length,['stvar','stvari','stvari'])), updatedAt:aiNow().toISOString(), proactive:true, messages:[msg]}].concat(s2.conversations),
      aiProactiveShownDate: todayKey,
    }));
    return id;
  }

  // ===================== Faza 11: Admin (Korak 4, ADMIN_SPEC 4.3) =====================
  const Admin = {
    // "Nalog dobija status 'Admin besplatno'... ne ulazi u Ukupno/pilule/MRR... radnja se upisuje u
    // dnevnik." Pomera nalog iz adminData.users (128-pool) u adminData.freeAccess, čuvajući njegov
    // prethodni status/plan da bi "Ukini" (van obima ovog koraka) kasnije mogao da ga vrati.
    grantFreeAccess({userId, untilIso, note}){
      const s = store.getState();
      const user = s.adminData.users.find(u=>u.id===userId);
      if(!user) return;
      const TODAY = window.AIK.Seed.admin ? new Date(window.AIK.Seed.admin.TODAY) : new Date();
      const entry = Object.assign({}, user, {
        status:'besplatno', plan:'Besplatan pristup', badge:'Admin, besplatno',
        nextBilling: untilIso ? U_fmtAdmin(untilIso) : 'Bez roka',
        note: note||'', priorStatus:user.status, priorPlan:user.plan, priorBadge:user.badge, priorNextBilling:user.nextBilling,
      });
      const logEntry = { id:'log-'+uid('x'), at:TODAY.toISOString(), action:'Odobren besplatan pristup', user:user.name,
        detail: untilIso ? 'Pun plan, do '+U_fmtAdmin(untilIso) : 'Pun plan, bez roka', cat:'besplatan' };
      store.setState(s2=> ({
        adminData: Object.assign({}, s2.adminData, {
          users: s2.adminData.users.filter(u=>u.id!==userId),
          freeAccess: s2.adminData.freeAccess.concat([entry]),
          log: [logEntry].concat(s2.adminData.log),
        }),
      }));
      store.toast('Besplatan pristup je odobren.');
    },
    // Round 30, nalaz 5: "Ukini pristup... proveri da se vraća prethodno stanje" — vraća priorStatus/
    // priorPlan/priorBadge/priorNextBilling sačuvane u grantFreeAccess, iz adminData.freeAccess nazad u
    // adminData.users (suprotno kretanje od grantFreeAccess).
    revokeFreeAccess(userId){
      const s = store.getState();
      const entry = s.adminData.freeAccess.find(u=>u.id===userId);
      if(!entry) return;
      const TODAY = window.AIK.Seed.admin ? new Date(window.AIK.Seed.admin.TODAY) : new Date();
      const restored = Object.assign({}, entry, {
        status: entry.priorStatus, plan: entry.priorPlan, badge: entry.priorBadge, nextBilling: entry.priorNextBilling,
      });
      delete restored.priorStatus; delete restored.priorPlan; delete restored.priorBadge; delete restored.priorNextBilling; delete restored.note;
      const logEntry = { id:'log-'+uid('x'), at:TODAY.toISOString(), action:'Ukinut besplatan pristup', user:entry.name,
        detail:'Vraćeno prethodno stanje: '+entry.priorStatus, cat:'besplatan' };
      store.setState(s2=> ({
        adminData: Object.assign({}, s2.adminData, {
          freeAccess: s2.adminData.freeAccess.filter(u=>u.id!==userId),
          users: s2.adminData.users.concat([restored]),
          log: [logEntry].concat(s2.adminData.log),
        }),
      }));
      store.toast('Besplatan pristup je ukinut, prethodno stanje je vraćeno.');
    },
  };
  function U_fmtAdmin(iso){ const d=new Date(iso); return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+d.getFullYear()+'.'; }

  window.AIK = window.AIK || {};
  window.AIK.Actions = { Auth, Dev, Onboarding, Business, Settings, Invoices, Clients, Recurring, Templates, Income, BankMails, Porez, Calendar, Subscription, AI, Uvoz, Admin };
})();
