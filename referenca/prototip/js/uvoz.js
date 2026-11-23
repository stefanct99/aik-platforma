// Faza 10b, Round 28, Korak 2-5: Prenos dosadašnjeg poslovanja (Uv1-Uv6/PhUv1-PhUv6).
// Ceo tok preko celog ekrana (fullBleed, bez sidebar/topbar-a — videti app.js i .uvoz-shell u base.css).
// Frejm je izvor istine za izgled (dizajn/*.dc.html u UVOZ_PAKET-u), UVOZ_SPECIFIKACIJA.md za ponašanje.
(function(){
  const h = React.createElement;
  const { useState, useEffect, useRef } = React;
  const { useStore, Components, useIsMobile, a11yClick } = window.AIK;
  const { Button, Field, Input, Modal } = Components;
  const Icons = window.AIK.Icons;
  const store = window.AIK.store;
  const U = window.AIK.Util;
  const Act = window.AIK.Actions.Uvoz;

  // --fs-24-32 (tokens.css, "naslovi ekrana") daje tačno 2rem na desktopu i 1.5rem na telefonu u JEDNOJ
  // vrednosti — Uv1-6 naslovi su 2rem, PhUv1-6 su 1.5rem (nađeno u run.js formalnom ciklusu, Korak 6/29).
  const H1 = {margin:0, fontSize:'var(--fs-24-32)', fontWeight:400, letterSpacing:'-0.025em', lineHeight:1.2};
  const PMUTED = {margin:0, fontSize:'1rem', lineHeight:1.5, color:'var(--text-muted)'};

  function Header(props){
    const isMobile = useIsMobile();
    return h('div',{className:'uvoz-header'},
      h('button',Object.assign({className:'close sub-muted-dark', type:'button'}, {onClick:props.onClose}),
        h(Icons.x,{width:18,height:18}), 'Zatvori'),
      h('span',{className:'title'}, isMobile?'Prenesi poslovanje':'Prenesi dosadašnje poslovanje'),
      h('span',{className:'spacer'}));
  }

  function StepsBar(props){
    return h('div',{className:'uvoz-steps'},
      h('span',{className:'n'}, 'Korak '+props.step+' od 4'),
      h('div',{className:'uvoz-steps-bar'}, [0,1,2,3].map(i=> h('span',{key:i, className:i<props.step?'on':''}))));
  }

  function Footer(props){
    return h('div',{className:'uvoz-footer'}, h('div',{className:'uvoz-footer-inner'}, props.children));
  }

  function RadioCard(props){
    return h('div',Object.assign({className:'uvoz-radio-card'+(props.selected?' sel':'')}, a11yClick(props.onClick, 'radio')),
      h('span',{className:'uvoz-radio-dot'}),
      h('div',{style:{display:'flex', flexDirection:'column', gap:6}},
        h('span',{style:{fontSize:'1rem'}}, props.title),
        h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem', lineHeight:1.5}}, props.sub),
        props.extra||null));
  }

  function fmtFileSize(bytes){
    if(bytes>=1024*1024) return (bytes/(1024*1024)).toFixed(1).replace('.',',')+' MB';
    return Math.max(1,Math.round(bytes/1024))+' KB';
  }

  // "Prihodi od" (Uv1/PhUv1): frejm crta prilagođeni prikaz ("15.11.2025. (12 meseci unazad)" + strelica
  // dole), ne goli date-input. Pravi <input type="date"> je nevidljiv preko celog polja (prima klik, otvara
  // nativni birač), a tekst iznad se samo osvežava — ista tehnika kao sakriveni native input svuda u app-u
  // gde treba native ponašanje ispod prilagođenog izgleda. "(12 meseci unazad)" se gasi čim datum nije više
  // tačno podrazumevanih 12 meseci unazad.
  function StartDateField(props){
    const { value, onChange } = props;
    const isDefault = value === Act.defaultStartDate();
    return h('div',{style:{display:'flex', flexDirection:'column', gap:6}},
      h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem'}},'Prihodi od'),
      h('div',{className:'uvoz-date-display'},
        h('span',null, U.fmtDate(value)+(isDefault?' (12 meseci unazad)':'')),
        h(Icons.chevronDown,{width:16,height:16}),
        h('input',{type:'date', className:'uvoz-date-hidden-input', value:value?value.slice(0,10):'',
          onChange:e=>onChange(e.target.value)})),
      h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}},'Limit od 6.000.000 din računa se za poslednjih 12 meseci, zato su potrebni prihodi i od prošle godine.'));
  }

  // ===================== Korak 1 (Uv1): izbor načina =====================
  function StepIzbor(props){
    const { method, setMethod, startDate, setStartDate, onClose, onNext } = props;
    return h(React.Fragment,null,
      h(StepsBar,{step:1}),
      h('div',{style:{display:'flex', flexDirection:'column', gap:8}},
        h('h1',{style:H1},'Prenesi dosadašnje poslovanje'),
        h('p',{style:PMUTED},'Ako si već radio ove godine, prenesi prihode da limit, knjiga prihoda i brojevi faktura budu tačni od prvog dana.')),
      h(StartDateField,{value:startDate, onChange:setStartDate}),
      h('div',{style:{display:'flex', flexDirection:'column', gap:12}},
        h(RadioCard,{selected:method==='dokumenta', onClick:()=>setMethod('dokumenta'), title:'Učitaj dokumenta',
          sub:'PDF, Excel, CSV ili slika: knjiga prihoda, fakture, izvodi. Ja ih pročitam, a ti proveriš pre čuvanja.'}),
        h(RadioCard,{selected:method==='sablon', onClick:()=>setMethod('sablon'), title:'Popuni naš šablon',
          sub:'Preuzmi tabelu, popuni je ili je daj knjigovođi da je popuni, pa je učitaj.',
          extra: h('span',Object.assign({className:'uvoz-link'}, a11yClick((e)=>{ if(e&&e.stopPropagation) e.stopPropagation(); Act.downloadTemplate(); })),'Preuzmi šablon')}),
        h(RadioCard,{selected:method==='rucno', onClick:()=>setMethod('rucno'), title:'Unesi ručno',
          sub:'Stavku po stavku. Dobro ako imaš samo nekoliko prihoda.'})),
      h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}},'Nemaš prethodnih prihoda? ',
        h('span',Object.assign({className:'uvoz-link'}, a11yClick(()=>{ Act.startFromZero(); })),'Počni od nule')),
      h(Footer,null,
        h(Button,{key:'z', variant:'secondary', onClick:onClose},'Zatvori'),
        h(Button,{key:'d', onClick:onNext},'Dalje')));
  }

  // ===================== Korak 2 (Uv2): učitavanje dokumenata =====================
  function StepUpload(props){
    const { startDate, method, files, setFiles, onBack, onNext } = props;
    const inputRef = useRef(null);
    // "Popuni naš šablon" čita samo PRVI CSV (parseCsvText radi nad jednim fajlom) — ćutke zanemariti
    // ostale bi korisnika ostavilo da misli da je sve učitano; traka ispod liste to otvoreno kaže.
    const csvCount = method==='sablon' ? files.filter(f=>/\.csv$/i.test(f.name)).length : 0;
    // "do 20 MB po fajlu" i tipovi iz dropzone napomene (PDF/XLSX/CSV/JPG/PNG) nisu samo tekst — fajl
    // van toga se odbija uz objašnjenje, ne tiho prihvata (accept na <input> ne sprečava prevlačenje).
    const MAX_BYTES = 20*1024*1024;
    const ALLOWED_EXT = ['.pdf','.xlsx','.xls','.csv','.jpg','.jpeg','.png'];
    function handleFiles(fileList){
      const all = Array.from(fileList||[]);
      const tooBig = all.filter(f=> f.size>MAX_BYTES);
      const wrongType = all.filter(f=> f.size<=MAX_BYTES && !ALLOWED_EXT.some(ext=> f.name.toLowerCase().endsWith(ext)));
      const ok = all.filter(f=> f.size<=MAX_BYTES && ALLOWED_EXT.some(ext=> f.name.toLowerCase().endsWith(ext)));
      if(tooBig.length) store.toast(tooBig.length===1 ? ('"'+tooBig[0].name+'" je preko 20 MB, nije učitan.') : (tooBig.length+' fajlova je preko 20 MB, nisu učitani.'));
      if(wrongType.length) store.toast(wrongType.length===1 ? ('"'+wrongType[0].name+'" nije podržan tip fajla.') : (wrongType.length+' fajlova nije podržanog tipa.'));
      const arr = ok.map(f=>({file:f, name:f.name, size:f.size}));
      if(arr.length) setFiles(prev=> prev.concat(arr));
    }
    return h(React.Fragment,null,
      h(StepsBar,{step:2}),
      h('div',{style:{display:'flex', flexDirection:'column', gap:8}},
        h('h1',{style:H1},'Učitaj dokumenta'),
        h('p',{style:PMUTED},'Dodaj sve što imaš od '+U.fmtDate(startDate)+': knjigu prihoda, fakture, izvode. Možeš više fajlova odjednom.')),
      h('div',Object.assign({className:'uvoz-dropzone'},
        {onClick:()=>inputRef.current && inputRef.current.click(),
         onDragOver:(e)=>e.preventDefault(),
         onDrop:(e)=>{ e.preventDefault(); handleFiles(e.dataTransfer.files); }}),
        h('input',{ref:inputRef, type:'file', multiple:true, accept:'.pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png', style:{display:'none'},
          onChange:(e)=>{ handleFiles(e.target.files); e.target.value=''; }}),
        h('span',{className:'ic'}, h(Icons.uploadArrow,{width:22,height:22})),
        h('span',{style:{fontSize:'1rem'}},'Prevuci dokumenta ovde ili ', h('span',{className:'uvoz-link'},'izaberi fajlove')),
        h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}},'PDF, XLSX, CSV, JPG ili PNG, do 20 MB po fajlu.')),
      files.length ? h('div',{className:'uvoz-card-like', style:{gap:10}},
        h('span',{style:{fontSize:'1rem'}},'Učitano ('+files.length+')'),
        h('div',{style:{display:'flex', flexDirection:'column', marginTop:-6}},
          files.map((f,i)=> h('div',{key:i, className:'uvoz-file-row'},
            h('span',{style:{color:'var(--text-muted)', display:'flex'}}, h(Icons.fileText,{width:20,height:20})),
            h('div',{style:{display:'flex', flexDirection:'column', minWidth:0, flex:1}},
              h('span',{style:{fontSize:'1rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}, f.name),
              h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}}, fmtFileSize(f.size))),
            h('span',{className:'uvoz-pill uvoz-pill-ok'},'Učitano'))))) : null,
      csvCount>1 ? h('div',{style:{padding:'14px 16px', borderRadius:8, background:'var(--warn-bg)', color:'var(--warn)', fontSize:'0.875rem', lineHeight:1.5}},
        'Učitan je samo prvi šablon. Učitaj ostale posebno.') : null,
      h('div',{style:{display:'flex', gap:12, alignItems:'flex-start', fontSize:'0.875rem', lineHeight:1.5}, className:'sub-muted-dark'},
        h('span',{style:{color:'var(--text-muted)', display:'flex', marginTop:1}}, h(Icons.info,{width:18,height:18})),
        h('span',null,'Dokumenta se čuvaju uz stavke da možeš da ih otvoriš kasnije. Vidiš ih samo ti. Nemaš knjigu prihoda? ',
          h('span',Object.assign({className:'uvoz-link'}, a11yClick(()=>Act.downloadTemplate())),'Preuzmi naš šablon'),'.')),
      h(Footer,null,
        h(Button,{key:'n', variant:'secondary', onClick:onBack},'Nazad'),
        h(Button,{key:'r', disabled:!files.length, onClick:onNext},'Pročitaj dokumenta')));
  }

  // ===================== Korak 3 (Uv3): čitanje (simulirano, kao Rez3) =====================
  const READING_LABELS = ['Čitam stavke iz knjige prihoda i faktura','Povezujem uplate sa fakturama','Proveravam kurseve NBS za devizne uplate','Pripremam pregled za tebe'];
  function StepReading(props){
    const { fileCount, onDone, onCancel } = props;
    const [idx,setIdx] = useState(0);
    useEffect(()=>{
      if(idx>=READING_LABELS.length){ const t=setTimeout(onDone, 450); return ()=>clearTimeout(t); }
      const t = setTimeout(()=>setIdx(i=>i+1), 550);
      return ()=>clearTimeout(t);
      // eslint-disable-next-line
    },[idx]);
    return h(React.Fragment,null,
      h(StepsBar,{step:3}),
      h('div',{style:{display:'flex', flexDirection:'column', gap:8}},
        h('h1',{style:H1},'Čitam tvoja dokumenta...'),
        h('p',{style:PMUTED},'Ovo traje kratko. Ne moraš da zatvaraš ovaj ekran, ništa se ne čuva dok ne potvrdiš.')),
      h('div',{className:'uvoz-card-like', style:{gap:18}},
        READING_LABELS.map((label,i)=> h('div',{key:i, style:{display:'flex', alignItems:'center', gap:14, fontSize:'1rem', color: i<idx?'var(--text)':(i===idx?'var(--text)':'var(--text-muted)')}},
          i<idx ? h('span',{style:{width:28,height:28,borderRadius:9999,background:'var(--sidebar-item-active)',display:'flex',alignItems:'center',justifyContent:'center'}}, h(Icons.check,{width:18,height:18,className:'uvoz-done-ic'})) :
          i===idx ? h('span',{className:'uvoz-spinner'}) :
          h('span',{style:{width:28,height:28,borderRadius:9999,border:'1px solid var(--border-strong)',boxSizing:'border-box'}}),
          label))),
      h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}}, 'Pročitano '+(fileCount||3)+' od '+(fileCount||3)+' dokumenta'),
      h(Footer,null, h(Button,{key:'o', variant:'secondary', onClick:onCancel},'Odustani')));
  }

  // ===================== Korak 4 (Uv4): provera pročitanog =====================
  function summarySeg(l,v,s){ return h('div',{className:'uvoz-summary-seg'}, h('span',{className:'l sub-muted-dark'},l), h('span',{className:'v'},v), h('span',{className:'s'},s)); }
  function summaryRow(l,v){ return h('div',{style:{display:'flex', justifyContent:'space-between', gap:12, fontSize:'0.875rem'}}, h('span',{className:'sub-muted-dark'},l), h('span',null,v)); }

  function StepReview(props){
    const { items, isMobile, onBack, onEdit, onCommit } = props;
    const okCount = items.filter(it=>it.status==='ok').length;
    const reviewCount = items.length - okCount;
    const reviewItems = items.filter(it=>it.status==='review');
    const summary = Act.computeSummary(items);
    return h(React.Fragment,null,
      h(StepsBar,{step:4}),
      h('div',{style:{display:'flex', flexDirection:'column', gap:8}},
        h('h1',{style:H1},'Proveri šta sam pročitao'),
        h('p',{style:PMUTED},'Ništa nije sačuvano dok ne potvrdiš. Ispravi stavke koje se ne poklapaju sa tvojim dokumentima.')),
      h('div',{style:{display:'flex', gap:10, flexWrap:'wrap'}},
        h('span',{className:'uvoz-pill uvoz-pill-neutral'}, items.length+' '+U.plural(items.length,['stavka','stavke','stavki'])),
        okCount ? h('span',{className:'uvoz-pill uvoz-pill-ok'}, okCount+' pročitano bez problema') : null,
        reviewCount ? h('span',{className:'uvoz-pill uvoz-pill-review'}, reviewCount+' '+(reviewCount===1?'treba tvoju proveru':'traže tvoju proveru')) : null),
      !isMobile ? h('div',{className:'uvoz-card-like'},
        h('div',{style:{display:'grid', gridTemplateColumns:'120px 1.6fr 120px 160px 170px 120px', gap:16, padding:'0 0 12px'}},
          ['Datum','Klijent','Faktura','Iznos','U dinarima','Status'].map((l,i)=>h('span',{key:i, style:{fontSize:'0.875rem', color:'var(--text-muted)'}},l))),
        items.map(it=> h('div',Object.assign({key:it.key, className:'uvoz-table-row'+(it.status==='review'?' review':'')},
            {style:{gridTemplateColumns:'120px 1.6fr 120px 160px 170px 120px', cursor:'pointer'}}, a11yClick(()=>onEdit(it.key))),
          h('span',{className:'cell'}, it.dateIso?U.fmtDate(it.dateIso):'–'),
          h('span',{className:'cell'}, it.client||'Nepoznat pošiljalac'),
          h('span',{className:'cell sub-muted-dark'}, it.invoiceNumber||'Bez fakture'),
          h('span',{className:'cell'}, U.fmtMoney(it.amount,it.currency)),
          h('span',{className:'cell'}, it.currency==='RSD' || !it.noInvoice ? U.fmtMoney(it.amountDin,'RSD') : '–'),
          h('span',null, h('span',{className:'uvoz-pill '+(it.status==='review'?'uvoz-pill-review':'uvoz-pill-ok')}, it.status==='review'?'Proveri':'Pročitano')))),
        reviewItems.map(it=> h('div',{key:'w-'+it.key, className:'uvoz-warn-banner', style:{display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding:'14px 16px', borderRadius:8, fontSize:'0.875rem', lineHeight:1.5}},
          h('span',null, it.dateIso ? ('Stavka od '+U.fmtDate(it.dateIso)+' '+((it.issues[0]||'').charAt(0).toLowerCase()+(it.issues[0]||'').slice(1))) : (it.issues[0]||'')),
          h('span',Object.assign({className:'uvoz-link', style:{color:'inherit'}}, a11yClick(()=>onEdit(it.key))),'Uredi stavku')))) :
        h('div',{style:{display:'flex', flexDirection:'column', gap:12}}, items.map(it=>
          h('div',Object.assign({key:it.key, className:'uvoz-mobile-card'+(it.status==='review'?' review':'')}, a11yClick(()=>onEdit(it.key))),
            h('div',{className:'row1'}, h('span',{style:{fontSize:'1rem'}}, it.client||'Nepoznat pošiljalac'),
              h('span',{className:'uvoz-pill '+(it.status==='review'?'uvoz-pill-review':'uvoz-pill-ok')}, it.status==='review'?'Proveri':'Pročitano')),
            h('div',{className:'row2 sub-muted-dark'}, h('span',null, (it.dateIso?U.fmtDate(it.dateIso):'–')+' · '+(it.invoiceNumber||'Bez fakture'))),
            h('div',{className:'row3'}, h('span',null, U.fmtMoney(it.amount,it.currency)), h('span',null, it.noInvoice?'–':U.fmtMoney(it.amountDin,'RSD')))))),
      h('div',{className:'uvoz-card-like'},
        h('span',{style:{fontSize:'1rem'}},'Šta će se promeniti'),
        !isMobile ? h('div',{className:'uvoz-summary-strip'},
          summarySeg('Prihod u 12 meseci', U.fmtMoney(summary.total12m,'RSD'), U.fmtNum(summary.pct,1)+'% od limita'),
          summarySeg('Do limita ostaje', U.fmtMoney(summary.remaining,'RSD'), 'od 6.000.000 din'),
          summarySeg('Sledeći broj fakture', summary.nextInvoiceNumber, 'nastavlja numeraciju'),
          summarySeg('Izvor u knjizi prihoda', 'Uvoz', 'oznaka na svakoj stavci')) :
          h(React.Fragment,null,
            summaryRow('Prihod u 12 meseci', U.fmtMoney(summary.total12m,'RSD')),
            h('div',{style:{height:6, borderRadius:9999, background:'var(--surface-2)', overflow:'hidden'}}, h('div',{style:{width:Math.min(100,summary.pct)+'%', height:'100%', background:'var(--suma)'}})),
            summaryRow('Limit od 6.000.000 din', U.fmtNum(summary.pct,1)+'%'),
            summaryRow('Do limita ostaje', U.fmtMoney(summary.remaining,'RSD')),
            h('div',{style:{borderTop:'1px solid var(--border)'}}),
            summaryRow('Sledeći broj fakture', summary.nextInvoiceNumber),
            summaryRow('Izvor u knjizi prihoda','Uvoz'))),
      h(Footer,null,
        h(Button,{key:'n', variant:'secondary', onClick:onBack},'Nazad'),
        h(Button,{key:'c', disabled:!items.length, onClick:onCommit},'Potvrdi i sačuvaj')));
  }

  // ===================== Uredi/ukloni jednu stavku (Uv4 "Uredi stavku") =====================
  function EditItemModal(props){
    const { item, onClose, onSave, onRemove } = props;
    const [date,setDate] = useState(item.dateIso ? item.dateIso.slice(0,10) : '');
    const [client,setClient] = useState(item.client||'');
    const [invoiceNumber,setInvoiceNumber] = useState(item.invoiceNumber||'');
    const [noInvoice,setNoInvoice] = useState(!!item.noInvoice);
    const [currency,setCurrency] = useState(item.currency||'EUR');
    const [amount,setAmount] = useState(item.amount||0);
    function save(){
      const updated = Act.recalcItem(Object.assign({}, item, {date, client, invoiceNumber: noInvoice?'':invoiceNumber, currency, amount:Number(amount)||0, noInvoice}));
      onSave(updated);
    }
    return h(Modal,{title:'Uredi stavku', onClose, stackedFooter:true, footer:[
        h(Button,{key:'r', variant:'secondary', onClick:onRemove},'Ukloni stavku'),
        h(Button,{key:'s', onClick:save},'Sačuvaj izmene')]},
      h('div',{className:'stack'},
        h(Field,{label:'Datum uplate'}, h(Input,{type:'date', value:date, onChange:e=>setDate(e.target.value)})),
        h(Field,{label:'Klijent'}, h(Input,{value:client, placeholder:'Naziv klijenta', onChange:e=>setClient(e.target.value)})),
        h('div',{className:'row', style:{gap:10, alignItems:'center'}},
          h('input',{type:'checkbox', checked:noInvoice, onChange:e=>setNoInvoice(e.target.checked)}),
          h('span',{style:{fontSize:'0.875rem'}},'Bez fakture')),
        !noInvoice ? h(Field,{label:'Broj fakture'}, h(Input,{value:invoiceNumber, onChange:e=>setInvoiceNumber(e.target.value)})) : null,
        h('div',{className:'inv-field-row'},
          h(Field,{label:'Valuta'}, h('select',{className:'select', value:currency, onChange:e=>setCurrency(e.target.value)}, ['EUR','USD','GBP','CHF','RSD'].map(c=>h('option',{key:c,value:c},c)))),
          h(Field,{label:'Iznos u '+currency}, h(Input,{type:'number', value:amount, onChange:e=>setAmount(e.target.value)})))));
  }

  // ===================== Ručni unos (Uv5) =====================
  function ManualRowDesktop(props){
    const { r, onChange, onRemove } = props;
    const dateInput = h('input',{type:'date', className:'uvoz-manual-input', value:r.dateIso?r.dateIso.slice(0,10):'', onChange:e=>onChange({date:e.target.value})});
    const clientInput = h('input',{className:'uvoz-manual-input', value:r.client||'', placeholder:'Izaberi klijenta', onChange:e=>onChange({client:e.target.value})});
    const invoiceInput = h('input',{className:'uvoz-manual-input', value:r.invoiceNumber||'', placeholder:'Broj fakture', onChange:e=>onChange({invoiceNumber:e.target.value})});
    const currencySelect = h('select',{className:'uvoz-manual-input', value:r.currency||'EUR', onChange:e=>onChange({currency:e.target.value})}, ['EUR','USD','GBP','CHF','RSD'].map(c=>h('option',{key:c,value:c},c)));
    const amountInput = h('input',{type:'number', className:'uvoz-manual-input', value:r.amount||'', placeholder:'0,00', onChange:e=>onChange({amount:e.target.value})});
    const removeBtn = h('span',Object.assign({style:{color:'var(--text-muted)', display:'flex', justifyContent:'center', cursor:'pointer'}}, a11yClick(onRemove)), h(Icons.x,{width:18,height:18}));
    return h('div',{className:'uvoz-manual-row', style:{gridTemplateColumns:'130px 1.4fr 130px 100px 140px 36px'}},
      dateInput, clientInput, invoiceInput, currencySelect, amountInput, removeBtn);
  }

  // PhUv5: na telefonu popunjeni redovi NISU polja za uređivanje — to su kartice samo-za-čitanje
  // (ime + X za uklanjanje, "datum · faktura", iznos), tačno kao kartice u Uv4 proveri. Samo POSLEDNJI
  // red ("Nova stavka") ima prava polja, i to SAMO tri (Datum uplate, Klijent, Iznos) — frejm nema
  // poseban "Faktura" unos na telefonu, pa ručni unos sa telefona ne postavlja broj fakture. "Dodaj red"
  // na telefonu NE dodaje prazan red pored postojećeg (nema prostora) — "diplomira" trenutnu stavku u
  // karticu i otvara sledeću praznu "Nova stavka" ispod nje.
  function ManualCardMobile(props){
    const { r, onRemove } = props;
    return h('div',{className:'uvoz-card-like', style:{gap:6, padding:16}},
      h('div',{style:{display:'flex', justifyContent:'space-between'}},
        h('span',{style:{fontSize:'1rem'}}, r.client||'Nepoznat klijent'),
        h('span',Object.assign({style:{color:'var(--text-muted)', display:'flex', cursor:'pointer'}}, a11yClick(onRemove)), h(Icons.x,{width:18,height:18}))),
      h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem'}}, U.fmtDate(r.dateIso)+' · '+(r.invoiceNumber||'Bez fakture')),
      h('span',{style:{fontSize:'0.875rem'}}, U.fmtMoney(r.amount, r.currency)));
  }
  function ManualDraftMobile(props){
    const { r, onChange } = props;
    return h('div',{className:'uvoz-card-like', style:{gap:12, padding:16}},
      h('span',{style:{fontSize:'1rem', color:'var(--text-muted)'}},'Nova stavka'),
      h('div',{style:{display:'flex', flexDirection:'column', gap:6}},
        h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem'}},'Datum uplate'),
        h('div',{className:'uvoz-date-display'},
          h('span',null, r.dateIso?U.fmtDate(r.dateIso):'dd.mm.gggg.'),
          h('input',{type:'date', className:'uvoz-date-hidden-input', value:r.dateIso?r.dateIso.slice(0,10):'', onChange:e=>onChange({date:e.target.value})}))),
      h('div',{style:{display:'flex', flexDirection:'column', gap:6}},
        h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem'}},'Klijent'),
        h('input',{className:'uvoz-manual-input', style:{height:44}, value:r.client||'', placeholder:'Izaberi klijenta', onChange:e=>onChange({client:e.target.value})})),
      h('div',{style:{display:'flex', flexDirection:'column', gap:6}},
        h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem'}},'Iznos'),
        h('div',{style:{display:'flex', alignItems:'center', height:44, padding:'0 14px', boxSizing:'border-box', borderRadius:8, background:'var(--surface)', border:'1px solid var(--border-strong)'}},
          h('input',{type:'number', value:r.amount||'', placeholder:'0,00', onChange:e=>onChange({amount:e.target.value}),
            style:{flex:1, border:0, background:'none', outline:'none', fontSize:'1rem', color:'var(--text)', minWidth:0, fontFamily:'var(--font-body)'}}),
          h('select',{value:r.currency||'EUR', onChange:e=>onChange({currency:e.target.value}),
            style:{border:0, background:'none', outline:'none', fontSize:'1rem', color:'var(--text)', fontFamily:'var(--font-body)'}},
            ['EUR','USD','GBP','CHF','RSD'].map(c=>h('option',{key:c,value:c},c))))));
  }

  function StepManual(props){
    const { startDate, rows, setRows, onBack, onSave } = props;
    const isMobile = useIsMobile();
    function updateRow(key, patch){
      setRows(prev=> prev.map(r=> r.key===key ? Act.recalcItem(Object.assign({}, r, patch)) : r));
    }
    function removeRow(key){ setRows(prev=> prev.filter(r=>r.key!==key)); }
    function addRow(){ setRows(prev=> prev.concat(Act.emptyManualRow())); }
    const validRows = rows.filter(r=> r.dateIso && r.amount>0);
    const total = validRows.reduce((s,r)=>s+r.amountDin,0);
    return h(React.Fragment,null,
      h(StepsBar,{step:2}),
      h('div',{style:{display:'flex', flexDirection:'column', gap:8}},
        h('h1',{style:H1},'Unesi prihode ručno'),
        h('p',{style:PMUTED},'Dodaj prihode od '+U.fmtDate(startDate)+' jedan po jedan. Valuta i kurs se računaju sami.')),
      !isMobile ? h('div',{className:'uvoz-card-like'},
        h('div',{className:'uvoz-manual-row', style:{gridTemplateColumns:'130px 1.4fr 130px 100px 140px 36px'}},
          ['Datum uplate','Klijent','Faktura','Valuta','Iznos',''].map((l,i)=>h('span',{key:i, style:{fontSize:'0.875rem', color:'var(--text-muted)'}},l))),
        h('div',{style:{display:'flex', flexDirection:'column', gap:12}}, rows.map(r=> h(ManualRowDesktop,{key:r.key, r, onChange:(patch)=>updateRow(r.key,patch), onRemove:()=>removeRow(r.key)}))),
        h('div',{style:{borderTop:'1px solid var(--border)'}}),
        h('div',{style:{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8}},
          h('span',Object.assign({style:{display:'inline-flex', alignItems:'center', gap:8, fontSize:'0.875rem', cursor:'pointer'}}, a11yClick(addRow)),
            h(Icons.plus,{width:18,height:18}),'Dodaj red'),
          h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}}, validRows.length+' '+U.plural(validRows.length,['stavka','stavke','stavki'])+', '+U.fmtMoney(total,'RSD')))) :
        h('div',{style:{display:'flex', flexDirection:'column', gap:12}},
          rows.map((r,i)=> i<rows.length-1 ? h(ManualCardMobile,{key:r.key, r, onRemove:()=>removeRow(r.key)}) : h(ManualDraftMobile,{key:r.key, r, onChange:(patch)=>updateRow(r.key,patch)})),
          h('span',Object.assign({style:{display:'inline-flex', alignItems:'center', gap:8, fontSize:'0.875rem', cursor:'pointer'}}, a11yClick(addRow)),
            h(Icons.plus,{width:18,height:18}),'Dodaj red')),
      h(Footer,null,
        h(Button,{key:'n', variant:'secondary', onClick:onBack},'Nazad'),
        h(Button,{key:'s', disabled:!validRows.length, onClick:()=>onSave(validRows)},'Sačuvaj prihode')));
  }

  // ===================== Gotovo (Uv6) =====================
  function StepDone(props){
    const { summary, startDate, onFinish } = props;
    const [akontacije,setAkontacije] = useState('all');
    const [confirmed,setConfirmed] = useState(true);
    const TODAY = window.AIK.Seed.TODAY;
    const prevMonthLabel = U.MONTHS_SR_GEN[(TODAY.getMonth()-1+12)%12];
    return h(React.Fragment,null,
      h(StepsBar,{step:4}),
      h('div',{style:{display:'flex', flexDirection:'column', gap:16, alignItems:'flex-start'}},
        h('div',{style:{width:56, height:56, borderRadius:9999, background:'var(--limeta)', display:'flex', alignItems:'center', justifyContent:'center'}},
          h(Icons.check,{width:18,height:18,style:{color:'var(--suma)'}})),
        h('div',{style:{display:'flex', flexDirection:'column', gap:8}},
          h('h1',{style:H1},'Prihodi su preneti'),
          h('p',{style:PMUTED},'Prebacila sam '+summary.count+' '+U.plural(summary.count,['stavku','stavke','stavki'])+' u tvoju knjigu prihoda sa oznakom Uvoz.'))),
      h('div',{className:'uvoz-card-like'},
        h('div',{style:{display:'flex', gap:12, alignItems:'flex-start', fontSize:'1rem', lineHeight:1.5}},
          h('span',{style:{marginTop:2, display:'flex'}, className:'uvoz-done-ic'}, h(Icons.check,{width:18,height:18})),
          h('span',null,'Limit osvežen: '+U.fmtMoney(summary.total12m,'RSD')+', '+U.fmtNum(summary.pct,1)+'% od 6.000.000 din')),
        h('div',{style:{display:'flex', gap:12, alignItems:'flex-start', fontSize:'1rem', lineHeight:1.5}},
          h('span',{style:{marginTop:2, display:'flex'}, className:'uvoz-done-ic'}, h(Icons.check,{width:18,height:18})),
          h('span',null,'Sledeći broj fakture je '+summary.nextInvoiceNumber)),
        h('div',{style:{display:'flex', gap:12, alignItems:'flex-start', fontSize:'1rem', lineHeight:1.5}},
          h('span',{style:{marginTop:2, display:'flex'}, className:'uvoz-done-ic'}, h(Icons.check,{width:18,height:18})),
          h('span',null,'Uplate povezane sa fakturama gde je to bilo moguće'))),
      h('div',{className:'uvoz-card-like'},
        h('span',{style:{fontSize:'1rem'}},'Da li si već platio akontacije za prošle mesece?'),
        h(RadioCard,{selected:akontacije==='all', onClick:()=>setAkontacije('all'), title:'Da, sve do '+prevMonthLabel+' su plaćene', sub:'Neću ih prikazivati kao kasne.'}),
        h(RadioCard,{selected:akontacije==='some', onClick:()=>setAkontacije('some'), title:'Ne, neke nisu', sub:'Pokazaću ti koje čekaju uplatu.'})),
      h('div',{style:{display:'flex', gap:12, alignItems:'flex-start', fontSize:'0.875rem', lineHeight:1.5}, className:'sub-muted-dark'},
        h('span',Object.assign({className:'uvoz-checkbox'+(confirmed?' on':'')}, a11yClick(()=>setConfirmed(v=>!v), 'checkbox')),
          confirmed ? h(Icons.check,{width:14,height:14}) : null),
        h('span',null,'Potvrđujem da su uneti svi moji prihodi od '+U.fmtDate(startDate)+' Limit je tačan samo ako su uneti svi prihodi.')),
      h(Footer,null, h(Button,{key:'g', disabled:!confirmed, onClick:()=>onFinish(akontacije)},'Idi na knjigu prihoda')));
  }

  // ===================== Celokupan tok =====================
  function UvozFlow(){
    const isMobile = useIsMobile();
    const [phase,setPhase] = useState('izbor');
    const [method,setMethod] = useState('dokumenta');
    const [startDate,setStartDate] = useState(()=> Act.defaultStartDate());
    const [files,setFiles] = useState([]);
    const [pendingItems,setPendingItems] = useState(null);
    const [items,setItems] = useState([]);
    const [manualRows,setManualRows] = useState(null);
    const [editingKey,setEditingKey] = useState(null);
    const [summary,setSummary] = useState(null);
    const [confirmCloseOpen,setConfirmCloseOpen] = useState(false);

    function close(){ store.navigate('app/knjiga'); }
    // "Zatvori" usred toka: ako postoji nešto što bi se izgubilo (učitani fajlovi, pročitane/unete stavke),
    // traži potvrdu — posle "Gotovo" je već sve sačuvano, zatvaranje tu nema šta da pokvari.
    function hasUnsavedProgress(){
      if(phase==='done') return false;
      if(files.length || items.length) return true;
      if(manualRows && manualRows.some(r=> r.client || r.amount>0 || r.dateIso)) return true;
      return false;
    }
    function requestClose(){ if(hasUnsavedProgress()) setConfirmCloseOpen(true); else close(); }

    async function beginReading(){
      if(method==='sablon'){
        const csvEntry = files.find(f=> /\.csv$/i.test(f.name));
        if(!csvEntry){ store.toast('Učitaj CSV fajl (naš šablon) da bih mogla da ga pročitam.'); return; }
        let text = '';
        try{ text = await csvEntry.file.text(); }catch(e){ text=''; }
        const parsed = Act.parseCsvText(text);
        if(!parsed.length){ store.toast('Nisam prepoznala nijednu stavku u ovom fajlu. Proveri da li je to naš šablon.'); return; }
        setPendingItems(parsed);
      } else {
        setPendingItems(null);
      }
      setPhase('reading');
    }
    function onReadingDone(){
      setItems(pendingItems || Act.simulateRead());
      setPhase('review');
    }
    function saveItem(updated){ setItems(prev=> prev.map(it=> it.key===updated.key ? updated : it)); setEditingKey(null); }
    function removeItem(key){ setItems(prev=> prev.filter(it=>it.key!==key)); setEditingKey(null); }
    function commitReview(){
      if(!items.length){ store.toast('Dodaj bar jednu stavku pre čuvanja.'); return; }
      const sum = Act.computeSummary(items);
      const res = Act.commit(items, {docNames: files.map(f=>f.name), startDate});
      if(!res){ store.toast('Nijedna stavka nema prepoznat datum i iznos — ispravi ih pre čuvanja.'); return; }
      // res.itemsCount je STVARAN broj upisanih stavki (commit tiho izostavlja one bez datuma/iznosa —
      // vidi actions.js) — items.length bi ovde mogao da pokaže više nego što je zaista sačuvano.
      setSummary(Object.assign({}, sum, {count: res.itemsCount})); setPhase('done');
    }
    function commitManual(validRows){
      const sum = Act.computeSummary(validRows);
      const res = Act.commit(validRows, {startDate});
      if(!res){ store.toast('Nijedna stavka nema prepoznat datum i iznos — ispravi ih pre čuvanja.'); return; }
      setSummary(Object.assign({}, sum, {count: res.itemsCount})); setPhase('done');
    }
    function finish(akontacijeChoice){ Act.confirmDone(akontacijeChoice); store.navigate('app/knjiga'); }

    const editingItem = editingKey!=null ? items.find(it=>it.key===editingKey) : null;

    return h('div',{className:'uvoz-shell'},
      h(Header,{onClose:requestClose}),
      h('div',{className:'uvoz-body'},
        h('div',{className:'uvoz-container'},
          phase==='izbor' ? h(StepIzbor,{method, setMethod, startDate, setStartDate, onClose:requestClose,
              onNext:()=>{ if(method==='rucno'){ setManualRows([Act.emptyManualRow()]); setPhase('manual'); } else setPhase('upload'); }}) :
          phase==='upload' ? h(StepUpload,{startDate, method, files, setFiles, onBack:()=>setPhase('izbor'), onNext:beginReading}) :
          phase==='reading' ? h(StepReading,{fileCount:files.length||3, onDone:onReadingDone, onCancel:requestClose}) :
          phase==='review' ? h(StepReview,{items, isMobile, onBack:()=>setPhase('upload'), onEdit:setEditingKey, onCommit:commitReview}) :
          phase==='manual' ? h(StepManual,{startDate, rows:manualRows||[], setRows:setManualRows, onBack:()=>setPhase('izbor'), onSave:commitManual}) :
          phase==='done' && summary ? h(StepDone,{summary, startDate, onFinish:finish}) : null)),
      editingItem ? h(EditItemModal,{item:editingItem, onClose:()=>setEditingKey(null), onSave:saveItem, onRemove:()=>removeItem(editingItem.key)}) : null,
      confirmCloseOpen ? h(Modal,{title:'Zatvoriti prenos poslovanja?', onClose:()=>setConfirmCloseOpen(false), footer:[
          h(Button,{key:'c', variant:'secondary', onClick:()=>setConfirmCloseOpen(false)},'Nastavi uvoz'),
          h(Button,{key:'d', onClick:close},'Zatvori, odbaci')]},
        h('p',{style:{margin:0}},'Ništa još nije sačuvano. Ako zatvoriš, gubiš učitane fajlove i pročitane/unete stavke.')) : null);
  }

  window.AIK = window.AIK || {};
  window.AIK.Screens = window.AIK.Screens || {};
  window.AIK.Screens.uvoz = UvozFlow;
})();
