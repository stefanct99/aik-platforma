// Faza 11: Admin (Adm1-5/PhAdm0-5, ADMIN_SPECIFIKACIJA.md). Admin vidi samo metapodatke i zbirne
// brojke — nikad fakture, iznose, klijente, mejlove banke ni sadržaj uvoza (ADMIN_SPEC odeljak 0).
(function(){
  const h = React.createElement;
  const { useState } = React;
  const { useStore, t, Components, useIsMobile } = window.AIK;
  const { Button, EmptyState, Modal } = Components;
  const Icons = window.AIK.Icons;
  const store = window.AIK.store;
  const Sel = window.AIK.Selectors;
  const U = window.AIK.Util;

  const TABS = [
    {key:'', label:'Pregled'},
    {key:'korisnici', label:'Korisnici i pretplate'},
    {key:'dnevnik', label:'Dnevnik radnji'},
    {key:'podrska', label:'Podrška'},
  ];
  function tabRoute(key){ return key ? 'app/admin/'+key : 'app/admin'; }

  function AdminTabs(props){
    return h('div',{className:'admin-pill-row admin-tabs-row'}, TABS.map(def=>
      h('span',Object.assign({key:def.key||'pregled', className:'admin-pill'+(props.active===def.key?' active':'')},
        window.AIK.a11yClick(()=>store.navigate(tabRoute(def.key)))), def.label)));
  }

  function ComingSoon(props){
    return h(Components.Card,null, h(EmptyState,{icon:Icons.building, title:props.title+': u izradi',
      body:'Ovaj deo Admina dolazi u sledećem koraku Faze 11.'}));
  }

  // ---- Pregled (Adm1/PhAdm1) ----
  // Formula izvedena direktno iz frejma (hardkodovan SVG put u Adm1.dc.html): y = H - value*(H/(max*1.15)),
  // x = index*(W/(n-1)) — 15% zazora iznad najviše tačke da vrh linije ne dodiruje gornju ivicu kartice.
  function chartPaths(values, W, H){
    const max = Math.max.apply(null, values) || 1;
    const scale = H/(max*1.15);
    const stepX = W/(values.length-1);
    const pts = values.map((v,i)=> [Math.round(i*stepX*10)/10, Math.round((H-v*scale)*10)/10]);
    const line = pts.map((p,i)=> (i===0?'M':'L')+p[0]+','+p[1]).join(' ');
    const area = line+' L'+W+','+H+' L0,'+H+' Z';
    return {line, area};
  }

  function RegistrationsChart(props){
    const o = props.data;
    // PhAdm1 frejm: manje platno na telefonu (300x140) nego desktop (560x170) — ista formula, drugi W/H.
    const W = props.isMobile?300:560, H = props.isMobile?140:170;
    const {line, area} = chartPaths(o.registrationsByDay, W, H);
    const gridY = [1,2,3,4].map(i=> Math.round(H*i/4*10)/10);
    return h('div',{className:'admin-card', style:{flex:'1.6 1 320px', gap:16}},
      h('div',{style:{display:'flex', justifyContent:'space-between', alignItems:'baseline'}},
        h('span',{style:{fontSize:'1rem'}},'Nove registracije po danima'),
        h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}}, 'Ukupno '+o.newLast30d+' za 30 dana')),
      h('svg',{width:'100%', height:H, viewBox:'0 0 '+W+' '+H, preserveAspectRatio:'none', role:'img',
          'aria-label':'Broj novih registracija po danima, poslednjih 30 dana'},
        gridY.map((y,i)=> h('line',{key:i, x1:0, y1:y, x2:W, y2:y, style:{stroke:'var(--border)'}, strokeWidth:1})),
        h('path',{d:area, style:{fill:'var(--admin-chart-fill)'}}),
        h('path',{d:line, fill:'none', style:{stroke:'var(--primary)'}, strokeWidth:2, strokeLinejoin:'round', strokeLinecap:'round', vectorEffect:'non-scaling-stroke'})),
      h('div',{className:'admin-chart-labels'}, o.registrationsAxisLabels.map((lab,i)=> h('span',{key:i}, lab))));
  }

  function StatCard(props){
    return h('div',{className:'admin-card admin-stat-card', style:{flex:'1 1 200px'}},
      h('span',{className:'lbl'}, props.label),
      h('span',{className:'val'}, props.value),
      h('span',{className:'sub'}, props.sub));
  }

  // PhAdm1: tekst kartica je na telefonu KRAĆI (ne samo prelomljen), bez "Izvezi izveštaj"/perioda reda,
  // i vrednost je 1.5rem (ne 2rem) — videti ADMIN_PAKET2 frejm, razlika potvrđena uživo poređenjem sa
  // frejmom u run.js/preview-u.
  function statSub(o, key, isMobile){
    if(key==='total') return isMobile ? o.newLast30d+' novih za 30 dana' : o.newLast30d+' novih u poslednjih 30 dana';
    if(key==='active') return isMobile ? U.fmtNum(o.activePct,1)+'% korisnika' : U.fmtNum(o.activePct,1)+'% svih korisnika';
    if(key==='trial') return isMobile ? o.trialEndingSoon+' ističe za 7 dana' : o.trialEndingSoon+' ističe u narednih 7 dana';
    if(key==='mrr') return isMobile ? 'Mesečno, bez besplatnih' : 'Bez naloga sa besplatnim pristupom';
  }

  function FunnelCard(props){
    const f = props.funnel;
    const first = f.registration || 1;
    const rows = [['Registracija', f.registration],['Završen onboarding', f.onboarding],['Prva faktura', f.firstInvoice],['Plaćena pretplata', f.paidSub]];
    return h('div',{className:'admin-card', style:{flex:'1 1 220px', gap:16}},
      h('span',{style:{fontSize:'1rem'}}, 'Od registracije do plaćanja'),
      rows.map(([label,val],i)=> h('div',{key:i, className:'admin-funnel-row'},
        h('div',{className:'head'}, h('span',{className:'sub-muted-dark'}, label), h('span',null, val)),
        h('div',{className:'admin-bar-track'}, h('div',{className:'admin-bar-fill', style:{width:Math.round(val/first*100)+'%'}})))));
  }

  function FeatureUsageCard(props){
    const fu = props.featureUsage;
    const max = Math.max(fu.aiMessages, fu.invoices, fu.calendar, fu.bankMails);
    const rows = [['AI poruke', fu.aiMessages],['Fakture', fu.invoices],['Kalendar', fu.calendar],['Mejlovi banke', fu.bankMails]];
    return h('div',{className:'admin-card', style:{flex:'1.6 1 320px', gap:16}},
      h('div',{style:{display:'flex', flexDirection:'column', gap:2}},
        h('span',{style:{fontSize:'1rem'}}, 'Korišćenje funkcija'),
        h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}}, 'Prosek po aktivnom korisniku mesečno')),
      rows.map(([label,val],i)=> h('div',{key:i, className:'admin-feature-row'},
        h('span',{className:'label sub-muted-dark'}, label),
        h('div',{className:'admin-bar-track'}, h('div',{className:'admin-bar-fill', style:{width:Math.round(val/max*100)+'%'}})),
        h('span',{className:'value'}, U.fmtNum(val,1)))));
  }

  function AttentionCard(props){
    const o = props.data;
    const rows = [
      ['Naplata nije uspela', o.paymentFailed+' naloga', ()=>store.navigate('app/admin/korisnici')],
      ['Probni ističe za 7 dana', o.trialEndingSoon+' naloga', ()=>store.navigate('app/admin/korisnici')],
      ['Nove prijave problema', o.newSupportTickets+' prijave', ()=>store.navigate('app/admin/podrska')],
    ];
    return h('div',{className:'admin-card', style:{flex:'1 1 220px', gap:8}},
      h('span',{style:{fontSize:'1rem'}}, 'Zahteva pažnju'),
      h('div',{style:{marginTop:-4}}, rows.map(([label,val,onClick],i)=>
        h('button',{key:i, className:'admin-attention-row', onClick},
          h('span',{className:'sub-muted-dark'}, label), h('span',null, val)))));
  }

  function AdminPregled(){
    const s = useStore();
    const o = Sel.adminOverview(s);
    const isMobile = useIsMobile();
    return h('div',{className:'stack'},
      h('div',{className:'page-head-row'},
        h('div',null,
          h('h1',null,'Admin'),
          h('p',{style:{maxWidth:720}},'Pregled aplikacije. Vidiš samo zbirne brojke i podatke o pretplatama, ne fakture, iznose ni klijente korisnika.')),
        // PhAdm1: period-selektor i "Izvezi izveštaj" se ne crtaju na telefonu uopšte (nema ih u frejmu).
        isMobile ? null : h('div',{style:{display:'flex', gap:12}},
          h('span',{className:'inv-select', style:{minWidth:200, justifyContent:'space-between'}}, 'Poslednjih 30 dana', h(Icons.chevronDown,{width:16,height:16})),
          h(Button,{size:'sm', variant:'secondary', onClick:()=>store.toast('Izvezeno.')}, 'Izvezi izveštaj'))),
      h(AdminTabs,{active:''}),
      h('div',{className:'admin-cards-row admin-stats-grid'},
        h(StatCard,{label:'Ukupno korisnika', value:o.totalUsers, sub:statSub(o,'total',isMobile)}),
        h(StatCard,{label:'Aktivne pretplate', value:o.active, sub:statSub(o,'active',isMobile)}),
        h(StatCard,{label:'Probni period', value:o.trial, sub:statSub(o,'trial',isMobile)}),
        h(StatCard,{label:isMobile?'Prihod od pretplata':'Mesečni prihod od pretplata', value:o.mrrEur.toLocaleString('sr-RS')+' €', sub:statSub(o,'mrr',isMobile)})),
      h('div',{className:'admin-cards-row'}, h(RegistrationsChart,{data:o, isMobile}), h(FunnelCard,{funnel:o.funnel})),
      h('div',{className:'admin-cards-row'}, h(FeatureUsageCard,{featureUsage:o.featureUsage}), h(AttentionCard,{data:o})));
  }

  // ---- Korisnici i pretplate (Adm2/PhAdm2) ----
  const A_FILTERS = [['svi','Svi'],['probni','Probni'],['aktivna','Aktivni'],['naplata','Naplata nije uspela'],['otkazana','Otkazani']];
  function badgeClass(status){
    if(status==='aktivna' || status==='besplatno') return 'admin-badge paid';
    if(status==='probni') return 'admin-badge sent';
    if(status==='naplata') return 'admin-badge late';
    return 'admin-badge admin-badge-void';
  }
  // Spec 4.2: tačan sadržaj menija radnji po korisniku nije nacrtan ni u jednom frejmu ([PROVERITI],
  // javljeno u izveštaju) — ovde su 5 stavki iz spec teksta. "Odobri"/"Ukini besplatan pristup" su
  // stvarne (Korak 4, Round 30 nalaz 5); ostale tri (Produži probni period/Dodaj popust/Promeni plan)
  // ostaju placeholder dok se njihov izgled ne nacrta.
  function RowMenu(props){
    const { open, onClose, u, onGrant } = props;
    if(!open) return null;
    const items = u.status==='besplatno'
      ? ['Ukini besplatan pristup']
      : ['Odobri besplatan pristup','Produži probni period','Dodaj popust','Promeni plan'];
    return h(React.Fragment,null,
      h('div',{style:{position:'fixed',inset:0,zIndex:139}, onClick:onClose}),
      h('div',{className:'admin-row-menu'},
        items.map((label,i)=> h('button',{key:i, className:'sidebar-link', onClick:()=>{ onClose();
          if(label==='Odobri besplatan pristup') onGrant(u.id);
          else if(label==='Ukini besplatan pristup') window.AIK.Actions.Admin.revokeFreeAccess(u.id);
          else store.toast('Dolazi u sledećem koraku Faze 11.'); }}, label))));
  }

  function UserRow(props){
    const { u, menuOpenId, setMenuOpenId, onGrant } = props;
    return h('div',{className:'admin-table-row', style:{position:'relative'}},
      h('div',{className:'col-user'}, h('span',{className:'admin-avatar'}, u.initials),
        h('div',{className:'names'}, h('span',null, u.name), h('span',{style:{color:'var(--text-muted)', fontSize:'0.75rem'}}, u.company))),
      h('span',{className:'admin-col-plan sub-muted-dark', style:{fontSize:'0.875rem'}}, u.plan),
      h('div',{className:'admin-col-status'}, h('span',{className:badgeClass(u.status)}, u.badge)),
      h('span',{className:'admin-col-date sub-muted-dark', style:{fontSize:'0.875rem'}}, U.fmtDate(u.registered)),
      h('span',{className:'admin-col-date sub-muted-dark', style:{fontSize:'0.875rem'}}, u.activityLabel),
      h('span',{className:'admin-col-billing sub-muted-dark', style:{fontSize:'0.875rem'}}, u.nextBilling),
      h('span',{className:'admin-col-menu'}, h('button',{className:'icon-btn', onClick:()=>setMenuOpenId(menuOpenId===u.id?null:u.id)}, h(Icons.more,{width:18,height:18})),
        h(RowMenu,{open:menuOpenId===u.id, onClose:()=>setMenuOpenId(null), u, onGrant})));
  }

  function UserCard(props){
    const { u, onGrant } = props;
    const [open,setOpen] = useState(false);
    return h('div',{className:'admin-user-card', style:{position:'relative'}},
      h('div',{className:'top'}, h('span',{className:'admin-avatar'}, u.initials),
        h('div',{className:'names'}, h('span',null, u.name), h('span',{style:{color:'var(--text-muted)', fontSize:'0.875rem'}}, u.company)),
        h('button',{className:'icon-btn', style:{flex:'none'}, onClick:()=>setOpen(v=>!v)}, h(Icons.more,{width:18,height:18})),
        h(RowMenu,{open, onClose:()=>setOpen(false), u, onGrant})),
      h('div',{className:'status-row'}, h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem'}}, u.plan), h('span',{className:badgeClass(u.status)}, u.badge)),
      h('div',{className:'meta-grid'},
        h('div',null, h('span',{className:'k'},'Registrovan'), h('span',{className:'v sub-muted-dark'}, U.fmtDate(u.registered))),
        h('div',null, h('span',{className:'k'},'Aktivnost'), h('span',{className:'v sub-muted-dark'}, u.activityLabel)),
        h('div',null, h('span',{className:'k'},'Naplata'), h('span',{className:'v sub-muted-dark'}, u.nextBilling))));
  }

  // ---- Odobri besplatan pristup (Adm3/PhAdm3) ----
  function GrantAccessModal(props){
    const s = useStore();
    const isMobile = useIsMobile();
    const { initialUserId, onClose } = props;
    const candidates = s.adminData.users; // besplatni nalozi (već van ove liste) se ne nude ponovo
    const initial = initialUserId ? candidates.find(u=>u.id===initialUserId) : null;
    const [query,setQuery] = useState(initial ? initial.name+', '+initial.company : '');
    const [selected,setSelected] = useState(initial||null);
    const [pickerOpen,setPickerOpen] = useState(false);
    const [duration,setDuration] = useState('bez_roka'); // 'bez_roka' | 'do_datuma'
    const [untilDate,setUntilDate] = useState('');
    const [note,setNote] = useState('');
    const matches = query.trim() && !selected ? candidates.filter(u=> (u.name+' '+u.company).toLowerCase().includes(query.trim().toLowerCase())).slice(0,8) : [];
    function pick(u){ setSelected(u); setQuery(u.name+', '+u.company); setPickerOpen(false); }
    function submit(){
      if(!selected) return;
      const untilIso = duration==='do_datuma' && untilDate ? new Date(untilDate).toISOString() : null;
      window.AIK.Actions.Admin.grantFreeAccess({userId:selected.id, untilIso, note});
      onClose();
    }
    return h(Modal,{title:'Odobri besplatan pristup', onClose, hideClose:true, footer:[
      h(Button,{key:'c', size:'sm', variant:'secondary', onClick:onClose}, 'Otkaži'),
      h(Button,{key:'s', size:'sm', disabled:!selected, onClick:submit}, 'Odobri pristup'),
    ]},
      h('div',{className:'stack'},
        h('p',{style:{margin:0, color:'var(--text-muted)', fontSize:'0.875rem'}},
          isMobile ? 'Nalog dobija pun plan bez naplate. Ne ulazi u prihod od pretplata.' : 'Nalog dobija pun plan bez naplate. Ne ulazi u mesečni prihod u statistici.'),
        h('div',{className:'stack-sm', style:{position:'relative'}},
          h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem'}}, 'Korisnik'),
          h('input',{className:'inv-select', style:{width:'100%', boxSizing:'border-box', height:40, color:'var(--text)'},
            value:query, placeholder:'Pretraži po imenu, firmi ili emailu',
            onFocus:()=>setPickerOpen(true),
            onChange:(e)=>{ setQuery(e.target.value); setSelected(null); setPickerOpen(true); }}),
          pickerOpen && matches.length ? h(React.Fragment,null,
            h('div',{style:{position:'fixed',inset:0,zIndex:139}, onClick:()=>setPickerOpen(false)}),
            h('div',{className:'admin-row-menu', style:{top:'100%', left:0, right:0, width:'auto'}},
              matches.map(u=> h('button',{key:u.id, className:'sidebar-link', onClick:()=>pick(u)}, u.name+', '+u.company)))) : null),
        h('div',{className:'stack-sm'},
          h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem'}}, 'Plan'),
          h('div',{className:'inv-select', style:{width:'100%', boxSizing:'border-box', height:40, color:'var(--text)'}}, isMobile ? 'Pun plan' : 'Pun plan, svi delovi aplikacije')),
        h('div',{className:'stack-sm'},
          h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem'}}, 'Trajanje'),
          h('div',{style:{display:'flex', gap:8}},
            h('span',Object.assign({className:'admin-pill'+(duration==='bez_roka'?' active':'')}, window.AIK.a11yClick(()=>setDuration('bez_roka'))), 'Bez roka'),
            h('span',Object.assign({className:'admin-pill'+(duration==='do_datuma'?' active':'')}, window.AIK.a11yClick(()=>setDuration('do_datuma'))), 'Do datuma')),
          duration==='do_datuma' ? h('input',{type:'date', value:untilDate, onChange:e=>setUntilDate(e.target.value), style:{height:40, borderRadius:8, border:'1px solid var(--border-strong)', background:'var(--surface)', color:'var(--text)', padding:'0 14px'}}) : null,
          h('span',{style:{color:'var(--text-muted)', fontSize:'0.875rem'}}, isMobile ? 'Možeš da ga ukineš u bilo kom trenutku.' : 'Besplatan pristup možeš da ukineš u bilo kom trenutku.')),
        h('div',{className:'stack-sm'},
          h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem'}}, 'Interna napomena'),
          h('input',{className:'inv-select', style:{width:'100%', boxSizing:'border-box', height:40, color:'var(--text)'},
            value:note, placeholder:'npr. Partner, testira aplikaciju', onChange:e=>setNote(e.target.value)}),
          h('span',{style:{color:'var(--text-muted)', fontSize:'0.875rem'}}, isMobile ? 'Vidi samo admin.' : 'Vidi samo admin. Ne prikazuje se korisniku.'))));
  }

  const PAGE_SIZE = 8;
  function AdminKorisnici(){
    const s = useStore();
    const isMobile = useIsMobile();
    const [filter,setFilter] = useState('svi');
    const [page,setPage] = useState(0);
    const [menuOpenId,setMenuOpenId] = useState(null);
    const [grantFor,setGrantFor] = useState(undefined); // undefined=zatvoren, null=bez unapred izabranog, 'id'=red-meni
    const all = Sel.adminUsersAll(s);
    const counts = { svi: all.length };
    A_FILTERS.slice(1).forEach(([k])=> counts[k] = all.filter(u=>u.status===k).length);
    const filtered = filter==='svi' ? all : all.filter(u=>u.status===filter);
    const start = page*PAGE_SIZE;
    const pageRows = filtered.slice(start, start+PAGE_SIZE);
    function changeFilter(k){ setFilter(k); setPage(0); }
    return h('div',{className:'stack'},
      grantFor!==undefined ? h(GrantAccessModal,{initialUserId:grantFor, onClose:()=>setGrantFor(undefined)}) : null,
      h('div',{className:'page-head-row'},
        h('div',null,
          h('h1',null,'Korisnici i pretplate'),
          h('p',{style:{maxWidth:720}},'Lista svih naloga sa planom i statusom naplate. Sadržaj naloga (fakture, klijenti, mejlovi) nije vidljiv.')),
        isMobile ? null : h('div',{style:{display:'flex', gap:12}},
          h(Button,{size:'sm', variant:'secondary', onClick:()=>store.toast('Izvezeno.')}, 'Izvezi'),
          h(Button,{size:'sm', icon:Icons.plus, onClick:()=>setGrantFor(null)}, 'Odobri besplatan pristup'))),
      h(AdminTabs,{active:'korisnici'}),
      isMobile ? h(Button,{className:'btn-block', style:{height:48}, icon:Icons.plus, onClick:()=>setGrantFor(null)}, 'Odobri besplatan pristup') : null,
      isMobile ? h('div',{className:'inv-select', style:{height:40}}, h(Icons.search,{width:16,height:16}), 'Pretraži korisnike') : null,
      h('div',{style:{display:'flex', gap:16, justifyContent:'space-between', alignItems:'center', flexWrap:'wrap'}},
        h('div',{className:'admin-pill-row'}, A_FILTERS.map(([k,label])=>
          h('span',Object.assign({key:k, className:'admin-pill'+(filter===k?' active':'')}, window.AIK.a11yClick(()=>changeFilter(k))),
            label, h('span',{className:'n'}, counts[k])))),
        isMobile ? null : h('div',{style:{display:'flex', gap:8}},
          h('span',{className:'inv-select', style:{width:150, justifyContent:'space-between'}}, 'Svi planovi', h(Icons.chevronDown,{width:16,height:16})),
          h('span',{className:'inv-select', style:{width:190, justifyContent:'space-between'}}, 'Poslednja aktivnost', h(Icons.chevronDown,{width:16,height:16})))),
      isMobile ? h('div',{className:'admin-user-cards'}, pageRows.map(u=> h(UserCard,{key:u.id, u, onGrant:setGrantFor}))) : null,
      h('div',{className:'admin-table-wrap'},
        h('div',{className:'admin-table-head'},
          h('span',{className:'col-user'},'Korisnik'), h('span',{className:'admin-col-plan'},'Plan'), h('span',{className:'admin-col-status'},'Status'),
          h('span',{className:'admin-col-date'},'Registrovan'), h('span',{className:'admin-col-date'},'Aktivnost'), h('span',{className:'admin-col-billing'},'Sledeća naplata'), h('span',{className:'admin-col-menu'})),
        pageRows.map(u=> h(UserRow,{key:u.id, u, menuOpenId, setMenuOpenId, onGrant:setGrantFor}))),
      // Paginacija nije nacrtana na telefonu (PhAdm2 kanvas se prekida posle par kartica), ali 129
      // redova se mora nekako prelistati — ista kontrola kao desktop, van .admin-table-wrap da ostane
      // vidljiva i kad je tabela sakrivena na telefonu (spec 4.2 "Prikazano X od Y" + Prethodna/Sledeća).
      h('div',{className:'admin-table-foot', style: isMobile ? {border:0, padding:'4px 0'} : null},
        h('span',null, 'Prikazano '+pageRows.length+' od '+filtered.length),
        h('span',{style:{display:'flex', gap:16}},
          h('button',{disabled:page===0, onClick:()=>setPage(p=>p-1)}, 'Prethodna'),
          h('button',{className:'next', disabled:start+PAGE_SIZE>=filtered.length, onClick:()=>setPage(p=>p+1)}, 'Sledeća'))));
  }

  // ---- Dnevnik radnji (Adm4/PhAdm4) ----
  const LOG_FILTERS = [['sve','Sve radnje'],['besplatan','Besplatan pristup'],['popusti','Popusti i produženja'],['plan','Promene plana'],['izvozi','Izvozi']];
  function logTimeLabel(iso){ const d=new Date(iso); return U.fmtDate(iso)+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
  function LogRow(props){
    const { e } = props;
    return h('div',{className:'admin-table-row'},
      h('span',{className:'sub-muted-dark', style:{width:170, flex:'none', fontSize:'0.875rem'}}, logTimeLabel(e.at)),
      h('span',{style:{width:240, flex:'none'}}, e.action),
      h('span',{style:{flex:1}}, e.user),
      h('span',{className:'sub-muted-dark', style:{flex:1}}, e.detail));
  }
  function LogCard(props){
    const { e } = props;
    return h('div',{className:'admin-user-card', style:{gap:8}},
      h('span',{style:{fontSize:'1rem'}}, e.action),
      h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem'}}, e.user),
      h('span',{style:{color:'var(--text-muted)', fontSize:'0.875rem'}}, e.detail),
      h('span',{style:{color:'var(--text-muted)', fontSize:'0.875rem', borderTop:'1px solid var(--border)', paddingTop:8}}, logTimeLabel(e.at)));
  }
  function AdminDnevnik(){
    const s = useStore();
    const isMobile = useIsMobile();
    const [filter,setFilter] = useState('sve');
    const [page,setPage] = useState(0);
    const log = s.adminData.log;
    const counts = { sve: log.length };
    LOG_FILTERS.slice(1).forEach(([k])=> counts[k] = log.filter(e=>e.cat===k).length);
    const filtered = filter==='sve' ? log : log.filter(e=>e.cat===filter);
    const start = page*PAGE_SIZE;
    const pageRows = filtered.slice(start, start+PAGE_SIZE);
    function changeFilter(k){ setFilter(k); setPage(0); }
    return h('div',{className:'stack'},
      h('div',{className:'page-head-row'},
        h('div',null,
          h('h1',null,'Dnevnik radnji'),
          h('p',{style:{maxWidth:720}},'Svaka radnja admina se beleži. Zapisi se ne mogu menjati ni brisati.')),
        isMobile ? null : h('div',{style:{display:'flex', gap:12}},
          h('span',{className:'inv-select', style:{minWidth:200, justifyContent:'space-between'}}, 'Poslednjih 30 dana', h(Icons.chevronDown,{width:16,height:16})),
          h(Button,{size:'sm', variant:'secondary', onClick:()=>store.toast('Izvezeno.')}, 'Izvezi'))),
      h(AdminTabs,{active:'dnevnik'}),
      h('div',{className:'admin-pill-row'}, LOG_FILTERS.map(([k,label])=>
        h('span',Object.assign({key:k, className:'admin-pill'+(filter===k?' active':'')}, window.AIK.a11yClick(()=>changeFilter(k))),
          label, h('span',{className:'n'}, counts[k])))),
      isMobile ? h('div',{className:'admin-user-cards'}, pageRows.map(e=> h(LogCard,{key:e.id, e}))) : null,
      h('div',{className:'admin-table-wrap'},
        h('div',{className:'admin-table-head'},
          h('span',{style:{width:170, flex:'none'}},'Vreme'), h('span',{style:{width:240, flex:'none'}},'Radnja'), h('span',{style:{flex:1}},'Korisnik'), h('span',{style:{flex:1}},'Detalj')),
        pageRows.map(e=> h(LogRow,{key:e.id, e}))),
      h('div',{className:'admin-table-foot', style: isMobile ? {border:0, padding:'4px 0'} : null},
        h('span',null, 'Prikazano '+pageRows.length+' od '+filtered.length),
        h('span',{style:{display:'flex', gap:16}},
          h('button',{disabled:page===0, onClick:()=>setPage(p=>p-1)}, 'Prethodna'),
          h('button',{className:'next', disabled:start+PAGE_SIZE>=filtered.length, onClick:()=>setPage(p=>p+1)}, 'Sledeća'))));
  }

  // ---- Podrška (Adm5/PhAdm5) ----
  function ticketBadgeClass(status){
    if(status==='hitno') return 'admin-badge late';
    if(status==='reseno') return 'admin-badge paid';
    return 'admin-badge sent';
  }
  const TICKET_LABELS = { otvoreno:'Otvoreno', hitno:'Hitno', reseno:'Rešeno' };
  function TicketRow(props){
    const { tk } = props;
    // Levi panel deli red sa Ocene-AI karticom (~pola širine table-reda) — naslov se skraćuje elipsom
    // u jednom redu umesto da prelama i probije fiksnu visinu reda (isti obrazac kao Korisnici imena).
    return h('div',{className:'admin-table-row'},
      h('span',{title:tk.title, style:{flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}, tk.title),
      h('span',{className:'sub-muted-dark', style:{width:120, flex:'none', fontSize:'0.875rem'}}, tk.area),
      h('span',{className:'sub-muted-dark', style:{width:80, flex:'none', fontSize:'0.875rem'}}, tk.timeAgo),
      h('span',{style:{width:90, flex:'none', display:'flex', justifyContent:'flex-end'}}, h('span',{className:ticketBadgeClass(tk.status)}, TICKET_LABELS[tk.status])));
  }
  function TicketCard(props){
    const { tk } = props;
    return h('div',{className:'admin-user-card', style:{gap:8}},
      h('span',{style:{fontSize:'1rem'}}, tk.title),
      h('div',{style:{display:'flex', justifyContent:'space-between', alignItems:'center'}},
        h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem'}}, tk.area+' · '+tk.timeAgo),
        h('span',{className:ticketBadgeClass(tk.status)}, TICKET_LABELS[tk.status])));
  }
  function AiRatingsCard(props){
    const r = props.ratings;
    const max = Math.max(r.reasons.inaccurate, r.reasons.noAnswer, r.reasons.tooLong, r.reasons.other);
    const rows = [['Netačan podatak', r.reasons.inaccurate],['Nije odgovorio na pitanje', r.reasons.noAnswer],['Previše dugo', r.reasons.tooLong],['Drugo', r.reasons.other]];
    return h('div',{className:'admin-card', style:{flex:1, gap:16}},
      h('div',{style:{display:'flex', flexDirection:'column', gap:2}},
        h('span',{style:{fontSize:'1rem'}}, 'Ocene AI odgovora'),
        h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}}, 'Poslednjih 30 dana')),
      h('div',{style:{display:'flex', gap:24}},
        h('div',{style:{display:'flex', flexDirection:'column', gap:2}}, h('span',{style:{fontSize:'2rem', lineHeight:1.2}}, r.helpfulPct+'%'), h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}}, 'korisnih')),
        h('div',{style:{display:'flex', flexDirection:'column', gap:2}}, h('span',{style:{fontSize:'2rem', lineHeight:1.2}}, r.unhelpfulCount), h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}}, 'ocena Nije korisno'))),
      h('span',{className:'sub-muted-dark', style:{fontSize:'0.875rem'}}, 'Razlozi'),
      rows.map(([label,val],i)=> h('div',{key:i, style:{display:'flex', gap:12, alignItems:'center', fontSize:'0.875rem'}},
        h('span',{className:'sub-muted-dark', style:{width:170, flex:'none'}}, label),
        h('div',{className:'admin-bar-track', style:{flex:1}}, h('div',{className:'admin-bar-fill', style:{width:Math.round(val/max*100)+'%'}})),
        h('span',{style:{width:24, textAlign:'right', flex:'none'}}, val))));
  }
  function AdminPodrska(){
    const s = useStore();
    const isMobile = useIsMobile();
    const tickets = s.adminData.supportTickets;
    const openCount = tickets.filter(t=>t.status!=='reseno').length;
    const o = Sel.adminOverview(s);
    return h('div',{className:'stack'},
      h('div',{className:'page-head-row'},
        h('div',null,
          h('h1',null,'Podrška'),
          h('p',{style:{maxWidth:720}},'Prijave problema i ocene AI odgovora. Ocene prikazuju razlog i oblast, ne tekst razgovora.')),
        isMobile ? null : h(Button,{size:'sm', variant:'secondary', onClick:()=>store.toast('Izvezeno.')}, 'Izvezi')),
      h(AdminTabs,{active:'podrska'}),
      isMobile ? h('div',{className:'stack'},
        h('div',{style:{display:'flex', justifyContent:'space-between', alignItems:'baseline'}},
          h('span',{style:{fontSize:'1rem'}}, 'Prijave problema'),
          h('span',{style:{color:'var(--text-muted)', fontSize:'0.875rem'}}, openCount+' otvorene')),
        h('div',{className:'admin-user-cards'}, tickets.map(tk=> h(TicketCard,{key:tk.id, tk}))),
        h(AiRatingsCard,{ratings:o.aiRatings})) :
      h('div',{className:'admin-cards-row', style:{alignItems:'stretch'}},
        h('div',{className:'admin-card', style:{flex:1, gap:0, padding:0}},
          h('div',{style:{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 24px'}},
            h('span',{style:{fontSize:'1rem'}}, 'Prijave problema'),
            h('span',{style:{color:'var(--text-muted)', fontSize:'0.875rem'}}, openCount+' otvorene')),
          tickets.map(tk=> h(TicketRow,{key:tk.id, tk}))),
        h(AiRatingsCard,{ratings:o.aiRatings})));
  }

  function AdminShell(props){
    const sub = props.sub || '';
    const parts = sub.split('/');
    const tab = parts[0] || '';
    if(tab==='') return h(AdminPregled);
    if(tab==='korisnici') return h(AdminKorisnici);
    if(tab==='dnevnik') return h(AdminDnevnik);
    if(tab==='podrska') return h(AdminPodrska);
    return h(window.AIK.Screens['err-404']);
  }

  window.AIK = window.AIK || {};
  window.AIK.Screens = window.AIK.Screens || {};
  window.AIK.Screens.admin = AdminShell;
})();
