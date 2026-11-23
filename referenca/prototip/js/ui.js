(function(){
  const h = React.createElement;
  const { useState, useEffect, useRef } = React;
  const store = window.AIK.store;

  function useStore(){
    const [,setTick] = useState(0);
    useEffect(()=> store.subscribe(()=>setTick(t=>t+1)), []);
    return store.getState();
  }
  function t(key, vars){ return window.AIK.i18n.t(key, vars); }

  // KORAK 4 (Faza 10): span/div elementi sa onClick (chip, kartica, red, radio-kartica...) moraju biti
  // dostižni tastaturom isto kao dugme — tabIndex, role, Enter/Space. Vidljiv fokus dolazi već od
  // globalnog :focus-visible pravila (base.css), nije potrebno ponavljati ovde.
  function a11yClick(fn, role){
    return { tabIndex: 0, role: role||'button', onClick: fn,
      onKeyDown: e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); fn(e); } } };
  }

  function Button(props){
    const {variant='primary', size, className, children, icon, ...rest} = props;
    const cls = ['btn', 'btn-'+variant, size==='sm'?'btn-sm':'', className||''].join(' ').trim();
    return h('button', Object.assign({className:cls}, rest), icon?h(icon,{width:16,height:16}):null, children);
  }

  // Exact wordmark from the design file: [mark] tvoj [AI badge] knjigovođa
  function Brand(props){
    const dark = (props && props.dark) || false;
    const size = (props && props.size) || 28;
    return h('span',{className:'brand-lockup'},
      h(window.AIK.Icons.Logo,{size, markBg: dark?'#1D4C3C':'#0F2A22'}),
      h('span',{className:'brand-words'},
        h('span',{style:{fontWeight:400}},'tvoj'),
        h('span',{className:'brand-ai-badge'},'AI'),
        h('span',{style:{fontWeight:700}},'knjigovođa')));
  }

  // Light/dark segmented pill, exact control from the design file (bottom-right on auth/onboarding,
  // and in the app topbar). Writes straight to the theme actions so it works anywhere.
  function useIsMobile(){
    const [mobile,setMobile] = useState(()=> window.matchMedia('(max-width: 1023px)').matches);
    useEffect(()=>{
      const mq = window.matchMedia('(max-width: 1023px)');
      const onChange = ()=> setMobile(mq.matches);
      mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
      return ()=> { mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange); };
    }, []);
    return mobile;
  }
  function useSystemDark(){
    const [dark,setDark] = useState(()=> !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));
    useEffect(()=>{
      if(!window.matchMedia) return;
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = ()=> setDark(mq.matches);
      mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
      return ()=> { mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange); };
    }, []);
    return dark;
  }
  function ThemeTogglePill(props){
    const s = useStore();
    const systemDark = useSystemDark();
    const Icons = window.AIK.Icons;
    const effectiveDark = s.theme==='dark' || (s.theme==='system' && systemDark);
    const setLight = ()=> window.AIK.Actions.Dev.setTheme('light');
    const setDark = ()=> window.AIK.Actions.Dev.setTheme('dark');
    return h('div',{className:'theme-pill '+(props&&props.className||'')},
      h('button',{className:'theme-pill-btn'+(!effectiveDark?' active':''), onClick:setLight, title:'Svetli izgled'}, h(Icons.sun,{width:16,height:16})),
      h('button',{className:'theme-pill-btn'+(effectiveDark?' active':''), onClick:setDark, title:'Tamni izgled'}, h(Icons.moon,{width:16,height:16})));
  }

  // Uv0/PhUv0 (Faza 10b, Round 28): isti baner "Počeo si usred godine?" se ponavlja na 3 mesta
  // (Knjiga prihoda, Počni ovde na Početnoj, Podešavanja/Povezivanje) — Uv0 je jedini nacrtan frejm
  // za njega, pa je ovde zajednička komponenta da izgled bude identičan na sva tri mesta.
  function ImportBanner(){
    return h('div',{className:'import-banner'},
      h('div',{className:'import-banner-text'},
        h('span',{className:'t'},'Počeo si usred godine?'),
        h('span',{className:'sub-muted-dark'},'Prenesi prihode koje si već imao, pa će limit, knjiga prihoda i brojevi faktura biti tačni od prvog dana.')),
      h(Button,{onClick:()=>window.AIK.Actions.Uvoz.openEntry()},'Prenesi dosadašnje poslovanje'));
  }

  function Field(props){
    const {label, hint, error, children} = props;
    return h('div',{className:'field'},
      label?h('label',null,label):null,
      children,
      error?h('div',{className:'field-error'}, h(window.AIK.Icons.alert,{width:18,height:18}), h('span',null,error)) : (hint?h('div',{className:'hint'},hint):null)
    );
  }

  function Input(props){
    const {hasError, className, ...rest} = props;
    return h('input', Object.assign({}, rest, {className:'input'+(hasError?' has-error':'')+(className?' '+className:'')}));
  }

  function PasswordInput(props){
    const [show,setShow] = useState(false);
    const Icons = window.AIK.Icons;
    return h('div',{className:'input-group'},
      h(Input, Object.assign({}, props, {type: show?'text':'password'})),
      h('button',{type:'button', className:'input-adorn', onClick:()=>setShow(v=>!v), 'aria-label':'toggle password'},
        h(show?Icons.eyeOff:Icons.eye,{width:18,height:18}))
    );
  }

  function SidePanel(props){
    const isMobile = useIsMobile();
    if(isMobile){
      return h('div',{className:'sheet-overlay', onMouseDown:(e)=>{ if(e.target===e.currentTarget && props.onClose) props.onClose(); }},
        h('div',{className:'sheet'},
          h('div',{className:'sheet-handle'}),
          h('div',{className:'sheet-head side-panel-sheet-head'}, h('h3',null, props.title)),
          h('div',{className:'sheet-body'}, props.children),
          props.footer ? h('div',{className:'sheet-foot'+(props.singleActionMobile?' single-action-mobile':'')}, Array.isArray(props.footer)?props.footer.slice().reverse():props.footer) : null));
    }
    return h('div',{className:'panel-overlay', onMouseDown:(e)=>{ if(e.target===e.currentTarget && props.onClose) props.onClose(); }},
      h('div',{className:'side-panel'},
        h('div',{className:'side-panel-head'}, h('span',{className:'t'}, props.title),
          h('button',{className:'side-panel-close', onClick:props.onClose}, h(window.AIK.Icons.x,{width:20,height:20}))),
        h('div',{className:'side-panel-body'}, props.children),
        props.footer ? h('div',{className:'side-panel-foot'}, props.footer) : null));
  }

  function Toggle(props){
    const {on, onChange, disabled} = props;
    return h('button',{type:'button', className:'toggle'+(on?' on':''), disabled, onClick:()=>!disabled && onChange && onChange(!on)}, h('span',{className:'knob'}));
  }

  function BackLink(props){
    return h('a',{href:'#', className:'back-link', onClick:(e)=>{e.preventDefault(); props.onClick && props.onClick();}}, h(window.AIK.Icons.chevronLeft,{width:16,height:16}), props.children);
  }

  function Card(props){
    const {className, children, ...rest} = props;
    return h('div', Object.assign({className:'card '+(className||'')}, rest), children);
  }

  function Badge(props){
    const {kind='draft', children} = props;
    return h('span',{className:'badge badge-'+kind}, children);
  }

  function AiPill(props){
    return h('span',{className:'ai-pill'}, t('brand.ai'), props.children?' '+props.children:' knjigovođa je ovo uradio');
  }

  function Alert(props){
    const {kind='info', children, title} = props;
    const Icons = window.AIK.Icons;
    const icon = kind==='danger'?Icons.alert: kind==='warn'?Icons.alert: kind==='success'?Icons.checkCircle: Icons.info;
    return h('div',{className:'alert alert-'+kind}, h(icon,{width:20,height:20, style:{flexShrink:0, marginTop:2}}),
      h('div',null, title?h('b',null,title):null, title?h('br'):null, children));
  }

  function ProgressBar(props){
    const {pct, kind} = props;
    const p = Math.max(0, Math.min(100, pct));
    const cls = 'progress ' + (kind||(p>=100?'danger':p>=80?'warn':''));
    return h('div',{className:cls}, h('div',{style:{width:p+'%'}}));
  }

  function Skeleton(props){
    return h('div',{className:'skeleton', style:Object.assign({height:14, width:'100%'}, props.style||{})});
  }

  function EmptyState(props){
    const {icon, title, body, children} = props;
    return h('div',{className:'empty-state'},
      icon?h('div',{className:'icon-wrap'}, h(icon,{width:28,height:28})):null,
      h('h3',null,title), h('p',null,body), children);
  }

  // 10.5/KORAK 3.1: Escape zatvara modale/panele. Jedan tastaturni listener po otvorenom modalu/sheet-u.
  function useEscapeClose(onClose){
    useEffect(()=>{
      if(!onClose) return;
      const onKey = (e)=>{ if(e.key==='Escape') onClose(); };
      window.addEventListener('keydown', onKey);
      return ()=> window.removeEventListener('keydown', onKey);
    }, [onClose]);
  }

  function Modal(props){
    const {onClose, title, children, footer, size, singleActionMobile, mobileTitleLg} = props;
    const isMobile = useIsMobile();
    useEscapeClose(onClose);
    if(isMobile){
      return h('div',{className:'sheet-overlay', onMouseDown:(e)=>{ if(e.target===e.currentTarget && onClose) onClose(); }},
        h('div',{className:'sheet'},
          h('div',{className:'sheet-handle'}),
          h('div',{className:'sheet-head'+(mobileTitleLg?' sheet-head-lg':'')}, h('h3',null,title)),
          h('div',{className:'sheet-body'}, children),
          footer?h('div',{className:'sheet-foot'+(singleActionMobile?' single-action-mobile':'')}, Array.isArray(footer)?footer.slice().reverse():footer):null));
    }
    return h('div',{className:'modal-overlay', onMouseDown:(e)=>{ if(e.target===e.currentTarget && onClose) onClose(); }},
      h('div',{className:'modal'+(size==='lg'?' modal-lg':'')},
        h('div',{className:'modal-head'}, h('h3',null,title), (onClose && !props.hideClose)?h('button',{className:'icon-btn', onClick:onClose}, h(window.AIK.Icons.x,{width:18,height:18})):null),
        h('div',{className:'modal-body'}, children),
        footer?h('div',{className:'modal-foot'+(props.stackedFooter?' stacked':'')}, footer):null
      ));
  }

  function Sheet(props){
    const {onClose, title, children} = props;
    useEscapeClose(onClose);
    return h('div',{className:'sheet-overlay', onMouseDown:(e)=>{ if(e.target===e.currentTarget && onClose) onClose(); }},
      h('div',{className:'sheet'},
        h('div',{className:'sheet-handle'}),
        h('div',{className:'sheet-head'}, h('h3',null,title)),
        h('div',{className:'sheet-body'}, children)
      ));
  }

  function Toast(){
    const s = useStore();
    if(!s.toast) return null;
    const Icons = window.AIK.Icons;
    return h('div',{style:{position:'fixed', top:20, right:20, zIndex:500, background:'var(--surface)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', boxShadow:'var(--shadow-lg)', padding:'14px 18px', display:'flex', alignItems:'center', gap:10, maxWidth:360}},
      h(Icons.checkCircle,{width:18,height:18, style:{color:'var(--success)', flexShrink:0}}), h('span',{style:{fontSize:14}}, s.toast.msg));
  }

  // Simulirani prijem mejla — zamena za pravi inbox korisnika u prototipu (verifikacija, magic link, reset).
  function SimulatedInboxModal(){
    const s = useStore();
    const Actions = window.AIK.Actions.Auth;
    if(!s.simInbox) return null;
    const {type, email} = s.simInbox;
    const close = ()=> store.setState({simInbox:null});
    const cfg = {
      verify: {subject:'Potvrdi svoj e-mail', cta:'Potvrdi e-mail', action:Actions.confirmVerify,
        body:`Zdravo ${s.user.name.split(' ')[0]},\n\nKlikni na dugme ispod da potvrdiš svoju e-mail adresu i aktiviraš nalog.`},
      magic: {subject:'Tvoj link za prijavu', cta:'Prijavi se', action:Actions.openSimulatedMagic,
        body:'Klikni na dugme ispod da se prijaviš. Link važi 15 minuta.'},
      reset: {subject:'Resetuj lozinku', cta:'Postavi novu lozinku', action:Actions.openSimulatedReset,
        body:'Klikni na dugme ispod da postaviš novu lozinku. Link važi 60 minuta.'},
    }[type];
    return h(Modal,{title:'Simulirani mejl (prototip)', onClose:close},
      h('div',{className:'stack'},
        h('div',{className:'faint', style:{fontSize:12}}, 'Za: ', email),
        h('div',{style:{fontWeight:800, fontSize:18}}, cfg.subject),
        h('div',{style:{whiteSpace:'pre-line', color:'var(--text-muted)', fontSize:14}}, cfg.body),
        h(Button,{onClick:()=>{ cfg.action(); }}, cfg.cta)
      ));
  }

  window.AIK = window.AIK || {};
  Object.assign(window.AIK, {
    useStore, t, useIsMobile, useSystemDark, a11yClick,
    Components: { Button, Field, Input, PasswordInput, Card, Badge, AiPill, Alert, ProgressBar, Skeleton, EmptyState, Modal, Sheet, Toast, SimulatedInboxModal, Brand, ThemeTogglePill, Toggle, BackLink, SidePanel, ImportBanner },
  });
})();
