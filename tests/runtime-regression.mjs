import {chromium} from 'playwright';
import fs from 'node:fs';

const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});
const modes=[{name:'android-landscape',viewport:{width:915,height:412},mobile:true},{name:'desktop',viewport:{width:1280,height:720},mobile:false}];
const results=[];
try{
 for(const mode of modes){
  const ctx=await browser.newContext({viewport:mode.viewport,isMobile:mode.mobile,hasTouch:mode.mobile,deviceScaleFactor:mode.mobile?2:1});
  const page=await ctx.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3000/',{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('#start').waitFor({timeout:40000});
  await page.locator('#dz43SkinsButton').click();
  if(await page.locator('#dz43SkinsPanel button[aria-pressed]').count()!==6)throw Error(mode.name+': skins missing');
  await page.locator('#dz43SkinsPanel button').first().click();
  await page.locator('#dz43NewsButton').click();
  if(!await page.locator('#dz43NewsPanel').isVisible())throw Error(mode.name+': no changelog');
  await page.locator('#dz43NewsPanel button').first().click();
  await page.locator('#start').click();
  await page.waitForTimeout(800);
  const auditReady=await page.evaluate(()=>typeof window.__dzRegression==='object');
  if(!auditReady)throw Error(mode.name+': instrumentation missing');
  await page.evaluate(()=>window.__dzRegression.spawn());
  await page.waitForTimeout(2600);
  const first=await page.evaluate(()=>window.__dzRegression.snapshot());
  await page.waitForTimeout(2200);
  const second=await page.evaluate(()=>window.__dzRegression.snapshot());
  const rigged=first.filter(x=>x.rigged);
  for(const [i,z] of first.entries()){
    if(!Number.isFinite(z.height)||z.height<=0)throw Error(mode.name+': invalid zombie height '+JSON.stringify(z));
    if(z.rigged && !(z.height>=z.expected*.67&&z.height<=z.expected*1.65))throw Error(mode.name+': mini/oversized rigged zombie '+JSON.stringify(z));
  }
  for(const z of rigged){
    const next=second.find(y=>y.id===z.id);
    if(next&&!next.crawler && Math.abs(next.height-z.height)/Math.max(.1,z.height)>.4)throw Error(mode.name+': model jumps in scale '+JSON.stringify({first:z,second:next}));
  }
  const critical=errors.filter(e=>/ReferenceError|SyntaxError|Cannot access|is not defined|TypeError/.test(e));
  if(critical.length)throw Error(mode.name+': runtime error '+critical.join('; ').slice(0,600));
  results.push({mode:mode.name,skinPicker:true,changelog:true,started:true,scanned:first.length,rigged:rigged.length,errors:errors.slice(0,5)});
  await ctx.close();
 }
}finally{await browser.close()}
fs.writeFileSync('audit-runtime-results.json',JSON.stringify({passed:true,modes:results},null,2));
console.log('AUDIT REGRESSIONS PASSED',JSON.stringify(results));
