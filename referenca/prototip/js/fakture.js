// Faza 3: Fakture — lista, nova/izmena fakture, pregled, klijenti, ponavljajuće, editor šablona (7.3-7.6).
(function(){
  const h = React.createElement;
  const { useState, useEffect } = React;
  const { useStore, t, Components, useIsMobile } = window.AIK;
  const { Button, Field, Input, Card, Badge, Modal, Sheet, SidePanel, EmptyState, Toggle } = Components;
  const Icons = window.AIK.Icons;
  const store = window.AIK.store;
  const Sel = window.AIK.Selectors;
  const U = window.AIK.Util;
  const TODAY = window.AIK.Seed.TODAY;
  const IA = window.AIK.Actions.Invoices;
  const CA = window.AIK.Actions.Clients;
  const RA = window.AIK.Actions.Recurring;
  const TA = window.AIK.Actions.Templates;

  function statusKind(st){ return st==='Nacrt'?'draft': st==='Poslata'?'sent': st==='Kasni'?'late': st==='Plaćena'?'paid': 'void'; }
  function accLabel(a){ if(!a) return '–'; return a.type==='RSD' ? `Erste, RSD, ${('RS35 •••• '+a.number.slice(-8))}` : `Erste, ${a.currency}, RS35 •••• ${(a.iban||'').slice(-8)}`; }
  function accShort(a){ if(!a) return '–'; return `Erste, ${a.currency}`; }
  // Faza 10, deseti krug, korak 1a: "Jezik fakture" je padajući meni (jedno dugme + trenutna vrednost), ne
  // dvodelni prekidač kao Valuta — frejm (Fak3/9/20) dosledno pokazuje isti obrazac kao birač klijenta.
  const LANG_LABELS = {sr:'Srpski', en:'Engleski'};

  // ===================== Pregled uživo (A4 dokument) =====================
  const LABELS = {
    en:{date:'DATE', invoiceNo:'INVOICE No', to:'To:', address:'Address:', from:'From:', idNum:'Identification number:',
      taxId:'Tax identification number (PIB):', bankDetails:'Banking details:', beneficiary:'Beneficiary:', beneficiaryBank:'Beneficiary Bank:',
      iban:'IBAN:', swift:'SWIFT:', description:'DESCRIPTION', amountCol:(c)=>'AMOUNT '+c, vat:'VAT (0%)', total:'TOTAL AMOUNT',
      payWithin:(d)=>`Pay within ${d} days`},
    sr:{date:'DATUM', invoiceNo:'FAKTURA br.', to:'Kupac:', address:'Adresa:', from:'Izdavalac:', idNum:'Matični broj:',
      taxId:'PIB:', bankDetails:'Podaci za uplatu:', beneficiary:'Primalac:', beneficiaryBank:'Banka:',
      iban:'IBAN:', swift:'SWIFT:', description:'OPIS', amountCol:(c)=>'IZNOS '+c, vat:'PDV (0%)', total:'UKUPNO',
      payWithin:(d)=>`Rok plaćanja: ${d} dana.`},
  };
  // Faza 10b (26. krug, Korak 2e): InvoiceDoc sad crta iz template-ovog blockProps/table/doc JSON-a, umesto
  // fiksnog redosleda/stila — ISTA komponenta se koristi u editoru (platno), u "Pregled uživo"/"Kako je
  // klijent vidi" i u "PDF" dugmetu (koje je u ovom prototipu uvek ovaj isti pregled), pa su sve tri nužno
  // istovetne (spec 7.6, zahtev korisnika). `template` je obavezan prop — pozivač bira njega (otvoren u
  // editoru) ili rezultat `Sel.templateForInvoice` (pravo pravilo dodele za tu fakturu/klijenta).
  const EXTRA_COL_LABELS = {kolicina:'KOL.', jm:'JM', cena:'CENA', popust:'POPUST'};
  const MARGIN_OFFSET = {uske:-16, srednje:0, siroke:16};
  const SIZE_PX = {manji:'0.6875rem', normal:'0.75rem', veci:'0.875rem'};
  function tableColDefs(L, invoice){
    return {
      opis:{label:L.description, get:it=>it.desc||'–', align:'l'},
      kolicina:{label:EXTRA_COL_LABELS.kolicina, get:it=>String(it.qty||1), align:'r'},
      jm:{label:EXTRA_COL_LABELS.jm, get:()=>'kom', align:'r'},
      cena:{label:EXTRA_COL_LABELS.cena, get:it=>U.fmtMoney(it.price||0, invoice.currency), align:'r'},
      popust:{label:EXTRA_COL_LABELS.popust, get:()=>'0%', align:'r'},
      iznos:{label:L.amountCol(invoice.currency), get:it=>U.fmtMoney((it.qty||1)*(it.price||0), invoice.currency), align:'r'},
    };
  }
  function InvoiceTable(props){
    const { table, items, invoice, L } = props;
    const defs = tableColDefs(L, invoice);
    const cols = (table.cols||[]).filter(c=>defs[c]);
    const cls = 'inv-doc-table lines-'+table.lines+' density-'+table.density+(table.zebra?' zebra':'');
    return h('table',{className:cls},
      h('thead',null, h('tr',{style: table.headerColor && table.headerColor.toLowerCase()!=='#ffffff' ? {background:table.headerColor} : null},
        cols.map(c=> h('th',{key:c, className:defs[c].align==='r'?'r':''}, defs[c].label)))),
      h('tbody',null, items.map((it,i)=> h('tr',{key:i}, cols.map(c=> h('td',{key:c, className:defs[c].align==='r'?'r':''}, defs[c].get(it)))))));
  }
  function blockContent(key, ctx){
    const { invoice, client, business, account, L, lang, isRsd, items, total, tpl } = ctx;
    if(key==='logo'){
      const sz = tpl.doc.logoSize==='mali'?32:tpl.doc.logoSize==='veliki'?56:44;
      return h('span',{className:'logo', style:{width:sz, height:sz, borderRadius: tpl.doc.logoShape==='krug'?'50%':8}}, h(Icons.invoice,{width:Math.round(sz*0.55),height:Math.round(sz*0.55)}));
    }
    if(key==='datum') return h('b',null, L.date+': '+U.fmtDate(invoice.issueDate));
    if(key==='broj') return h('b',{style:{fontSize:'0.875rem'}}, L.invoiceNo+(lang==='sr'?' ':': ')+invoice.number);
    if(key==='klijent') return client ? h('div',null, h('b',null, L.to), ' ', client.name, h('br'), client.address ? h(React.Fragment,null, L.address,' ',client.address, h('br')) : null, client.country) : h('div',null, h('b',null,L.to), ' –');
    if(key==='firma') return h(React.Fragment,null,
        h('div',null, h('b',null, L.from)),
        h('div',null, (business.ownerName||'').toUpperCase()+' '+(business.name||'').toUpperCase()),
        h('div',null, L.idNum+' '+business.mb),
        h('div',null, L.taxId+' '+business.pib),
        h('div',null, L.address+' '+business.street+', '+business.city));
    if(key==='banka') return h(React.Fragment,null,
        h('b',null, L.bankDetails),
        h('div',null, L.beneficiary+' '+(business.ownerName||'').toUpperCase()+' '+(business.name||'').toUpperCase()),
        h('div',null, L.beneficiaryBank+' '+(account?account.bank:'–')),
        !isRsd ? h('div',null, L.iban+' '+(account?account.iban:'–')) : h('div',null,'Broj računa: '+(account?account.number:'–')),
        !isRsd ? h('div',null, L.swift+' '+(account?account.swift:'–')) : null,
        isRsd && lang==='sr' ? h('div',null,'Poziv na broj: 97 '+invoice.number) : null);
    if(key==='stavke') return h(InvoiceTable,{table:tpl.table, items, invoice, L});
    if(key==='ukupno') return h(React.Fragment,null,
        h('div',{className:'total-row'}, h('span',null, L.vat), h('span',null, U.fmtMoney(0, invoice.currency))),
        h('div',{className:'total-row'}, h('span',{style:{color:tpl.accentColor}},L.total), h('span',{style:{color:tpl.accentColor}}, U.fmtMoney(total, invoice.currency))));
    if(key==='rok') return h('div',null, L.payWithin(invoice.dueDays||0)+(isRsd&&lang==='sr'?' Poziv na broj: 97 '+invoice.number+'.':''));
    if(key==='napomena') return lang==='sr' ? h('div',null,'Nisam u sistemu PDV.') : null;
    if(key==='potpis') return h('div',{style:{borderTop:'1px solid #ccc', paddingTop:4, fontSize:'0.6875rem', color:'#666'}}, 'Potpis i pečat');
    return null;
  }
  function InvoiceDoc(props){
    const { invoice, client, business, account, template, editMode } = props;
    const tpl = template;
    const lang = invoice.lang==='sr' ? 'sr' : 'en';
    const L = LABELS[lang];
    const items = invoice.items||[];
    const total = U.invoiceTotal(invoice);
    const isRsd = invoice.currency==='RSD';
    const ctx = { invoice, client, business, account, L, lang, isRsd, items, total, tpl };
    const offset = MARGIN_OFFSET[tpl.doc.margins]||0;
    const visibleBlocks = tpl.blocks.filter(k=>!tpl.blocksOff.includes(k));
    // editMode (editor platno) sam primenjuje zoom na CEO .inv-doc (480x680, 1:1) — sopstveno
    // "uklopi u papir" skaliranje (1.0833) ovde bi se udvostručilo sa tim zoom-om, pa se tu preskače.
    const doc = h('div',{className:'inv-doc inv-doc-abs', style:{fontFamily:tpl.doc.textFont||'Arial'}},
        tpl.doc.topBar ? h('div',{className:'tpl-topbar-strip', style:{background:tpl.accentColor}}) : null,
        tpl.doc.sideBar ? h('div',{className:'tpl-sidebar-strip', style:{background:tpl.accentColor}}) : null,
        visibleBlocks.map(key=>{
          const bp = tpl.blockProps[key] || {x:32,y:32,w:100,h:20,align:'left',size:'normal',color:'#161A17'};
          const selected = editMode && editMode.selected===key;
          const style = {
            position:'absolute', left:bp.x+offset, top:bp.y+offset, width:bp.w,
            height: (bp.bg||bp.border||selected) ? bp.h : 'auto',
            textAlign:bp.align, color:bp.color, fontFamily:bp.font||tpl.doc.textFont,
            fontSize: SIZE_PX[bp.size]||SIZE_PX.normal,
            background: bp.bg ? 'rgba(200,241,105,0.14)' : 'transparent',
            border: bp.border ? '1px solid var(--border-strong)' : (selected ? '1px dashed var(--suma)' : 'none'),
            cursor: editMode ? 'move' : 'default', boxSizing:'border-box', padding: bp.bg||bp.border?'4px 6px':0,
          };
          return h('div', Object.assign({key, className:'tpl-block'+(selected?' selected':''), style},
            editMode ? { onMouseDown:(e)=>{ e.stopPropagation(); editMode.onDragStart(e,key); } } : null),
            blockContent(key, ctx),
            selected ? h('span',{className:'tpl-resize-handle', onMouseDown:(e)=>{ e.stopPropagation(); editMode.onResizeStart(e,key); }}) : null);
        }),
        tpl.doc.footerText ? h('div',{className:'tpl-footer-text', style:{position:'absolute', left:32+offset, bottom:12, color:'var(--text-muted)'}}, tpl.doc.footerText) : null
      );
    return editMode ? doc : h('div',{className:'inv-doc-scale'}, doc);
  }

  // ===================== Lista: Fakture / Klijenti / Ponavljajuće =====================
  const FILTERS = [['sve','Sve'],['nacrti','Nacrti'],['poslate','Poslate'],['kasne','Kasne'],['placene','Plaćene'],['stornirane','Stornirane']];
  function matchesFilter(inv, f){
    if(f==='sve') return true;
    if(f==='nacrti') return inv.effectiveStatus==='Nacrt';
    if(f==='poslate') return inv.effectiveStatus==='Poslata';
    if(f==='kasne') return inv.effectiveStatus==='Kasni';
    if(f==='placene') return inv.effectiveStatus==='Plaćena';
    if(f==='stornirane') return inv.effectiveStatus==='Stornirana';
    return true;
  }

  function SummaryCards(invs){
    // Vraća niz iznosa po valuti (ne spojen string), da bi svaki iznos mogao da ide u svoj red — nikad prelom u sredini iznosa (pravilo A).
    const byCur = (list)=> { const m={}; list.forEach(i=>{ m[i.currency]=(m[i.currency]||0)+i.total; }); return Object.entries(m).map(([c,v])=>U.fmtMoney(v,c)); };
    const StatValue = (amounts)=> h('span',{className:'v'}, amounts.map((a,idx)=> h('span',{key:idx, className:'v-line'}, a)));
    const open = invs.filter(i=>i.effectiveStatus==='Poslata');
    const late = invs.filter(i=>i.effectiveStatus==='Kasni');
    const paid30 = invs.filter(i=> i.effectiveStatus==='Plaćena' && i.paidDate && U.daysDiff(TODAY, i.paidDate) <= 30 && U.daysDiff(TODAY, i.paidDate) >= 0);
    return h('div',{className:'inv-stat-row'},
      h('div',{className:'inv-stat-card'}, h('span',{className:'l'},'Čeka naplatu'), StatValue(open.length?byCur(open):['0 €']), h('span',{className:'l'}, open.length+' '+U.plural(open.length,['faktura','fakture','faktura']))),
      h('div',{className:'inv-stat-card late'}, h('span',{className:'l'},'Kasni'), StatValue(late.length?byCur(late):['0 €']), h('span',{className:'l'}, late.length?`${late.length} ${U.plural(late.length,['faktura','fakture','faktura'])}, ${late[0].client?late[0].client.name:''}`:'Nema kašnjenja')),
      h('div',{className:'inv-stat-card'}, h('span',{className:'l'},'Naplaćeno u poslednjih 30 dana'), StatValue(paid30.length?byCur(paid30):['0 €']), h('span',{className:'l'}, paid30.length+' '+U.plural(paid30.length,['faktura','fakture','faktura']))));
  }

  function RowMenu(props){
    const [open,setOpen] = useState(false);
    return h('span',{className:'inv-row-menu'},
      h('button',{className:'inv-row-menu-btn', onClick:(e)=>{ e.stopPropagation(); setOpen(v=>!v); }}, h(Icons.more,{width:20,height:20})),
      open ? h(React.Fragment,null,
        h('div',{style:{position:'fixed',inset:0,zIndex:39}, onClick:(e)=>{e.stopPropagation(); setOpen(false);}}),
        h('div',{className:'inv-dropdown', onClick:(e)=>e.stopPropagation()}, props.items)) : null);
  }

  function InvoiceRow(props){
    const inv = props.inv;
    const isMobile = props.isMobile;
    const open = ()=> store.navigate('app/fakture/'+inv.id);
    const menuItems = inv.effectiveStatus==='Nacrt' ? [
      h('button',{key:'c', onClick:()=>store.navigate('app/fakture/izmeni/'+inv.id)}, h(Icons.edit,{width:16,height:16}),'Nastavi uređivanje'),
      h('button',{key:'d', className:'danger', onClick:()=>IA.remove(inv.id)}, h(Icons.trash,{width:16,height:16}),'Obriši'),
    ] : [
      h('button',{key:'o', onClick:open}, h(Icons.arrowRight,{width:16,height:16}),'Otvori'),
      h('button',{key:'dup', onClick:()=>IA.duplicate(inv.id)}, h(Icons.copy,{width:16,height:16}),'Dupliraj'),
      // Uvoz (28. krug): lagane uvezene fakture nemaju pravi PDF iz aplikacije (spec 2.3/4).
      inv.imported ? null : h('button',{key:'pdf', onClick:()=>store.toast('PDF je preuzet.')}, h(Icons.download,{width:16,height:16}),'Preuzmi PDF'),
      h('button',{key:'again', onClick:()=>store.toast('Faktura je ponovo poslata.')}, h(Icons.send,{width:16,height:16}),'Pošalji ponovo'),
      inv.effectiveStatus!=='Plaćena' ? h('button',{key:'paid', onClick:()=>IA.markPaid(inv.id)}, h(Icons.checkCircle,{width:16,height:16}),'Označi kao plaćenu') : null,
      h('hr',{key:'hr'}),
      inv.effectiveStatus!=='Stornirana' ? h('button',{key:'void', className:'danger', onClick:()=>store.navigate('app/fakture/'+inv.id)}, h(Icons.flag,{width:16,height:16}),'Storniraj') : null,
    ];
    if(isMobile){
      return h('div',Object.assign({className:'inv-card-row'}, window.AIK.a11yClick(open)),
        h('div',{className:'t'},
          h('span',null, inv.client?inv.client.name:'–'),
          h(Badge,{kind:statusKind(inv.effectiveStatus)}, inv.effectiveStatus==='Kasni' ? `Kasni ${U.lateDays(inv,TODAY)} ${U.dayWord(U.lateDays(inv,TODAY))}` : inv.effectiveStatus)),
        h('div',{className:'sub'}, inv.number+' · '+(inv.effectiveStatus==='Nacrt'?'Nije poslata':U.fmtDate(inv.issueDate))),
        h('div',{className:'amt'}, U.fmtMoney(inv.total, inv.currency)));
    }
    return h('tr',{className:'clickable', onClick:open},
      h('td',null, inv.effectiveStatus==='Nacrt'?'Nacrt':inv.number),
      h('td',{className:'ellip', title: inv.client?inv.client.name:'–'}, inv.client?inv.client.name:'–'),
      h('td',null, inv.effectiveStatus==='Nacrt'?'Nije poslata':U.fmtDate(inv.issueDate)),
      h('td',null, inv.effectiveStatus==='Nacrt'?'–':U.fmtDate(U.invoiceDueDate(inv))),
      h('td',{className:'r'}, U.fmtMoney(inv.total, inv.currency)),
      h('td',null, h(Badge,{kind:statusKind(inv.effectiveStatus)}, inv.effectiveStatus==='Kasni' ? `Kasni ${U.lateDays(inv,TODAY)} ${U.dayWord(U.lateDays(inv,TODAY))}` : inv.effectiveStatus)),
      h('td',{onClick:(e)=>e.stopPropagation()}, h(RowMenu,{items:menuItems})));
  }

  function FaktureListTab(){
    const s = useStore();
    const isMobile = useIsMobile();
    const [filter,setFilter] = useState('sve');
    const invs = Sel.invoicesWithEffectiveStatus(s).sort((a,b)=> new Date(b.issueDate)-new Date(a.issueDate));
    if(!invs.length) return h(EmptyState,{icon:Icons.invoice, title:'Još nemaš nijednu fakturu', body:'Napravi prvu i ja se brinem za ostalo.'},
      h('div',{className:'stack', style:{textAlign:'left', margin:'8px 0'}},
        [['1','Izabereš klijenta i valutu.'],['2','Ja popunjavam broj, datum i podatke o tvojoj firmi.'],['3','Pregledaš i šalješ klijentu jednim klikom.']].map(([n,txt])=>
          h('div',{key:n, className:'row', style:{gap:12}}, h('span',{className:'onb-step-num'},n), h('span',null,txt)))),
      h(Button,{onClick:()=>store.navigate('app/fakture/nova')}, 'Napravi prvu fakturu'));
    const filtered = invs.filter(i=>matchesFilter(i,filter));
    const counts = {}; FILTERS.forEach(([k])=> counts[k] = invs.filter(i=>matchesFilter(i,k)).length);
    return h('div',{className:'stack'},
      SummaryCards(invs),
      h('div',{className:'inv-filters-row'},
        h('div',{className:'chip-row'}, FILTERS.map(([k,label])=>
          h('span',Object.assign({key:k, className:'inv-chip'+(filter===k?' active':'')}, window.AIK.a11yClick(()=>setFilter(k))), label, h('span',{className:'n'}, counts[k])))),
        !isMobile ? h('div',{className:'row', style:{gap:12}},
          h('span',{className:'inv-select'},'Sve valute', h(Icons.chevronDown,{width:16,height:16})),
          h('span',{className:'inv-select'},'Poslednjih 90 dana', h(Icons.chevronDown,{width:16,height:16}))) : null),
      isMobile ? h('div',{className:'inv-card-list'}, filtered.map(inv=> h(InvoiceRow,{key:inv.id, inv, isMobile:true}))) :
      h('div',{className:'inv-table-wrap'},
        h('table',{className:'inv-table'},
          h('colgroup',null, h('col',{style:{width:110}}), h('col',null), h('col',{style:{width:110}}), h('col',{style:{width:110}}), h('col',{style:{width:120}}), h('col',{style:{width:130}}), h('col',{style:{width:40}})),
          h('thead',null, h('tr',null, h('th',null,'Broj'), h('th',null,'Klijent'), h('th',null,'Datum'), h('th',null,'Rok'), h('th',{className:'r'},'Iznos'), h('th',null,'Status'), h('th',null))),
          h('tbody',null, filtered.map(inv=> h(InvoiceRow,{key:inv.id, inv, isMobile:false}))))));
  }

  function ClientPanel(props){
    const c = props.client;
    const isNew = !c;
    const s = useStore();
    const [form,setForm] = useState(()=> isNew ? {name:'', billingEmail:'', country:'', pib:'', address:'', defaultCurrency:'EUR', defaultLang:'sr', defaultDueDays:7, defaultAccountId:s.accounts[0]&&s.accounts[0].id, itemDesc:'', itemAmount:''} :
      {name:c.name, billingEmail:c.billingEmail, country:c.country, pib:c.pib||'', address:c.address, defaultCurrency:c.defaultCurrency, defaultLang:c.defaultLang, defaultDueDays:c.defaultDueDays, defaultAccountId:c.defaultAccountId, itemDesc:c.defaultItem?c.defaultItem.desc:'', itemAmount:c.defaultItem?c.defaultItem.amount:''});
    function set(k,v){ setForm(f=>Object.assign({},f,{[k]:v})); }
    function save(){
      const data = {
        name:form.name, billingEmail:form.billingEmail, country:form.country, pib:form.pib, address:form.address,
        defaultCurrency:form.defaultCurrency, defaultLang:form.defaultLang, defaultDueDays:Number(form.defaultDueDays),
        defaultAccountId:form.defaultAccountId, domestic:form.defaultCurrency==='RSD',
        defaultItem: form.itemDesc ? {desc:form.itemDesc, amount:Number(form.itemAmount)||0} : null,
      };
      if(isNew){ const created = CA.create(data); props.onSaved && props.onSaved(created); } else { CA.update(c.id, data); }
      props.onClose();
    }
    const Panel = SidePanel;
    return h(Panel,{title:isNew?'Novi klijent':'Uredi klijenta', onClose:props.onClose, footer:[
        h(Button,{key:'c', variant:'secondary', onClick:props.onClose}, 'Odustani'),
        h(Button,{key:'s', onClick:save}, isNew?'Sačuvaj klijenta':'Sačuvaj izmene')]},
      h('div',{className:'stack client-panel-body'},
        h('span',{style:{fontSize:'1rem'}},'Podaci o klijentu'),
        h(Field,{label:'Naziv klijenta'}, h(Input,{value:form.name, onChange:e=>set('name',e.target.value)})),
        h(Field,{label:'Mejl za fakture', hint:'Fakture šaljem na ovu adresu.'}, h(Input,{type:'email', value:form.billingEmail, onChange:e=>set('billingEmail',e.target.value)})),
        h(Field,{label:'Država'}, h(Input,{value:form.country, onChange:e=>set('country',e.target.value)})),
        h(Field,{label:'PIB ili VAT'}, h(Input,{value:form.pib, onChange:e=>set('pib',e.target.value), placeholder:'–'})),
        h(Field,{label:'Adresa'}, h(Input,{value:form.address, onChange:e=>set('address',e.target.value)})),
        h('hr',{style:{border:0, borderTop:'1px solid var(--border)', margin:'4px 0'}}),
        h('span',{style:{fontSize:'1rem'}},'Podrazumevano za fakture ovom klijentu'),
        h('span',{className:'faint', style:{fontSize:'0.875rem'}},'Kad izabereš klijenta, ovo se popuni samo. Na svakoj fakturi možeš da promeniš.'),
        h('div',{className:'inv-seg'}, ['EUR','USD','RSD'].map(cur=> h('button',{key:cur, type:'button', className:form.defaultCurrency===cur?'active':'', onClick:()=>set('defaultCurrency',cur)}, cur))),
        h(Field,{label:'Jezik fakture'}, h('div',{className:'inv-seg'}, [['sr','Srpski'],['en','Engleski']].map(([k,lb])=> h('button',{key:k, type:'button', className:form.defaultLang===k?'active':'', onClick:()=>set('defaultLang',k)}, lb)))),
        h(Field,{label:'Rok plaćanja (dana)'}, h(Input,{type:'number', value:form.defaultDueDays, onChange:e=>set('defaultDueDays',e.target.value)})),
        h(Field,{label:'Račun za uplatu'}, h('select',{className:'select', value:form.defaultAccountId||'', onChange:e=>set('defaultAccountId',e.target.value)},
          s.accounts.filter(a=>a.currency===form.defaultCurrency).map(a=> h('option',{key:a.id, value:a.id}, accShort(a))))),
        h(Field,{label:'Podrazumevana stavka (nije obavezno)', hint:'Ako klijent uvek plaća isto. Ako se iznos menja, ostavi prazno i upisaću ga na fakturi.'},
          h('div',{className:'row', style:{gap:8}}, h(Input,{placeholder:'Opis', value:form.itemDesc, onChange:e=>set('itemDesc',e.target.value)}), h(Input,{placeholder:'Cena', type:'number', value:form.itemAmount, onChange:e=>set('itemAmount',e.target.value)}))),
        !isNew ? h('div',{className:'stack-sm'},
          h('hr',{style:{border:0, borderTop:'1px solid var(--border)', margin:'4px 0'}}),
          h('span',{style:{fontSize:'1rem'}},'Mejlovi banke za ovog klijenta'),
          h('div',{className:'row', style:{justifyContent:'space-between'}},
            h('span',null,'Kad stigne mejl banke'),
            h('div',{className:'inv-seg'}, [['ask','Uvek pitaj za odobrenje'],['auto','Obradi sve automatski']].map(([k,lb])=> h('button',{key:k, type:'button', className:(c.autoSend?'auto':'ask')===k?'active':'', onClick:()=>window.AIK.Actions.Clients.update(c.id,{autoSend:k==='auto'})}, lb)))),
          form.defaultCurrency!=='RSD' && c.autoSend ? h('div',{className:'row', style:{justifyContent:'space-between', flexWrap:'wrap'}},
            h('span',null,'Devizni priliv od ovog klijenta'),
            h('div',{className:'inv-seg'}, [['book_only','Samo proknjiži'],['sell_part','Prodaj deo'],['sell_all','Prodaj sve']].map(([k,lb])=> h('button',{key:k, type:'button', className:(c.fxMode||'book_only')===k?'active':'', onClick:()=>window.AIK.Actions.Clients.update(c.id,{fxMode:k})}, lb)))) : null) : null,
        !isNew ? h('div',{className:'danger-zone'}, h('div',null, h('div',{className:'title'},'Obriši klijenta'), h('div',{className:'faint', style:{fontSize:'0.875rem'}}, c.hasInvoices?'Klijent ima fakture, arhiviraj umesto brisanja.':'Nema faktura, može se obrisati.')),
          h(Button,{size:'sm', variant:'danger', onClick:()=>{ CA.remove(c.id); props.onClose(); }}, 'Obriši klijenta')) : null));
  }

  function ClientsTab(){
    const s = useStore();
    const isMobile = useIsMobile();
    const [q,setQ] = useState('');
    const [editing,setEditing] = useState(null); // 'new' | client.id | null
    const invs = s.invoices;
    const clients = s.clients.filter(c=> !q || c.name.toLowerCase().includes(q.toLowerCase()) || (c.billingEmail||'').toLowerCase().includes(q.toLowerCase()));
    const lastInvoice = (id)=>{ const list = invs.filter(i=>i.clientId===id).sort((a,b)=>new Date(b.issueDate)-new Date(a.issueDate)); return list[0]; };
    const editingClient = editing && editing!=='new' ? s.clients.find(c=>c.id===editing) : null;
    // 27. krug (završna provera, Korak 2): Klijenti nema sopstveni "prazno stanje" frejm u Prilogu A
    // (samo Fak2 za samu listu Fakture), ali spec 4.7 traži prazno stanje na SVAKOM ekranu — bez ovoga
    // ekran je bio potpuno prazan ispod pretrage/dugmeta. Isti EmptyState obrazac kao Fak2/Kp3/Mb2, ne
    // nov vizuelni jezik; "Nema rezultata" (pretraga bez poklapanja) ostaje kao prost red ispod tabele.
    const isTrulyEmpty = s.clients.length===0;
    if(isTrulyEmpty){
      return h('div',{className:'stack'},
        h('div',{className:'row-between'},
          h('span',{className:'inv-search'}, h(Icons.search,{width:16,height:16, style:{color:'var(--text-muted)'}}), h('input',{placeholder:'Traži klijenta po imenu ili mejlu', value:q, onChange:e=>setQ(e.target.value)})),
          h(Button,{icon:Icons.plus, onClick:()=>setEditing('new')},'Novi klijent')),
        h(EmptyState,{icon:Icons.building, title:'Još nemaš nijednog klijenta.', body:'Dodaj klijenta pa popunjavam valutu, jezik i rok na svakoj fakturi koju mu napraviš.'},
          h(Button,{onClick:()=>setEditing('new')},'Novi klijent')),
        (editing==='new') ? h(ClientPanel,{client:null, onClose:()=>setEditing(null)}) : null);
    }
    return h('div',{className:'stack'},
      h('div',{className:'row-between'},
        h('span',{className:'inv-search'}, h(Icons.search,{width:16,height:16, style:{color:'var(--text-muted)'}}), h('input',{placeholder:'Traži klijenta po imenu ili mejlu', value:q, onChange:e=>setQ(e.target.value)})),
        h(Button,{icon:Icons.plus, onClick:()=>setEditing('new')},'Novi klijent')),
      clients.length===0 ? h('p',{className:'faint', style:{padding:'24px 0', textAlign:'center'}},'Nema klijenata za "'+q+'".') : null,
      // Faza 10, deseti krug, korak 3: mobilni prikaz (PhFak6/7/28) je kartice, ne tabela — ista "card list"
      // šema kao InvoiceRow (isti fajl, Fakture lista) umesto <table> koja se ne menja na uskom ekranu.
      clients.length===0 ? null : isMobile ? h('div',{className:'inv-card-list'}, clients.map(c=>{
        const li = lastInvoice(c.id);
        return h('div',{key:c.id, className:'inv-card-row', onClick:()=>setEditing(c.id)},
          h('div',{className:'t'},
            h('div',{style:{display:'flex', flexDirection:'column', gap:2, minWidth:0}}, h('span',null,c.name), h('span',{className:'faint', style:{fontSize:'0.875rem'}},c.billingEmail)),
            h('span',{style:{color:'var(--text-muted)', display:'flex'}}, h(Icons.more,{width:20,height:20}))),
          h('span',{style:{fontSize:'0.875rem'}}, c.defaultItem ? `${c.defaultItem.desc}, ${U.fmtMoney(c.defaultItem.amount, c.defaultCurrency)}` : h('span',{className:'faint'},'Iznos se upisuje na fakturi')),
          h('div',{style:{display:'flex', justifyContent:'space-between', fontSize:'0.875rem', color:'var(--text-muted)'}},
            h('span',null, `${c.country}, ${c.defaultCurrency} · ${(c.defaultLang||'sr').toUpperCase()} · ${c.defaultDueDays} dana`),
            h('span',null, li ? U.fmtDate(li.issueDate) : 'Nema faktura')));
      })) :
      h('div',{className:'inv-table-wrap'},
        h('table',{className:'inv-table'},
          h('thead',null, h('tr',null, h('th',null,'Klijent'), h('th',null,'Država'), h('th',null,'Podrazumevano'), h('th',null,'Podrazumevana stavka'), h('th',null,'Poslednja faktura'))),
          h('tbody',null, clients.map(c=>{
            const li = lastInvoice(c.id);
            return h('tr',{key:c.id, className:'clickable', onClick:()=>setEditing(c.id)},
              h('td',null, h('div',{title:c.name},c.name), h('div',{className:'faint', style:{fontSize:'0.875rem'}}, c.billingEmail)),
              h('td',null, c.country),
              h('td',null, `${c.defaultCurrency} · ${(c.defaultLang||'sr').toUpperCase()} · ${c.defaultDueDays} dana`),
              h('td',{className:'ellip', title: c.defaultItem ? `${c.defaultItem.desc}, ${U.fmtMoney(c.defaultItem.amount, c.defaultCurrency)}` : undefined}, c.defaultItem ? `${c.defaultItem.desc}, ${U.fmtMoney(c.defaultItem.amount, c.defaultCurrency)}` : h('span',{className:'faint'},'Iznos se upisuje na fakturi')),
              h('td',null, li ? U.fmtDate(li.issueDate) : h('span',{className:'faint'},'Nema faktura')));
          })))),
      (editing==='new' || editingClient) ? h(ClientPanel,{client:editingClient, onClose:()=>setEditing(null)}) : null);
  }

  const FREQ_LABEL = {mesečno:'Mesečno'};
  function RecurringPanel(props){
    const s = useStore();
    const r = props.item;
    const isNew = !r;
    const [form,setForm] = useState(()=> isNew ? {clientId:s.clients[0]&&s.clients[0].id, desc:'', amount:'', freq:'mesečno', day:1, startDate:U.fmtDate(TODAY,'iso'), endMode:'never', mode:'ask'} :
      {clientId:r.clientId, desc:r.desc, amount:r.amount, freq:r.freq, day:r.day, startDate:U.fmtDate(r.startDate,'iso'), endMode:r.endDate?'date':'never', mode:r.mode});
    function set(k,v){ setForm(f=>Object.assign({},f,{[k]:v})); }
    const client = s.clients.find(c=>c.id===form.clientId);
    function save(){
      const data = {clientId:form.clientId, desc:form.desc, amount:Number(form.amount)||0, currency:client?client.defaultCurrency:'EUR',
        freq:form.freq, day:Number(form.day), startDate:new Date(form.startDate).toISOString(), endDate:null, mode:form.mode,
        nextDate:new Date(form.startDate).toISOString()};
      if(isNew) RA.create(data); else RA.update(r.id, data);
      props.onClose();
    }
    return h(SidePanel,{title: isNew?'Nova ponavljajuća faktura':'Izmeni ponavljajuću fakturu', onClose:props.onClose, footer:[
        h(Button,{key:'c', variant:'secondary', onClick:props.onClose},'Odustani'),
        h(Button,{key:'s', onClick:save},'Sačuvaj')]},
      h('div',{className:'stack'},
        h('span',{style:{fontSize:'1.25rem'}},'Kome i šta'),
        h(Field,{label:'Klijent'}, h('select',{className:'select', value:form.clientId, onChange:e=>set('clientId',e.target.value)},
          s.clients.map(c=> h('option',{key:c.id, value:c.id}, c.name)))),
        h(Field,{label:'Opis'}, h(Input,{value:form.desc, onChange:e=>set('desc',e.target.value)})),
        h(Field,{label:'Iznos'}, h(Input,{type:'number', value:form.amount, onChange:e=>set('amount',e.target.value)})),
        h('hr',{style:{border:0, borderTop:'1px solid var(--border)', margin:'4px 0'}}),
        h('span',{style:{fontSize:'1.25rem'}},'Kad se ponavlja'),
        h(Field,{label:'Učestalost'}, h('select',{className:'select', value:form.freq, onChange:e=>set('freq',e.target.value)}, h('option',{value:'mesečno'},'Mesečno'))),
        h(Field,{label:'Dan u mesecu'}, h(Input,{type:'number', min:1, max:28, value:form.day, onChange:e=>set('day',e.target.value)})),
        h(Field,{label:'Počinje'}, h(Input,{type:'date', value:form.startDate, onChange:e=>set('startDate',e.target.value)})),
        h('hr',{style:{border:0, borderTop:'1px solid var(--border)', margin:'4px 0'}}),
        h('span',{style:{fontSize:'1.25rem'}},'Šta radim kad dođe taj dan'),
        h('span',{className:'faint', style:{fontSize:'0.875rem'}},'Iznos možeš da promeniš pre svakog slanja.'),
        h('label',{className:'checkbox-row'}, h('input',{type:'radio', name:'rmode', checked:form.mode==='ask', onChange:()=>set('mode','ask')}),
          h('span',null, h('div',null,'Pripremim fakturu i pitam te za odobrenje ', h('b',null,'(Preporučeno)')), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Dobiješ obaveštenje, proveriš iznos i šalješ jednim klikom.'))),
        h('label',{className:'checkbox-row'}, h('input',{type:'radio', name:'rmode', checked:form.mode==='auto', onChange:()=>set('mode','auto')}),
          h('span',null, h('div',null,'Šaljem automatski, bez pitanja'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Faktura ide klijentu odmah. Koristi samo ako je iznos uvek isti.')))));
  }

  // Fak13/PhFak13 (raw HTML): "Nova ponavljajuća faktura" NIJE pored opisa — to je isto dugme kao
  // "Nova faktura" u ZAGLAVLJU STRANICE (samo menja tekst na ovom tabu), podignuto u `ListPage`. Opis je
  // SOPSTVENA istaknuta traka (sparkle ikonica, #F6FBE6/#2F5D12, obe teme/širine, BEZ dugmeta pored
  // sebe) — ne gola `.faint` rečenica. Na telefonu je lista KARTICA (ime+status, stavka+iznos,
  // učestalost+sledeća, režim slanja) — tabela je bila zasečena ("Blu...", "Odr...").
  function RecurringTab(props){
    const { editing, setEditing } = props;
    const s = useStore();
    const isMobile = useIsMobile();
    const editingItem = editing && editing!=='new' ? s.recurring.find(r=>r.id===editing) : null;
    if(!s.recurring.length) return h(EmptyState,{icon:Icons.invoice, title:'Još nemaš ponavljajuću fakturu', body:'Na zadati dan ja pripremim fakturu, a ti samo proveriš iznos i odobriš.'},
      h(Button,{onClick:()=>setEditing('new')},'Nova ponavljajuća faktura'));
    return h('div',{className:'stack'},
      h('div',{className:'recur-banner'}, h('span',{style:{display:'flex', flex:'none'}}, h(Icons.sparkle,{width:18,height:18})),
        'Na zadati dan ja pripremim fakturu, a ti samo proveriš iznos i odobriš. Slanje bez pitanja uključuješ posebno za svakog klijenta.'),
      isMobile ? h('div',{className:'stack', style:{gap:10}}, s.recurring.map(r=>{
        const client = s.clients.find(c=>c.id===r.clientId);
        return h('div',Object.assign({key:r.id, className:'recur-card'}, window.AIK.a11yClick(()=>setEditing(r.id))),
          h('div',{className:'row-between'}, h('span',{style:{fontSize:'1rem'}}, client?client.name:'–'), h(Badge,{kind: r.status==='Aktivna'?'paid':'draft'}, r.status)),
          h('span',{style:{fontSize:'0.875rem'}}, r.desc+', '+U.fmtMoney(r.amount, r.currency)),
          h('div',{className:'row-between faint', style:{fontSize:'0.875rem'}}, h('span',null,'Mesečno, '+r.day+'. u mesecu'), h('span',null, r.status==='Pauzirana' ? 'Pauzirano' : 'Sledeća: '+U.fmtDate(r.nextDate))),
          h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem'}}, r.mode==='auto'?'Šalje se automatski':'Traži moje odobrenje'));
      })) :
      h('div',{className:'inv-table-wrap'},
        h('table',{className:'inv-table'},
          h('thead',null, h('tr',null, h('th',null,'Klijent'), h('th',null,'Stavka'), h('th',null,'Ponavlja se'), h('th',null,'Sledeća faktura'), h('th',null,'Slanje'), h('th',null,'Status'))),
          h('tbody',null, s.recurring.map(r=>{
            const client = s.clients.find(c=>c.id===r.clientId);
            return h('tr',{key:r.id, className:'clickable', onClick:()=>setEditing(r.id)},
              h('td',{className:'ellip', title: client?client.name:undefined}, client?client.name:'–'),
              h('td',{className:'ellip', title: r.desc+', '+U.fmtMoney(r.amount, r.currency)}, r.desc+', '+U.fmtMoney(r.amount, r.currency)),
              h('td',null, 'Mesečno, '+r.day+'. u mesecu'),
              h('td',null, r.status==='Pauzirana' ? 'Pauzirano' : U.fmtDate(r.nextDate)),
              h('td',null, r.mode==='auto'?'Šalje se automatski':'Traži moje odobrenje'),
              h('td',null, h(Badge,{kind: r.status==='Aktivna'?'paid':'draft'}, r.status)));
          })))),
      (editing==='new' || editingItem) ? h(RecurringPanel,{item:editingItem, onClose:()=>setEditing(null)}) : null);
  }

  function ListPage(props){
    const s = useStore();
    const tab = props.tab || 'fakture';
    const setTab = (k)=> store.navigate(k==='fakture' ? 'app/fakture' : 'app/fakture/'+k);
    const counts = {fakture:s.invoices.length, klijenti:s.clients.length, ponavljajuce:s.recurring.length};
    const [recurEditing, setRecurEditing] = useState(null);
    const headerBtn = tab==='klijenti' ? null :
      tab==='ponavljajuce' ? h(Button,{icon:Icons.plus, onClick:()=>setRecurEditing('new')},'Nova ponavljajuća faktura') :
      h(Button,{icon:Icons.plus, onClick:()=>store.navigate('app/fakture/nova')},'Nova faktura');
    return h('div',null,
      h('div',{className:'page-head-row'},
        h('div',{className:'page-head', style:{marginBottom:0}}, h('h1',null,'Fakture'), h('p',null,'Sve tvoje fakture na jednom mestu, u svim valutama.')),
        headerBtn),
      h('div',{className:'sub-tabs', style:{margin:'20px 0 20px'}},
        h('button',{className:'sub-tab'+(tab==='fakture'?' active':''), onClick:()=>setTab('fakture')},'Fakture', h('span',{className:'n'},counts.fakture)),
        h('button',{className:'sub-tab'+(tab==='klijenti'?' active':''), onClick:()=>setTab('klijenti')},'Klijenti', h('span',{className:'n'},counts.klijenti)),
        h('button',{className:'sub-tab'+(tab==='ponavljajuce'?' active':''), onClick:()=>setTab('ponavljajuce')},'Ponavljajuće', h('span',{className:'n'},counts.ponavljajuce))),
      tab==='klijenti' ? h(ClientsTab) : tab==='ponavljajuce' ? h(RecurringTab,{editing:recurEditing, setEditing:setRecurEditing}) : h(FaktureListTab));
  }

  // ===================== Nova faktura / izmena =====================
  function NewClientModal(props){
    return h(ClientPanel,{client:null, onClose:props.onClose, onSaved:props.onSaved});
  }

  function InvoiceEditor(props){
    const s = useStore();
    const isMobile = useIsMobile();
    const existing = props.id ? s.invoices.find(i=>i.id===props.id) : null;
    const [liveId,setLiveId] = useState(()=> existing ? existing.id : null);
    const curInv = liveId ? s.invoices.find(i=>i.id===liveId) : null;
    const [clientId,setClientId] = useState(existing?existing.clientId:null);
    const client = s.clients.find(c=>c.id===clientId);
    const [currency,setCurrency] = useState(existing?existing.currency:(client?client.defaultCurrency:'EUR'));
    const [lang,setLang] = useState(existing?existing.lang:(client?client.defaultLang:'sr'));
    const [dueDays,setDueDays] = useState(existing?existing.dueDays:(client?client.defaultDueDays:7));
    const [accountId,setAccountId] = useState(existing?existing.accountId:(client?client.defaultAccountId:null));
    const [note,setNote] = useState(existing?existing.note:'Hvala na saradnji');
    const [items,setItems] = useState(existing?existing.items.slice():(client&&client.defaultItem?[{desc:client.defaultItem.desc, qty:1, price:client.defaultItem.amount}]:[{desc:'',qty:1,price:''}]));
    const [clientPicker,setClientPicker] = useState(false);
    const [langPicker,setLangPicker] = useState(false);
    const [newClientOpen,setNewClientOpen] = useState(false);
    const [closeConfirm,setCloseConfirm] = useState(false);
    const [showErrors,setShowErrors] = useState(false);
    const [stage,setStage] = useState('edit'); // edit | send | sent
    const [mobilePreview,setMobilePreview] = useState(false);
    const [sentInfo,setSentInfo] = useState(null);

    function pickClient(c){
      setClientId(c.id); setClientPicker(false);
      setCurrency(c.defaultCurrency); setLang(c.defaultLang); setDueDays(c.defaultDueDays); setAccountId(c.defaultAccountId);
      setItems(c.defaultItem ? [{desc:c.defaultItem.desc, qty:1, price:c.defaultItem.amount}] : [{desc:'',qty:1,price:''}]);
    }
    function addItem(){ setItems(items.concat([{desc:'',qty:1,price:''}])); }
    function removeItem(i){ setItems(items.filter((_,idx)=>idx!==i)); }
    function setItem(i,k,v){ setItems(items.map((it,idx)=> idx===i?Object.assign({},it,{[k]:v}):it)); }
    const total = items.reduce((sum,it)=> sum + (Number(it.qty)||1)*(Number(it.price)||0), 0);
    const account = s.accounts.find(a=>a.id===accountId) || s.accounts.find(a=>a.currency===currency);
    const number = curInv ? curInv.number : (props.previewNumber || '25/26-'+(Math.max.apply(null, s.invoices.map(i=>parseInt((i.number||'').split('-')[1]||'0',10)).concat([14]))+1));
    const previewInvoice = {number, currency, lang, issueDate:new Date().toISOString(), dueDays:Number(dueDays)||0, items};
    const docTemplate = Sel.templateForInvoice(s, previewInvoice, client);

    const errItems = !items.some(it=> it.desc && Number(it.price)>0);
    const errClient = !client;

    function buildData(){
      return {clientId, currency, lang, dueDays:Number(dueDays)||0, accountId: account?account.id:null, note,
        items: items.map(it=>({desc:it.desc, qty:Number(it.qty)||1, price:Number(it.price)||0}))};
    }
    function ensureInvoice(statusOverride){
      const data = Object.assign({}, buildData(), statusOverride?{status:statusOverride}:{});
      if(curInv){ IA.update(curInv.id, data); return curInv.id; }
      const created = IA.create(data);
      return created.id;
    }
    function saveDraft(){ const id = ensureInvoice('Nacrt'); setLiveId(id); store.toast('Nacrt je sačuvan.'); }
    function goToSend(){
      if(errClient || errItems){ setShowErrors(true); return; }
      const id = ensureInvoice('Nacrt'); setLiveId(id); setStage('send');
    }
    function close(){
      if(liveId || clientId || items.some(it=>it.desc||it.price)){ setCloseConfirm(true); } else { store.navigate('app/fakture'); }
    }
    function discardAndClose(){ if(liveId) IA.remove(liveId); store.navigate('app/fakture'); }
    function saveDraftAndClose(){ ensureInvoice('Nacrt'); store.navigate('app/fakture'); }

    if(stage==='send' || stage==='sent'){
      const id = liveId;
      return h('div',{className:'inv-shell'},
        h('div',{className:'inv-shell-row'},
          h('div',{className:'inv-send-col', style:isMobile?{width:'100%'}:null},
            h('div',{className:'inv-form-topbar'},
              h('button',{className:'inv-close-pill', onClick:()=>setStage('edit')}, h(Icons.chevronLeft,{width:18,height:18}),'Nazad na izmene'),
              h('span',{className:'inv-status-pill'},'Nacrt, još nije poslato')),
            h('div',{className:'inv-send-body'},
              h('h1',{className:'inv-form-title'},'Pregledaj i pošalji'),
              h(Field,{label:'Za'}, h(Input,{defaultValue:client?client.billingEmail:''})),
              h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>e.preventDefault()},'+ Dodaj još jednu adresu'),
              h(Field,{label:'Naslov'}, h(Input,{defaultValue:`Invoice ${number} from ${(s.business.ownerName||'').trim()} ${s.business.name}`})),
              h(Field,{label:'Poruka', hint:`Napisao sam poruku na ${lang==='sr'?'srpskom':'engleskom'} jer je to jezik fakture. Slobodno je izmeni.`},
                h('textarea',{className:'input', rows:4, defaultValue:`Poštovani,\n\nU prilogu je faktura ${number}.\n\nHvala.`})),
              h('div',{className:'row', style:{gap:10}}, h(Icons.paperclip,{width:18,height:18,style:{color:'var(--text-muted)'}}),
                h('div',null, h('div',null, `Invoice ${number.replace(/\//,'-')}.pdf`), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'84 KB, napravljen iz tvog šablona'))),
              h('label',{className:'checkbox-row'}, h('input',{type:'checkbox'}), h('span',null,'Pošalji kopiju i meni')),
              h('div',{className:'inv-form-actions', style:{justifyContent:'space-between'}},
                h(Button,{variant:'secondary', onClick:saveDraftAndClose},'Sačuvaj nacrt'),
                h(Button,{onClick:()=>{ IA.send(id); setSentInfo({number, client, total, due:U.invoiceDueDate(previewInvoice)}); setStage('sent'); }},'Pošalji fakturu')))),
          !isMobile ? h('div',{className:'inv-preview-col'},
            h('div',{className:'inv-preview-label-row'}, h('span',null,'Ovo dobija klijent'), h('span',null,'PDF u prilogu')),
            h('div',{className:'inv-preview-paper'}, h(InvoiceDoc,{invoice:previewInvoice, client, business:s.business, account, template:docTemplate}))) : null),
        stage==='sent' ? h(SentOverlay,{info:sentInfo, onClose:()=>store.navigate('app/fakture')}) : null);
    }

    return h('div',{className:'inv-shell'},
      h('div',{className:'inv-shell-row'},
        h('div',{className:'inv-form-col'},
          h('div',{className:'inv-form-topbar'},
            h('button',{className:'inv-close-pill', onClick:close}, h(Icons.x,{width:18,height:18}),'Zatvori'),
            h('span',{className:'inv-status-pill'}, curInv&&curInv.status==='Nacrt'&&liveId ? 'Nacrt, sačuvano' : 'Nacrt, nije sačuvano')),
          h('div',{className:'inv-form-body'},
            h('h1',{className:'inv-form-title'}, existing?'Izmena fakture':'Nova faktura'),
            showErrors ? h('div',{className:'inv-banner-error'}, h(Icons.alert,{width:18,height:18,style:{flexShrink:0}}), h('span',null,'Još dva polja treba da popuniš pre slanja.')) : null,
            h('div',{className:'inv-field inv-client-wrap'},
              h('span',{className:'lbl'},'Klijent'),
              h('div',Object.assign({className:'inv-combo'}, window.AIK.a11yClick(()=>setClientPicker(v=>!v))), h('span',null, client?client.name:'Izaberi klijenta'), h(Icons.chevronDown,{width:16,height:16})),
              h('a',{href:'#', className:'new-client-link poc-action-link', onClick:(e)=>{e.preventDefault(); setNewClientOpen(true);}},'+ Novi klijent'),
              clientPicker ? h('div',{className:'inv-dropdown', style:{top:70, left:0, right:'auto', minWidth:'100%'}},
                s.clients.map(c=> h('button',{key:c.id, onClick:()=>pickClient(c)}, c.name, h('span',{className:'faint', style:{marginLeft:'auto', fontSize:'0.8125rem'}}, c.defaultItem?c.defaultItem.desc+', '+U.fmtMoney(c.defaultItem.amount,c.defaultCurrency):'Iznos upisuješ na fakturi')))) : null,
              showErrors && errClient ? h('div',{className:'field-error'}, h(Icons.alert,{width:16,height:16}), h('span',null,'Izaberi klijenta kome šalješ fakturu.')) : null),
            client ? h('div',{className:'inv-sendto-row'}, h(Icons.mail,{width:16,height:16}), h('span',null,'Šaljem na ', h('span',{style:{fontWeight:500}},client.billingEmail)), h('a',{href:'#', className:'poc-action-link', style:{marginLeft:4}, onClick:(e)=>e.preventDefault()},'Izmeni')) : null,
            client && client.defaultItem ? h('div',{className:'hint'}, 'Popunjeno iz profila klijenta: valuta, jezik, rok, račun i stavka. ', h('a',{href:'#', onClick:e=>e.preventDefault()},'Izmeni profil')) : null,
            h('div',{className:'inv-field-row'},
              h('div',{className:'inv-field'}, h('span',{className:'lbl'},'Valuta'), h('div',{className:'inv-seg'}, ['EUR','USD','RSD'].map(cur=> h('button',{key:cur, type:'button', className:currency===cur?'active':'', onClick:()=>setCurrency(cur)}, cur)))),
              h('div',{className:'inv-field', style:{position:'relative'}}, h('span',{className:'lbl'},'Jezik fakture'),
                h('div',Object.assign({className:'inv-combo'}, window.AIK.a11yClick(()=>setLangPicker(v=>!v))), h('span',null, LANG_LABELS[lang]), h(Icons.chevronDown,{width:16,height:16})),
                langPicker ? h('div',{className:'inv-dropdown'}, [['sr','Srpski'],['en','Engleski']].map(([k,lb])=> h('button',{key:k, onClick:()=>{ setLang(k); setLangPicker(false); }}, lb))) : null)),
            h('div',{className:'inv-field-row'},
              h('div',{className:'inv-field'}, h('span',{className:'lbl'},'Broj'), h(Input,{value:number, readOnly:true})),
              h('div',{className:'inv-field'}, h('span',{className:'lbl'},'Datum izdavanja'), h(Input,{value:U.fmtDate(new Date().toISOString()), readOnly:true})),
              h('div',{className:'inv-field'}, h('span',{className:'lbl'},'Rok'), h('select',{className:'select', value:dueDays, onChange:e=>setDueDays(e.target.value)}, [3,7,15,30].map(d=>h('option',{key:d,value:d},d+' dana'))))),
            h('div',{className:'inv-field'},
              h('span',{className:'lbl'},'Stavke'),
              h('div',{className:'inv-items-table'},
                h('div',{className:'inv-items-head'}, h('span',{className:'desc'},'Opis'), h('span',{className:'qty'},'Kol.'), h('span',{className:'price'},'Cena'), h('span',{className:'amount'},'Iznos'), h('span',{style:{width:28}})),
                items.map((it,i)=> h('div',{key:i, className:'inv-item-row'},
                  h(Input,{className:'desc', placeholder:'Opis stavke', value:it.desc, onChange:e=>setItem(i,'desc',e.target.value)}),
                  h(Input,{className:'qty', type:'number', value:it.qty, onChange:e=>setItem(i,'qty',e.target.value)}),
                  h(Input,{className:'price', type:'number', placeholder:'Upiši iznos', value:it.price, onChange:e=>setItem(i,'price',e.target.value)}),
                  h('span',{className:'amount'}, U.fmtMoney((Number(it.qty)||1)*(Number(it.price)||0), currency)),
                  items.length>1 ? h('button',{className:'rm', onClick:()=>removeItem(i)}, h(Icons.x,{width:14,height:14})) : h('span',{style:{width:28}}))),
                h('button',{className:'inv-add-item', onClick:addItem},'+ Dodaj stavku'),
                showErrors && errItems ? h('div',{className:'field-error'}, h(Icons.alert,{width:16,height:16}), h('span',null,'Upiši opis stavke i iznos veći od 0.')) : null,
                client && !client.defaultItem && items.length===1 && !items[0].desc ? h('div',{className:'hint'}, client.name+' nema podrazumevanu cenu, pa iznos upisuješ svaki put.') : null,
                h('div',{className:'inv-totals-row'}, h('span',null,'PDV (nisam u sistemu PDV)'), h('span',null, U.fmtMoney(0,currency))),
                h('div',{className:'inv-totals-row grand'}, h('span',null,'Ukupno'), h('span',null, U.fmtMoney(total,currency))))),
            h(Field,{label:'Račun za uplatu'}, h('select',{className:'select', value:account?account.id:'', onChange:e=>setAccountId(e.target.value)},
              s.accounts.filter(a=>a.currency===currency).map(a=> h('option',{key:a.id, value:a.id}, accLabel(a))))),
            currency==='RSD' && lang==='sr' ? h(Field,{label:'Poziv na broj'}, h(Input,{value:'97 '+number, readOnly:true})) : null,
            h(Field,{label:'Napomena'}, h(Input,{value:note, onChange:e=>setNote(e.target.value)})),
            isMobile ? h('button',{className:'btn btn-secondary btn-block inv-mobile-preview-btn', onClick:()=>setMobilePreview(true)}, 'Pregled') : null,
            h('div',{className:'inv-form-actions'},
              h(Button,{variant:'secondary', onClick:saveDraft},'Sačuvaj nacrt'),
              h('a',{href:'#', style:{fontSize:'0.875rem', alignSelf:'center', marginRight:'auto'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/fakture/sablon');}},'Promeni izgled fakture'),
              h(Button,{onClick:goToSend},'Pregledaj i pošalji')))),
        !isMobile ? h('div',{className:'inv-preview-col'},
          h('div',{className:'inv-preview-label-row'}, h('span',null,'Pregled uživo'),
            h('a',{href:'#', onClick:(e)=>{e.preventDefault(); store.navigate('app/fakture/sablon');}},'Promeni izgled fakture')),
          h('div',{className:'inv-preview-paper'}, h(InvoiceDoc,{invoice:previewInvoice, client, business:s.business, account, template:docTemplate}))) : null),
      mobilePreview ? h(Sheet,{title:'Pregled uživo', onClose:()=>setMobilePreview(false)}, h('div',{style:{display:'flex', justifyContent:'center', padding:'8px 0 16px'}}, h('div',{className:'inv-preview-paper', style:{transform:'scale(0.68)', transformOrigin:'top center', marginBottom:-230}}, h(InvoiceDoc,{invoice:previewInvoice, client, business:s.business, account, template:docTemplate})))) : null,
      newClientOpen ? h(NewClientModal,{onClose:()=>setNewClientOpen(false), onSaved:(c)=>{ setNewClientOpen(false); pickClient(c); }}) : null,
      closeConfirm ? h(Modal,{title:'Sačuvati kao nacrt?', onClose:()=>setCloseConfirm(false), stackedFooter:true, footer:[
          h(Button,{key:'k', variant:'secondary', onClick:()=>setCloseConfirm(false)},'Nastavi izmene'),
          h(Button,{key:'d', variant:'danger', onClick:discardAndClose},'Odbaci fakturu'),
          h(Button,{key:'s', onClick:saveDraftAndClose},'Sačuvaj nacrt')]},
        'Ova faktura još nije poslata. Mogu da je sačuvam kao nacrt, pa nastaviš kad ti odgovara.') : null);
  }

  function SentOverlay(props){
    const info = props.info || {};
    return h('div',{className:'inv-sent-overlay'},
      h('div',{className:'inv-sent-card'},
        h('span',{className:'icon-circle-72', style:{background:'var(--limeta)', color:'var(--suma)'}}, h(Icons.check,{width:32,height:32})),
        h('div',{className:'stack-sm'},
          h('div',{style:{fontSize:'1.5rem', letterSpacing:'-0.02em'}}, `Faktura ${info.number} je poslata`),
          h('div',{style:{color:'var(--text-muted)'}}, `${info.client?info.client.name:''} je dobio mejl. Sad pratim uplatu: čim banka pošalje mejl, sam knjižim da je plaćena.`)),
        h('div',{style:{width:'100%', borderBottom:'1px solid var(--border)'}},
          h('div',{className:'inv-kv'}, h('span',{className:'k'},'Poslato na'), h('span',{className:'v'}, info.client?info.client.billingEmail:'')),
          h('div',{className:'inv-kv'}, h('span',{className:'k'},'Iznos'), h('span',{className:'v'}, U.fmtMoney(info.total, info.client?info.client.defaultCurrency:'EUR'))),
          h('div',{className:'inv-kv'}, h('span',{className:'k'},'Rok za uplatu'), h('span',{className:'v'}, info.due?U.fmtDate(info.due):''))),
        h('div',{className:'row', style:{gap:12, justifyContent:'center'}},
          h(Button,{onClick:props.onClose},'Nazad na fakture'),
          h(Button,{variant:'secondary', onClick:()=>store.toast('PDF je preuzet.')},'Preuzmi PDF'),
          h(Button,{variant:'ghost', onClick:()=>store.navigate('app/fakture/nova')},'Napravi još jednu'))));
  }

  // ===================== Pregled fakture =====================
  function ReminderModal(props){
    const { invoice, client } = props;
    return h(Modal,{title:'Pošalji podsetnik', onClose:props.onClose, footer:[
        h(Button,{key:'c', variant:'secondary', onClick:props.onClose},'Odustani'),
        h(Button,{key:'s', onClick:()=>{ IA.sendReminder(invoice.id); props.onClose(); }},'Pošalji podsetnik')]},
      h('div',{className:'stack'},
        h(Field,{label:'Za'}, h(Input,{defaultValue:client?client.billingEmail:'', readOnly:true})),
        h(Field,{label:'Naslov'}, h(Input,{defaultValue:`Reminder: invoice ${invoice.number}`})),
        h(Field,{label:'Poruka', hint:'Napisao sam ljubazan podsetnik na engleskom. Slobodno ga izmeni.'}, h('textarea',{className:'input', rows:4, defaultValue:`Dear ${client?client.name:''},\n\nThis is a friendly reminder that invoice ${invoice.number} is now overdue.\n\nBest regards.`})),
        h('div',{className:'row', style:{gap:10}}, h(Icons.paperclip,{width:18,height:18,style:{color:'var(--text-muted)'}}), h('div',null, h('div',null, `Invoice ${invoice.number.replace(/\//,'-')}.pdf`), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'84 KB, napravljen iz tvog šablona')))));
  }
  function VoidModal(props){
    const { invoice, client } = props;
    const [notify,setNotify] = useState(true);
    return h(Modal,{title:`Stornirati fakturu ${invoice.number}?`, onClose:props.onClose, stackedFooter:true, mobileTitleLg:true, footer:[
        h(Button,{key:'c', variant:'secondary', onClick:props.onClose},'Odustani'),
        h(Button,{key:'v', variant:'danger', onClick:()=>{ IA.void(invoice.id); props.onClose(); store.navigate('app/fakture/'+invoice.id); }},'Storniraj fakturu')]},
      h('div',{className:'stack'},
        h('p',{style:{margin:0, color:'var(--text-muted)'}},'Stornirana faktura ostaje u istoriji, ali se ne računa u tvoj prihod. Ovo ne može da se vrati.'),
        h('label',{className:'checkbox-row'}, h('input',{type:'checkbox', checked:notify, onChange:e=>setNotify(e.target.checked)}), h('span',null,`Obavesti ${client?client.name:'klijenta'} mejlom o storniranju`))));
  }

  function InvoiceDetail(props){
    const s = useStore();
    const isMobile = useIsMobile();
    const [menuOpen,setMenuOpen] = useState(false);
    const [reminderOpen,setReminderOpen] = useState(false);
    const [voidOpen,setVoidOpen] = useState(false);
    const inv = s.invoices.find(i=>i.id===props.id);
    if(!inv) return h(window.AIK.Screens['err-404']);
    const effStatus = U.invoiceEffectiveStatus(inv, TODAY);
    const client = s.clients.find(c=>c.id===inv.clientId);
    const account = s.accounts.find(a=>a.id===inv.accountId);
    const docTemplate = Sel.templateForInvoice(s, inv, client);
    const total = U.invoiceTotal(inv);
    const due = U.invoiceDueDate(inv);
    // Uvoz (28. krug, UVOZ_SPECIFIKACIJA.md 2.3/4): "Uvezene stavke i fakture... nemaju pregled u šablonu
    // i PDF iz aplikacije" — lagane fakture napravljene pri uvozu (Uvoz.commit, imported:true) nemaju
    // pravi šablon/dokument da se preuzme, pa se te dve stavke uklanjaju umesto da prikazuju lažan PDF.
    const menuItems = [
      h('button',{key:'e', onClick:()=>store.navigate('app/fakture/izmeni/'+inv.id)}, h(Icons.edit,{width:16,height:16}),'Izmeni fakturu'),
      h('button',{key:'d', onClick:()=>IA.duplicate(inv.id)}, h(Icons.copy,{width:16,height:16}),'Dupliraj fakturu'),
      inv.imported ? null : h('button',{key:'p', onClick:()=>store.toast('PDF je preuzet.')}, h(Icons.download,{width:16,height:16}),'Preuzmi PDF'),
      h('button',{key:'r', onClick:()=>{ setMenuOpen(false); RA.create ? store.toast('Ponavljajuća faktura je napravljena od ove.') : null; }}, h(Icons.clock,{width:16,height:16}),'Napravi ponavljajuću od ove'),
      h('hr',{key:'hr'}),
      effStatus!=='Stornirana' ? h('button',{key:'v', className:'danger', onClick:()=>{ setMenuOpen(false); setVoidOpen(true); }}, h(Icons.flag,{width:16,height:16}),'Storniraj fakturu') : null,
    ];
    return h('div',{className:'stack'},
      h('div',{className:'inv-detail-crumb'}, h('span',Object.assign({style:{cursor:'pointer'}}, window.AIK.a11yClick(()=>store.navigate('app/fakture'))),'Fakture'), h('span',null,'/'), h('span',{style:{color:'var(--text)'}}, inv.number)),
      h('div',{className:'inv-detail-head'},
        h('div',{className:'stack-sm'},
          h('h1',{style:{margin:0, fontSize:'var(--fs-24-32)', fontWeight:400, letterSpacing:'-0.025em'}}, `Faktura ${inv.number} `,
            h(Badge,{kind:statusKind(effStatus)}, effStatus==='Kasni' ? `Kasni ${U.lateDays(inv,TODAY)} ${U.dayWord(U.lateDays(inv,TODAY))}` : effStatus)),
          h('p',{style:{margin:0, color:'var(--text-muted)'}}, `${client?client.name:'–'}, ${U.fmtMoney(total, inv.currency)}`+(inv.imported?' · Uvoz':''))),
        h('div',{className:'row', style:{gap:12}},
          effStatus==='Nacrt' ? h(React.Fragment,null,
            h(Button,{onClick:()=>store.navigate('app/fakture/izmeni/'+inv.id)},'Nastavi uređivanje'),
            h(Button,{variant:'secondary', onClick:()=>IA.remove(inv.id)},'Obriši')) :
          effStatus==='Plaćena' ? h(React.Fragment,null,
            inv.imported ? null : h(Button,{variant:'secondary', onClick:()=>store.toast('PDF je preuzet.')},'Preuzmi PDF'),
            h(Button,{variant:'secondary', onClick:()=>store.toast('Faktura je ponovo poslata.')},'Pošalji ponovo')) :
          effStatus==='Kasni' ? h(React.Fragment,null,
            h(Button,{variant:'secondary', onClick:()=>IA.markPaid(inv.id)},'Označi kao plaćenu'),
            h(Button,{onClick:()=>setReminderOpen(true)},'Pošalji podsetnik')) :
          effStatus==='Stornirana' ? null : h(React.Fragment,null,
            h(Button,{variant:'secondary', onClick:()=>store.toast('Faktura je ponovo poslata.')},'Pošalji ponovo'),
            h(Button,{onClick:()=>IA.markPaid(inv.id)},'Označi kao plaćenu')),
          effStatus!=='Stornirana' ? h(RowMenu,{items:menuItems}) : null)),
      effStatus==='Kasni' ? h('div',{className:'inv-note-banner late'}, h('b',null,`Klijent kasni ${U.lateDays(inv,TODAY)} ${U.dayWord(U.lateDays(inv,TODAY))}`), h('span',null, `Rok je istekao ${U.fmtDate(due)}. Mogu da mu pošaljem ljubazan podsetnik.`)) : null,
      h('div',{className:'inv-detail-cols'},
        h('div',{className:'inv-detail-left'},
          h('div',{className:'inv-detail-card'},
            h('div',{className:'head'}, h('span',{className:'t'},'Detalji')),
            h('div',{style:{borderBottom:'1px solid var(--border)'}},
              h('div',{className:'inv-kv'}, h('span',{className:'k'},'Klijent'), h('span',{className:'v'}, client?client.name:'–', h('br'), h('span',{className:'faint', style:{fontSize:'0.875rem'}}, client?client.billingEmail:''))),
              h('div',{className:'inv-kv'}, h('span',{className:'k'},'Iznos'), h('span',{className:'v'}, U.fmtMoney(total, inv.currency))),
              h('div',{className:'inv-kv'}, h('span',{className:'k'},'Izdata'), h('span',{className:'v'}, U.fmtDate(inv.issueDate))),
              h('div',{className:'inv-kv'}, h('span',{className:'k'},'Rok za uplatu'), h('span',{className:'v'}, U.fmtDate(due))),
              h('div',{className:'inv-kv'}, h('span',{className:'k'},'Račun za uplatu'), h('span',{className:'v'}, accShort(account))))),
          h('div',{className:'inv-detail-card'},
            h('div',{className:'head'}, h('span',{className:'t'},'Istorija')),
            h('div',{className:'inv-timeline'},
              h('div',{className:'inv-timeline-item'}, h('span',{className:'t1'},'Napravljena'), h('span',null, U.fmtDate(inv.issueDate))),
              inv.sentAt || effStatus!=='Nacrt' ? h('div',{className:'inv-timeline-item'}, h('span',{className:'t1'},'Poslata na '+(client&&client.billingEmail?client.billingEmail:'nepoznatu adresu')), h('span',null, U.fmtDate(inv.sentAt||inv.issueDate))) : null,
              effStatus==='Kasni' ? h('div',{className:'inv-timeline-item'}, h('span',{className:'t1'},'Rok je istekao'), h('span',null, U.fmtDate(due)+', kasni '+U.lateDays(inv,TODAY)+' '+U.dayWord(U.lateDays(inv,TODAY)))) :
              effStatus==='Poslata' ? h('div',{className:'inv-timeline-item'}, h('span',{className:'t1'},'Čeka uplatu'), h('span',null, 'Rok je '+U.fmtDate(due))) : null,
              effStatus==='Plaćena' ? h('div',{className:'inv-timeline-item'}, h('span',{className:'t1'},'Plaćena'), h('span',null, U.fmtDate(inv.paidDate)+', uplata '+U.fmtMoney(total,inv.currency))) : null,
              effStatus==='Stornirana' ? h('div',{className:'inv-timeline-item'}, h('span',{className:'t1'},'Stornirana'), h('span',null, U.fmtDate(inv.voidedAt))) : null)),
          h('div',{className:'inv-detail-card'},
            h('div',{className:'head'}, h('span',{className:'t'},'Uplata')),
            h('p',{className:'sub-muted-dark', style:{margin:0}},
              // Uvoz (28. krug): uvezena faktura nema pravi mejl banke iza sebe — ne tvrdi nešto što
              // nije tačno (link "Vidi mejl banke" bi vodio ka nepostojećem zapisu).
              effStatus==='Plaćena' && inv.imported ? `Uplata od ${U.fmtDate(inv.paidDate)} je preneta iz tvog prethodnog poslovanja (Uvoz).` :
              effStatus==='Plaćena' ? h(React.Fragment,null, `Uplata je stigla ${U.fmtDate(inv.paidDate)} i povezana sam je sa ovom fakturom. Našao sam je u mejlu banke. `, h('a',{href:'#', className:'poc-action-link', onClick:e=>e.preventDefault()},'Vidi mejl banke')) :
              effStatus==='Kasni' ? 'Uplata još nije stigla. Svakog dana proveravam mejlove banke.' :
              effStatus==='Stornirana' ? 'Stornirana faktura se ne prati za uplatu.' :
              'Uplata još nije stigla. Čim banka pošalje mejl, povezaću je sa ovom fakturom.'))),
        !isMobile ? (inv.imported
          ? h('div',{className:'inv-detail-card', style:{flex:1}},
              h('div',{className:'head'}, h('span',{className:'t'},'Uvezena faktura')),
              h('p',{className:'sub-muted-dark', style:{margin:0}},'Ova faktura je preneta iz tvog prethodnog poslovanja. Nema pregled u šablonu ni PDF iz aplikacije — original dokument je sačuvan uz stavku u Knjizi prihoda.'))
          : h('div',{className:'inv-detail-right'},
              h('div',{style:{display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%'}}, h('span',null,'Kako je klijent vidi'), h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); store.toast('PDF je preuzet.');}},'Preuzmi PDF')),
              h('div',{className:'inv-preview-paper', style:{width:468, height:663}}, h('div',{style:{transform:'scale(0.975)', transformOrigin:'0 0', width:480}}, h(InvoiceDoc,{invoice:inv, client, business:s.business, account, template:docTemplate}))))) : null),
      reminderOpen ? h(ReminderModal,{invoice:inv, client, onClose:()=>setReminderOpen(false)}) : null,
      voidOpen ? h(VoidModal,{invoice:inv, client, onClose:()=>setVoidOpen(false)}) : null);
  }

  // ===================== Editor šablona =====================
  const BLOCK_LABELS = {logo:'Logo', datum:'Datum', broj:'Broj fakture', klijent:'Podaci o klijentu', firma:'Podaci o tvojoj firmi',
    banka:'Bankovni podaci', stavke:'Tabela stavki', ukupno:'Ukupno', rok:'Rok plaćanja', napomena:'Napomena', potpis:'Potpis i pečat'};
  const LAYOUTS = [['klasican','Klasičan'],['moderan','Moderan, traka sa strane'],['minimalan','Minimalan'],['kompaktan','Kompaktan, traka na vrhu']];
  function Seg(options, value, onPick){
    return h('div',{className:'inv-seg'}, options.map(([k,lb])=> h('button',{key:k, type:'button', className:value===k?'active':'', onClick:()=>onPick(k)}, lb)));
  }
  function Swatches(colors, value, onPick){
    return h('div',{className:'tpl-swatch-row'}, colors.map(c=> h('span',Object.assign({key:c, className:'tpl-swatch'+(c.toLowerCase()===String(value).toLowerCase()?' active':''), style:{background:c}}, window.AIK.a11yClick(()=>onPick(c))))));
  }
  function ruleLabel(t){
    if(t.isDefault) return 'Svi klijenti osim niže';
    const r = t.assignRule;
    if(!r) return 'Bez pravila dodele';
    if(r.domestic!==undefined) return r.domestic ? 'Domaći klijenti' : 'Strani klijenti';
    if(r.currency) return 'Valuta: '+r.currency;
    if(r.lang) return 'Jezik: '+(r.lang==='sr'?'Srpski':'Engleski');
    return 'Bez pravila dodele';
  }
  function TemplateEditor(){
    const s = useStore();
    const isMobile = useIsMobile();
    const tpl = s.invoiceTemplates.find(t=>t.id===s.activeTemplateId) || s.invoiceTemplates[0];
    const [level,setLevel] = useState('blok');
    const [selected,setSelected] = useState('firma');
    const [layoutOpen,setLayoutOpen] = useState(false);
    const [tplPickerOpen,setTplPickerOpen] = useState(false);
    const [addBlockOpen,setAddBlockOpen] = useState(false);
    // PhFak18: platno (480px) na telefonu počinje umanjeno da stane pored 12px padding-a, ne na 100%.
    const [zoom,setZoom] = useState(()=> isMobile ? 70 : 100);
    const [drag,setDrag] = useState(null); // {key, mode:'move'|'resize', startX, startY, origX, origY, origW, origH}
    const sampleInv = {number:'25/26-15', currency:'EUR', lang:'en', issueDate:new Date().toISOString(), dueDays:3,
      items:[{desc:'Webflow development', qty:1, price:900},{desc:'Additional design revisions', qty:1, price:300}]};
    const sampleClient = s.clients.find(c=>c.id==='c1') || s.clients[0];
    const account = s.accounts.find(a=>a.currency==='EUR');
    const bp = tpl.blockProps[selected] || {};

    // Korak 2a/2b: izbor bloka klikom i prevlačenje na platnu — mousedown na bloku bira i (ako se pomeri
    // miš) pokreće drag; delta se deli zoom-om da pokret na ekranu odgovara pokretu u koordinatama šablona.
    useEffect(()=>{
      if(!drag) return;
      function onMove(e){
        const dx = (e.clientX - drag.startX) / (zoom/100);
        const dy = (e.clientY - drag.startY) / (zoom/100);
        if(drag.mode==='move'){
          TA.updateBlockProps(tpl.id, drag.key, {x: Math.round(drag.origX+dx), y: Math.round(drag.origY+dy)});
        } else {
          TA.updateBlockProps(tpl.id, drag.key, {w: Math.max(24, Math.round(drag.origW+dx)), h: Math.max(14, Math.round(drag.origH+dy))});
        }
      }
      function onUp(){ setDrag(null); }
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return ()=>{ window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    }, [drag, zoom, tpl.id]);

    const editMode = {
      selected: level==='blok' ? selected : null,
      onSelect(key){ setSelected(key); setLevel('blok'); },
      onDragStart(e,key){
        const p = tpl.blockProps[key];
        setSelected(key); setLevel('blok');
        setDrag({key, mode:'move', startX:e.clientX, startY:e.clientY, origX:p.x, origY:p.y, origW:p.w, origH:p.h});
      },
      onResizeStart(e,key){
        const p = tpl.blockProps[key];
        setDrag({key, mode:'resize', startX:e.clientX, startY:e.clientY, origX:p.x, origY:p.y, origW:p.w, origH:p.h});
      },
    };

    return h('div',{className:'tpl-shell'},
      h('div',{className:'tpl-topbar'},
        h('div',{className:'tpl-topbar-left'},
          h('button',{className:'inv-close-pill', onClick:()=>store.navigate('app/fakture/nova')}, h(Icons.x,{width:18,height:18}),'Zatvori'),
          // PhFak18: mobilna zaglavlje ima SAMO Zatvori/Sačuvaj — izbor šablona, "Vrati na podrazumevano" i
          // "Raspored" tu ne staju (frejm ih ne pokazuje na telefonu); Raspored se zato ponavlja u panelu
          // ispod platna (iduci blok koda), ostalo ostaje dostupno samo sa desktopa, iskreno van obima ovde.
          !isMobile ? h('div',{className:'inv-field', style:{position:'relative'}},
            h('div',Object.assign({className:'inv-combo', style:{minWidth:200}}, window.AIK.a11yClick(()=>setTplPickerOpen(v=>!v))), h('span',null,'Šablon: '+tpl.name), h(Icons.chevronDown,{width:16,height:16})),
            tplPickerOpen ? h('div',{className:'inv-dropdown tpl-picker-dropdown', style:{top:40, left:0, minWidth:260}},
              s.invoiceTemplates.map(t=> h('button',{key:t.id, className:t.id===tpl.id?'active':'', onClick:()=>{ TA.selectActive(t.id); setTplPickerOpen(false); }},
                h('span',null, t.name+(t.isDefault?' (Podrazumevani)':'')), h('span',{className:'faint', style:{marginLeft:'auto', fontSize:'0.75rem'}}, ruleLabel(t)))),
              h('hr'),
              h('button',{onClick:()=>{ TA.createNew(); setTplPickerOpen(false); }},'+ Novi šablon'),
              h('button',{onClick:()=>{ TA.duplicate(tpl.id); setTplPickerOpen(false); }},'Dupliraj ovaj šablon')) : null) : null,
          !isMobile ? h('span',{className:'faint', style:{fontSize:'0.875rem'}},'Izmene nisu sačuvane') : null),
        h('div',{className:'row', style:{gap:10}},
          !isMobile ? h(Button,{variant:'secondary', size:'sm', onClick:()=>setLayoutOpen(true)},'Raspored') : null,
          !isMobile ? h(Button,{variant:'secondary', size:'sm', onClick:()=>TA.resetDefault(tpl.id)},'Vrati na podrazumevano') : null,
          h(Button,{size:'sm', onClick:()=>TA.save()}, isMobile?'Sačuvaj':'Sačuvaj šablon'))),
      h('div',{className:'tpl-body'},
        h('div',{className:'tpl-blocks-col'},
          h('div',null, h('div',{style:{fontSize:'1rem', marginBottom:4}},'Blokovi'), h('div',{className:'hint'},'Prevuci da promeniš redosled, uključi ili isključi.')),
          tpl.blocks.map((key,idx)=> h('div',{key, className:'tpl-block-row'+(tpl.blocksOff.includes(key)?' off':'')+(selected===key&&level==='blok'?' active':'')},
            h(Toggle,{on:!tpl.blocksOff.includes(key), onChange:()=>TA.toggleBlock(tpl.id,key)}),
            h('span',Object.assign({className:'name', style:{cursor:'pointer'}}, window.AIK.a11yClick(()=>{ setSelected(key); setLevel('blok'); })), BLOCK_LABELS[key]||key),
            h('span',{className:'reorder'},
              h('button',{onClick:()=>TA.moveBlock(tpl.id,key,-1), disabled:idx===0}, h(Icons.chevronUp?Icons.chevronUp:Icons.chevronDown,{width:12,height:12,style:{transform:'rotate(180deg)'}})),
              h('button',{onClick:()=>TA.moveBlock(tpl.id,key,1), disabled:idx===tpl.blocks.length-1}, h(Icons.chevronDown,{width:12,height:12}))))),
          h('div',{style:{position:'relative'}},
            h('button',{className:'inv-add-item', style:{marginTop:8, width:'100%'}, disabled:!tpl.blocksOff.length, onClick:()=>setAddBlockOpen(v=>!v)},'+ Dodaj blok'),
            addBlockOpen && tpl.blocksOff.length ? h('div',{className:'inv-dropdown', style:{top:'100%', left:0, right:'auto', minWidth:'100%'}},
              tpl.blocksOff.map(key=> h('button',{key, onClick:()=>{ TA.toggleBlock(tpl.id,key); setAddBlockOpen(false); }}, BLOCK_LABELS[key]||key))) : null)),
        h('div',{className:'tpl-canvas-col'},
          h('div',{className:'tpl-zoom-row'},
            h('button',{className:'zbtn', onClick:()=>setZoom(z=>Math.max(50,z-10))},'−'), h('span',null, zoom+'%'), h('button',{className:'zbtn', onClick:()=>setZoom(z=>Math.min(150,z+10))},'+'),
            h('span',{style:{marginLeft:16}},'Mreža'), h('span',null,'Vodilice'), h('span',null,'Primer podataka')),
          h('div',{className:'tpl-level-toggle'}, [['blok','Blok'],['tabela','Tabela'],['faktura','Cela faktura']].map(([k,lb])=>
            h('button',{key:k, className:level===k?'active':'', onClick:()=>setLevel(k)}, lb))),
          h('div',{className:'inv-preview-paper', style:{width:480*zoom/100, height:680*zoom/100, overflow:'hidden'}},
            h('div',{style:{transform:`scale(${zoom/100})`, transformOrigin:'0 0', width:480}, onMouseDown:()=>{ /* klik na praznu platnu ne menja selekciju — ostaje poslednji izabran blok */ }},
              h(InvoiceDoc,{invoice:sampleInv, client:sampleClient, business:s.business, account, template:tpl, editMode})))),
        h('div',{className:'tpl-panel-col'},
          level==='blok' ? h(React.Fragment,null,
            h('div',null, h('div',{className:'subtitle'},'Izabrani blok'), h('div',{className:'title'}, BLOCK_LABELS[selected]||selected)),
            isMobile ? h(Button,{variant:'secondary', size:'sm', onClick:()=>setLayoutOpen(true)},'Raspored') : null,
            h('div',{className:'tpl-control'}, h('span',{className:'lbl'},'Poravnanje'), Seg([['left','Levo'],['center','Sredina'],['right','Desno']], bp.align, v=>TA.updateBlockProps(tpl.id,selected,{align:v}))),
            h('div',{className:'tpl-control'}, h('span',{className:'lbl'},'Veličina teksta'), Seg([['manji','Manji'],['normal','Srednji'],['veci','Veći']], bp.size, v=>TA.updateBlockProps(tpl.id,selected,{size:v}))),
            h('div',{className:'tpl-control'}, h('span',{className:'lbl'},'Boja teksta'), Swatches(['#161A17','#0F2A22','#6B706C','#B4281E','#1D5FC2'], bp.color, c=>TA.updateBlockProps(tpl.id,selected,{color:c}))),
            // PhFak18: mobilni panel staje posle "Boja teksta" i ispisuje ovu tačnu napomenu umesto
            // Font/Pozicija/Širina-Visina/Pozadina/Okvir kontrola (frejm ne pokazuje da li i kako se
            // "Još opcija" otvara dalje — ostavljeno kao informativna napomena, ne izmišljeno ponašanje).
            isMobile ? h('div',{className:'hint'},'Još opcija: pozicija, širina, okvir') : h(React.Fragment,null,
              h(Field,{label:'Font'}, h('select',{className:'select', value:bp.font, onChange:e=>TA.updateBlockProps(tpl.id,selected,{font:e.target.value})}, h('option',{value:'Arial'},'Arial'))),
              h('div',{className:'row', style:{gap:12}},
                h(Field,{label:'Pozicija X'}, h(Input,{type:'number', value:bp.x, onChange:e=>TA.updateBlockProps(tpl.id,selected,{x:Number(e.target.value)||0})})),
                h(Field,{label:'Pozicija Y'}, h(Input,{type:'number', value:bp.y, onChange:e=>TA.updateBlockProps(tpl.id,selected,{y:Number(e.target.value)||0})}))),
              h('div',{className:'row', style:{gap:12}},
                h(Field,{label:'Širina'}, h(Input,{type:'number', value:bp.w, onChange:e=>TA.updateBlockProps(tpl.id,selected,{w:Math.max(24,Number(e.target.value)||0)})})),
                h(Field,{label:'Visina'}, h(Input,{type:'number', value:bp.h, onChange:e=>TA.updateBlockProps(tpl.id,selected,{h:Math.max(14,Number(e.target.value)||0)})}))),
              h('label',{className:'checkbox-row'}, h('input',{type:'checkbox', checked:!!bp.bg, onChange:e=>TA.updateBlockProps(tpl.id,selected,{bg:e.target.checked})}), h('span',null,'Pozadina bloka')),
              h('label',{className:'checkbox-row'}, h('input',{type:'checkbox', checked:!!bp.border, onChange:e=>TA.updateBlockProps(tpl.id,selected,{border:e.target.checked})}), h('span',null,'Okvir oko bloka')))) :
          level==='tabela' ? h(React.Fragment,null,
            h('div',null, h('div',{className:'subtitle'},'Izabrani blok'), h('div',{className:'title'},'Tabela stavki')),
            h('div',{className:'tpl-control'}, h('span',{className:'lbl'},'Kolone'), h('div',{className:'chip-row'},
              [['opis','Opis'],['kolicina','Količina'],['jm','Jedinica mere'],['cena','Cena'],['popust','Popust'],['iznos','Iznos']].map(([k,lb])=>
                h('span',Object.assign({key:k, className:'chip'+(tpl.table.cols.includes(k)?' active':'')}, window.AIK.a11yClick(()=>TA.toggleTableCol(tpl.id,k))), lb)))),
            h('div',{className:'tpl-control'}, h('span',{className:'lbl'},'Linije'), Seg([['okvir','Okvir'],['horizontalne','Horizontalne'],['bez','Bez']], tpl.table.lines, v=>TA.updateTable(tpl.id,{lines:v}))),
            h('div',{className:'tpl-control'}, h('span',{className:'lbl'},'Razmak redova'), Seg([['gusto','Gusto'],['normalno','Normalno'],['prostrano','Prostrano']], tpl.table.density, v=>TA.updateTable(tpl.id,{density:v}))),
            h('label',{className:'checkbox-row'}, h('input',{type:'checkbox', checked:!!tpl.table.zebra, onChange:e=>TA.updateTable(tpl.id,{zebra:e.target.checked})}), h('span',null,'Naizmenična boja redova')),
            h('div',{className:'tpl-control'}, h('span',{className:'lbl'},'Boja zaglavlja tabele'), Swatches(['#ffffff','#F4F2F0','#EEF8D2'], tpl.table.headerColor, c=>TA.updateTable(tpl.id,{headerColor:c})))) :
          h(React.Fragment,null,
            h('div',null, h('div',{className:'title'},'Cela faktura'), h('div',{className:'subtitle'},'Važi za svaki blok')),
            h('div',{className:'tpl-control'}, h('span',{className:'lbl'},'Boja akcenta'), Swatches(['#0F2A22','#1D5FC2','#B4281E','#9A6B12','#161A17'], tpl.accentColor, c=>TA.update(tpl.id,{accentColor:c}))),
            h(Field,{label:'Font naslova'}, h('select',{className:'select', value:tpl.doc.titleFont, onChange:e=>TA.updateDoc(tpl.id,{titleFont:e.target.value})}, h('option',{value:'Inter'},'Inter'))),
            h(Field,{label:'Font teksta'}, h('select',{className:'select', value:tpl.doc.textFont, onChange:e=>TA.updateDoc(tpl.id,{textFont:e.target.value})}, h('option',{value:'Arial'},'Arial'))),
            h('div',{className:'tpl-control'}, h('span',{className:'lbl'},'Margine'), Seg([['uske','Uske'],['srednje','Srednje'],['siroke','Široke']], tpl.doc.margins, v=>TA.updateDoc(tpl.id,{margins:v}))),
            h('label',{className:'checkbox-row'}, h('input',{type:'checkbox', checked:!!tpl.doc.topBar, onChange:e=>TA.updateDoc(tpl.id,{topBar:e.target.checked})}), h('span',null,'Traka u boji na vrhu')),
            h(Field,{label:'Vodeni žig'}, h('select',{className:'select', value:tpl.doc.watermark, onChange:e=>TA.updateDoc(tpl.id,{watermark:e.target.value})}, h('option',{value:'bez'},'Bez'))),
            h(Field,{label:'Tekst u podnožju'}, h(Input,{value:tpl.doc.footerText, onChange:e=>TA.updateDoc(tpl.id,{footerText:e.target.value})})),
            h('div',{className:'tpl-control'}, h('span',{className:'lbl'},'Veličina loga'), Seg([['mali','Mali'],['srednji','Srednji'],['veliki','Veliki']], tpl.doc.logoSize, v=>TA.updateDoc(tpl.id,{logoSize:v}))),
            h('div',{className:'tpl-control'}, h('span',{className:'lbl'},'Oblik loga'), Seg([['kvadrat','Kvadrat'],['krug','Krug']], tpl.doc.logoShape, v=>TA.updateDoc(tpl.id,{logoShape:v}))),
            !tpl.isDefault ? h('div',{className:'tpl-control'}, h('span',{className:'lbl'},'Pravilo dodele'),
              h('select',{className:'select', value: tpl.assignRule&&tpl.assignRule.domestic!==undefined?'domestic': tpl.assignRule&&tpl.assignRule.currency?'currency': tpl.assignRule&&tpl.assignRule.lang?'lang':'none',
                onChange:e=>{
                  const v = e.target.value;
                  if(v==='none') TA.setAssignRule(tpl.id, null);
                  else if(v==='domestic') TA.setAssignRule(tpl.id, {domestic:true});
                  else if(v==='currency') TA.setAssignRule(tpl.id, {currency:(tpl.assignRule&&tpl.assignRule.currency)||'USD'});
                  else TA.setAssignRule(tpl.id, {lang:(tpl.assignRule&&tpl.assignRule.lang)||'en'});
                }},
                h('option',{value:'none'},'Bez pravila (ne dodeljuje se)'),
                h('option',{value:'domestic'},'Domaći klijenti'),
                h('option',{value:'currency'},'Po valuti'),
                h('option',{value:'lang'},'Po jeziku fakture')),
              tpl.assignRule && tpl.assignRule.currency ? h('select',{className:'select', style:{marginTop:8}, value:tpl.assignRule.currency, onChange:e=>TA.setAssignRule(tpl.id,{currency:e.target.value})},
                ['EUR','USD','RSD'].map(c=>h('option',{key:c,value:c},c))) : null,
              tpl.assignRule && tpl.assignRule.lang ? h('select',{className:'select', style:{marginTop:8}, value:tpl.assignRule.lang, onChange:e=>TA.setAssignRule(tpl.id,{lang:e.target.value})},
                [['sr','Srpski'],['en','Engleski']].map(([k,lb])=>h('option',{key:k,value:k},lb))) : null,
              h('div',{className:'hint'},'Nije u frejmu kao zaseban kontrol — dodato minimalno da pravilo iz spec 7.6 stvarno radi.')) : null))),
      layoutOpen ? h(Modal,{title:'Izaberi raspored', onClose:()=>setLayoutOpen(false), size:'lg', footer:[
          h(Button,{key:'c', variant:'secondary', onClick:()=>setLayoutOpen(false)},'Odustani'),
          h(Button,{key:'a', onClick:()=>{ TA.applyLayout(tpl.id, tpl.layout); setLayoutOpen(false); }},'Primeni raspored')]},
        h('div',{className:'stack'},
          h('p',{style:{margin:0, color:'var(--text-muted)'}},'Ovo je polazna tačka. Posle možeš sve da menjaš. Tvoji podaci i boje ostaju.'),
          h('div',{className:'tpl-layout-grid'}, LAYOUTS.map(([k,lb])=> h('div',Object.assign({key:k, className:'tpl-layout-opt'+(tpl.layout===k?' active':'')}, window.AIK.a11yClick(()=>TA.update(tpl.id,{layout:k}))), h('div',{className:'tpl-layout-swatch'}), h('span',null,lb)))),
          h('p',{style:{margin:0, fontSize:'0.875rem', color:'var(--text-muted)'}},'Kad primeniš novi raspored, blokove koje si ručno pomerio vraćam na njihova mesta.'))) : null);
  }

  // ===================== Router =====================
  function FaktureScreen(props){
    const sub = props.sub || '';
    if(sub === 'nova') return h(InvoiceEditor,{mode:'new'});
    if(sub.indexOf('izmeni/')===0) return h(InvoiceEditor,{mode:'edit', id: sub.slice(7)});
    if(sub === 'sablon') return h(TemplateEditor);
    if(sub === 'klijenti') return h(Shell, {tab:'klijenti'});
    if(sub === 'ponavljajuce') return h(Shell, {tab:'ponavljajuce'});
    if(sub) return h(Shell, {tab:'detail', id:sub});
    return h(Shell, {tab:'fakture'});
  }
  function Shell(props){
    if(props.tab==='detail') return h(InvoiceDetail,{id:props.id});
    return h(ListPage,{tab:props.tab});
  }

  window.AIK = window.AIK || {};
  window.AIK.Screens = window.AIK.Screens || {};
  window.AIK.Screens.fakture = FaktureScreen;
  window.AIK.InvoiceDoc = InvoiceDoc;
})();
