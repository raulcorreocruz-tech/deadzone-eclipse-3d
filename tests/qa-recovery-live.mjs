import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const BASE=process.env.DZ_URL||'https://deadzone-rubo-eclipse-3d.onrender.com/';
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--no-sandbox','--disable-dev-shm-usage']});
const errors=[];const results=[];
for(const mobile of [false,true]){
 const ctx=await browser.newContext({viewport:mobile?{width:915,height:412}:{width:1280,height:720},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:mobile?2:1,ignoreHTTPSErrors:true});
 await ctx.addInitScript(()=>{try{localStorage.setItem('deadzone_skin_v43',mobile?'hermano_personal':'rubo_personal')}catch{}});
 const page=await ctx.newPage(),fatal=[],network=[],consoles=[];
 page.on('console',msg=>{if(msg.type()==='error')consoles.push(msg.text().slice(0,360))});
 page.on('requestfailed',req=>network.push(req.url()+' '+req.failure()?.errorText));
 page.on('response',resp=>{if(resp.status()>=400)network.push('HTTP '+resp.status()+' '+resp.url())});
 page.on('pageerror',err=>fatal.push(err.message));
 try{
  await page.goto(BASE+'?smoke='+Date.now(),{waitUntil:'domcontentloaded',timeout:85000});
  await page.locator('#start').waitFor({timeout:20000});
  const meta=await page.locator('meta[name="deadzone-build"]').getAttribute('content');
  if(!meta?.startsWith('5.25.26-'))throw Error('Incorrect build '+meta);
  const vars=await page.evaluate(()=>({status:typeof window.__DZ544_STATUS,canvas:!!document.querySelector('#game canvas'),menu:!!document.querySelector('#mainMenu')}));
  if(!vars.menu)throw Error('Game main menu missing');
  await page.locator('#start').click({timeout:15000});
  await page.waitForFunction(()=>window.__DZ544_STATUS?.version==='5.25.24',null,{timeout:13000}).catch(async e=>{const diag=await page.evaluate(()=>({status:window.__DZ544_STATUS,rubo:window.__DZ545_STATUS,started:document.querySelector('#mainMenu')?.className,feedback:document.querySelector('#dz-start-feedback')?.textContent,canvas:!!document.querySelector('canvas'),script:[...document.querySelectorAll('script')].map(e=>({type:e.type,src:e.src})).slice(0,6)}));throw Error('Game engine did not start '+JSON.stringify(diag)+' console '+JSON.stringify(consoles.slice(0,7))+' network '+JSON.stringify(network.slice(0,12))+' '+e.message)});
  if(mobile)await page.waitForFunction(()=>window.__DZ546_STATUS?.atlas===true&&window.__DZ546_STATUS?.visible===true,null,{timeout:19000}).catch(async e=>{const diag=await page.evaluate(()=>({status:window.__DZ546_STATUS,build:document.querySelector('meta[name=deadzone-build]')?.content}));throw Error('Brother atlas/skin unavailable '+JSON.stringify(diag)+' '+e.message)});
  else await page.waitForFunction(()=>window.__DZ545_STATUS?.atlas===true&&window.__DZ545_STATUS?.localVisible===true,null,{timeout:17000}).catch(async e=>{const diagnostics=await page.evaluate(()=>({status:window.__DZ545_STATUS,ready:document.readyState,build:document.querySelector('meta[name=deadzone-build]')?.content}));throw Error('Rubo sprite not ready: '+JSON.stringify(diagnostics)+' '+e.message)});
  const selectedCard=page.locator('#dz43SkinsPanel [data-playable-character="rubo"]');
  if(await selectedCard.count()!==1)throw Error('Rubo is not in the selectable skin menu');
  if(await page.locator('#dz43SkinsPanel [data-playable-character="hermano"]').count()!==1)throw Error('Brother not in character selector');
  await page.waitForTimeout(900);
  const report=await page.evaluate(()=>({
   startClosed:document.querySelector('#mainMenu')?.classList.contains('hidden'),
   hudOpen:!document.querySelector('#hud')?.classList.contains('hidden'),
   status:window.__DZ544_STATUS,
   mask:window.__DZ544_MASK,
   rubo:window.__DZ545_STATUS,
   brother:window.__DZ546_STATUS,
   engine:document.querySelector('#dz-start-feedback')?.textContent||'',
   errors:window.__DZ_ENGINE_ERROR||null
  }));
  if(!report.startClosed||!report.hudOpen)throw Error('Game did not start '+JSON.stringify(report));
  if(!report.status||report.status.version!=='5.25.24')throw Error('v544 runtime missing');
  if(report.mask?.renderedPixelSkins>0&&report.mask.localLegacyVisible!==0)throw Error('3D soldier visible with sprite '+JSON.stringify(report.mask));
  if(mobile){if(!report.brother?.atlas||!report.brother?.visible||report.brother?.skin!=='hermano_personal')throw Error('Brother sprite not visible '+JSON.stringify(report.brother));}
  else if(!report.rubo?.atlas||!report.rubo?.localVisible||report.rubo?.selected!==true)throw Error('Rubo sprite not visible '+JSON.stringify(report.rubo));
  await page.evaluate(()=>window.dispatchEvent(new Event('dz546-test-fire')));
  const fired=await page.evaluate(()=>window.__DZ546_TEST_SHOT);
  if(!fired?.fired||!(fired.after.bullets>fired.before.bullets||fired.after.mag<fired.before.mag))throw Error('Weapon did not fire a real projectile '+JSON.stringify(fired));
  await page.keyboard.down('KeyW');await page.waitForTimeout(350);
  const action=await page.evaluate(()=>mobile?window.__DZ546_STATUS?.action:window.__DZ545_STATUS?.localAction);
  await page.keyboard.up('KeyW');
  if(action!==1&&action!==2)throw Error('Rubo movement animation failed: '+action);
  await page.keyboard.press('KeyB');
  await page.waitForTimeout(700);
  const armory=await page.evaluate(()=>({
   open:!document.querySelector('#shopModal')?.classList.contains('hidden'),
   points:document.querySelector('#dz544-shop-points')?.textContent,
   slots:document.querySelectorAll('#dz544-slots button').length
  }));
  if(armory.open&&(!armory.points?.includes('PTS')||armory.slots!==3))throw Error('Armory broken '+JSON.stringify(armory));
  await fs.mkdir('recovery-qa',{recursive:true});
  await page.screenshot({path:'recovery-qa/'+(mobile?'mobile':'desktop')+'.png',fullPage:false}).catch(()=>{});
  if(fatal.length)throw Error('JS runtime error: '+JSON.stringify(fatal.slice(0,12)));
  results.push({mobile,ok:true,report,armory});
 }catch(err){
  errors.push((mobile?'MOBILE ':'PC ')+String(err)+' '+fatal.join('; '));
  results.push({mobile,ok:false,error:String(err),fatal:fatal.slice(0,8),console:consoles.slice(0,8),network:network.slice(0,15)});
 }
 await ctx.close();
}
await browser.close();
console.log('DEAD_ZONE_RECOVERY_BROWSER '+JSON.stringify(results));
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('DEAD_ZONE_RECOVERY_BROWSER PASSED');
