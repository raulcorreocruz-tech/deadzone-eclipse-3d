import { chromium } from 'playwright';
const base = process.env.DZ_URL || 'https://deadzone-eclipse-coop.onrender.com/';
const browser = await chromium.launch({headless:true,executablePath:process.env.DZ_CHROME_PATH||'/usr/bin/google-chrome',args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});
let failures=0;
for (const mobile of [true,false]) {
 const name=mobile?'ANDROID_LANDSCAPE':'DESKTOP';
 const context=await browser.newContext({viewport:mobile?{width:915,height:412}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2.5:1,ignoreHTTPSErrors:true});
 const page=await context.newPage();
 const errors=[],requests=[];
 page.on('pageerror',err=>errors.push('JS '+err.message));
 page.on('console',msg=>{if(msg.type()==='error')errors.push('CONSOLE '+msg.text().slice(0,500));});
 page.on('requestfailed',req=>requests.push(req.url()+' '+(req.failure()?.errorText||'')));
 try {
  await page.goto(base+'?smoke='+Date.now(),{waitUntil:'domcontentloaded',timeout:75000});
  await page.waitForTimeout(4500);
  const prior=await page.evaluate(()=>({build:document.querySelector('meta[name="deadzone-build"]')?.content||'',mobileMode:typeof MOBILE_MODE==='undefined'?'missing':String(MOBILE_MODE),canvas:!!document.querySelector('#game canvas'),startAssigned:typeof document.querySelector('#start')?.onclick,buttons:[...document.querySelectorAll('#mainMenu button')].filter(x=>/gr[aá]fic|ajustes/i.test(x.textContent)).map(x=>x.textContent)}));
  const settingsButton=page.locator('#dz526-prestart-graphics');
  if(await settingsButton.count()){
    await settingsButton.click({timeout:10000});
    if(!await page.locator('#dz526-settings').isVisible())throw Error('Pre-start graphics panel did not open');
    await page.locator('#dz526-settings button').filter({hasText:'CANCELAR'}).click();
  }
  const start=page.locator('#start');
  if(await start.count()){await start.scrollIntoViewIfNeeded();await start.click({timeout:10000});await page.waitForTimeout(4800);}
  const after=await page.evaluate(()=>({menuHidden:document.querySelector('#mainMenu')?.classList.contains('hidden'),hudHidden:document.querySelector('#hud')?.classList.contains('hidden'),feedback:document.querySelector('#dz-start-feedback')?.textContent||'',canvas:!!document.querySelector('#game canvas'),loadedScripts:[...document.scripts].map(s=>s.type+':'+(s.src||'inline')).slice(-8)}));
  const report={name,prior,after,errors:errors.slice(0,12),requests:requests.slice(0,12)};
  console.log('DEAD_ZONE_SMOKE '+JSON.stringify(report));
  if(!after.menuHidden||after.hudHidden||errors.some(e=>/ReferenceError|SyntaxError|Cannot access|is not defined/.test(e)))failures++;
 }catch(e){failures++;console.error('DEAD_ZONE_SMOKE_EXCEPTION '+name+' '+String(e).slice(0,1500)+' errors='+errors.join(' | '));}
 finally {await context.close();}
}
await browser.close();
if(failures){console.error('SMOKE FAILED IN '+failures+' MODES');process.exit(1);}
console.log('SMOKE PASSED ALL MODES');
