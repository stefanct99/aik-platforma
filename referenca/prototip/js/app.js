(function(){
  const h = React.createElement;
  const { useEffect } = React;
  const { useStore, t, Components, useIsMobile } = window.AIK;
  const store = window.AIK.store;
  const Shell = window.AIK.Shell;
  const Sel = window.AIK.Selectors;

  function applyTheme(theme){
    const root = document.documentElement;
    if(theme==='system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }

  function PlaceholderScreen(props){
    return h('div',null,
      h('div',{className:'page-head'}, h('h1',null, props.title), h('p',null, props.sub||'Ovaj ekran dolazi u sledećoj fazi gradnje (odeljak 11.2).')),
      h(Components.Card,null,
        h(Components.EmptyState,{icon: window.AIK.Icons.building, title: props.title+': u izradi',
          body:'Faza 1 (temelj) je spremna: raspored, tema, prijava i greške. Ovaj ekran se puni u narednim fazama.'})
      ));
  }

  const SECTION_LABELS = {
    pocetna:'Početna', fakture:'Fakture', knjiga:'Knjiga prihoda', kalendar:'Kalendar',
    porez:'Porez i rokovi', mejlovi:'Mejlovi banke', ai:'AI knjigovođa', podesavanja:'Podešavanja', pretplata:'Pretplata',
  };

  function AppRouter(){
    const s = useStore();
    const isMobile = useIsMobile();
    useEffect(()=>{ applyTheme(s.theme); }, [s.theme]);
    useEffect(()=>{ window.AIK.i18n.setLang(s.lang); }, [s.lang]);

    const route = s.route;
    if(route === 'onboarding'){
      if(!s.session.loggedIn){ store.navigate('login'); return null; }
      return h(window.AIK.Screens.onboarding);
    }
    if(route.startsWith('app/')){
      if(!s.session.loggedIn){ store.navigate('login'); return null; }
      const sub = route.slice(4);
      const key = sub.split('/')[0];
      let body;
      if(key==='pocetna' && window.AIK.Screens.pocetna) body = h(window.AIK.Screens.pocetna);
      else if(key==='podesavanja' && window.AIK.Screens.podesavanja) body = h(window.AIK.Screens.podesavanja);
      else if(key==='fakture' && window.AIK.Screens.fakture) body = h(window.AIK.Screens.fakture, {sub: sub.slice(key.length+1)});
      else if(key==='knjiga' && window.AIK.Screens.knjiga) body = h(window.AIK.Screens.knjiga);
      else if(key==='mejlovi' && window.AIK.Screens.mejlovi) body = h(window.AIK.Screens.mejlovi, {sub: sub.slice(key.length+1)});
      else if(key==='porez' && window.AIK.Screens.porez) body = h(window.AIK.Screens.porez, {sub: sub.slice(key.length+1)});
      else if(key==='kalendar' && window.AIK.Screens.kalendar) body = h(window.AIK.Screens.kalendar);
      else if(key==='obavestenja' && window.AIK.Screens.obavestenja) body = h(window.AIK.Screens.obavestenja);
      else if(key==='ai' && window.AIK.Screens.ai) body = h(window.AIK.Screens.ai, {sub: sub.slice(key.length+1)});
      else if(key==='pretplata' && window.AIK.Screens.pretplata) body = h(window.AIK.Screens.pretplata, {sub: sub.slice(key.length+1)});
      // ADMIN_SPEC 2: neadmin koji otvori admin adresu dobija ekran 404 (ne "nemaš pristup"), da se ne
      // otkrije da ruta postoji. Na pravoj platformi ista provera ide i na serveru (ADMIN_SPEC 9).
      else if(key==='admin'){
        if(!Sel.isAdmin(s)) return h(window.AIK.Screens['err-404']);
        body = window.AIK.Screens.admin ? h(window.AIK.Screens.admin, {sub: sub.slice(key.length+1)}) : h(PlaceholderScreen,{title:'Admin'});
      }
      // Uvoz (Round 28): Uv1-Uv6 su preko celog ekrana, bez sidebar/topbar-a — isti fullBleed obrazac
      // kao Mb9/Mb5 i AI mobilni "takeover" ispod.
      else if(key==='uvoz' && window.AIK.Screens.uvoz) return h(Shell.AppShell,{fullBleed:true}, h(window.AIK.Screens.uvoz));
      else if(SECTION_LABELS[key]) body = h(PlaceholderScreen,{title:SECTION_LABELS[key]});
      else return h(window.AIK.Screens['err-404']);
      // Mb9: prvi put kad stigne mejl banke, lista se zamenjuje punom-ekranskom karticom (Faza 5/10, 16. krug) —
      // videti napomenu u AppShell.
      const mejloviFirstTime = key==='mejlovi' && sub.slice(key.length+1)==='' && s.bankMails.length>0 && !s.autonomySettings.sendingSettingsSeen;
      const mejloviSent = key==='mejlovi' && !!s.mejloviSentTakeover;
      // Ak1-Ak17/PhAk1-PhAk17 raw HTML (22. krug, Korak 1): na telefonu AI knjigovođa nema sidebar/topbar/
      // bottom-nav uopšte — ceo ekran je sopstveno "chat" preuzimanje (sopstveno zaglavlje sa sparkle+"AI
      // knjigovođa"+X, ili "Razgovori"+X za listu razgovora). Desktop frejmovi (Ak1 itd.) ZADRŽAVAJU normalan
      // sidebar/topbar — zato je ovo mobilno-samo (isMobile), za razliku od Mb9/Mb5 fullBleed koji važi na oba.
      const aiMobileTakeover = key==='ai' && isMobile;
      return h(Shell.AppShell, {fullBleed: mejloviFirstTime || mejloviSent || aiMobileTakeover}, body);
    }
    const Screen = window.AIK.Screens[route];
    if(Screen) return h(Screen);
    return h(window.AIK.Screens['err-404']);
  }

  function Root(){ return h(AppRouter); }

  window.AIK = window.AIK || {};
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(h(Root));
})();
