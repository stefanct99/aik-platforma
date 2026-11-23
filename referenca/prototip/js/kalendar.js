// Faza 7: Kalendar (7.11) — Kl1 mesec, Kl2 dan, Kl3 lista, Kl4 porez detalj, Kl5 faktura detalj,
// Kl6 označi plaćeno, Kl7 podsetnici, Kl8 godina, Kl9 prazan mesec. Jedini izvor događaja je
// Sel.calendarEventsForMonth (koristi POSTOJEĆE Sel.taxDueDate/taxMonthlyTotal/taxMonthFullyPaid i
// Sel.invoicesWithEffectiveStatus — nema novog računanja iste stvari na drugom mestu, 7.11 pravilo).
(function(){
  const h = React.createElement;
  const { useState } = React;
  const U = window.AIK.Util;
  const Sel = window.AIK.Selectors;
  const store = window.AIK.store;
  const useStore = window.AIK.useStore;
  const useIsMobile = window.AIK.useIsMobile;
  const Icons = window.AIK.Icons;
  const { Button, SidePanel, Modal, Field, Input, Toggle } = window.AIK.Components;
  const DateTile = window.AIK.Porez.DateTile;

  const TYPE_LABEL = {drzava:'Država', dospeva:'Dospeva', kasni:'Kasni', ponavljajuca:'Ponavljajuća', rucni:'Ručni'};

  function EventPill(props){
    const { ev } = props;
    return h('div',{className:'kal-pill '+ev.type}, h('span',{className:'d'}), h('span',{className:'t'}, ev.title));
  }

  function monthDays(year, month){
    // month: 1-12. Vraća niz {date, inMonth} za 6 nedelja (Pon-Ned), kao frejm (Kl1: 26..1 na početku).
    const first = new Date(year, month-1, 1);
    const startOffset = (first.getDay()+6)%7; // 0=Pon
    const start = U.addDays(first, -startOffset);
    const out = [];
    for(let i=0;i<42;i++){
      const d = U.addDays(start, i);
      out.push({date:d, inMonth: d.getMonth()===month-1});
    }
    return out;
  }
  function isSameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

  function MonthGrid(props){
    const { year, month, events, isMobile, selectedDay, onSelectDay } = props;
    const TODAY = window.AIK.Seed.TODAY;
    const days = monthDays(year, month);
    const byDay = {};
    events.forEach(ev=>{ const k = ev.date.toDateString(); (byDay[k]=byDay[k]||[]).push(ev); });
    return h('div',{style:{background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden'}},
      !isMobile ? h('div',{className:'kal-grid-head'}, U.DAYS_SR_WEEK.map((d,i)=> h('div',{key:i}, d))) : null,
      h('div',{className:'kal-grid'},
        days.map((d,i)=>{
          const isToday = isSameDay(d.date, TODAY);
          const isSel = selectedDay && isSameDay(d.date, selectedDay);
          const dayEvents = byDay[d.date.toDateString()] || [];
          return h('div',Object.assign({key:i, className:'kal-cell'+(d.inMonth?'':' outside')+(isSel?' selected':'')}, window.AIK.a11yClick(()=>onSelectDay(d.date))),
            h('span',{className:'num'+(isToday?' today':'')}, d.date.getDate()),
            isMobile
              ? (dayEvents.length ? h('span',{className:'kal-dots'}, dayEvents.slice(0,4).map((ev,j)=> h('span',{key:j, className:'kal-dot '+ev.type}))) : null)
              : dayEvents.slice(0,2).map(ev=> h(EventPill,{key:ev.id, ev})));
        })));
  }

  function Legend(){
    return h('div',{className:'kal-legend'},
      [['drzava','#0F2A22','Država'],['dospeva','#D98E04','Dospeva'],['kasni','#B4281E','Kasni'],['ponavljajuca','#6BB21E','Ponavljajuća']].map(([k,c,l])=>
        h('span',{key:k}, h('span',{className:'d', style:{background:c}}), l)));
  }

  function LateInvoiceCard(props){
    const { inv, count } = props;
    const Invoices = window.AIK.Actions.Invoices;
    const headTxt = count+' '+U.plural(count,['faktura kasni','fakture kasne','faktura kasni']);
    return h('div',{className:'por-pib-err-card', style:{padding:16, gap:12}},
      h('div',{style:{display:'flex', alignItems:'center', gap:8, color:'#B4281E', fontSize:'1rem'}}, h(Icons.triangleAlert,{width:18,height:18}), h('span',null, headTxt)),
      h('div',{style:{display:'flex', justifyContent:'space-between', gap:12, fontSize:'1rem'}},
        h('div',{style:{display:'flex', flexDirection:'column', gap:2}}, h('span',null, inv.client?inv.client.name:''), h('span',{className:'muted', style:{fontSize:'0.875rem'}}, inv.number+', kasni '+U.lateDays(inv, window.AIK.Seed.TODAY)+' '+U.dayWord(U.lateDays(inv, window.AIK.Seed.TODAY)))),
        h('span',null, U.fmtMoney(inv.total, inv.currency))),
      h('div',{style:{display:'flex', gap:8}},
        h(Button,{style:{height:36}, onClick:()=>store.toast('Podsetnik je poslat.')},'Pošalji podsetnik'),
        h(Button,{variant:'secondary', style:{height:36}, onClick:()=>store.navigate('app/fakture/'+inv.id)},'Otvori')));
  }

  function SledeciRokoviCard(props){
    const { events } = props;
    return h('div',{className:'poc-card'},
      h('span',{style:{fontSize:'1.25rem', letterSpacing:'-0.01em'}},'Sledeći rokovi'),
      events.length===0 ? h('span',{className:'muted', style:{fontSize:'0.875rem'}},'Nema narednih rokova.') :
      events.slice(0,5).map(ev=> h('div',{key:ev.id, className:'kal-rok-row'},
        h('span',{className:'kal-rok-ic'}, h(ev.type==='ponavljajuca'?Icons.repeat:ev.type==='drzava'?Icons.percent:Icons.invoice,{width:18,height:18})),
        h('div',{style:{flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:2}},
          h('span',{style:{fontSize:'1rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}, ev.title),
          h('span',{className:'muted', style:{fontSize:'0.875rem'}}, U.fmtDateShort(ev.date))),
        ev.amount!=null ? h('span',{style:{flexShrink:0}}, U.fmtMoney(ev.amount, ev.currency)) : null)));
  }

  function EmptyMonthCard(props){
    const isMobile = window.AIK.useIsMobile();
    // PhKl9: dugme je bez ikonice, puna širina, 1rem — drugačije od standardnog .btn. Na desktopu (Kl9) ima ikonicu plusa.
    return h('div',{className:'poc-card'},
      h('span',{style:{display:'flex', width:48, height:48, borderRadius:9999, background:'var(--surface-2)', alignItems:'center', justifyContent:'center', color:'var(--text-muted)'}}, h(Icons.calendar,{width:22,height:22})),
      h('span',{style:{fontSize:'1.25rem', letterSpacing:'-0.01em'}},'Nema rokova u ovom mesecu'),
      // 27. krug (završna provera, Korak 2): PhKl9.dc.html ima KRAĆI tekst (bez druge rečenice) —
      // potvrđeno sirovim HTML-om, desktop Kl9.dc.html zadržava obe rečenice.
      h('span',{className:'muted'}, isMobile ? 'Rokovi se pojave čim izdaš fakturu ili poveže uplata.' : 'Rokovi se pojave čim izdaš fakturu ili poveže uplata. Možeš i sam da dodaš događaj.'),
      isMobile
        ? h(Button,{onClick:props.onAdd, style:{width:'100%', fontSize:'1rem'}},'Dodaj događaj')
        : h(Button,{icon:Icons.plus, onClick:props.onAdd},'Dodaj događaj'));
  }

  function DayPanel(props){
    const { day, events, onOpen } = props;
    const TODAY = window.AIK.Seed.TODAY;
    const diffDays = Math.round((new Date(day.getFullYear(),day.getMonth(),day.getDate()) - new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate()))/86400000);
    const rel = diffDays===0?'Danas':diffDays===1?'Sutra':U.fmtDateShort(day);
    return h('div',{className:'poc-card'},
      h('span',{style:{fontSize:'1.25rem', letterSpacing:'-0.01em'}}, U.DAYS_SR_FULL[(day.getDay()+6)%7]+', '+day.getDate()+'. '+U.MONTHS_SR[day.getMonth()]),
      h('span',{className:'muted'}, rel+', '+events.length+' '+U.plural(events.length,['događaj','događaja','događaja'])),
      events.length===0 ? h('span',{className:'muted', style:{fontSize:'0.875rem'}},'Nema događaja ovog dana.') :
      events.map(ev=> h('div',{key:ev.id, style:{display:'flex', flexDirection:'column', gap:10, padding:'14px 0', borderTop:'1px solid var(--border)'}},
        h('div',{style:{display:'flex', justifyContent:'space-between', gap:12}},
          h('span',{style:{fontSize:'1rem'}}, ev.type==='drzava'?ev.title:ev.title),
          h('span',null, U.fmtMoney(ev.amount, ev.currency))),
        h('span',{className:'muted', style:{fontSize:'0.875rem'}}, ev.type==='drzava' ? ('Za '+Sel.taxServiceMonthName(ev.monthKey)+', rok '+U.fmtDateShort(ev.date)) : ev.sub),
        h('div',{style:{display:'flex', gap:10, flexWrap:'wrap'}},
          ev.type==='drzava' ? h(Button,{variant:'secondary', size:'sm', onClick:()=>onOpen({kind:'mark-paid', ev})},'Označi kao plaćeno') : null,
          ev.type==='kasni' ? h(Button,{variant:'secondary', size:'sm', onClick:()=>store.toast('Podsetnik je poslat.')},'Pošalji podsetnik') : null,
          ev.type!=='rucni' ? h(Button,{size:'sm', onClick:()=>onOpen({kind:'detail', ev})},'Detalji') : null))));
  }

  function ListView(props){
    const { events, lateEvents, isMobile } = props;
    const TODAY = window.AIK.Seed.TODAY;
    const today0 = new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate());
    const groups = [];
    // Kasni je trajno stanje (dok se ne plati), ne vezano za prikazani mesec — zato odvojen izvor,
    // ne samo events.filter (koji bi izostavio fakturu dospelu u prethodnom mesecu, 7.11 Kl3).
    const lateIds = new Set((lateEvents||[]).map(e=>e.id));
    const kasni = (lateEvents||[]).concat(events.filter(e=>e.type==='kasni' && !lateIds.has(e.id)));
    if(kasni.length) groups.push(['Kasni', kasni]);
    const rest = events.filter(e=>e.type!=='kasni');
    const byDate = {};
    rest.forEach(ev=>{ const k = ev.date.toDateString(); (byDate[k]=byDate[k]||[]).push(ev); });
    Object.keys(byDate).sort((a,b)=> new Date(a)-new Date(b)).forEach(k=>{
      const d = new Date(k);
      const diff = Math.round((d-today0)/86400000);
      const label = diff===0?'Danas':diff===1?'Sutra, '+U.fmtDateShort(d):U.fmtDateShort(d);
      groups.push([label, byDate[k]]);
    });
    return h('div',{className:'poc-card'},
      groups.length===0 ? h('span',{className:'muted'},'Nema rokova u ovom mesecu.') :
      groups.map(([label,items],gi)=> h('div',{key:gi},
        h('div',{className:'kal-list-group-head'}, label),
        // PhKl3: frejm nema akciono dugme u redu na telefonu (potvrđeno, 0 pojava teksta dugmića) — ceo
        // red mora biti dodirljiv umesto toga, isti obrazac kao MailRow (Mejlovi banke) na mobilnom.
        items.map(ev=> h('div',Object.assign({key:ev.id, className:'kal-list-row'}, isMobile ? window.AIK.a11yClick(()=>props.onOpen(ev)) : {}),
          !isMobile ? h('span',{className:'kal-rok-ic'}, h(ev.type==='ponavljajuca'?Icons.repeat:ev.type==='drzava'?Icons.percent:Icons.invoice,{width:18,height:18})) : null,
          h('div',{style:{flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:2}},
            h('span',{style:{fontSize:'1rem'}}, ev.title),
            h('span',{className:'muted', style:{fontSize:'0.875rem'}}, ev.type==='drzava'?'Plaćanje državi':ev.type==='ponavljajuca'?'Ponavljajuća faktura se šalje':ev.type==='kasni'?ev.sub:TYPE_LABEL[ev.type])),
          h('span',{style:{flexShrink:0}}, U.fmtMoney(ev.amount, ev.currency)),
          !isMobile ? h(Button,{variant:'secondary', size:'sm', onClick:()=>props.onOpen(ev)}, ev.type==='drzava'?'Označi kao plaćeno':ev.type==='kasni'?'Pošalji podsetnik':'Detalji') : null)))));
  }

  const TYPE_DOT_COLOR = {drzava:'#0F2A22', dospeva:'#D98E04', kasni:'#B4281E', ponavljajuca:'#6BB21E'};
  // Kl8 (raw HTML): naslov je 1rem (ne 1.25rem), svaki mesec ima red tačkica — JEDNA po TIPU događaja
  // prisutnom tog meseca (ne po događaju) — tekuci mesec dobija 2px uokvirenje I "sad" PORED naslova
  // (ne umesto broja događaja — broj ostaje ispod kao i za sve ostale mesece).
  function YearView(props){
    const { year, monthsInfo, isMobile, onSelectMonth } = props;
    const TODAY = window.AIK.Seed.TODAY;
    return h('div',{className:'kal-year-grid'},
      U.MONTHS_SR.map((m,i)=>{
        const info = monthsInfo[i+1] || {count:0, types:[]};
        const orderedTypes = ['drzava','dospeva','kasni','ponavljajuca'].filter(t=>info.types.includes(t));
        const isNow = TODAY.getFullYear()===year && TODAY.getMonth()===i;
        return h('div',Object.assign({key:i, className:'kal-year-card'+(isNow?' now':'')}, window.AIK.a11yClick(()=>onSelectMonth(i+1))),
          h('div',{style:{display:'flex', justifyContent:'space-between', fontSize:'1rem'}},
            h('span',{style:{textTransform:'capitalize'}}, m),
            isNow ? h('span',{className:'now', style:{fontSize:'0.875rem'}},'sad') : null),
          orderedTypes.length ? h('div',{className:'kal-year-dots'}, orderedTypes.map(t=> h('span',{key:t, style:{background:TYPE_DOT_COLOR[t]}}))) : null,
          h('span',{className:'muted', style:{fontSize:'0.875rem'}}, info.count+' '+U.plural(info.count,['događaj','događaja','događaja'])));
      }));
  }

  function TaxDetailPanel(props){
    const { ev, onClose } = props;
    const paid = ev.status==='Plaćeno';
    return h(SidePanel,{title:'Porez i doprinosi', onClose,
      footer:[h(Button,{key:'c', variant:'secondary', onClick:onClose},'Zatvori'),
        !paid?h(Button,{key:'p', onClick:()=>{ window.AIK.Actions.Porez.markAllPaid(ev.monthKey); store.toast('Označeno kao plaćeno.'); onClose(); }},'Označi kao plaćeno'):null]},
      h('div',{className:'stack', style:{gap:20}},
        h('div',null, h('div',{style:{fontSize:'1.25rem'}}, ev.title), h('div',{style:{fontSize:'1.5rem', letterSpacing:'-0.02em', marginTop:8}}, U.fmtMoney(ev.amount,'RSD'))),
        h('div',{className:'muted'}, 'Rok '+U.fmtDate(ev.date)),
        h('span',{className: paid?'poc-auto-pill':'poc-deadline-pill'}, paid?'Plaćeno':'Čeka plaćanje'),
        h('div',{className:'stack', style:{gap:2}}, h('span',{className:'muted', style:{fontSize:'0.875rem'}},'Primalac'), h('span',null,'Poreska uprava')),
        h('div',{className:'stack', style:{gap:2}}, h('span',{className:'muted', style:{fontSize:'0.875rem'}},'Račun'), h('span',null,'840-••••••••-••')),
        h('div',{className:'stack', style:{gap:2}}, h('span',{className:'muted', style:{fontSize:'0.875rem'}},'Poziv na broj'), h('span',null,'97 ••••••••••••')),
        h('div',{className:'stack', style:{gap:2}}, h('span',{className:'muted', style:{fontSize:'0.875rem'}},'Svrha'), h('span',null,'Porez i doprinosi')),
        h('div',{style:{padding:16, borderRadius:10, background:'var(--surface-2)'}},
          h('div',{style:{fontSize:'1rem'}},'Plati preko mobilnog bankarstva'),
          h('div',{className:'muted', style:{fontSize:'0.875rem'}},'Skeniraj kod i uplatnica je popunjena.'))));
  }

  function InvoiceDetailPanel(props){
    const { ev, onClose } = props;
    const s = useStore();
    const inv = s.invoices.find(i=>i.id===ev.invoiceId);
    if(!inv) return null;
    const client = s.clients.find(c=>c.id===inv.clientId);
    const Invoices = window.AIK.Actions.Invoices;
    return h(SidePanel,{title:'Kasna faktura', onClose,
      footer:[h(Button,{key:'c', variant:'secondary', onClick:()=>store.toast('Faktura je otpisana (nije deo prototipa).')},'Otpiši fakturu'),
        h(Button,{key:'p', onClick:()=>{ Invoices.markPaid(inv.id); onClose(); }},'Označi kao plaćeno')]},
      h('div',{className:'stack', style:{gap:20}},
        h('div',null, h('div',{style:{fontSize:'1.25rem'}}, client?client.name:''), h('div',{style:{fontSize:'1.5rem', letterSpacing:'-0.02em', marginTop:8}}, U.fmtMoney(U.invoiceTotal(inv), inv.currency))),
        h('span',{className:'poc-deadline-pill'},'Kasni '+U.lateDays(inv, window.AIK.Seed.TODAY)+' '+U.dayWord(U.lateDays(inv, window.AIK.Seed.TODAY))),
        h('div',{style:{display:'flex', justifyContent:'space-between'}}, h('span',{className:'muted'},'Faktura'), h('a',{href:'#', onClick:(e)=>{e.preventDefault(); store.navigate('app/fakture/'+inv.id);}}, inv.number+' · Otvori')),
        h('div',{style:{display:'flex', justifyContent:'space-between'}}, h('span',{className:'muted'},'Izdata'), h('span',null, U.fmtDate(inv.issueDate))),
        h('div',{style:{display:'flex', justifyContent:'space-between'}}, h('span',{className:'muted'},'Rok za plaćanje'), h('span',null, U.fmtDate(U.invoiceDueDate(inv)))),
        h('div',{style:{display:'flex', justifyContent:'space-between'}}, h('span',{className:'muted'},'Poslednji podsetnik'), h('span',null,'Nije poslat')),
        h('div',{style:{padding:16, borderRadius:10, background:'var(--surface-2)'}},
          h('div',{className:'muted', style:{fontSize:'0.875rem'}},'Pripremio sam uljudan podsetnik. Pregledaš ga pre slanja.')),
        h(Button,{variant:'secondary', onClick:()=>store.toast('Podsetnik je spreman za pregled (nije deo prototipa).')},'Pregledaj podsetnik')));
  }

  function MarkPaidModal(props){
    const { ev, onClose } = props;
    const [date,setDate] = useState(U.fmtDate(window.AIK.Seed.TODAY,'iso'));
    // Kl6 (raw HTML): BEZ X dugmeta za zatvaranje u zaglavlju, dugmad STACKED (kolona), primarno PRVO.
    return h(Modal,{title:'Označi kao plaćeno', onClose, hideClose:true, stackedFooter:true, footer:[
      h(Button,{key:'c', variant:'secondary', onClick:onClose},'Odustani'),
      h(Button,{key:'p', onClick:()=>{ window.AIK.Actions.Porez.markAllPaid(ev.monthKey); store.toast('Označeno kao plaćeno.'); onClose(); }},'Označi kao plaćeno')]},
      h('div',{className:'stack', style:{gap:16}},
        h('p',{className:'muted', style:{margin:0}}, ev.title+', '+U.fmtMoney(ev.amount,'RSD')+'. Rok prelazi u istoriju i podsetnik se gasi.'),
        h(Field,{label:'Datum plaćanja'}, h(Input,{type:'date', value:date, onChange:e=>setDate(e.target.value)})),
        h(Field,{label:'Plaćeni iznos'}, h(Input,{value:U.fmtMoney(ev.amount,'RSD'), disabled:true}))));
  }

  // Kl7/PhKl7 (raw HTML): SidePanel (560px desno, senka, dimovan pozadina) na desktopu, donji sheet sa
  // ručkom na telefonu — isti obrazac kao Kl4/Kl5, NE centriran Modal (koji je ovde bio pogrešno korišćen).
  // Sve stavke su STVARNI prekidači (ne statične "Uključeno" pilule), sa sitnim naslovom "Kako te
  // podsećam" iznad i "Kada" iznad druge grupe (oba 0.875rem, blago, ne 1.25rem naslov) — sve 6 redova
  // deli isti red-sa-prekidačem i gornju liniju. Podrazumevano uključeno osim "Kad faktura kasni".
  function RemindersModal(props){
    const { onClose } = props;
    const [vals,setVals] = useState({app:true, mail:true, d7:true, d3:true, onDue:true, late:false});
    function row(key,t1,t2){
      return h('div',{style:{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'12px 0', borderTop:'1px solid var(--border)'}},
        h('div',{style:{display:'flex', flexDirection:'column', gap:2}}, h('span',{style:{fontSize:'1rem'}},t1), h('span',{className:'muted', style:{fontSize:'0.875rem'}}, t2)),
        h(Toggle,{on:vals[key], onChange:(v)=>setVals(x=>Object.assign({},x,{[key]:v}))}));
    }
    return h(SidePanel,{title:'Podsetnici', onClose, footer:[
      h(Button,{key:'c', variant:'secondary', onClick:onClose},'Odustani'),
      h(Button,{key:'s', onClick:()=>{ store.toast('Podsetnici su sačuvani.'); onClose(); }},'Sačuvaj')]},
      h('div',{className:'stack', style:{gap:4}},
        h('span',{className:'muted', style:{fontSize:'0.875rem'}},'Kako te podsećam'),
        row('app','Obaveštenje u aplikaciji','Zvonce i obaveštenje na telefonu'),
        row('mail','Mejl','Na adresu tvog naloga'),
        h('span',{className:'muted', style:{fontSize:'0.875rem', marginTop:12}},'Kada'),
        row('d7','7 dana ranije','Za rokove prema državi'),
        row('d3','3 dana ranije','Za rokove prema državi'),
        row('onDue','Na dan roka','Ujutru u 09:00'),
        row('late','Kad faktura kasni','Svakih 7 dana dok se ne plati')));
  }

  function AddEventModal(props){
    const { onClose } = props;
    const [title,setTitle] = useState('');
    const [date,setDate] = useState(U.fmtDate(window.AIK.Seed.TODAY,'iso'));
    const [note,setNote] = useState('');
    function save(){
      if(!title.trim()) { store.toast('Unesi naslov.'); return; }
      window.AIK.Actions.Calendar.addEvent({title, date:new Date(date).toISOString(), note});
      onClose();
    }
    return h(Modal,{title:'Dodaj događaj', onClose, footer:[
      h(Button,{key:'c', variant:'secondary', onClick:onClose},'Odustani'),
      h(Button,{key:'s', onClick:save},'Sačuvaj')]},
      h('div',{className:'stack', style:{gap:16}},
        h(Field,{label:'Naslov'}, h(Input,{value:title, onChange:e=>setTitle(e.target.value), placeholder:'Npr. Sastanak sa knjigovođom'})),
        h(Field,{label:'Datum'}, h(Input,{type:'date', value:date, onChange:e=>setDate(e.target.value)})),
        h(Field,{label:'Beleška (opciono)'}, h(Input,{value:note, onChange:e=>setNote(e.target.value)}))));
  }

  function KalendarScreen(){
    const s = useStore();
    const isMobile = useIsMobile();
    const TODAY = window.AIK.Seed.TODAY;
    const [view,setView] = useState('mesec');
    const [cursor,setCursor] = useState({year:TODAY.getFullYear(), month:TODAY.getMonth()+1});
    const [selectedDay,setSelectedDay] = useState(null);
    const [overlay,setOverlay] = useState(null); // {kind:'reminders'|'add'|'detail'|'mark-paid', ev}
    const [listFilter,setListFilter] = useState('svi'); // Kl3: Svi|Država|Fakture|Kasne (desktop samo, PhKl3 nema čipove)

    const events = Sel.calendarEventsForMonth(s, cursor.year, cursor.month);
    const lateInvoices = s.invoices.map(inv=> Object.assign({}, inv, {effectiveStatus:U.invoiceEffectiveStatus(inv, TODAY), total:U.invoiceTotal(inv), client:s.clients.find(c=>c.id===inv.clientId)})).filter(i=>i.effectiveStatus==='Kasni');
    const lateEvents = lateInvoices.map(inv=> ({id:'inv-'+inv.id, date:U.invoiceDueDate(inv), type:'kasni', title:inv.number+', '+(inv.client?inv.client.name:''), sub:'Dospelo '+U.fmtDateShort(U.invoiceDueDate(inv))+', kasni '+U.lateDays(inv,TODAY)+' '+U.dayWord(U.lateDays(inv,TODAY)), amount:inv.total, currency:inv.currency, route:'app/fakture/'+inv.id, invoiceId:inv.id}));
    // 27. krug (završna provera, Korak 3): spec 6.3 korak 5 — "kad su sve četiri stavke plaćene... rok
    // nestaje iz Čeka tebe" — dogadjaj tipa 'drzava' ostaje u `events` (za mesečni prikaz/detalj) ali se
    // više ne pojavljuje u "Sledeći rokovi" čim je ceo mesec plaćen (bio je i dalje prikazivan uprkos
    // status:'Plaćeno', jedini uslov je bio datum).
    const upcoming = events.filter(e=> e.date >= new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate()) && e.type!=='kasni' && e.status!=='Plaćeno');

    function go(delta){
      if(view==='godina'){ setCursor(c=>({year:c.year+delta, month:c.month})); return; }
      let m = cursor.month+delta, y = cursor.year;
      if(m>12){ m=1; y++; } if(m<1){ m=12; y--; }
      setCursor({year:y, month:m});
      setSelectedDay(null);
    }
    function today(){ setCursor({year:TODAY.getFullYear(), month:TODAY.getMonth()+1}); setSelectedDay(null); }
    function selectDay(d){ setSelectedDay(d); if(d.getMonth()+1!==cursor.month || d.getFullYear()!==cursor.year) setCursor({year:d.getFullYear(), month:d.getMonth()+1}); }
    function openEvent(ev){
      // Kl5 ("Kasna faktura") postoji samo za kasne fakture — za "dospeva" (još nije kasna) nema
      // poseban frejm, pa "Detalji" vodi direktno na pravu stranicu fakture.
      if(ev.type==='drzava') setOverlay({kind:'tax', ev});
      else if(ev.type==='kasni' && ev.invoiceId) setOverlay({kind:'invoice', ev});
      else if(ev.route) store.navigate(ev.route);
    }

    const title = view==='godina' ? String(cursor.year) : U.MONTHS_SR[cursor.month-1].charAt(0).toUpperCase()+U.MONTHS_SR[cursor.month-1].slice(1)+' '+cursor.year;

    const dayEvents = selectedDay ? Sel.calendarEventsForMonth(s, selectedDay.getFullYear(), selectedDay.getMonth()+1).filter(e=>isSameDay(e.date, selectedDay)) : [];

    // Dodatni donji razmak na telefonu (prikaz meseca) da poslednji red liste/kartice ne završi ispod
    // plutajućeg dugmeta (56px + 16px razmak od dna, iznad donje navigacije).
    return h('div',{className:'stack', style:{gap:20, paddingBottom:(isMobile && view==='mesec')?88:undefined}},
      h('div',{style:{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap'}},
        h('div',null, h('h1',{style:{margin:0, fontSize:'var(--fs-24-32)'}},'Kalendar'), h('p',{className:'faint', style:{margin:0}},'Rokovi za državu, fakture i ponavljajuće fakture na jednom mestu.')),
        !isMobile ? h('div',{style:{display:'flex', gap:10}},
          h(Button,{variant:'secondary', onClick:()=>setOverlay({kind:'reminders'})},'Podsetnici'),
          h(Button,{icon:Icons.plus, onClick:()=>setOverlay({kind:'add'})},'Dodaj događaj')) : null),
      // Frejm (PhKl1-PhKl8) nema "Podsetnici"/"Dodaj događaj" u zaglavlju na telefonu uopšte — jedino
      // mesto gde frejm pokazuje "Dodaj događaj" na telefonu je dugme UNUTAR praznog stanja (PhKl9,
      // EmptyMonthCard ispod). Van praznog meseca frejm ne nudi dodavanje događaja/podsetnika na
      // telefonu; ne improvizujem dodatno dugme mimo frejma (korisnik je eksplicitno tražio da se ne
      // improvizuje) — prijavljeno kao poznat nedostatak dizajna za telefon u izveštaju.
      // Kl3 (raw HTML): na Listi, filter čipovi (Svi/Država/Fakture/Kasne) dele ISTI red sa Mesec|Lista|
      // Godina segmentom (justify-content:space-between), ne poseban red iznad — i tu nema Legend-e.
      // Mesec/Godina zadržavaju segment kao svoj sopstveni, pun-širine red (nepromenjeno).
      (view==='lista' && !isMobile)
        ? h('div',{style:{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12}},
            h('div',{className:'chip-row'}, [['svi','Svi'],['drzava','Država'],['fakture','Fakture'],['kasne','Kasne']].map(([k,l])=>
              h('span',Object.assign({key:k, className:'inv-chip'+(listFilter===k?' active':'')}, window.AIK.a11yClick(()=>setListFilter(k))), l))),
            h('div',{className:'kal-seg'},
              [['mesec','Mesec'],['lista','Lista'],['godina','Godina']].map(([k,l])=>
                h('span',Object.assign({key:k, className:view===k?'active':''}, window.AIK.a11yClick(()=>{setView(k); setSelectedDay(null);})), l))))
        : h('div',{className:'kal-seg'},
            [['mesec','Mesec'],['lista','Lista'],['godina','Godina']].map(([k,l])=>
              h('span',Object.assign({key:k, className:view===k?'active':''}, window.AIK.a11yClick(()=>{setView(k); setSelectedDay(null);})), l))),
      view!=='lista' ? (isMobile
        ? h('div',{style:{display:'flex', alignItems:'center', justifyContent:'space-between'}},
            h('button',{className:'kal-navbtn', onClick:()=>go(-1)}, h(Icons.arrowRight,{width:16,height:16, style:{transform:'rotate(180deg)'}})),
            h('span',{style:{fontSize:'var(--fs-20-24)', letterSpacing:'-0.01em', textTransform:'capitalize'}}, title),
            h('button',{className:'kal-navbtn', onClick:()=>go(1)}, h(Icons.arrowRight,{width:16,height:16})))
        : h('div',{style:{display:'flex', alignItems:'center', justifyContent:'space-between'}},
            h('div',{style:{display:'flex', alignItems:'center', gap:12}},
              h('button',{className:'kal-navbtn', onClick:()=>go(-1)}, h(Icons.arrowRight,{width:16,height:16, style:{transform:'rotate(180deg)'}})),
              h('span',{style:{fontSize:'var(--fs-20-24)', letterSpacing:'-0.02em', minWidth:200, textAlign:'center', textTransform:'capitalize'}}, title),
              h('button',{className:'kal-navbtn', onClick:()=>go(1)}, h(Icons.arrowRight,{width:16,height:16}))),
            (view==='mesec'||view==='godina') ? h(Button,{variant:'secondary', onClick:today},'Danas') : null)) : null,
      view==='mesec' || view==='lista' ? h('div',{className:'row', style:{gap:24, alignItems:'flex-start', flexWrap:'wrap'}},
        h('div',{style:{flex:'3 1 480px', minWidth:0}},
          view==='mesec' ? h(MonthGrid,{year:cursor.year, month:cursor.month, events, isMobile, selectedDay, onSelectDay:selectDay}) :
            h(ListView,{
              events: events.filter(e=> listFilter==='svi' || (listFilter==='drzava'&&e.type==='drzava') || (listFilter==='fakture'&&(e.type==='dospeva'||e.type==='ponavljajuca')) || (listFilter==='kasne'&&e.type==='kasni')),
              lateEvents: (listFilter==='svi'||listFilter==='kasne') ? lateEvents : [],
              isMobile, onOpen:(ev)=> ev.type==='drzava' ? setOverlay({kind:'mark-paid', ev}) : (ev.type==='kasni' ? store.toast('Podsetnik je poslat.') : openEvent(ev))})),
        view==='mesec' ? h('div',{className:'kal-side'},
          !isMobile ? h(Legend) : null,
          selectedDay ? h(DayPanel,{day:selectedDay, events:dayEvents, onOpen:(o)=> o.kind==='mark-paid' ? setOverlay({kind:'mark-paid', ev:o.ev}) : openEvent(o.ev)}) :
            (events.length===0 ? h(EmptyMonthCard,{onAdd:()=>setOverlay({kind:'add'})}) : h(React.Fragment,null,
              lateInvoices.length ? h(LateInvoiceCard,{inv:lateInvoices.slice().sort((a,b)=>U.lateDays(b,TODAY)-U.lateDays(a,TODAY))[0], count:lateInvoices.length}) : null,
              h(SledeciRokoviCard,{events:upcoming})))) : null) : null,
      view==='godina' ? h(YearView,{year:cursor.year,
        monthsInfo: Object.fromEntries(Array.from({length:12},(_,i)=>{ const evs = Sel.calendarEventsForMonth(s, cursor.year, i+1); return [i+1, {count:evs.length, types:[...new Set(evs.map(e=>e.type))]}]; })),
        isMobile, onSelectMonth:(m)=>{ setCursor({year:cursor.year, month:m}); setView('mesec'); }}) : null,
      // Vlasnička odluka (20. krug, nema frejma za ovo): plutajuće "+" na telefonu, SAMO u prikazu meseca
      // (i sa događajima i prazno), otvara POSTOJEĆI AddEventModal (isti kao desktop, već ima telefonski
      // oblik). Sakriveno kad je dan izabran (DayPanel ima sopstvenu akciju) ili kad je bilo koji
      // overlay/dijalog otvoren (uključujući EmptyMonthCard-ovo sopstveno dugme — ne menja se, FAB mu
      // samo pravi društvo, isto dugme postoji i dalje).
      (isMobile && view==='mesec' && !selectedDay && !overlay) ? h('button',{type:'button', className:'kal-fab-add', onClick:()=>setOverlay({kind:'add'}), 'aria-label':'Dodaj događaj'}, h(Icons.plus,{width:24,height:24})) : null,
      overlay && overlay.kind==='reminders' ? h(RemindersModal,{onClose:()=>setOverlay(null)}) : null,
      overlay && overlay.kind==='add' ? h(AddEventModal,{onClose:()=>setOverlay(null)}) : null,
      overlay && overlay.kind==='tax' ? h(TaxDetailPanel,{ev:overlay.ev, onClose:()=>setOverlay(null)}) : null,
      overlay && overlay.kind==='invoice' ? h(InvoiceDetailPanel,{ev:overlay.ev, onClose:()=>setOverlay(null)}) : null,
      overlay && overlay.kind==='mark-paid' ? h(MarkPaidModal,{ev:overlay.ev, onClose:()=>setOverlay(null)}) : null);
  }

  window.AIK = window.AIK || {};
  window.AIK.Screens = window.AIK.Screens || {};
  window.AIK.Screens.kalendar = KalendarScreen;
})();
