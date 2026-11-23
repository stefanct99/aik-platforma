#!/usr/bin/env node
/*
 * Faza 10, dvadeset prvi krug, korak 0: automatska provera pravog-telefona-širina preko SVIH ekrana
 * i stanja iz razvojnog menija, na 360/390/393/430px, obe teme. Pravi telefoni su 360-430px (frejmovi
 * su 365px), pa greške koje se ovde love ne vide se na 365px ni na desktopu.
 *
 * Proverava za svaku kombinaciju (stanje naloga x ekran x širina x tema), i dodatno (na mobilnim
 * širinama) za Podešavanja svih 7 tabova i Fakture tab "Klijenti"/"Ponavljajuće":
 *   (a) horizontalni skrol stranice (document.scrollWidth > širina prozora)
 *   (b) input/select/textarea/dugme koje izgleda kao puna širina: širina == širina roditelja (dozvola 2px)
 *   (c) nijedan element ne prelazi desnu ivicu svog roditelja (dozvola 2px, preskače position fixed/absolute/sticky)
 *   (d) kartica sa ivicom (3+ strane solid) ima SVE četiri strane vidljive (hvata "border-top:0 posle border
 *       shorthand-a u istom pravilu" tip greške iz 21. kruga, stavka 4)
 *
 * node sweep-phone.js [--widths=360,390,393,430] [--themes=light,dark] [--out=report.json]
 * Izlaz: JSON sa listom prekršaja po (stanje, ekran, širina, tema) + ukupan broj kombinacija proverenih.
 * Exit kod 1 ako ima bar jedan prekršaj (za CI/standardni ciklus faze).
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PROTO_URL = 'http://localhost:8743/preview.html';
const PRESETS = ['new','onboarding','trial','trial_ending','expired','active','payment_failed','canceled'];
const ROUTES = ['app/pocetna','app/fakture','app/knjiga','app/mejlovi','app/porez','app/kalendar',
  'app/obavestenja','app/ai','app/pretplata','app/podesavanja','app/uvoz',
  'app/admin','app/admin/korisnici','app/admin/dnevnik','app/admin/podrska'];
// Faza 11, Korak 7: "Odobri besplatan pristup" otvoren preko admin/korisnici (modal na desktopu, sheet
// na telefonu — isti ADMIN_STEPS obrazac kao UVOZ_STEPS iznad za dublje, ne-URL stanje).
const ADMIN_STEPS = {
  'admin-odobri-pristup': "(function(){ const b=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Odobri besplatan pristup'); if(b) b.click(); })()",
};
// Round 28, Korak 6: app/uvoz u ROUTES iznad pokriva samo Uv1 (izbor) — ovde dodatno provlačimo tok
// do Uv2/Uv4/Uv5 (gde su stvarne tabele/trake najosetljivije na uske telefonske širine).
const UVOZ_STEPS = {
  'uvoz-upload': "(function(){ Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Dalje').click(); })()",
  'uvoz-provera': "(async()=>{ Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Dalje').click(); await new Promise(r=>setTimeout(r,80)); const input=document.querySelector('input[type=file]'); const file=new File(['x'],'test.pdf',{type:'application/pdf'}); const dt=new DataTransfer(); dt.items.add(file); input.files=dt.files; input.dispatchEvent(new Event('change',{bubbles:true})); await new Promise(r=>setTimeout(r,80)); Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Pročitaj dokumenta').click(); await new Promise(r=>setTimeout(r,2700)); })()",
  'uvoz-rucni-unos': "(async()=>{ const radio=Array.from(document.querySelectorAll('.uvoz-radio-card')).find(e=>e.textContent.includes('Unesi ručno')); radio.click(); await new Promise(r=>setTimeout(r,80)); Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Dalje').click(); })()",
};
// Mobilni pod-ekrani koji se ne vide kroz samu rutu (interni tab-state, ne URL) — klikaju se po tekstu.
const SETTINGS_SUBTABS = ['Profil i firma','Računi','Pretplata','Obaveštenja','Povezivanje','Bezbednost i nalog','Jezik i izgled'];
const FAKTURE_SUBTABS = ['Klijenti','Ponavljajuće'];

function parseListArg(name, dflt){
  const a = process.argv.find(x=>x.startsWith('--'+name+'='));
  return a ? a.split('=')[1].split(',').map(s=>s.trim()).filter(Boolean) : dflt;
}
const WIDTHS = parseListArg('widths', ['360','390','393','430']).map(Number);
const THEMES = parseListArg('themes', ['light','dark']);
const OUT = (process.argv.find(a=>a.startsWith('--out=')) || '--out=sweep-report.json').split('=')[1];

// Izvršava se UNUTAR stranice — mora biti samostalna funkcija (bez closure-a iz Node-a).
function runChecksInPage(){
  function describeEl(el){
    const cls = (el.className && el.className.toString) ? el.className.toString().trim().split(/\s+/)[0] : '';
    const txt = (el.textContent||'').replace(/\s+/g,' ').trim().slice(0,40);
    return el.tagName.toLowerCase() + (cls?('.'+cls):'') + (txt?(' "'+txt+'"'):'');
  }
  const out = { scroll: null, control: [], overflow: [], border: [] };
  const vw = window.innerWidth;
  if(document.documentElement.scrollWidth > vw + 1){
    out.scroll = { scrollWidth: document.documentElement.scrollWidth, viewportWidth: vw };
  }
  const all = Array.from(document.querySelectorAll('*'));
  for(const el of all){
    const cs = getComputedStyle(el);
    if(cs.display==='none' || cs.visibility==='hidden') continue;
    const rect = el.getBoundingClientRect();
    if(rect.width===0 && rect.height===0) continue;
    const tag = el.tagName.toLowerCase();
    const parent = el.parentElement;

    // Kružna/ikonica dugmad (FAB, ikonice) nisu "puna širina polja" — preskoči ih (širina ~= visina).
    const isIconish = tag==='button' && rect.height>0 && rect.width/rect.height < 1.8;
    if(['input','select','textarea','button'].includes(tag) && parent && !isIconish){
      const pcs = getComputedStyle(parent);
      const elemSiblings = Array.from(parent.children).filter(c=>c.nodeType===1);
      // Ako je roditelj flex-red sa VIŠE dece, širina ovog elementa zavisi i od susednih elemenata
      // (npr. input pored dugmeta za slanje) — to namerno NIJE "puna širina polje", preskoči.
      const isFlexRow = (pcs.display==='flex' || pcs.display==='inline-flex') && (pcs.flexDirection==='row' || pcs.flexDirection==='row-reverse');
      if(!(isFlexRow && elemSiblings.length > 1)){
        const prect = parent.getBoundingClientRect();
        const padL = parseFloat(pcs.paddingLeft)||0, padR = parseFloat(pcs.paddingRight)||0;
        const availW = prect.width - padL - padR;
        if(availW > 0){
          const ratio = rect.width/availW;
          if(ratio >= 0.9 && Math.abs(rect.width-availW) > 2){
            out.control.push({ selector: describeEl(el), width: Math.round(rect.width), parentAvail: Math.round(availW) });
          }
        }
      }
    }

    if(!['fixed','absolute','sticky'].includes(cs.position) && parent){
      const prect = parent.getBoundingClientRect();
      if(prect.width > 0 && rect.right - prect.right > 2){
        out.overflow.push({ selector: describeEl(el), over: Math.round(rect.right-prect.right) });
      }
    }

    const bw = { t:parseFloat(cs.borderTopWidth)||0, r:parseFloat(cs.borderRightWidth)||0, b:parseFloat(cs.borderBottomWidth)||0, l:parseFloat(cs.borderLeftWidth)||0 };
    const bst = { t:cs.borderTopStyle, r:cs.borderRightStyle, b:cs.borderBottomStyle, l:cs.borderLeftStyle };
    const solidCount = ['t','r','b','l'].filter(k=> bst[k]==='solid' && bw[k]>0).length;
    const zeroCount = ['t','r','b','l'].filter(k=> bw[k]===0 || bst[k]==='none').length;
    if(solidCount >= 3 && zeroCount >= 1){
      out.border.push({ selector: describeEl(el), widths: bw });
    }
  }
  return out;
}

function mergeInto(bucket, key, res){
  if(res.scroll || res.control.length || res.overflow.length || res.border.length){
    bucket.push({ key, scroll: res.scroll, control: res.control, overflow: res.overflow, border: res.border });
  }
}

async function main(){
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style'); s.textContent = '*{transition:none !important;}';
      document.head.appendChild(s);
    });
  });
  await page.goto(PROTO_URL);

  const violations = [];
  let checked = 0;

  for(const width of WIDTHS){
    await page.setViewportSize({ width, height: 900 });
    for(const theme of THEMES){
      for(const preset of PRESETS){
        await page.evaluate(()=>{ localStorage.clear(); });
        await page.reload();
        await page.waitForTimeout(100);
        await page.evaluate((p)=> window.AIK.Actions.Dev.setPreset(p), preset);
        // Faza 11: uloga admin uključena za SVE kombinacije — neškodljivo za ne-admin rute, a bez ovoga
        // app/admin* rute ne bi ni renderovale sadržaj (404 za ulogu korisnik, videti ADMIN_SPEC 2).
        await page.evaluate(()=> window.AIK.store.setState(s=>({user:Object.assign({},s.user,{role:'admin'})})));
        await page.evaluate((t)=>{ document.documentElement.setAttribute('data-theme', t); }, theme);
        for(const route of ROUTES){
          await page.evaluate((r)=> window.AIK.store.navigate(r), route);
          await page.waitForTimeout(100);
          const res = await page.evaluate(runChecksInPage);
          checked++;
          mergeInto(violations, `${preset} | ${route} | ${width}px | ${theme}`, res);

          // Podešavanja na mobilnoj širini: svaki tab je interno stanje (ne URL), pa se otvara klikom.
          if(route==='app/podesavanja' && width <= 1023){
            for(const label of SETTINGS_SUBTABS){
              const clicked = await page.evaluate((lbl)=>{
                const els = Array.from(document.querySelectorAll('button, a, div, span'));
                const match = els.find(e=> e.children.length===0 && e.textContent.trim()===lbl);
                const row = match ? match.closest('[class*="mobile-settings"], button, a') || match : null;
                if(row){ row.click(); return true; }
                return false;
              }, label);
              if(!clicked) continue;
              await page.waitForTimeout(120);
              const res2 = await page.evaluate(runChecksInPage);
              checked++;
              mergeInto(violations, `${preset} | app/podesavanja/${label} | ${width}px | ${theme}`, res2);
              await page.evaluate((r)=> window.AIK.store.navigate(r), route);
              await page.waitForTimeout(100);
            }
          }

          // Fakture: pod-tabovi su takođe interni state (sub-tabs), proveri Klijenti i Ponavljajuće.
          if(route==='app/fakture'){
            for(const label of FAKTURE_SUBTABS){
              const clicked = await page.evaluate((lbl)=>{
                const btns = Array.from(document.querySelectorAll('button.sub-tab'));
                const btn = btns.find(b=> b.textContent.trim().startsWith(lbl));
                if(btn){ btn.click(); return true; }
                return false;
              }, label);
              if(!clicked) continue;
              await page.waitForTimeout(120);
              const res3 = await page.evaluate(runChecksInPage);
              checked++;
              mergeInto(violations, `${preset} | app/fakture/${label} | ${width}px | ${theme}`, res3);
            }
          }

          // Uvoz: dublji koraci (vidi UVOZ_STEPS) — svaki iz svežeg mount-a (app/pocetna pa app/uvoz).
          if(route==='app/uvoz'){
            for(const [label, script] of Object.entries(UVOZ_STEPS)){
              await page.evaluate(()=> window.AIK.store.navigate('app/pocetna'));
              await page.waitForTimeout(50);
              await page.evaluate((r)=> window.AIK.store.navigate(r), 'app/uvoz');
              await page.waitForTimeout(100);
              await page.evaluate(script);
              await page.waitForTimeout(100);
              const res4 = await page.evaluate(runChecksInPage);
              checked++;
              mergeInto(violations, `${preset} | app/uvoz/${label} | ${width}px | ${theme}`, res4);
            }
          }

          // Admin: "Odobri besplatan pristup" je modal/sheet preko Korisnika, ne sopstvena ruta.
          if(route==='app/admin/korisnici'){
            for(const [label, script] of Object.entries(ADMIN_STEPS)){
              await page.evaluate((r)=> window.AIK.store.navigate(r), route);
              await page.waitForTimeout(80);
              await page.evaluate(script);
              await page.waitForTimeout(100);
              const res5 = await page.evaluate(runChecksInPage);
              checked++;
              mergeInto(violations, `${preset} | app/admin/${label} | ${width}px | ${theme}`, res5);
            }
          }
        }
      }
    }
  }

  await browser.close();
  const report = { checked, violationCount: violations.length, violations };
  fs.writeFileSync(path.resolve(OUT), JSON.stringify(report, null, 1));
  console.log(JSON.stringify({ checked, combosWithViolations: violations.length, out: path.resolve(OUT) }, null, 1));
  if(violations.length) process.exitCode = 1;
}
main().catch(e=>{ console.error(e); process.exit(1); });
