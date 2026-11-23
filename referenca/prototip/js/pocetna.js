// Faza 4a: Početna — kontrolna tabla (7.2), limit (8.3, 8.4), tooltipovi i "Počni ovde" (6.1).
(function(){
  const h = React.createElement;
  const { useState, useEffect } = React;
  const { useStore, t, Components, useIsMobile } = window.AIK;
  const { Button, EmptyState } = Components;
  const Icons = window.AIK.Icons;
  const store = window.AIK.store;
  const Sel = window.AIK.Selectors;
  const U = window.AIK.Util;
  const TODAY = window.AIK.Seed.TODAY;

  function initials(name){ return window.AIK.Shell.initials(name); }

  function Tooltip(props){
    const [open,setOpen] = useState(false);
    return h('span',{style:{position:'relative', display:'inline-flex'}},
      h('button',{className:'poc-help-btn', onClick:()=>setOpen(v=>!v), type:'button'},'?'),
      open ? h(React.Fragment,null,
        h('div',{style:{position:'fixed',inset:0,zIndex:149}, onClick:()=>setOpen(false)}),
        h('div',{className:'tooltip-pop', style:props.style||{top:26,left:0}}, props.children)) : null);
  }

  function GreetingBanner(props){
    const s = props.s;
    const hour = new Date().getHours();
    const greet = hour<11 ? 'Dobro jutro' : hour<18 ? 'Dobar dan' : 'Dobro veče';
    const checklist = Sel.setupChecklist(s);
    const allDone = checklist.every(c=>c.done);
    const waiting = Sel.waitingForYouItems(s);
    const li = Sel.limitInfo(s);
    // Poc2: kad je autonomija automatska I prihod blizu limita (isti prag 80% kao LimitWarningBanner),
    // poruka se menja da pomene limit umesto generičkog "Sve je pod kontrolom" — potvrđeno frejmom.
    const autoNearLimit = allDone && s.autonomySettings.globalMode==='auto' && li.pct>=80;
    let text, warn = !allDone || autoNearLimit;
    const remaining = checklist.filter(c=>!c.done);
    // Poc1/Dash4_norez: tekst je specifičan za rešenje SAMO kad je ono POSLEDNJI preostali korak
    // (bukvalno "još SAMO rešenje") — ne čim je ono SLEDEĆE na redu dok ima još koraka posle njega.
    if(!allDone) text = (remaining.length===1 && remaining[0].key==='resenje') ? 'Još samo rešenje Poreske uprave i sve je spremno.' : 'Nalog je spreman. Još par koraka i krećem da radim umesto tebe.';
    else if(autoNearLimit) text = 'Prihod je blizu limita za paušalce. Plaćanje poreza ide automatski iz banke.';
    else if(s.autonomySettings.globalMode==='auto') text = 'Sve je pod kontrolom. Plaćanje poreza ide automatski iz banke.';
    else if(waiting.length===1) text = 'Jedna stvar čeka tebe. ' + (waiting[0].kind==='rok' ? 'Rok za plaćanje je sutra.' : '');
    else if(waiting.length>1) text = waiting.length+' stvari čekaju tebe.';
    else text = 'Sve je pod kontrolom.';
    const dotColor = warn?'#E0A526':'#7BB82D';
    return h('div',{className:'poc-greeting'},
      h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}}, U.fmtDow(TODAY)[0].toUpperCase()+U.fmtDow(TODAY).slice(1)+', '+U.fmtLong(TODAY)),
      h('h1',null, greet+(s.user.name?', '+U.firstNameVoc(s.user.name):'')),
      h('p',{className:'poc-status-line'}, h('span',{className:'poc-status-dot', style:{background:dotColor, boxShadow:'0 0 0 4px '+dotColor+'2E'}}), text));
  }

  function PocniOvdeCard(){
    const s = useStore();
    const checklist = Sel.setupChecklist(s);
    const doneCount = checklist.filter(c=>c.done).length;
    let nextFound = false;
    return h('div',{className:'poc-card', 'data-tour':'pocni-ovde'},
      h('div',{className:'poc-card-head'}, h('span',{className:'t'},'Počni ovde'), h('span',{className:'poc-wait-badge sub-muted-dark', style:{background:'var(--bg)'}}, `${doneCount} od ${checklist.length} koraka`)),
      h('div',{className:'poc-checklist-bar'}, h('div',{style:{width:(doneCount/checklist.length*100)+'%'}})),
      h('div',{style:{display:'flex', flexDirection:'column', gap:4}}, checklist.map((c,i)=>{
        const isNext = !c.done && !nextFound;
        if(isNext) nextFound = true;
        return h('div',{key:c.key, className:'poc-checklist-item'+(isNext?' next':'')},
          h('span',{className:'poc-check-num '+(c.done?'done':'pending')}, c.done ? h(Icons.check,{width:16,height:16}) : i+1),
          h('div',{className:'mid'}, h('span',{style:{fontSize:'1rem', color: c.done?'var(--text-muted)':'var(--text)'}}, c.title),
            h('span',{className:'sub'}, c.sub, c.link?h(React.Fragment,null,' ', h('a',{href:'#', onClick:e=>e.preventDefault()}, c.link)):null)),
          !c.done && c.cta ? h(Button,{size:'sm', variant: isNext?'primary':'secondary', onClick:()=>store.navigate(c.route)}, c.cta) : null);
      })),
      // Uv0 (Round 28): izgled za ovo mesto nije nacrtan, baner je ponovljen iz Uv0 — vidi izveštaj.
      !s.importState.confirmed ? h(Components.ImportBanner) : null);
  }

  function LimitCard(){
    const s = useStore();
    const li = Sel.limitInfo(s);
    const hasHistory = (s.incomesFx.length + s.incomesRsd.length) > 0;
    const projection = li.total===0 ? 'Pratim od prve uplate' :
      (li.monthsOfHistory||0) < 2 ? null :
      li.pct >= 100 ? 'Limit je pređen za ovu godinu' :
      (li.pct/100 * 12/(li.monthsOfHistory||12)) >= 1 ? `Po tvom tempu prelaziš limit za oko ${Math.max(1, Math.round((100-li.pct)/(li.pct/(li.monthsOfHistory||12))))} meseca` :
      'Po tvom tempu limit ne prelaziš ove godine';
    return h('div',{className:'poc-card poc-limit-card', 'data-tour':'limit'},
      h('div',{style:{display:'flex', alignItems:'center', gap:6}},
        h('span',{className:'poc-limit-label'},'Prihod u poslednjih 12 meseci'),
        h(Tooltip,null,'Paušalci mogu da zarade do 6.000.000 din u 12 meseci. Računam sve tvoje uplate i javim ti kad se približiš.')),
      h('div',{className:'poc-limit-num'}, h('span',{className:'n'}, U.fmtInt(li.total)), h('span',{className:'d'}, 'od '+U.fmtInt(li.limit,'RSD'))),
      h('div',{className:'poc-limit-bar'}, h('div',{style:{width:Math.min(100,li.pct)+'%', background: li.pct>=90?'#E0A526':'var(--limeta)'}})),
      h('div',{className:'poc-limit-foot'}, h('span',null, `Do limita ostaje ${U.fmtInt(li.total>0?li.remaining:li.limit,'RSD')}`),
        projection ? h('span',null, projection) : null));
  }

  function CekaTebeCard(){
    const s = useStore();
    const items = Sel.waitingForYouItems(s);
    return h('div',{className:'poc-card'},
      h('div',{className:'poc-card-head'}, h('span',{style:{display:'flex', alignItems:'center', gap:6}}, h('span',{className:'t'},'Čeka tebe'), h(Tooltip,null,'Ovde stoje samo stvari koje ne mogu da uradim bez tebe, na primer da potvrdiš za koju je fakturu stigla uplata.')),
        items.length ? h('span',{className:'poc-wait-badge'}, items.length) : null),
      items.length ? h('div',{className:'poc-wait-list'}, items.map(it=> h('div',{key:it.key, className:'poc-wait-item'},
          h('span',{className:'poc-wait-icon '+it.kind}, h(it.kind==='rok'?Icons.clock:Icons.flag,{width:18,height:18})),
          h('div',{className:'mid', style:{flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:2}}, h('span',{className:'t-ellip', style:{fontSize:'1rem'}}, it.title), h('span',{className:'faint t-ellip', style:{fontSize:'0.875rem'}}, it.sub)),
          h(Button,{size:'sm', variant: it===items[0]?'primary':'secondary', onClick:()=>store.navigate(it.route)}, it.cta)))) :
        h('div',{className:'poc-empty'}, h('span',{className:'ic'}, h(Icons.checkCircle,{width:20,height:20})), h('span',{style:{fontSize:'1rem'}},'Nema ničega što čeka tebe.')));
  }

  function PoslednjeUplateCard(){
    const s = useStore();
    const all = s.incomesFx.concat(s.incomesRsd).filter(i=>!i.noInvoice).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
    return h('div',{className:'poc-card'},
      h('div',{className:'poc-card-head'}, h('span',{className:'t'},'Poslednje uplate'), h('a',{href:'#', className:'poc-action-link', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/knjiga');}},'Sve uplate')),
      all.length ? h('div',{className:'poc-pay-list'}, all.map((i,idx)=>{
        const client = s.clients.find(c=>c.id===i.clientId);
        const inv = i.invoiceId ? s.invoices.find(x=>x.id===i.invoiceId) : null;
        const rsd = i.currency && i.currency!=='RSD' ? i.amount*i.rate : i.amount;
        const cc = client ? U.clientAvatarColors(client.name) : null;
        return h('div',{key:i.id, className:'poc-pay-row'},
          h('span',{className:'av', style: cc ? {'--client-bg':cc.bg, '--client-bg-dark':cc.bgDark} : undefined}, client?initials(client.name):'?'),
          h('div',{className:'mid'}, h('span',{style:{fontSize:'1rem'}}, client?client.name:'Nepoznat'), h('span',{className:'faint', style:{fontSize:'0.875rem'}}, (inv?'Faktura '+inv.number:'Ručni unos')+' · '+U.fmtDate(i.date))),
          h('span',{className:'amt'}, i.currency && i.currency!=='RSD' ? h('span',{style:{fontSize:'1rem'}}, U.fmtMoney(i.amount,i.currency)) : null,
            h('span',{className:'faint', style:{fontSize:'0.875rem'}}, U.fmtMoney(rsd,'RSD'))));
      })) :
        h('div',{className:'poc-empty'}, h('span',{className:'ic'}, h(Icons.download,{width:20,height:20})), h('span',{style:{fontSize:'1rem'}},'Još nema uplata'),
          h('span',{className:'faint', style:{fontSize:'0.875rem', maxWidth:320}},'Čim stigne prvi mejl banke ili proknjižiš prvu fakturu, uplate se pojavljuju ovde.')));
  }

  function NadolazeciRokoviCard(){
    const s = useStore();
    if(!s.taxDecision) return h('div',{className:'poc-card'},
      h('div',{className:'poc-card-head'}, h('span',{className:'t'},'Nadolazeći rokovi'), h('a',{href:'#', className:'poc-action-link', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/kalendar');}},'Kalendar')),
      h('div',{className:'poc-norez-card'},
        h('div',{style:{display:'flex', gap:16, alignItems:'flex-start'}},
          h('span',{className:'poc-norez-icon'}, h(Icons.fileText,{width:24,height:24})),
          h('div',{style:{display:'flex', flexDirection:'column', gap:6}},
            h('span',{style:{fontSize:'1.25rem'}},'Dodaj rešenje Poreske uprave'),
            h('span',{className:'body'},'Iz njega čitam tačne iznose poreza i doprinosa i pripremam uplate sa QR kodom. Bez njega ne znam koliko treba da platiš.'))),
        h('div',{style:{display:'flex', alignItems:'center', gap:20}},
          h(Button,{size:'sm', icon:Icons.upload, onClick:()=>store.navigate('app/porez')},'Dodaj rešenje'),
          h('a',{href:'#', className:'poc-action-link', style:{fontSize:'0.875rem', textDecoration:'underline', textUnderlineOffset:'3px'}, onClick:e=>e.preventDefault()},'Kako do rešenja'))));
    const months = Sel.upcomingTaxMonths(s, 3);
    const total = Sel.taxMonthlyTotal(s);
    const auto = s.taxPaymentMode==='trajni_nalog';
    return h('div',{className:'poc-card'},
      h('div',{className:'poc-card-head'}, h('span',{className:'t'},'Nadolazeći rokovi'), h('a',{href:'#', className:'poc-action-link', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/kalendar');}},'Kalendar')),
      h('div',null, months.map((key,idx)=>{
        const isDue = idx===0;
        const due = Sel.taxDueDate(key);
        const daysLeft = U.daysDiff(due, TODAY);
        const serviceMonth = Sel.taxServiceMonthName(key);
        return h('div',{key, className:'poc-deadline-row'+(isDue?(auto?' auto':' due'):'')},
          h('span',{className:'poc-date-tile'+(isDue?' due':'')}, h('span',{className:'mon'}, U.MONTHS_SR[due.getMonth()].slice(0,3).toUpperCase()), h('span',{className:'day'}, due.getDate())),
          h('div',{className:'mid'}, h('span',{style:{fontSize:'1rem'}}, 'Akontacija za '+serviceMonth),
            isDue ? h('span',{style:{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', fontSize:'0.875rem', color:'var(--sidebar-text)'}}, U.fmtMoney(total,'RSD'),
              auto ? h('span',{className:'poc-auto-pill'}, h(Icons.check,{width:12,height:12}), 'Automatski iz banke') : h('span',{className:'poc-deadline-pill'},'Treba platiti')) :
              h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem'}}, U.fmtMoney(total,'RSD'))),
          isDue ? (auto ? h('a',{href:'#', className:'poc-action-link', style:{fontSize:'0.875rem', whiteSpace:'nowrap'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/porez/trajni-nalozi');}},'Trajni nalozi') : h(Button,{size:'sm', onClick:()=>store.navigate('app/porez')},'Plati')) :
            h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem', whiteSpace:'nowrap'}}, 'za '+Math.abs(daysLeft)+' '+U.dayWord(daysLeft)));
      })));
  }

  // Round 30, nalaz 2 (spec 8.4): 80/90/100 su tri različita praga, ne dva. Za 90% ("jače upozorenje")
  // nema posebne boje nacrtane ni u jednom frejmu, pa koristim POSTOJEĆI "danger" ton (isti kao 100%,
  // frejmovi ga već imaju) umesto da izmišljam treću boju — samo tekst razlikuje 90% od 100%.
  function LimitWarningBanner(){
    const s = useStore();
    const li = Sel.limitInfo(s);
    const tier = window.AIK.Rules.limit.limitWarningTier(li.pct);
    React.useEffect(()=>{ if(tier) window.AIK.Actions.Business.checkLimitThreshold(); }, [tier]);
    if(!tier) return null;
    const kind = tier >= 90 ? 'warn100' : 'warn80';
    return h('div',{className:'poc-limit-warn '+kind},
      h(Icons.triangleAlert,{width:22,height:22, style:{flexShrink:0, marginTop:2}}),
      h('div',{className:'body'},
        li.pct>=100 ?
          h(React.Fragment,null, h('b',null,'Prešao si limit za paušalce'), 'Menja se način oporezivanja. Dalje poslovne knjige nisu u obimu ovog prototipa. Razgovaraj sa AI ili ljudskim knjigovođom o sledećim koracima.',
            h('div',{style:{marginTop:10}}, h(Button,{size:'sm', onClick:()=>store.navigate('app/ai')},'Pitaj AI knjigovođu'))) :
        li.pct>=90 ?
          h(React.Fragment,null, h('b',null,'Dostigao si '+U.fmtNum(li.pct,1)+'% godišnjeg limita'), `Kad ga pređeš, menja se način oporezivanja. Proveri šta to znači pre nove velike fakture.`,
            h('div',{className:'row', style:{gap:8, marginTop:10, flexWrap:'wrap'}},
              h(Button,{size:'sm', variant:'secondary', onClick:()=>store.navigate('app/ai')},'Pitaj AI šta to znači'),
              h(Button,{size:'sm', onClick:()=>store.navigate('app/knjiga')},'Prihod po mesecima'))) :
          h(React.Fragment,null, h('b',null,'Približavaš se limitu za paušalce'), `Do 6.000.000 din ti je ostalo ${U.fmtMoney(li.remaining,'RSD')}. Kad ga pređeš, gubiš pravo na paušalno oporezivanje, pa te upozoravam unapred. `,
            h('a',{href:'#', className:'poc-action-link', onClick:(e)=>{e.preventDefault(); store.navigate('app/porez');}},'Vidi na stranici Porez i rokovi'))));
  }

  // 9 (6.10.1, 5.5): Sub1 (ističe uskoro), Sub2 (istekao/otkazan-posle-roka), Sub12 (QR obnova uskoro).
  function SubscriptionStatusBanner(){
    const s = useStore();
    const b = Sel.subscriptionBanner(s);
    if(!b) return null;
    if(b.kind==='trial_ending') return h('div',{className:'sub-poc-banner warn'},
      h(Icons.clock,{width:22,height:22,style:{flexShrink:0}}),
      h('div',{className:'body'}, h('span',{className:'t'}, 'Probni period ističe za '+b.days+' '+U.dayWord(b.days)+', '+U.fmtLongGen(s.subscription.trialEndsAt)+'.'),
        h('span',{className:'s'},'Do tada sve radi. Posle toga AI knjigovođa se pauzira dok ne izabereš plan, a tvoji podaci ostaju sačuvani.')),
      h(Button,{size:'sm', variant:'secondary', onClick:()=>store.navigate('app/pretplata/plan')},'Vidi planove'));
    if(b.kind==='expired'){
      // Razlog pauze: probni period istekao (frejm Sub2/spec 5.5) ili otkazana pretplata posle kraja plaćenog
      // perioda (nema frejm/spec primer za ovaj uzrok — tekst je naša procena po analogiji sa probnim periodom).
      const canceled = s.subscription.status==='Otkazana';
      const title = canceled ? 'Pretplata je otkazana '+U.fmtLongGen(s.subscription.accessUntil)+'.' : 'Probni period je istekao '+U.fmtLongGen(s.subscription.trialEndsAt)+'.';
      return h('div',{className:'sub-poc-banner danger'},
        h(Icons.triangleAlert,{width:22,height:22,style:{flexShrink:0}}),
        h('div',{className:'body'}, h('span',{className:'t'}, title),
          h('span',{className:'s'},'AI knjigovođa je pauziran. Izaberi plan da nastavi.')),
        h(Button,{size:'sm', onClick:()=>store.navigate('app/pretplata/plan')},'Izaberi plan'));
    }
    if(b.kind==='qr_renewal') return h('div',{className:'sub-poc-banner info'},
      h(Icons.qr,{width:22,height:22,style:{flexShrink:0}}),
      h('div',{className:'body'}, h('span',{className:'t'},'Pretplata se obnavlja za '+b.days+' '+U.dayWord(b.days)+'.'),
        h('span',{className:'s'},'Plaćaš preko QR koda, pa se sama ne naplaćuje. Plati do '+U.fmtLongGen(b.nextChargeAt)+' da AI knjigovođa nastavi bez pauze.')),
      h(Button,{size:'sm', onClick:()=>store.navigate('app/pretplata/placanje/'+s.subscription.period)},'Plati QR kodom'));
    return null;
  }

  // Sub2: dodatni panel kad je AI knjigovođa stvarno pauziran (istekao probni ili otkazano posle roka) — prikazan ispod ostatka Početne.
  function AiPausedPanel(){
    const s = useStore();
    if(!Sel.subscriptionAccess(s).aiPaused) return null;
    const title = s.subscription.status==='Otkazana' ? 'Pretplata je otkazana' : 'Probni period je istekao';
    return h('div',{className:'sub-paused-panel'},
      h('span',{className:'icon'}, h(Icons.lock,{width:24,height:24})),
      h('div',{className:'stack', style:{gap:8}}, h('span',{className:'t'},title),
        h('span',{className:'faint'},'Izaberi plan da AI knjigovođa nastavi da radi. Do tada sve vidiš i možeš da izvezeš, ali ništa novo ne knjižim, ne šaljem i ne podsećam.')),
      h('div',{className:'notes'},
        h('div',{className:'row', style:{gap:12}}, h(Icons.check,{width:18,height:18}), h('span',{className:'sub-muted-dark'},'Fakture, uplate i podaci o firmi su sačuvani.')),
        h('div',{className:'row', style:{gap:12}}, h(Icons.check,{width:18,height:18}), h('span',{className:'sub-muted-dark'},'Rokove za porez i dalje vidiš, ali te ne podsećam.'))),
      h('div',{className:'row', style:{justifyContent:'space-between', alignItems:'center'}},
        h('a',{href:'#', className:'poc-action-link', style:{fontSize:'0.875rem'}, onClick:e=>{e.preventDefault(); store.toast('Podaci su izvezeni.');}},'Izvezi moje podatke'),
        h(Button,{onClick:()=>store.navigate('app/pretplata/plan')},'Izaberi plan')));
  }

  function WelcomeTourModal(props){
    return h(Components.Modal,{title:null, onClose:props.onClose, footer:[
        h(Button,{key:'s', variant:'secondary', onClick:props.onClose},'Preskoči'),
        h(Button,{key:'g', onClick:()=>{ props.onClose(); window.AIK.store.setState(s=>({dev:Object.assign({},s.dev,{tourStep:1})})); }},'Pokaži mi (1 minut)')]},
      h('div',{className:'stack', style:{textAlign:'center', alignItems:'center'}},
        h('span',{className:'icon-circle-56', style:{background:'var(--sidebar-item-active)', color:'var(--suma)'}}, h(Icons.robot,{width:24,height:24})),
        h('div',{style:{fontSize:'1.25rem'}}, 'Dobro došao, '+U.firstNameVoc(props.name)),
        h('p',{style:{margin:0, color:'var(--text-muted)'}},'Za jedan minut ti pokazujem gde šta stoji. Možeš da preskočiš i da se vratiš kad god poželiš, iz menija Pomoć i vodič.'),
        h('div',{className:'stack-sm', style:{textAlign:'left', width:'100%'}},
          ['Pratim tvoj prihod i limit','Pripremam porez i rokove','Pišem fakture i knjižim uplate'].map((t2,i)=> h('div',{key:i, className:'row', style:{gap:10}}, h(Icons.checkCircle,{width:16,height:16,style:{color:'var(--suma)', flexShrink:0}}), h('span',null,t2))))));
  }

  // Vodič kroz aplikaciju (25. krug, Korak 3; Tur1-4 — Tur0 je WelcomeTourModal iznad, već tačan).
  // Frejm crta fiksne piksel-pozicije (jedna širina), prototip ume da ciljni element bude bilo gde —
  // zato se spotlight/kartica računaju uživo preko getBoundingClientRect, ne kopiraju frejmove brojeve.
  const TOUR_STEPS = [
    {tour:'pocni-ovde', title:'Odavde počinješ', body:'Ovo je tvoja lista. Svaki korak otključava deo aplikacije, a ja ti kažem šta je sledeće.'},
    {tour:'limit', title:'Tvoj limit na jednom mestu', titleMobile:'Tvoj limit', body:'Pratim prihod prema limitu za paušalce i javim ti pre nego što mu se približiš.'},
    {tour:'nav', title:'Sve ostalo je ovde',
      bodyDesktop:'Fakture, porez i rokovi, mejlovi banke i AI knjigovođa. Brojke pored stavki znače da nešto čeka tebe.',
      bodyMobile:'Fakture, porez i meni Više. Dugme Faktura uvek pravi novu fakturu.'},
    {tour:'notifications', title:'Obaveštenja i rokovi', titleMobile:'Obaveštenja',
      bodyDesktop:'Ovde ti javljam uplate, rokove i sve što ne mogu da uradim bez tebe.',
      bodyMobile:'Ovde ti javljam uplate i rokove. Profil je pored zvonca.'},
  ];
  function finishTour(){ window.AIK.store.setState(s=>({dev:Object.assign({},s.dev,{tourStep:0, tourSeen:true})})); }
  function TourOverlay(props){
    const step = props.step; // 1-4
    const i = step-1;
    const isMobile = useIsMobile();
    const def = TOUR_STEPS[i];
    const selector = def.tour==='nav' ? (isMobile?'.bottom-nav':'.sidebar-nav') : '[data-tour="'+def.tour+'"]';
    const [rect,setRect] = useState(null);
    useEffect(()=>{
      function measure(){ const el = document.querySelector(selector); setRect(el?el.getBoundingClientRect():null); }
      measure();
      window.addEventListener('resize', measure);
      const id = setInterval(measure, 200);
      return ()=>{ window.removeEventListener('resize', measure); clearInterval(id); };
    }, [step, isMobile]);
    if(!rect) return null;
    const pad = 6;
    const spot = {left:rect.left-pad, top:rect.top-pad, width:rect.width+pad*2, height:rect.height+pad*2};
    const vw = window.innerWidth, vh = window.innerHeight;
    const cardW = Math.min(360, vw-32);
    const spaceBelow = vh-(spot.top+spot.height), spaceAbove = spot.top;
    let cardLeft, cardTop, arrowSide;
    if(def.tour==='nav' && !isMobile){
      cardLeft = Math.max(16, Math.min(vw-cardW-16, spot.left+spot.width+16));
      cardTop = Math.max(16, Math.min(vh-16, spot.top+40));
      arrowSide = 'left';
    } else if(spaceBelow>=170 || spaceBelow>=spaceAbove){
      cardTop = spot.top+spot.height+16;
      cardLeft = Math.max(16, Math.min(vw-cardW-16, spot.left+spot.width/2-cardW/2));
      arrowSide = 'top';
    } else {
      cardTop = spot.top-16;
      cardLeft = Math.max(16, Math.min(vw-cardW-16, spot.left+spot.width/2-cardW/2));
      arrowSide = 'bottom';
    }
    const arrowH = arrowSide!=='left' ? Math.max(20, Math.min(cardW-28, spot.left+spot.width/2-cardLeft-7)) : null;
    const title = (isMobile && def.titleMobile) || def.title;
    const body = def.bodyDesktop ? (isMobile?def.bodyMobile:def.bodyDesktop) : def.body;
    return h('div',{style:{position:'fixed', inset:0, zIndex:150}},
      h('div',{style:Object.assign({position:'fixed', boxShadow:'0 0 0 3000px rgba(15,42,34,0.62)', borderRadius:12, outline:'2px solid #C8F169', outlineOffset:3, pointerEvents:'none'}, spot)}),
      h('div',{className:'tour-card', style: arrowSide==='bottom' ?
          {position:'fixed', left:cardLeft, bottom:vh-cardTop, width:cardW} :
          {position:'fixed', left:cardLeft, top:cardTop, width:cardW}},
        arrowSide==='left' ? h('span',{className:'tour-arrow', style:{left:-7, top:32}}) :
          h('span',{className:'tour-arrow', style: arrowSide==='bottom' ? {bottom:-7, left:arrowH} : {top:-7, left:arrowH}}),
        h('span',{style:{fontSize:'1.25rem', letterSpacing:'-0.01em'}}, title),
        h('span',{style:{fontSize:'0.875rem', lineHeight:1.5, color:'var(--text-muted)'}}, body),
        h('div',{style:{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}},
          h('div',{style:{display:'flex', alignItems:'center', gap:12}},
            h('div',{style:{display:'flex', gap:4, alignItems:'center'}}, TOUR_STEPS.map((_,di)=> h('span',{key:di, className:'tour-dot'+(di===i?' active':'')}))),
            h('a',{href:'#', style:{fontSize:'0.875rem', textDecoration:'underline', textUnderlineOffset:'3px'}, onClick:(e)=>{e.preventDefault(); finishTour();}},'Preskoči')),
          h('div',{style:{display:'flex', gap:8}},
            step>1 ? h(Button,{size:'sm', variant:'secondary', style:{height:32}, onClick:()=>window.AIK.store.setState(s=>({dev:Object.assign({},s.dev,{tourStep:step-1})}))}, 'Nazad') : null,
            h(Button,{size:'sm', style:{height:32}, onClick:()=> step<4 ? window.AIK.store.setState(s=>({dev:Object.assign({},s.dev,{tourStep:step+1})})) : finishTour()}, step<4?'Dalje':'Gotovo')))));
  }

  function PocetnaScreen(){
    const s = useStore();
    const isMobile = useIsMobile();
    const checklist = Sel.setupChecklist(s);
    const allDone = checklist.every(c=>c.done);
    const [showWelcome,setShowWelcome] = useState(()=> !s.dev.welcomeSeen && !allDone);
    const closeWelcome = ()=>{ window.AIK.Actions.Dev.toggleFlag ? window.AIK.store.setState(st=>({dev:Object.assign({},st.dev,{welcomeSeen:true})})) : null; setShowWelcome(false); };
    return h('div',{className:'stack', style:{gap:24}},
      h(GreetingBanner,{s}),
      h(SubscriptionStatusBanner),
      h(LimitWarningBanner),
      !allDone ? h('div',{className:'poc-row'},
          h('div',{className:'poc-col-3'}, h(PocniOvdeCard)),
          h('div',{className:'poc-col-2', style:{gap:24}}, h(LimitCard), h(PoslednjeUplateCard))) :
        h(React.Fragment,null,
          h('div',{className:'poc-row'}, h('div',{className:'poc-col-3'}, h(LimitCard)), h('div',{className:'poc-col-2'}, h(CekaTebeCard))),
          h('div',{className:'poc-row'}, h('div',{className:'poc-col-3'}, h(PoslednjeUplateCard)), h('div',{className:'poc-col-2'}, h(NadolazeciRokoviCard)))),
      h(AiPausedPanel),
      showWelcome ? h(WelcomeTourModal,{name:s.user.name, onClose:closeWelcome}) : null,
      !showWelcome && s.dev.tourStep>0 ? h(TourOverlay,{step:s.dev.tourStep}) : null);
  }

  window.AIK = window.AIK || {};
  window.AIK.Screens = window.AIK.Screens || {};
  window.AIK.Screens.pocetna = PocetnaScreen;
})();
