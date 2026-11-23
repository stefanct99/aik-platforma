#!/usr/bin/env node
/*
 * Faza 10, trinaesti krug, korak 0: snima SVE kombinacije (svetla/tamna tema) za svaki posao iz date
 * jobs-datoteke, čuva frejm|prototip parove u folder, i za poslove sa odstupanjima iznad praga pravi
 * JEDNU kontakt-sliku (frejm levo, prototip desno, oba teme jedna ispod druge) da se pregled ne radi
 * slika-po-slika nego samo za ono što stvarno odstupa.
 *
 * node shoot.js <jobs.json> <outDir> [--threshold=N]
 * Izlaz: <outDir>/<posao>/frame-light.png, proto-light.png, frame-dark.png, proto-dark.png,
 *        <outDir>/<posao>/contact.png (SAMO ako je broj odstupanja >= prag)
 *        <outDir>/manifest.json (spisak poslova, broj odstupanja, da li ima contact.png)
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { ALL_PROPS, pageExtractFn } = require('./extract');

const PROTO_URL = 'http://localhost:8743/preview.html';
const DEVICE_WIDTH = { desktop: 1440, phone: 365 };
const FRAME_VIEWPORT = { desktop: { width: 3000, height: 2600 }, phone: { width: 900, height: 2600 } };
const PX_PROPS = ['fontSize','paddingTop','paddingRight','paddingBottom','paddingLeft',
  'marginTop','marginRight','marginBottom','marginLeft','borderTopWidth','borderRadius','gap','width','height','lineHeight'];

function parsePx(v){ if(typeof v==='number') return v; const m=/^(-?\d+(\.\d+)?)px$/.exec(v||''); return m?parseFloat(m[1]):null; }
function diffStyles(a,b){
  const diffs=[];
  for(const p of ALL_PROPS){
    const va=a[p], vb=b[p];
    if(va===vb) continue;
    if(PX_PROPS.includes(p)){ const na=parsePx(va), nb=parsePx(vb); if(na!=null&&nb!=null&&Math.abs(na-nb)<=1) continue; }
    diffs.push({prop:p});
  }
  return diffs;
}
const CHROME_TEXTS = new Set([
  'Početna','Fakture','Knjiga prihoda','Kalendar','Porez i rokovi','Mejlovi banke','AI knjigovođa','Podešavanja',
  'Pretraži fakture, klijente, uplate','Nova faktura','Stefan Milošević','Stephortless PR','tvoj','AI','knjigovođa',
  'Porez','Više','Faktura','S','Pretplata','/','Upravljanje','Plan, način plaćanja i svi računi na jednom mestu.',
]);
function stripChrome(els){ return els.filter(e=> !CHROME_TEXTS.has(e.text)); }
function matchByText(frameEls, protoEls){
  const byText = new Map();
  for(const el of protoEls){ if(!byText.has(el.text)) byText.set(el.text,[]); byText.get(el.text).push(el); }
  const matched=[];
  for(const fel of frameEls){
    const bucket = byText.get(fel.text);
    if(bucket && bucket.length){
      let bestIdx=0;
      if(bucket.length>1){ let bestScore=Infinity; bucket.forEach((cand,i)=>{ const d=Math.abs(cand.x-fel.x)+Math.abs(cand.y-fel.y); if(d<bestScore){bestScore=d;bestIdx=i;} }); }
      matched.push([fel, bucket.splice(bestIdx,1)[0]]);
    }
  }
  return matched;
}

function safeName(s){ return s.replace(/[^a-zA-Z0-9_-]+/g,'_').slice(0,80); }

async function shootFramePanels(framePage, framePath){
  await framePage.goto('file://'+framePath);
  await framePage.waitForTimeout(200);
  const panels = await framePage.$$('x-dc > div > div');
  if(panels.length<2) throw new Error('Nema 2 panela u '+framePath);
  const lightBuf = await panels[0].screenshot();
  const darkBuf = await panels[1].screenshot();
  const origins = await framePage.evaluate(()=>{
    const root=document.querySelector('x-dc > div');
    const kids=Array.from(root.children).filter(c=>c.tagName==='DIV');
    return kids.map(k=>{ const r=k.getBoundingClientRect(); return {x:r.left,y:r.top}; });
  });
  const light = await panels[0].evaluate(pageExtractFn, {originX:origins[0].x, originY:origins[0].y, propsList:ALL_PROPS});
  const dark = await panels[1].evaluate(pageExtractFn, {originX:origins[1].x, originY:origins[1].y, propsList:ALL_PROPS});
  return { lightBuf, darkBuf, light, dark };
}

async function shootProto(protoPage, job, theme, width){
  await protoPage.evaluate(()=>{ localStorage.clear(); });
  await protoPage.reload();
  await protoPage.waitForTimeout(100);
  await protoPage.setViewportSize({width, height:1000});
  await protoPage.evaluate(()=> window.AIK.store.navigate('app/pocetna'));
  await protoPage.waitForTimeout(50);
  if(job.setup) await protoPage.evaluate(job.setup);
  await protoPage.evaluate((t)=>{ document.documentElement.setAttribute('data-theme', t); }, theme);
  await protoPage.evaluate((r)=> window.AIK.store.navigate(r), job.route);
  await protoPage.waitForTimeout(150);
  if(job.afterNav){ await protoPage.evaluate(job.afterNav); await protoPage.waitForTimeout(job.afterNavWait||150); }
  const buf = await protoPage.screenshot({ fullPage:true });
  const bodyHandle = await protoPage.$('body');
  const els = await bodyHandle.evaluate(pageExtractFn, {originX:0, originY:0, propsList:ALL_PROPS});
  return { buf, els };
}

async function buildContactSheet(composerPage, outDir, jobName, paths){
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;font-family:sans-serif;background:#ddd;}
    .row{display:flex;gap:4px;border-bottom:4px solid #333;}
    .cell{flex:1;min-width:0;background:#fff;}
    .cell img{width:100%;display:block;}
    .lbl{font-size:14px;padding:4px 8px;background:#333;color:#fff;}
  </style></head><body>
    <div class="row"><div class="cell"><div class="lbl">FRAME · light</div><img src="file://${paths.frameLight}"></div><div class="cell"><div class="lbl">PROTO · light</div><img src="file://${paths.protoLight}"></div></div>
    <div class="row"><div class="cell"><div class="lbl">FRAME · dark</div><img src="file://${paths.frameDark}"></div><div class="cell"><div class="lbl">PROTO · dark</div><img src="file://${paths.protoDark}"></div></div>
  </body></html>`;
  const htmlPath = path.join(outDir, 'contact.html');
  fs.writeFileSync(htmlPath, html);
  await composerPage.goto('file://'+htmlPath);
  await composerPage.waitForTimeout(300);
  await composerPage.screenshot({ path: path.join(outDir,'contact.png'), fullPage:true });
}

async function main(){
  const jobsPath = process.argv[2];
  const outDir = path.resolve(process.argv[3]);
  const thresholdArg = process.argv.find(a=>a.startsWith('--threshold='));
  const threshold = thresholdArg ? Number(thresholdArg.split('=')[1]) : 15;
  const jobs = JSON.parse(fs.readFileSync(jobsPath,'utf8'));
  fs.mkdirSync(outDir, { recursive:true });

  const browser = await chromium.launch();
  const framePage = await browser.newPage();
  const protoPage = await browser.newPage();
  const composerPage = await browser.newPage();
  await composerPage.setViewportSize({width:1000, height:50});

  await protoPage.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style'); s.textContent = '*{transition:none !important;}';
      document.head.appendChild(s);
    });
  });
  await protoPage.clock.install({ time: new Date(2026,10,15,9,0,0).getTime() });
  await protoPage.goto(PROTO_URL);

  const manifest = [];
  for(const job of jobs){
    const jobDir = path.join(outDir, safeName(job.name));
    fs.mkdirSync(jobDir, { recursive:true });
    const framePath = path.resolve(job.frame);
    await framePage.setViewportSize(FRAME_VIEWPORT[job.device]);
    const frameShots = await shootFramePanels(framePage, framePath);
    fs.writeFileSync(path.join(jobDir,'frame-light.png'), frameShots.lightBuf);
    fs.writeFileSync(path.join(jobDir,'frame-dark.png'), frameShots.darkBuf);

    const width = DEVICE_WIDTH[job.device];
    let totalDiffs = 0;
    const protoShotPaths = {};
    for(const theme of ['light','dark']){
      const proto = await shootProto(protoPage, job, theme, width);
      const fp = path.join(jobDir, 'proto-'+theme+'.png');
      fs.writeFileSync(fp, proto.buf);
      protoShotPaths[theme] = fp;
      const frameEls = stripChrome(theme==='light'?frameShots.light:frameShots.dark);
      const protoEls = stripChrome(proto.els);
      const matched = matchByText(frameEls, protoEls);
      for(const [fel,pel] of matched) totalDiffs += diffStyles(fel.styles, pel.styles).length;
    }

    const entry = { name: job.name, dir: jobDir, diffs: totalDiffs, contactSheet: null };
    if(totalDiffs >= threshold){
      await buildContactSheet(composerPage, jobDir, job.name, {
        frameLight: path.join(jobDir,'frame-light.png'), protoLight: protoShotPaths.light,
        frameDark: path.join(jobDir,'frame-dark.png'), protoDark: protoShotPaths.dark,
      });
      entry.contactSheet = path.join(jobDir,'contact.png');
    }
    manifest.push(entry);
    process.stderr.write('shot: '+job.name+' (diffs='+totalDiffs+(entry.contactSheet?', KONTAKT-SLIKA':'')+')\n');
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir,'manifest.json'), JSON.stringify(manifest,null,1));
  const flagged = manifest.filter(m=>m.contactSheet);
  console.log(JSON.stringify({ outDir, threshold, totalJobs: jobs.length, flagged: flagged.map(f=>({name:f.name, diffs:f.diffs, contactSheet:f.contactSheet})) }, null, 1));
}
main().catch(e=>{ console.error(e); process.exit(1); });
