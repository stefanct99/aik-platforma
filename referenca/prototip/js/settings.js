(function(){
  const h = React.createElement;
  const { useState } = React;
  const { useStore, t, Components, useIsMobile } = window.AIK;
  const { Button, Field, Input, EmptyState, Modal, Toggle, SidePanel, Alert } = Components;
  const Icons = window.AIK.Icons;
  const store = window.AIK.store;
  const U = window.AIK.Util;
  const BizActions = window.AIK.Actions.Business;
  const DevActions = window.AIK.Actions.Dev;

  const TABS = [
    {key:'profil', label:'Profil i firma', sub:'Podaci koji idu na fakture', icon:Icons.building},
    {key:'racuni', label:'Računi', sub:'Dinarski i devizni računi', icon:Icons.wallet},
    {key:'pretplata', label:'Pretplata', sub:'Plan i naplata', icon:Icons.invoice},
    {key:'obavestenja', label:'Obaveštenja', sub:'Šta i kako te obaveštavam', icon:Icons.bell},
    {key:'povezivanje', label:'Povezivanje', sub:'Mejl banke, kalendar, izvoz', icon:Icons.inbox},
    {key:'bezbednost', label:'Bezbednost i nalog', sub:'Lozinka i prijava', icon:Icons.card},
    {key:'izgled', label:'Jezik i izgled', sub:'Jezik, formati, tema', icon:Icons.settings},
  ];

  function Panel(props){
    return h('div',{className:'settings-panel'},
      h('div',{className:'settings-panel-head'}, h('span',{className:'t'}, props.title), h('span',{className:'s'}, props.sub)),
      props.children);
  }

  function ProfilTab(){
    const s = useStore();
    const b = s.business;
    const [form,setForm] = useState({name:b.name, ownerName:b.ownerName, pib:b.pib, mb:b.mb, regDate:b.regDate, street:b.street, city:b.city, contactEmail:b.contactEmail, phone:b.phone, delatnostName:b.delatnostName, delatnostCode:b.delatnostCode});
    function set(k,v){ setForm(f=>Object.assign({},f,{[k]:v})); }
    function save(e){ e.preventDefault(); BizActions.update(form); }
    return h(Panel,{title:'Profil i firma', sub:'Ovi podaci idu na tvoje fakture i izveštaje. Menjaš ih bez ponovnog podešavanja.'},
      h('form',{onSubmit:save, className:'stack'},
        h('div',{className:'settings-row-form'},
          h(Field,{label:'Naziv firme'}, h(Input,{value:form.name, onChange:e=>set('name',e.target.value)})),
          h(Field,{label:'Ime i prezime vlasnika'}, h(Input,{value:form.ownerName, onChange:e=>set('ownerName',e.target.value)}))),
        h('div',{className:'settings-row-form'},
          h(Field,{label:'PIB'}, h(Input,{value:form.pib, maxLength:9, onChange:e=>set('pib',e.target.value.replace(/\D/g,''))})),
          h(Field,{label:'Matični broj'}, h(Input,{value:form.mb, maxLength:8, onChange:e=>set('mb',e.target.value.replace(/\D/g,''))})),
          h(Field,{label:'Datum registracije'}, h(Input,{type:'date', value:form.regDate?form.regDate.slice(0,10):'', onChange:e=>set('regDate',e.target.value)}))),
        h('div',{className:'settings-row-form'},
          h(Field,{label:'Adresa'}, h(Input,{value:`${form.street}, ${form.city}`, onChange:e=>set('street',e.target.value)})),
          h(Field,{label:'Šifra delatnosti'}, h(Input,{value:`${form.delatnostCode} ${form.delatnostName}`, readOnly:true}))),
        h('div',{className:'settings-row-form'},
          h(Field,{label:'Kontakt mejl'}, h(Input,{type:'email', value:form.contactEmail, onChange:e=>set('contactEmail',e.target.value)})),
          h(Field,{label:'Telefon'}, h(Input,{value:form.phone, onChange:e=>set('phone',e.target.value)}))),
        h('div',{className:'settings-actions'},
          h(Button,{type:'button', variant:'secondary'}, t('common.odustani')),
          h(Button,{type:'submit'}, 'Sačuvaj izmene'))
      ));
  }

  function AccountCard(props){
    const a = props.account;
    const [open,setOpen] = useState(false);
    const [confirmRemove,setConfirmRemove] = useState(false);
    const isRsd = a.type==='RSD';
    return h('div',{className:'account-card'},
      h('div',{className:'account-card-head'},
        h('span',{className:'account-card-title'}, isRsd?'Dinarski račun':'Devizni račun', h('span',{className:'account-pill'}, a.currency)),
        a.isDefault ? h('span',{className:'account-pill account-pill-default'}, 'Za fakture') : null),
      h('div',{className:'account-row'}, h('span',{className:'k'},'Banka'), h('span',{className:'v'}, a.bank)),
      isRsd ? h('div',{className:'account-row'}, h('span',{className:'k'},'Broj računa'), h('span',{className:'v'}, a.number)) :
        h(React.Fragment,null,
          h('div',{className:'account-row'}, h('span',{className:'k'},'IBAN'), h('span',{className:'v'}, a.iban)),
          h('div',{className:'account-row'}, h('span',{className:'k'},'SWIFT'), h('span',{className:'v'}, a.swift))),
      h('div',{className:'account-actions'},
        h('a',{href:'#', onClick:(e)=>{e.preventDefault(); setOpen(true);}}, 'Izmeni'),
        h('span',Object.assign({className:'danger-link'}, window.AIK.a11yClick(()=>setConfirmRemove(true))), 'Ukloni')),
      open ? h(Modal,{title:'Izmeni račun', onClose:()=>setOpen(false), footer:[
          h(Button,{key:'c', variant:'secondary', onClick:()=>setOpen(false)}, t('common.odustani')),
          h(Button,{key:'s', onClick:()=>{ BizActions.updateAccount(a.id,{}); setOpen(false); }}, t('common.sacuvaj'))]},
        h('div',{className:'stack'},
          h(Field,{label:'Banka'}, h(Input,{defaultValue:a.bank})),
          isRsd ? h(Field,{label:'Broj računa'}, h(Input,{defaultValue:a.number})) :
            h(React.Fragment,null, h(Field,{label:'IBAN'}, h(Input,{defaultValue:a.iban})), h(Field,{label:'SWIFT'}, h(Input,{defaultValue:a.swift}))))) : null,
      confirmRemove ? h(Modal,{title:'Ukloniti račun?', onClose:()=>setConfirmRemove(false), footer:[
          h(Button,{key:'c', variant:'secondary', onClick:()=>setConfirmRemove(false)}, t('common.odustani')),
          h(Button,{key:'d', variant:'danger', onClick:()=>{ BizActions.removeAccount(a.id); setConfirmRemove(false); }}, 'Ukloni')]},
        'Ukloniti '+(isRsd?'dinarski':'devizni')+' račun '+a.currency+'? Fakture koje ga koriste ostaju nepromenjene.') : null
    );
  }

  function AddAccountModal(props){
    const [type,setType] = useState('devizni');
    const [currency,setCurrency] = useState('EUR');
    const [bank,setBank] = useState('');
    const [number,setNumber] = useState('');
    const [iban,setIban] = useState('');
    const [swift,setSwift] = useState('');
    const [isDefault,setIsDefault] = useState(false);
    function save(){
      BizActions.addAccount({type: type==='RSD'?'RSD':'devizni', currency: type==='RSD'?'RSD':currency, bank, number: type==='RSD'?number:undefined, iban: type==='RSD'?undefined:iban, swift: type==='RSD'?undefined:swift, isDefault});
      props.onClose();
    }
    return h(SidePanel,{title:'Dodaj račun', onClose:props.onClose, singleActionMobile:true, footer:[
        h(Button,{key:'c', variant:'secondary', onClick:props.onClose}, t('common.odustani')),
        h(Button,{key:'s', onClick:save}, 'Sačuvaj račun')]},
      h('div',{className:'stack'},
        h('span',{style:{fontSize:'1rem', lineHeight:1.5, color:'var(--text-muted)'}}, 'Račun se pojavljuje na fakturama u izabranoj valuti.'),
        h(Field,{label:'Tip računa'}, h('div',{className:'segmented'},
          h('button',{type:'button', className:type==='RSD'?'active':'', onClick:()=>setType('RSD')}, 'Dinarski'),
          h('button',{type:'button', className:type==='devizni'?'active':'', onClick:()=>setType('devizni')}, 'Devizni'))),
        type!=='RSD' ? h(Field,{label:'Valuta'}, h('select',{className:'select', value:currency, onChange:e=>setCurrency(e.target.value)},
              ['EUR','USD','GBP','CHF'].map(c=>h('option',{key:c,value:c},c)))) : null,
        h(Field,{label:'Banka'}, h(Input,{value:bank, onChange:e=>setBank(e.target.value)})),
        type==='RSD' ? h(Field,{label:'Broj računa'}, h(Input,{value:number, onChange:e=>setNumber(e.target.value)})) :
          h(React.Fragment,null,
            h(Field,{label:'IBAN'}, h(Input,{value:iban, onChange:e=>setIban(e.target.value)})),
            h(Field,{label:'SWIFT'}, h(Input,{value:swift, onChange:e=>setSwift(e.target.value)}))),
        h('label',{className:'checkbox-row'}, h('input',{type:'checkbox', checked:isDefault, onChange:e=>setIsDefault(e.target.checked)}), h('span',null,'Podrazumevani za fakture u ovoj valuti'))
      ));
  }

  function RacuniTab(){
    const s = useStore();
    const [addOpen,setAddOpen] = useState(false);
    return h(Panel,{title:'Računi', sub:'Na fakturama se prikazuje račun koji odgovara valuti fakture.'},
      h('div',{className:'stack'}, s.accounts.map(a=> h(AccountCard,{key:a.id, account:a}))),
      h('div',{className:'settings-actions'}, h(Button,{icon:Icons.plus, onClick:()=>setAddOpen(true)}, 'Dodaj račun')),
      addOpen ? h(AddAccountModal,{onClose:()=>setAddOpen(false)}) : null);
  }

  function IzgledTab(){
    const s = useStore();
    return h(Panel,{title:'Jezik i izgled', sub:'Kako se prikazuju tekst, datumi i boje.'},
      h('div',{className:'stack'},
        h('span',{style:{fontSize:'1rem'}},'Jezik'),
        h('div',{className:'segmented'},
          h('button',{className:s.lang==='sr'?'active':'', onClick:()=>DevActions.setLang('sr')},'Srpski (latinica)'),
          h('button',{className:s.lang==='sr-cyr'?'active':'', onClick:()=>DevActions.setLang('sr-cyr')},'Srpski (ćirilica)'),
          h('button',{className:s.lang==='en'?'active':'', onClick:()=>DevActions.setLang('en')},'English')),
        h('span',{style:{fontSize:'1rem'}},'Format datuma'),
        h('div',{className:'segmented'},
          h('button',{className:s.dateFormat==='dd.mm.yyyy.'?'active':'', onClick:()=>DevActions.setDateFormat('dd.mm.yyyy.')}, U.fmtDate(window.AIK.Seed.TODAY,'dd.mm.yyyy.')),
          h('button',{className:s.dateFormat==='iso'?'active':'', onClick:()=>DevActions.setDateFormat('iso')}, U.fmtDate(window.AIK.Seed.TODAY,'iso'))),
        h('span',{style:{fontSize:'1rem'}},'Izgled'),
        h('div',{className:'segmented'},
          h('button',{className:s.theme==='light'?'active':'', onClick:()=>DevActions.setTheme('light')},'Svetli'),
          h('button',{className:s.theme==='dark'?'active':'', onClick:()=>DevActions.setTheme('dark')},'Tamni'),
          h('button',{className:s.theme==='system'?'active':'', onClick:()=>DevActions.setTheme('system')},'Kao na uređaju'))),
      h('div',{className:'settings-actions'}, h(Button,{onClick:()=>store.toast('Sačuvano.')}, 'Sačuvaj izmene')));
  }

  function PretplataTab(){
    const s = useStore();
    const sub = s.subscription;
    return h(Panel,{title:'Pretplata', sub:'Ukratko o tvom planu. Sve ostalo je u delu Pretplata.'},
      h('div',{className:'subscription-hero'},
        h('span',{className:'label'}, 'Trenutni plan'),
        h('span',{className:'plan'}, sub.status==='Aktivna'?'Sve uključeno':'Probni period'),
        h('div',{className:'progress', style:{background:'rgba(255,255,255,0.16)'}}, h('div',{style:{width:(sub.status==='Probni'?Math.round((30-sub.trialDaysLeft)/30*100):100)+'%', background:'var(--limeta)'}})),
        h('span',{className:'sub'}, sub.status==='Probni' ? `Još ${sub.trialDaysLeft} ${U.dayWord(sub.trialDaysLeft)} besplatno. Ništa se ne naplaćuje dok ne izabereš plan.` : sub.status==='Aktivna' ? 'Pretplata je aktivna.' : sub.status),
        h('div',{style:{display:'flex', gap:8, flexWrap:'wrap', paddingTop:4}}, h(Button,{size:'sm', onClick:()=>store.navigate('app/pretplata')}, 'Izaberi plan'))),
      h('div',null,
        h('div',{className:'account-row'}, h('span',{className:'k'},'Način plaćanja'), h('span',{className:'v'}, sub.paymentMethod?('•••• '+sub.paymentMethod.last4):'Nije dodat')),
        h('div',{className:'account-row'}, h('span',{className:'k'},'Sledeća naplata'), h('span',{className:'v'}, sub.nextChargeAt?U.fmtDate(sub.nextChargeAt,'dd.mm.yyyy.'):'Nema, probni period')),
        h('div',{className:'account-row'}, h('span',{className:'k'},'Računi i fakture za pretplatu'), h('span',{className:'v'}, sub.history.length?sub.history.length+' računa':'Pojaviće se ovde'))),
      h('div',{className:'subscription-note'},
        h('span',null,'Plan, kartica i otkazivanje su u delu Pretplata.'),
        h(Button,{size:'sm', variant:'secondary', onClick:()=>store.navigate('app/pretplata')}, 'Otvori Pretplatu')));
  }

  const NOTIF_ROWS = [
    ['rokovi','Rokovi za porez','Podsetnik pre isteka roka', true],
    ['kasne','Kasne fakture','Kad faktura probije rok plaćanja', true],
    ['mejl','Novi mejl banke','Kad stigne priliv ili zahtev banke', true],
    ['primetio','AI je nešto primetio','Uplata bez fakture, blizu limita', true],
    ['propisi','Promena propisa','Kad se promeni nešto što te se tiče', true],
    ['nedeljni','Nedeljni pregled','Kratak rezime svakog ponedeljka', true],
  ];
  function ObavestenjaTab(){
    const s = useStore();
    const isMobile = useIsMobile();
    if(isMobile){
      return h(Panel,{title:'Obaveštenja', sub:'Rokovi za državu uvek stižu u aplikaciji. Ovde biraš gde ti ih još šaljem.'},
        h('div',null, NOTIF_ROWS.map(([key,label,sub2])=>{
          const v = s.notifSettings[key];
          return h('div',{key, className:'notif-row-m'},
            h('div',{className:'t'}, h('div',{style:{fontSize:'1rem'}},label), h('div',{className:'faint', style:{fontSize:'0.875rem'}},sub2)),
            h('div',{className:'notif-toggles-m'},
              h('label',{className:'notif-toggle-inline'}, h(Toggle,{on:v.mail, onChange:()=>window.AIK.Actions.Settings.toggleNotif(key,'mail')}), 'Mejl'),
              h('label',{className:'notif-toggle-inline'}, h(Toggle,{on:v.push, onChange:()=>window.AIK.Actions.Settings.toggleNotif(key,'push')}), 'Push')));
        })));
    }
    return h(Panel,{title:'Obaveštenja', sub:'Rokovi za državu uvek stižu u aplikaciji. Ovde biraš gde ti ih još šaljem.'},
      h('div',null,
        h('div',{className:'notif-row notif-head'}, h('span',{style:{flex:1}},'Obaveštenje'), h('span',{className:'col'},'Mejl'), h('span',{className:'col'},'Push')),
        NOTIF_ROWS.map(([key,label,sub2])=>{
          const v = s.notifSettings[key];
          return h('div',{key, className:'notif-row'},
            h('div',{style:{flex:1}}, h('div',{style:{fontSize:'1rem'}},label), h('div',{className:'faint', style:{fontSize:'0.875rem'}},sub2)),
            h('span',{className:'col'}, h(Toggle,{on:v.mail, onChange:()=>window.AIK.Actions.Settings.toggleNotif(key,'mail')})),
            h('span',{className:'col'}, h(Toggle,{on:v.push, onChange:()=>window.AIK.Actions.Settings.toggleNotif(key,'push')})));
        })));
  }

  function PovezivanjeTab(){
    const s = useStore();
    const [copied,setCopied] = useState(null);
    const address = `${s.business.inboundSlug}-${s.business.inboundCode}@prijem.tvojaiknjigovodja.rs`;
    const calLink = `tvojaiknjigovodja.rs/cal/${s.business.inboundCode}`;
    function copy(key, val){ try{ navigator.clipboard.writeText(val); }catch(e){} setCopied(key); setTimeout(()=>setCopied(null),1500); }
    return h(Panel,{title:'Povezivanje', sub:'Šta je povezano sa tvojim nalogom.'},
      h('div',{className:'stack'},
        // Uv0 (Round 28): izgled za ovo mesto nije nacrtan, baner je ponovljen iz Uv0 — vidi izveštaj.
        !s.importState.confirmed ? h(Components.ImportBanner) : null,
        h('div',{className:'connect-card'},
          h('div',{className:'row-between'},
            h('div',null, h('div',{style:{fontSize:'1.25rem'}},'Mejlovi banke'), h('div',{className:'faint', style:{fontSize:'1rem'}},'Banka šalje obaveštenja o prilivima na ovu adresu.')),
            h('span',{className:'account-pill account-pill-default'},'Povezano')),
          h('div',{className:'copy-row'}, h('span',null,address), h('button',{className:'icon-btn', onClick:()=>copy('mail',address)}, h(copied==='mail'?Icons.check:Icons.copy,{width:18,height:18}))),
          h('a',{href:'#', style:{fontSize:'0.875rem', textDecoration:'underline'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/mejlovi/podesavanja');}},'Podešavanja slanja')),
        h('div',{className:'connect-card'},
          h('div',{className:'row-between'},
            h('div',null, h('div',{style:{fontSize:'1.25rem'}},'Kalendar'), h('div',{className:'faint', style:{fontSize:'1rem'}},'Rokovi i podsetnici u tvom Google ili Apple kalendaru.')),
            h(Toggle,{on:!!s.dev.calendarSync, onChange:(v)=>window.AIK.Actions.Settings.setCalendarSync(v)})),
          h('span',{className:'faint', style:{fontSize:'1rem'}},'Link za pretplatu na kalendar'),
          h('div',{className:'copy-row'}, h('span',null,calLink), h('button',{className:'icon-btn', onClick:()=>copy('cal',calLink)}, h(copied==='cal'?Icons.check:Icons.copy,{width:18,height:18})))),
        h('div',{className:'connect-card'},
          h('div',{className:'row-between'},
            h('div',null, h('div',{style:{fontSize:'1.25rem'}},'Izvoz podataka'), h('div',{className:'faint', style:{fontSize:'1rem'}},'Sve fakture, prihode i dokumenta u jednom paketu.')),
            h(Button,{size:'sm', variant:'secondary', onClick:()=>store.toast('Priprema paketa je počela. Stiže mejl kad bude spreman.')},'Preuzmi')))));
  }

  function ChangePasswordModal(props){
    const [p0,setP0] = useState(''); const [p1,setP1] = useState(''); const [p2,setP2] = useState('');
    const [err,setErr] = useState(null);
    function save(){
      if(p1.length<8){ setErr('Najmanje 8 znakova. Posle promene ostajemo prijavljeni samo na ovom uređaju.'); return; }
      if(p1!==p2){ setErr('Lozinke se ne poklapaju'); return; }
      window.AIK.Actions.Settings.changePassword(); props.onClose();
    }
    return h(Modal,{title:'Promeni lozinku', onClose:props.onClose, hideClose:true, singleActionMobile:true, stackedFooter:true, footer:[
        h(Button,{key:'c', variant:'secondary', onClick:props.onClose}, t('common.odustani')),
        h(Button,{key:'s', onClick:save}, 'Sačuvaj lozinku')]},
      h('div',{className:'stack'},
        h(Field,{label:'Trenutna lozinka'}, h('input',{type:'password', className:'input', value:p0, onChange:e=>setP0(e.target.value)})),
        h(Field,{label:'Nova lozinka'}, h('input',{type:'password', className:'input', value:p1, onChange:e=>setP1(e.target.value)})),
        h(Field,{label:'Ponovi novu lozinku', error:err, hint: !err?'Najmanje 8 znakova. Posle promene ostajemo prijavljeni samo na ovom uređaju.':null}, h('input',{type:'password', className:'input'+(err?' has-error':''), value:p2, onChange:e=>setP2(e.target.value)}))));
  }

  function DeleteAccountModal(props){
    const [confirm,setConfirm] = useState('');
    const isMobile = useIsMobile();
    const ok = confirm.trim()==='IZBRISI';
    return h(Modal,{title:'Izbrisati nalog?', onClose:props.onClose, hideClose:true},
      h('div',{className:'stack'},
        h('p',{className:'sub-muted-dark', style:{margin:0}}, isMobile ? 'Brišu se fakture, knjiga prihoda, dokumenta i razgovori. Izvezi podatke pre toga, jer ovo ne može da se vrati.' : 'Brišu se fakture, knjiga prihoda, dokumenta i razgovori sa AI knjigovođom. Pre toga izvezi podatke, jer ovo ne može da se vrati.'),
        h('p',{className:'sub-muted-dark', style:{margin:0}}, 'Napiši IZBRISI da potvrdiš.'),
        h(Field,{label:'Potvrda'}, h(Input,{value:confirm, onChange:e=>setConfirm(e.target.value), placeholder:'IZBRISI'})),
        h(Button,{className:'btn-block', disabled:!ok, onClick:()=>{ window.AIK.Actions.Settings.deleteAccount(); }}, 'Trajno izbriši nalog'),
        h(Button,{variant:'secondary', className:'btn-block', onClick:props.onClose}, t('common.odustani'))));
  }

  function BezbednostTab(){
    const s = useStore();
    const [pwOpen,setPwOpen] = useState(false);
    const [delOpen,setDelOpen] = useState(false);
    return h(Panel,{title:'Bezbednost i nalog', sub:'Lozinka, prijava i brisanje naloga.'},
      h('div',null,
        h('div',{className:'account-row-flex'},
          h('div',null, h('div',{style:{fontSize:'1rem'}},'Lozinka'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Poslednja promena pre 3 meseca')),
          h(Button,{size:'sm', variant:'secondary', onClick:()=>setPwOpen(true)},'Promeni')),
        h('div',{className:'account-row-flex'},
          h('div',null, h('div',{style:{fontSize:'1rem'}},'Dvostepena prijava'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Kod iz aplikacije za overu pri prijavi')),
          h(Toggle,{on:!!s.dev.twoFactor, onChange:(v)=>window.AIK.Actions.Settings.setTwoFactor(v)}))),
      h('span',{style:{fontSize:'1rem'}},'Prijavljeni uređaji'),
      h('div',null,
        h('div',{className:'account-row-flex'},
          h('div',null, h('div',{style:{fontSize:'1rem'}},'Chrome, Beograd'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Ovaj uređaj, aktivan sada')),
          h('span',{className:'account-pill account-pill-default'},'Trenutni')),
        h('div',{className:'account-row-flex'},
          h('div',null, h('div',{style:{fontSize:'1rem'}},'iPhone, Beograd'), h('div',{className:'faint', style:{fontSize:'0.875rem'}},'Pre 2 dana')),
          h('a',{href:'#', style:{fontSize:'0.875rem', textDecoration:'underline'}, onClick:(e)=>{e.preventDefault(); window.AIK.Actions.Settings.logoutDevice('iPhone');}},'Odjavi'))),
      h('div',{className:'danger-zone'},
        h('div',null, h('div',{className:'title'},'Brisanje naloga'), h('div',{style:{fontSize:'1rem', lineHeight:1.5, color:'var(--text-muted)'}},'Briše se sve: fakture, knjiga prihoda i dokumenta.')),
        h(Button,{size:'sm', variant:'secondary', onClick:()=>setDelOpen(true)},'Izbriši nalog')),
      pwOpen ? h(ChangePasswordModal,{onClose:()=>setPwOpen(false)}) : null,
      delOpen ? h(DeleteAccountModal,{onClose:()=>setDelOpen(false)}) : null);
  }

  function PlaceholderTab(props){
    return h(Panel,{title:props.title, sub:'Dolazi u narednoj fazi.'},
      h(EmptyState,{icon:Icons.settings, title:props.title+': u izradi', body:'Ovaj deo podešavanja se puni u kasnijoj fazi gradnje.'}));
  }

  function TabContent(tab){
    return tab==='profil' ? h(ProfilTab) :
      tab==='racuni' ? h(RacuniTab) :
      tab==='pretplata' ? h(PretplataTab) :
      tab==='obavestenja' ? h(ObavestenjaTab) :
      tab==='povezivanje' ? h(PovezivanjeTab) :
      tab==='bezbednost' ? h(BezbednostTab) :
      tab==='izgled' ? h(IzgledTab) :
      h(PlaceholderTab,{title: TABS.find(x=>x.key===tab).label});
  }

  function initials(name){ const p=(name||'').split(' ').filter(Boolean); return p.length?p[0][0].toUpperCase():''; }

  // Pd0 raw HTML (23. krug, Korak 1): desktop ima SOPSTVENI pregled ekran (profil-kartica + 3-kolonska
  // mreža 7 kartica ka tabovima) pre nego što se izabere bilo koji tab — isti podaci (ikona/naslov/opis)
  // kao TABS niz koji već koristi mobilni MobileSettingsList, samo prikazani i na desktopu kao landing.
  function SettingsOverview(props){
    const s = useStore();
    const b = s.business, sub = s.subscription;
    const badgeLabel = sub.status==='Probni' ? 'Probni period' : sub.status==='Otkazana' ? 'Otkazana pretplata' : sub.status==='Aktivna' ? 'Pretplata aktivna' : sub.status;
    return h('div',{className:'settings-overview'},
      h('div',{className:'settings-overview-profile'},
        h('span',{className:'avatar'}, initials(s.user.name)),
        h('div',{className:'mid'}, h('span',{className:'name'}, s.user.name), h('span',{className:'sub'}, `${b.name}, paušalac od ${U.fmtDate(b.regDate,'dd.mm.yyyy.')}`)),
        h('span',{className:'account-pill account-pill-default'}, badgeLabel)),
      h('div',{className:'settings-overview-grid'}, TABS.map(tb=> h('div',Object.assign({key:tb.key, className:'settings-overview-card'}, window.AIK.a11yClick(()=>props.onOpen(tb.key))),
        h('span',{className:'icon-circ'}, h(tb.icon,{width:20,height:20})),
        h('span',{className:'t'}, tb.label),
        h('span',{className:'s'}, tb.sub)))));
  }

  // Mobile (PhPd0/PhPd1): a card list leading to each section, not tabs — matches the design file,
  // where telefon Podešavanja is explicitly "lista pa detalj" (7.13), not the desktop tab rail.
  function MobileSettingsList(props){
    const s = useStore();
    return h('div',{className:'mobile-settings-list'},
      h('h1',null, 'Podešavanja'),
      h('div',{className:'mobile-profile-card'},
        h('span',{className:'avatar'}, initials(s.user.name)),
        h('div',{className:'name-block'}, h('span',null, s.user.name), h('span',{className:'biz'}, s.business.name))),
      h('div',{className:'mobile-settings-rows'}, TABS.map(tb=> h('button',{key:tb.key, className:'mobile-settings-row', onClick:()=>props.onOpen(tb.key)},
        h('span',{className:'icon-circ'}, h(tb.icon,{width:20,height:20})),
        h('div',{className:'mid'}, h('span',{className:'lbl'}, tb.label), h('span',{className:'sub'}, tb.sub)),
        h('span',{className:'chev'}, h(Icons.chevronRight,{width:16,height:16}))))));
  }
  function MobileSettingsDetail(props){
    return h('div',{className:'mobile-settings-detail'},
      h('button',{className:'mobile-breadcrumb', onClick:props.onBack}, h(Icons.chevronLeft,{width:16,height:16}), 'Podešavanja'),
      TabContent(props.tab));
  }

  function SettingsPage(){
    // Pd0 raw HTML (23. krug, Korak 1): desktop landing je PREGLED (nijedan tab označen aktivnim), ne
    // odmah "Profil i firma" — isto kao mobilna lista, samo prikazano pored tab-rail-a, ne umesto njega.
    const [tab,setTab] = useState(null);
    const [mobileOpen,setMobileOpen] = useState(false);
    const s = useStore();
    const isMobile = useIsMobile();
    if(isMobile){
      return mobileOpen ? h(MobileSettingsDetail,{tab, onBack:()=>setMobileOpen(false)}) :
        h(MobileSettingsList,{onOpen:(k)=>{ setTab(k); setMobileOpen(true); }});
    }
    return h('div',null,
      // Pd0-Pd10 raw HTML: isti statičan podnaslov na SVAKOM stanju (pregled i svaki tab), ne dinamički
      // "firma, paušalac od..." (taj tekst je u profil-kartici pregleda, ne u zaglavlju stranice).
      h('div',{className:'page-head'}, h('h1',null,'Podešavanja'), h('p',null,'Podaci o firmi, računi, obaveštenja i bezbednost naloga.')),
      h('div',{className:'settings-grid'},
        h('div',{className:'settings-tabs'}, TABS.map(tb=> h('button',{key:tb.key, className:'settings-tab'+(tab===tb.key?' active':''), onClick:()=>setTab(tb.key)}, h(tb.icon,{width:18,height:18}), tb.label))),
        tab ? TabContent(tab) : h(SettingsOverview,{onOpen:setTab})
      ));
  }

  window.AIK = window.AIK || {};
  window.AIK.Screens = window.AIK.Screens || {};
  window.AIK.Screens.podesavanja = SettingsPage;
})();
