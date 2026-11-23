// Faza 9: Pretplata (3.12, 5.5, 6.10, 7.14, 8.11). Frejmovi Sub1-Sub12 / PhSub1-PhSub12.
// Prototip nema pravo plaćanje (sandbox): forma prihvata bilo koji unos oblika koji frejm traži,
// ishod (uspeh/odbijeno) zavisi od dev prekidača `paymentForceFail`. Forma kartice NIKAD ne čuva
// pun broj/CVC — ni u state-u ni u localStorage — samo poslednje 4 cifre i rok (Sub9: "Kartica •••• 4417").
(function(){
  const h = React.createElement;
  const { useState, useRef } = React;
  const { useStore, useIsMobile, Components } = window.AIK;
  const { Button, Field, Input, Modal } = Components;
  const Icons = window.AIK.Icons;
  const store = window.AIK.store;
  const Sel = window.AIK.Selectors;
  const U = window.AIK.Util;
  const TODAY = window.AIK.Seed.TODAY;
  const SubA = window.AIK.Actions.Subscription;
  const PLAN_PRICES = SubA.PLAN_PRICES;
  const QrCode = window.AIK.Porez.QrCode;

  const INCLUDED = [
    'Fakture sa tvojim šablonom, slanje mejlom i podsetnici',
    'Praćenje deviznih priliva i obrasci za banku',
    'Porez i doprinosi sa QR kodom za uplatu',
    'Mejlovi banke: AI knjigovođa čita i odgovara',
    'KPO knjiga prihoda i kursevi NBS',
    'Rokovi, obaveštenja i obaveštenje o limitu',
    'AI knjigovođa chat za sva pitanja o paušalu',
    'Podrška preko AI pomoći, pa preko ljudi',
  ];

  function periodLabel(p){ return p===1?'Mesečno':p+' '+U.plural(p,['mesec','meseca','meseci']); }
  function periodNoun(p){ return p+' '+U.plural(p,['mesec','meseca','meseci']); }
  // Genitiv + tačka, za tekst u rečenici ("Sledeća naplata 15. novembra 2027. Otkažeš...", Sub3/Sub10).
  function priceDateSentence(iso){ const d=new Date(iso); return U.fmtLongGen(iso)+' '+d.getFullYear()+'.'; }
  // Nominativ, bez tačke, za vrednost u redu ("Sledeća naplata | 15. novembar 2027", Sub8/Sub9/Sub11).
  function priceDateLabel(iso){ const d=new Date(iso); return U.fmtLong(iso)+' '+d.getFullYear(); }

  // ===================== Sub3: Izbor plana =====================
  function PlanCard(props){
    const { p, selected, onPick } = props;
    const price = PLAN_PRICES[p];
    const best = p===12;
    return h('div',Object.assign({className:'sub-plan-card'+(selected?' selected':'')}, window.AIK.a11yClick(()=>onPick(p))),
      best ? h('span',{className:'sub-best-badge'},'Najbolja cena') : null,
      h('div',{className:'row', style:{justifyContent:'space-between'}}, h('span',null, periodLabel(p)), h('span',{className:'sub-radio'+(selected?' on':'')})),
      h('div',{className:'row', style:{alignItems:'baseline', gap:6}}, h('span',{className:'sub-price'}, price.monthly+' €'), h('span',{className:'faint', style:{fontSize:'0.875rem'}},'mesečno')),
      h('span',{className:'faint', style:{fontSize:'0.875rem'}}, 'Ukupno '+price.total+' €'),
      h('span',{style:{fontSize:'0.875rem', color: p===1?'var(--text-muted)':'var(--success)'}}, p===1?'Bez obaveze':'Štediš '+(29*p-price.total)+' €'));
  }

  function PregledPanel(props){
    // Sub3/Sub4/Sub7 dele ISTI tamni "Pregled" panel (uvek #0F2A22, bez obzira na temu — isto pravilo kao Mb4 doc-stage).
    const { period, isMobile, cta, onCta, note } = props;
    const price = PLAN_PRICES[period];
    const nextCharge = U.addMonths(TODAY, period);
    return h('div',{className:'sub-pregled'},
      h('span',{className:'t'},'Pregled'),
      h('div',{className:'rows'},
        h('div',{className:'row', style:{justifyContent:'space-between'}}, h('span',{className:'k'},'Plan'), h('span',null,'Sve uključeno')),
        h('div',{className:'row', style:{justifyContent:'space-between'}}, h('span',{className:'k'},'Period'), h('span',null, periodNoun(period))),
        h('div',{className:'row', style:{justifyContent:'space-between'}}, h('span',{className:'k'},'Cena'), h('span',null, price.monthly+' € mesečno'))),
      h('div',{className:'total'}, h('span',{className:'k'},'Za plaćanje danas'), h('span',{className:'v'}, price.total+' €')),
      h('span',{className:'note'}, note || ('Sledeća naplata '+priceDateSentence(nextCharge)+(isMobile?' Otkažeš kad god želiš.':' Otkažeš kad god želiš, do kraja plaćenog perioda sve radi.'))),
      cta ? h(Button,{className:'sub-cta', onClick:onCta}, cta) : null);
  }

  function PlanScreen(){
    const s = useStore();
    const isMobile = useIsMobile();
    const [period,setPeriod] = useState(s.subscription.period || 12);
    const periods = [1,3,6,12];
    return h('div',{className:'stack', style:{gap:20}},
      h('div',{className:'page-head'}, h('h1',null,'Izaberi plan'), h('p',null,'Jedan plan sa svim uključenim. Što duži period, to je jeftinije.')),
      h('div',{className:'sub-plan-grid'}, periods.map(p=> h(PlanCard,{key:p, p, selected:period===p, onPick:setPeriod}))),
      h('div',{className:'sub-cols'},
        h('div',{className:'sub-col-main'},
          h('div',{className:'sub-included-card'},
            h('div',{className:'row', style:{justifyContent:'space-between'}}, h('span',{className:'t'},'Šta je uključeno'), isMobile ? null : h('span',{className:'badge-pill sub-muted-dark'},'Jedan plan, sve uključeno')),
            h('div',{className:'stack', style:{gap:14}}, INCLUDED.map((t,i)=> h('div',{key:i, className:'row', style:{alignItems:'flex-start', gap:12}}, h(Icons.check,{width:18,height:18, style:{flexShrink:0, color:'var(--success)', marginTop:2}}), h('span',null,t))))),
        ),
        h('div',{className:'sub-col-side'},
          h(PregledPanel,{period, isMobile, cta:'Nastavi na plaćanje', onCta:()=>store.navigate('app/pretplata/placanje/'+period)}))));
  }

  // ===================== Sub4/Sub5/Sub6/Sub7: Plaćanje =====================
  // Dugme za slanje ("Plati X €" / "Pokušaj ponovo") je u Pregled panelu (isto za Sub4 i Sub6 —
  // frejm ga ponovo koristi), NE u samoj formi — zato se polja kartice drže OVDE (lift state up) i
  // validiraju pri klik na Pregled dugme, ne pri submit-u same forme.
  function luhnShapeOk(num){ return /^\d{13,19}$/.test(num); }

  function CardFields(props){
    const { v, set, busy, errs } = props;
    return h('div',{className:'stack', style:{gap:16}},
      h('span',{style:{fontSize:'1.25rem'}},'Podaci o kartici'),
      h(Field,{label:'Broj kartice', error:errs.number}, h(Input,{value:v.number, disabled:busy, hasError:!!errs.number, onChange:e=>set('number',e.target.value)})),
      h('div',{className:'row', style:{gap:12}},
        h('div',{style:{flex:1,minWidth:0}}, h(Field,{label:'Rok trajanja', error:errs.exp}, h(Input,{value:v.exp, disabled:busy, hasError:!!errs.exp, placeholder:'MM / GG', onChange:e=>set('exp',e.target.value)}))),
        h('div',{style:{flex:1,minWidth:0}}, h(Field,{label:'Kod na poleđini', error:errs.cvc}, h(Input,{value:v.cvc, disabled:busy, hasError:!!errs.cvc, placeholder:'•••', maxLength:4, onChange:e=>set('cvc',e.target.value.replace(/\D/g,''))})))),
      h(Field,{label:'Ime na kartici', error:errs.name}, h(Input,{value:v.name, disabled:busy, hasError:!!errs.name, onChange:e=>set('name',e.target.value)})),
      h('label',{className:'row', style:{gap:10, alignItems:'flex-start', fontSize:'0.875rem', color:'var(--text-muted)', cursor:'pointer'}},
        h('input',{type:'checkbox', checked:v.agree, disabled:busy, onChange:e=>set('agree',e.target.checked), style:{marginTop:3}}),
        h('span',{className:'sub-muted-dark'},'Pristajem da se pretplata automatski obnavlja svakih 12 meseci sa ove kartice. Otkažem kad god želim.')),
      errs.agree ? h('span',{className:'field-error-text'}, errs.agree) : null,
      h('span',{className:'faint', style:{fontSize:'0.75rem'}},'Podatke o kartici obrađuje procesor plaćanja. Broj kartice ne čuvam.'));
  }

  // Sub7/PhSub7 raw HTML (24. krug, Korak 1b): svako polje je SOPSTVENI red (border-top razdelnik) sa
  // sopstvenom kopiraj-ikonicom, ne zajednička kutija sa jednim "Kopiraj sve" dugmetom ispod.
  function QrFieldRow(props){
    const { label, value, copyText } = props;
    const [copied,setCopied] = useState(false);
    function copy(){ try{ navigator.clipboard.writeText(copyText!=null?copyText:value); }catch(e){} setCopied(true); setTimeout(()=>setCopied(false),1500); }
    return h('div',{className:'sub-qr-field-row'},
      h('span',{className:'faint', style:{fontSize:'0.875rem'}}, label),
      h('div',{style:{display:'flex', alignItems:'center', gap:10, fontSize:'1rem'}},
        h('span',{style:{whiteSpace:'nowrap'}}, value),
        h('button',{className:'icon-btn', onClick:copy}, h(copied?Icons.check:Icons.copy,{width:16,height:16}))));
  }

  function QrTab(props){
    const { period, isMobile } = props;
    const price = PLAN_PRICES[period];
    const rate = U.nbsRate(TODAY, 'EUR');
    const dinars = Math.round(price.total*rate*100)/100;
    const payload = `K:PR|V:01|C:1|R:2650000000000012345|N:Fakturica d.o.o.|I:RSD${dinars.toFixed(2)}|SF:289|S:Pretplata ${period} meseci|RO:972600094417`;
    function copyAll(){
      const text = `Primalac: Fakturica d.o.o.\nRačun: 265-0000000000123-45\nIznos: ${U.fmtMoney(dinars,'RSD')}\nPoziv na broj: 97 26-0009-4417\nSvrha uplate: Pretplata ${period} meseci`;
      if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(()=>{});
      store.toast('Podaci su kopirani.');
    }
    const qrBox = h('div',{className:'sub-qr-box'}, h(QrCode,{value:payload, size:isMobile?160:140}));
    const details = h('div',{className:'stack', style:{gap:16, flex:1, minWidth:0}},
      h('p',{className:'faint sub-muted-dark', style:{fontSize:'0.875rem', paddingBottom: isMobile?null:8}},'Otvori aplikaciju svoje banke, izaberi skeniranje IPS QR koda i potvrdi uplatu. Iznos je u dinarima po srednjem kursu NBS na današnji dan.'),
      h('div',{className:'sub-qr-fields'},
        h(QrFieldRow,{label:'Primalac', value:'Fakturica d.o.o.'}),
        h(QrFieldRow,{label:'Račun', value:'265-0000000000123-45'}),
        h(QrFieldRow,{label:'Iznos', value:U.fmtMoney(dinars,'RSD')}),
        h(QrFieldRow,{label:'Poziv na broj', value:'97 26-0009-4417'}),
        h(QrFieldRow,{label:'Svrha uplate', value:'Pretplata '+periodNoun(period)})),
      h('div',{className:'row', style:{gap:10}},
        h(Button,{variant:'secondary', style:{flex:1}, onClick:()=>store.toast('QR kod je sačuvan.')},'Sačuvaj QR kod'),
        h(Button,{variant:'secondary', style:{flex:1}, onClick:copyAll},'Kopiraj sve podatke')));
    // Desktop: QR kutija i polja JEDAN DO DRUGOG u redu (Sub7 raw HTML); telefon: sve u koloni (PhSub7).
    return h('div',{className:'stack', style:{gap:16}},
      h('div',{className:'row', style:{justifyContent:'space-between'}},
        h('h3',{style:{margin:0}},'Skeniraj QR kod'),
        h('span',{className:'sub-qr-wait-pill'}, h('span',{className:'dot'}),'Čekam uplatu')),
      isMobile
        ? h(React.Fragment,null, h('div',{className:'row', style:{justifyContent:'center'}}, qrBox), details)
        : h('div',{className:'row', style:{gap:28, alignItems:'flex-start'}}, qrBox, details),
      h('div',{className:'por-highlight-card'}, h(Icons.check,{width:20,height:20, style:{flexShrink:0}}), h('span',{className:'por-highlight-sub'},'Ne moraš da osvežavaš stranicu. Čim uplata stigne, javljam ti i aktiviram pretplatu. Obično traje par minuta.')),
      h(Button,{variant:'ghost', size:'sm', onClick:()=>{ SubA.confirmQrPayment(period); store.navigate('app/pretplata/uspeh'); }}, '(dev) Simuliraj da je uplata stigla'));
  }

  function PlacanjeScreen(props){
    const { period } = props;
    const isMobile = useIsMobile();
    const [tab,setTab] = useState('card'); // card | qr
    const [step,setStep] = useState('form'); // form | confirming | declined
    const [card,setCardState] = useState({number:'4417 1234 5678 9010', exp:'08 / 28', cvc:'123', name:'Stefan Milošević', agree:false});
    const [errs,setErrs] = useState({});
    const timerRef = useRef(null);
    function setCard(k,v){ setCardState(c=> Object.assign({}, c, {[k]:v})); }
    function submitCard(){
      const digits = card.number.replace(/\s/g,'');
      const e = {};
      if(!luhnShapeOk(digits)) e.number = 'Broj kartice nije tačnog oblika.';
      if(!/^\d{2}\s*\/\s*\d{2}$/.test(card.exp)) e.exp = 'Oblik MM / GG.';
      if(!/^\d{3,4}$/.test(card.cvc)) e.cvc = '3 ili 4 cifre.';
      if(!card.name.trim()) e.name = 'Obavezno polje.';
      if(!card.agree) e.agree = 'Potrebna je saglasnost.';
      setErrs(e);
      if(Object.keys(e).length) return;
      // Nikad ne čuvamo pun broj ni CVC — samo poslednje 4 cifre i rok prosleđujemo dalje.
      const last4 = digits.slice(-4), exp = card.exp.replace(/\s/g,'');
      setStep('confirming');
      timerRef.current = setTimeout(()=>{
        timerRef.current = null;
        const r = SubA.confirmCardPayment(period, last4, exp);
        if(r.ok) store.navigate('app/pretplata/uspeh');
        else setStep('declined');
      }, 1400);
    }
    // "Odustani od plaćanja" (Sub5) mora stvarno da prekine simulaciju — inače bi naplata svejedno
    // prošla posle isteka tajmera iako je korisnik zatvorio prozor.
    function abort3ds(){ if(timerRef.current){ clearTimeout(timerRef.current); timerRef.current=null; } setStep('form'); }
    const ctaLabel = step==='declined' ? 'Pokušaj ponovo' : ('Plati '+PLAN_PRICES[period].total+' €');
    return h('div',{className:'stack', style:{gap:20}},
      h('div',{className:'page-head'}, h('h1',null,'Plati pretplatu'), h('p',null,'Izaberi kako plaćaš. Račun dobijaš čim se uplata potvrdi.')),
      h('div',{className:'sub-cols'},
        h('div',{className:'sub-col-main'},
          h('div',{className:'pay-tabs', role:'tablist'},
            h('span',{className:tab==='card'?'active':'', role:'tab', tabIndex:0, 'aria-selected':tab==='card', onClick:()=>setTab('card'), onKeyDown:e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); setTab('card'); } }}, h(Icons.card,{width:18,height:18}),'Kartica'),
            h('span',{className:tab==='qr'?'active':'', role:'tab', tabIndex:0, 'aria-selected':tab==='qr', onClick:()=>setTab('qr'), onKeyDown:e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); setTab('qr'); } }}, h(Icons.qr,{width:18,height:18}),'QR kod')),
          h('div',{className:'sub-payment-card'},
            step==='declined' ? h('div',{className:'sub-decline-banner'},
              h('span',{className:'t'},'Banka je odbila plaćanje'),
              h('span',null,'Proveri datum isteka i kod na poleđini kartice, pa pokušaj ponovo. Ako se ponovi, pozovi svoju banku ili plati preko QR koda.')) : null,
            tab==='card' ? h(CardFields,{v:card, set:setCard, busy:step==='confirming', errs}) : h(QrTab,{period, isMobile}))),
        h('div',{className:'sub-col-side'},
          tab==='card'
            ? h(PregledPanel,{period, isMobile, cta:ctaLabel, onCta:submitCard})
            : h(PregledPanel,{period, isMobile,
                note: isMobile?'Za QR uplatu pretplata se ne obnavlja sama.':'Za QR uplatu pretplata se ne obnavlja sama. Tri dana pre isteka javljam ti i šaljem novi QR kod.',
                cta: isMobile?null:'Prebaci na karticu', onCta:isMobile?null:()=>setTab('card')}))),
      // Sub5/PhSub5 raw HTML (24. krug, Korak 1a): nema spinner-a — "Čekam potvrdu, još 02:00" je pilula
      // (sat-ikonica + tekst, pozadina var(--surface-2)) ISPOD paragrafa, a "Odustani od plaćanja" je
      // obican centriran LINK u telu, ne dugme u modal-foot-u (frejm nema razdvojeno podnožje ovde).
      step==='confirming' ? h(Modal,{title:'Potvrdi plaćanje u banci'},
        h('div',{className:'stack', style:{gap:16}},
          h('p',{style:{margin:0}},'Otvori aplikaciju svoje banke i potvrdi uplatu od '+PLAN_PRICES[period].total+' €. Ne zatvaraj ovaj prozor.'),
          h('div',{className:'sub-confirm-wait'}, h(Icons.clock,{width:18,height:18}), h('span',null,'Čekam potvrdu, još 02:00')),
          h('div',{className:'row', style:{justifyContent:'center'}}, h('a',{href:'#', style:{fontSize:'0.875rem', textDecoration:'underline', textUnderlineOffset:'3px'}, onClick:(e)=>{e.preventDefault(); abort3ds();}},'Odustani od plaćanja')))) : null);
  }

  // ===================== Sub8: Uspeh =====================
  function UspehScreen(){
    const s = useStore();
    const sub = s.subscription;
    return h('div',{className:'sub-success'},
      h('span',{className:'icon'}, h(Icons.checkCircle,{width:32,height:32})),
      h('h1',null,'Pretplata je aktivna'),
      h('p',{className:'faint'},'Uplata je potvrđena. AI knjigovođa nastavlja da radi tamo gde je stao.'),
      h('div',{className:'sub-success-card'},
        h('div',{className:'row', style:{justifyContent:'space-between'}}, h('span',{className:'faint'},'Plan'), h('span',null, sub.plan)),
        h('div',{className:'row', style:{justifyContent:'space-between'}}, h('span',{className:'faint'},'Period'), h('span',null, periodNoun(sub.period))),
        h('div',{className:'row', style:{justifyContent:'space-between'}}, h('span',{className:'faint'},'Plaćeno'), h('span',null, PLAN_PRICES[sub.period].total+' €')),
        h('div',{className:'row', style:{justifyContent:'space-between'}}, h('span',{className:'faint'},'Sledeća naplata'), h('span',null, sub.nextChargeAt?priceDateLabel(sub.nextChargeAt):'—'))),
      h('div',{className:'row', style:{gap:10, width:'100%'}},
        h(Button,{variant:'secondary', style:{flex:1}, onClick:()=>SubA.downloadInvoicePdf()},'Preuzmi račun (PDF)'),
        h(Button,{style:{flex:1}, onClick:()=>store.navigate('app/pocetna')},'Idi na početnu')));
  }

  // ===================== Sub9/Sub11: Upravljanje =====================
  function CancelModal(props){
    const [reason,setReason] = useState(null);
    const reasons = ['Preskupo je','Ne koristim dovoljno','Prelazim na knjigovođu','Nešto drugo'];
    const sub = window.AIK.store.getState().subscription;
    // Sub10/PhSub10 raw HTML (23. krug, Korak 2): razlozi su VERTIKALNA lista pravih radio-dugmića
    // (isti `.sub-radio`/`.sub-radio.on` kao izbor perioda u PlanCard-u), ne red čipova koji se prelama;
    // dijalog NEMA X u zaglavlju (hideClose, isti obrazac kao Promeni lozinku/Izbrisati nalog).
    return h(Modal,{title:'Otkaži pretplatu?', onClose:props.onClose, hideClose:true, mobileTitleLg:true, footer:[
        h(Button,{key:'k', onClick:props.onClose},'Zadrži pretplatu'),
        h(Button,{key:'c', variant:'secondary', className:'sub-cancel-confirm', onClick:()=>{ SubA.cancelSubscription(reason); props.onClose(); }},'Otkaži pretplatu')]},
      h('div',{className:'stack', style:{gap:16}},
        h('p',{style:{margin:0, color:'var(--text-muted)'}}, 'Pretplata ostaje aktivna do '+(sub.nextChargeAt?priceDateSentence(sub.nextChargeAt):'kraja perioda.')+' Posle toga se AI knjigovođa pauzira, a ti i dalje vidiš i izvoziš sve svoje podatke.'),
        h('div',{className:'stack-sm'},
          h('span',{className:'faint', style:{fontSize:'0.875rem'}},'Šta nije bilo dobro? (nije obavezno)'),
          h('div',{className:'stack-sm', style:{marginTop:8}}, reasons.map(r=> h('div',Object.assign({key:r, className:'row', style:{gap:12, fontSize:'1rem', cursor:'pointer'}}, window.AIK.a11yClick(()=>setReason(r))), h('span',{className:'sub-radio'+(reason===r?' on':'')}), r))))));
  }

  function UpravljanjeScreen(){
    const s = useStore();
    const isMobile = useIsMobile();
    const [cancelOpen,setCancelOpen] = useState(false);
    const sub = s.subscription;
    const failed = sub.status==='Naplata nije uspela';
    // Mala ispravka: dok je besplatan pristup aktivan, red "Sledeća naplata"/"Neuspela naplata" pokazuje
    // cenu koja se zapravo ne naplaćuje (npr. uz Otkazana+besplatan pristup) — sakriven, ne izmišljam
    // novi red za besplatan pristup ovde (nije nacrtano).
    const hideBilling = !!window.AIK.Rules.subscriptionAccess.freeAccessCardInfo(s.freeAccess, TODAY);
    const [retrying,setRetrying] = useState(false);
    function retryNow(){
      setRetrying(true);
      setTimeout(()=>{ setRetrying(false); SubA.retryPayment(); }, 1200);
    }
    // Sub9/Sub11 vs PhSub9/PhSub11: na telefonu su ove akcije dugme pune širine (48px/1rem), ne .btn-sm red.
    function pmBtn(label, onClick){
      return isMobile
        ? h(Button,{variant:'secondary', className:'btn-block', style:{height:48, fontSize:'1rem'}, onClick},label)
        : h(Button,{variant:'secondary', size:'sm', onClick},label);
    }
    return h('div',{className:'stack', style:{gap:20}},
      h('div',{className:'page-head'}, h('h1',null,'Pretplata'), h('p',null,'Plan, način plaćanja i svi računi na jednom mestu.')),
      failed ? h('div',{className:'sub-decline-banner', style:{marginBottom:0}},
        h('span',{className:'t'},'Naplata od '+PLAN_PRICES[sub.period].total+' € nije prošla'),
        h('span',null,'Pokušaću ponovo za 3 dana, do tada sve radi. Možeš i odmah da platiš drugom karticom ili preko QR koda.'),
        // Sub11/PhSub11 raw HTML (22. krug, Korak 0): "Plati drugom karticom" je PRIMARNO (tamno) dugme,
        // "Pokušaj ponovo" SEKUNDARNO (belo/ivica) — na oba uređaja, obe teme. Redosled se razlikuje:
        // desktop Pokušaj-pa-Plati, mobilni Plati-pa-Pokušaj (frejm, ne proizvoljno).
        isMobile ? h('div',{className:'stack', style:{gap:8, marginTop:4}},
          h(Button,{className:'btn-block', style:{height:48, fontSize:'1rem'}, onClick:()=>store.navigate('app/pretplata/placanje/'+sub.period)},'Plati drugom karticom'),
          h(Button,{className:'btn-block', style:{height:48, fontSize:'1rem'}, variant:'secondary', disabled:retrying, onClick:retryNow}, retrying?'Pokušavam...':'Pokušaj ponovo')) :
        h('div',{className:'row', style:{gap:8, marginTop:4}},
          h(Button,{size:'sm', variant:'secondary', disabled:retrying, onClick:retryNow}, retrying?'Pokušavam...':'Pokušaj ponovo'),
          h(Button,{size:'sm', onClick:()=>store.navigate('app/pretplata/placanje/'+sub.period)},'Plati drugom karticom'))) : null,
      h('div',{className:'poc-card', style:{display:'flex', flexDirection:'column', gap:14}},
        h('span',{style:{fontSize:'1.25rem'}},'Tvoja pretplata'),
        h('div',{className:'account-row'}, h('span',{className:'k'},'Status'), h('span',{className:'v'}, sub.status)),
        h('div',{className:'account-row'}, h('span',{className:'k'},'Plan'), h('span',{className:'v'}, sub.plan)),
        h('div',{className:'account-row'}, h('span',{className:'k'},'Period'), h('span',{className:'v sub-v-stack'}, h('span',null, periodNoun(sub.period)+','), h('span',null, PLAN_PRICES[sub.period].monthly+' € mesečno'))),
        hideBilling ? null : h('div',{className:'account-row'}, h('span',{className:'k'}, failed?'Neuspela naplata':'Sledeća naplata'), h('span',{className:'v sub-v-stack'}, h('span',null, (sub.nextChargeAt?priceDateLabel(sub.nextChargeAt):'—')+','), h('span',null, PLAN_PRICES[sub.period].total+' €'))),
        h('div',{style:{display:'flex', flexDirection:isMobile?'column':'row', gap:12}},
          pmBtn('Promeni period',()=>store.navigate('app/pretplata/plan')),
          sub.status!=='Otkazana' ? (
            isMobile
              ? h('span', Object.assign({style:{alignSelf:'center', fontSize:'1rem', color:'var(--status-late-text)', cursor:'pointer'}}, window.AIK.a11yClick(()=>setCancelOpen(true))),'Otkaži pretplatu')
              : h(Button,{variant:'ghost', size:'sm', style:{color:'var(--status-late-text)', border:0}, onClick:()=>setCancelOpen(true)},'Otkaži pretplatu')
          ) : null)),
      h('div',{className:'poc-card', style:{display:'flex', flexDirection:'column', gap:14}},
        h('div',{style:{display:'flex', alignItems:'center', justifyContent:'space-between'}},
          h('span',{style:{fontSize:'1.25rem'}},'Način plaćanja'),
          isMobile ? null : (failed
            ? h('span',{className:'badge-pill', style:{background:'var(--status-late-bg)', color:'var(--status-late-text)'}},'Kartica odbijena')
            : (sub.paymentMethod && sub.paymentMethod.type==='card' ? h('span',{className:'badge-pill sub-muted-dark', style:{background:'var(--bg)'}},'Automatska naplata') : null))),
        h('div',{className:'sub-pm-row'},
          h('span',{className:'sub-pm-icon'}, h(Icons.coin,{width:18,height:18})),
          h('div',{style:{display:'flex', flex:1, flexDirection:'column', alignItems:'flex-start'}},
            h('span',null, sub.paymentMethod&&sub.paymentMethod.type==='card' ? ('Kartica •••• '+sub.paymentMethod.last4) : sub.paymentMethod&&sub.paymentMethod.type==='qr' ? 'QR kod (bez automatske obnove)' : '—'),
            sub.paymentMethod && sub.paymentMethod.type==='card' ? h('span',{style:{fontSize:'0.875rem', color:'var(--text-muted)'}}, 'Ističe '+sub.paymentMethod.exp) : null)),
        h('div',{style:{display:'flex', flexDirection:isMobile?'column':'row', gap:12}},
          pmBtn('Promeni karticu',()=>store.navigate('app/pretplata/placanje/'+sub.period)),
          pmBtn('Plati preko QR koda',()=>store.navigate('app/pretplata/placanje/'+sub.period)))),
      h('div',{className:'poc-card', style:{display:'flex', flexDirection:'column', gap:14}},
        h('span',{style:{fontSize:'1.25rem'}},'Istorija plaćanja'),
        sub.history.length===0 ? h('span',{className:'faint'},'Pojaviće se ovde.') :
        sub.history.slice().reverse().map(hrow=> h('div',{key:hrow.id, className:'sub-history-row'},
          h('span',{className:'d'}, U.fmtDateShort(hrow.date)+' '+new Date(hrow.date).getFullYear()),
          h('span',{className:'t'}, hrow.desc),
          h('span',{className:'a'}, hrow.amount? hrow.amount+' €' : '0 €'),
          h('span',{className:'r'}, hrow.amount? h('a',{href:'#', onClick:e=>e.preventDefault()},'Račun') : '—')))),
      cancelOpen ? h(CancelModal,{onClose:()=>setCancelOpen(false)}) : null);
  }

  function PretplataScreen(props){
    const s = useStore();
    const sub = props.sub||'';
    // Probni (nikad nije platio) ili probni istekao a da nikad nije izabrao plan — nema šta da se "upravlja"
    // ili "prikaže kao plaćeno" (sub.period je null): i UpravljanjeScreen i UspehScreen pretpostavljaju da plan
    // postoji (PLAN_PRICES[sub.period]), pa svaka ruta bez stvarnog plana vodi na biranje plana umesto na njih.
    const hasPlan = s.subscription.period!=null;
    if(sub==='plan') return h(PlanScreen);
    if(sub.indexOf('placanje/')===0) return h(PlacanjeScreen,{period:Number(sub.slice(9))||12});
    if(sub==='uspeh') return hasPlan ? h(UspehScreen) : h(PlanScreen);
    return (s.subscription.status==='Probni' || !hasPlan) ? h(PlanScreen) : h(UpravljanjeScreen);
  }

  window.AIK = window.AIK || {};
  window.AIK.Screens = window.AIK.Screens || {};
  window.AIK.Screens.pretplata = PretplataScreen;
})();
