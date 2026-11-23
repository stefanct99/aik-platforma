// Centralni store prototipa. Nema pravog backenda: sve je u stanju, uz localStorage da se ne gubi
// napredak dok Stefan testira. Dev meni (7.x) menja stanje naloga direktno, bez pravih poziva.
(function(){
  const Seed = window.AIK.Seed;
  // v4: šema bankMails/calendarEvents/conversations se promenila od v3 — stari zapisi bi davali NaN datume.
  // v5 (26. krug): invoiceTemplates šema dobila blockProps/table/doc/assignRule i 2 nova šablona (t4/t5) —
  // stari zapisi (plitko spajanje) bi ostavili invoiceTemplates BEZ tih polja i srušili editor šablona
  // (TypeError na tpl.blockProps[...]) i InvoiceDoc svuda gde se koristi. Bump prisiljava čist freshState().
  // v6 (28. krug, Prenos dosadašnjeg poslovanja): nov top-level `importState` + novi (SAMO dodatni,
  // opcioni) `source:'Uvoz'`/`imported`/`docNames` na postojećim incomesFx/incomesRsd/invoices stavkama.
  // Za razliku od v4→v5 (čisto brisanje), ovde je migracija: `load()` ispod, kad nema zapisa pod novim
  // ključem, čita STARI v5 zapis i plitko ga spaja preko freshState() — postojeće fakture/klijenti/
  // podešavanja se zadržavaju, a nedostajući `importState` se bezbedno popuni podrazumevanom vrednošću
  // (nijedan kod ne čita ta polja bez zaštite, pa nema belog ekrana).
  const STORAGE_KEY = 'aik_proto_v6';
  const PREV_STORAGE_KEY = 'aik_proto_v5';

  // Redosled i uključenost blokova šablona fakture (7.6). blocksOff drži isključene.
  // blockProps/table/doc (26. krug, Korak 2): JSON struktura pozicija/osobina blokova, da bi editor,
  // pregled fakture i "PDF" (ista InvoiceDoc komponenta) crtali iz JEDNOG izvora (spec 7.6, zahtev korisnika).
  // Pozicije (x/y/w/h) su autorski izabrane da rekreiraju POSTOJEĆI odobreni izgled fakture (padding:32,
  // gap:20/16 iz postojećeg .inv-doc/.row-split CSS-a) — frejm (Fak18/24) pokazuje stvarnu vrednost SAMO za
  // jedan izabrani blok u jednom trenutku (Podaci o tvojoj firmi: X 238, Y 96, Širina 212, Visina 232 — ovo
  // JESTE iskorišćeno tačno ovde za 'firma'), ne za svih 11 istovremeno — to frejm statički ne može pokazati.
  window.AIK.DEFAULT_TEMPLATE = {
    blocks: ['logo','datum','broj','klijent','firma','banka','stavke','ukupno','rok','napomena','potpis'],
    blocksOff: [],
    layout: 'klasican',
    accentColor: '#0F2A22',
    blockProps: {
      logo:     {x:32,  y:32,  w:44,  h:44,  align:'left',  size:'normal', color:'#161A17', font:'Arial', bg:false, border:false},
      datum:    {x:300, y:44,  w:116, h:20,  align:'right', size:'normal', color:'#161A17', font:'Arial', bg:false, border:false},
      broj:     {x:32,  y:96,  w:190, h:24,  align:'left',  size:'normal', color:'#161A17', font:'Arial', bg:false, border:false},
      klijent:  {x:32,  y:128, w:190, h:150, align:'left',  size:'normal', color:'#161A17', font:'Arial', bg:false, border:false},
      firma:    {x:238, y:96,  w:212, h:232, align:'right', size:'normal', color:'#161A17', font:'Arial', bg:false, border:false},
      banka:    {x:32,  y:348, w:416, h:80,  align:'left',  size:'normal', color:'#161A17', font:'Arial', bg:false, border:false},
      stavke:   {x:32,  y:448, w:416, h:110, align:'left',  size:'normal', color:'#161A17', font:'Arial', bg:false, border:false},
      ukupno:   {x:32,  y:578, w:416, h:42,  align:'left',  size:'normal', color:'#161A17', font:'Arial', bg:false, border:false},
      rok:      {x:32,  y:628, w:300, h:18,  align:'left',  size:'normal', color:'#161A17', font:'Arial', bg:false, border:false},
      napomena: {x:32,  y:648, w:300, h:16,  align:'left',  size:'normal', color:'#161A17', font:'Arial', bg:false, border:false},
      potpis:   {x:332, y:658, w:84,  h:18,  align:'right', size:'manji', color:'#161A17', font:'Arial', bg:false, border:false},
    },
    table: {cols:['opis','iznos'], lines:'horizontalne', density:'normalno', zebra:false, headerColor:'#ffffff'},
    doc: {titleFont:'Inter', textFont:'Arial', margins:'srednje', topBar:false, sideBar:false, watermark:'bez', footerText:'', logoSize:'srednji', logoShape:'kvadrat'},
    assignRule: null,
  };
  // Raspored-presete (Fak24 "Raspored" dijalog): Moderan rezervise traku sa strane, Kompaktan traku na vrhu
  // (oba inferirana direktno iz NAZIVA opcije u frejmu — "traka sa strane"/"traka na vrhu" — koristeći VEĆ
  // postojeći doc.topBar/sideBar prekidač iz Cela-faktura panela, ne izmišljajući nov vizuelni jezik).
  // Minimalan nema frejm-osnovu za drugačiji raspored od Klasičnog pa ostaje identičan (iskreno, ne izmišljeno).
  function shiftPositions(base, dx, dy){
    const out = {};
    Object.keys(base).forEach(k=>{ out[k] = {x:base[k].x+dx, y:base[k].y+dy, w:base[k].w, h:base[k].h}; });
    return out;
  }
  const BASE_POS = {}; Object.keys(window.AIK.DEFAULT_TEMPLATE.blockProps).forEach(k=>{ const p=window.AIK.DEFAULT_TEMPLATE.blockProps[k]; BASE_POS[k]={x:p.x,y:p.y,w:p.w,h:p.h}; });
  // Pomeraj samo dovoljno da traka ne preklopi sadržaj (traka je tanka, 10px) — veći pomeraj bi gurnuo
  // donje blokove (rok/napomena/potpis) preko 680px visine platna, van vidljivog dela (uživo provereno).
  window.AIK.TEMPLATE_LAYOUTS = {
    klasican:  { topBar:false, sideBar:false, positions: BASE_POS },
    moderan:   { topBar:false, sideBar:true,  positions: shiftPositions(BASE_POS, 14, 0) },
    minimalan: { topBar:false, sideBar:false, positions: BASE_POS },
    kompaktan: { topBar:true,  sideBar:false, positions: BASE_POS },
  };

  function cloneTpl(overrides){ return Object.assign(JSON.parse(JSON.stringify(window.AIK.DEFAULT_TEMPLATE)), overrides); }

  function freshState(){
    return {
      theme: 'system', lang: 'sr', dateFormat: 'dd.mm.yyyy.',
      route: 'login',
      toast: null,
      devMenuOpen: false,
      session: {
        // Faza 10, deveti krug, korak 0: podrazumevano stanje predstavlja POSTOJEĆI, već završen nalog iz
        // seed podataka (Seed.business ima popunjenu firmu/PIB/rešenje/fakture) — onboardingComplete:false
        // ovde je značilo da PRIJAVA na postojeći nalog uvek vodi nazad u onboarding (7.1/6.1 kažu suprotno:
        // prijava vodi u aplikaciju, onboarding samo ako stvarno nije završen). Register() dole i dalje
        // eksplicitno postavlja false/1 za STVARNO nov nalog, pa ovo ne utiče na tu putanju.
        loggedIn: false, emailVerified: false, emailForVerify: '', loginAttempts:0, lockedUntil:null,
        onboardingStep: 4, onboardingComplete: true, pendingMagicEmail:null, pendingResetEmail:null,
        tourSeen: false, tourStep: 0,
      },
      accountStatePreset: 'new', // samo oznaka za dev meni prikaz
      dev: { limitOverridePct: null, welcomeSeen: false, aiForceError: false, aiForceQuotaFull: false, paymentForceFail: false, styleAudit: null, cssDuplicateAudit: null },
      user: JSON.parse(JSON.stringify(Seed.user)),
      business: JSON.parse(JSON.stringify(Seed.business)),
      accounts: JSON.parse(JSON.stringify(Seed.accounts)),
      clients: JSON.parse(JSON.stringify(Seed.clients)),
      invoices: JSON.parse(JSON.stringify(Seed.invoices)),
      recurring: JSON.parse(JSON.stringify(Seed.recurring)),
      incomesFx: JSON.parse(JSON.stringify(Seed.incomesFx)),
      incomesRsd: JSON.parse(JSON.stringify(Seed.incomesRsd)),
      taxDecision: JSON.parse(JSON.stringify(Seed.taxDecision)),
      taxPayments: JSON.parse(JSON.stringify(Seed.taxPayments)),
      taxPaymentMode: 'manual', // 'manual' | 'trajni_nalog' — 6.3 korak 4: menja "Plati" u "Automatski iz banke"
      bankMails: JSON.parse(JSON.stringify(Seed.bankMailTemplates)),
      subscription: JSON.parse(JSON.stringify(Seed.subscription)),
      // Round 30, nalaz 5 (ADMIN_SPEC 6): besplatan pristup na stvarnom nalogu — {noEnd:true} ili
      // {untilIso} ili null. Sel.subscriptionAccess ga čita i daje prednost nad state.subscription.
      freeAccess: null,
      notifications: JSON.parse(JSON.stringify(Seed.notifications)),
      // Round 30, nalaz 2 (spec 8.4, "Praćenje: 80%/90%/100%"): najviši prag za koji je obaveštenje VEĆ
      // poslato (null/80/90/100) — "svaki prag se prikazuje samo jednom po prelasku" znači da se
      // obaveštenje (zvonce) šalje jednom po pragu, ne na svaki prikaz banera (baner ostaje trajno
      // vidljiv dok uslov važi, kao i ostale trake stanja — Actions.Business.checkLimitThreshold).
      limitNotifTier: null,
      calendarEvents: JSON.parse(JSON.stringify(Seed.calendarEvents||[])), // 7.11: ručni događaji, samo korisnikovi
      conversations: JSON.parse(JSON.stringify(Seed.conversations||[])),
      activeConversationId: null,
      aiQuota: { date: null, used: 0 }, // 5.5, Ak14: probni period 20 poruka dnevno
      aiActions: [], // Ak8 "Šta sam radio": svaka radnja AI u ime korisnika (4.1, 4.6)
      aiProactiveShownDate: null, // Ak11: najviše jedna proaktivna poruka dnevno
      autonomySettings: {
        globalMode: 'ask', // 'ask' | 'auto'
        fxMode: 'book_only', // 'book_only' | 'sell_part' | 'sell_all'
        fxPercent: 50,
        sendingSettingsSeen: true, // Mb9 prvo-podešavanje dijalog se prikazuje samo dok je ovo false
      },
      notifSettings: {
        rokovi:{mail:true, push:true}, kasne:{mail:true, push:true}, mejl:{mail:true, push:true},
        primetio:{mail:true, push:false}, propisi:{mail:true, push:false}, nedeljni:{mail:false, push:false},
      },
      // 5 šablona, tačno po padajućem izboru u Fak27 (redosled identičan frejmu). Pravila dodele (assignRule)
      // su autorski izabrana (frejm pokazuje samo NAZIVE šablona, ne stvarna pravila) iz postojećih seed
      // dimenzija (client.domestic, invoice.currency/lang) — "Moj izgled" je podrazumevani (assignRule:null).
      invoiceTemplates: [
        cloneTpl({id:'t1', name:'Moj izgled', isDefault:true, assignRule:null}),
        cloneTpl({id:'t2', name:'Srpski, dinarske fakture', isDefault:false, assignRule:{lang:'sr'}}),
        cloneTpl({id:'t4', name:'Domaći klijenti (RSD)', isDefault:false, assignRule:{domestic:true}}),
        cloneTpl({id:'t3', name:'Minimalan, engleski', isDefault:false, assignRule:{lang:'en'}, layout:'minimalan', blocksOff:['potpis']}),
        cloneTpl({id:'t5', name:'Klijenti u USD', isDefault:false, assignRule:{currency:'USD'}}),
      ],
      activeTemplateId: 't1',
      // Prenos dosadašnjeg poslovanja (28. krug, UVOZ_SPECIFIKACIJA.md). `confirmed` je ILI Uv6-ova
      // obavezna kvačica ("Potvrđujem da su uneti svi moji prihodi...") ILI "Počni od nule" (korisnik
      // eksplicitno kaže da nema šta da uveze) — oba jednako znače "uvoz je završen": krije baner/karticu
      // (korisnikovo uputstvo za Ulaz) i gasi napomenu o tačnosti limita (spec odeljak 4). `history` je
      // dnevnik uvoza (5.5: "uvoz može da se pokrene više puta, dodaje stavke, ne briše postojeće";
      // brisanje stavke iz uvoza se takođe beleži, videti Income.remove). `snapshot` je stanje TAČNO pre
      // poslednjeg čuvanja — dev-meni "Resetuj uvoz" ga vraća (najpouzdaniji način da se "vrati prethodno
      // stanje" iz 6. odeljka specifikacije, bez krhkog ručnog uklanjanja svake kreirane stavke/klijenta/
      // fakture pojedinačno).
      importState: { confirmed:false, history:[], snapshot:null },
      // Faza 11 (Admin): Prilog B agregati, videti napomenu uz Sel.adminOverview/seed.js.
      adminData: JSON.parse(JSON.stringify(Seed.admin)),
    };
  }

  function load(){
    try{
      let raw = localStorage.getItem(STORAGE_KEY);
      let migrated = false;
      if(!raw){
        // Migracija v5→v6: stari zapis postoji pod prethodnim ključem — prenesi ga umesto da počneš
        // iznova (korisnikov zahtev, 28. krug: "sa migracijom, da ne dođe do belog ekrana").
        const prevRaw = localStorage.getItem(PREV_STORAGE_KEY);
        if(prevRaw){ raw = prevRaw; migrated = true; }
      }
      if(raw){
        const parsed = JSON.parse(raw);
        const merged = Object.assign(freshState(), parsed);
        // Faza 11: adminData je dobijao nova polja korak po korak (overview → +users/freeAccess/log
        // Korak 3-4 → +supportTickets Korak 6) — plitko spajanje gore (Object.assign na NAJVIŠEM nivou)
        // bi zadržalo STARI (nepotpuni) adminData iz localStorage-a i srušilo Admin ekrane čim zatreba
        // polje koje stari zapis nema. Umesto da gađamo svako polje posebno (isti bag bi se ponovio pri
        // sledećem dodatku), plitko spoji FRESH adminData i persisted na JEDAN nivo dublje: persisted
        // pobeđuje za polja koja ima (čuva stvarne admin radnje — dodeljen pristup, upisan dnevnik), a
        // fresh popunjava bilo šta što stari zapis nikad nije imao.
        if(!merged.adminData){ merged.adminData = freshState().adminData; }
        else { merged.adminData = Object.assign({}, freshState().adminData, merged.adminData); }
        if(migrated){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); }catch(e){} }
        return merged;
      }
    }catch(e){}
    return freshState();
  }

  let state = load();
  const listeners = new Set();

  function persist(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
  }
  function notify(){ listeners.forEach(fn=>fn()); persist(); }

  const store = {
    getState(){ return state; },
    setState(patch){
      if(typeof patch === 'function'){ state = Object.assign({}, state, patch(state)); }
      else { state = Object.assign({}, state, patch); }
      notify();
    },
    subscribe(fn){ listeners.add(fn); return ()=>listeners.delete(fn); },
    navigate(route){ state = Object.assign({}, state, {route}); notify(); },
    toast(msg, kind){ state = Object.assign({}, state, {toast:{msg, kind:kind||'info', id:Date.now()}}); notify();
      setTimeout(()=>{ if(state.toast && state.toast.msg===msg){ state=Object.assign({}, state, {toast:null}); notify(); } }, 3200);
    },
  };

  window.AIK = window.AIK || {};
  window.AIK.store = store;
  window.AIK.freshState = freshState;
})();
