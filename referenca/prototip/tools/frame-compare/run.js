#!/usr/bin/env node
/*
 * Faza 10, korak 1: automatizovano poređenje frejma i prototipa.
 * node run.js jobs.json > out.json
 *
 * Svaki posao (job) u jobs.json:
 *   { "name": "Sub1 (Probni, Pretplata je uskoro)",
 *     "frame": "/apsolutna/putanja/Sub1.dc.html",
 *     "device": "desktop" | "phone",
 *     "route": "app/pocetna",
 *     "setup": "window.AIK.Actions.Dev.setPreset('trial_ending')" }
 *
 * Izlaz: { summary, jobs: [ { name, light:{matched,missingInProto,extraInProto,diffs}, dark:{...} } ] }
 */
const { chromium } = require('playwright');
const path = require('path');
const { ALL_PROPS, pageExtractFn } = require('./extract');

const PROTO_URL = 'http://localhost:8743/preview.html';
// Faza 10, osmi krug, korak 1a: poređenje piksel-po-piksel sad ide na TAČNOJ širini frejmovog platna
// (365/1440), ne na 390/1280 (CLAUDE.md-ova "predstavlja" širina) — ranije brojke odstupanja (749, 772, 695
// za Početnu) su mešale stvarne greške sa šumom platna (svaki element koji puni roditelja dobijao je lažnu
// width/height razliku). 390/1280 i dalje postoje kao RANGE_CHECK_WIDTH ispod — posebna, ne-piksel provera
// da raspon 365→390 (telefon) i 1280→1440 (desktop) ne lomi raspored (preklapanje, vodoravno sečenje).
const DEVICE_WIDTH = { desktop: 1440, phone: 365 };
const RANGE_CHECK_WIDTH = { desktop: 1280, phone: 390 };
const FRAME_VIEWPORT = { desktop: { width: 3000, height: 2200 }, phone: { width: 900, height: 2200 } };

// Svojstva gde se poredi NUMERIČKA (px) vrednost sa tolerancijom od 1px (zaokruživanje flex-a),
// i svojstva gde mora biti string-identično.
const PX_PROPS = ['fontSize','paddingTop','paddingRight','paddingBottom','paddingLeft',
  'marginTop','marginRight','marginBottom','marginLeft','borderTopWidth','borderRadius','gap','width','height','lineHeight'];

function parsePx(v){
  if(typeof v==='number') return v; // width/height dolaze kao broj (getBoundingClientRect), ne "Npx" string
  const m = /^(-?\d+(\.\d+)?)px$/.exec(v||''); return m ? parseFloat(m[1]) : null;
}

// Od osmog kruga DEVICE_WIDTH===frejmova platno (365/1440), pa width/height diff ovde više NIJE šum platna —
// svaka preostala width/height razlika je ili zaokruživanje (±1px tolerancija ispod) ili stvarna greška.
// Raniji pokušaj skaliranja (390/365) je napušten još u 6. krugu (kvario fiksne elemente) i više nije relevantan.
function diffStyles(a, b){
  const diffs = [];
  for(const p of ALL_PROPS){
    const va = a[p], vb = b[p];
    if(va===vb) continue;
    if(PX_PROPS.includes(p)){
      const na = parsePx(va), nb = parsePx(vb);
      if(na!=null && nb!=null && Math.abs(na-nb)<=1) continue;
    }
    diffs.push({ prop:p, frame: va, proto: vb });
  }
  return diffs;
}

async function extractPanels(page, framePath){
  await page.goto('file://'+framePath);
  await page.waitForTimeout(200);
  const panelHandles = await page.$$('x-dc > div > div');
  if(panelHandles.length < 2) throw new Error('Nema 2 panela u '+framePath);
  const origins = await page.evaluate(() => {
    const root = document.querySelector('x-dc > div');
    const kids = Array.from(root.children).filter(c=>c.tagName==='DIV');
    return kids.map(k=>{ const r=k.getBoundingClientRect(); return {x:r.left, y:r.top}; });
  });
  const light = await panelHandles[0].evaluate(pageExtractFn, { originX: origins[0].x, originY: origins[0].y, propsList: ALL_PROPS });
  const dark  = await panelHandles[1].evaluate(pageExtractFn, { originX: origins[1].x, originY: origins[1].y, propsList: ALL_PROPS });
  return { light, dark };
}

