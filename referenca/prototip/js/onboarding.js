(function(){
  const h = React.createElement;
  const { useState } = React;
  const { useStore, t, Components } = window.AIK;
  const { Button, Field, Input, Alert, Brand, ThemeTogglePill } = Components;
  const { HelpLink } = window.AIK.AuthShell;
  const Icons = window.AIK.Icons;
  const store = window.AIK.store;
  const Ob = window.AIK.Actions.Onboarding;

  const DELATNOSTI = [
    ['6201','Računarsko programiranje'], ['6202','Konsultantske delatnosti u vezi sa informacionom tehnologijom'],
    ['7410','Specijalizovane dizajnerske delatnosti'], ['7021','Odnosi sa javnošću i komunikacije'],
    ['7022','Konsultantske aktivnosti u vezi s poslovanjem i ostalim upravljanjem'], ['7420','Fotografske usluge'],
    ['9329','Ostale zabavne i rekreativne delatnosti'],
  ];

  function Shell(props){
    return h('div',{className:'auth-wrap aik-gradient'},
      h('div',{className:'auth-header'}, h(Brand), h('span',{className:'auth-header-right-d'}, h(HelpLink))),
      h('div',{className:'auth-card auth-card-wide onb-card'},
        h('div',{className:'stack-sm'},
          h('span',{className:'faint', style:{fontSize:'0.875rem'}}, `Korak ${props.step} od 4`),
          h('div',{className:'onb-progress'}, [1,2,3,4].map(n=> h('span',{key:n, className:n<=props.step?'done':''})))),
        h('div',{className:'auth-head'}, h('h1',{className:'auth-title'}, props.title), h('p',{className:'auth-sub'}, props.sub)),
        props.children
      ),
      h('div',{className:'auth-page-footer'},
        h('span',null,'© 2026 ', t('brand.name')), h('a',{href:'#'},'Uslovi'), h('a',{href:'#'},'Privatnost'), h('a',{href:'#'},t('common.pomoc'))),
      h(ThemeTogglePill,{className:'theme-pill-fixed'}),
      h(window.AIK.Shell.DevFab), h(window.AIK.Shell.DevMenu), h(Components.Toast)
    );
  }

  // OnbO4/TelOnbO4 (i Step1/3/4): desktop je red 50/50 (oba flex:1), telefon je kolona OBRNUTOG redosleda
  // (Nastavi gore, pun red; Nazad ispod, pun red) — frejm potvrđuje oboje, ne isti raspored na obe širine.
  function NavRow(props){
    return h('div',{className:'row onb-navrow', style:{gap:12}},
      props.onBack ? h('div',{className:'onb-navrow-back'}, h(Button,{type:'button', variant:'secondary', className:'btn-block', disabled:props.loading, onClick:props.onBack}, t('common.nazad'))) : null,
      h('div',{className:'onb-navrow-next'}, h(Button,{type:props.submit?'submit':'button', className:'btn-block'+(props.loading?' btn-loading':''), disabled:props.loading, onClick:props.onNext},
        props.loading?h(React.Fragment,null,h(Icons.clock,{width:20,height:20,className:'btn-spinner'}),props.nextLabel||'Nastavi'):(props.nextLabel||'Nastavi'))));
  }

  // Prototip ima JEDAN deljeni seed poslovni zapis (js/seed.js), nema pravog "praznog" naloga po
  // registraciji — zato bi polje PIB/Matični broj inače uvek stiglo već popunjeno demo vrednošću, do
  // tačno maxLength (9/8 cifara), pa bi ručno kucanje bez prethodnog brisanja izgledalo kao da polje
  // "ne prima unos" (Round 30, nalaz 1). Ako korisnik u OVOM onboarding toku već sačuva sopstveni PIB/MB
  // (klik Nastavi, pa Nazad), b.pib/b.mb više NISU seed vrednost — tada se ispravno vraća ono što je
  // sâm uneo. Ovo je osobina prototipa (deljeni seed), ne poslovno pravilo — zato nije u js/rules/.
  const RulesId = window.AIK.Rules.identifiers;
  function Step1(){
    const s = useStore();
    const b = s.business;
    const seedBiz = window.AIK.Seed.business;
    const [form,setForm] = useState({name:b.name,
      pib: b.pib===seedBiz.pib ? '' : b.pib,
      mb: b.mb===seedBiz.mb ? '' : b.mb,
      delatnostCode:b.delatnostCode, regDate:b.regDate?b.regDate.slice(0,10):''});
    const [errs,setErrs] = useState({});
    const [loading,setLoading] = useState(false);
    function set(k,v){ setForm(f=>Object.assign({},f,{[k]:v})); }
    function submit(e){
      e.preventDefault();
      const er = {};
      if(!form.name) er.name = 'Unesi poslovno ime';
      if(!RulesId.isValidPib(form.pib)) er.pib = 'PIB mora imati 9 cifara';
      if(!RulesId.isValidMb(form.mb)) er.mb = 'Matični broj mora imati 8 cifara';
      if(!form.regDate) er.regDate = 'Unesi datum otvaranja';
      setErrs(er);
      if(Object.keys(er).length) return;
      setLoading(true);
      setTimeout(()=>{
        const del = DELATNOSTI.find(d=>d[0]===form.delatnostCode);
        Ob.saveStep1({name:form.name, pib:form.pib, mb:form.mb, delatnostCode:form.delatnostCode, delatnostName: del?del[1]:b.delatnostName, regDate:form.regDate});
      }, 500);
    }
    return h(Shell,{step:1, title:'O tvojoj firmi', sub:'Ovi podaci idu na tvoje fakture i u knjigu prihoda.'},
      h('form',{onSubmit:submit, className:'auth-body'},
        h(Field,{label:'Poslovno ime', error:errs.name}, h(Input,{value:form.name, hasError:!!errs.name, disabled:loading, placeholder:'Poslovno ime', onChange:e=>set('name',e.target.value)})),
        h('div',{className:'row onb-pair-row', style:{gap:20}},
          h('div',{style:{flex:1, minWidth:0}}, h(Field,{label:'PIB', error:errs.pib}, h(Input,{value:form.pib, hasError:!!errs.pib, disabled:loading, placeholder:'9 cifara', maxLength:9, inputMode:'numeric', pattern:'[0-9]*', autoComplete:'off', onChange:e=>set('pib',RulesId.sanitizeDigits(e.target.value,9))}))),
          h('div',{style:{flex:1, minWidth:0}}, h(Field,{label:'Matični broj', error:errs.mb}, h(Input,{value:form.mb, hasError:!!errs.mb, disabled:loading, placeholder:'8 cifara', maxLength:8, inputMode:'numeric', pattern:'[0-9]*', autoComplete:'off', onChange:e=>set('mb',RulesId.sanitizeDigits(e.target.value,8))})))),
        h(Field,{label:'Šifra delatnosti'}, h('select',{className:'select', disabled:loading, value:form.delatnostCode, onChange:e=>set('delatnostCode',e.target.value)},
          DELATNOSTI.map(([code,name])=> h('option',{key:code, value:code}, `${code} ${name}`)))),
        h(Field,{label:'Datum otvaranja', error:errs.regDate}, h(Input,{type:'date', value:form.regDate, hasError:!!errs.regDate, disabled:loading, onChange:e=>set('regDate',e.target.value)})),
        h(Button,{type:'submit', className:'btn-block'+(loading?' btn-loading':''), disabled:loading},
          loading?h(React.Fragment,null,h(Icons.clock,{width:20,height:20,className:'btn-spinner'}),'Čuvam...'):'Nastavi')
      ));
  }

  function Step2(){
    const s = useStore();
    const b = s.business;
    const [form,setForm] = useState({street:b.street, city:b.city, zip:b.zip});
    const [logo,setLogo] = useState(b.logo);
    const [logoFile,setLogoFile] = useState(null);
    const [errs,setErrs] = useState({});
    const [loading,setLoading] = useState(false);
    function set(k,v){ setForm(f=>Object.assign({},f,{[k]:v})); }
    // Tekst pored polja kaže "do 2 MB" — STANJE_PROTOTIPA.md je nalazio da kod to nije stvarno proveravao
    // (prihvatao bi i veći fajl). Ista granica/stil poruke kao Uvoz (js/uvoz.js StepUpload).
    const LOGO_MAX_BYTES = 2*1024*1024;
    function onFile(e){
      const file = e.target.files && e.target.files[0];
      e.target.value = ''; // isti fajl ponovo izabran posle odbijanja mora opet da okine onChange
      if(!file) return;
      if(file.size > LOGO_MAX_BYTES){ store.toast('"'+file.name+'" je preko 2 MB, nije učitan.'); return; }
      setLogoFile({name:file.name, size:file.size});
      const reader = new FileReader();
      reader.onload = ()=> setLogo(reader.result);
      reader.readAsDataURL(file);
    }
    function submit(e){
      e.preventDefault();
      const er = {};
      if(!form.street) er.street = 'Unesi ulicu i broj';
      if(!form.city) er.city = 'Unesi mesto';
      if(!/^\d{5}$/.test(form.zip)) er.zip = 'Poštanski broj mora imati 5 cifara';
      setErrs(er);
      if(Object.keys(er).length) return;
      setLoading(true);
      setTimeout(()=> Ob.saveStep2({street:form.street, city:form.city, zip:form.zip, logo}), 500);
    }
    return h(Shell,{step:2, title:'Podaci za fakture', sub:'Ovo se pojavljuje na svakoj fakturi koju pošalješ.'},
      h('form',{onSubmit:submit, className:'auth-body'},
        h(Field,{label:'Ulica i broj', error:errs.street}, h(Input,{value:form.street, hasError:!!errs.street, disabled:loading, placeholder:'Ulica i broj', onChange:e=>set('street',e.target.value)})),
        h('div',{className:'row onb-pair-row', style:{gap:20}},
          h('div',{style:{flex:1, minWidth:0}}, h(Field,{label:'Mesto', error:errs.city}, h(Input,{value:form.city, hasError:!!errs.city, disabled:loading, placeholder:'Mesto', onChange:e=>set('city',e.target.value)}))),
          h('div',{style:{flex:1, minWidth:0}}, h(Field,{label:'Poštanski broj', error:errs.zip}, h(Input,{value:form.zip, hasError:!!errs.zip, disabled:loading, placeholder:'5 cifara', maxLength:5, onChange:e=>set('zip',e.target.value.replace(/\D/g,''))})))),
        h(Field,{label:'Logo (nije obavezno)'},
          logoFile ? h('div',{className:'onb-file-chip'},
            h('span',{style:{color:'var(--suma)'}}, h(Icons.fileImage,{width:18,height:18})),
            h('span',{className:'name'}, logoFile.name), h('span',{className:'size'}, Math.round(logoFile.size/1024)+' KB'),
            h('button',{type:'button', onClick:()=>{setLogo(null); setLogoFile(null);}}, h(Icons.x,{width:16,height:16}))) :
          h('label',{className:'onb-dropzone'},
            h('span',{className:'onb-dropzone-icon'}, h(Icons.upload,{width:24,height:24})),
            h('span',{style:{fontSize:'1rem'}}, 'Prevuci logo ovde ili ', h('u',null,'izaberi fajl')),
            h('span',{className:'faint', style:{fontSize:'0.875rem'}}, 'PNG ili SVG, do 2 MB. Možeš ga dodati i kasnije.'),
            h('input',{type:'file', accept:'image/png,image/svg+xml', style:{display:'none'}, onChange:onFile}))),
        h(NavRow,{onBack:()=>Ob.backStep(1), submit:true, loading, nextLabel: loading?'Čuvam...':'Nastavi'})
      ));
  }

  function Step3(){
    const s = useStore();
    const [copied,setCopied] = useState(false);
    const address = `${s.business.inboundSlug}-${s.business.inboundCode}@prijem.tvojaiknjigovodja.rs`;
    function copy(){
      try{ navigator.clipboard.writeText(address).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),1800); }); }
      catch(e){ setCopied(true); setTimeout(()=>setCopied(false),1800); }
    }
    const connected = s.session.inboxConnected;
    return h(Shell,{step:3, title:'Poveži mejlove banke', sub:'Banka ti šalje obaveštenje o svakoj uplati. Mi ga pročitamo i sami uparimo uplatu sa fakturom. Ne tražimo lozinku za e-banking.'},
      h('div',{className:'auth-body'},
        h('div',{className:'stack-sm'},
          h('span',{style:{fontSize:'0.875rem'}}, 'Tvoja adresa za prijem'),
          h('div',{className:'onb-address'},
            h('span',null, address),
            h('button',{type:'button', className:'onb-copy-btn', onClick:copy}, h(Icons.copy,{width:16,height:16}), copied?'Kopirano':'Kopiraj'))),
        h('div',{className:'stack'},
          ['Otvori mejl na koji ti stižu obaveštenja banke.','Podesi da se mejlovi banke prosleđuju na adresu iznad.','Čim stigne prvi mejl, javićemo ti ovde.'].map((txt,i)=>
            h('div',{key:i, className:'row', style:{alignItems:'flex-start', gap:12}}, h('span',{className:'onb-step-num'}, i+1), h('span',{style:{fontSize:'1rem'}}, txt)))),
        connected ?
          h('div',{className:'onb-status onb-status-ok'}, h('span',{className:'onb-step-num onb-step-num-ok'}, h(Icons.check,{width:14,height:14})), h('span',null,'Prvi mejl je stigao. Sve radi.')) :
          h('div',{className:'onb-status'}, h(Icons.inbox,{width:20,height:20, className:'onb-spin'}), h('span',{className:'sub-muted-dark'},'Čekamo prvi mejl')),
        !connected ? h(Button,{type:'button', variant:'secondary', className:'btn-block', onClick:()=>Ob.simulateFirstMail()}, 'Simuliraj dolazni mejl (demo)') : null,
        h(NavRow,{onBack:()=>Ob.backStep(2), onNext:()=>Ob.toStep4(false)}),
        !connected ? h('div',{style:{textAlign:'center'}}, h('a',{href:'#', style:{fontSize:'0.875rem', textDecoration:'underline'}, onClick:(e)=>{e.preventDefault(); Ob.skipMail();}}, 'Podesiću ovo kasnije')) : null
      ));
  }

  function Step4(){
    const s = useStore();
    const [loading,setLoading] = useState(false);
    function enter(){ setLoading(true); Ob.finish(); }
    const b = s.business;
    const items = [
      ['Podaci o firmi', `${b.name}, PIB ${b.pib}`, true],
      ['Podaci za fakture', `${b.street}, ${b.zip} ${b.city}`, true],
      ['Mejlovi banke', s.session.inboxConnected ? 'Povezano, prvi mejl je stigao.' : 'Podesićeš ovo kasnije u podešavanjima.', !!s.session.inboxConnected],
    ];
    return h(Shell,{step:4, title:'Sve je spremno', sub:'Tvoja firma je podešena. Odavde dalje faktura, knjiga prihoda i porez idu sami.'},
      h('div',{className:'auth-body'},
        h('div',{className:'onb-summary'}, items.map(([label,sub,done],i)=>
          h('div',{key:i, className:'onb-summary-row'}, h('span',{className:'onb-step-num'+(done?' onb-step-num-ok':'')}, h(done?Icons.check:Icons.minus,{width:14,height:14})),
            h('div',null, h('div',{style:{fontSize:'1rem'}}, label), h('div',{className:'faint', style:{fontSize:'0.875rem'}}, sub))))),
        h(Button,{className:'btn-block'+(loading?' btn-loading':''), disabled:loading, onClick:enter},
          loading?h(React.Fragment,null,h(Icons.clock,{width:20,height:20,className:'btn-spinner'}),'Otvaram aplikaciju...'):'Uđi u aplikaciju')
      ));
  }

  function Onboarding(){
    const s = useStore();
    const step = s.session.onboardingStep || 1;
    if(step>=4) return h(Step4);
    if(step===3) return h(Step3);
    if(step===2) return h(Step2);
    return h(Step1);
  }

  window.AIK = window.AIK || {};
  window.AIK.Screens = window.AIK.Screens || {};
  window.AIK.Screens.onboarding = Onboarding;
})();
