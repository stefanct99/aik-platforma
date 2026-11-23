(function(){
  const h = React.createElement;
  const { useState, useEffect } = React;
  const { useStore, t, Components, useSystemDark } = window.AIK;
  const { Button, Sheet, Modal, Brand, ThemeTogglePill } = Components;
  const Icons = window.AIK.Icons;
  const store = window.AIK.store;
  const Sel = window.AIK.Selectors;
  const U = window.AIK.Util;

  const NAV_ITEMS = [
    {key:'pocetna', icon:Icons.home, label:'nav.pocetna'},
    {key:'fakture', icon:Icons.invoice, label:'nav.fakture'},
    {key:'knjiga', icon:Icons.book, label:'nav.knjiga'},
    {key:'kalendar', icon:Icons.calendar, label:'nav.kalendar'},
    {key:'porez', icon:Icons.percent, label:'nav.porez', badgeFn:(s)=>Sel.taxDueThisMonth(s)},
    {key:'mejlovi', icon:Icons.mail, label:'nav.mejlovi', badgeFn:(s)=>Sel.pendingBankMailsCount(s)},
    {key:'ai', icon:Icons.chat, label:'nav.ai'},
    {key:'podesavanja', icon:Icons.settings, label:'nav.podesavanja'},
    // ADMIN_SPEC 3: stavka ispod "Podešavanja", vidljiva samo nalogu sa ulogom admin.
    {key:'admin', icon:Icons.shield, label:'nav.admin', adminOnly:true},
  ];

  function initials(name){ const p=(name||'').split(' ').filter(Boolean); return p.length?p[0][0].toUpperCase():''; }

  const SIDEBAR_MONTHS_SHORT = ['jan','feb','mar','apr','maj','jun','jul','avg','sep','okt','nov','dec'];
  function fmtShortYear(iso){ const d=new Date(iso); return d.getDate()+'. '+SIDEBAR_MONTHS_SHORT[d.getMonth()]+' '+d.getFullYear(); }

  // Sidebar kartica pretplate — frejmovi Sub1/2/9/12 (i Ph varijante): 3 tona (status-sent/status-paid/status-late
  // boje, iste kao statusi faktura), traka napretka (6px, suma/limeta popuna), dugme samo kod sent/late tonova
  // (kod "Pretplata aktivna" nema dugmeta — frejm Sub9 ga nema). "Otkazana" (u periodu) i "istekla preko otkaza
  // posle accessUntil" nisu snimljene u frejmovima — tekst/ton su naša razumna procena, ne frejm-potvrđena vrednost.
  function TrialCard(s){
    const sub = s.subscription;
    const access = Sel.subscriptionAccess(s);
    const banner = Sel.subscriptionBanner(s);
    const freeInfo = window.AIK.Rules.subscriptionAccess.freeAccessCardInfo(s.freeAccess, window.AIK.Seed.TODAY);
    let tone, title, sub2, cta, pct;
    // Mala ispravka: besplatan pristup ima SVOJ tekst (ne izvodi se iz stvarne pretplate, koja može biti
    // Istekla/bez nextChargeAt) — izgled kartice (tone-plain, bez dugmeta) ostaje isti kao "Pretplata
    // aktivna", samo je naslov/tekst drugačiji.
    if(freeInfo){
      tone='paid'; title='Besplatan pristup'; sub2 = freeInfo.noEnd ? 'Bez roka' : 'Do '+fmtShortYear(freeInfo.untilIso); cta=null; pct=100;
    } else if(banner && banner.kind==='qr_renewal'){
      tone='sent'; title='Pretplata'; sub2='Ističe za '+banner.days+' '+U.dayWord(banner.days); cta='Plati QR kodom'; pct=92;
    } else if(sub.status==='Probni'){
      // Err1/Err2 (probni sa 23 dana, nije hitno) pokazuju OBIČNU (bez tone-* klase) karticu, ne amber —
      // amber je samo kad se probni stvarno bliži kraju. Isti prag (5 dana) kao Sel.subscriptionBanner
      // 'trial_ending', radi doslednosti sa gornjim baner upozorenjem.
      if(sub.trialDaysLeft<=0){ tone='late'; title='Probni period'; sub2='Istekao je '+U.fmtLongGen(sub.trialEndsAt); cta='Izaberi plan'; pct=100; }
      else if(sub.trialDaysLeft<=5){ tone='sent'; title='Probni period'; sub2='Još '+sub.trialDaysLeft+' '+U.dayWord(sub.trialDaysLeft)+' besplatno'; cta='Izaberi plan'; pct=Math.round((30-sub.trialDaysLeft)/30*100); }
      else { tone='paid'; title='Probni period'; sub2='Još '+sub.trialDaysLeft+' '+U.dayWord(sub.trialDaysLeft)+' besplatno'; cta='Izaberi plan'; pct=Math.round((30-sub.trialDaysLeft)/30*100); }
    } else if(access.aiPaused){
      tone='late'; title='Pretplata'; sub2='AI knjigovođa je pauziran'; cta='Izaberi plan'; pct=100;
    } else if(sub.status==='Otkazana'){
      tone='sent'; title='Otkazana'; sub2='Radi do '+fmtShortYear(sub.accessUntil); cta='Izaberi plan'; pct=100;
    } else {
      tone='paid'; title='Pretplata aktivna'; sub2='Obnavlja se '+fmtShortYear(sub.nextChargeAt); cta=null; pct=100;
    }
    return h('div',{className:'sidebar-trial'+(tone!=='paid'?' tone-'+tone:' tone-plain')},
      h('div',{className:'sidebar-trial-title'}, title),
      h('div',{className:'sidebar-trial-progress'}, h('div',{className:'sidebar-trial-progress-fill', style:{width:pct+'%'}})),
      h('div',{className:'sidebar-trial-sub'}, sub2),
      cta ? h(Button,{size:'sm', className:'btn-block', onClick:()=>store.navigate('app/pretplata/plan')}, cta) : null
    );
  }

  function Sidebar(){
    const s = useStore();
    const [userMenuOpen,setUserMenuOpen] = useState(false);
    useEffect(()=>{
      if(!userMenuOpen) return;
      const onKey = (e)=>{ if(e.key==='Escape') setUserMenuOpen(false); };
      window.addEventListener('keydown', onKey);
      return ()=> window.removeEventListener('keydown', onKey);
    }, [userMenuOpen]);
    const active = s.route.replace(/^app\//,'');
    return h('aside',{className:'sidebar'},
      h('div',{className:'sidebar-brand'}, h(Brand)),
      h('nav',{className:'sidebar-nav'}, NAV_ITEMS.filter(item=> !item.adminOnly || Sel.isAdmin(s)).map(item=>{
        const badge = item.badgeFn ? item.badgeFn(s) : 0;
        return h('button',{key:item.key, className:'sidebar-link'+(active===item.key?' active':''), onClick:()=>store.navigate('app/'+item.key)},
          h(item.icon,{}), t(item.label), badge>0?h('span',{className:'sidebar-badge'},badge):null);
      })),
      TrialCard(s),
      h('div',{className:'sidebar-user-wrap'},
        h('div',Object.assign({className:'sidebar-user'}, window.AIK.a11yClick(()=>setUserMenuOpen(v=>!v))),
          h('div',{className:'avatar'}, initials(s.user.name)),
          h('div',null, h('div',{className:'sidebar-user-name'}, s.user.name), h('div',{className:'sidebar-user-sub'}, s.business.name))
        ),
        userMenuOpen ? h(React.Fragment,null,
          h('div',{style:{position:'fixed',inset:0,zIndex:139}, onClick:()=>setUserMenuOpen(false)}),
          h('div',{className:'user-menu-pop'},
            h('div',{className:'user-menu-head'},
              h('div',{className:'avatar'}, initials(s.user.name)),
              h('div',null, h('div',{className:'sidebar-user-name'}, s.user.name), h('div',{className:'sidebar-user-sub'}, s.business.name))),
            h('button',{className:'sidebar-link', onClick:()=>{ setUserMenuOpen(false); store.navigate('app/podesavanja'); }}, h(Icons.settings,{}), 'Moj nalog'),
            h('button',{className:'sidebar-link', onClick:()=>{ setUserMenuOpen(false); store.navigate('app/podesavanja'); }}, h(Icons.building,{}), 'Podaci o firmi'),
            h('button',{className:'sidebar-link', onClick:()=>{ setUserMenuOpen(false); store.navigate('app/pretplata'); }}, h(Icons.card,{}), 'Pretplata i plan'),
            h('button',{className:'sidebar-link', onClick:()=>{ setUserMenuOpen(false); window.AIK.Actions.Dev.startTour(); }}, h(Icons.info,{}), 'Pomoć i vodič'),
            h('button',{className:'sidebar-link', style:{color:'var(--danger)'}, onClick:()=>window.AIK.Actions.Auth.logout()}, h(Icons.logout,{}), 'Odjavi se'))
        ) : null)
    );
  }

  const MONTHS_SR_SHORT = ['jan','feb','mar','apr','maj','jun','jul','avg','sep','okt','nov','dec'];
  function timeAgo(iso){
    // "Sada" u prototipu je fiksirano na 14:00 na dan TODAY (Seed.TODAY je ponoć), da "pre N h"/"jutros" imaju smisla.
    const NOW = new Date(window.AIK.Seed.TODAY.getTime() + 14*3600*1000);
    const d = new Date(iso);
    const mins = Math.round((NOW-d)/60000);
    if(mins <= 0) return 'upravo sad';
    if(mins < 60) return 'pre '+mins+' min';
    if(d.toDateString()===NOW.toDateString()){
      const hrs = Math.round(mins/60);
      if(hrs <= 4) return 'pre '+hrs+' h';
      return 'jutros';
    }
    const yesterday = new Date(NOW); yesterday.setDate(yesterday.getDate()-1);
    if(d.toDateString()===yesterday.toDateString()) return 'juče';
    return d.getDate()+'. '+MONTHS_SR_SHORT[d.getMonth()];
  }

  function SearchResults(props){
    const s = props.s;
    const q = props.q.trim().toLowerCase();
    const matches = s.clients.filter(c=> c.name.toLowerCase().includes(q));
    return h('div',{className:'search-pop'},
      !matches.length ? h('div',{className:'search-empty'},
          h('div',{style:{fontSize:'1rem'}}, `Nema rezultata za „${props.q}“`),
          h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Probaj naziv klijenta, broj fakture ili iznos.'),
          h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/ai');}}, `Pitaj AI knjigovođu: „${props.q}“`)) :
        matches.map(c=>{
          const invs = s.invoices.filter(i=>i.clientId===c.id).sort((a,b)=>new Date(b.issueDate)-new Date(a.issueDate)).slice(0,2);
          const pay = s.incomesFx.concat(s.incomesRsd).filter(i=>i.clientId===c.id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
          return h('div',{key:c.id, className:'search-group'},
            h('div',{className:'search-sub-label'},'Klijenti'),
            h('button',{className:'search-row search-client', onClick:()=>{ props.onClose(); store.navigate('app/fakture/klijenti'); }},
              h('span',{className:'search-badge'}, h(Icons.briefcase,{width:18,height:18})),
              h('div',{className:'mid'}, h('span',null, c.name), h('span',null, [c.country, c.billingEmail].filter(Boolean).join(', ')))),
            invs.length ? h('div',{className:'search-sub-label'},'Fakture') : null,
            invs.map(i=> h('button',{key:i.id, className:'search-row', onClick:()=>{ props.onClose(); store.navigate('app/fakture/'+i.id); }},
              h('span',{className:'search-badge'}, h(Icons.fileText,{width:18,height:18})),
              h('div',{className:'mid'}, h('span',null, `Faktura ${i.number}`), h('span',null, c.name+', '+U.fmtDate(i.issueDate))),
              h('span',{className:'amount'}, U.fmtMoney(U.invoiceTotal(i), i.currency)))),
            pay ? h('div',{className:'search-sub-label'},'Uplate') : null,
            pay ? h('div',{className:'search-row', style:{cursor:'default'}},
              h('span',{className:'search-badge'}, h(Icons.coin,{width:18,height:18})),
              h('div',{className:'mid'}, h('span',null, 'Uplata od '+c.name), h('span',null, U.fmtDate(pay.date)+', '+(pay.source||'Ručno'))),
              h('span',{className:'amount'}, U.fmtMoney(pay.amount, pay.currency||'RSD'))) : null);
        }),
      matches.length ? h('div',{className:'search-ai-link'}, h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/ai');}}, `Pitaj AI knjigovođu: „${props.q}“`)) : null);
  }

  // Telefon: PhPoc4 (korisnički meni) i PhPoc5/PhPoc6 (pretraga, sa i bez rezultata) — isti sadržaj kao na
  // desktopu (Sidebar-ov user-menu popover, Topbar-ov SearchResults), prikazan kao bottom-sheet / full-screen
  // ekran umesto popovera, jer na telefonu nema sidebar-a ni prostora za lebdeći popover pored inputa.
  function MobileUserSheet(props){
    const s = useStore();
    const close = props.onClose;
    // Portal u document.body: Topbar je position:sticky sa svojim z-index-om, što zarobi
    // potomke u sopstveni stacking context i inače bi ih sakrilo ispod bottom-nav trake.
    return ReactDOM.createPortal(h('div',{className:'user-sheet-overlay', onMouseDown:(e)=>{ if(e.target===e.currentTarget) close(); }},
      h('div',{className:'user-sheet'},
        h('span',{className:'user-sheet-handle'}),
        h('div',{className:'user-sheet-head'}, h(Brand), h('button',{className:'icon-btn', onClick:close}, h(Icons.x,{width:20,height:20}))),
        h('div',{className:'user-sheet-profile'},
          h('div',{className:'avatar'}, initials(s.user.name)),
          h('div',null, h('div',{className:'sidebar-user-name'}, s.user.name), h('div',{className:'sidebar-user-sub'}, s.business.name))),
        h('div',{style:{display:'flex', flexDirection:'column'}},
          h('button',{className:'sidebar-link', onClick:()=>{ close(); store.navigate('app/podesavanja'); }}, h(Icons.settings,{}), 'Moj nalog'),
          h('button',{className:'sidebar-link', onClick:()=>{ close(); store.navigate('app/podesavanja'); }}, h(Icons.building,{}), 'Podaci o firmi'),
          h('button',{className:'sidebar-link', onClick:()=>{ close(); store.navigate('app/pretplata'); }}, h(Icons.card,{}), 'Pretplata i plan'),
          h('button',{className:'sidebar-link', onClick:()=>{ close(); window.AIK.Actions.Dev.startTour(); }}, h(Icons.info,{}), 'Pomoć i vodič'),
          h('button',{className:'sidebar-link', style:{color:'var(--danger)'}, onClick:()=>window.AIK.Actions.Auth.logout()}, h(Icons.logout,{}), 'Odjavi se')))), document.body);
  }

  function MobileSearchOverlay(props){
    const s = props.s;
    const [q,setQ] = useState('');
    const close = props.onClose;
    return ReactDOM.createPortal(h('div',{className:'mobile-search-overlay'},
      h('div',{className:'mobile-search-bar'},
        h('div',{className:'mobile-search-pill'},
          h(Icons.search,{width:16,height:16}),
          h('input',{value:q, placeholder:t('search.placeholder'), autoFocus:true, onChange:e=>setQ(e.target.value)})),
        h('a',{href:'#', style:{flex:'none'}, onClick:(e)=>{e.preventDefault(); close();}},'Otkaži')),
      h('div',{className:'mobile-search-body'},
        q.trim() ? h('div',{className:'mobile-search-results'}, h(SearchResults,{s, q, onClose:close})) : null)), document.body);
  }

  function Topbar(props){
    const s = useStore();
    const Icons2 = Icons;
    const systemDark = useSystemDark();
    const effectiveDark = s.theme==='dark' || (s.theme==='system' && systemDark);
    const [q,setQ] = useState('');
    const [bellOpen,setBellOpen] = useState(false);
    const [mobileSearchOpen,setMobileSearchOpen] = useState(false);
    const [mobileUserOpen,setMobileUserOpen] = useState(false);
    const unread = s.notifications.filter(n=>!n.read);
    // ADMIN_SPEC 3: gornja traka na admin ekranima nema "Nova faktura" i ima drugačiji placeholder pretrage.
    const onAdmin = s.route.startsWith('app/admin');
    return h('header',{className:'topbar'},
      // PhKp1/PhPoc4: na telefonu (ispod 1024px) sidebar nestaje (prenosi logo), ali logo se nikad nije
      // ponovo pojavio u topbar-u — ekrani su ostajali bez branda. Frejm pokazuje SAMO logo+bedž+avatar,
      // ništa drugo (bez pretrage/teme/Nova faktura dugmeta) u ovom redu na telefonu.
      h('div',{className:'topbar-brand-m'}, h(Brand,{dark:effectiveDark})),
      h('div',{className:'topbar-search', style:{position:'relative'}},
        h(Icons2.search,{width:16,height:16}),
        h('input',{value:q, placeholder: onAdmin?'Pretraži korisnike i pretplate':t('search.placeholder'), onChange:e=>setQ(e.target.value)}),
        // Admin ne vidi klijente/fakture korisnika (ADMIN_SPEC 0) — padajuća pretraga koja čita s.clients
        // je za korisnikov sopstveni posao, pa se na admin ekranima ne prikazuje.
        (q.trim() && !onAdmin) ? h(React.Fragment,null,
          h('div',{style:{position:'fixed',inset:0,zIndex:139}, onClick:()=>setQ('')}),
          h(SearchResults,{s, q, onClose:()=>setQ('')})) : null),
      mobileSearchOpen ? h(MobileSearchOverlay,{s, onClose:()=>setMobileSearchOpen(false)}) : null,
      mobileUserOpen ? h(MobileUserSheet,{onClose:()=>setMobileUserOpen(false)}) : null,
      h('div',{className:'topbar-actions'},
        h(ThemeTogglePill,{className:'topbar-desktop-only'}),
        // Tur4 (25. krug, Korak 3): vodič cilja zvonce (+ avatar na telefonu, odmah pored) kao jednu celinu.
        h('span',{'data-tour':'notifications', style:{display:'flex', alignItems:'center', gap:'var(--space-3)'}},
        h('span',{style:{position:'relative'}},
          h('button',{className:'icon-btn', onClick:()=>setBellOpen(v=>!v)}, h(Icons2.bell,{width:20,height:20}), unread.length?h('span',{className:'icon-dot'}):null),
          bellOpen ? h(React.Fragment,null,
            h('div',{style:{position:'fixed',inset:0,zIndex:139}, onClick:()=>setBellOpen(false)}),
            h('div',{className:'notif-pop'},
              h('div',{className:'notif-pop-head'}, h('span',{style:{fontSize:'1.25rem', letterSpacing:'-0.01em'}},'Obaveštenja'),
                h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); window.AIK.Actions.Settings.markAllNotifsRead();}},'Označi sve kao pročitano')),
              s.notifications.length ? s.notifications.map(n=>{
                // Poc3 (25. krug, Korak 2c): nepročitane stavke imaju amber ikonicu (ista dekorativna
                // #FFF4DB/#8A5A00 boja kao .sub-qr-wait-pill) i dugme za akciju ispod opisa; pročitane
                // imaju --status-paid-bg/-text (lime) i nemaju dugme. Dugme samo za tip koji ga frejm ima.
                const actionLabel = !n.read && n.type==='Novi mejl banke' ? 'Potvrdi' : (!n.read && n.type==='Rokovi za porez' ? 'Plati' : null);
                function go(e){ if(e) e.stopPropagation(); window.AIK.Actions.Settings.markNotifRead(n.id); setBellOpen(false); if(n.route) store.navigate(n.route); }
                return h('div',Object.assign({key:n.id, className:'notif-pop-row', style:{cursor:'pointer'}}, window.AIK.a11yClick(go)),
                !n.read ? h('span',{className:'notif-dot'}) : null,
                h('span',{className:'icon-circ-36', style: !n.read ? {background:'#FFF4DB', color:'#8A5A00'} : {background:'var(--status-paid-bg)', color:'var(--status-paid-text)'}}, h(Icons2.clock,{width:18,height:18})),
                h('div',{className:'mid'}, h('div',{style:{fontSize:'1rem'}}, n.title), h('div',{className:'faint', style:{fontSize:'0.875rem'}}, n.body),
                  actionLabel ? h('div',{style:{marginTop:6}}, h(Button,{size:'sm', variant: actionLabel==='Potvrdi'?'primary':'secondary', style:{height:32}, onClick:go}, actionLabel)) : null),
                h('span',{className:'faint', style:{fontSize:'0.875rem', flex:'none'}}, timeAgo(n.at)));
              }) :
                h('div',{className:'notif-pop-row', style:{justifyContent:'center', color:'var(--text-muted)'}},'Nema obaveštenja.'),
              h('div',{className:'notif-pop-foot', style:{display:'flex', justifyContent:'space-between'}},
                h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); setBellOpen(false); store.navigate('app/obavestenja');}},'Sve obaveštenja'),
                h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); setBellOpen(false); store.navigate('app/podesavanja');}},'Podešavanja obaveštenja')))
          ) : null),
        h('button',{className:'topbar-avatar-btn topbar-mobile-only', onClick:()=>setMobileUserOpen(true)}, initials(s.user.name))),
        onAdmin ? null : h(Button,{className:'topbar-desktop-only', icon:Icons2.plus, onClick:()=>store.navigate('app/fakture/nova')}, t('cta.nova_faktura'))
      ));
  }

  // MNav2 (25. krug, Korak 2d): otvoren sheet "Više" pokazuje Mejlovi banke kao jednu od stavki (sa
  // bedžom) — u kodu je potpuno nedostajala, pa Mejlovi banke nije imalo NIKAKAV ulaz na telefonu.
  // ADMIN_SPEC 3: na telefonu, Admin je poslednja stavka u "Više", ispod "Podešavanja", vidljiva samo adminu.
  const MORE_ITEMS = ['knjiga','kalendar','mejlovi','ai','podesavanja','admin'];

  // Bottom-nav glyphs, distinct from the desktop sidebar's icon set (MNav15/PhFak1 frames):
  // filled+bold when active, muted outline otherwise. The home icon gets a white door cutout when filled.
  const BN_PATHS = {
    home: 'M10.5 3.8a2.4 2.4 0 0 1 3 0l6.3 5.1a2.6 2.6 0 0 1 1 2V18.4A2.6 2.6 0 0 1 18.2 21H5.8a2.6 2.6 0 0 1-2.6-2.6V10.9a2.6 2.6 0 0 1 1-2z',
    fakture: 'M7 3h6.6c.5 0 1 .2 1.4.6l3.4 3.4c.4.4.6.9.6 1.4V17.5A3.5 3.5 0 0 1 15.5 21h-8A3.5 3.5 0 0 1 4 17.5v-11A3.5 3.5 0 0 1 7.5 3z',
    porez: 'M7.5 3h9A3.5 3.5 0 0 1 20 6.5V19a1.2 1.2 0 0 1-1.9 1l-1.7-1.2a1 1 0 0 0-1.1 0l-1.6 1.1a1.2 1.2 0 0 1-1.4 0l-1.6-1.1a1 1 0 0 0-1.1 0L7.9 20A1.2 1.2 0 0 1 6 19V6.5A3.5 3.5 0 0 1 7.5 3z',
  };
  const BN_LINES = { fakture: ['M8 12.5h8','M8 16.5h5'], porez: ['M9.5 9h5','M9.5 13h3'] };
  function BNIcon(props){
    const {kind, active} = props;
    const common = {width:26, height:26, viewBox:'0 0 24 24', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round', style:{display:'block'}};
    if(kind==='vise') return h('svg', Object.assign({}, common, {fill: active?'#0F2A22':'none', stroke: active?'#0F2A22':'var(--text-faint)'}),
      h('circle',{cx:5.5, cy:12, r:2.1}), h('circle',{cx:12, cy:12, r:2.1}), h('circle',{cx:18.5, cy:12, r:2.1}));
    if(kind==='home') return h('svg', Object.assign({}, common, {fill: active?'#0F2A22':'none', stroke: active?'#0F2A22':'var(--text-faint)'}),
      h('path',{d:BN_PATHS.home}),
      active ? h('path',{stroke:'#fff', strokeLinecap:'butt', d:'M9.8 21.9v-5.2a2.2 2.2 0 0 1 4.4 0v5.2'}) : h('path',{d:'M9.8 21v-4.3a2.2 2.2 0 0 1 4.4 0V21'}));
    return h('svg', Object.assign({}, common, {fill: active?'#0F2A22':'none', stroke: active?'#0F2A22':'var(--text-faint)'}),
      h('path',{d:BN_PATHS[kind]}), ...BN_LINES[kind].map((d,i)=>h('path',{key:i, d})));
  }

  function BottomNav(){
    const s = useStore();
    const [moreOpen,setMoreOpen] = useState(false);
    const active = s.route.replace(/^app\//,'');
    const item = (key,kind,label,badge)=> h('button',{key, className:'bottom-nav-item'+(active===key?' active':''), onClick:()=>store.navigate('app/'+key)},
      h('span',{className:'bn-icon-wrap'}, h(BNIcon,{kind, active:active===key}), badge?h('span',{className:'bn-dot'}):null),
      h('span',null,label));
    const porezBadge = (NAV_ITEMS.find(n=>n.key==='porez').badgeFn||(()=>0))(s) > 0;
    return h(React.Fragment,null,
      h('nav',{className:'bottom-nav'},
        item('pocetna', 'home', t('nav.pocetna')),
        item('fakture', 'fakture', t('nav.fakture')),
        h('div',{className:'bottom-nav-fab'},
          h('button',{className:'fab-circle', onClick:()=>store.navigate('app/fakture/nova')}, h(Icons.plus,{width:26,height:26, color:'#0F2A22'})),
          h('span',{className:'fab-label'}, 'Faktura')),
        item('porez', 'porez', 'Porez', porezBadge),
        // PhAdm1 (telefon Pregled): "Više" je oznaćeno aktivnim i dok je Admin otvoren (ne samo dok je sheet otvoren).
        h('button',{className:'bottom-nav-item'+((moreOpen||active==='admin')?' active':''), onClick:()=>setMoreOpen(true)}, h('span',{className:'bn-icon-wrap'}, h(BNIcon,{kind:'vise', active:moreOpen||active==='admin'})), h('span',null,t('nav.vise')))
      ),
      moreOpen ? h(Sheet,{title:t('nav.vise'), onClose:()=>setMoreOpen(false)},
        h('div',{className:'stack-sm'},
          MORE_ITEMS.filter(key=> key!=='admin' || Sel.isAdmin(s)).map(key=>{
            const def = NAV_ITEMS.find(n=>n.key===key);
            const badge = def.badgeFn ? def.badgeFn(s) : 0;
            return h('button',{key, className:'sidebar-link', style:{color:'var(--text)'}, onClick:()=>{ setMoreOpen(false); store.navigate('app/'+key); }},
              h(def.icon,{}), t(def.label), badge>0?h('span',{className:'sidebar-badge'},badge):null);
          }),
          h('button',{className:'sidebar-link', style:{color:'var(--danger)'}, onClick:()=>window.AIK.Actions.Auth.logout()}, h(Icons.logout,{}), t('user.logout'))
        )
      ) : null
    );
  }

  const DEV_PRESETS = [
    ['new','Novi nalog (nepotvrđen mejl)'],
    ['onboarding','Onboarding nezavršen'],
    ['trial','Probni period (23 dana)'],
    ['trial_ending','Probni period ističe (5 dana)'],
    ['expired','Probni period istekao'],
    ['active','Aktivna pretplata'],
    ['payment_failed','Naplata nije uspela'],
    ['canceled','Otkazana pretplata'],
  ];
  const DEV_SCREENS = ['app/pocetna','app/fakture','app/knjiga','app/kalendar','app/porez','app/mejlovi','app/ai','app/podesavanja','app/pretplata','app/admin','login','register','err-404','err-offline'];

  function DevMenu(){
    const s = useStore();
    const Actions = window.AIK.Actions.Dev;
    if(!s.devMenuOpen) return null;
    return h(Modal,{title:t('devmenu.title'), onClose:Actions.toggleMenu, size:'lg'},
      h('div',{className:'stack'},
        h('div',{className:'faint', style:{fontSize:13}}, t('devmenu.sub'), ' Test prijava: stefan@stephortless.com / demo1234'),
        h('div',null, h('b',null,t('devmenu.account_state')),
          h('div',{className:'chip-row', style:{marginTop:8}}, DEV_PRESETS.map(([key,label])=>
            h('span',Object.assign({key, className:'chip'+(s.accountStatePreset===key?' active':'')}, window.AIK.a11yClick(()=>Actions.setPreset(key))), label)))),
        h('div',null, h('b',null,'Uloga'),
          h('div',{className:'chip-row', style:{marginTop:8}},
            h('span',Object.assign({className:'chip'+(s.user.role!=='admin'?' active':'')}, window.AIK.a11yClick(()=>Actions.setRole('user'))), 'Korisnik'),
            h('span',Object.assign({className:'chip'+(s.user.role==='admin'?' active':'')}, window.AIK.a11yClick(()=>Actions.setRole('admin'))), 'Admin'))),
        h('div',null, h('b',null,t('devmenu.limit')),
          h('div',{className:'chip-row', style:{marginTop:8}},
            h('span',Object.assign({className:'chip'+(s.dev.limitOverridePct==null?' active':'')}, window.AIK.a11yClick(()=>Actions.setLimitOverride(null))), 'Stvarni podaci'),
            h('span',Object.assign({className:'chip'+(s.dev.limitOverridePct===83?' active':'')}, window.AIK.a11yClick(()=>Actions.setLimitOverride(83))), '~80% limita'),
            h('span',Object.assign({className:'chip'+(s.dev.limitOverridePct===91?' active':'')}, window.AIK.a11yClick(()=>Actions.setLimitOverride(91))), '~90% limita'),
            h('span',Object.assign({className:'chip'+(s.dev.limitOverridePct===104?' active':'')}, window.AIK.a11yClick(()=>Actions.setLimitOverride(104))), 'Preko 100%'))),
        // Round 30, nalaz 5: besplatan pristup (ADMIN_SPEC 6) nema pravi put kroz UI da admin odobri SVOM
        // nalogu (fejk 128-pool je odvojen) — ovaj prekidač je JEDINI način da se logika proveri uživo,
        // isti dev.* obrazac kao gornji limit test.
        h('div',null, h('b',null,'Besplatan pristup (test)'),
          h('div',{className:'chip-row', style:{marginTop:8}},
            h('span',Object.assign({className:'chip'+(!s.freeAccess?' active':'')}, window.AIK.a11yClick(()=>Actions.setFreeAccess(false))), 'Isključeno'),
            h('span',Object.assign({className:'chip'+(s.freeAccess?' active':'')}, window.AIK.a11yClick(()=>Actions.setFreeAccess(true))), 'Uključeno (bez roka)'))),
        h('div',null, h('b',null,'Izgled i jezik'),
          h('div',{className:'chip-row', style:{marginTop:8}},
            ['light','dark','system'].map(th=> h('span',Object.assign({key:th, className:'chip'+(s.theme===th?' active':'')}, window.AIK.a11yClick(()=>Actions.setTheme(th))), th==='light'?'Svetli':th==='dark'?'Tamni':'Kao na uređaju'))),
          h('div',{className:'chip-row', style:{marginTop:8}},
            [['sr','Srpski latinica'],['sr-cyr','Srpski ćirilica'],['en','English']].map(([k,label])=> h('span',Object.assign({key:k, className:'chip'+(s.lang===k?' active':'')}, window.AIK.a11yClick(()=>Actions.setLang(k))), label)))),
        h('div',null, h('b',null,'Oznake (dev)'),
          h('div',{className:'chip-row', style:{marginTop:8}},
            h('span',Object.assign({className:'chip'+(s.dev.forceMagicExpired?' active':'')}, window.AIK.a11yClick(()=>Actions.toggleFlag('forceMagicExpired'))), 'Link je istekao'),
            h('span',Object.assign({className:'chip'+(s.dev.forceGoogleError?' active':'')}, window.AIK.a11yClick(()=>Actions.toggleFlag('forceGoogleError'))), 'Google greška'),
            h('span',Object.assign({className:'chip'+(s.dev.forceEmptyCalendar?' active':'')}, window.AIK.a11yClick(()=>Actions.toggleFlag('forceEmptyCalendar'))), 'Kalendar: prazan mesec (Kl9)'))),
        h('div',null, h('b',null,'Simuliraj novi mejl banke'),
          h('p',{className:'faint', style:{fontSize:13, margin:'4px 0 8px'}},'Dodaje stvaran mejl u Mejlove banke (sa značkom u meniju) i pokreće obaveštenje — poštuje istekao nalog.'),
          h('div',{className:'row', style:{gap:8, flexWrap:'wrap'}},
            h(Button,{size:'sm', variant:'secondary', onClick:()=>window.AIK.Actions.BankMails.simulateNewMail('devizni')},'Devizni priliv sa fakturom'),
            h(Button,{size:'sm', variant:'secondary', onClick:()=>window.AIK.Actions.BankMails.simulateNewMail('dinarski')},'Dinarski priliv'),
            h(Button,{size:'sm', variant:'secondary', onClick:()=>window.AIK.Actions.BankMails.simulateNewMail('no_invoice')},'Priliv bez fakture'))),
        h('div',null, h('b',null,'Prenos dosadašnjeg poslovanja'),
          h('p',{className:'faint', style:{fontSize:13, margin:'4px 0 8px'}},'Vraća stanje tačno pre poslednjeg sačuvanog uvoza prihoda (stavke, klijenti, lagane fakture).'),
          h(Button,{size:'sm', variant:'secondary', onClick:()=>window.AIK.Actions.Uvoz.resetImport()},'Resetuj uvoz')),
        h('div',null, h('b',null,t('devmenu.jumpto')),
          h('div',{className:'chip-row', style:{marginTop:8}}, DEV_SCREENS.map(r=> h('span',Object.assign({key:r, className:'chip'}, window.AIK.a11yClick(()=>Actions.goto(r))), r)))),
        h('div',null, h('b',null,'Poređenje sa frejmom (korak 1, Faza 10)'),
          h('p',{className:'faint', style:{fontSize:13, margin:'4px 0 8px'}},'Snima font/boje/razmake/okvire svih elemenata trenutnog ekrana (po klasi) da se ručno uporede sa vrednostima iz frejma — frejm sam alat ne učitava.'),
          h(Button,{size:'sm', variant:'secondary', onClick:()=>Actions.auditStyles()},'Snimi stilove trenutnog ekrana'),
          s.dev.styleAudit ? h('div',{style:{marginTop:10}},
            h('div',{className:'faint', style:{fontSize:12}}, s.dev.styleAudit.route+' · '+s.dev.styleAudit.theme+' · '+s.dev.styleAudit.width+'px · '+s.dev.styleAudit.rows.length+' klasa'),
            h('div',{style:{maxHeight:220, overflow:'auto', border:'1px solid var(--border)', borderRadius:8, marginTop:6, fontSize:12}},
              h('table',{style:{width:'100%', borderCollapse:'collapse'}},
                h('thead',null, h('tr',null, ['klasa','font','boja','bg','padding','radius'].map(h2=>h('th',{key:h2, style:{textAlign:'left', padding:4, borderBottom:'1px solid var(--border)'}},h2)))),
                h('tbody',null, s.dev.styleAudit.rows.map(row=> h('tr',{key:row.cls},
                  h('td',{style:{padding:4, maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}, title:row.cls}, row.cls),
                  h('td',{style:{padding:4}}, row.styles.fontSize+' / '+row.styles.fontWeight),
                  h('td',{style:{padding:4}}, row.styles.color),
                  h('td',{style:{padding:4}}, row.styles.backgroundColor),
                  h('td',{style:{padding:4}}, row.styles.padding),
                  h('td',{style:{padding:4}}, row.styles.borderRadius)))))),
            h(Button,{size:'sm', variant:'secondary', style:{marginTop:8}, onClick:()=>{ navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(s.dev.styleAudit,null,1)); store.toast('JSON kopiran.'); }},'Kopiraj kao JSON')
          ) : null),
        h('div',null, h('b',null,'Sudar CSS klasa (korak 4, drugi krug Faze 10)'),
          h('p',{className:'faint', style:{fontSize:13, margin:'4px 0 8px'}},'Proverava sve učitane CSS selektore van @media blokova — isti selektor definisan dva puta sa različitim pravilima tiho prepisuje raniju definiciju (tačno ovo je pokvarilo Mejlovi banke tabove u prošlom krugu).'),
          h(Button,{size:'sm', variant:'secondary', onClick:()=>Actions.auditDuplicateCSS()},'Proveri duple CSS selektore'),
          s.dev.cssDuplicateAudit ? (s.dev.cssDuplicateAudit.dupes.length ? h('div',{style:{marginTop:10, maxHeight:180, overflow:'auto', border:'1px solid var(--danger)', borderRadius:8, padding:8, fontSize:12}},
              s.dev.cssDuplicateAudit.dupes.map((d,i)=> h('div',{key:i, style:{marginBottom:6}}, h('b',null,d.selector), ' — '+d.count+' definicije:', h('ul',{style:{margin:'2px 0 0 16px'}}, d.defs.map((def,j)=>h('li',{key:j}, def)))))
            ) : h('div',{className:'faint', style:{fontSize:12, marginTop:6}},'Nema sudara.')) : null),
        h(Button,{variant:'secondary', onClick:Actions.reset}, t('devmenu.reset'))
      ));
  }

  function DevFab(){
    return h('button',{className:'dev-fab', onClick:()=>window.AIK.Actions.Dev.toggleMenu(), title:t('devmenu.title')}, 'DEV');
  }

  function AppShell(props){
    // Mb9/Mb5 (prvo podešavanje / "poslato banci" u Mejlovima banke): frejm nema ni sidebar ni topbar, cela
    // stranica je jedna centrirana kartica preko pozadine — potvrđeno sirovim HTML-om (nema "Mejlovi banke"/
    // "Početna" teksta nigde u frejmu). `fullBleed` to replicira bez diranja ostatka aplikacije.
    // `main.content` ostaje na ISTOJ poziciji među braćom i kad se fullBleed menja (Sidebar/Topbar/BottomNav
    // su uslovno null, ne uslovno-drugo-stablo) — inače React pri promeni fullBleed re-montira `main` (gubi
    // lokalni state ekrana unutar njega, npr. "justSent" u Mejlovima banke, jer mu se pozicija među braćom menja).
    const fb = props.fullBleed;
    return h('div',{className:'app-shell'},
      fb ? null : h(Sidebar),
      h('div',{className:'main-col'},
        fb ? null : h(Topbar,{onBell:props.onBell}),
        h('main',{className:'content'+(fb?' content-fullbleed':'')}, props.children),
        fb ? null : h(BottomNav)
      ),
      h(DevMenu), h(DevFab), h(window.AIK.Components.Toast), h(window.AIK.Components.SimulatedInboxModal)
    );
  }

  window.AIK = window.AIK || {};
  window.AIK.Shell = { Sidebar, Topbar, BottomNav, DevMenu, DevFab, AppShell, NAV_ITEMS, initials };
})();
