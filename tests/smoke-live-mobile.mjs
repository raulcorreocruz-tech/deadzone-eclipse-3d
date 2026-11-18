import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const expectedVersion=JSON.parse(readFileSync(new URL('../package.json', import.meta.url),'utf8')).version;
const base = process.env.DZ_URL || 'https://deadzone-eclipse-coop.onrender.com/';
const browser = await chromium.launch({headless:true,executablePath:process.env.DZ_CHROME_PATH||'/usr/bin/google-chrome',args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});
let failures=0;
for (const mobile of [true,false]) {
 const name=mobile?'ANDROID_LANDSCAPE':'DESKTOP';
 const context=await browser.newContext({viewport:mobile?{width:915,height:412}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2.5:1,ignoreHTTPSErrors:true});
 const page=await context.newPage();
 const errors=[],requests=[];
 page.on('pageerror',err=>errors.push('JS '+(err.stack||err.message).slice(0,900)));
 page.on('console',msg=>{if(msg.type()==='error')errors.push('CONSOLE '+msg.text().slice(0,500));});
 page.on('requestfailed',req=>requests.push(req.url()+' '+(req.failure()?.errorText||'')));
 try {
  await page.goto(base+'?smoke='+Date.now(),{waitUntil:'domcontentloaded',timeout:75000});
  await page.waitForTimeout(4500);
  let actualVersion=await page.locator('meta[name="deadzone-build"]').getAttribute('content').catch(()=>null);
  for(let retry=0;retry<4 && !String(actualVersion||'').startsWith(expectedVersion+'-');retry++){
   await page.waitForTimeout(3000);
   await page.goto(base+'?smoke='+Date.now()+'&v='+expectedVersion+'&retry='+retry,{waitUntil:'domcontentloaded',timeout:75000});
   await page.waitForTimeout(2500);
   actualVersion=await page.locator('meta[name="deadzone-build"]').getAttribute('content').catch(()=>null);
  }
  if(!String(actualVersion||'').startsWith(expectedVersion+'-'))throw Error('Live build mismatch expected '+expectedVersion+', got '+actualVersion);
  const avatarResponse=await page.request.get(new URL('/assets/peter_griffin_atlas.png',base).toString(),{timeout:25000});
  if(!avatarResponse.ok()||!String(avatarResponse.headers()['content-type']||'').includes('image/png'))throw Error('Peter skin PNG is not served correctly: HTTP '+avatarResponse.status());
  const skinOpen=page.locator('#dz43SkinsButton');
  if(await skinOpen.count()!==1)throw Error('Skin selector is missing');
  await skinOpen.click();
  const peter=page.locator('#dz43SkinsPanel button').filter({hasText:'Peter Griffin'});
  if(await peter.count()!==1)throw Error('Peter Griffin is not present exactly once in skin selector');
  await peter.click();
  const storedSkin=await page.evaluate(()=>localStorage.getItem('deadzone_skin_v43'));
  if(storedSkin!=='peter_griffin')throw Error('Selecting Peter Griffin did not persist');
  const options=[['mewtwo','Mewtwo'],['timmy_turner','Timmy Turner'],['raphael_tmnt','Raphael'],['agunimon','Agunimon'],['cleft','Cleft'],['shin_chan','Shin Chan']];
  for(const [id,label] of options){
   const btn=page.locator('#dz43SkinsPanel button').filter({hasText:label});
   if(await btn.count()!==1)throw Error('Missing or duplicate new skin '+label);
   await btn.click();
   if(await page.evaluate(()=>localStorage.getItem('deadzone_skin_v43'))!==id)throw Error('Skin selection was not saved: '+id);
  }
  const extraAtlas=await page.request.get(new URL('/assets/deadzone_playables_6x4.png',base).toString(),{timeout:20000});
  if(!extraAtlas.ok()||!String(extraAtlas.headers()['content-type']||'').includes('image/png'))throw Error('Extra sprite atlas HTTP '+extraAtlas.status());

  await page.locator('#dz43SkinsPanel button').filter({hasText:'CERRAR'}).click();
  const prior=await page.evaluate(()=>({build:document.querySelector('meta[name="deadzone-build"]')?.content||'',mobileMode:typeof MOBILE_MODE==='undefined'?'missing':String(MOBILE_MODE),canvas:!!document.querySelector('#game canvas'),startAssigned:typeof document.querySelector('#start')?.onclick,buttons:[...document.querySelectorAll('#mainMenu button')].filter(x=>/gr[aá]fic|ajustes/i.test(x.textContent)).map(x=>x.textContent)}));
  const settingsButton=page.locator('#dz526-prestart-graphics');
  if(await settingsButton.count()===1){
    await settingsButton.click({timeout:10000});
    if(!await page.locator('#dz526-settings').isVisible())throw Error('Pre-start graphics panel did not open');
    await page.locator('#dz526-settings button').filter({hasText:'CANCELAR'}).click();
  }
  if(await settingsButton.count()!==1)throw Error('Missing pre-start graphics button');
  const start=page.locator('#start');
  if(await start.count()){await start.scrollIntoViewIfNeeded();await start.click({timeout:10000});await page.waitForTimeout(4800);}
  await page.waitForFunction(()=>window.__DZ530_STATUS?.selected==='shin_chan'&&window.__DZ530_STATUS?.spriteVisible,null,{timeout:15000});
  const after=await page.evaluate(()=>({menuHidden:document.querySelector('#mainMenu')?.classList.contains('hidden'),hudHidden:document.querySelector('#hud')?.classList.contains('hidden'),feedback:document.querySelector('#dz-start-feedback')?.textContent||'',canvas:!!document.querySelector('#game canvas'),loadedScripts:[...document.scripts].map(s=>s.type+':'+(s.src||'inline')).slice(-8)}));
  let touchTest=null;
  if(mobile&&after.menuHidden&&!after.hudHidden){
    const nodes=await page.evaluate(()=>{
      const center=id=>{const el=document.getElementById(id),rect=el?.getBoundingClientRect();if(!rect)return null;return {x:Math.round(rect.left+rect.width/2),y:Math.round(rect.top+rect.height/2),display:getComputedStyle(el).display};};
      return {move:center('movestick'),aim:center('aimstick'),fire:center('fire'),reload:center('reload'),ammo:document.querySelector('#ammo')?.textContent};
    });
    touchTest={nodes,events:'not-run'};
    if(!nodes.move||!nodes.fire||nodes.fire.display==='none'||!nodes.aim||nodes.aim.display==='none')throw Error('Mobile move/aim/fire controls must all be visible');
    const cdp=await context.newCDPSession(page);
    const a={x:nodes.move.x,y:nodes.move.y,id:11},b={x:nodes.fire.x,y:nodes.fire.y,id:12};
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...a,x:a.x+18,y:a.y-20}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...a,x:a.x+18,y:a.y-20},b]});
    await page.waitForTimeout(300);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{...a,x:a.x+18,y:a.y-20}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    touchTest.events='two-finger-move-and-fire';
    touchTest.ammoAfter=await page.locator('#ammo').textContent();
    await cdp.detach();
  }
    const report={name,prior,after,touchTest,errors:errors.slice(0,12),requests:requests.slice(0,12)};
  console.log('DEAD_ZONE_SMOKE '+JSON.stringify(report));
  if(!after.menuHidden||after.hudHidden||errors.some(e=>/^JS /.test(e)||/ReferenceError|SyntaxError|Cannot access|is not defined/.test(e)))failures++;
 }catch(e){failures++;console.error('DEAD_ZONE_SMOKE_EXCEPTION '+name+' '+String(e).slice(0,1500)+' errors='+errors.join(' | '));}
 finally {await context.close();}
}
await browser.close();
if(failures){console.error('SMOKE FAILED IN '+failures+' MODES');process.exit(1);}
console.log('SMOKE PASSED ALL MODES');
