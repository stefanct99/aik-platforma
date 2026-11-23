// Faza 5: Mejlovi banke (7.7, 6.5, 6.6, 8.5). AI pripremi dokumenta, korisnik odobri ili je uključena automatska obrada.
(function(){
  const h = React.createElement;
  const { useState, useEffect } = React;
  const { useStore, t, Components, useIsMobile } = window.AIK;
  const { Button, Field, Input, Modal, EmptyState, SidePanel } = Components;
  const Icons = window.AIK.Icons;
  const store = window.AIK.store;
  const Sel = window.AIK.Selectors;
  const U = window.AIK.Util;
  const BM = window.AIK.Actions.BankMails;
  const TODAY = window.AIK.Seed.TODAY;

  function statusClass(status){
    if(status==='Čeka tvoje odobrenje') return 'sent';
    if(status==='Treba mi tvoja pomoć') return 'late';
    return 'paid';
  }
  function StatusPill(props){ return h('span',{className:'mb-status-pill '+statusClass(props.status)}, props.status); }

  function timeShort(iso){
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
    if(d.toDateString()===TODAY.toDateString()) return 'Danas, '+hh;
    const yest = new Date(TODAY); yest.setDate(TODAY.getDate()-1);
    if(d.toDateString()===yest.toDateString()) return 'Juče, '+hh;
    return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'., '+hh;
  }
  function timeDetail(iso){
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
    if(d.toDateString()===TODAY.toDateString()) return 'danas u '+hh;
    const yest = new Date(TODAY); yest.setDate(TODAY.getDate()-1);
    if(d.toDateString()===yest.toDateString()) return 'juče u '+hh;
    return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+d.getFullYear()+' u '+hh;
  }
  function fmtDateU(iso){ return U.fmtDate(iso).replace(/\.$/,''); }
  function n2(x){ return Number(x).toLocaleString('sr-RS',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  // Mejlovi banke imituju prave bankarske mejlove/naloge: iznosi uvek sa ISO kodom valute (EUR/USD/RSD), nikad simbolom.
  function fmtMoneyCode(amount, currency){ return `${n2(amount||0)} ${currency||''}`.trim(); }
  function timeAgoHours(iso){
    const NOW = new Date(TODAY.getTime()+14*3600*1000);
    const mins = Math.round((NOW-new Date(iso))/60000);
    if(mins<60) return 'pre '+Math.max(1,mins)+' min';
    const hrs = Math.round(mins/60);
    if(hrs<24) return 'pre '+hrs+' '+U.plural(hrs,['sat','sata','sati']);
    const days = Math.round(hrs/24);
    return 'pre '+days+' '+U.dayWord(days);
  }
  function inboundAddress(business){ return `${business.inboundSlug}-${business.inboundCode}@prijem.tvojaiknjigovodja.rs`; }
  function mailLabel(m){
    if(m.kind==='extra_doc') return 'Zahtev za dodatni dokument';
    return `Priliv ${fmtMoneyCode(m.amount, m.currency)}`;
  }
  function clientOrSender(m){ return m.client ? m.client.name : (m.senderName || (m.kind==='extra_doc' ? 'Bez klijenta' : 'Nepoznat pošiljalac')); }

  // ===================== Lista (Mb1) =====================
  // Mb1/PhMb1: raw HTML potvrđuje da frejm NEMA ikonicu, a imejl je u SVOJOJ uokvirenoj sivoj kutiji
  // (`--bg` boja, ne `--surface`/`--surface-2` — ista u obe teme) sa dugmetom za kopiranje, odvojenoj od
  // naslova/statusa (levo, fiksnih 300px na desktopu). Telefon ima SASVIM drugačiji raspored (naslov,
  // pa kutija, pa status red) i NEMA "Kako da javim banci" link uopšte (potvrđeno: teksta nema u PhMb1).
  function AdresaCard(props){
    const { s, isMobile } = props;
    const addr = inboundAddress(s.business);
    const latest = s.bankMails.slice().sort((a,b)=> new Date(b.receivedAt)-new Date(a.receivedAt))[0];
    const statusText = latest
      ? 'Povezano, poslednji mejl '+(isMobile?'banke ':'')+timeAgoHours(latest.receivedAt)
      : 'Povezano';
    const statusRow = h('div',{className:'mb-addr-status'}, h('span',{className:'dot'}), statusText);
    const box = h('div',{className:'mb-addr-box'},
      h('span',null, addr),
      h('button',{type:'button', className:'mb-addr-copy', onClick:()=>{ try{ navigator.clipboard.writeText(addr); }catch(e){} store.toast('Adresa je kopirana.'); }}, h(Icons.copy,{width:18,height:18})));
    if(isMobile) return h('div',{className:'mb-card mb-addr-card-m'},
      h('span',{style:{fontSize:'1.25rem', letterSpacing:'-0.01em'}},'Tvoja adresa za prijem'),
      box, statusRow);
    return h('div',{className:'mb-card mb-addr-card'},
      h('div',{className:'mb-addr-left'}, h('span',{style:{fontSize:'1rem'}},'Tvoja adresa za prijem'), statusRow),
      h('div',{style:{flex:1, minWidth:0}}, box),
      h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); store.toast('Pošalji banci: molim da obrasce šalje i na '+addr+'.');}},'Kako da javim banci'));
  }

  const TABS = [['sve','Sve'],['ceka','Čeka tebe'],['obradjeno','Obrađeno'],['problem','Problemi']];

  function MailRow(props){
    const { m, isMobile, onOpen } = props;
    if(isMobile) return h('div',Object.assign({className:'inv-card-row'}, window.AIK.a11yClick(onOpen)),
      h('div',{className:'t'}, h('span',null, m.subject), h('span',null, m.kind==='extra_doc' ? '' : U.fmtMoney(m.amount,m.currency))),
      h('div',{className:'sub'}, clientOrSender(m)+' · '+timeShort(m.receivedAt)),
      h('div',{style:{marginTop:6}}, h(StatusPill,{status:m.status})));
    return h('tr',{className:'clickable', onClick:onOpen},
      h('td',null, h('div',{style:{display:'flex', flexDirection:'column', gap:2}}, h('span',null, m.subject), h('span',{className:'faint', style:{fontSize:'0.875rem'}},'Erste Bank'))),
      h('td',null, h('div',{style:{display:'flex', flexDirection:'column', gap:2}}, h('span',null, clientOrSender(m)), m.kind!=='extra_doc' ? h('span',{className:'faint', style:{fontSize:'0.875rem'}}, U.fmtMoney(m.amount,m.currency)) : null)),
      h('td',{className:'faint', style:{fontSize:'0.875rem'}}, m.replyTo),
      h('td',null, h(StatusPill,{status:m.status})),
      h('td',{className:'r faint', style:{fontSize:'0.875rem'}}, timeShort(m.receivedAt)));
  }

  function ListPage(){
    const s = useStore();
    const isMobile = useIsMobile();
    const [tab,setTab] = useState('sve');
    const mails = Sel.bankMailsWithMeta(s).sort((a,b)=> new Date(b.receivedAt)-new Date(a.receivedAt));
    const counts = Sel.bankMailTabCounts(s);
    const rows = tab==='sve' ? mails : mails.filter(m=>m.tab===tab);
    const isEmpty = s.bankMails.length===0;
    const showFirstTime = !s.autonomySettings.sendingSettingsSeen && !isEmpty;
    // Mb9: pri prvom mejlu ZAMENJUJE celu listu (puna-ekranska kartica, videti FirstTimeDialog) — ne
    // prikazuje se preko liste kao dijalog (frejm nema listu, sidebar ni topbar iza kartice).
    if(showFirstTime) return h(FirstTimeDialog,{onClose:()=>{}});
    return h('div',{className:'stack mb-page', style:{gap:20}},
      h('div',{className:'page-head-row'},
        h('div',{className:'page-head', style:{marginBottom:0}}, h('h1',null,'Mejlovi banke'), h('p',null,'Banka mi šalje obrasce, ja ih popunim i vratim.')),
        // PhMb1: frejm nema ovo dugme na telefonu — dostupno preko Podešavanja > Povezivanje (settings.js).
        // Mb2.dc.html (27. krug, Korak 2): prazno/nepovezano stanje takođe nema ovo dugme (potvrđeno
        // sirovim HTML-om, 0 pojava teksta "Podešavanja slanja") — nema smisla pre nego što mejl stigne.
        (isMobile || isEmpty) ? null : h(Button,{variant:'secondary', onClick:()=>store.navigate('app/mejlovi/podesavanja')},'Podešavanja slanja')),
      isEmpty ? h(EmptyPage,{s}) : h(React.Fragment,null,
        h(AdresaCard,{s, isMobile}),
        // Mb1/PhMb1 (raw HTML): OKRUGLE pilule (isti `.inv-chip` kao Fakture filteri), NE podvučeni
        // `.sub-tab` (taj je za Fakture/Knjiga prihoda) — potvrđeno #161A17 aktivnom pilulom u oba panela.
        h('div',{className:'chip-row'}, TABS.map(([key,label])=> h('span',Object.assign({key, className:'inv-chip'+(tab===key?' active':'')}, window.AIK.a11yClick(()=>setTab(key))), label, h('span',{className:'n'}, counts[key])))),
        rows.length===0 ? h(EmptyState,{icon:Icons.inbox, title:'Nema mejlova u ovom tabu.'}) :
        isMobile ? h('div',{className:'inv-card-list'}, rows.map(m=> h(MailRow,{key:m.id, m, isMobile:true, onOpen:()=>store.navigate('app/mejlovi/'+m.id)}))) :
        h('div',{className:'inv-table-wrap'},
          h('table',{className:'inv-table'},
            h('colgroup',null, h('col',null), h('col',{style:{width:220}}), h('col',{style:{width:220}}), h('col',{style:{width:170}}), h('col',{style:{width:100}})),
            h('thead',null, h('tr',null, h('th',null,'Mejl'), h('th',null,'Klijent i iznos'), h('th',null,'Vraćam na adresu'), h('th',null,'Status'), h('th',{className:'r'},'Stiglo'))),
            h('tbody',null, rows.map(m=> h(MailRow,{key:m.id, m, isMobile:false, onOpen:()=>store.navigate('app/mejlovi/'+m.id)})))))));
  }

  // Mb2/PhMb2: frejm nema ikonicu niti centriran tekst — leva poravnata kartica (ista vizuelna porodica
  // kao .mb-card), max-width 560px sadržaj, naslov 1.5rem (potvrđeno sirovim HTML-om oba frejma).
  function EmptyPage(){
    const s = useStore();
    const addr = inboundAddress(s.business);
    return h('div',{className:'mb-card', style:{alignItems:'center', justifyContent:'center', minHeight:400}},
      h('div',{style:{width:'100%', maxWidth:560, display:'flex', flexDirection:'column', gap:24}},
        h('div',{style:{display:'flex', flexDirection:'column', gap:8}},
          h('span',{style:{fontSize:'1.5rem', letterSpacing:'-0.02em'}},'Još nije stigao nijedan mejl banke'),
          h('span',{className:'faint'},'Da bih radio umesto tebe, banka treba da šalje obrasce i na moju adresu.')),
        h('div',{className:'mb-steps'},
          h('div',{className:'mb-step'}, h('span',{className:'mb-step-num'},'1'), h('div',null, h('div',{style:{fontSize:'1rem'}},'Kopiraj svoju adresu'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Ovo je adresa na koju banka treba da šalje.'),
            h('div',{className:'row', style:{gap:8, marginTop:8}}, h(Input,{value:addr, readOnly:true}), h(Button,{variant:'secondary', icon:Icons.copy, onClick:()=>store.toast('Adresa je kopirana.')},'Kopiraj')))),
          h('div',{className:'mb-step'}, h('span',{className:'mb-step-num'},'2'), h('div',null, h('div',{style:{fontSize:'1rem'}},'Javi banci'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Pošalji banci ovaj tekst, ili podesi prosleđivanje u internet bankarstvu.'),
            h('p',{style:{background:'var(--surface-2)', padding:12, borderRadius:8, fontSize:'0.875rem'}}, `Poštovani, molim vas da sve obrasce i zahteve za devizne priliv šaljete i na adresu ${addr}.`),
            h(Button,{variant:'secondary', icon:Icons.copy, onClick:()=>store.toast('Tekst je kopiran.')},'Kopiraj tekst'))),
          h('div',{className:'mb-step'}, h('span',{className:'mb-step-num'},'3'), h('div',null, h('div',{style:{fontSize:'1rem'}},'Čekaj prvi mejl'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Čim stigne, pročitam ga i pripremim dokumenta. Obavestiću te.'))))));
  }

  // ===================== Prvo podešavanje (Mb9) =====================
  // Specifikacija kaže "dijalog", ali sirovi HTML (Mb9.dc.html/PhMb9.dc.html) nema sidebar, topbar ni
  // tamni scrim bilo gde u fajlu — ceo ekran je jedna centrirana kartica preko pozadine stranice
  // (potvrđeno i kontakt-slikom). Frejm pobeđuje za izgled (CLAUDE.md pravilo 1): ne koristi se Modal,
  // nego obična kartica unutar `content-fullbleed` (videti js/shell.js AppShell i js/app.js router).
  // Ponašanje ostaje isto: pojavljuje se pri prvom mejlu, 2 izbora + izbor za devize, promenljivo kasnije
  // u Podešavanjima slanja (Mb8).
  function FirstTimeDialog(props){
    const isMobile = useIsMobile();
    const [mode,setMode] = useState('ask');
    const [fx,setFx] = useState('sell_all');
    function finish(auto){
      if(auto) BM.updateAutonomy({globalMode:mode, fxMode:fx});
      else BM.markSettingsSeen();
      props.onClose();
    }
    const secondaryBtn = h(Button,{key:'c', variant:'secondary', onClick:()=>finish(false), style:isMobile?{width:'100%', height:48, fontSize:'1rem'}:null},'Ostavi odobravanje');
    const primaryBtn = h(Button,{key:'s', onClick:()=>finish(true), style:isMobile?{width:'100%', height:48, fontSize:'1rem'}:null},'Uključi automatsku obradu');
    return h('div',{className:'mb-firsttime-card'},
      h('div',{style:{display:'flex', flexDirection:'column', gap:6}},
        h('span',{style:{fontSize:'1.5rem', letterSpacing:'-0.02em'}},'Kako da obrađujem mejlove banke?'),
        h('span',{style:{color:'var(--text-muted)'}},'Izaberi jednom, a možeš da promeniš kad god hoćeš.')),
      h('div',{className:'row', style:{gap:16, alignItems:'flex-start', flexWrap:'wrap'}},
        h('div',{className:'mb-card', style:{flex:1, minWidth:260}},
          h('span',{style:{fontSize:'1.25rem'}},'Kad stigne mejl banke'),
          h('div',Object.assign({className:'mb-radio'+(mode==='ask'?' active':'')}, window.AIK.a11yClick(()=>setMode('ask'))), h('span',{className:'dot'}), h('div',null, h('div',null,'Tražim tvoje odobrenje'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Pripremim dokumenta, a ti pregledaš i odobriš.'))),
          h('div',Object.assign({className:'mb-radio'+(mode==='auto'?' active':'')}, window.AIK.a11yClick(()=>setMode('auto'))), h('span',{className:'dot'}), h('div',null, h('div',null,'Sve radim sam i javim ti'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Pročitam mejl, popunim i pošaljem banci. Ti samo dobiješ obaveštenje da je gotovo.')))),
        h('div',{className:'mb-card', style:{flex:1, minWidth:260}},
          h('span',{style:{fontSize:'1.25rem'}},'Devizni priliv: šta radim sa novcem'),
          h('div',Object.assign({className:'mb-radio'+(fx==='book_only'?' active':'')}, window.AIK.a11yClick(()=>setFx('book_only'))), h('span',{className:'dot'}), h('div',null, h('div',null,'Samo proknjiži, ne prodaj'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Priliv ostaje na deviznom računu. Ti kasnije biraš da li i koliko prodaješ.'))),
          h('div',Object.assign({className:'mb-radio'+(fx==='sell_part'?' active':'')}, window.AIK.a11yClick(()=>setFx('sell_part'))), h('span',{className:'dot'}), h('div',null, h('div',null,'Prodaj deo priliva'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Ti biraš procenat ili iznos, ostatak ostaje na deviznom računu.'))),
          h('div',Object.assign({className:'mb-radio'+(fx==='sell_all'?' active':'')}, window.AIK.a11yClick(()=>setFx('sell_all'))), h('span',{className:'dot'}), h('div',null, h('div',null,'Prodaj ceo priliv automatski'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Sve se odmah pretvara u dinare i dinarski račun je odmah popunjen.'))),
          h('p',{className:'faint', style:{fontSize:'0.875rem'}},'Kad se prodaje, banci šaljem i nalog za prodaju deviza. Kod dinarskog priliva nema prodaje: radim samo ono što piše u mejlu banke i ceo iznos se knjiži u dinarima.'))),
      h('div',{className:'mb-card', style:{background:'var(--sidebar-item-active)'}},
        h('span',null,'Kad banka javi priliv u evrima, pošaljem joj sva dokumenta i prodam ceo iznos. Dinarski račun se popuni odmah, a ti dobiješ mejl.'),
        h('span',{className:'faint', style:{fontSize:'0.875rem'}},'Za pojedinog klijenta ovo možeš da promeniš kasnije.')),
      isMobile ? h('div',{className:'stack', style:{gap:10}}, primaryBtn, secondaryBtn) : h('div',{style:{display:'flex', justifyContent:'flex-end', gap:12}}, secondaryBtn, primaryBtn));
  }

  // ===================== Detalj =====================
  // Mb3/Mb6/Mb7/Mb10 (raw HTML, sva 4 tipa mejla): u telu pisma je iznos (ili kod Mb7 fraza "potvrdu o
  // poreklu sredstava") podebljan, a adresa za odgovor (m.replyTo) uokvirena žutim mark-om — telo je dosad
  // bio čist tekst, bez ijednog od ova dva. Oba cilja se ne preklapaju u tekstu pa se mogu nezavisno naći.
  function renderMailBody(m){
    const body = m.body||'';
    const boldTarget = m.kind==='extra_doc' ? 'potvrdu o poreklu sredstava' : fmtMoneyCode(m.amount,m.currency);
    const spans = [];
    if(boldTarget){ const i = body.indexOf(boldTarget); if(i>=0) spans.push({start:i, end:i+boldTarget.length, tag:'b'}); }
    if(m.replyTo){ const i = body.indexOf(m.replyTo); if(i>=0) spans.push({start:i, end:i+m.replyTo.length, tag:'mark'}); }
    spans.sort((a,b)=>a.start-b.start);
    const nodes = []; let pos = 0, key = 0;
    spans.forEach(sp=>{
      if(sp.start<pos) return;
      if(sp.start>pos) nodes.push(body.slice(pos,sp.start));
      const seg = body.slice(sp.start,sp.end);
      nodes.push(sp.tag==='b' ? h('b',{key:key++, style:{fontWeight:500}},seg) : h('mark',{key:key++, className:'mb-mark'},seg));
      pos = sp.end;
    });
    if(pos<body.length) nodes.push(body.slice(pos));
    return nodes;
  }
  function MejlCard(props){
    const { m } = props;
    // Mb3/Mb6/Mb11: devizni I "bez fakture" mejlovi banke dolaze sa 2 priloga (prazni obrasci koje banka
    // traži nazad) — dinarski (Mb10) i nestandardni zahtevi (Mb7) ih nemaju (potvrđeno raw HTML-om sva 4 frejma).
    return h('div',{className:'mb-card'},
      h('span',{style:{fontSize:'1.25rem'}},'Mejl banke'),
      h('div',{style:{display:'flex', flexDirection:'column', gap:4, fontSize:'0.875rem', color:'var(--text-muted)'}},
        h('span',null,'Od: Erste Bank <'+m.sender+'>'),
        h('span',null,'Stiglo: '+fmtDateU(m.receivedAt)+' u '+new Date(m.receivedAt).toTimeString().slice(0,5))),
      h('span',null, m.subject),
      h('div',{style:{whiteSpace:'pre-line', color:'var(--text-muted)', paddingTop:12, borderTop:'1px solid var(--border)'}}, renderMailBody(m)),
      (m.kind==='devizni'||m.kind==='problem_no_invoice') ? h('div',{className:'row', style:{gap:8, flexWrap:'wrap'}},
        h('span',{className:'mb-attach-chip'}, h(Icons.fileText,{width:16,height:16}),'Raspored priliva.pdf'),
        h('span',{className:'mb-attach-chip'}, h(Icons.fileText,{width:16,height:16}),'Prodaja deviza.pdf')) : null);
  }

  // Mb3/Mb10/Mb11: "Šta sam uradio"/"Kome vraćam"/"Slanje" su u frejmu ODVOJENE kartice, ne jedna kartica
  // sa border-top razdelnicima (potvrđeno raw HTML-om sva tri frejma).
  function CheckRow(props){
    return h('div',{style:{display:'flex', gap:12, alignItems:'flex-start'}},
      h('span',{className:'mb-check-dot'}, h(Icons.check,{width:14,height:14})),
      h('span',{style:{fontSize:'1rem', lineHeight:'1.5'}}, props.text));
  }

  function SentDetail(props){
    const { m, isMobile } = props;
    const whatIDid = (m.kind==='dinarski' ? [
      'Pročitao sam mejl: banka traži samo fakturu za dinarski priliv od '+fmtMoneyCode(m.amount,'RSD')+'.',
      'Povezao sam uplatu sa fakturom '+(m.invoice?m.invoice.number:'–')+' ('+(m.client?m.client.name:'–')+').',
      'Prodaja deviza nije potrebna, jer je priliv u dinarima.',
      'Ceo iznos knjižim u dinarima i označavam fakturu kao plaćenu.',
    ] : [
      'Pročitao sam mejl: banka traži tri dokumenta za priliv od '+fmtMoneyCode(m.amount,m.currency)+'.',
      'Povezao sam uplatu sa fakturom '+(m.invoice?m.invoice.number:'–')+' ('+(m.client?m.client.name:'–')+').',
      'Pripremio sam fakturu, raspored priliva i nalog za prodaju deviza.',
      'Poslao sam sve banci na adresu iz mejla.',
    ].concat(m.fxSale ? ['Prodao sam '+(m.fxSale.percent?m.fxSale.percent+'% priliva':'ceo priliv')+', a dinari su na tvom računu.'] : []));
    const left = h('div',{key:'left', className:'mb-detail-left'},
        h(MejlCard,{m}),
        // Mb10 (dinarski): "Poslato banci" ravna kartica (Na adresu/Prilog/Poslato).
        // Mb11 (devizni): "Istorija" kartica sa tačka-vremenskom linijom (ista kao SentOverlay).
        m.kind==='dinarski' ? h('div',{className:'mb-card'},
          h('span',{style:{fontSize:'1.25rem'}},'Poslato banci'),
          h('div',null,
            h('div',{className:'mb-kv-row'}, h('span',{className:'k'},'Na adresu'), h('span',{className:'v'}, m.replyTo)),
            h('div',{className:'mb-kv-row'}, h('span',{className:'k'},'Prilog'), h('span',{className:'v'}, m.invoice?('Faktura '+m.invoice.number.replace('/','-')+'.pdf'):'–')),
            m.history && m.history[0] ? h('div',{className:'mb-kv-row'}, h('span',{className:'k'},'Poslato'), h('span',{className:'v'}, fmtDateU(m.history[0].at)+' u '+new Date(m.history[0].at).toTimeString().slice(0,5))) : null)) :
          (m.history && m.history.length ? h('div',{className:'mb-card'},
            h('span',{style:{fontSize:'1.25rem'}},'Istorija'),
            m.history.map((ev,i)=> h('div',{key:i, className:'row', style:{gap:12}},
              h('span',{className:'mb-timeline-dot'}),
              h('div',null, h('div',null,ev.label), h('div',{className:'faint', style:{fontSize:'0.875rem'}}, fmtDateU(ev.at)+' u '+new Date(ev.at).toTimeString().slice(0,5)))))) : null));
    const right = h('div',{key:'right', className:'mb-detail-right'},
        h('div',{className:'mb-card'},
          h('span',{style:{fontSize:'1.25rem'}},'Šta sam uradio'),
          whatIDid.map((t,i)=> h(CheckRow,{key:i, text:t}))),
        m.fxSale ? h('div',{className:'mb-card'},
          h('span',{style:{fontSize:'1.25rem'}},'Prodaja deviza'),
          h('div',{className:'inv-kv'}, h('span',{className:'k'},'Prodato'), h('span',{className:'v'}, fmtMoneyCode(m.fxSale.amount, m.fxSale.currency))),
          h('div',{className:'inv-kv'}, h('span',{className:'k'},'Kurs'), h('span',{className:'v'}, n2(m.fxSale.rate))),
          h('div',{className:'inv-kv'}, h('span',{className:'k'},'Dobijeno u dinarima'), h('span',{className:'v'}, fmtMoneyCode(Math.round(m.fxSale.amount*m.fxSale.rate*100)/100,'RSD')))) : null,
        // Mb10: "Slanje" kartica (tekst o režimu slanja + link), potvrđeno raw HTML-om. Mb11 pokazuje isti
        // link kao dugme u zaglavlju umesto kartice — frejmova nedoslednost (isti podatak, drugo mesto),
        // nije repliciran taj drugi oblik (previše rizično menjati zajednički header zbog jednog frejma).
        h('div',{className:'mb-card'},
          h('span',{style:{fontSize:'1.25rem'}},'Slanje'),
          h('span',null,'Za '+(m.client?m.client.name:'nepoznatog pošiljaoca')+' '+(BM.effectiveAutoSend(m.client)?'šaljem automatski, bez pitanja.':'tražim tvoje odobrenje pre slanja.')),
          h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/mejlovi/podesavanja');}}, m.client?'Promeni za ovog klijenta':'Promeni podešavanje')));
    // PhMb10/PhMb11: na telefonu frejm stavlja desnu kolonu ("Šta sam uradio") PRE "Mejl banke" (potvrđeno
    // raw HTML-om — obrnut dokument-redosled u odnosu na desktop).
    return h(React.Fragment,null, isMobile ? [right,left] : [left,right]);
  }

  function ApprovalDetail(props){
    const { m, isMobile } = props;
    const left = h('div',{key:'left', className:'mb-detail-left'}, h(MejlCard,{m}));
    const right = h('div',{key:'right', className:'mb-detail-right'},
        h('div',{className:'mb-card'},
          h('span',{style:{fontSize:'1.25rem'}},'Šta sam uradio'),
          h(CheckRow,{text:'Pročitao sam mejl: banka traži tri dokumenta za priliv od '+fmtMoneyCode(m.amount,m.currency)+'.'}),
          h(CheckRow,{text:'Povezao sam uplatu sa fakturom '+(m.invoice?m.invoice.number:'–')+' ('+(m.client?m.client.name:'–')+').'}),
          h(CheckRow,{text:'Pripremio sam fakturu, raspored priliva i nalog za prodaju deviza.'})),
        h('div',{className:'mb-card'},
          h('span',{style:{fontSize:'1.25rem'}},'Kome vraćam'),
          h('div',{style:{display:'flex', flexDirection:'column', gap:6}},
            h('span',{className:'faint', style:{fontSize:'0.875rem'}},'Adresa za odgovor'),
            h('div',{className:'mb-reply-box'}, h('span',{className:'addr'}, m.replyTo),
              h('a',{href:'#', onClick:(e)=>{e.preventDefault(); store.toast('Izmena adrese za odgovor nije podržana u prototipu.');}},'Izmeni'))),
          h('div',{style:{display:'flex', gap:10, fontSize:'0.875rem', color:'var(--text-muted)'}},
            h(Icons.alert,{width:16,height:16, style:{flexShrink:0, color:'var(--status-sent-text)'}}),
            h('span',null,'Našao sam je u tekstu mejla. Pošiljalac je '+m.sender+', ali banka traži da se dokumenta pošalju na ovu drugu adresu.'))),
        h('div',{className:'mb-card'},
          h('span',{style:{fontSize:'1.25rem'}},'Slanje'),
          h('span',null,'Za '+(m.client?m.client.name:'nepoznatog pošiljaoca')+' tražim tvoje odobrenje pre slanja.'),
          h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/mejlovi/podesavanja');}},'Promeni za ovog klijenta')));
    // PhMb3: telefon stavlja desnu kolonu PRE "Mejl banke" (potvrđeno raw HTML-om, isto za sve 4 varijante detalja).
    return h(React.Fragment,null, isMobile ? [right,left] : [left,right]);
  }

  function NoInvoiceDetail(props){
    const { m, isMobile } = props;
    const s = useStore();
    const [mode,setMode] = useState('make_invoice');
    const [clientChoice,setClientChoice] = useState('new');
    const [existingClientId,setExistingClientId] = useState('');
    const [invoiceId,setInvoiceId] = useState('');
    const openInvoices = s.invoices.filter(i=>i.status==='Poslata');
    function submit(){
      let r;
      if(mode==='make_invoice'){
        const data = clientChoice==='new' ? {clientName:m.senderName} : {clientId:existingClientId};
        r = BM.resolveNoInvoice(m.id, 'make_invoice', data);
      } else if(mode==='existing_invoice'){
        if(!invoiceId) return;
        r = BM.resolveNoInvoice(m.id, 'existing_invoice', {invoiceId});
      } else {
        r = BM.resolveNoInvoice(m.id, 'reject');
      }
      if(r && r.ok===false) return;
      store.navigate('app/mejlovi');
    }
    const left = h('div',{key:'left', className:'mb-detail-left'}, h(MejlCard,{m}));
    const right = h('div',{key:'right', className:'mb-detail-right'},
      h('div',{className:'mb-alert'}, h(Icons.alert,{width:20,height:20}),
        h('div',null, h('div',{className:'t'},'Ne mogu da povežem ovaj priliv'), h('div',{className:'s'}, `Nemam fakturu na ${fmtMoneyCode(m.amount,m.currency)} za pošiljaoca ${m.senderName}. Reci mi šta da radim.`))),
      h('div',{className:'mb-card'},
        h('span',{style:{fontSize:'1.25rem'}},'Šta da uradim?'),
        h('div',Object.assign({className:'mb-radio'+(mode==='make_invoice'?' active':'')}, window.AIK.a11yClick(()=>setMode('make_invoice'))), h('span',{className:'dot'}),
          h('div',{style:{flex:1}}, h('div',null,'Napravi fakturu za ovaj priliv'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Izaberi klijenta, a ostalo popunjavam iz njegovog profila.'),
            mode==='make_invoice' ? h('div',{style:{marginTop:10, display:'flex', gap:8, flexWrap:'wrap'}},
              h('select',{className:'select', value:clientChoice, onChange:e=>setClientChoice(e.target.value)},
                h('option',{value:'new'}, m.senderName+' (novi klijent)'),
                s.clients.map(c=>h('option',{key:c.id, value:c.id}, c.name))),
              clientChoice!=='new' ? null : null) : null)),
        h('div',Object.assign({className:'mb-radio'+(mode==='existing_invoice'?' active':'')}, window.AIK.a11yClick(()=>setMode('existing_invoice'))), h('span',{className:'dot'}),
          h('div',{style:{flex:1}}, h('div',null,'Poveži sa postojećom fakturom'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Izaberi neku od faktura koje čekaju uplatu.'),
            mode==='existing_invoice' ? h('select',{className:'select', style:{marginTop:10}, value:invoiceId, onChange:e=>setInvoiceId(e.target.value)},
              h('option',{value:''},'Izaberi fakturu'), openInvoices.map(i=>h('option',{key:i.id, value:i.id}, i.number+' · '+U.fmtMoney(U.invoiceTotal(i), i.currency)))) : null)),
        h('div',Object.assign({className:'mb-radio'+(mode==='reject'?' active':'')}, window.AIK.a11yClick(()=>setMode('reject'))), h('span',{className:'dot'}),
          h('div',null, h('div',null,'Nije moj priliv'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Ignorišem mejl i ne šaljem ništa banci.'))),
        h('div',{style:{marginTop:8}}, h(Button,{onClick:submit, disabled:mode==='existing_invoice'&&!invoiceId},'Nastavi'))));
    return h(React.Fragment,null, isMobile ? [right,left] : [left,right]);
  }

  function ExtraDocDetail(props){
    const { m, isMobile } = props;
    const [text,setText] = useState('Poštovani, u prilogu dostavljam traženu potvrdu o poreklu sredstava za priliv od '+U.fmtDate(m.relatedDate||m.receivedAt));
    const left = h('div',{key:'left', className:'mb-detail-left'}, h(MejlCard,{m}));
    const right = h('div',{key:'right', className:'mb-detail-right'},
      h('div',{className:'mb-alert'}, h(Icons.alert,{width:20,height:20}),
        h('div',null, h('div',{className:'t'},'Ovo nije standardan obrazac'), h('div',{className:'s'},'Banka traži potvrdu o poreklu sredstava, rok je '+(m.deadlineDays||5)+' radnih dana. Ovo ne mogu da popunim sam.'))),
      h('div',{className:'mb-card'},
        h('span',{style:{fontSize:'1.25rem'}},'Odgovori banci'),
        h('label',{className:'mb-upload-zone'},
          h(Icons.uploadArrow,{width:22,height:22}),
          h('span',null,'Priloži dokument'),
          h('span',{className:'faint', style:{fontSize:'0.875rem'}},'Na primer ugovor ili faktura'),
          h('input',{type:'file', style:{display:'none'}})),
        h(Field,{label:'Odgovor banci'}, h('textarea',{className:'input', rows:3, value:text, onChange:e=>setText(e.target.value)})),
        h('p',{className:'faint', style:{fontSize:'0.875rem'}},'Odgovor šaljem na '+m.replyTo+', kako piše u mejlu.'),
        h(Button,{onClick:()=>{ BM.respondExtraDoc(m.id); store.navigate('app/mejlovi'); }},'Pošalji odgovor')));
    return h(React.Fragment,null, isMobile ? [right,left] : [left,right]);
  }

  // ===================== Pregled i odobrenje (Mb4/Mb12) =====================
  function DocPreview(props){
    const { kind, m, sellPercent } = props;
    const s = useStore();
    // "Faktura" tab: nijedan Mb/PhMb frejm ne prikazuje ovaj tab selektovan, pa nema sopstveni layout
    // definisan za Mejlovi banke — umesto izmišljenog teksta, ponovo koristim POSTOJEĆI InvoiceDoc
    // (ista komponenta kao Fak21 "Kako je klijent vidi" i live-pregled pri izradi fakture), jer je to
    // već frejmom definisan izgled fakture kao dokumenta.
    if(kind==='faktura'){
      const inv = m.invoice;
      if(!inv) return h('div',{className:'mb-doc-pdf'},
        h('div',{style:{textTransform:'uppercase', letterSpacing:'0.04em', fontWeight:500}},'Faktura'),
        h('p',{className:'faint'},'Faktura još nije povezana.'));
      const account = s.accounts.find(a=>a.id===inv.accountId);
      return h('div',{className:'inv-preview-paper'}, h(window.AIK.InvoiceDoc,{invoice:inv, client:m.client, business:s.business, account}));
    }
    // Mb4/Mb10/Mb12: "Raspored priliva" i "Nalog za prodaju deviza" dele ISTI obrazac-šablon — potvrđeno raw
    // HTML-om oba frejma, znak-po-znak isti (naslov+datum red, Nalogodavac/Banka dvokolonski blok, uokvirena
    // tabela 0.75rem redova, potpis na dnu) — NIJE prost `.inv-kv` spisak kako je kod ranije imao.
    function DocRow(k,v){ return h('div',{className:'mb-doc-row'}, h('span',null,k), h('b',null,v)); }
    function DocTemplate(title, rows){
      return h('div',{className:'mb-doc-pdf'},
        h('div',{style:{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}},
          h('b',{style:{fontSize:'1rem'}}, title), h('span',null,'Datum: '+U.fmtDate(m.receivedAt))),
        h('div',{style:{display:'flex', justifyContent:'space-between', gap:16}},
          h('div',null, h('b',null,'Nalogodavac:'), h('br'),'STEFAN MILOSEVIC STEPHORTLESS', h('br'),'PIB: 123456789'),
          h('div',null, h('b',null,'Banka:'), h('br'),'Erste Bank', h('br'),'IBAN: RS35 1234 5678 9012 3456 78')),
        h('div',{className:'mb-doc-table'}, rows),
        h('span',{style:{marginTop:'auto'}},'Potpis: Stefan Milošević'));
    }
    if(kind==='raspored') return DocTemplate('RASPORED PRILIVA', [
      DocRow('Iznos priliva', fmtMoneyCode(m.amount,m.currency)),
      DocRow('Pošiljalac', m.client?m.client.name:m.senderName),
      DocRow('Faktura br.', m.invoice?m.invoice.number:'–'),
      DocRow('Osnov priliva','Usluge razvoja sajta'),
      DocRow('Šifra osnova','Izvoz usluga')]);
    const sold = sellPercent!=null ? Math.round(m.amount*sellPercent)/100 : m.amount;
    return DocTemplate('NALOG ZA PRODAJU DEVIZA', [
      DocRow('Valuta', m.currency),
      DocRow('Priliv', n2(m.amount)),
      DocRow(sellPercent!=null?('Iznos za prodaju ('+sellPercent+' %)'):'Iznos za prodaju', n2(sold)),
      DocRow('Ostaje na deviznom računu', n2(m.amount-sold)),
      DocRow('Račun za priliv dinara','RS35 •••• 1122 33'),
      DocRow('Kurs','Po kursu banke')]);
  }

  function ApproveSendPanel(props){
    const { m, onClose, onSent } = props;
    const isMobile = useIsMobile();
    const sendLabel = isMobile ? 'Odobri i pošalji' : 'Odobri i pošalji banci';
    const client = m.client;
    const effMode = BM.effectiveFxMode(client);
    const [sellMode,setSellMode] = useState(m.kind==='devizni' ? effMode : 'book_only');
    const [sellPercent,setSellPercent] = useState((window.AIK.store.getState().autonomySettings.fxPercent)||50);
    const [editingPercent,setEditingPercent] = useState(false);
    // Mb4/Mb12: podrazumevani tab je "Raspored priliva", OSIM kad je prodaja delimična (sell_part) — tad je
    // "Prodaja deviza" podrazumevano aktivna (potvrđeno raw HTML-om oba frejma, #C8F169 aktivna pilula).
    const [docTab,setDocTab] = useState(m.kind==='dinarski' ? 'faktura' : (sellMode==='sell_part' ? 'prodaja' : 'raspored'));
    const [ccMe,setCcMe] = useState(true);
    const subject = 'Re: '+m.subject;
    const msg = m.kind==='dinarski'
      ? `Poštovani, u prilogu dostavljam traženu fakturu za priliv od ${fmtMoneyCode(m.amount,m.currency)} (${client?client.name:''}). Srdačan pozdrav, Stefan Milošević`
      : `Poštovani, u prilogu dostavljam traženu dokumentaciju za priliv od ${fmtMoneyCode(m.amount,m.currency)} (${client?client.name:m.senderName}): fakturu ${m.invoice?m.invoice.number:''}, raspored priliva i nalog za prodaju deviza. Srdačan pozdrav, Stefan Milošević`;
    const docs = m.kind==='dinarski' ? [['faktura','Faktura']] : [['faktura','Faktura'],['raspored','Raspored priliva'],['prodaja','Prodaja deviza']];
    function submit(){
      const r = BM.approveSend(m.id, m.kind==='devizni' ? {mode:sellMode, sellPercent} : {});
      if(r && r.ok===false) return;
      onSent();
    }
    // Mb4/Mb12: nema segmentovanog birača u ovom ekranu — režim prodaje je već odlučen u Podešavanjima
    // (globalno ili po klijentu). Kartica "Prodaja deviza" se prikazuje SAMO kod delimične prodaje
    // (kad ima šta da se potvrdi/promeni); kod "samo proknjiži" i "prodaj sve" frejm ne prikazuje ništa.
    const fxBlock = m.kind==='devizni' && sellMode==='sell_part' ? h(Field,{key:'fx', label:'Prodaja deviza'},
      editingPercent ? h('div',{className:'row', style:{gap:8, alignItems:'center', flexWrap:'wrap'}}, h('span',{className:'faint', style:{fontSize:'0.875rem'}},'Koliko prodajem'), h(Input,{type:'number', value:sellPercent, style:{width:90}, onChange:e=>setSellPercent(Number(e.target.value)||0)}), h('span',{className:'faint', style:{fontSize:'0.875rem'}},'% priliva'))
        : h('div',{style:{display:'flex', flexDirection:'column'}},
            h('div',{className:'inv-kv'}, h('span',{className:'k'},'Prodajem'), h('span',{className:'v'}, fmtMoneyCode(Math.round(m.amount*sellPercent)/100, m.currency)+' ('+sellPercent+' %)')),
            h('div',{className:'inv-kv'}, h('span',{className:'k'},'Ostaje na deviznom računu'), h('span',{className:'v'}, fmtMoneyCode(m.amount-Math.round(m.amount*sellPercent)/100, m.currency))),
            h('a',{href:'#', style:{fontSize:'0.875rem', marginTop:8}, onClick:(e)=>{e.preventDefault(); setEditingPercent(true);}},'Promeni iznos'))) : null;
    return h('div',{className:'inv-shell mb-approve-shell'},
      h('div',{className:'inv-shell-row'},
        h('div',{className:'inv-send-col mb-approve-col'},
          h('div',{className:'inv-form-topbar'},
            h('button',{className:'inv-close-pill', onClick:onClose}, h(Icons.chevronLeft,{width:18,height:18}),'Nazad'),
            h(StatusPill,{status:'Čeka tvoje odobrenje'})),
          h('div',{className:'inv-send-body'},
            h('h1',{className:'inv-form-title'},'Odobri i pošalji banci'),
            // Mb4/Mb12 (oba širine): kartica "Prodaja deviza" ide PRE polja Za/Naslov/Poruka.
            fxBlock,
            h(Field,{label:'Za'}, h(Input,{value:m.replyTo, readOnly:true}), h('span',{className:'faint', style:{fontSize:'0.875rem'}},'Adresa iz mejla banke. Pošiljalac je bio '+m.sender+'.')),
            h(Field,{label:'Naslov'}, h(Input,{value:subject, readOnly:true})),
            h(Field,{label:'Poruka'}, h('textarea',{className:'input', rows:5, defaultValue:msg})),
            h(Field,{label:'Prilozi'}, h('div',{className:'row', style:{gap:8, flexWrap:'wrap'}}, docs.map(([k,label])=> h('span',{key:k, className:'mb-attach-chip'}, h(Icons.paperclip,{width:14,height:14}), (k==='faktura'?'Faktura '+(m.invoice?m.invoice.number.replace('/','-'):''):label)+'.pdf')))),
            h('div',{className:'row', style:{gap:10, alignItems:'center'}}, h('input',{type:'checkbox', checked:ccMe, onChange:e=>setCcMe(e.target.checked)}), h('span',{style:{fontSize:'0.875rem'}},'Pošalji kopiju i meni')),
            h('div',{className:'row', style:{gap:8, flexWrap:'wrap'}}, h(Button,{variant:'secondary', onClick:onClose},'Odloži'), h(Button,{icon:Icons.send, onClick:submit},sendLabel)))),
        h('div',{className:'mb-doc-col'},
          h('div',{className:'mb-doc-stage'},
            h('div',{className:'mb-doc-stage-inner'},
              h('div',{className:'mb-doc-stage-head'}, h('span',null, isMobile?'Pregled dokumenata':'Dokumenta koja šaljem')),
              h('div',{className:'mb-doc-pill-row'}, docs.map(([k,label])=> h('button',{key:k, type:'button', className:'mb-doc-pill'+(docTab===k?' active':''), onClick:()=>setDocTab(k)}, label))),
              h(DocPreview,{kind:docTab, m, sellPercent: sellMode==='sell_part'?sellPercent:(sellMode==='sell_all'?null:undefined)}))))));
  }

  function TimelineRow(props){
    const ev = props.ev;
    const when = ev.pending ? 'Javiću ti čim odgovori' : (fmtDateU(ev.at)+' u '+new Date(ev.at).toTimeString().slice(0,5));
    return h('div',{className:'row', style:{gap:12}},
      h('span',{className:'mb-timeline-dot'+(ev.pending?' pending':'')}),
      h('div',null, h('div',null,ev.label), h('div',{className:'faint', style:{fontSize:'0.875rem'}}, when)));
  }

  function SentOverlay(props){
    const { m, onClose } = props;
    const now = new Date();
    const prepared = new Date(new Date(m.receivedAt).getTime()+60000);
    const timeline = [
      {label:'Mejl banke je stigao', at:m.receivedAt},
      {label:'Pripremio sam dokumenta', at:prepared.toISOString()},
      {label:'Ti si odobrio slanje', at:now.toISOString()},
      {label:'Poslato na '+m.replyTo, at:now.toISOString()},
      {label:'Čekam potvrdu banke', pending:true},
    ];
    const summary = `Priliv od ${fmtMoneyCode(m.amount,m.currency)} je prijavljen. Faktura ${m.invoice?m.invoice.number:''} je označena kao plaćena.`;
    // Mb5: isto kao Mb9, nema sidebar/topbar/scrim u frejmu — videti FirstTimeDialog napomenu.
    return h('div',{className:'mb-sent-card'},
        h('span',{className:'icon-circle-72'}, h(Icons.check,{width:32,height:32})),
        h('div',{style:{textAlign:'center'}},
          h('div',{style:{fontSize:'1.5rem'}},'Dokumenta su poslata banci'),
          h('p',{className:'faint'}, summary)),
        h('div',{className:'mb-card', style:{width:'100%', boxSizing:'border-box', background:'var(--surface-2)'}},
          timeline.map((ev,i)=> h(TimelineRow,{key:i, ev}))),
        h('div',{className:'row', style:{gap:12, justifyContent:'center', width:'100%'}},
          h(Button,{onClick:onClose},'Nazad na mejlove'),
          m.invoice ? h(Button,{variant:'secondary', onClick:()=>store.navigate('app/fakture/'+m.invoice.id)},'Otvori fakturu '+m.invoice.number) : null));
  }

  function DetailPage(props){
    const s = useStore();
    const isMobile = useIsMobile();
    const [reviewing,setReviewing] = useState(false);
    const [justSent,setJustSent] = useState(false);
    // Mb5: isto puna-ekranska zamena kao Mb9 — router (js/app.js) čita ovaj globalni fleg da sakrije sidebar/topbar.
    useEffect(()=>{ store.setState({mejloviSentTakeover:justSent}); return ()=>store.setState({mejloviSentTakeover:false}); }, [justSent]);
    const m = Sel.bankMailsWithMeta(s).find(x=>x.id===props.id);
    if(!m) return h(EmptyState,{icon:Icons.inbox, title:'Mejl nije pronađen.'});
    if(justSent) return h(SentOverlay,{m, onClose:()=>{ setJustSent(false); setReviewing(false); store.navigate('app/mejlovi'); }});
    if(reviewing) return h(ApproveSendPanel,{m, onClose:()=>setReviewing(false), onSent:()=>setJustSent(true)});
    const titleText = mailLabel(m)+(m.kind!=='extra_doc'&&m.client?' od '+m.client.name:(m.kind==='problem_no_invoice'||m.problem==='no_invoice'?'':''));
    const canReview = m.status==='Čeka tvoje odobrenje' && !m.problem;
    // PhMb3/6/7/10/11: mobilni header je drugačiji od desktopa (potvrđeno raw HTML-om svih 5 varijanti) —
    // "← Mejlovi banke" prost nazad-link (ne dvosegmentni breadcrumb), bedž statusa u SVOM redu (ne u istom
    // redu sa h1), i SAMO "Pregledaj dokumenta" dugme preko cele širine (bez "Odbaci" na telefonu).
    return h('div',{className:'stack mb-page', style:{gap:20}},
      isMobile ? h('a',{href:'#', style:{fontSize:'0.875rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:6}, onClick:(e)=>{e.preventDefault(); store.navigate('app/mejlovi');}}, h(Icons.chevronLeft,{width:16,height:16}), 'Mejlovi banke') :
        h('div',{style:{fontSize:'0.875rem', color:'var(--text-muted)', display:'flex', gap:6}},
        h('a',{href:'#', style:{color:'inherit'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/mejlovi');}},'Mejlovi banke'), h('span',null,'/'), h('span',null, mailLabel(m))),
      h('div',{className:'inv-detail-head'},
        h('div',{style:{display:'flex', flexDirection:'column', gap:8}},
          isMobile ? h('h1',{style:{margin:0, fontSize:'var(--fs-24-32)'}}, titleText) :
            h('h1',{style:{margin:0, fontSize:'var(--fs-24-32)', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}, titleText, h(StatusPill,{status:m.status})),
          h('p',{className:'faint', style:{margin:0}},'Erste Bank, '+timeDetail(m.receivedAt)),
          // PhMb6/PhMb7 (raw HTML): kad postoji problem (crvena alert kartica odmah ispod), mobilni header
          // NEMA bedž statusa uopšte — alert kartica ga čini suvišnim (za razliku od PhMb3/10/11 bez problema).
          (isMobile && !m.problem) ? h('div',null, h(StatusPill,{status:m.status})) : null),
        isMobile ? (canReview ? h(Button,{style:{width:'100%', height:48, fontSize:'1rem'}, onClick:()=>setReviewing(true)},'Pregledaj dokumenta') : null) :
        h('div',{className:'row', style:{gap:12}},
          !m.problem && m.status==='Čeka tvoje odobrenje' ? h(Button,{variant:'secondary', onClick:()=>{ BM.reject(m.id); store.navigate('app/mejlovi'); }},'Odbaci') : null,
          canReview ? h(Button,{onClick:()=>setReviewing(true)},'Pregledaj dokumenta') : null)),
      h('div',{className:'inv-detail-cols mb-detail-cols'},
        m.problem==='no_invoice' ? h(NoInvoiceDetail,{m, isMobile}) :
        m.problem==='extra_doc' ? h(ExtraDocDetail,{m, isMobile}) :
        m.status==='Čeka tvoje odobrenje' ? h(ApprovalDetail,{m, isMobile}) :
        h(SentDetail,{m, isMobile})));
  }

  // ===================== Podešavanja slanja (Mb8) =====================
  function SettingsScreen(){
    const s = useStore();
    const [mode,setMode] = useState(s.autonomySettings.globalMode);
    const [fx,setFx] = useState(s.autonomySettings.fxMode);
    const [pct,setPct] = useState(s.autonomySettings.fxPercent);
    function save(){ BM.updateAutonomy({globalMode:mode, fxMode:fx, fxPercent:pct}); store.navigate('app/mejlovi'); }
    // Mb8/PhMb8: frejm na desktopu je dvokolonski (levo: Šta radim + Izuzeci po klijentu; desno: Devizni
    // priliv + Tvoja adresa), 50/50 (oba flex:1) — potvrđeno sirovim HTML-om. Na telefonu prosto redom.
    return h('div',{className:'stack', style:{gap:20}},
      h('div',{className:'page-head-row'},
        h('div',{className:'page-head', style:{marginBottom:0}}, h('h1',null,'Podešavanja slanja'), h('p',null,'Kako da postupam sa mejlovima banke.')),
        h(Button,{onClick:save},'Sačuvaj')),
      h('div',{className:'mb-settings-cols'},
      h('div',{className:'mb-settings-col'},
      h('div',{className:'mb-card'},
        h('span',{style:{fontSize:'1.25rem'}},'Šta radim kad stigne mejl banke'),
        h('div',Object.assign({className:'mb-radio'+(mode==='ask'?' active':'')}, window.AIK.a11yClick(()=>setMode('ask'))), h('span',{className:'dot'}), h('div',null, h('div',null,'Tražim tvoje odobrenje'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Pripremim dokumenta, a ti pregledaš i odobriš. Preporučeno.'))),
        h('div',Object.assign({className:'mb-radio'+(mode==='auto'?' active':'')}, window.AIK.a11yClick(()=>setMode('auto'))), h('span',{className:'dot'}), h('div',null, h('div',null,'Šaljem automatski, bez pitanja'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Pripremim i odmah vratim banci. Obavestim te kad je poslato.')))),
      h('div',{className:'mb-card'},
        h('span',{style:{fontSize:'1.25rem'}},'Izuzeci po klijentu'),
        h('p',{className:'faint', style:{fontSize:'0.875rem', margin:0}},'Za klijente koje uključiš šaljem banci automatski, bez obzira na izbor iznad.'),
        s.clients.filter(c=>!c.domestic && s.invoices.some(i=>i.clientId===c.id && i.status!=='Nacrt')).sort((a,b)=>a.name.localeCompare(b.name)).map(c=> h('div',{key:c.id, className:'row', style:{justifyContent:'space-between', padding:'10px 0', borderTop:'1px solid var(--border)'}},
          h('div',{style:{display:'flex', flexDirection:'column', gap:2}}, h('span',null,c.name), h('span',{className:'faint', style:{fontSize:'0.875rem'}}, c.autoSend?'Šaljem automatski':'Tražim odobrenje')),
          h(Components.Toggle,{on:c.autoSend, onChange:v=>window.AIK.Actions.Clients.update(c.id,{autoSend:v})}))))),
      h('div',{className:'mb-settings-col'},
      h('div',{className:'mb-card'},
        h('span',{style:{fontSize:'1.25rem'}},'Devizni priliv: šta radim sa novcem'),
        h('div',Object.assign({className:'mb-radio'+(fx==='book_only'?' active':'')}, window.AIK.a11yClick(()=>setFx('book_only'))), h('span',{className:'dot'}), h('div',null, h('div',null,'Samo proknjiži, ne prodaj'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Priliv ostaje na deviznom računu. Ti kasnije biraš da li i koliko prodaješ.'))),
        h('div',Object.assign({className:'mb-radio'+(fx==='sell_part'?' active':'')}, window.AIK.a11yClick(()=>setFx('sell_part'))), h('span',{className:'dot'}), h('div',{style:{flex:1}}, h('div',null,'Prodaj deo priliva'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Ti biraš procenat ili iznos, ostatak ostaje na deviznom računu.'),
          fx==='sell_part' ? h('div',{className:'row', style:{gap:8, marginTop:8}}, h('span',{className:'faint', style:{fontSize:'0.875rem'}},'Koliko prodajem'), h(Input,{type:'number', value:pct, style:{width:90}, onChange:e=>setPct(Number(e.target.value)||0)}), h('span',{className:'faint', style:{fontSize:'0.875rem'}},'% priliva')) : null)),
        h('div',Object.assign({className:'mb-radio'+(fx==='sell_all'?' active':'')}, window.AIK.a11yClick(()=>setFx('sell_all'))), h('span',{className:'dot'}), h('div',null, h('div',null,'Prodaj ceo priliv automatski'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Sve se odmah pretvara u dinare i dinarski račun je odmah popunjen.'))),
        h('p',{className:'faint', style:{fontSize:'0.875rem'}},'Kad se prodaje, banci šaljem i nalog za prodaju deviza. Kod dinarskog priliva nema prodaje: radim samo ono što piše u mejlu banke i ceo iznos se knjiži u dinarima.')),
      h('div',{className:'mb-card'},
        h('span',{style:{fontSize:'1.25rem'}},'Tvoja adresa za prijem'),
        h('span',{style:{fontSize:'1rem', fontWeight:500}}, inboundAddress(s.business)),
        h('p',{className:'faint', style:{fontSize:'0.875rem', margin:0}},'Banka treba da šalje obrasce i na ovu adresu. Odgovaram na adresu koju banka napiše u mejlu.')))));
  }

  function MejloviScreen(props){
    const sub = props.sub || '';
    if(sub==='podesavanja') return h(SettingsScreen);
    if(sub) return h(DetailPage,{id:sub});
    return h(ListPage);
  }

  window.AIK = window.AIK || {};
  window.AIK.Screens = window.AIK.Screens || {};
  window.AIK.Screens.mejlovi = MejloviScreen;
})();
