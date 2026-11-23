// Minimal inline SVG icon set. Each returns a React element. stroke="currentColor".
(function(){
  const h = React.createElement;
  function Icon(paths, extra){
    return function(props){
      props = props || {};
      return h('svg', Object.assign({viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round'}, props),
        ...paths.map((d,i)=>h('path',{key:i, d})), extra?extra():null);
    };
  }
  const I = {};
  I.home = Icon(['M3 11.5 12 4l9 7.5','M5 10v9.5a1 1 0 0 0 1 1h4.5v-6h3v6H19a1 1 0 0 0 1-1V10']);
  I.invoice = Icon(['M6 3h9l3 3v15H6z','M9 8h6','M9 12h6','M9 16h4']);
  I.book = Icon(['M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16.5A1.5 1.5 0 0 1 18.5 21H6.5A2.5 2.5 0 0 1 4 18.5z','M4 18.5A2.5 2.5 0 0 1 6.5 16H20']);
  I.calendar = Icon(['M4 9h16','M7 3v4','M17 3v4','M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z']);
  I.percent = Icon(['M19 5 5 19','M7.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z','M16.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z']);
  I.mail = Icon(['M4 6h16v12H4z','M4 7l8 6 8-6']);
  I.chat = Icon(['M4 5h16v11H9l-4 4V5Z']);
  I.settings = Icon(['M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z','M19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 13a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 7a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 2.6a1.65 1.65 0 0 0 1-1.51V1a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 7a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z']);
  I.bell = Icon(['M6 10a6 6 0 1 1 12 0c0 3.2 1 4.6 2 5.8H4c1-1.2 2-2.6 2-5.8Z','M9.5 18.5a2.5 2.5 0 0 0 5 0']);
  I.search = Icon(['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z','M21 21l-4.3-4.3']);
  I.sun = Icon(['M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z','M12 2v2','M12 20v2','M4.9 4.9l1.4 1.4','M17.7 17.7l1.4 1.4','M2 12h2','M20 12h2','M4.9 19.1l1.4-1.4','M17.7 6.3l1.4-1.4']);
  I.moon = Icon(['M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z']);
  I.plus = Icon(['M12 5v14','M5 12h14']);
  I.chevronRight = Icon(['M9 6l6 6-6 6']);
  I.chevronDown = Icon(['M6 9l6 6 6-6']);
  I.chevronLeft = Icon(['M15 18l-6-6 6-6']);
  I.check = Icon(['M20 6 9 17l-5-5']);
  I.checkCircle = Icon(['M21 11.1V12a9 9 0 1 1-5.3-8.2','M22 4 12 14.01l-3-3']);
  I.x = Icon(['M18 6 6 18','M6 6l12 12']);
  I.eye = Icon(['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z','M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z']);
  I.eyeOff = Icon(['M3 3l18 18','M10.6 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a14 14 0 0 1-3 3.9M6.3 6.5A14.4 14.4 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 4.2-.9','M9.5 10a2.5 2.5 0 0 0 3.5 3.5']);
  I.google = function(props){
    return h('svg', Object.assign({viewBox:'0 0 24 24', width:18, height:18},props),
      h('path',{d:'M21.6 12.23c0-.68-.06-1.36-.18-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.2c1.9-1.75 2.99-4.3 2.99-7.42Z', fill:'#4285F4'}),
      h('path',{d:'M12 22c2.6 0 4.8-.86 6.4-2.35l-3.2-2.5c-.9.6-2 .95-3.2.95-2.5 0-4.6-1.68-5.35-3.95H3.3v2.55A10 10 0 0 0 12 22Z', fill:'#34A853'}),
      h('path',{d:'M6.65 13.15A6.1 6.1 0 0 1 6.3 11c0-.75.13-1.47.35-2.15V6.3H3.3A10 10 0 0 0 2 11c0 1.6.38 3.13 1.3 4.7z', fill:'#FBBC05'}),
      h('path',{d:'M12 4.9c1.4 0 2.7.5 3.7 1.4l2.85-2.85A9.9 9.9 0 0 0 12 1 10 10 0 0 0 3.3 6.3l3.35 2.55C7.4 6.58 9.5 4.9 12 4.9Z', fill:'#EA4335'})
    );
  };
  I.paperclip = Icon(['M21.4 11.1 12.5 20a4.5 4.5 0 0 1-6.4-6.4l9-9a3 3 0 0 1 4.3 4.3l-8.5 8.5a1.5 1.5 0 0 1-2.1-2.1l7.1-7.1']);
  I.send = Icon(['M22 2 11 13','M22 2 15 22l-4-9-9-4Z']);
  I.download = Icon(['M12 3v12','M7 10l5 5 5-5','M5 21h14']);
  I.trash = Icon(['M3 6h18','M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2','M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6']);
  I.edit = Icon(['M12 20h9','M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z']);
  I.copy = Icon(['M9 9h10v10H9z','M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1']);
  I.more = Icon(['M12 5v.01','M12 12v.01','M12 19v.01'], function(){return null;});
  I.alert = Icon(['M12 9v4','M12 17h.01','M10.3 3.9 2.4 18a1 1 0 0 0 .9 1.5h17.4a1 1 0 0 0 .9-1.5L13.7 3.9a1 1 0 0 0-1.4 0Z']);
  I.info = Icon(['M12 17v-5','M12 8h.01','M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z']);
  I.robot = Icon(['M7 8h10v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z','M9 12h.01','M15 12h.01','M12 4v4','M9 4h6']);
  I.wallet = Icon(['M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2','M17 13h.01']);
  I.flag = Icon(['M5 3v18','M5 4h12l-3 4 3 4H5']);
  I.qr = Icon(['M4 4h6v6H4z','M14 4h6v6h-6z','M4 14h6v6H4z','M14 14h3v3h-3z','M19 14v3','M14 20h3']);
  I.card = Icon(['M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z','M3 10h18']);
  I.logout = Icon(['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4','M16 17l5-5-5-5','M21 12H9']);
  I.filter = Icon(['M4 5h16','M7 12h10','M10 19h4']);
  I.arrowRight = Icon(['M5 12h14','M13 5l7 7-7 7']);
  I.building = Icon(['M4 21V8l8-5 8 5v13','M9 21v-6h6v6','M9 11h.01','M15 11h.01','M9 15h.01','M15 15h.01']);
  I.upload = Icon(['M12 21V9','M7 14l5-5 5 5','M5 21h14']);
  I.uploadArrow = Icon(['M12 16V4','M6 9l6-6 6 6','M5 20h14']);
  I.repeat = Icon(['M17 2l4 4-4 4','M3 11V9a4 4 0 0 1 4-4h14','M7 22l-4-4 4-4','M21 13v2a4 4 0 0 1-4 4H3']);
  I.bank = Icon(['M3 10l9-6 9 6','M4 10v9','M20 10v9','M2 19h20','M9 10v9','M15 10v9']);
  I.inbox = Icon(['M3 7h5l2 3h4l2-3h5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z']);
  I.lock = Icon(['M5 11h14v9H5z','M8 11V8a4 4 0 0 1 8 0v3']);
  I.minus = Icon(['M6 12h12']);
  I.clock = Icon(['M12 8v4l3 2','M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z']);
  I.triangleAlert = Icon(['M12 4l9 16H3Z','M12 10v4','M12 17v.01']);
  I.fileImage = Icon(['M4 4h16v16H4z','M9 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z','M20 16l-5-5-8 9']);
  I.fileText = Icon(['M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z','M14 3v5h5','M9 13h6','M9 17h6']);
  // Pretraga (Poc5/Poc6, PhPoc5/PhPoc6): "Klijenti" (torba) i "Uplate" (novčić) značke po tipu rezultata.
  I.briefcase = Icon(['M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2','M4 13h16'], ()=>h('rect',{x:4,y:8,width:16,height:11,rx:2,fill:'none',stroke:'currentColor',strokeWidth:1.8}));
  I.coin = Icon(['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z','M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.4 0-2.5.7-2.5 1.8 0 2.4 5 1.2 5 3.6 0 1.1-1.1 1.8-2.5 1.8-1.1 0-2.1-.5-2.6-1.5','M12 7v1','M12 16v1']);
  // Rez6b/PhRez6b ("Zdravstveno osiguranje" stavka u ručnom unosu rešenja).
  I.heart = Icon(['M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z']);
  // Tačan oblik iz AI knjigovođa frejmova (Ak1 i dr.): veća i manja varijacija zvezdice.
  I.sparkle = Icon(['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z','M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z']);
  I.thumbsUp = Icon(['M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z','M7 10l4.5-7a2 2 0 0 1 3.5 1.3V9h4.2a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 18 20H9a2 2 0 0 1-2-2']);
  I.thumbsDown = Icon(['M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1z','M17 14l-4.5 7a2 2 0 0 1-3.5-1.3V15H4.8a2 2 0 0 1-2-2.3l1.2-7A2 2 0 0 1 6 4h9a2 2 0 0 1 2 2']);
  // Adm1/PhAdm0 frejm: sidebar/"Više" stavka Admin, isti put kao u dizajnu (tačno prepisan).
  I.shield = Icon(['M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z','M9 12l2 2 4-4']);

  window.AIK = window.AIK || {};
  window.AIK.Icons = I;

  // Exact brand mark from the Claude Design file (project/NavR1.dc.html etc.): rounded square,
  // three ledger lines, lime sparkle. markBg differs light (#0F2A22) vs dark (#1D4C3C) sidebar.
  I.Logo = function(props){
    const size = (props && props.size) || 28;
    const markBg = (props && props.markBg) || '#0F2A22';
    return h('svg',{width:size, height:size, viewBox:'0 0 64 64', 'aria-hidden':'true'},
      h('rect',{width:64, height:64, rx:15, fill:markBg}),
      h('line',{x1:14, y1:24, x2:38, y2:24, stroke:'#F4F3EE', strokeWidth:4.5, strokeLinecap:'round'}),
      h('line',{x1:14, y1:34, x2:44, y2:34, stroke:'#F4F3EE', strokeWidth:4.5, strokeLinecap:'round'}),
      h('line',{x1:14, y1:44, x2:30, y2:44, stroke:'#F4F3EE', strokeWidth:4.5, strokeLinecap:'round'}),
      h('path',{d:'M47 8C48 15 50 17 57 18C50 19 48 21 47 28C46 21 44 19 37 18C44 17 46 15 47 8Z', fill:'#C8F169', stroke:markBg, strokeWidth:2})
    );
  };
  // Exact 4-color Google "G" mark used on PrijavaD8.dc.html etc.
  I.GoogleG = function(props){
    return h('svg', Object.assign({width:20, height:20, viewBox:'0 0 24 24', 'aria-hidden':'true'}, props),
      h('path',{fill:'#4285F4', d:'M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z'}),
      h('path',{fill:'#34A853', d:'M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21.5 7.5 24 12 24z'}),
      h('path',{fill:'#FBBC05', d:'M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.6l3.8-3z'}),
      h('path',{fill:'#EA4335', d:'M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 12 0C7.5 0 3.7 2.5 1.8 6.1l3.8 3C6.5 6.8 9 4.8 12 4.8z'})
    );
  };
})();
