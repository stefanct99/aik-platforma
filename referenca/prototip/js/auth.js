(function(){
  const h = React.createElement;
  const { useState } = React;
  const { useStore, t, Components } = window.AIK;
  const { Button, Field, Input, PasswordInput, Alert, Brand, ThemeTogglePill } = Components;
  const Icons = window.AIK.Icons;
  const store = window.AIK.store;
  const Auth = window.AIK.Actions.Auth;

  // Shared shell for every auth/onboarding screen: full-bleed gradient, header (logo + contextual
  // right-hand link), centered white/dark card, fixed footer, fixed theme pill. Matches
  // project/PrijavaD8.dc.html / OnbO1.dc.html in the Claude Design file exactly.
  function Wrap(props){
    return h('div',{className:'auth-wrap aik-gradient'},
      h('div',{className:'auth-header'}, h(Brand), h('span',{className:'auth-header-right-d'}, props.headerRight || null)),
      h('div',{className:'auth-card'+(props.wide?' auth-card-wide':'')}, props.children),
      props.headerRight ? h('div',{className:'auth-header-right-m'}, props.headerRight) : null,
      h('div',{className:'auth-page-footer'},
        h('span',null,'© 2026 ', t('brand.name')), h('a',{href:'#'},'Uslovi'), h('a',{href:'#'},'Privatnost'), h('a',{href:'#'},t('common.pomoc'))),
      h(ThemeTogglePill,{className:'theme-pill-fixed'}),
      h(window.AIK.Shell.DevFab), h(window.AIK.Shell.DevMenu), h(Components.Toast), h(Components.SimulatedInboxModal)
    );
  }
  function HelpLink(){ return h('a',{href:'#', style:{fontSize:'0.875rem'}}, t('common.pomoc')); }
  function SwitchLink(props){
    return h('span',{style:{fontSize:'0.875rem'}}, props.lead+' ', h('a',{href:'#', style:{textDecoration:'underline'}, onClick:(e)=>{e.preventDefault(); store.navigate(props.to);}}, props.cta));
  }
  function Tabs(){
    const s = useStore();
    const onLogin = s.route==='login';
    return h('div',{className:'auth-tabs'},
      h('button',{className:onLogin?'active':'', onClick:()=>store.navigate('login')}, t('auth.login.tab')),
      h('button',{className:!onLogin?'active':'', onClick:()=>store.navigate('register')}, t('auth.register.tab')));
  }

  function StatusIconCircle(props){
    return h('span',{className:'icon-circle-56', style:{background:props.bg, color:props.fg}}, h(props.icon,{width:26,height:26}));
  }

  function Login(){
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [errs,setErrs] = useState({});
    const [loading,setLoading] = useState(false);
    const [formErr,setFormErr] = useState(null);
    const [locked,setLocked] = useState(false);

    function submit(e){
      e.preventDefault();
      const errors = {};
      if(!email) errors.email = t('auth.val.email');
      if(!password) errors.password = t('auth.val.password');
      setErrs(errors); setFormErr(null);
      if(Object.keys(errors).length) return;
      setLoading(true);
      setTimeout(()=>{
        setLoading(false);
        const res = Auth.login(email, password);
        if(!res.ok){
          if(res.reason==='locked') setLocked(true);
          else setFormErr(t('auth.err.credentials'));
        }
      }, 500);
    }
    function google(){
      const res = Auth.googleLogin();
      if(!res.ok) setFormErr(t('auth.err.google'));
    }
    if(locked){
      return h(Wrap,{headerRight: h(SwitchLink,{lead:'Nemaš nalog?', cta:'Registruj se', to:'register'})},
        h('div',{style:{display:'flex', flexDirection:'column', alignItems:'center', gap:20, textAlign:'center'}},
          h(StatusIconCircle,{icon:Icons.lock, bg:'#FDECEA', fg:'#B3261E'}),
          h('div',{className:'stack-sm'}, h('h1',{className:'auth-title'}, 'Nalog je privremeno zaključan'), h('p',{className:'auth-sub'}, 'Previše neuspešnih pokušaja prijave. Pokušaj ponovo za 15 minuta ili resetuj lozinku.'))),
        h('div',{className:'auth-body'},
          h(Button,{className:'btn-block', onClick:()=>store.navigate('forgot')}, 'Resetuj lozinku'),
          h('div',{style:{display:'flex', justifyContent:'center'}}, h(window.AIK.Components.BackLink,{onClick:()=>{setLocked(false); store.navigate('login');}}, t('auth.back.login')))));
    }
    return h(Wrap,{headerRight: h(SwitchLink,{lead:'Nemaš nalog?', cta:'Registruj se', to:'register'})},
      h(Tabs),
      h('div',{className:'auth-head'}, h('h1',{className:'auth-title'}, t('auth.login.title')), h('p',{className:'auth-sub'}, t('auth.login.sub'))),
      h('div',{className:'auth-body'},
        formErr ? h(Alert,{kind:'danger'}, formErr) : null,
        h(Button,{variant:'secondary', className:'btn-block', icon:Icons.GoogleG, onClick:google, disabled:loading}, t('auth.google')),
        h('div',{className:'auth-divider'}, t('common.ili')),
        h('form',{onSubmit:submit, className:'stack'},
          h(Field,{label:t('auth.email'), error:errs.email}, h(Input,{value:email, hasError:!!errs.email, disabled:loading, onChange:e=>setEmail(e.target.value), type:'email', placeholder:'ime@firma.rs'})),
          h('div',{className:'stack-sm'},
            h(Field,{label:t('auth.password'), error:errs.password}, h(PasswordInput,{value:password, hasError:!!errs.password, disabled:loading, onChange:e=>setPassword(e.target.value), placeholder:'Unesi lozinku'})),
            h('div',{style:{textAlign:'right'}}, h('a',{href:'#', style:{fontSize:'0.875rem', textDecoration:'underline'}, onClick:(e)=>{e.preventDefault(); store.navigate('forgot');}}, t('auth.forgot')))),
          h(Button,{type:'submit', className:'btn-block'+(loading?' btn-loading':''), disabled:loading}, loading?h(React.Fragment,null,h(Icons.clock,{width:20,height:20,className:'btn-spinner'}),t('auth.login.loading')):t('auth.login.cta')),
          h(Button,{type:'button', variant:'ghost', className:'btn-block btn-textlink', icon:Icons.mail, onClick:()=>store.navigate('magic')}, t('auth.magic.cta'))
        )));
  }

  function MagicRequest(){
    const [email,setEmail] = useState('');
    const [err,setErr] = useState(null);
    function submit(e){ e.preventDefault(); if(!email){ setErr(t('auth.val.email')); return;} Auth.sendMagicLink(email); }
    return h(Wrap,{headerRight: h(HelpLink)},
      h('div',{className:'auth-head'}, h('h1',{className:'auth-title'},'Prijava bez lozinke'), h('p',{className:'auth-sub'},'Pošaljemo ti link za prijavu na mejl.')),
      h('form',{onSubmit:submit, className:'auth-body'},
        h(Field,{label:t('auth.email'), error:err}, h(Input,{value:email, onChange:e=>setEmail(e.target.value), type:'email', placeholder:'ime@firma.rs'})),
        h(Button,{type:'submit', className:'btn-block'}, t('auth.magic.cta'))),
      h('div',{className:'auth-footer'}, h('a',{href:'#', style:{textDecoration:'underline'}, onClick:(e)=>{e.preventDefault(); store.navigate('login');}}, t('auth.back.login'))));
  }

  function MagicSent(){
    const s = useStore();
    const email = s.session.pendingMagicEmail||s.user.email;
    return h(Wrap,{headerRight: h(HelpLink)},
      h('div',{style:{display:'flex', flexDirection:'column', alignItems:'center', gap:20, textAlign:'center'}},
        h(StatusIconCircle,{icon:Icons.inbox, bg:'var(--limeta)', fg:'var(--suma)'}),
        h('div',{className:'stack-sm'}, h('h1',{className:'auth-title'}, t('auth.magic.sent.title')), h('p',{className:'auth-sub'}, t('auth.magic.sent.body',{email})))),
      h('div',{className:'auth-body'},
        h(Button,{className:'btn-block', onClick:()=>Auth.openSimulatedMagic()}, 'Otvori mejl'),
        h('p',{style:{margin:0, fontSize:'0.875rem', textAlign:'center', color:'var(--text-muted)'}}, 'Nije stigao? Proveri spam ili ', h('a',{href:'#', style:{textDecoration:'underline', color:'var(--text)'}, onClick:(e)=>{e.preventDefault(); Auth.sendMagicLink(email);}}, 'pošalji ponovo'), '.'),
        h('div',{style:{display:'flex', justifyContent:'center'}}, h(window.AIK.Components.BackLink,{onClick:()=>store.navigate('login')}, t('auth.back.login')))));
  }

  function LinkExpired(){
    return h(Wrap,{headerRight: h(HelpLink)},
      h('div',{style:{display:'flex', flexDirection:'column', alignItems:'center', gap:20, textAlign:'center'}},
        h(StatusIconCircle,{icon:Icons.clock, bg:'var(--warn-bg)', fg:'var(--warn)'}),
        h('div',{className:'stack-sm'}, h('h1',{className:'auth-title'}, t('auth.link.expired.title')), h('p',{className:'auth-sub'}, t('auth.link.expired.body')))),
      h('div',{className:'auth-body'},
        h(Button,{className:'btn-block', onClick:()=>store.navigate('magic')}, t('auth.link.new')),
        h('div',{style:{display:'flex', justifyContent:'center'}}, h(window.AIK.Components.BackLink,{onClick:()=>store.navigate('login')}, t('auth.back.login')))));
  }

  function Register(){
    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [terms,setTerms] = useState(false);
    const [errs,setErrs] = useState({});
    const [loading,setLoading] = useState(false);
    const [exists,setExists] = useState(false);
    function submit(e){
      e.preventDefault();
      const errors = {};
      if(!name) errors.name = t('auth.val.name');
      if(!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = t('auth.val.email2');
      if(!password || password.length<8) errors.password = t('auth.val.password2');
      if(!terms) errors.terms = t('auth.val.terms');
      setErrs(errors); setExists(false);
      if(Object.keys(errors).length) return;
      if(email.toLowerCase()===window.AIK.store.getState().user.email.toLowerCase() && window.AIK.store.getState().accountStatePreset!=='new'){
        setExists(true); return;
      }
      setLoading(true);
      setTimeout(()=>{ setLoading(false); Auth.register({name,email}); }, 500);
    }
    return h(Wrap,{headerRight: h(SwitchLink,{lead:'Već imaš nalog?', cta:'Prijavi se', to:'login'})},
      h(Tabs),
      h('div',{className:'auth-head'}, h('h1',{className:'auth-title'}, t('auth.register.title')), h('p',{className:'auth-sub'}, t('auth.register.sub'))),
      exists ? h(Alert,{kind:'danger'}, t('auth.err.exists')) : null,
      h('div',{className:'auth-body'},
        h(Button,{variant:'secondary', className:'btn-block', icon:Icons.GoogleG, disabled:loading}, t('auth.google')),
        h('div',{className:'auth-divider'}, t('common.ili')),
        h('form',{onSubmit:submit, className:'stack'},
          h(Field,{label:t('auth.fullname'), error:errs.name}, h(Input,{value:name, hasError:!!errs.name, disabled:loading, onChange:e=>setName(e.target.value)})),
          h(Field,{label:t('auth.email'), error:errs.email}, h(Input,{value:email, hasError:!!errs.email, disabled:loading, type:'email', onChange:e=>setEmail(e.target.value)})),
          h(Field,{label:t('auth.password'), error:errs.password, hint: !errs.password ? t('auth.password.hint') : null}, h(PasswordInput,{value:password, hasError:!!errs.password, disabled:loading, onChange:e=>setPassword(e.target.value)})),
          h('label',{className:'checkbox-row'+(errs.terms?' has-error':'')}, h('input',{type:'checkbox', checked:terms, disabled:loading, onChange:e=>setTerms(e.target.checked)}), h('span',null, t('auth.terms'))),
          errs.terms ? h('div',{className:'field-error'}, h(Icons.alert,{width:18,height:18}), h('span',null,errs.terms)) : null,
          h(Button,{type:'submit', className:'btn-block'+(loading?' btn-loading':''), disabled:loading},
            loading?h(React.Fragment,null,h(Icons.clock,{width:20,height:20,className:'btn-spinner'}),t('auth.register.loading')):t('auth.register.cta')),
          !loading ? h('div',{className:'faint', style:{fontSize:14, textAlign:'center'}}, t('auth.register.note')) : null
        )));
  }

  function VerifyEmail(){
    const s = useStore();
    const email = s.session.emailForVerify||s.user.email;
    return h(Wrap,{headerRight: h(HelpLink)},
      h('div',{style:{display:'flex', flexDirection:'column', alignItems:'center', gap:20, textAlign:'center'}},
        h(StatusIconCircle,{icon:Icons.mail, bg:'var(--limeta)', fg:'var(--suma)'}),
        h('div',{className:'stack-sm'}, h('h1',{className:'auth-title'}, t('auth.verify.title')), h('p',{className:'auth-sub'}, t('auth.verify.body',{email})))),
      h('div',{className:'auth-body'},
        h(Button,{className:'btn-block', onClick:()=>Auth.openSimulatedVerify()}, t('auth.verify.open')),
        h('p',{style:{margin:0, fontSize:'0.875rem', textAlign:'center', color:'var(--text-muted)'}}, 'Nije stigao? Proveri spam ili ', h('a',{href:'#', style:{textDecoration:'underline', color:'var(--text)'}, onClick:(e)=>{e.preventDefault(); Auth.resendVerify();}}, 'pošalji ponovo'), '.'),
        h('div',{style:{display:'flex', justifyContent:'center'}}, h(window.AIK.Components.BackLink,{onClick:()=>store.navigate('login')}, t('auth.verify.change')))
      ));
  }
  function VerifyDone(){
    return h(Wrap,{headerRight: h(HelpLink)},
      h('div',{style:{display:'flex', flexDirection:'column', alignItems:'center', gap:20, textAlign:'center'}},
        h(StatusIconCircle,{icon:Icons.check, bg:'var(--limeta)', fg:'var(--suma)'}),
        h('div',{className:'stack-sm'}, h('h1',{className:'auth-title'}, t('auth.verify.done.title')), h('p',{className:'auth-sub'}, 'Nalog je aktivan. Još samo nekoliko podataka o tvojoj firmi.'))),
      h(Button,{className:'btn-block', onClick:()=>Auth.continueAfterVerify()}, t('auth.verify.done.cta')));
  }

  function ForgotRequest(){
    const [email,setEmail] = useState('');
    const [err,setErr] = useState(null);
    function submit(e){ e.preventDefault(); if(!email){setErr(t('auth.val.email')); return;} Auth.sendPasswordReset(email); }
    return h(Wrap,{headerRight: h(HelpLink)},
      h('div',{className:'auth-head'}, h('h1',{className:'auth-title'}, 'Zaboravljena lozinka'), h('p',{className:'auth-sub'}, 'Unesi e-mail i poslaćemo ti link za novu lozinku.')),
      h('form',{onSubmit:submit, className:'auth-body'},
        h(Field,{label:t('auth.email'), error:err}, h(Input,{value:email, onChange:e=>setEmail(e.target.value), type:'email', placeholder:'ime@firma.rs'})),
        h(Button,{type:'submit', className:'btn-block'}, 'Pošalji link'),
        h('div',{style:{display:'flex', justifyContent:'center'}}, h(window.AIK.Components.BackLink,{onClick:()=>store.navigate('login')}, t('auth.back.login')))));
  }
  function ForgotSent(){
    const s = useStore();
    const email = s.session.pendingResetEmail||s.user.email;
    return h(Wrap,{headerRight: h(HelpLink)},
      h('div',{style:{display:'flex', flexDirection:'column', alignItems:'center', gap:20, textAlign:'center'}},
        h(StatusIconCircle,{icon:Icons.mail, bg:'var(--limeta)', fg:'var(--suma)'}),
        h('div',{className:'stack-sm'}, h('h1',{className:'auth-title'}, 'Proveri mejl'), h('p',{className:'auth-sub'}, `Poslali smo link za novu lozinku na ${email}. Važi 60 minuta.`))),
      h('div',{className:'auth-body'},
        h(Button,{className:'btn-block', onClick:()=>Auth.openSimulatedReset()}, 'Otvori mejl'),
        h('p',{style:{margin:0, fontSize:'0.875rem', textAlign:'center', color:'var(--text-muted)'}}, 'Nije stigao? Proveri spam ili ', h('a',{href:'#', style:{textDecoration:'underline', color:'var(--text)'}, onClick:(e)=>{e.preventDefault(); Auth.sendPasswordReset(email);}}, 'pošalji ponovo'), '.'),
        h('div',{style:{display:'flex', justifyContent:'center'}}, h(window.AIK.Components.BackLink,{onClick:()=>store.navigate('login')}, t('auth.back.login')))));
  }
  function PwRequirement(props){
    return h('span',{style:{display:'flex', alignItems:'center', gap:8, fontSize:'0.875rem', color:props.ok?'var(--text)':'var(--text-muted)'}},
      h('span',{style:{width:18,height:18, borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', background:props.ok?'var(--limeta)':'var(--border-strong)', color:'var(--suma)'}},
        props.ok?h(Icons.check,{width:12,height:12}):null),
      props.label);
  }
  function ForgotNewPass(){
    const [p1,setP1] = useState(''); const [p2,setP2] = useState(''); const [err,setErr] = useState(null);
    const reqLen = p1.length>=8, reqUpper = /[A-Z]/.test(p1), reqNum = /[0-9]/.test(p1);
    function submit(e){
      e.preventDefault();
      if(!(reqLen&&reqUpper&&reqNum)){ setErr('Lozinka ne ispunjava sve uslove'); return; }
      if(p1!==p2){ setErr(t('auth.forgot.mismatch')); return; }
      Auth.submitNewPassword();
    }
    return h(Wrap,{headerRight: h(HelpLink)},
      h('div',{className:'auth-head'}, h('h1',{className:'auth-title'}, 'Nova lozinka'), h('p',{className:'auth-sub'}, 'Izaberi lozinku koju ne koristiš nigde drugde.')),
      h('form',{onSubmit:submit, className:'auth-body'},
        h(Field,{label:'Nova lozinka'}, h(PasswordInput,{value:p1, onChange:e=>setP1(e.target.value), placeholder:'Unesi novu lozinku'})),
        h('div',{className:'stack-sm'},
          h(PwRequirement,{ok:reqLen, label:'Najmanje 8 karaktera'}),
          h(PwRequirement,{ok:reqUpper, label:'Jedno veliko slovo'}),
          h(PwRequirement,{ok:reqNum, label:'Jedan broj'})),
        h(Field,{label:'Ponovi lozinku', error:err}, h(PasswordInput,{value:p2, onChange:e=>setP2(e.target.value), hasError:!!err, placeholder:'Ponovi lozinku'})),
        h(Button,{type:'submit', className:'btn-block'}, 'Sačuvaj lozinku')));
  }
  function ForgotSuccess(){
    return h(Wrap,{headerRight: h(SwitchLink,{lead:'Nemaš nalog?', cta:'Registruj se', to:'register'})},
      h('div',{style:{display:'flex', flexDirection:'column', alignItems:'center', gap:20, textAlign:'center'}},
        h(StatusIconCircle,{icon:Icons.check, bg:'var(--limeta)', fg:'var(--suma)'}),
        h('div',{className:'stack-sm'}, h('h1',{className:'auth-title'}, 'Lozinka je promenjena'), h('p',{className:'auth-sub'}, 'Sada se možeš prijaviti novom lozinkom.'))),
      h(Button,{className:'btn-block', onClick:()=>store.navigate('login')}, t('auth.forgot.gologin')));
  }

  // Err1/Err2: full app shell stays visible (sidebar + topbar), the error replaces only the content card.
  function ShellErrorCard(props){
    return h('div',{className:'shell-error-card'},
      h('div',{className:'inner'},
        h('span',{className:'icon-circle', style:{background:props.bg, color:props.fg}}, h(props.icon,{width:28,height:28})),
        h('span',{style:{fontSize:'1.5rem', letterSpacing:'-0.02em'}}, props.title),
        h('span',{style:{fontSize:'1rem', lineHeight:1.5, color:'var(--text-muted)'}}, props.body),
        h('div',{className:'row', style:{justifyContent:'center', flexWrap:'wrap', paddingTop:8}}, props.children)
      ));
  }
  function Err404(){
    const s = useStore();
    if(!s.session.loggedIn) return h('div',{className:'fullpage-error'},
      h('div',null, h('div',{className:'code'},'404'), h('h2',{style:{fontSize:24, margin:'8px 0', fontWeight:400}}, t('err.404.title')),
        h('p',{className:'muted', style:{maxWidth:380, margin:'0 auto 24px'}}, t('err.404.body')),
        h(Button,{onClick:()=>store.navigate('login')}, t('err.404.home')),
        h(window.AIK.Shell.DevFab), h(window.AIK.Shell.DevMenu)));
    return h(window.AIK.Shell.AppShell, null,
      h(ShellErrorCard,{icon:Icons.search, bg:'var(--sidebar-item-active)', fg:'#2F5D12', title:t('err.404.title'), body:t('err.404.body')},
        h(Button,{onClick:()=>store.navigate('app/pocetna')}, t('err.404.home')),
        h(Button,{variant:'secondary', icon:Icons.chat, onClick:()=>store.navigate('app/ai')}, t('err.404.ask'))
      ));
  }
  function ErrOffline(){
    return h(window.AIK.Shell.AppShell, null,
      h(ShellErrorCard,{icon:Icons.triangleAlert, bg:'#FFF4DB', fg:'#8A5A00', title:t('err.offline.title'), body:t('err.offline.body')},
        h(Button,{icon:Icons.clock, onClick:()=>store.navigate('app/pocetna')}, t('err.retry'))
      ));
  }

  window.AIK = window.AIK || {};
  window.AIK.AuthShell = { Wrap, HelpLink, SwitchLink };
  window.AIK.Screens = window.AIK.Screens || {};
  Object.assign(window.AIK.Screens, {
    login: Login, register: Register, verify: VerifyEmail, 'verify-done': VerifyDone,
    magic: MagicRequest, 'magic-sent': MagicSent, 'link-expired': LinkExpired,
    forgot: ForgotRequest, 'forgot-sent': ForgotSent, 'forgot-newpass': ForgotNewPass, 'forgot-success': ForgotSuccess,
    'err-404': Err404, 'err-offline': ErrOffline,
  });
})();