async function extractProto(page, job, theme, width){
  await page.setViewportSize({ width, height: 1000 });
  // navigacija na neutralnu rutu prvo, da se ekran sa lokalnim state-om (step/tab) uvek montira iznova
  await page.evaluate(()=> window.AIK.store.navigate('app/pocetna'));
  await page.waitForTimeout(50);
  if(job.setup) await page.evaluate(job.setup);
  await page.evaluate((t)=>{ document.documentElement.setAttribute('data-theme', t); }, theme);
  await page.evaluate((r)=> window.AIK.store.navigate(r), job.route);
  await page.waitForTimeout(150);
  if(job.afterNav){
    await page.evaluate(job.afterNav);
    await page.waitForTimeout(job.afterNavWait || 150);
  }
  const bodyHandle = await page.$('body');
  return bodyHandle.evaluate(pageExtractFn, { originX:0, originY:0, propsList: ALL_PROPS });
}

// Deljeni "chrome" (sidebar nav, topbar, bottom-nav, avatar/user) ponavlja se na SVAKOM frejmu i ekranu —
// već je ručno proveren u ranijim fazama. Izostavljen iz poređenja da bi tabela odstupanja ostala čitljiva
// i fokusirana na sadržaj specifičan za Pretplatu (ono što je ova faza stvarno menjala).
const CHROME_TEXTS = new Set([
  'Početna','Fakture','Knjiga prihoda','Kalendar','Porez i rokovi','Mejlovi banke','AI knjigovođa','Podešavanja',
  'Pretraži fakture, klijente, uplate','Nova faktura','Stefan Milošević','Stephortless PR','tvoj','AI','knjigovođa',
  'Porez','Više','Faktura','S','Pretplata','/','Upravljanje','Plan, način plaćanja i svi računi na jednom mestu.',
]);
function stripChrome(els){ return els.filter(e=> !CHROME_TEXTS.has(e.text)); }

// Faza 10, deseti krug, korak 1b: uparivanje po TEKSTU + STRUKTURI/POZICIJI, ne više samo po dokument-redosledu.
// Stari pristup (uzmi N-to preostalo pojavljivanje istog teksta) je davao LAŽNE greške kad se isti tekst
// pojavljuje VIŠE PUTA u istom redu na različitim mestima (npr. "Nacrt" i kao plain-tekst broj-placeholder
// I kao obojena status-značka u istom redu tabele) — pogrešan par je uparen, pa je stvarno tačna značka
// prijavljena kao "pogrešna boja". Sada, kad ima VIŠE kandidata sa istim tekstom, biramo strukturno
// najbliži: isti HTML tag ima prednost, pa najmanja (x,y) razdaljina od frejmovog elementa — ne prvi u redu.
function matchByText(frameEls, protoEls){
  const byText = new Map();
  for(const el of protoEls){
    if(!byText.has(el.text)) byText.set(el.text, []);
    byText.get(el.text).push(el);
  }
  const matched = [], missingInProto = [];
  for(const fel of frameEls){
    const bucket = byText.get(fel.text);
    if(bucket && bucket.length){
      let bestIdx = 0;
      if(bucket.length > 1){
        // Tag NIJE pouzdan signal ovde: frejm je ručno pisan HTML (skoro sve je <span>), a naš kod bira
        // semantički tag (<td>, <button>...) — isti tekst u frejmu i kodu često ima RAZLIČIT tag iako je
        // isti element. Pozicija (x,y) je pouzdaniji signal: frejm i proto su na istoj tačnoj širini platna
        // (deseti krug, korak 1a prošle faze), pa isti element pada na približno isto mesto.
        let bestScore = Infinity;
        bucket.forEach((cand, i)=>{
          const dist = Math.abs(cand.x-fel.x) + Math.abs(cand.y-fel.y);
          if(dist < bestScore){ bestScore = dist; bestIdx = i; }
        });
      }
      matched.push([fel, bucket.splice(bestIdx,1)[0]]);
    } else {
      missingInProto.push(fel);
    }
  }
  const extraInProto = [];
  for(const arr of byText.values()) extraInProto.push(...arr);
  return { matched, missingInProto, extraInProto };
}

