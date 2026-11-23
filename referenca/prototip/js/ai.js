// Faza 8: AI knjigovođa (chat) — 4.1-4.5, 4.8, 6.11, 7.12. Frejmovi Ak1-Ak17 / PhAk1-PhAk17.
// Prototip bez pravog modela: AI_SCENARIOS u actions.js bira unapred napisan odgovor po scenariju i
// puni ga ŽIVIM podacima preko Sel.*/state — isti izvor kao Početna, Fakture, Porez i Kalendar (4.1, 4.8).
(function(){
  const h = React.createElement;
  const { useState, useEffect, useRef } = React;
  const U = window.AIK.Util;
  const Sel = window.AIK.Selectors;
  const store = window.AIK.store;
  const useStore = window.AIK.useStore;
  const useIsMobile = window.AIK.useIsMobile;
  const Icons = window.AIK.Icons;
  const { Button, SidePanel, Modal, Field, Input, EmptyState } = window.AIK.Components;
  const AIA = window.AIK.Actions.AI;
  const TODAY = window.AIK.Seed.TODAY;

  function timeShort(iso){
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
    if(d.toDateString()===TODAY.toDateString()) return hh;
    const yest = new Date(TODAY); yest.setDate(TODAY.getDate()-1);
    if(d.toDateString()===yest.toDateString()) return 'Juče';
    return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.';
  }
  // Tačno 3 grupe kao u frejmu (Ak10/PhAk10): "Juče" je samo prikaz vremena STAVKE unutar "Ovog meseca"
  // (isto kao "16:48"/"12.11."), nije posebna grupa — spec tekst to labavo navodi, frejm pobeđuje.
  function groupLabel(iso){
    const d = new Date(iso);
    if(d.toDateString()===TODAY.toDateString()) return 'Danas';
    if(d.getFullYear()===TODAY.getFullYear() && d.getMonth()===TODAY.getMonth()) return 'Ovog meseca';
    return 'Ranije';
  }

  // Ak1/PhAk1 raw HTML (22. krug, Korak 1): ČETIRI grupe, isto na desktopu i telefonu (2x2 mreža desktop,
  // jedna kolona telefon preko postojećeg media-upita) — stara verzija (3 grupe, desktop-only) nikad nije
  // bila frejm-potvrđena.
  const QUICK_GROUPS = [
    {h:'Moji brojevi', qs:['Koliko sam zaradio ove godine?','Ko mi duguje novac?']},
    {h:'Rokovi i porez', qs:['Šta moram da platim sledeće?','Koliko sam do limita?']},
    {h:'Fakture', qs:['Napravi fakturu za Acme','Pošalji podsetnik za kasne fakture']},
    {h:'Propisi', qs:['Da li prijavljujem priliv iz inostranstva?','Šta ako pređem limit?']},
  ];

  function AiAvatar(props){
    const size = props.size||28;
    return h('span',{className:'ai-avatar', style:{width:size, height:size}}, h(Icons.sparkle,{width:size*0.5, height:size*0.5}));
  }

  function Sources(props){
    return h('div',{className:'ai-sources'},
      h('span',{className:'ai-sources-label'},'Izvori'),
      h('div',{className:'ai-chip-row'}, props.sources.map((s,i)=> h('span',{key:i, className:'ai-source-chip'},
        h(Icons.fileText,{width:14,height:14}), s.title, h('span',{className:'yr'}, s.note)))));
  }

  function FeedbackRow(props){
    const { msg, onRate } = props;
    const [open,setOpen] = useState(false);
    if(msg.feedback){
      return h('div',{className:'ai-feedback-row'},
        h('span',{className:'ai-feedback-pill active'}, msg.feedback.useful?'Korisno':'Nije korisno'));
    }
    return h(React.Fragment,null,
      h('div',{className:'ai-feedback-row'},
        h('button',{className:'ai-feedback-pill', onClick:()=>onRate(true)},'Korisno'),
        h('button',{className:'ai-feedback-pill', onClick:()=>setOpen(true)},'Nije korisno')),
      open ? h(NotUsefulForm,{onSubmit:(reason,comment)=>{ onRate(false,reason,comment); setOpen(false); }, onSkip:()=>setOpen(false)}) : null);
  }
  function NotUsefulForm(props){
    const [reason,setReason] = useState(null);
    const [comment,setComment] = useState('');
    const REASONS = ['Netačan podatak','Nejasno objašnjenje','Nedostaje izvor','Nije ono što sam pitao','Drugo'];
    return h('div',{className:'ai-card'},
      h('span',null,'Šta nije bilo dobro?'),
      h('div',{className:'ai-chip-row'}, REASONS.map(r=> h('span',Object.assign({key:r, className:'ai-chip', style:reason===r?{borderColor:'var(--suma)'}:null}, window.AIK.a11yClick(()=>setReason(r))), r))),
      h('textarea',{className:'input', style:{minHeight:72, resize:'vertical'}, placeholder:'Dodaj komentar (nije obavezno)', value:comment, onChange:e=>setComment(e.target.value)}),
      h('div',{className:'row', style:{gap:8}},
        h(Button,{onClick:()=>props.onSubmit(reason,comment)},'Pošalji'),
        h(Button,{variant:'ghost', onClick:props.onSkip},'Preskoči')));
  }

  function ActionButtons(props){
    return h('div',{className:'ai-draft-actions'}, props.buttons.map((b,i)=> h(Button,{key:i, variant:b.kind||'secondary', onClick:()=>props.onClick(b)}, b.label)));
  }
  function runButton(convId, msgId, b){
    if(b.nav){ store.navigate(b.nav); return; }
    if(b.action==='link_invoice_prompt'){ return 'picker'; }
    AIA.runMessageAction(convId, msgId, b.action, b.payload);
  }

  function InvoicePicker(props){
    const s = useStore();
    const open = Sel.invoicesWithEffectiveStatus(s).filter(i=> (i.effectiveStatus==='Poslata'||i.effectiveStatus==='Kasni'));
    if(!open.length) return h('span',{className:'muted'},'Nema otvorenih faktura za povezivanje.');
    return h('div',{className:'ai-chip-row'}, open.slice(0,5).map(inv=> h('span',Object.assign({key:inv.id, className:'ai-chip'}, window.AIK.a11yClick(()=>props.onPick(inv.id))), inv.number+' · '+(inv.client?inv.client.name:'—'))));
  }

  function AttachmentMessage(props){
    const { msg, convId } = props;
    const [picking, setPicking] = useState(null);
    return h('div',{className:'ai-card'},
      h('span',{className:'ai-attach-label muted', style:{fontSize:'0.875rem', color:'var(--text-muted)'}},'Već u knjizi'),
      msg.rows.map((r,i)=> h('div',{key:i, className:'ai-attach-row'+(r.known?'':' unknown')},
        h('span',null, r.sub+' '+r.label), h('span',null, r.amount))),
      (()=>{ const unknownRow = msg.rows.find(r=>!r.known); if(!unknownRow) return null;
        const status = msg.rowResolved && msg.rowResolved[unknownRow.incomeId];
        if(status) return h('div',{className:'ai-resolved-note'}, h(Icons.check,{width:14,height:14}), status==='booked'?'Dodato u knjigu prihoda.':'Povezano sa fakturom.');
        if(picking==='link') return h(InvoicePicker,{onPick:(invId)=>{ AIA.runMessageAction(convId, msg.id, 'link_invoice', {incomeId:unknownRow.incomeId, invoiceId:invId}); setPicking(null); }});
        return h(ActionButtons,{buttons:[{label:'Dodaj u knjigu prihoda', kind:'primary'},{label:'Poveži sa fakturom', kind:'secondary'}],
          onClick:(b)=>{ if(b.label==='Poveži sa fakturom') setPicking('link'); else AIA.runMessageAction(convId, msg.id, 'book_unknown', {incomeId:unknownRow.incomeId}); }});
      })());
  }

  function ProactiveMessage(props){
    const { msg, convId } = props;
    const [picking, setPicking] = useState(null);
    return msg.items.map((item,idx)=>{
      const status = msg.itemResolved && msg.itemResolved[idx];
      return h('div',{key:idx, className:'ai-proactive-card'},
        h('span',null, item.title), h('span',{className:'body'}, item.body),
        status ? h('div',{className:'ai-resolved-note'}, h(Icons.check,{width:14,height:14}),'Gotovo.') :
        picking===idx ? h(InvoicePicker,{onPick:(invId)=>{ AIA.runMessageAction(convId, msg.id, 'link_invoice', Object.assign({itemIdx:idx}, item.buttons[1].payload, {invoiceId:invId})); setPicking(null); }}) :
        h(ActionButtons,{buttons:item.buttons, onClick:(b)=>{
          if(b.nav){ store.navigate(b.nav); return; }
          if(b.action==='link_invoice_prompt'){ setPicking(idx); return; }
          AIA.runMessageAction(convId, msg.id, b.action, Object.assign({itemIdx:idx}, b.payload));
        }}));
    });
  }

  function LoadingMessage(){
    const [step,setStep] = useState(0);
    useEffect(()=>{ const t1=setTimeout(()=>setStep(1),350), t2=setTimeout(()=>setStep(2),750); return ()=>{clearTimeout(t1);clearTimeout(t2);}; },[]);
    const steps = ['Čitam tvoje fakture','Sabiram uplate po datumu uplate','Proveravam limit od '+U.fmtMoney(6000000,'RSD')];
    return h('div',{className:'ai-card'},
      steps.map((s,i)=> h('div',{key:i, className:'ai-loading-step'},
        h('span',{className:'ai-loading-dot '+(i<step?'done':i===step?'active':'pending')}, i<step?h(Icons.check,{width:12,height:12}):null),
        h('span',null,s))),
      h('div',{className:'stack-sm', style:{gap:8}}, h('div',{className:'ai-skel-bar', style:{width:'92%'}}), h('div',{className:'ai-skel-bar', style:{width:'70%'}})));
  }

  function AiMessage(props){
    const s = useStore();
    const [picking, setPicking] = useState(null); // samo za kind:'action' actionKind:'link_unknown' (Ak9)
    let msg = props.msg;
    const { convId, isMobile } = props;
    // Sačuvani razgovori (seed) drže samo scenarioId — sadržaj se RAČUNA iz ŽIVOG stanja svaki put
    // (4.1, 4.8): brojevi nikad ne "zamrznu" na vrednost iz trenutka kad je razgovor nastao.
    if(msg.scenarioId && !msg.text && !msg.rows && !msg.items && AIA.AI_SCENARIOS[msg.scenarioId]){
      const content = AIA.AI_SCENARIOS[msg.scenarioId](s);
      const stateful = {}; // sačuvano stanje poruke (resolved/feedback...) nikad se ne gazi preračunatim sadržajem
      ['resolved','feedback','rowResolved','itemResolved','invoiceId'].forEach(k=>{ if(msg[k]!=null) stateful[k]=msg[k]; });
      msg = Object.assign({}, msg, content, stateful);
    }
    const k = msg.kind;
    let body;
    if(k==='loading') return h('div',{className:'ai-msg-row'}, h(AiAvatar,null), h('div',{className:'ai-msg-body'}, h(LoadingMessage,null)));
    if(k==='error'){
      return h('div',{className:'ai-msg-row'}, h(AiAvatar,null), h('div',{className:'ai-msg-body'},
        h('div',{className:'ai-error-banner'},
          h('span',null,'Veza je pukla pre nego što sam završio'),
          h('span',null,'Tvoje pitanje je sačuvano i ništa nije promenjeno u tvojim podacima. Pokušaj ponovo, a ako se ponovi, javi nam.'),
          h('div',{className:'row', style:{gap:8}}, h(Button,{onClick:()=>AIA.retry(convId,msg.id)},'Pokušaj ponovo'), h(Button,{variant:'secondary', onClick:()=>store.toast('Hvala, prijavili smo problem.')},'Javi problem')))));
    }
    if(k==='text') body = h('span',null, msg.text);
    else if(k==='data') body = h(React.Fragment,null,
      h('span',null, msg.text),
      msg.card ? h('div',{className:'ai-card'},
        h('div',{className:'ai-stat-row'}, h('span',{className:'ai-stat-label'}, msg.card.label), h('span',{className:'ai-stat-value'}, msg.card.value)),
        msg.buttons ? h(ActionButtons,{buttons:msg.buttons, onClick:(b)=>runButton(convId,msg.id,b)}) : null,
        msg.note ? h('span',{className:'muted', style:{fontSize:'0.875rem'}}, msg.note) : null) : null);
    else if(k==='list') body = h(React.Fragment,null,
      h('span',null, msg.text),
      h('div',{className:'ai-card'}, msg.rows.map((r,i)=> h('div',{key:i, className:'ai-attach-row'},
        h('span',null, r.label), h('span',null, r.value+' · '+r.status)))),
      msg.buttons ? h(ActionButtons,{buttons:msg.buttons, onClick:(b)=>runButton(convId,msg.id,b)}) : null);
    else if(k==='regulation') body = h(React.Fragment,null, h('span',null,msg.text), h(Sources,{sources:msg.sources}));
    else if(k==='scenario') body = h(React.Fragment,null,
      h('span',null, msg.text),
      h('div',{className:'grid-2', style:{display:'grid', gridTemplateColumns:'1fr', gap:12}}, msg.cases.map((c,i)=> h('div',{key:i, className:'ai-card'},
        h('span',{className:'muted', style:{fontSize:'0.875rem'}}, c.label), h('span',null, c.title), h('span',{className:'muted'}, c.body)))),
      h('div',{className:'ai-card', style:{background:'var(--surface-2)'}}, h('span',null, msg.recommendation.title), h('span',{className:'muted'}, msg.recommendation.body)),
      h(Sources,{sources:msg.sources}),
      h('span',{className:'muted', style:{fontSize:'0.875rem'}}, msg.followupQuestion),
      h('div',{className:'ai-chip-row'}, msg.chips.map(c=> h('span',Object.assign({key:c, className:'ai-chip'}, window.AIK.a11yClick(()=>AIA.sendMessage(convId,c))),c))));
    else if(k==='action' && msg.actionKind==='link_unknown'){
      body = h(React.Fragment,null, h('span',null, msg.text),
        msg.resolved ? h('div',{className:'ai-resolved-note'}, h(Icons.check,{width:14,height:14}), msg.resolved==='booked'?'Dodato u knjigu prihoda.':'Povezano sa fakturom.') :
        picking==='link' ? h(InvoicePicker,{onPick:(invId)=>{ AIA.runMessageAction(convId, msg.id, 'link_invoice', {incomeId:msg.incomeId, invoiceId:invId}); setPicking(null); }}) :
        h(ActionButtons,{buttons:[{label:'Napravi fakturu', kind:'primary'},{label:'Poveži sa postojećom', kind:'secondary'}],
          onClick:(b)=>{ if(b.label==='Poveži sa postojećom') setPicking('link'); else AIA.runMessageAction(convId, msg.id, 'book_unknown', {incomeId:msg.incomeId}); }}));
    }
    else if(k==='action'){
      const d = msg.draft;
      body = h(React.Fragment,null, h('span',null, msg.text),
        h('div',{className:'ai-draft-card'},
          h('div',{className:'ai-draft-head'}, h('span',null,'Faktura '+d.number), h('span',{className:'badge badge-draft'},d.badge)),
          h('div',{className:'inv-kv'}, h('span',{className:'k'},'Klijent'), h('span',{className:'v'}, d.clientName)),
          h('div',{className:'inv-kv'}, h('span',{className:'k'},'Stavka'), h('span',{className:'v'}, d.itemDesc)),
          h('div',{className:'inv-kv'}, h('span',{className:'k'},'Iznos'), h('span',{className:'v'}, U.fmtMoney(d.amount,d.currency))),
          h('div',{className:'inv-kv'}, h('span',{className:'k'},'Rok plaćanja'), h('span',{className:'v'}, d.dueDays+' dana')),
          msg.resolved ? h('div',{className:'ai-resolved-note'}, h(Icons.check,{width:14,height:14}), msg.resolved==='created'?'Nacrt je napravljen.':'Odbačeno.') :
          h(ActionButtons,{buttons:[{label:'Napravi fakturu', kind:'primary', action:'create_invoice'},{label:'Izmeni', kind:'secondary', action:'edit_invoice'},{label:'Odbaci', kind:'ghost', action:'discard_invoice'}],
            onClick:(b)=>{ if(b.action==='edit_invoice'){ store.navigate('app/fakture/nova'); return; } AIA.runMessageAction(convId, msg.id, b.action); }})));
    }
    else if(k==='reminder') body = h(React.Fragment,null, h('span',null, msg.text),
      msg.resolved ? h('div',{className:'ai-resolved-note'}, h(Icons.check,{width:14,height:14}),'Podsetnik je poslat.') :
      h(ActionButtons,{buttons:[{label:'Pošalji podsetnik', kind:'primary'},{label:'Kasnije', kind:'ghost'}],
        onClick:(b)=>{ if(b.label==='Kasnije') return; AIA.runMessageAction(convId, msg.id, 'send_reminder', {invoiceId:msg.invoiceId}); }}));
    else if(k==='action_history_hint') body = h('span',null, msg.text);
    else if(k==='refusal') body = h(React.Fragment,null,
      h('span',null, msg.text),
      h('span',{className:'muted', style:{fontSize:'0.875rem'}},'Mogu odmah da ti pomognem sa nečim od ovoga:'),
      h('div',{className:'ai-chip-row'}, msg.suggestions.map(sg=> h('span',Object.assign({key:sg, className:'ai-chip'}, window.AIK.a11yClick(()=>AIA.sendMessage(convId,sg))), sg))));
    else if(k==='attachment') body = h(React.Fragment,null, h('span',null, msg.text), h(AttachmentMessage,{msg, convId}));
    else if(k==='proactive') body = h(React.Fragment,null, h('span',null, msg.text), h(ProactiveMessage,{msg, convId}));
    else body = h('span',null, msg.text||'');

    return h('div',{className:'ai-msg-row'}, h(AiAvatar,null), h('div',{className:'ai-msg-body'}, body,
      (k!=='refusal' && k!=='error' && k!=='proactive') ? h(FeedbackRow,{msg, onRate:(useful,reason,comment)=>AIA.rate(convId,msg.id,useful,reason,comment)}) : null));
  }

  function UserMessage(props){
    const { msg } = props;
    return h('div',{className:'stack-sm', style:{gap:8}},
      msg.attachment ? h('div',{className:'ai-row-end'}, h('div',{className:'ai-attach-chip'}, h(Icons.fileText,{width:18,height:18}), msg.attachment.name, h('span',{className:'sz'}, msg.attachment.size))) : null,
      msg.text ? h('div',{className:'ai-row-end'}, h('div',{className:'ai-bubble-user'}, msg.text)) : null);
  }

  function Composer(props){
    const [text,setText] = useState('');
    const fileRef = useRef(null);
    const quota = props.quota;
    if(props.busy){
      // Ak12: dok odgovor "stiže", polje je zaključano — tekst zamenjen porukom, dugme za slanje postaje kvadratić.
      return h('div',{className:'ai-composer-wrap'},
        h('div',{className:'ai-composer', style:{opacity:0.6}},
          h('span',{style:{flex:1, color:'var(--text-faint)'}},'Odgovaram, sačekaj trenutak...'),
          h('span',{className:'ai-composer-send', style:{background:'var(--surface-2)'}}, h('span',{style:{width:12,height:12,borderRadius:2,background:'var(--text)'}}))),
        h('div',{className:'ai-disclaimer'},'Odgovaram samo o poslovanju. Za važne odluke proveri izvor, jer mogu da pogrešim.'));
    }
    if(props.paused){
      // 5.5: probni period istekao (ili otkazano posle roka) — AI chat traži plan, isti obrazac kao kvota.
      return h('div',{className:'ai-composer-wrap'},
        h('div',{className:'ai-quota-banner'},
          h('span',{className:'t'}, h(Icons.lock,{width:18,height:18}),'AI knjigovođa je pauziran'),
          h('span',null,'Pretplata nije aktivna. Izaberi plan da AI knjigovođa nastavi da odgovara na pitanja.'),
          h('div',{className:'row', style:{gap:8}}, h(Button,{onClick:()=>store.navigate('app/pretplata/plan')},'Izaberi plan'))),
        h('div',{className:'ai-composer', style:{opacity:0.6}}, h('span',{style:{flex:1, color:'var(--text-faint)'}},'AI knjigovođa je pauziran'),
          h('span',{className:'ai-composer-send', style:{background:'var(--border-strong)', color:'#fff'}}, h(Icons.send,{width:16,height:16}))));
    }
    if(quota.exhausted){
      return h('div',{className:'ai-composer-wrap'},
        h('div',{className:'ai-quota-banner'},
          h('span',{className:'t'}, h(Icons.clock,{width:18,height:18}),'Potrošio si poruke za danas'),
          h('span',null,'Iskoristio si 20 od 20 poruka u probnom periodu. Nove stižu sutra u 00:00, a sa planom nema dnevnog ograničenja.'),
          h('div',{className:'row', style:{gap:8}}, h(Button,{onClick:()=>store.navigate('app/pretplata')},'Izaberi plan'), h(Button,{variant:'ghost', onClick:()=>{}},'Sačekaj do sutra'))),
        h('div',{className:'ai-composer', style:{opacity:0.6}}, h('span',{style:{flex:1, color:'var(--text-faint)'}},'Poruke su potrošene za danas'),
          h('span',{className:'ai-composer-send', style:{background:'var(--border-strong)', color:'#fff'}}, h(Icons.send,{width:16,height:16}))));
    }
    function submit(){
      if(!text.trim()) return;
      props.onSend(text.trim());
      setText('');
    }
    function pickFile(e){
      const f = e.target.files && e.target.files[0]; if(!f) return;
      // Ak7 raw HTML (22. krug, Korak 1): prilog i tekst ("Šta ima u ovom izvodu?") stižu u ISTOJ korisnikovoj
      // poruci — ono što je već otkucano u polju se šalje zajedno sa prilogom, ne odbacuje se.
      props.onSend(text.trim()||null, {name:f.name, size:Math.round(f.size/1024)+' KB'});
      setText('');
      e.target.value='';
    }
    return h('div',{className:'ai-composer-wrap'},
      h('div',{className:'ai-composer'},
        h('input',{type:'file', ref:fileRef, style:{display:'none'}, onChange:pickFile}),
        h('button',{className:'ai-composer-attach', onClick:()=>fileRef.current&&fileRef.current.click(), title:'Priloži PDF izvod'}, h(Icons.paperclip,{width:18,height:18})),
        h('input',{value:text, placeholder:props.placeholder||(props.isMobile?'Pitaj me nešto...':'Pitaj o fakturama, prilivima, porezu...'), onChange:e=>setText(e.target.value), onKeyDown:e=>{ if(e.key==='Enter') submit(); }}),
        h('button',{className:'ai-composer-send', disabled:!text.trim(), onClick:submit}, h(Icons.send,{width:16,height:16}))),
      h('div',{className:'ai-disclaimer'},'Odgovaram samo o poslovanju. Za važne odluke proveri izvor, jer mogu da pogrešim.'));
  }

  function ConversationMenu(props){
    const [open,setOpen] = useState(false);
    const [confirmDelete,setConfirmDelete] = useState(false);
    const [renaming,setRenaming] = useState(false);
    const [renameValue,setRenameValue] = useState('');
    const ref = useRef(null);
    useEffect(()=>{ if(!open) return; function onDoc(e){ if(ref.current && !ref.current.contains(e.target)) setOpen(false); } document.addEventListener('mousedown',onDoc); return ()=>document.removeEventListener('mousedown',onDoc); },[open]);
    function doRename(){
      const t = renameValue.trim();
      if(t) AIA.renameConversation(props.conv.id, t);
      setRenaming(false);
    }
    return h('span',{style:{position:'relative'}, ref},
      h('button',{className:'ai-icon-btn', onClick:(e)=>{e.stopPropagation(); setOpen(v=>!v);}}, h(Icons.more,{width:18,height:18})),
      open ? h('div',{className:'ai-menu'},
        h('button',{onClick:()=>{ setRenameValue(props.conv.title); setRenaming(true); setOpen(false); }}, h(Icons.edit,{width:16,height:16}),'Preimenuj'),
        h('button',{onClick:()=>{ AIA.copyConversation(props.conv.id); setOpen(false); }}, h(Icons.copy,{width:16,height:16}),'Kopiraj razgovor'),
        h('button',{onClick:()=>{ AIA.exportPdf(props.conv.id); setOpen(false); }}, h(Icons.download,{width:16,height:16}),'Izvezi kao PDF'),
        h('button',{className:'danger', onClick:()=>{ setConfirmDelete(true); setOpen(false); }}, h(Icons.trash,{width:16,height:16}),'Obriši razgovor')) : null,
      renaming ? h(Modal,{title:'Preimenuj razgovor', onClose:()=>setRenaming(false), footer:[
          h(Button,{key:'c', variant:'secondary', onClick:()=>setRenaming(false)},'Odustani'),
          h(Button,{key:'s', onClick:doRename},'Sačuvaj')]},
        h(Field,{label:'Naziv razgovora'}, h(Input,{value:renameValue, autoFocus:true, onChange:e=>setRenameValue(e.target.value), onKeyDown:e=>{ if(e.key==='Enter') doRename(); }}))) : null,
      confirmDelete ? h(Modal,{title:'Obrisati razgovor?', onClose:()=>setConfirmDelete(false), stackedFooter:true, footer:[
          h(Button,{key:'c', variant:'secondary', onClick:()=>setConfirmDelete(false)},'Odustani'),
          h(Button,{key:'d', variant:'danger', onClick:()=>{ AIA.deleteConversation(props.conv.id); setConfirmDelete(false); if(props.onDeleted) props.onDeleted(); }},'Obriši razgovor')]},
        h('p',{style:{margin:0, color:'var(--text-muted)'}}, 'Razgovor „'+props.conv.title+'“ se trajno briše. Tvoje fakture i knjiga prihoda ostaju netaknute.')) : null);
  }

  function ActionHistoryPanel(props){
    const s = useStore();
    const list = s.aiActions.slice().reverse();
    return h(SidePanel,{title:'Šta sam radio', onClose:props.onClose, footer:h(Button,{variant:'secondary', onClick:props.onClose},'Zatvori')},
      h('p',{className:'muted', style:{marginTop:0}},'Sve što sam uradio u tvoje ime. Ono što može da se vrati ima link Vrati.'),
      list.length===0 ? h(EmptyState,{icon:Icons.robot, title:'Još nema radnji', body:'Kad potvrdiš neku radnju u razgovoru, pojaviće se ovde.'}) :
      list.map(a=> h('div',{key:a.id, className:'ai-history-item'},
        h('div',null, h('div',null,a.label), h('div',{className:'s'}, U.fmtDate(a.at)+' u '+new Date(a.at).toTimeString().slice(0,5))),
        a.undo ? h('a',{href:'#', onClick:(e)=>{e.preventDefault(); a.undo.run(); store.toast('Vraćeno.');}}, a.undo.label) : null)));
  }

  function ConversationRail(props){
    const { s, activeId, onOpen, onNew, onOpenHistory, onMenu, onItemDeleted, isMobile } = props;
    const [q,setQ] = useState('');
    const convs = s.conversations.filter(c=> !q || c.title.toLowerCase().includes(q.toLowerCase()));
    const groups = {};
    convs.forEach(c=>{ const g = groupLabel(c.updatedAt); (groups[g]=groups[g]||[]).push(c); });
    const order = ['Danas','Ovog meseca','Ranije'].filter(g=>groups[g]);
    return h('div',{className:'ai-rail'},
      h(Button,{icon:Icons.plus, onClick:onNew, style:{width:'100%'}}, 'Novi razgovor'),
      h('div',{className:'ai-rail-search'}, h(Icons.search,{width:16,height:16}), h('input',{placeholder:'Pretraži razgovore', value:q, onChange:e=>setQ(e.target.value)})),
      h('div',{className:'ai-rail-groups'}, order.map(g=> h('div',{key:g},
        h('div',{className:'ai-rail-label'}, g),
        groups[g].map(c=> h('div',Object.assign({key:c.id, className:'ai-rail-item'+(c.id===activeId?' active':'')}, window.AIK.a11yClick(()=>onOpen(c.id))),
          h('div',{className:'mid'}, h('span',{className:'t'}, c.title), h('span',{className:'s'}, timeShort(c.updatedAt))),
          c.proactive ? h('span',{className:'dot'}) :
          // Ak16/PhAk16 raw HTML (22. krug, Korak 1): "⋯"/chevron meni (Preimenuj/Kopiraj/Izvezi/Obriši) je
          // PO STAVCI u listi na OBA uređaja — ne u pane-zaglavlju (desktop nema pane-zaglavlje uopšte).
          isMobile ? h('button',{className:'ai-rail-item-menu', onClick:(e)=>{ e.stopPropagation(); onMenu(c); }}, h(Icons.chevronRight,{width:16,height:16})) :
          h(ConversationMenu,{conv:c, onDeleted:()=>onItemDeleted(c.id)})))))),
      isMobile ? h('div',{className:'ai-rail-foot'}, h(Button,{variant:'secondary', icon:Icons.robot, style:{width:'100%'}, onClick:onOpenHistory},'Šta sam radio')) : null);
  }

  function MobileConvSheet(props){
    const { conv, onClose, onDeleted } = props;
    const [renaming,setRenaming] = useState(false);
    const [renameValue,setRenameValue] = useState('');
    const [confirmDelete,setConfirmDelete] = useState(false);
    function doRename(){ const t = renameValue.trim(); if(t) AIA.renameConversation(conv.id, t); setRenaming(false); onClose(); }
    if(renaming) return h(Modal,{title:'Preimenuj razgovor', onClose:()=>{ setRenaming(false); onClose(); }, footer:[
        h(Button,{key:'c', variant:'secondary', onClick:()=>{ setRenaming(false); onClose(); }},'Odustani'),
        h(Button,{key:'s', onClick:doRename},'Sačuvaj')]},
      h(Field,{label:'Naziv razgovora'}, h(Input,{value:renameValue, autoFocus:true, onChange:e=>setRenameValue(e.target.value), onKeyDown:e=>{ if(e.key==='Enter') doRename(); }})));
    if(confirmDelete) return h(Modal,{title:'Obrisati razgovor?', onClose:()=>{ setConfirmDelete(false); onClose(); }, stackedFooter:true, footer:[
        h(Button,{key:'c', variant:'secondary', onClick:()=>{ setConfirmDelete(false); onClose(); }},'Odustani'),
        h(Button,{key:'d', variant:'danger', onClick:()=>{ AIA.deleteConversation(conv.id); setConfirmDelete(false); onClose(); if(onDeleted) onDeleted(); }},'Obriši razgovor')]},
      h('p',{style:{margin:0, color:'var(--text-muted)'}}, 'Razgovor „'+conv.title+'“ se trajno briše. Tvoje fakture i knjiga prihoda ostaju netaknute.'));
    return h(Modal,{title:h('div',{className:'stack-sm', style:{gap:2}}, h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}},'Razgovor'), h('span',{style:{fontSize:'1.25rem'}}, conv.title)), onClose},
      h('div',{className:'ai-conv-sheet'},
        h('button',{className:'ai-conv-sheet-row', onClick:()=>setRenaming(true)}, h(Icons.edit,{width:20,height:20}),'Preimenuj'),
        h('button',{className:'ai-conv-sheet-row', onClick:()=>{ AIA.copyConversation(conv.id); onClose(); }}, h(Icons.copy,{width:20,height:20}),'Kopiraj razgovor'),
        h('button',{className:'ai-conv-sheet-row', onClick:()=>{ AIA.exportPdf(conv.id); onClose(); }}, h(Icons.download,{width:20,height:20}),'Izvezi kao PDF'),
        h('button',{className:'ai-conv-sheet-row danger', onClick:()=>setConfirmDelete(true)}, h(Icons.trash,{width:20,height:20}),'Obriši razgovor')));
  }

  function ChatPane(props){
    const { s, conv, isMobile, onBack } = props;
    const quota = Sel.aiQuotaInfo(s);
    const lastMsg = conv && conv.messages.length ? conv.messages[conv.messages.length-1] : null;
    const busy = !!(lastMsg && lastMsg.role==='ai' && lastMsg.kind==='loading');
    const listRef = useRef(null);
    useEffect(()=>{ if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; },[conv && conv.messages.length]);
    const paused = Sel.subscriptionAccess(s).aiPaused;
    function send(text, attachment){
      // Ak1 (greeting bez aktivnog razgovora): klik na predloženo pitanje prvo otvara novi razgovor.
      const convId = conv ? conv.id : AIA.newConversation();
      const r = AIA.sendMessage(convId, text, attachment);
      if(!r.ok && r.reason==='quota') store.toast('Dnevna kvota poruka je potrošena.');
      if(!r.ok && r.reason==='paused') store.toast('AI knjigovođa je pauziran. Izaberi plan da nastavi.');
    }
    // Ak2/Ak5/Ak8 raw HTML (22. krug, Korak 1): desktop pane NEMA sopstveno zaglavlje — poruke počinju
    // odmah od vrha (naslov razgovora i meni su u rail-stavci, ne ovde). PhAk1/2/5/8/11 raw HTML: mobilno
    // zaglavlje NIKAD ne pokazuje naslov konkretnog razgovora — uvek generičko "AI knjigovođa" sa sparkle
    // bedžom i X desno (meni razgovora je dostupan iz liste, ne odavde).
    return h('div',{className:'ai-pane'},
      isMobile ? h('div',{className:'ai-pane-head'},
        h('div',{className:'title'}, h(AiAvatar,{size:24}), h('span',null,'AI knjigovođa')),
        h('button',{className:'ai-icon-btn', onClick:onBack}, h(Icons.x,{width:18,height:18}))) : null,
      h('div',{className:'ai-messages', ref:listRef},
        (!conv || conv.messages.length===0) ? h(Greeting,{onPick:send, isMobile}) :
        conv.messages.map(m=> m.role==='user' ? h(UserMessage,{key:m.id, msg:m}) : h(AiMessage,{key:m.id, msg:m, convId:conv.id, isMobile}))),
      conv ? h(Composer,{quota, busy, paused, isMobile, onSend:send}) : null);
  }

  function Greeting(props){
    const groups = QUICK_GROUPS;
    // 27. krug (završna provera, Korak 3): "Zdravo Stefane" je bilo hardkodovano — uživo otkriveno
    // kroz pun korisnički put (registracija kao "Petar Testović" i dalje je AI zdravio sa "Stefane").
    // Isti `U.firstNameVoc` obrazac kao Početna ("Dobar dan, Petare") i WelcomeTourModal.
    const s = useStore();
    const name = s.user && s.user.name ? U.firstNameVoc(s.user.name) : 'Stefane';
    return h('div',{className:'ai-greeting'},
      h('span',{className:'big-avatar'}, h(Icons.sparkle,{width:28,height:28})),
      h('h2',null,'Zdravo '+name+', šta da radimo?'),
      h('p',null,'Znam tvoje fakture, uplate i rokove. Pitaj me bilo šta o poslovanju.'),
      h('div',{className:'ai-quick-grid'}, groups.map(g=> h('div',{key:g.h, className:'ai-quick-card'},
        h('span',{className:'h'}, g.h), g.qs.map(q=> h('span',Object.assign({key:q, className:'q'}, window.AIK.a11yClick(()=>props.onPick(q))), q))))));
  }

  function AiScreen(props){
    const s = useStore();
    const isMobile = useIsMobile();
    const [historyOpen,setHistoryOpen] = useState(false);
    const [menuConv,setMenuConv] = useState(null);
    const activeId = props.sub || s.activeConversationId;
    const conv = s.conversations.find(c=>c.id===activeId) || null;
    useEffect(()=>{ AIA.maybeTriggerProactive(); },[]);
    useEffect(()=>{ if(props.sub && props.sub!==s.activeConversationId) store.setState({activeConversationId:props.sub}); },[props.sub]);
    function openConv(id){ store.navigate('app/ai/'+id); }
    function newConv(){ AIA.newConversation(); }
    function back(){ store.setState({activeConversationId:null}); store.navigate('app/ai'); }
    function itemDeleted(id){ if(id===activeId) back(); }
    const showRail = !isMobile || !conv;
    const showPane = !isMobile || !!conv;
    const rail = h(ConversationRail,{s, activeId, onOpen:openConv, onNew:newConv, onOpenHistory:()=>setHistoryOpen(true), onMenu:setMenuConv, onItemDeleted:itemDeleted, isMobile});
    const shell = h('div',{className:'ai-shell'},
      showRail ? (isMobile ?
        // PhAk10 raw HTML (22. krug, Korak 1): "Razgovori" sopstveno zaglavlje (bez sparkle bedža, za razliku
        // od chat-pane zaglavlja), X zatvara CEO AI odeljak (nema šta drugo da se "vrati" sa vrha liste).
        h('div',{className:'ai-rail-screen'},
          h('div',{className:'ai-pane-head'}, h('span',{style:{fontSize:'1rem'}},'Razgovori'),
            h('button',{className:'ai-icon-btn', onClick:()=>store.navigate('app/pocetna')}, h(Icons.x,{width:18,height:18}))),
          rail) :
        rail) : null,
      showPane ? h(ChatPane,{s, conv, isMobile, onBack:back}) : null,
      historyOpen ? h(ActionHistoryPanel,{onClose:()=>setHistoryOpen(false)}) : null,
      menuConv ? h(MobileConvSheet,{conv:menuConv, onClose:()=>setMenuConv(null), onDeleted:()=>{ if(menuConv.id===activeId) back(); }}) : null);
    // Ak1/Ak2 raw HTML (22. krug, Korak 1): desktop ima standardni `.page-head-row` (h1+p levo, "Šta sam
    // radio" dugme desno) IZNAD dvokolonskog rasporeda — isti obrazac kao svaki drugi glavni ekran. Mobilni
    // fullBleed (Razgovori/chat-pane zaglavlje) ovo zamenjuje, pa se ne dodaje na telefonu.
    if(isMobile) return shell;
    return h('div',{className:'ai-page'},
      h('div',{className:'page-head-row'},
        h('div',{className:'page-head', style:{marginBottom:0}}, h('h1',null,'AI knjigovođa'), h('p',null,'Pitaj me o fakturama, prilivima, porezu i rokovima.')),
        h(Button,{variant:'secondary', icon:Icons.robot, onClick:()=>setHistoryOpen(true)},'Šta sam radio')),
      shell);
  }

  // ===================== Brzi panel (Ak9/PhAk9): AI chat preko trenutnog ekrana, sa kontekstom =====================
  function QuickPanel(props){
    const s = useStore();
    const isMobile = useIsMobile();
    const [localConvId,setLocalConvId] = useState(null);
    useEffect(()=>{
      const id = 'qp_'+Math.random().toString(36).slice(2,9);
      const now = new Date(window.AIK.Seed.TODAY.getTime()+16*3600*1000).toISOString();
      store.setState(st=> ({conversations:[{id, title:props.contextQuestion, updatedAt:now, messages:[]}].concat(st.conversations)}));
      setLocalConvId(id);
      AIA.sendMessage(id, props.contextQuestion);
    },[]);
    const conv = s.conversations.find(c=>c.id===localConvId);
    return h(SidePanel,{title:'AI knjigovođa', onClose:props.onClose},
      h('div',{style:{display:'flex', flexDirection:'column', height:'100%'}},
        h('div',{className:'ai-messages', style:{flex:1}},
          conv ? conv.messages.map(m=> m.role==='user' ? h(UserMessage,{key:m.id, msg:m}) : h(AiMessage,{key:m.id, msg:m, convId:localConvId, isMobile})) : null),
        conv ? h(Composer,{quota:Sel.aiQuotaInfo(s), isMobile, onSend:(t,a)=>AIA.sendMessage(localConvId,t,a)}) : null,
        conv ? h('div',{style:{padding:'0 24px 16px'}}, h('a',{href:'#', onClick:(e)=>{e.preventDefault(); store.navigate('app/ai/'+localConvId); props.onClose();}},'Otvori ceo razgovor')) : null));
  }

  window.AIK = window.AIK || {};
  window.AIK.Screens = window.AIK.Screens || {};
  window.AIK.Screens.ai = AiScreen;
  window.AIK.AiQuickPanel = QuickPanel;
})();
