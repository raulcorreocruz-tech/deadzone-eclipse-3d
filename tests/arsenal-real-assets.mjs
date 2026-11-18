import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,executablePath:process.env.DZ_CHROME_PATH||'/usr/bin/google-chrome',args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});
const results=[];
try{
 for(const mobile of [false,true]){
  const ctx=await browser.newContext({viewport:mobile?{width:915,height:412}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
  await ctx.addInitScript(()=>{localStorage.setItem('deadzone_skin_v43','soldado')});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3000/',{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('#start').waitFor({timeout:25000});
  await page.waitForFunction(()=>window.__DZ534_STATUS?.ready,{timeout:15000});
  await page.locator('#start').click();
  await page.waitForFunction(()=>window.__DZ534_STATUS?.activeModel?.startsWith('model-'),null,{timeout:15000});
  const loaded=await page.evaluate(()=>window.__DZ534_STATUS);
  if(!loaded.mappedGLB||loaded.mappedGLB<40||loaded.recordedSfx<20)throw Error('Missing assets '+JSON.stringify(loaded));
  await page.waitForTimeout(1700); // let Web Audio decode initial pistol and mechanical effects.
  if(!mobile){await page.keyboard.down('j');await page.waitForTimeout(350);await page.keyboard.up('j')}
  else{
   const fire=page.locator('#fire');
   await fire.tap();
  }
  await page.waitForTimeout(350);
  const shot=await page.evaluate(()=>window.__DZ534_STATUS);
  const critical=errors.filter(e=>/TypeError|ReferenceError|SyntaxError|is not defined|Cannot access/i.test(e));
  if(critical.length)throw Error('Critical browser JS '+critical.join(' / ').slice(0,500));
  if(shot.shotSamples<1)console.warn('SAMPLE WARNING: gunshot event not triggered; user interaction must be verified on physical device',mobile,JSON.stringify(shot));
  results.push({mobile,model:shot.activeModel,models:shot.mappedGLB,samples:shot.recordedSfx,shotSamples:shot.shotSamples,errors:errors.slice(0,4)});
  await page.screenshot({path:mobile?'arsenal-cc0-mobile.png':'arsenal-cc0-desktop.png'});
  await ctx.close();
 }
}finally{await browser.close()}
console.log('REAL ARSENAL BROWSER TESTS',JSON.stringify(results));
