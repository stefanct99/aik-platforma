#!/usr/bin/env node
/*
 * NaN/undefined sweep — reusable preko svih Faza 10 krugova (Korak 3: "posle svake faze NaN sweep").
 * node nan-sweep.js
 * Za svaki preset (Dev.setPreset) x svaku glavnu rutu, učitava stranicu i traži NaN/undefined/null/
 * [object/Invalid Date u vidljivom tekstu. Izlaz: lista problema (prazna = čisto) + broj kombinacija.
 */
const { chromium } = require('playwright');
const PROTO_URL = 'http://localhost:8743/preview.html';
const PRESETS = ['new','onboarding','trial','trial_ending','expired','active','payment_failed','canceled'];
const ROUTES = ['app/pocetna','app/fakture','app/knjiga','app/mejlovi','app/porez','app/kalendar',
  'app/obavestenja','app/ai','app/pretplata','app/podesavanja','app/uvoz',
  'app/admin','app/admin/korisnici','app/admin/dnevnik','app/admin/podrska'];
const BAD = ['NaN','undefined','null','[object','Invalid Date'];
// Faza 11, Korak 7: "Odobri besplatan pristup" (modal/sheet, ne sopstvena ruta) — proverava generisanih
// 128+ korisnika i 48-stavki dnevnik za NaN/undefined u datumima/brojevima (najverovatnije mesto grešaka
// u determinističkom generatoru, Korak 3/Korak 4 seed.js).
const ADMIN_STEPS = {
  'Odobri pristup modal': "(function(){ const b=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Odobri besplatan pristup'); if(b) b.click(); })()",
};

// Round 28, Korak 6: app/uvoz je samo Uv1 (izbor) u gornjem statičkom ROUTES prolazu — ovde dodatno
// provlačimo tok do dubljih koraka (učitavanje, čitanje, provera, ručni unos, gotovo) preko svih preset-a,
// jer su tu izračunati iznosi/brojevi fakture (najverovatnije mesto za NaN), ne na samom Uv1 ekranu.
const UVOZ_STEPS = {
  'Uv2 upload': "(function(){ Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Dalje').click(); })()",
  'Uv3/Uv4 dokumenta': "(async()=>{ Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Dalje').click(); await new Promise(r=>setTimeout(r,80)); const input=document.querySelector('input[type=file]'); const file=new File(['x'],'test.pdf',{type:'application/pdf'}); const dt=new DataTransfer(); dt.items.add(file); input.files=dt.files; input.dispatchEvent(new Event('change',{bubbles:true})); await new Promise(r=>setTimeout(r,80)); Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Pročitaj dokumenta').click(); await new Promise(r=>setTimeout(r,2700)); })()",
  'Uv5 ručni unos': "(async()=>{ const radio=Array.from(document.querySelectorAll('.uvoz-radio-card')).find(e=>e.textContent.includes('Unesi ručno')); radio.click(); await new Promise(r=>setTimeout(r,80)); Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Dalje').click(); })()",
};

async function main(){
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(PROTO_URL);
  let checked = 0;
  const problems = [];
  for(const preset of PRESETS){
    await page.evaluate(()=>{ localStorage.clear(); });
    await page.reload();
    await page.waitForTimeout(100);
    await page.evaluate((p)=> window.AIK.Actions.Dev.setPreset(p), preset);
    await page.evaluate(()=> window.AIK.store.setState(s=>({user:Object.assign({},s.user,{role:'admin'})})));
    for(const route of ROUTES){
      await page.evaluate((r)=> window.AIK.store.navigate(r), route);
      await page.waitForTimeout(80);
      const text = await page.evaluate(()=> document.body.innerText);
      checked++;
      for(const bad of BAD){
        if(text.includes(bad)){
          problems.push({ preset, route, bad, context: text.slice(Math.max(0,text.indexOf(bad)-40), text.indexOf(bad)+40) });
        }
      }
    }
    // Uvoz — dublji koraci (vidi UVOZ_STEPS gore), svaki iz svežeg mount-a (app/pocetna pa app/uvoz).
    for(const [label, script] of Object.entries(UVOZ_STEPS)){
      await page.evaluate(()=> window.AIK.store.navigate('app/pocetna'));
      await page.waitForTimeout(50);
      await page.evaluate((r)=> window.AIK.store.navigate(r), 'app/uvoz');
      await page.waitForTimeout(100);
      await page.evaluate(script);
      await page.waitForTimeout(80);
      const text = await page.evaluate(()=> document.body.innerText);
      checked++;
      for(const bad of BAD){
        if(text.includes(bad)){
          problems.push({ preset, route:'app/uvoz: '+label, bad, context: text.slice(Math.max(0,text.indexOf(bad)-40), text.indexOf(bad)+40) });
        }
      }
    }
    // Admin — "Odobri besplatan pristup" (vidi ADMIN_STEPS gore), iz app/admin/korisnici.
    for(const [label, script] of Object.entries(ADMIN_STEPS)){
      await page.evaluate((r)=> window.AIK.store.navigate(r), 'app/admin/korisnici');
      await page.waitForTimeout(80);
      await page.evaluate(script);
      await page.waitForTimeout(80);
      const text2 = await page.evaluate(()=> document.body.innerText);
      checked++;
      for(const bad of BAD){
        if(text2.includes(bad)){
          problems.push({ preset, route:'app/admin/korisnici: '+label, bad, context: text2.slice(Math.max(0,text2.indexOf(bad)-40), text2.indexOf(bad)+40) });
        }
      }
    }
  }
  await browser.close();
  console.log(JSON.stringify({ checked, problems }, null, 2));
  if(problems.length) process.exitCode = 1;
}
main();
