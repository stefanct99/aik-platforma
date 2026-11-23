// Faza 6: Porez i rokovi (6.2, 6.3, 7.8, 7.8a, 8.7). Rešenje Poreske uprave, mesečne uplate, QR, trajni nalozi.
(function(){
  const h = React.createElement;
  const { useState } = React;
  const { useStore, t, Components, useIsMobile } = window.AIK;
  const { Button, Field, Input, Modal } = Components;
  const Icons = window.AIK.Icons;
  const store = window.AIK.store;
  const Sel = window.AIK.Selectors;
  const U = window.AIK.Util;
  const TODAY = window.AIK.Seed.TODAY;

  function DateTile(props){
    const { date, due } = props;
    return h('span',{className:'poc-date-tile'+(due?' due':'')}, h('span',{className:'mon'}, U.MONTHS_SR[date.getMonth()].slice(0,3).toUpperCase()), h('span',{className:'day'}, date.getDate()));
  }

  // NBS IPS QR sadržaj (8.7): polja K/V/C/R/N/I/SF/S/RO po NBS IPS standardu, sa stvarnim
  // vrednostima stavke (račun, iznos, poziv na broj). SF:253 je uobičajena šifra plaćanja za
  // porez/doprinose u praksi — spec sam kaže da ovo treba proveriti kod NBS, pa je ovde najbolji
  // razuman izbor, ne zvanično potvrđena vrednost. Ovaj STRING je tačan po NBS IPS strukturi;
  // slika ispod (QrCode) ostaje dekorativan uzorak, ne pravi skenibilan QR kod (vidi napomenu dole).
  function ipsQrPayload(it, business){
    const accDigits = (it.account||'').replace(/[^0-9]/g,'');
    const amt = Number(it.amount).toLocaleString('sr-RS',{minimumFractionDigits:2,maximumFractionDigits:2});
    const ro = (it.pozivNaBroj||'').replace(/\s/g,'');
    const name = ((business.ownerName||'')+' '+(business.name||'')).trim();
    return `K:PR|V:01|C:1|R:${accDigits}|N:${name}|I:RSD${amt}|SF:253|S:${it.name}|RO:${ro}`;
  }

  // Jednostavan "izgleda-kao-QR" obrazac — nije stvaran QR kod (prototip), deterministički po sadržaju
  // da izgleda stabilno i različito po stavci (frejm: Pay1/Pay2 crno-beli kvadratni uzorak).
  function fakeQrHash(str){
    let hArr = []; let seed = 0;
    for(let i=0;i<str.length;i++) seed = (seed*31 + str.charCodeAt(i)) >>> 0;
    for(let i=0;i<25*25;i++){ seed = (seed*1103515245 + 12345) >>> 0; hArr.push((seed>>>16)%100<46); }
    return hArr;
  }
  function isFinderCell(x, y, n){
    const corners = [[0,0],[n-7,0],[0,n-7]];
    for(const [cx,cy] of corners){
      const lx = x-cx, ly = y-cy;
      if(lx>=0 && lx<7 && ly>=0 && ly<7){
        const onRing = lx===0||lx===6||ly===0||ly===6;
        const onCore = lx>=2 && lx<=4 && ly>=2 && ly<=4;
        return onRing || onCore;
      }
    }
    return false;
  }
  function QrCode(props){
    const { value, size } = props;
    const n = 25, cell = (size||120)/n;
    const bits = fakeQrHash(value);
    const cells = [];
    for(let y=0;y<n;y++){
      for(let x=0;x<n;x++){
        const on = isFinderCell(x,y,n) || bits[y*n+x];
        if(on) cells.push(h('rect',{key:x+'-'+y, x:x*cell, y:y*cell, width:cell, height:cell}));
      }
    }
    // QR je uvek crn-na-belom, bez obzira na temu aplikacije — kao pravi kod, mora da ostane skenibilan (Pay1/Pay2).
    return h('svg',{viewBox:'0 0 '+size+' '+size, width:size, height:size, shapeRendering:'crispEdges', style:{flexShrink:0, background:'#fff', boxShadow:'0 0 0 8px #fff', borderRadius:2}, fill:'#161A17'}, cells);
  }

  function ResenjeFileRow(props){
    return h('div',{className:'por-file-row'},
      h('span',{className:'ic'}, h(Icons.fileText,{width:22,height:22})),
      h('div',null, h('span',null, props.name), h('span',{className:'faint'}, props.sub)));
  }

  function MesecneObavezeCard(props){
    const { s } = props;
    const total = Sel.taxMonthlyTotal(s);
    return h('div',{className:'poc-card'},
      h('div',{className:'poc-card-head'}, h('span',{className:'t'},'Mesečne obaveze'), h('span',{className:'por-year-pill'},'Iz rešenja za '+s.taxDecision.year+'.')),
      h('div',null, s.taxDecision.items.map(it=> h('div',{key:it.key, className:'por-obligation-row'}, h('span',{title:it.name}, it.name), h('span',null, U.fmtMoney(it.amount,'RSD'))))),
      h('div',{className:'por-total-card'}, h('span',null,'Ukupno mesečno'), h('span',{className:'v'}, U.fmtMoney(total,'RSD'))));
  }

  function RokoviCard(props){
    const { s } = props;
    const months = Sel.upcomingTaxMonths(s, 3);
    const total = Sel.taxMonthlyTotal(s);
    return h('div',{className:'poc-card'},
      h('div',{className:'poc-card-head'}, h('span',{className:'t'},'Rokovi'), h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/kalendar');}},'Kalendar')),
      h('div',null, months.map(key=>{
        const due = Sel.taxDueDate(key);
        return h('div',{key, className:'poc-deadline-row'}, h(DateTile,{date:due}), h('div',{className:'mid'}, h('span',{style:{fontSize:'1rem'}}, 'Akontacija za '+Sel.taxServiceMonthName(key)), h('span',{className:'faint', style:{fontSize:'0.875rem'}}, U.fmtMoney(total,'RSD'))));
      })));
  }

  // PorH/PhPorH: link "Trajni nalozi" u zaglavlju postoji SAMO na desktopu (frejm na telefonu ga nema
  // uopšte — isti obrazac kao skidanje sekundarnih linkova na mobilnom kao i drugde u ovoj fazi).
  function SledecaUplataCard(props){
    const { s, isMobile } = props;
    const months = Sel.upcomingTaxMonths(s, 1);
    const key = months[0];
    const due = Sel.taxDueDate(key);
    const auto = s.taxPaymentMode==='trajni_nalog';
    const total = Sel.taxMonthlyTotal(s);
    const serviceMonth = Sel.taxServiceMonthName(key);
    const reasonLate = due.getDate()!==15 ? `Rok je ${due.getDate()}. ${U.MONTHS_SR[due.getMonth()]}, jer 15. pada u ${U.DAYS_SR_ACC[new Date(due.getFullYear(),due.getMonth(),15).getDay()]}.` : null;
    return h('div',{className:'poc-card'},
      h('div',{className:'poc-card-head'}, h('span',{className:'t'},'Sledeća uplata'),
        isMobile ? null : h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/porez/trajni-nalozi');}},'Trajni nalozi')),
      h('div',{className:(auto?'poc-deadline-row auto':'poc-deadline-row due')},
        h(DateTile,{date:due, due:true}),
        h('div',{className:'mid'}, h('span',{style:{fontSize:'1.25rem'}}, 'Akontacija za '+serviceMonth),
          h('span',{style:{display:'flex', alignItems:'center', flexWrap:'wrap', gap:8, fontSize:'1rem', color:'var(--sidebar-text)'}}, h('span',{style:{whiteSpace:'nowrap'}}, U.fmtMoney(total,'RSD')),
            auto ? h('span',{className:'poc-auto-pill'}, h(Icons.check,{width:12,height:12}),'Automatski iz banke') : h('span',{className:'poc-deadline-pill'},'Treba platiti'))),
        auto ? null : h(Button,{onClick:()=>store.navigate('app/porez/plati/'+key)},'Plati')),
      reasonLate ? h('span',{className:'faint', style:{fontSize:'0.875rem'}}, reasonLate) : null);
  }

  function ResenjeCard(props){
    const { s, isMobile } = props;
    const td = s.taxDecision;
    return h('div',{className:'poc-card'},
      h('div',{className:'poc-card-head'}, h('span',{className:'t'},'Rešenje')),
      h(ResenjeFileRow,{name:td.fileName, sub:'Dodato '+U.fmtLongGen(td.addedAt)+'.'}),
      h('span',{className:'faint', style:{fontSize:'0.875rem'}},'Iznosi važe do novog rešenja, koje stiže u januaru.'),
      h('div',{className:'row', style:{gap:10, flexWrap:'wrap'}},
        h(Button,{variant:'secondary', onClick:()=>store.toast('Pregled PDF-a (simulirano u prototipu).')},'Pogledaj'),
        h(Button,{variant:'ghost', onClick:()=>store.navigate('app/porez/novo-resenje')}, isMobile?'Dodaj novo':'Dodaj novo rešenje')));
  }

  // Pay3/PhPay3, Trajni nalog u banci: tekst se razlikuje po širini (kraće etikete na telefonu),
  // i dodat je link "Pitaj AI (knjigovođu) za svoju banku" + napomena o važenju do januara, koji su
  // ranije potpuno nedostajali, a CTA je bio pogrešan ("Uključi trajni nalog" umesto potvrde iz frejma).
  // Pay3/PhPay3 (raw HTML): banner "Podesi jednom..." je ODVOJEN (sopstvena istaknuta traka, van kartica).
  // Dve kartice su JEDNA DO DRUGE na desktopu (flex 1.3/1, "Kako se podešava" desno), svaki stav rešenja
  // ima TRI reda (naziv+iznos, pa Račun/Poziv na broj SVAKI sa sopstvenim dugmetom kopiraj) ne jednu
  // sažetu liniju — i dugmad "Pitaj AI.../Podesio sam..." su na KRAJU desne kartice, ne leve.
  function copyField(label, value){
    return h('div',{className:'por-oblig-field'},
      h('span',{className:'faint'}, label),
      h('span',{className:'v'}, value,
        h('button',{type:'button', className:'por-oblig-copy', onClick:()=>{ try{ navigator.clipboard.writeText(value); }catch(e){} store.toast('Podaci su kopirani.'); }}, h(Icons.copy,{width:16,height:16}))));
  }
  function TrajniNaloziTab(props){
    const { s, isMobile } = props;
    const enabled = s.taxPaymentMode==='trajni_nalog';
    const steps = isMobile
      ? [['1','Otvori aplikaciju banke','Nađi odeljak za trajne naloge.'],
         ['2','Napravi novi trajni nalog','Mesečno, na izabrani dan u mesecu.'],
         ['3','Prepiši podatke odozgo','Primalac, račun, iznos i poziv na broj. Ponovi za sva četiri.']]
      : [['1','Otvori aplikaciju svoje banke','Nađi odeljak za plaćanja ili trajne naloge.'],
         ['2','Napravi novi trajni nalog','Izaberi nalog za prenos, učestalost mesečno i dan u mesecu.'],
         ['3','Prepiši podatke sa leve strane','Primalac, račun, iznos i poziv na broj. Ponovi za sva četiri.']];
    const podesiButtons = h('div',{style:{marginTop:12, display:'flex', flexDirection:'column', gap:10, alignItems:'stretch'}},
      h(Button,{variant:'secondary', icon:Icons.sparkle, onClick:()=>store.toast('Pitanje je poslato AI knjigovođi.')}, isMobile?'Pitaj AI za svoju banku':'Pitaj AI knjigovođu za svoju banku'),
      h(Button,{onClick:()=>{ window.AIK.Actions.Porez.setPaymentMode('trajni_nalog'); store.toast('Trajni nalog je uključen. "Plati" sada piše "Automatski iz banke".'); }}, enabled?'Podešeno':'Podesio sam trajne naloge'),
      h('span',{className:'faint', style:{fontSize:'0.875rem'}},'Iznosi važe do sledećeg rešenja, u januaru. Tada te podsetim da ih ažuriraš.'));
    return h('div',{className:'stack', style:{gap:20}},
      h('div',{className:'por-highlight-card'}, h('span',{style:{display:'flex', color:'var(--suma)'}}, h(Icons.check,{width:20,height:20})),
        h('span',{style:{fontSize:'1rem'}},'Podesi jednom, do sledećeg rešenja ne moraš da brineš o uplatama.')),
      h('div',{className:'row', style:{gap:20, alignItems:'flex-start', flexWrap:'wrap'}},
        h('div',{className:'poc-card', style:{flex:'1.3 1 320px'}},
          h('div',{className:(isMobile?'stack':'poc-card-head'), style:isMobile?{gap:6}:null},
            h('span',{style:{fontSize:'1.25rem'}}, isMobile?'Podaci za četiri naloga':'Podaci za četiri trajna naloga'),
            h('span',{className:'poc-month-pill', style:isMobile?{alignSelf:'flex-start'}:null},'Mesečno, 10. u mesecu')),
          h('div',null, s.taxDecision.items.map(it=> h('div',{key:it.key, className:'por-oblig-block'},
            h('div',{className:'por-obligation-row', style:{borderTop:'none', padding:'0 0 8px'}}, h('span',null, it.name), h('span',null, U.fmtMoney(it.amount,'RSD'))),
            copyField(isMobile?'Račun':'Račun primaoca', it.account),
            copyField('Poziv na broj', it.pozivNaBroj))))),
        h('div',{className:'poc-card', style:{flex:'1 1 260px'}},
          h('span',{style:{fontSize:'1.25rem'}},'Kako se podešava'),
          h('div',{className:'stack', style:{gap:12, marginTop:8}},
            steps.map(([n,t1,t2])=>
              h('div',{key:n, className:'row', style:{gap:12, alignItems:'flex-start'}}, h('span',{className:'por-change-badge'}, n), h('div',null, h('div',null,t1), h('div',{className:'faint', style:{fontSize:'0.875rem'}}, t2))))),
          podesiButtons)));
  }

  function PorHScreen(){
    const s = useStore();
    const isMobile = useIsMobile();
    const subtitle = isMobile ? 'Rešenje, mesečne uplate i rokovi na jednom mestu.' : 'Rešenje Poreske uprave, mesečne uplate i rokovi na jednom mestu.';
    if(!s.taxDecision){
      return h('div',{className:'stack', style:{gap:20}},
        h('div',{className:'page-head'}, h('h1',null,'Porez i rokovi'), h('p',null,subtitle)),
        h('div',{className:'poc-card'},
          h('div',{style:{display:'flex', gap:16, alignItems:'flex-start'}},
            h('span',{className:'poc-norez-icon'}, h(Icons.fileText,{width:24,height:24})),
            h('div',{style:{display:'flex', flexDirection:'column', gap:6}},
              h('span',{style:{fontSize:'1.25rem'}},'Dodaj rešenje Poreske uprave'),
              h('span',{className:'faint'},'Bez rešenja ne mogu da računam iznose ni rokove.'))),
          h(Button,{icon:Icons.upload, onClick:()=>store.navigate('app/porez/dodaj-resenje')},'Dodaj rešenje')));
    }
    // Telefon: sve 4 kartice u koloni, redosled Sledeća uplata/Mesečne obaveze/Rešenje/Rokovi (PhPorH).
    // Desktop: dva reda po dve kartice, Sledeća-uplata+Rešenje pa Mesečne-obaveze+Rokovi (PorH).
    if(isMobile) return h('div',{className:'stack', style:{gap:20}},
      h('div',{className:'page-head'}, h('h1',null,'Porez i rokovi'), h('p',null,subtitle)),
      h(SledecaUplataCard,{s, isMobile}), h(MesecneObavezeCard,{s}), h(ResenjeCard,{s, isMobile}), h(RokoviCard,{s}));
    return h('div',{className:'stack', style:{gap:20}},
      h('div',{className:'page-head'}, h('h1',null,'Porez i rokovi'), h('p',null,subtitle)),
      // PorH (raw HTML): oba reda `flex:N 1 0; min-width:0` — Sledeća uplata:Rešenje = 3:2 (bilo obrnuto, 1:2).
      h('div',{className:'row', style:{gap:24, alignItems:'stretch', flexWrap:'wrap'}},
        h('div',{style:{flex:3, minWidth:0}}, h(SledecaUplataCard,{s})),
        h('div',{style:{flex:2, minWidth:0}}, h(ResenjeCard,{s}))),
      h('div',{className:'row', style:{gap:24, alignItems:'stretch', flexWrap:'wrap'}},
        h('div',{style:{flex:3, minWidth:0}}, h(MesecneObavezeCard,{s})),
        h('div',{style:{flex:2, minWidth:0}}, h(RokoviCard,{s}))));
  }

  function TrajniNaloziScreen(){
    const s = useStore();
    const isMobile = useIsMobile();
    return h('div',{className:'stack', style:{gap:20}},
      h('div',{className:'faint', style:{fontSize:'0.875rem', display:'flex', gap:6}},
        h('a',{href:'#', style:{color:'inherit'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/porez');}},'Porez i rokovi'), h('span',null,'/'), h('span',{style:{color:'var(--text)'}},'Trajni nalozi')),
      h('div',{className:'page-head'}, h('h1',null,'Trajni nalog u banci')),
      h(TrajniNaloziTab,{s, isMobile}));
  }

  const RESENJE_FIELDS = [
    ['porez','Porez na prihod od samostalne delatnosti','Porez na prihod','Mesečni iznos poreza'],
    ['pio','PIO za radni staž','PIO za radni staž','Mesečni iznos doprinosa za PIO'],
    ['zdravstveno','Zdravstveno osiguranje','Zdravstveno osiguranje','Mesečni iznos doprinosa za zdravstvo'],
    ['nezaposlenost','Osiguranje za slučaj nezaposlenosti','Nezaposlenost','Mesečni iznos doprinosa za nezaposlenost'],
  ];
  // Prototip nema stvaran OCR — "Izaberi fajl"/drop uvek pročita poznate iznose (6.2.4); poseban link
  // simulira slučaj kad PIB na rešenju ne odgovara firmi (6.2.5, Rez5), jer nema pravog fajla za to.
  const DEFAULT_ITEMS = RESENJE_FIELDS.map(([key,name])=>({key, name, amount:0, account:'', pozivNaBroj:''}));
  function seedAmounts(items){
    const byKey = {porez:4950.00, pio:12311.28, zdravstveno:5283.59, nezaposlenost:384.73};
    const accounts = {porez:['840-711122843-47','97 11-2026-0481'], pio:['840-721211843-26','97 12-2026-0481'], zdravstveno:['840-721311843-19','97 13-2026-0481'], nezaposlenost:['840-721411843-12','97 14-2026-0481']};
    return items.map(it=> Object.assign({}, it, {amount: byKey[it.key], account: accounts[it.key][0], pozivNaBroj: accounts[it.key][1]}));
  }

  function Breadcrumb(props){
    return h('div',{className:'faint', style:{fontSize:'0.875rem', display:'flex', gap:6}},
      h('a',{href:'#', style:{color:'inherit'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/porez');}},'Porez i rokovi'), h('span',null,'/'), h('span',{style:{color:'var(--text)'}}, props.label));
  }

  function HelpSideCard(props){
    const s = props.s;
    const addr = (s.business.inboundSlug||'stefan-4k7q')+'@prijem.tvojaiknjigovodja.rs';
    return h('div',{className:'poc-card', style:{flex:1, gap:16}},
      h('span',{style:{fontSize:'1.25rem'}},'Ili prosledi mejlom'),
      h('span',{className:'faint'},'Prosledi mejl sa rešenjem u prilogu na svoju adresu za prijem, a ja ga pročitam.'),
      h('div',{className:'por-mail-box'}, h('span',{className:'addr'}, addr),
        h('button',{className:'por-copy-chip', onClick:()=>store.toast('Adresa je kopirana.')}, h(Icons.card,{width:16,height:16}),'Kopiraj adresu')),
      h('div',{style:{height:1, background:'var(--border)'}}),
      h('span',{style:{fontSize:'1rem'}},'Nemaš rešenje pri ruci?'),
      h('div',{className:'stack', style:{gap:10}},
        h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); store.toast('Rešenje se preuzima sa portala ePorezi, iz sandučeta.');}},'Kako do rešenja'),
        h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); props.onManual();}},'Unesi iznose ručno')));
  }

  // Tekst zone kaže "do 20 MB" — STANJE_PROTOTIPA.md je nalazio da kod to nije proveravao (dugme je samo
  // odmah pokretalo simulirano čitanje, bez ikakvog pravog izbora fajla). Dugme je sad pravi <input
  // type=file> (isti stil kao .btn-primary, samo preko <label>), sa istom granicom/porukom kao Uvoz.
  const RESENJE_MAX_BYTES = 20*1024*1024;
  function UploadStep(props){
    function handleFile(e){
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if(!file) return;
      if(file.size > RESENJE_MAX_BYTES){ store.toast('"'+file.name+'" je preko 20 MB, nije učitano.'); return; }
      props.onUpload(false, file.name);
    }
    return h('div',{className:'row', style:{gap:24, alignItems:'stretch', flexWrap:'wrap'}},
      h('div',{className:'por-upload-zone'},
        h('span',{className:'por-upload-icon'}, h(Icons.upload,{width:26,height:26})),
        h('span',{style:{fontSize:'1.25rem'}},'Prevuci rešenje ovde'),
        h('span',{className:'faint'},'PDF ili slika (do 20 MB)'),
        h('label',{className:'btn btn-primary', style:{cursor:'pointer'}}, 'Izaberi fajl sa računara',
          h('input',{type:'file', accept:'.pdf,.jpg,.jpeg,.png', style:{display:'none'}, onChange:handleFile})),
        h('a',{href:'#', style:{fontSize:'0.75rem', marginTop:8}, onClick:(e)=>{e.preventDefault(); props.onUpload(true);}},'(test) simuliraj pogrešan PIB')),
      h(HelpSideCard,{s:props.s, onManual:props.onManual}));
  }

  function ReadingStep(props){
    return h('div',{className:'row', style:{gap:24, alignItems:'stretch', flexWrap:'wrap'}},
      h('div',{className:'poc-card', style:{flex:'1.4 1 320px'}},
        h(ResenjeFileRow,{name:props.fileName, sub:'412 KB'}),
        h('span',{style:{fontSize:'1.25rem', marginTop:8}},'AI knjigovođa čita rešenje...'),
        h('div',{className:'stack', style:{gap:12}},
          [['Čitam iznose poreza i doprinosa'],['Proveravam PIB i naziv firme'],['Upoređujem doprinose sa stopama']].map(([label],i)=>
            h('div',{key:i, className:'row', style:{gap:10, alignItems:'center'}}, h(Components.Skeleton,{style:{width:18, height:18, borderRadius:9999}}), h('span',null,label))))),
      h(HelpSideCard,{s:props.s, onManual:()=>{}}));
  }

  // Rez4c/PhRez4c levi panel: tačan redosled redova "lažnog dokumenta" iz frejma — statične trake
  // teksta (ne loading-skeleton) isprepletane sa 4 markirane oznake, tačno na ovim pozicijama
  // (napomena: redovi 2 i 3 su JEDAN do drugog, bez trake između — tako frejm doslovno izgleda).
  const DOC_MOCK_ROWS = [
    {bar:45, title:true}, {bar:90}, {bar:78}, {bar:84}, {spacer:true},
    {hi:0}, {bar:70}, {bar:88}, {hi:1}, {hi:2}, {bar:82}, {bar:60}, {hi:3},
    {spacer:true}, {bar:90}, {bar:76}, {bar:55},
  ];
  function DocMock(props){
    const { items } = props;
    return h('div',{className:'por-doc-mat', style:{flex:'1 1 320px'}},
      h('div',{className:'por-doc-mat-label'}, h(Icons.fileText,{width:18,height:18}), props.fileName),
      h('div',{className:'por-doc-paper'},
        DOC_MOCK_ROWS.map((r,i)=>{
          if(r.spacer) return h('div',{key:i, className:'por-doc-spacer'});
          if(r.hi!=null){ const it = items[r.hi];
            return h('div',{key:i, className:'por-doc-highlight'},
              h('span',{className:'por-doc-badge'}, r.hi+1),
              h('span',{className:'label'}, RESENJE_FIELDS[r.hi][2]),
              h('span',{className:'amt'}, it.amount.toLocaleString('sr-RS',{minimumFractionDigits:2,maximumFractionDigits:2})));
          }
          return h('span',{key:i, className:'por-doc-bar'+(r.title?' title':''), style:{width:r.bar+'%'}});
        })));
  }
  function VerifyStep(props){
    const { items, s, isMobile } = props;
    const total = items.reduce((sum,i)=>sum+i.amount,0);
    return h('div',{className:'row', style:{gap:24, alignItems:'stretch', flexWrap:'wrap'}},
      h(DocMock,{items, fileName:props.fileName}),
      h('div',{className:'poc-card', style:{flex:'1.15 1 320px'}},
        h('div',{className:'poc-card-head'}, h('span',{className:'t'},'Šta sam pročitao'), !isMobile ? h('span',{className:'poc-auto-pill'}, h(Icons.check,{width:12,height:12}),'Sve provere prošle') : null),
        h('div',null, items.map((it,i)=> h('div',{key:it.key, className:'por-doc-row'},
          h('span',{className:'por-doc-badge', style:{width:28, height:28, fontSize:'0.875rem'}}, i+1),
          h('div',{style:{flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:2}}, h('span',null, it.name), h('span',{className:'faint', style:{fontSize: 'var(--fs-12-14)'}}, isMobile ? it.account : it.account+' · '+it.pozivNaBroj)),
          h('span',null, U.fmtMoney(it.amount,'RSD')),
          h('button',{className:'icon-btn', style:{width:28,height:28}, onClick:()=>props.onManual(items)}, h(Icons.edit||Icons.settings,{width:14,height:14}))))),
        h('div',{className:'por-total-card'}, h('span',null,'Ukupno mesečno'), h('span',{className:'v'}, U.fmtMoney(total,'RSD'))),
        h('div',{className:'row', style:{gap:12}},
          h(Button,{onClick:()=>props.onSave(items)},'Sve je tačno, sačuvaj'),
          h(Button,{variant:'secondary', onClick:()=>props.onManual(items)},'Ispravi iznose'))));
  }

  // Rez5/PhRez5: crvenkasta kartica upozorenja, ne obična .poc-card — na telefonu nema desne "Ili
  // prosledi mejlom" kartice niti "Nemaš rešenje pri ruci?" linkova, samo glavna kartica.
  function PibErrorStep(props){
    const { s, isMobile } = props;
    const sub = isMobile
      ? 'PIB na rešenju se ne poklapa sa PIB-om tvoje firme. Zbog toga ga nisam upisao.'
      : 'PIB na rešenju se ne poklapa sa PIB-om firme koju si uneo. Zbog toga ga nisam upisao.';
    const buttons = isMobile
      ? h('div',{style:{display:'flex', flexDirection:'column', gap:12}},
          h(Button,{icon:Icons.uploadArrow, style:{width:'100%', height:48, fontSize:'1rem'}, onClick:props.onRetry},'Učitaj drugo rešenje'),
          h(Button,{variant:'secondary', style:{width:'100%', height:48, fontSize:'1rem'}, onClick:()=>store.navigate('app/podesavanja')},'Proveri podatke firme'))
      : h('div',{style:{display:'flex', gap:12}},
          h(Button,{icon:Icons.uploadArrow, onClick:props.onRetry},'Učitaj drugo rešenje'),
          h(Button,{variant:'secondary', onClick:()=>store.navigate('app/podesavanja')},'Proveri podatke firme'));
    const mainCard = h('div',{className:'por-pib-err-card'},
      h('div',{className:'por-pib-err-head'},
        h(Icons.triangleAlert,{width:isMobile?24:28, height:isMobile?24:28}),
        h('span',{style:{fontSize:'var(--fs-20-24)', letterSpacing:'-0.01em'}},'Ovo rešenje nije za tvoju firmu')),
      h('span',{className:'por-pib-err-sub'}, sub),
      h('div',{className:'por-pib-box'},
        h('div',{className:'r'}, h('span',{className:'lbl'},'PIB na rešenju'), h('span',{className:'err', style:{fontSize:'1rem'}},'987654321')),
        h('div',{className:'r'}, h('span',{className:'lbl'},'PIB tvoje firme'), h('span',{style:{fontSize:'1rem'}}, s.business.pib))),
      buttons);
    if(isMobile) return mainCard;
    return h('div',{className:'row', style:{gap:24, alignItems:'stretch', flexWrap:'wrap'}},
      h('div',{style:{flex:'1.4 1 320px'}}, mainCard),
      h(HelpSideCard,{s, onManual:props.onManual}));
  }

  function ManualStep(props){
    const isMobile = props.isMobile;
    const [vals,setVals] = useState(()=> { const m={}; props.initial.forEach(it=>{ m[it.key]=it.amount||''; }); return m; });
    const total = RESENJE_FIELDS.reduce((sum,[key])=> sum+(Number(vals[key])||0), 0);
    function submit(){
      // 6.2.6: "Račun primaoca i poziv na broj korisnik ne unosi, sistem ih generiše" — koristi iste
      // vrednosti kao i kod čitanja rešenja (seedAmounts), nikad prazne stringove.
      const withAccounts = seedAmounts(RESENJE_FIELDS.map(([key,name])=>({key, name, amount:0})));
      const items = RESENJE_FIELDS.map(([key,name],i)=> Object.assign({}, withAccounts[i], {amount:Number(vals[key])||0}));
      props.onSave(items);
    }
    // Rez6b/PhRez6b (raw HTML): svako polje ima SVOJU ikonicu (porez=coin, PIO=clock, zdravstveno=heart,
    // nezaposlenost=briefcase) — ne uvek coin, i ikonica postoji i na telefonu (36px/18px, ne skrivena).
    // Numerisani krug u "Šta se dešava" je `.por-change-badge` (28px, #EEF8D2/0F2A22), ne `.icon-circ-36`
    // (36px, amber — pogrešna boja/veličina pozajmljena iz drugog konteksta).
    const FIELD_ICONS = {porez:Icons.coin, pio:Icons.clock, zdravstveno:Icons.heart, nezaposlenost:Icons.briefcase};
    // PhRez6b: telefon je POTPUNO drugi raspored za svako polje — kolona (red ikona+naziv, PA kutija
    // iznosa preko cele širine ispod), BEZ podnaslova (hint) — ne red ikona+naziv+kutija kao na desktopu.
    const formCard = h('div',{className:'poc-card'},
      h('span',{style:{fontSize:'1.25rem'}},'Mesečni iznosi iz rešenja'),
      h('div',null, RESENJE_FIELDS.map(([key,name,short,hint])=>{
        const icon = h('span',{className:'por-amt-ic', style:isMobile?{width:36,height:36,borderRadius:10}:null}, h(FIELD_ICONS[key],{width:isMobile?18:22,height:isMobile?18:22}));
        const box = h('div',{className:'por-amt-box', style:isMobile?{width:'100%'}:null}, h('input',{type:'number', value:vals[key], onChange:e=>setVals(v=>Object.assign({},v,{[key]:e.target.value}))}), h('span',{className:'faint', style:{fontSize:'0.875rem'}},'din'));
        if(isMobile) return h('div',{key, style:{display:'flex', flexDirection:'column', gap:8, padding:'14px 0', borderTop:'1px solid var(--border)'}},
          h('div',{style:{display:'flex', alignItems:'center', gap:12}}, icon, h('span',{style:{fontSize:'1rem'}},name)), box);
        return h('div',{key, className:'por-amt-row'}, icon,
          h('div',{style:{flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:2}}, h('span',{style:{fontSize:'1rem'}},name), h('span',{className:'faint', style:{fontSize:'0.875rem'}}, hint)),
          box);
      })));
    const totalCard = h('div',{className:'por-total-card', style:{flexDirection:'column', alignItems:'flex-start', gap:14}},
      h('span',null,'Ukupno mesečno'),
      h('span',{style:{fontSize: 'var(--fs-32-48)', letterSpacing:'-0.03em', lineHeight:1}}, U.fmtMoney(total,'RSD')),
      h('span',{className:'poc-deadline-pill'}, h(Icons.triangleAlert,{width:14,height:14}),'Nepotvrđeno'));
    const whatHappensCard = h('div',{className:'poc-card'},
      h('span',{style:{fontSize:'1.25rem'}},'Šta se dešava kad sačuvaš'),
      h('div',{className:'stack', style:{gap:14, marginTop:6}},
        [['1','Pamtim iznose','Čuvam ih kao tvoj mesečni obračun, označene kao nepotvrđene.'],
         ['2','Pripremam četiri uplate','Za svaku sastavim nalog sa računom primaoca i pozivom na broj. Njih ne unosiš ti.'],
         ['3','Podsećam te na rok', isMobile ? 'Uplate se pojavljuju na početnoj i u kalendaru, a pre roka dobiješ podsetnik.' : 'Uplate se pojavljuju na početnoj i u kalendaru, a pre roka dobiješ podsetnik. Plaćaš QR kodom ili trajnim nalogom.'],
         ['4','Proveravam sa rešenjem','Čim dodaš rešenje, uporedim iznose i javim ako se ne poklapaju.']].map(([n,t1,t2])=>
          h('div',{key:n, className:'row', style:{gap:12, alignItems:'flex-start'}}, h('span',{className:'por-change-badge'}, n), h('div',null, h('div',null,t1), h('div',{className:'faint', style:{fontSize:'0.875rem'}}, t2))))));
    if(isMobile) return h('div',{className:'stack', style:{gap:20}}, formCard, totalCard,
      h('div',{className:'row', style:{gap:10, flexWrap:'wrap'}}, h(Button,{onClick:submit},'Sačuvaj iznose')), whatHappensCard);
    const gdeCard = h('div',{className:'poc-card'}, h('span',{style:{fontSize:'1.25rem'}},'Gde da nađem iznose?'), h('span',{className:'faint'},'Uz rešenje stižu četiri uplatnice. Svaka ima svoj iznos.'),
      h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); store.toast('Rešenje se preuzima sa portala ePorezi, iz sandučeta.');}},'Kako do rešenja'));
    return h('div',{className:'row', style:{gap:24, alignItems:'stretch', flexWrap:'wrap'}},
      h('div',{className:'stack', style:{gap:20, flex:'1.6 1 320px'}}, formCard,
        h('div',{className:'row', style:{gap:10, flexWrap:'wrap'}}, h(Button,{onClick:submit},'Sačuvaj iznose'), h(Button,{variant:'secondary', onClick:props.onBack},'Nazad')),
        gdeCard),
      h('div',{className:'stack', style:{gap:20, flex:'1 1 280px'}}, totalCard, whatHappensCard));
  }

  function PorezDodajResenje(){
    const s = useStore();
    const isMobile = useIsMobile();
    const [step,setStep] = useState('upload'); // upload | reading | verify | pib_error | manual
    const [items,setItems] = useState(DEFAULT_ITEMS);
    const [fileName,setFileName] = useState('Resenje_2026.pdf');
    function onUpload(wrongPib, realFileName){
      setFileName(realFileName||'Resenje_2026.pdf'); setStep('reading');
      setTimeout(()=> setStep(wrongPib?'pib_error':'verify'), 1200);
    }
    function onSave(finalItems){
      window.AIK.Actions.Porez.saveResenje(finalItems.map(it=> Object.assign({}, it, {amount:Number(it.amount)})));
      store.toast('Rešenje je sačuvano.');
      store.navigate('app/porez/dodato');
    }
    // Rez4c/PhRez4c (raw HTML): korak "verify" ima SOPSTVENU breadcrumbu ("Proveri rešenje") i naslov
    // ("Proveri šta sam pročitao" / "Označio sam..."), razlikuje se i telefon/desktop podnaslov — ranije
    // je ovaj korak delio generičan "Dodaj rešenje Poreske uprave" naslov sa upload/reading/pib_error.
    return h('div',{className:'stack', style:{gap:20}},
      h(Breadcrumb,{label: step==='manual'?'Unesi ručno':step==='verify'?'Proveri rešenje':'Dodaj rešenje'}),
      step==='manual'
        ? h('div',{className:'page-head'}, h('h1',null,'Unesi iznose ručno'),
            h('p',null, isMobile ? 'Prepiši mesečne iznose sa rešenja. Račun primaoca i poziv na broj ne unosiš.' : 'Prepiši mesečne iznose sa rešenja, jedan po jedan. Račun primaoca i poziv na broj ne unosiš.'))
        : step==='verify'
        ? h('div',{className:'page-head'}, h('h1',null,'Proveri šta sam pročitao'),
            h('p',null, isMobile ? 'Označio sam na rešenju odakle sam uzeo svaki iznos.' : 'Označio sam na rešenju odakle sam uzeo svaki iznos. Ako se nešto ne poklapa, ispravi pre čuvanja.'))
        : h('div',{className:'page-head'}, h('h1',null,'Dodaj rešenje Poreske uprave'),
            h('p',null,'Iz rešenja čitam porez, doprinose, račune i poziv na broj. Ti samo proveriš da li je sve tačno.')),
      step==='upload' ? h(UploadStep,{s, onUpload, onManual:()=>setStep('manual')}) :
      step==='reading' ? h(ReadingStep,{s, fileName}) :
      step==='verify' ? h(VerifyStep,{items:seedAmounts(items), s, isMobile, fileName, onSave, onManual:(its)=>{ setItems(its); setStep('manual'); }}) :
      step==='pib_error' ? h(PibErrorStep,{s, isMobile, onRetry:()=>setStep('upload'), onManual:()=>setStep('manual')}) :
      h(ManualStep,{initial: items[0].amount? items : seedAmounts(items), isMobile, onSave, onBack:()=>setStep('upload')}));
  }

  // 6.2.7: ovo NIJE modalni overlay preko cele strane (frejm PorOk/PhPorOk nema scrim, sidebar/topbar
  // i bottom-nav ostaju vidljivi) — obična stranica centrirana u sadržajnoj oblasti, kao bilo koji drugi ekran.
  function PorezDodatoScreen(){
    const s = useStore();
    const isMobile = useIsMobile();
    const total = Sel.taxMonthlyTotal(s);
    const months = Sel.upcomingTaxMonths(s, 1);
    const due = Sel.taxDueDate(months[0]);
    const steps = [
      ['Sačuvao sam mesečne iznose', 'Ukupno '+U.fmtMoney(total,'RSD')+' mesečno.'],
      ['Pripremio sam četiri uplate', 'Svaka ima račun primaoca, poziv na broj i QR kod.'],
      ['Dodao sam rokove u kalendar', 'Prva uplata je '+due.getDate()+'. '+U.MONTHS_SR_GEN[due.getMonth()]+'.'],
      ['Podsetiću te pre svakog roka', 'Podsetnik stiže na mejl i u aplikaciju.'],
    ];
    const badge = (size, iconSize)=> h('span',{style:{flexShrink:0, width:size, height:size, borderRadius:9999, background:'var(--limeta)', color:'var(--suma)', display:'flex', alignItems:'center', justifyContent:'center'}}, h(Icons.check,{width:iconSize, height:iconSize}));
    const buttons = isMobile
      ? h('div',{style:{display:'flex', flexDirection:'column', gap:12}},
          h(Button,{style:{width:'100%', height:48, fontSize:'1rem'}, onClick:()=>store.navigate('app/porez/plati/'+months[0])},'Plati prvu uplatu'),
          h(Button,{variant:'secondary', style:{width:'100%', height:48, fontSize:'1rem'}, onClick:()=>store.navigate('app/pocetna')},'Idi na početnu'))
      : h('div',{style:{display:'flex', gap:12}},
          h(Button,{onClick:()=>store.navigate('app/porez/plati/'+months[0])},'Plati prvu uplatu'),
          h(Button,{variant:'secondary', onClick:()=>store.navigate('app/pocetna')},'Idi na početnu'));
    const card = h('div',{style:{
        boxSizing:'border-box', padding:isMobile?24:40, background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)',
        display:'flex', flexDirection:'column', gap:24, width:isMobile?'100%':640, alignSelf:'center',
      }},
      badge(isMobile?64:72, isMobile?32:36),
      h('div',{style:{display:'flex', flexDirection:'column', gap:8}},
        h('span',{style:{fontSize:'var(--fs-24-32)', letterSpacing:isMobile?'-0.02em':'-0.025em', lineHeight:isMobile?1.2:1.1}},'Sve je podešeno'),
        h('span',{className:'muted', style:{fontSize:'1rem', lineHeight:1.5}},'Rešenje je sačuvano. Od sada pratim porez i doprinose umesto tebe.')),
      h('div',{style:{display:'flex', flexDirection:'column', gap:isMobile?16:18, padding:(isMobile?20:24)+'px 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)'}},
        steps.map(([t1,t2],i)=> h('div',{key:i, style:{display:'flex', gap:isMobile?12:14, alignItems:'flex-start'}},
          badge(28,16),
          h('div',{style:{display:'flex', flexDirection:'column', gap:2}}, h('span',{style:{fontSize:'1rem'}},t1), h('span',{className:'muted', style:{fontSize:'0.875rem', lineHeight:1.5}}, t2))))),
      buttons);
    return h('div',{style:{display:'flex', minHeight:'60vh', alignItems:'center', justifyContent:'center', width:'100%'}}, card);
  }

  // Pay1/Pay2 (raw HTML): QR i detalji (iznos/račun/poziv) su JEDAN DO DRUGOG u redu (ne QR centriran
  // iznad), QR je 132px desktop/112px telefon (bilo 120/140, obrnuto). Plaćena stavka prigušuje QR
  // (opacity:0.18) i preklapa ga lime kružićem sa kvačicom (56px desktop/48px telefon) — ovo je potpuno
  // nedostajalo (QR je ostajao pun kontrast i bez ikakvog znaka da je plaćeno osim bedža gore).
  function PaymentItemCard(props){
    const { it, idx, paid, monthKey, isMobile, business } = props;
    const Porez = window.AIK.Actions.Porez;
    const qrSize = isMobile?112:132;
    const overlaySize = isMobile?48:56;
    const qr = h('div',{style:{position:'relative', width:qrSize, height:qrSize, flex:'none'}},
      h('div',{style:paid?{opacity:0.18}:null}, h(QrCode,{value:ipsQrPayload(it, business), size:qrSize})),
      paid ? h('span',{style:{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center'}},
        h('span',{style:{width:overlaySize, height:overlaySize, borderRadius:9999, background:'var(--limeta)', color:'var(--suma)', display:'flex', alignItems:'center', justifyContent:'center'}},
          h(Icons.check,{width:Math.round(overlaySize*0.5), height:Math.round(overlaySize*0.5)}))) : null);
    return h('div',{className:'poc-card', style: isMobile?{flex:'1 1 260px', padding:16, gap:12}:{flex:1, minWidth:0, padding:24, gap:16}},
      h('div',{style:{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:isMobile?8:12}},
        h('span',{style:{fontSize:'1rem', lineHeight:1.3}}, it.name),
        // 27. krug (završna provera, Korak 3): PhPay1/PhPay2 (frejm) ne pokazuju "Označi kao plaćeno"
        // dugme na telefonu uopšte (samo Kopiraj/Sačuvaj QR) — ali spec 5.3 ("Nema funkcije koja postoji
        // samo na jednom uređaju") i 6.3 ("Plati" korak 3) eksplicitno traže tu funkciju svuda; kad se
        // frejm i tekst spec-a razlikuju u PONAŠANJU, spec pobeđuje (odeljak 0, tačka 6). Pilula je već
        // tu na mobilnom — ista, frejm-tačna pilula postaje dodirna (ista "ceo red dodirljiv" šema kao
        // PhKl3 iz Kalendara), bez ikakve vizuelne izmene.
        isMobile
          ? h('span',Object.assign({className: paid?'poc-auto-pill':'poc-deadline-pill', style:{cursor:'pointer'}},
              window.AIK.a11yClick(()=> paid ? Porez.markUnpaid(monthKey, it.key) : Porez.markPaid(monthKey, it.key))),
              paid ? h(Icons.check,{width:12,height:12}) : null, paid?'Plaćeno':'Neplaćeno')
          : (paid ? h('span',{className:'poc-auto-pill'}, h(Icons.check,{width:12,height:12}),'Plaćeno') : h('span',{className:'poc-deadline-pill'},'Neplaćeno'))),
      h('div',{style:{display:'flex', gap:isMobile?16:20, alignItems:'center'}},
        qr,
        h('div',{style:{flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:10}},
          h('span',{style:{fontSize:'1.5rem', letterSpacing:'-0.02em'}}, U.fmtMoney(it.amount,'RSD')),
          h('div',{className:'stack', style:{gap:2}}, h('span',{className:'faint', style:{fontSize:'0.875rem'}},'Račun primaoca'), h('span',{style:{fontSize:'0.875rem'}}, it.account)),
          h('div',{className:'stack', style:{gap:2}}, h('span',{className:'faint', style:{fontSize:'0.875rem'}},'Poziv na broj'), h('span',{style:{fontSize:'0.875rem'}}, it.pozivNaBroj)))),
      h('div',{className:'row', style: isMobile?{gap:8, marginTop:4}:{gap:10, flexWrap:'wrap', marginTop:4}},
        h(Button,{variant:'secondary', icon:Icons.card, style:isMobile?{flex:1, height:36}:null, onClick:()=>store.toast('Podaci su kopirani.')}, isMobile?'Kopiraj':'Kopiraj podatke'),
        isMobile
          ? (paid
              ? h(Button,{variant:'secondary', style:{flex:1, height:36}, onClick:()=>Porez.markUnpaid(monthKey, it.key)},'Poništi')
              : h(Button,{variant:'secondary', style:{flex:1, height:36}, onClick:()=>store.toast('QR kod je sačuvan.')},'Sačuvaj QR'))
          : (!paid ? h(Button,{variant:'ghost', onClick:()=>Porez.markPaid(monthKey, it.key)},'Označi kao plaćeno') : null)));
  }

  function TrajniNalogPaneContent(props){
    return h(TrajniNaloziTab,{s:props.s, isMobile:props.isMobile});
  }

  function PorezPlacanje(props){
    const s = useStore();
    const isMobile = useIsMobile();
    const monthKey = props.monthKey;
    const [tab,setTab] = useState('qr');
    if(!s.taxDecision) { store.navigate('app/porez'); return null; }
    const due = Sel.taxDueDate(monthKey);
    const serviceMonth = Sel.taxServiceMonthName(monthKey);
    const total = Sel.taxMonthlyTotal(s);
    const pay = s.taxPayments[monthKey] || {};
    const paidCount = Sel.taxMonthPaidCount(s, monthKey);
    const n = s.taxDecision.items.length;
    const reasonLate = due.getDate()!==15 ? `Rok je ${due.getDate()}. ${U.MONTHS_SR[due.getMonth()]}, jer 15. pada u ${U.DAYS_SR_ACC[new Date(due.getFullYear(),due.getMonth(),15).getDay()]}.` : null;
    return h('div',{className:'stack', style:{gap:20}},
      h(Breadcrumb,{label:'Plaćanje za '+serviceMonth}),
      h('div',{style:{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:24, flexWrap:'wrap'}},
        h('div',null, h('h1',{style:{margin:0, fontSize:'var(--fs-24-32)'}},'Plaćanje za '+serviceMonth), h('p',{className:'faint', style:{margin:0}},
          isMobile ? (reasonLate || 'Četiri uplate, svaka ima svoj QR kod.') : ('Četiri uplate, svaka ima svoj QR kod.'+(reasonLate?' '+reasonLate:'')))),
        tab==='trajni' ? null : h('div',{style:{textAlign:'right'}}, h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Ukupno za '+serviceMonth), h('div',{style:{fontSize:'2rem', letterSpacing:'-0.025em'}}, U.fmtMoney(total,'RSD')))),
      h('div',{className:'inv-seg', style:{alignSelf:'flex-start'}}, [['qr', isMobile?'QR kod':'Skeniraj QR kod'],['trajni', isMobile?'Trajni nalog':'Trajni nalog u banci']].map(([k,l])=> h('button',{key:k, type:'button', className:tab===k?'active':'', onClick:()=>setTab(k)}, l))),
      tab==='trajni' ? h(TrajniNalogPaneContent,{s, isMobile}) : h(React.Fragment,null,
        paidCount===0
          ? h('div',{className:'por-highlight-card'},
              h('div',{style:{display:'flex', flexDirection:'column', gap:8}},
                h('span',{style:{fontSize:'1rem'}}, isMobile?'Svaka uplata ima svoj QR kod':'Skeniraj svaki kod u mobilnoj aplikaciji svoje banke'),
                h('span',{className:'por-highlight-sub', style:{fontSize:'0.875rem'}}, isMobile?'Sačuvaj QR kod ili kopiraj podatke i plati u aplikaciji svoje banke.':'U aplikaciji izaberi opciju za skeniranje IPS QR koda i potvrdi uplatu.')))
          // Pay2/PhPay2 (raw HTML): kad je bar jedna stavka plaćena, isti `.por-highlight-card` okvir sad
          // nosi traku napretka (8px, pozadina `--suma` na 14% providnosti, popuna `--suma` širine X/Y) —
          // ranije je ovo bio goli tekst bez trake i bez istaknutog okvira.
          : h('div',{className:'por-highlight-card'},
              h('div',{style:{flex:1, display:'flex', flexDirection:'column', gap:8}},
                h('span',{style:{fontSize:'1rem'}},'Plaćeno '+paidCount+' od '+n+' uplate'),
                h('div',{className:'por-progress-track'}, h('div',{className:'por-progress-fill', style:{width:(paidCount/n*100)+'%'}})))),
        // Pay1/Pay2 (raw HTML, desktop): FIKSNA 2x2 mreža (dva odvojena reda od po 2 kartice, `flex:1`
        // bez prelamanja), ne flex-wrap preko sva 4 odjednom (to je prelamalo u 3+1 na 1440px). Telefon
        // ostaje jedna kolona (PhPay1 nema red-omotač, kartice su prosto jedna ispod druge).
        isMobile
          ? h('div',{className:'stack', style:{gap:20}},
              s.taxDecision.items.map((it,idx)=> h(PaymentItemCard,{key:it.key, it, idx, paid:pay[it.key]==='Plaćeno', monthKey, isMobile, business:s.business})))
          : h('div',{className:'stack', style:{gap:20}},
              [0,2].map(start=> h('div',{key:start, className:'row', style:{gap:20, alignItems:'stretch'}},
                s.taxDecision.items.slice(start,start+2).map((it,idx)=> h(PaymentItemCard,{key:it.key, it, idx:start+idx, paid:pay[it.key]==='Plaćeno', monthKey, isMobile, business:s.business})))))));
  }

  const NEW_RESENJE_AMOUNTS = {porez:5130.00, pio:12870.24, zdravstveno:5523.02, nezaposlenost:402.16};
  function n2sr(x){ return x.toLocaleString('sr-RS',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function PorNovScreen(){
    const s = useStore();
    const isMobile = useIsMobile();
    if(!s.taxDecision) { store.navigate('app/porez'); return null; }
    const nextYear = s.taxDecision.year+1;
    const oldTotal = Sel.taxMonthlyTotal(s);
    const newTotal = Object.values(NEW_RESENJE_AMOUNTS).reduce((a,b)=>a+b,0);
    function apply(){
      const items = s.taxDecision.items.map(it=> Object.assign({}, it, {amount:NEW_RESENJE_AMOUNTS[it.key]}));
      window.AIK.Actions.Porez.applyNewResenje(items, nextYear);
      store.navigate('app/porez');
    }
    const rows = s.taxDecision.items.map(it=> Object.assign({}, it, {nv:NEW_RESENJE_AMOUNTS[it.key], diff:NEW_RESENJE_AMOUNTS[it.key]-it.amount}));
    const stepsInfo = [['1','Nove uplate','Primenjuju se na sledeću akontaciju, uz nove QR kodove.'],
      ['2','Trajni nalozi','Ako plaćaš trajnim nalogom, ažuriraj ga u banci. Podsetiću te.'],
      ['3','Stari iznosi','Ostaju sačuvani za prethodne uplate.']];
    if(isMobile){
      // PhPorNov: dve ODVOJENE kartice (ne jedna), redovi su kompaktan "staro → novo din  +razlika" u
      // jednom redu (ne Do-sada/Novo/Razlika stack), a ukupno je PLOSNATA #0F2A22 kartica (ne gradijent).
      return h('div',{className:'stack', style:{gap:20}},
        h(Breadcrumb,{label:'Novo rešenje'}),
        h('div',{className:'page-head'}, h('h1',null,'Novo rešenje za '+nextYear+'.'), h('p',null,'Pročitao sam novo rešenje. Proveri razliku pre nego što je primenim.')),
        h('div',{style:{boxSizing:'border-box', padding:16, background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:12}},
          h('span',{style:{fontSize:'1.25rem', letterSpacing:'-0.01em'}},'Šta se promenilo'),
          h('span',{className:'poc-deadline-pill', style:{alignSelf:'flex-start'}},'Iznosi su veći'),
          rows.map(it=> h('div',{key:it.key, style:{display:'flex', flexDirection:'column', gap:8, padding:'14px 0', borderTop:'1px solid var(--border)'}},
            h('span',{style:{fontSize:'1rem'}}, it.name),
            h('div',{style:{display:'flex', alignItems:'center', gap:8}},
              h('span',{className:'muted', style:{fontSize:'1rem'}}, n2sr(it.amount)),
              h('span',{className:'muted', style:{display:'flex'}}, h(Icons.arrowRight,{width:16,height:16})),
              h('span',{style:{fontSize:'1rem'}}, n2sr(it.nv)+' din'),
              h('span',{style:{marginLeft:'auto', fontSize:'0.875rem', color:'#8A5A00'}},(it.diff>=0?'+':'')+n2sr(it.diff))))),
          h('div',{style:{display:'flex', flexDirection:'column', gap:6, padding:16, borderRadius:12, background:'#0F2A22', color:'#fff'}},
            h('span',{style:{fontSize:'0.875rem', color:'#C9D6CF'}},'Ukupno mesečno'),
            h('div',{style:{display:'flex', alignItems:'baseline', gap:8}}, h('span',{style:{fontSize:'1.25rem', letterSpacing:'-0.02em'}}, n2sr(newTotal)+' din'), h('span',{style:{fontSize:'0.875rem', color:'#C8F169'}},'+'+n2sr(newTotal-oldTotal))),
            h('span',{style:{fontSize:'0.875rem', color:'#C9D6CF'}},'Do sada: '+n2sr(oldTotal)+' din'))),
        h('div',{style:{boxSizing:'border-box', padding:20, background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:16}},
          h('span',{style:{fontSize:'1.25rem'}},'Šta se desi kad primeniš'),
          stepsInfo.map(([n,t1,t2])=>
            h('div',{key:n, style:{display:'flex', gap:12, alignItems:'flex-start'}}, h('span',{className:'por-change-badge'}, n), h('div',null, h('div',null,t1), h('div',{className:'faint', style:{fontSize:'0.875rem'}}, t2)))),
          h(Button,{style:{width:'100%', height:48, fontSize:'1rem'}, onClick:apply},'Primeni nove iznose'),
          h(Button,{variant:'secondary', style:{width:'100%', height:48, fontSize:'1rem'}, onClick:()=>store.toast('Ispravka iznosa (nije deo prototipa).')}, 'Ispravi iznose')));
    }
    // PorNov (raw HTML): DVE ODVOJENE kartice jedna pored druge (flex:1.7/flex:1), ne jedna kartica sa
    // svime stacked — dugmad su UNUTAR desne kartice, ispod koraka, stacked u koloni (ne u redu).
    return h('div',{className:'stack', style:{gap:20}},
      h(Breadcrumb,{label:'Novo rešenje'}),
      h('div',{className:'page-head'}, h('h1',null,'Novo rešenje za '+nextYear+'.'), h('p',null,'Pročitao sam novo rešenje. Iznosi su se promenili, proveri razliku pre nego što ih primenim.')),
      h('div',{className:'row', style:{gap:24, alignItems:'flex-start', flexWrap:'wrap'}},
        h('div',{className:'poc-card', style:{flex:1.7}},
          h('div',{className:'poc-card-head'}, h('span',{className:'t'},'Šta se promenilo'), h('span',{className:'poc-deadline-pill'},'Iznosi su veći')),
          h('table',{className:'inv-table', style:{width:'100%'}},
            h('thead',null, h('tr',null, h('th',null,'Uplata'), h('th',{className:'r'},'Do sada'), h('th',{className:'r'},'Novo'), h('th',{className:'r'},'Razlika'))),
            h('tbody',null,
              rows.map(it=> h('tr',{key:it.key}, h('td',null,it.name), h('td',{className:'r'}, n2sr(it.amount)), h('td',{className:'r'}, n2sr(it.nv)), h('td',{className:'r'}, (it.diff>=0?'+':'')+n2sr(it.diff)))),
              h('tr',null, h('td',null, h('b',null,'Ukupno mesečno')), h('td',{className:'r'}, h('b',null,n2sr(oldTotal))), h('td',{className:'r'}, h('b',null,n2sr(newTotal))), h('td',{className:'r'}, h('b',null,'+'+n2sr(newTotal-oldTotal))))))),
        h('div',{className:'poc-card', style:{flex:1}},
          h('span',{style:{fontSize:'1.25rem'}},'Šta se desi kad primeniš'),
          h('div',{className:'stack', style:{gap:12}},
            stepsInfo.map(([n,t1,t2])=>
              h('div',{key:n, className:'row', style:{gap:12, alignItems:'flex-start'}}, h('span',{className:'por-change-badge'}, n), h('div',null, h('div',null,t1), h('div',{className:'faint', style:{fontSize:'0.875rem'}}, t2))))),
          h('div',{className:'stack', style:{gap:10, marginTop:4}},
            h(Button,{onClick:apply},'Primeni nove iznose'),
            h(Button,{variant:'secondary', onClick:()=>store.toast('Ispravka iznosa (nije deo prototipa).')}, 'Ispravi iznose')))));
  }

  function PorezScreen(props){
    const sub = props.sub||'';
    if(sub==='dodaj-resenje') return h(PorezDodajResenje);
    if(sub==='dodato') return h(PorezDodatoScreen);
    if(sub==='novo-resenje') return h(PorNovScreen);
    if(sub==='trajni-nalozi') return h(TrajniNaloziScreen);
    if(sub.indexOf('plati/')===0) return h(PorezPlacanje,{monthKey: sub.slice(6)});
    return h(PorHScreen);
  }

  window.AIK = window.AIK || {};
  window.AIK.Screens = window.AIK.Screens || {};
  window.AIK.Screens.porez = PorezScreen;
  window.AIK.Porez = { DateTile, QrCode, ResenjeFileRow };
})();
