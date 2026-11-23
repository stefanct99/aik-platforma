// Faza 4b: Knjiga prihoda (7.9), kursevi (8.3), limit (8.4).
(function(){
  const h = React.createElement;
  const { useState } = React;
  const { useStore, t, Components, useIsMobile } = window.AIK;
  const { Button, Field, Input, SidePanel, Modal, EmptyState, ImportBanner } = Components;
  const Icons = window.AIK.Icons;
  const store = window.AIK.store;
  const Sel = window.AIK.Selectors;
  const U = window.AIK.Util;
  const TODAY = window.AIK.Seed.TODAY;
  const IncA = window.AIK.Actions.Income;

  // Kp3 (27. krug): Godina izbor mora da uključi i NAREDNU godinu (spec 7.9 "Filteri: godina (2026,
  // 2027...)" i Kp3.dc.html sam frejm pokazuje izabranu 2027.) — bez ovoga prazno-stanje-nove-godine
  // se nikad nije moglo stvarno izabrati kroz pravi UI (samo kroz test-skriptu koja je tiho padala).
  function YEARS(){ const y = TODAY.getFullYear(); return [y+1, y, y-1, y-2]; }

  // Kp3/PhKp3 (27. krug, Korak 2): prazno stanje i dalje pokazuje glavnu statistiku karticu (izdvojena
  // kao MainStatCard da je prazno stanje može ponovo iskoristiti), samo bez bočnih kartica/tabele.
  function MainStatCard(props){
    const { yr, year } = props;
    return h('div',{className:'kpo-main-card'},
      h('div',{className:'stack-sm'}, h('span',{className:'l'},'Ukupan prihod u '+year+'.'), h('span',{className:'v'}, U.fmtMoney(yr.total,'RSD'))),
      h('div',{className:'kpo-main-bar'}, h('div',{style:{width:Math.min(100,yr.pct)+'%'}})),
      h('div',{className:'kpo-main-foot'}, h('span',null, U.fmtNum(yr.pct,1)+'% limita od '+U.fmtMoney(yr.limit,'RSD')), h('span',null,'Ostalo '+U.fmtMoney(yr.remaining,'RSD'))));
  }
  function RezimeRow(props){
    const { yr, year } = props;
    return h('div',{className:'kpo-stat-row'},
      MainStatCard({yr, year}),
      h('div',{className:'kpo-side-cards'},
        h('div',{className:'kpo-side-card'}, h('span',{className:'l'},'Devizni prihodi'), h('span',{className:'v'}, U.fmtMoney(yr.fxTotal,'RSD')), h('span',{className:'l'}, yr.fx.length+' '+U.plural(yr.fx.length,['uplata','uplate','uplata']))),
        h('div',{className:'kpo-side-card'}, h('span',{className:'l'},'Dinarski prihodi'), h('span',{className:'v'}, U.fmtMoney(yr.rsdTotal,'RSD')), h('span',{className:'l'}, yr.rsd.length+' '+U.plural(yr.rsd.length,['uplata','uplate','uplata'])))));
  }

  function DetailPanel(props){
    const { entry, kind, onClose } = props;
    const s = useStore();
    const client = entry.clientId ? s.clients.find(c=>c.id===entry.clientId) : null;
    const inv = entry.invoiceId ? s.invoices.find(i=>i.id===entry.invoiceId) : null;
    const rsd = kind==='fx' ? Math.round(entry.amount*entry.rate*100)/100 : entry.amount;
    const d = new Date(entry.date);
    const shortDate = String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.';
    return h(SidePanel,{title:'Prihod '+U.fmtDate(entry.date), onClose, footer:[
        h(Button,{key:'d', variant:'danger', onClick:()=>props.onDelete(entry, kind)},'Obriši prihod'),
        h(Button,{key:'c', variant:'secondary', onClick:onClose},'Zatvori')]},
      h('div',{className:'stack'},
        h('span',{style:{fontSize:'1.25rem'}}, 'Uplata od '+(client?client.name:'nepoznatog pošiljaoca')),
        h('div',{className:'inv-kv'}, h('span',{className:'k'},'Datum uplate'), h('span',{className:'v'}, U.fmtDate(entry.date))),
        h('div',{className:'inv-kv'}, h('span',{className:'k'},'Klijent'), h('span',{className:'v'}, client?client.name:'–')),
        h('div',{className:'inv-kv'}, h('span',{className:'k'},'Faktura'), h('span',{className:'v'}, inv ? h(React.Fragment,null, inv.number+' ', h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); onClose(); store.navigate('app/fakture/'+inv.id);}}, 'Otvori')) : '–')),
        h('div',{className:'inv-kv'}, h('span',{className:'k'},'Izvor'), h('span',{className:'v'}, entry.source==='Mejl banke' ? h(React.Fragment,null,'Mejl banke od '+shortDate+' ', h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:e=>e.preventDefault()},'Otvori mejl')) : 'Ručno')),
        kind==='fx' ? h(React.Fragment,null,
          h('div',{className:'inv-kv'}, h('span',{className:'k'},'Kurs'), h('span',{className:'v'}, U.fmtNum(entry.rate))),
          h('div',{className:'inv-kv'}, h('span',{className:'k'},'Upisano u dinarima'), h('span',{className:'v'}, U.fmtMoney(rsd,'RSD'))),
          h('p',{style:{margin:0, fontSize:'0.875rem', color:'var(--text-muted)'}},'Kurs je onaj po kom je banka preračunala priliv. Ako se razlikuje od onoga što vidiš u banci, ispravi ga ovde.')) : null,
        entry.desc ? h('div',{className:'inv-kv'}, h('span',{className:'k'},'Opis'), h('span',{className:'v'}, entry.desc)) : null));
  }

  function AddIncomeModal(props){
    const s = useStore();
    const [kind,setKind] = useState('Dinarski');
    const [clientId,setClientId] = useState('');
    const [date,setDate] = useState(U.fmtDate(TODAY,'iso'));
    const [amount,setAmount] = useState('');
    const [currency,setCurrency] = useState('EUR');
    const [rate,setRate] = useState(()=> U.nbsRate(new Date().toISOString(), 'EUR'));
    const [invoiceId,setInvoiceId] = useState('');
    const [desc,setDesc] = useState('');
    const openInvoices = s.invoices.filter(i=> (i.status==='Poslata') && (!clientId || i.clientId===clientId));
    function save(){
      IncA.add({kind, clientId, date, amount, currency: kind==='Devizni'?currency:undefined, rate: kind==='Devizni'?rate:undefined, invoiceId: invoiceId||null, desc});
      props.onClose();
    }
    return h(SidePanel,{title:'Dodaj prihod', onClose:props.onClose, footer:[
        h(Button,{key:'c', variant:'secondary', onClick:props.onClose},'Odustani'),
        h(Button,{key:'s', onClick:save},'Sačuvaj prihod')]},
      h('div',{className:'stack'},
        h(Field,{label:'Vrsta prihoda'}, h('div',{className:'inv-seg'}, ['Dinarski','Devizni'].map(k=> h('button',{key:k, type:'button', className:kind===k?'active':'', onClick:()=>setKind(k)}, k)))),
        h(Field,{label:'Klijent'}, h('select',{className:'select', value:clientId, onChange:e=>{setClientId(e.target.value); setInvoiceId('');}}, h('option',{value:''},'Nije poznat'), s.clients.map(c=>h('option',{key:c.id, value:c.id}, c.name)))),
        h(Field,{label:'Datum uplate'}, h(Input,{type:'date', value:date, onChange:e=>setDate(e.target.value)})),
        kind==='Devizni' ? h('div',{className:'inv-field-row'},
          h(Field,{label:'Valuta'}, h('select',{className:'select', value:currency, onChange:e=>{setCurrency(e.target.value); setRate(U.nbsRate(new Date(date).toISOString(), e.target.value));}}, ['EUR','USD','GBP','CHF'].map(c=>h('option',{key:c,value:c},c)))),
          h(Field,{label:'Iznos u '+currency}, h(Input,{type:'number', value:amount, onChange:e=>setAmount(e.target.value)})),
          h(Field,{label:'Kurs NBS'}, h(Input,{type:'number', step:'0.01', value:rate, onChange:e=>setRate(e.target.value)}))) :
          h(Field,{label:'Iznos u dinarima'}, h(Input,{type:'number', value:amount, onChange:e=>setAmount(e.target.value)})),
        kind==='Devizni' ? h('div',{className:'hint'},'Kod deviznog prihoda tražim još valutu i kurs.') : null,
        h(Field,{label:'Faktura (nije obavezno)'}, h('select',{className:'select', value:invoiceId, onChange:e=>setInvoiceId(e.target.value)},
          h('option',{value:''},'Bez fakture'), openInvoices.map(i=>h('option',{key:i.id, value:i.id}, i.number+' · '+U.fmtMoney(U.invoiceTotal(i), i.currency))))),
        h(Field,{label:'Opis (nije obavezno)'}, h(Input,{value:desc, placeholder:'npr. Gotovinska uplata, usluge dizajna', onChange:e=>setDesc(e.target.value)}))));
  }

  function ExportModal(props){
    const [year,setYear] = useState(TODAY.getFullYear());
    const [period,setPeriod] = useState('Cela godina');
    const [format,setFormat] = useState('PDF');
    const [splitTables,setSplitTables] = useState(true);
    const [grandTotal,setGrandTotal] = useState(true);
    return h(Modal,{title:'Izvezi knjigu prihoda', onClose:props.onClose, stackedFooter:true, footer:[
        h(Button,{key:'c', variant:'secondary', onClick:props.onClose},'Odustani'),
        h(Button,{key:'e', onClick:()=>{ store.toast('Knjiga prihoda je izvezena ('+format+').'); props.onClose(); }},'Izvezi')]},
      h('div',{className:'stack'},
        h('p',{style:{margin:0, color:'var(--text-muted)'}},'Dobijaš dokument koji možeš da pošalješ knjigovođi ili priložiš uz prijavu.'),
        h(Field,{label:'Godina'}, h('select',{className:'select', value:year, onChange:e=>setYear(Number(e.target.value))}, YEARS().map(y=>h('option',{key:y,value:y},y)))),
        h(Field,{label:'Period'}, h('div',{className:'inv-seg'}, ['Cela godina','Kvartal','Mesec'].map(p=> h('button',{key:p, type:'button', className:period===p?'active':'', onClick:()=>setPeriod(p)}, p)))),
        // Faza 10, trinaesti krug, korak 1b: frejm (Kp6) pokazuje SAMO PDF/Excel — "CSV" je bio treća opcija
        // koje nema u dizajnu, dodata negde ranije bez frejma. Uklonjeno.
        h(Field,{label:'Format'}, h('div',{className:'inv-seg'}, ['PDF','Excel'].map(f=> h('button',{key:f, type:'button', className:format===f?'active':'', onClick:()=>setFormat(f)}, f)))),
        // Frejm pokazuje OVO kao dve odvojene čekirane kučice (podrazumevano uključene), ne statičnu rečenicu.
        h('div',{className:'row', style:{gap:10, alignItems:'center'}}, h('input',{type:'checkbox', checked:splitTables, onChange:e=>setSplitTables(e.target.checked)}), h('span',{style:{fontSize:'0.875rem'}},'Devizni i dinarski prihodi u dve odvojene tabele')),
        h('div',{className:'row', style:{gap:10, alignItems:'center'}}, h('input',{type:'checkbox', checked:grandTotal, onChange:e=>setGrandTotal(e.target.checked)}), h('span',{style:{fontSize:'0.875rem'}},'Ukupan zbir na kraju'))));
  }

  function DeleteConfirm(props){
    const { entry, kind, onClose, onDeleted } = props;
    const s = useStore();
    const client = entry.clientId ? s.clients.find(c=>c.id===entry.clientId) : null;
    const dateStr = U.fmtDate(entry.date).replace(/\.$/,'');
    const who = client ? client.name+', '+dateStr : dateStr;
    return h(Modal,{title:'Obrisati prihod?', onClose, stackedFooter:true, footer:[
        h(Button,{key:'c', variant:'secondary', onClick:onClose},'Odustani'),
        h(Button,{key:'d', variant:'danger', onClick:()=>{ IncA.remove(entry.id, kind); onDeleted(); }},'Obriši prihod')]},
      h('p',{style:{margin:0, color:'var(--text-muted)'}}, `Prihod od ${kind==='fx'?U.fmtMoney(entry.amount,entry.currency):U.fmtMoney(entry.amount,'RSD')} (${who}) se uklanja iz knjige. Zbir i limit od 6.000.000 din se ponovo računaju. Ovo ne može da se vrati.`));
  }

  function FxTable(props){
    const { s, rows, isMobile, onOpen, onDelete } = props;
    const total = rows.reduce((sum,i)=> i.noInvoice?sum:sum+i.amount*i.rate, 0);
    if(isMobile) return h('div',{className:'inv-card-list'}, rows.map(i=>{
      const client = s.clients.find(c=>c.id===i.clientId);
      return h('div',Object.assign({key:i.id, className:'inv-card-row', style: i.noInvoice?{opacity:0.55}:null}, window.AIK.a11yClick(()=>onOpen(i))),
        h('div',{className:'t'}, h('span',null, i.noInvoice?'Nepoznat pošiljalac':(client?client.name:'–')), h('span',null, U.fmtMoney(i.amount,i.currency))),
        h('div',{className:'sub'}, U.fmtDate(i.date)+' · '+(i.noInvoice?'Bez fakture':i.source)));
    }));
    return h('div',{className:'inv-table-wrap kpo-table-wrap'},
      h('table',{className:'inv-table kpo-table'},
        h('colgroup',null, h('col',{style:{width:100}}), h('col',null), h('col',{style:{width:100}}), h('col',{style:{width:110}}), h('col',{style:{width:64}}), h('col',{style:{width:120}}), h('col',{style:{width:96}})),
        h('thead',null, h('tr',null, h('th',null,'Uplata'), h('th',null,'Klijent'), h('th',null,'Faktura'), h('th',{className:'r'},'Iznos'), h('th',{className:'r'},'Kurs'), h('th',{className:'r'},'U dinarima'), h('th',null,'Izvor'))),
        h('tbody',null,
          rows.map(i=>{
            const client = s.clients.find(c=>c.id===i.clientId);
            const inv = i.invoiceId ? s.invoices.find(x=>x.id===i.invoiceId) : null;
            return h('tr',{key:i.id, className:'clickable', style: i.noInvoice?{opacity:0.55}:null, onClick:()=>onOpen(i)},
              h('td',null, U.fmtDate(i.date)),
              h('td',null, i.noInvoice ? 'Nepoznat pošiljalac' : (client?client.name:'–')),
              h('td',null, i.noInvoice ? 'Bez fakture' : (inv?inv.number:'–')),
              h('td',{className:'r'}, U.fmtMoney(i.amount,i.currency)),
              h('td',{className:'r'}, U.fmtNum(i.rate)),
              h('td',{className:'r'}, i.noInvoice ? '–' : U.fmtMoney(Math.round(i.amount*i.rate*100)/100,'RSD').replace(' din','')),
              h('td',null, h('span',{className:'kpo-source-pill'}, i.source)));
          }),
          h('tr',{className:'kpo-total-row'}, h('td',{colSpan:5},'Ukupno devizni prihodi'), h('td',{className:'r'}, U.fmtMoney(Math.round(total*100)/100,'RSD').replace(' din','')), h('td',null)))));
  }

  function RsdTable(props){
    const { s, rows, isMobile, onOpen } = props;
    const total = rows.reduce((sum,i)=> sum+i.amount, 0);
    if(isMobile) return h('div',{className:'inv-card-list'}, rows.map(i=>{
      const client = s.clients.find(c=>c.id===i.clientId);
      return h('div',Object.assign({key:i.id, className:'inv-card-row'}, window.AIK.a11yClick(()=>onOpen(i))),
        h('div',{className:'t'}, h('span',null, client?client.name:'–'), h('span',null, U.fmtMoney(i.amount,'RSD'))),
        h('div',{className:'sub'}, U.fmtDate(i.date)+' · '+i.source));
    }));
    return h('div',{className:'inv-table-wrap kpo-table-wrap'},
      h('table',{className:'inv-table kpo-table'},
        h('colgroup',null, h('col',{style:{width:100}}), h('col',null), h('col',{style:{width:100}}), h('col',{style:{width:130}}), h('col',{style:{width:96}})),
        h('thead',null, h('tr',null, h('th',null,'Uplata'), h('th',null,'Klijent'), h('th',null,'Faktura'), h('th',{className:'r'},'Iznos u dinarima'), h('th',null,'Izvor'))),
        h('tbody',null,
          rows.map(i=>{
            const client = s.clients.find(c=>c.id===i.clientId);
            const inv = i.invoiceId ? s.invoices.find(x=>x.id===i.invoiceId) : null;
            return h('tr',{key:i.id, className:'clickable', onClick:()=>onOpen(i)},
              h('td',null, U.fmtDate(i.date)), h('td',null, client?client.name:'–'), h('td',null, inv?inv.number:'–'),
              h('td',{className:'r'}, U.fmtMoney(i.amount,'RSD').replace(' din','')), h('td',null, h('span',{className:'kpo-source-pill'}, i.source)));
          }),
          h('tr',{className:'kpo-total-row'}, h('td',{colSpan:3},'Ukupno dinarski prihodi'), h('td',{className:'r'}, U.fmtMoney(total,'RSD').replace(' din','')), h('td',null)))));
  }

  // Telefon (PhKp9): donji sheet "Filteri" (Godina/Mesec/Klijent + "Primeni filtere"), umesto tri selecta na stranici. Desktop nije dirano.
  function MobileFilterSheet(props){
    const { s, year, month, clientFilter, rowsForClientCounts, onApply, onClose } = props;
    const [draftYear,setDraftYear] = useState(year);
    const [draftMonth,setDraftMonth] = useState(month);
    const [draftClient,setDraftClient] = useState(clientFilter);
    const [openField,setOpenField] = useState(null); // 'year'|'month'|'client'|null

    function FieldRow(key, label, valueLabel, options){
      return h('div',{style:{position:'relative'}},
        h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)', display:'block', marginBottom:6}}, label),
        h('div',Object.assign({className:'kpo-filter-field'}, window.AIK.a11yClick(()=>setOpenField(openField===key?null:key))),
          h('span',null, valueLabel), h(Icons.chevronDown,{width:16,height:16})),
        openField===key ? h('div',{className:'inv-dropdown', style:{position:'absolute', left:0, right:0, top:'100%', minWidth:'auto', width:'100%'}}, options) : null);
    }

    return h('div',{className:'sheet-overlay', onClick:onClose},
      h('div',{className:'sheet', onClick:e=>e.stopPropagation(), style:{display:'flex', flexDirection:'column', gap:20, padding:'12px 20px 24px'}},
        h('div',{className:'sheet-handle'}),
        h('span',{style:{fontSize:'1.25rem'}},'Filteri'),
        FieldRow('year','Godina', draftYear, YEARS().map(y=>
          h('button',{key:y, className:draftYear===y?'active':'', onClick:()=>{ setDraftYear(y); setOpenField(null); }}, h('span',null,y)))),
        FieldRow('month','Mesec', draftMonth==='' ? 'Svi meseci' : (U.MONTHS_SR[Number(draftMonth)-1][0].toUpperCase()+U.MONTHS_SR[Number(draftMonth)-1].slice(1)),
          [h('button',{key:'', className:draftMonth===''?'active':'', onClick:()=>{ setDraftMonth(''); setOpenField(null); }}, h('span',null,'Svi meseci'))]
            .concat(U.MONTHS_SR.map((m,i)=>h('button',{key:i, className:draftMonth===String(i+1)?'active':'', onClick:()=>{ setDraftMonth(String(i+1)); setOpenField(null); }}, h('span',null, m[0].toUpperCase()+m.slice(1)))))),
        FieldRow('client','Klijent', draftClient ? (s.clients.find(c=>c.id===draftClient)||{}).name : 'Svi klijenti',
          [h('button',{key:'', className:!draftClient?'active':'', onClick:()=>{ setDraftClient(''); setOpenField(null); }}, h('span',null,'Svi klijenti'), h('span',{className:'faint', style:{marginLeft:'auto'}}, rowsForClientCounts.length))]
            .concat(s.clients.map(c=>{
              const n = rowsForClientCounts.filter(i=>i.clientId===c.id).length;
              return n ? h('button',{key:c.id, className:draftClient===c.id?'active':'', onClick:()=>{ setDraftClient(c.id); setOpenField(null); }}, h('span',null,c.name), h('span',{className:'faint', style:{marginLeft:'auto'}}, n)) : null;
            }))),
        h(Button,{style:{width:'100%', height:48, fontSize:'1rem'}, onClick:()=>onApply(draftYear,draftMonth,draftClient)},'Primeni filtere')));
  }

  // Round 30, nalaz 2 (spec 8.4): isti tri-nivoa tekst kao Početna (80/90/100), ovde kraći oblik (jedan
  // red teksta) da se uklopi u postojeći .kpo-near-limit stil. 90%+ prelazi na "danger" ton (isti kao
  // Početna — nema posebne treće boje nacrtane ni ovde).
  function KnjigaLimitWarning(props){
    const tier = window.AIK.Rules.limit.limitWarningTier(props.pct);
    React.useEffect(()=>{ if(tier) window.AIK.Actions.Business.checkLimitThreshold(); }, [tier]);
    if(!tier) return null;
    const danger = tier>=90;
    const title = tier>=100 ? 'Prešao si limit za paušalce' : tier>=90 ? 'Dostigao si '+U.fmtNum(props.pct,1)+'% godišnjeg limita' : 'Približavaš se limitu za paušalce';
    const body = tier>=100
      ? 'Menja se način oporezivanja. Dalje poslovne knjige nisu u obimu ovog prototipa.'
      : `Do 6.000.000 din ti je ostalo ${U.fmtMoney(props.remaining,'RSD')}. Kad ga pređeš, gubiš pravo na paušalno oporezivanje, pa te upozoravam unapred.`;
    return h('div',{className:'kpo-near-limit'+(danger?' danger':'')}, h(Icons.triangleAlert,{width:20,height:20,style:{flexShrink:0,marginTop:2}}),
      h('div',{className:'body'},
        h('span',null,title),
        h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}}, body),
        h('a',{href:'#', style:{fontSize:'0.875rem', textDecoration:'underline', textUnderlineOffset:'3px'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/porez');}},'Vidi na stranici Porez i rokovi')));
  }

  function KnjigaScreen(){
    const s = useStore();
    const isMobile = useIsMobile();
    const [year,setYear] = useState(TODAY.getFullYear());
    const [tab,setTab] = useState('fx');
    const [month,setMonth] = useState('');
    const [clientFilter,setClientFilter] = useState('');
    const [addOpen,setAddOpen] = useState(false);
    const [exportOpen,setExportOpen] = useState(false);
    const [detail,setDetail] = useState(null); // {entry, kind}
    const [confirmDelete,setConfirmDelete] = useState(null); // {entry, kind}
    const [aiQuickOpen,setAiQuickOpen] = useState(false); // Ak9/PhAk9: brzi panel sa konteksta (6.6, 7.12)
    const [clientPicker,setClientPicker] = useState(false); // Kp9: filter klijenta je prilagođen padajući meni sa brojem uplata po klijentu, ne goli <select>
    const [filterSheetOpen,setFilterSheetOpen] = useState(false); // PhKp9: donji sheet "Filteri" na telefonu, umesto tri selecta

    const yr = Sel.calendarYearIncomes(s, year);
    const noInvoiceEntries = s.incomesFx.filter(i=>i.noInvoice);

    let fxRows = yr.fx.slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
    let rsdRows = yr.rsd.slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
    if(month) { fxRows = fxRows.filter(i=>new Date(i.date).getMonth()+1===Number(month)); rsdRows = rsdRows.filter(i=>new Date(i.date).getMonth()+1===Number(month)); }
    // Kp9: brojevi po klijentu u padajućem meniju se računaju PRE filtera po klijentu (iz trenutnog taba/meseca).
    const rowsForClientCounts = tab==='fx' ? fxRows : rsdRows;
    if(clientFilter){ fxRows = fxRows.filter(i=>i.clientId===clientFilter); rsdRows = rsdRows.filter(i=>i.clientId===clientFilter); }
    // "Bez fakture" uplate iz tekuće godine se vide u tabeli (zasivljene), ali ne ulaze u Sel.calendarYearIncomes zbirove.
    const noInvThisYear = noInvoiceEntries.filter(i=>new Date(i.date).getFullYear()===year && (!month || new Date(i.date).getMonth()+1===Number(month)));
    const fxRowsWithNoInv = noInvThisYear.concat(fxRows);

    const isEmpty = yr.fx.length===0 && yr.rsd.length===0 && noInvThisYear.length===0;

    return h('div',{className:'stack', style:{gap:20}},
      h('div',{className:'page-head-row'},
        h('div',{className:'page-head', style:{marginBottom:0}}, h('h1',null,'Knjiga prihoda'), h('p',null,'Prihodi se vode po datumu uplate.')),
        h('div',{className:'row', style:{gap:12, flexWrap:'wrap'}},
          // Uv0/PhUv0 (Round 28): PhUv0 NE crta ovo dugme u zaglavlju na telefonu (samo logo+ikonice) —
          // dugme ostaje SAMO na desktopu, baner ispod (koji ima istu akciju) pokriva telefon. Dugme
          // ostaje u zaglavlju i posle potvrđenog uvoza na desktopu, baner ispod nestaje na oba.
          !isMobile ? h(Button,{variant:'secondary', icon:Icons.uploadArrow, onClick:()=>window.AIK.Actions.Uvoz.openEntry()},'Prenesi poslovanje') : null,
          h(Button,{variant:'secondary', icon:Icons.download, onClick:()=>setExportOpen(true)},'Izvezi'),
          h(Button,{icon:Icons.plus, onClick:()=>setAddOpen(true)},'Dodaj prihod'))),
      !s.importState.confirmed ? h(ImportBanner) : null,
      h(KnjigaLimitWarning,{pct:yr.pct, remaining:yr.remaining}),
      noInvThisYear.length ? h('div',{className:'kpo-noinvoice-banner'},
        h('div',{className:'kpo-noinvoice-top'}, h(Icons.flag,{width:20,height:20,style:{flexShrink:0,marginTop:2}}),
          h('div',{className:'body'},
            h('span',null, (noInvThisYear.length===1?'Jedna uplata':noInvThisYear.length+' '+U.plural(noInvThisYear.length,['uplata','uplate','uplata']))+' nema fakturu'),
            h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}}, `Uplata od ${U.fmtMoney(noInvThisYear[0].amount, noInvThisYear[0].currency)} ne ulazi u zbir dok je ne povežeš sa fakturom.`))),
        h('div',{className:'kpo-noinvoice-links'},
          h('a',{href:'#', style:{fontSize:'0.875rem', textDecoration:'underline', textUnderlineOffset:'3px'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/mejlovi');}},'Poveži u Mejlovima banke'),
          h('a',{href:'#', style:{fontSize:'0.875rem', textDecoration:'underline', textUnderlineOffset:'3px'}, onClick:(e)=>{e.preventDefault(); setAiQuickOpen(true);}},'Pitaj AI'))) : null,
      aiQuickOpen ? h(window.AIK.AiQuickPanel,{contextQuestion:'Zašto ova uplata nije u zbiru?', onClose:()=>setAiQuickOpen(false)}) : null,
      // Kp3/PhKp3 (27. krug, Korak 2): frejm NE zamenjuje ceo ekran praznim stanjem — glavna statistika
      // kartica ostaje vidljiva (0,00 din / 0% / Ostalo 6.000.000,00 din), na desktopu uz Devizni/Dinarski
      // pilule (0/0) i izbor godine, pa TEK ispod toga ilustracija "Još nema prihoda". Mobilni frejm
      // (PhKp3) nema pilule/izbor godine uopšte — samo glavna kartica pa ilustracija.
      isEmpty ? h(React.Fragment,null,
        MainStatCard({yr, year}),
        !isMobile ? h('div',{style:{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8}},
          h('div',{className:'sub-tabs'},
            h('button',{className:'sub-tab'+(tab==='fx'?' active':''), onClick:()=>setTab('fx')},'Devizni prihodi', h('span',{className:'n'}, yr.fx.length)),
            h('button',{className:'sub-tab'+(tab==='rsd'?' active':''), onClick:()=>setTab('rsd')},'Dinarski prihodi', h('span',{className:'n'}, yr.rsd.length))),
          h('select',{className:'select', value:year, onChange:e=>setYear(Number(e.target.value))}, YEARS().map(y=>h('option',{key:y,value:y},y)))) : null,
        h(EmptyState,{icon:Icons.book, title:'Još nema prihoda u '+year+'.', body:'Čim stigne uplata, upisujem je ovde sam. Možeš i ručno da dodaš prihod koji ja ne vidim, na primer gotovinu.'},
          h(Button,{onClick:()=>setAddOpen(true)},'Dodaj prihod'))) :
        h(React.Fragment,null,
          RezimeRow({yr, year}),
          h('div',{className:'sub-tabs'},
            h('button',{className:'sub-tab'+(tab==='fx'?' active':''), onClick:()=>setTab('fx')},'Devizni prihodi', h('span',{className:'n'}, yr.fx.length)),
            h('button',{className:'sub-tab'+(tab==='rsd'?' active':''), onClick:()=>setTab('rsd')},'Dinarski prihodi', h('span',{className:'n'}, yr.rsd.length))),
          isMobile ? h('div',{className:'row', style:{gap:8, flexWrap:'wrap'}},
            h(Button,{variant:'secondary', icon:Icons.filter, onClick:()=>setFilterSheetOpen(true)},'Filteri'),
            (month||clientFilter) ? h('a',{href:'#', style:{fontSize:'0.875rem', alignSelf:'center'}, onClick:(e)=>{e.preventDefault(); setMonth(''); setClientFilter('');}},'Očisti filtere') : null) :
          h('div',{className:'row', style:{gap:8, flexWrap:'wrap'}},
            h('select',{className:'select', value:year, onChange:e=>setYear(Number(e.target.value))}, YEARS().map(y=>h('option',{key:y,value:y},y))),
            h('select',{className:'select', value:month, onChange:e=>setMonth(e.target.value)}, h('option',{value:''},'Svi meseci'), U.MONTHS_SR.map((m,i)=>h('option',{key:i,value:i+1}, m[0].toUpperCase()+m.slice(1)))),
            h('div',{style:{position:'relative'}},
              h('div',Object.assign({className:'inv-combo'}, window.AIK.a11yClick(()=>setClientPicker(v=>!v))), h('span',null, clientFilter ? (s.clients.find(c=>c.id===clientFilter)||{}).name : 'Svi klijenti'), h(Icons.chevronDown,{width:16,height:16})),
              clientPicker ? h('div',{className:'inv-dropdown', style:{left:0, right:'auto'}},
                h('button',{className:!clientFilter?'active':'', onClick:()=>{ setClientFilter(''); setClientPicker(false); }}, h('span',null,'Svi klijenti'), h('span',{className:'faint', style:{marginLeft:'auto'}}, rowsForClientCounts.length)),
                s.clients.map(c=>{
                  const n = rowsForClientCounts.filter(i=>i.clientId===c.id).length;
                  return n ? h('button',{key:c.id, className:clientFilter===c.id?'active':'', onClick:()=>{ setClientFilter(c.id); setClientPicker(false); }}, h('span',null,c.name), h('span',{className:'faint', style:{marginLeft:'auto'}}, n)) : null;
                })) : null),
            (month||clientFilter) ? h('a',{href:'#', style:{fontSize:'0.875rem', alignSelf:'center'}, onClick:(e)=>{e.preventDefault(); setMonth(''); setClientFilter('');}},'Očisti filtere') : null),
          tab==='fx' ? FxTable({s, rows:fxRowsWithNoInv, isMobile, onOpen:(i)=> i.noInvoice ? store.toast('Poveži ovu uplatu sa fakturom u Mejlovima banke pre nego što je otvoriš.') : setDetail({entry:i, kind:'fx'})}) :
            RsdTable({s, rows:rsdRows, isMobile, onOpen:(i)=>setDetail({entry:i, kind:'rsd'})})),
      detail ? h(DetailPanel,{entry:detail.entry, kind:detail.kind, onClose:()=>setDetail(null), onDelete:(entry,kind)=>setConfirmDelete({entry,kind})}) : null,
      confirmDelete ? h(DeleteConfirm,{entry:confirmDelete.entry, kind:confirmDelete.kind, onClose:()=>setConfirmDelete(null), onDeleted:()=>{ setConfirmDelete(null); setDetail(null); }}) : null,
      addOpen ? h(AddIncomeModal,{onClose:()=>setAddOpen(false)}) : null,
      exportOpen ? h(ExportModal,{onClose:()=>setExportOpen(false)}) : null,
      filterSheetOpen ? h(MobileFilterSheet,{s, year, month, clientFilter, rowsForClientCounts,
        onClose:()=>setFilterSheetOpen(false),
        onApply:(y,m,c)=>{ setYear(y); setMonth(m); setClientFilter(c); setFilterSheetOpen(false); }}) : null);
  }

  window.AIK = window.AIK || {};
  window.AIK.Screens = window.AIK.Screens || {};
  window.AIK.Screens.knjiga = KnjigaScreen;
})();
