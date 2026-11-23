// Faza 7: Obaveštenja — nova stranica, nije u Prilogu A (samo zvonce iz 5.4 i Pd4 postoje u dizajnu).
// Isti izvor podataka i isto stanje pročitano/nepročitano kao zvonce (js/shell.js Topbar) — 3.13.
(function(){
  const h = React.createElement;
  const U = window.AIK.Util;
  const store = window.AIK.store;
  const useStore = window.AIK.useStore;
  const Icons = window.AIK.Icons;
  const { Button } = window.AIK.Components;

  const MONTHS_SR_SHORT = ['jan','feb','mar','apr','maj','jun','jul','avg','sep','okt','nov','dec'];
  // Ista logika kao zvonce (js/shell.js) — Seed.TODAY je ponoć, "sada" se simulira na 14:00 istog
  // dana da "pre N min/h"/"jutros" imaju smisla za mejlove sa vremenom unutar tog dana.
  function timeAgo(iso){
    const NOW = new Date(window.AIK.Seed.TODAY.getTime() + 14*3600*1000);
    const d = new Date(iso);
    const mins = Math.round((NOW-d)/60000);
    if(mins <= 0) return 'upravo sad';
    if(mins < 60) return 'pre '+mins+' min';
    if(d.toDateString()===NOW.toDateString()){
      const hrs = Math.round(mins/60);
      if(hrs <= 4) return 'pre '+hrs+' h';
      return 'jutros';
    }
    const yesterday = new Date(NOW); yesterday.setDate(yesterday.getDate()-1);
    if(d.toDateString()===yesterday.toDateString()) return 'juče';
    return d.getDate()+'. '+MONTHS_SR_SHORT[d.getMonth()];
  }

  function ObavestenjaScreen(){
    const s = useStore();
    const isMobile = window.AIK.useIsMobile();
    const list = s.notifications.slice().sort((a,b)=> new Date(b.at)-new Date(a.at));
    const unread = list.filter(n=>!n.read).length;
    return h('div',{className:'stack', style:{gap:20}},
      h('div',{style:{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16, flexWrap:'wrap'}},
        h('div',null, h('h1',{style:{margin:0, fontSize:'var(--fs-24-32)'}},'Obaveštenja'), h('p',{className:'faint', style:{margin:0}},'Ista lista kao u zvoncu, najnovija gore.')),
        unread>0 ? h(Button,{variant:'secondary', onClick:()=>window.AIK.Actions.Settings.markAllNotifsRead()},'Označi sve kao pročitano') : null),
      h('div',{className:'poc-card'},
        list.length ? list.map((n,i)=> h('div',{key:n.id, className:'notif-pop-row', style:{cursor:'pointer', borderTop: i===0?'0':undefined, flexWrap: isMobile?'wrap':'nowrap'}, onClick:()=>{ window.AIK.Actions.Settings.markNotifRead(n.id); if(n.route) store.navigate(n.route); }},
          !n.read ? h('span',{className:'notif-dot'}) : null,
          h('span',{className:'icon-circ-36'}, h(Icons.clock,{width:18,height:18})),
          h('div',{className:'mid'},
            h('div',{style:{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}},
              h('span',{style:{fontSize:'1rem'}}, n.title),
              (n.type && !isMobile) ? h('span',{className:'muted', style:{fontSize:'0.75rem'}}, '· '+n.type) : null),
            h('div',{className:'faint', style:{fontSize:'0.875rem'}}, n.body)),
          h('span',{className:'faint', style:{fontSize:'0.875rem', flex:'none'}}, timeAgo(n.at)))) :
          h('div',{style:{textAlign:'center', color:'var(--text-muted)', padding:'20px 0'}},'Nema obaveštenja.')),
      h('a',{href:'#', style:{fontSize:'0.875rem'}, onClick:(e)=>{e.preventDefault(); store.navigate('app/podesavanja');}},'Podešavanja obaveštenja'));
  }

  window.AIK = window.AIK || {};
  window.AIK.Screens = window.AIK.Screens || {};
  window.AIK.Screens.obavestenja = ObavestenjaScreen;
})();
