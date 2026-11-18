import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});
const results=[];
try{
 for(const mobile of [false,true]){
  const ctx=await browser.newContext({viewport:mobile?{width:915,height:412}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://deadzone-eclipse-coop.onrender.com/?public_smoke_v52518=1',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#dz536-live-menu').waitFor({timeout:30000});
  const buttons=await page.locator('#mainMenu button').evaluateAll(items=>items.filter(x=>getComputedStyle(x).display!=='none'&&!x.hidden).map(x=>x.textContent.trim()));
  assert.equal(buttons.filter(x=>/SALAS EN VIVO/.test(x)).length,1,'duplicate lobby');
  assert(!buttons.some(x=>/COOPERATIVO ONLINE|PANTALLA ONLINE/i.test(x)),'legacy menu');
  await page.locator('#dz43NewsButton').click();
  await page.locator('#updatesModal:not(.hidden)').waitFor({timeout:10000});
  const releases=await page.locator('#updatesList .update-entry').count();assert(releases>=34);
  await page.locator('#updatesClose').click();
  await page.locator('#dz536-live-menu').click();
  await page.locator('#dz538-lobby-chat').waitFor({timeout:15000});
  await page.locator('#coopClose').click();
  await page.locator('#start').click();
  await page.waitForFunction(()=>window.__DZ535_STATUS?.localGunVisible,{timeout:30000});
  const pos=await page.locator('#points').boundingBox();assert(pos&&pos.x>(mobile?550:980),'points misplaced '+JSON.stringify(pos));
  const full=await page.locator('#fullHud').evaluate(el=>!!el.closest('#pauseModal'));assert(full);
  assert.equal(await page.locator('#dz538-voice-toggle').count(),1);
  const critical=errors.filter(e=>/ReferenceError|TypeError|SyntaxError|is not defined|Cannot access/.test(e));assert.deepEqual(critical,[]);
  await page.screenshot({path:mobile?'production-v52518-mobile.png':'production-v52518-desktop.png'});
  results.push({device:mobile?'mobile':'desktop',mainMenuClean:true,releaseEntries:releases,gameStarted:true,pauseFullscreen:true,voiceButton:true,criticalErrors:0});
  await ctx.close();
 }
}finally{await browser.close()}
console.log('PRODUCTION BROWSER VERIFIED',JSON.stringify(results));