// Faza 10, osmi krug, korak 1a: posebna provera RASPONA na 390/1280 (CLAUDE.md "predstavlja" širina) —
// NE piksel-po-piksel protiv frejma (frejm je crtan na 365/1440, poređenje na drugoj širini bi bilo besmisleno),
// nego samo da li se raspored lomi (vodoravno sečenje stranice) kad se širina pomeri sa tačne frejmove na ovu.
async function checkRange(page, job, width){
  await page.evaluate(()=>{ localStorage.clear(); });
  await page.reload();
  await page.waitForTimeout(100);
  await page.setViewportSize({ width, height: 1000 });
  await page.evaluate(()=> window.AIK.store.navigate('app/pocetna'));
  await page.waitForTimeout(50);
  if(job.setup) await page.evaluate(job.setup);
  await page.evaluate((r)=> window.AIK.store.navigate(r), job.route);
  await page.waitForTimeout(150);
  if(job.afterNav){ await page.evaluate(job.afterNav); await page.waitForTimeout(job.afterNavWait || 150); }
  return page.evaluate(()=> ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
}

async function main(){
  const jobsPath = process.argv[2];
  const jobs = JSON.parse(require('fs').readFileSync(jobsPath, 'utf8'));
  const browser = await chromium.launch();
  const framePage = await browser.newPage();
  const protoPage = await browser.newPage();

  const results = [];
  let totalFrameEls = 0, totalDiffs = 0, totalMatched = 0;

  // Transition-greška nađena u 2. krugu: body/boje imaju 200ms CSS tranziciju (--duration-base), a čitanje
  // stilova 150ms posle promene teme je uhvatilo PRELAZNU (blend) boju kao da je "odstupanje". addInitScript
  // (ne addStyleTag — taj se gubi na svaki reload) ubacuje ovo pre SVAKOG učitavanja dokumenta.
  await protoPage.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style'); s.textContent = '*{transition:none !important;}';
      document.head.appendChild(s);
    });
  });
  // Faza 10, sedmi krug, korak 1a: zamrznut sat na jutro istog dana kao Seed.TODAY (15. nov 2026, 09:00) —
  // frejmovi dosledno pretpostavljaju jutro ("Dobro jutro"); bez ovoga `new Date().getHours()` u
  // GreetingBanner-u čita STVARNI sat izvršavanja alata, pa tekst zavisi od doba dana kad se alat pokrene.
  await protoPage.clock.install({ time: new Date(2026, 10, 15, 9, 0, 0).getTime() });
  await protoPage.goto(PROTO_URL);
  for(const job of jobs){
    // čist localStorage pre svakog posla (bez prljanja stanja iz prethodnog)
    await protoPage.evaluate(()=>{ localStorage.clear(); });
    await protoPage.reload();
    await protoPage.waitForTimeout(100);
    const framePath = path.resolve(job.frame);
    await framePage.setViewportSize(FRAME_VIEWPORT[job.device]);
    const { light, dark } = await extractPanels(framePage, framePath);
    const width = DEVICE_WIDTH[job.device];
    const jobResult = { name: job.name, frame: job.frame, device: job.device, route: job.route };
    for(const theme of ['light','dark']){
      const frameEls = stripChrome(theme==='light' ? light : dark);
      const protoEls = stripChrome(await extractProto(protoPage, job, theme, width));
      const { matched, missingInProto, extraInProto } = matchByText(frameEls, protoEls);
      const diffRows = [];
      for(const [fel, pel] of matched){
        const d = diffStyles(fel.styles, pel.styles);
        if(d.length){
          for(const dd of d) diffRows.push({ text: fel.text, tag: fel.tag, ...dd });
        }
      }
      totalFrameEls += frameEls.length;
      totalMatched += matched.length;
      totalDiffs += diffRows.length;
      jobResult[theme] = {
        frameElementCount: frameEls.length,
        protoElementCount: protoEls.length,
        matchedCount: matched.length,
        missingInProto: missingInProto.map(e=>e.text),
        extraInProtoCount: extraInProto.length,
        diffs: diffRows,
      };
    }
    const rangeWidth = RANGE_CHECK_WIDTH[job.device];
    const range = await checkRange(protoPage, job, rangeWidth);
    jobResult.rangeCheck = { width: rangeWidth, scrollWidth: range.scrollWidth, clientWidth: range.clientWidth, overflow: range.scrollWidth > range.clientWidth + 1 };
    results.push(jobResult);
    process.stderr.write('done: '+job.name+'\n');
  }

  await browser.close();
  const rangeOverflows = results.filter(r=>r.rangeCheck.overflow).map(r=>r.name);
  console.log(JSON.stringify({
    summary: { jobs: jobs.length, totalFrameElements: totalFrameEls, totalMatched, totalDiffs, rangeOverflows },
    results,
  }, null, 1));
}

main().catch(e=>{ console.error(e); process.exit(1); });
