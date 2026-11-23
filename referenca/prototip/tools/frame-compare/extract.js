// Zajednička ekstrakcija elemenata (tekst + computed style) iz jednog DOM podstabla.
// Pozvana i nad frejmom (jedan panel = jedna tema) i nad živim prototipom (cela app).
const PROPS = ['fontSize','fontWeight','lineHeight','color','backgroundColor',
  'paddingTop','paddingRight','paddingBottom','paddingLeft',
  'marginTop','marginRight','marginBottom','marginLeft',
  'borderTopWidth','borderTopColor','borderTopStyle','borderRadius','gap'];
const DIM_PROPS = ['width','height'];
const ALL_PROPS = PROPS.concat(DIM_PROPS);

// Ova funkcija se izvršava UNUTAR stranice (page/element .evaluate) — mora biti samostalna (bez closure-a).
function pageExtractFn(root, args){
  const { originX, originY, propsList } = args;
  const out = [];
  function hasDirectText(el){
    for(const n of el.childNodes){ if(n.nodeType===3 && n.textContent.trim()) return true; }
    return false;
  }
  function norm(s){ return (s||'').replace(/\s+/g,' ').trim(); }
  function visible(el){
    const cs = getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width>0 && r.height>0;
  }
  function walk(el){
    if(!el || el.nodeType!==1) return;
    const tag = el.tagName.toLowerCase();
    if(tag==='script'||tag==='style'||tag==='helmet'||tag==='svg') return;
    if(!visible(el)) return;
    const isInteractive = ['button','input','select','textarea'].includes(tag) || el.getAttribute('role')==='button' || el.getAttribute('role')==='tab';
    const direct = hasDirectText(el);
    if(direct || isInteractive){
      const text = norm(el.textContent).slice(0,140);
      const key = text || ('['+tag+(el.className?('.'+(''+el.className).split(' ')[0]):'')+']');
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const styles = {};
      propsList.forEach(p=> styles[p]=cs[p]);
      styles.width = Math.round(r.width);
      styles.height = Math.round(r.height);
      out.push({ tag, text: key, x: Math.round(r.left-originX), y: Math.round(r.top-originY), styles });
    }
    for(const c of el.children) walk(c);
  }
  walk(root);
  return out;
}

async function extractFromElementHandle(handle, originX, originY){
  return handle.evaluate(pageExtractFn, { originX, originY, propsList: ALL_PROPS });
}

module.exports = { PROPS, DIM_PROPS, ALL_PROPS, pageExtractFn, extractFromElementHandle };
