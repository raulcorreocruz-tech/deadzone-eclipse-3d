import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:process.env.DZ_CHROME_PATH||'/usr/bin/google-chrome',args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--no-sandbox','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const result=[];
try{
 for(const mobile of [false,true]){
  const ctx=await browser.newContext({viewport:mobile?{width:915,height:412}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3000/',{waitUntil:'domcontentloaded',timeout:55000});
  await page.locator('#dz536-live-menu').waitFor({timeout:35000});
  const menu=await page.locator('#mainMenu button').evaluateAll(nodes=>nodes.filter(n=>getComputedStyle(n).display!=='none'&&!n.hidden).map(n=>n.textContent.trim()));
  assert.equal(menu.filter(x=>/SALAS EN VIVO/.test(x)).length,1,'Duplicate rooms button '+JSON.stringify(menu));
  assert(!menu.some(x=>/COOPERATIVO ONLINE|PANTALLA ONLINE/i.test(x)),'Old coop menu still visible '+JSON.stringify(menu));
  await page.locator('#dz43NewsButton').click();
  await page.locator('#updatesModal:not(.hidden)').waitFor({timeout:5000});
  const notes=await page.locator('#updatesList .update-entry').count();
  assert(notes>=25,'Release note archive is incomplete: '+notes);
  await page.locator('#updatesClose').click();
  await page.locator('#dz536-live-menu').click();
  await page.locator('#dz538-lobby-chat').waitFor({timeout:10000});
  const chatInput=await page.locator('#dz538-chat-input').count();assert.equal(chatInput,1);
  await page.locator('#coopClose').click();
  await page.locator('#start').click();
  await page.waitForFunction(()=>window.__DZ535_STATUS?.localGunVisible,{timeout:22000});
  const points=await page.locator('#points').boundingBox();
  assert(points,'Points missing');
  assert(points.x>=(mobile?580:1000),'Points not on right side '+JSON.stringify(points));
  assert(points.y>=(mobile?130:300),'Points not moved to bottom '+JSON.stringify(points));
  const full=await page.locator('#fullHud').evaluate(el=>el.closest('#pauseModal')!==null);
  assert(full,'Fullscreen still floating in HUD');
  const quick=await page.locator('#dz45-quick').evaluate(el=>getComputedStyle(el).display);
  assert.equal(quick,'none','HUD shortcut still floating');
  await page.locator('#pauseModal #dz538-voice-toggle').waitFor({timeout:5000});
  const voiceLabel=await page.locator('#dz538-voice-toggle').textContent();
  assert.match(voiceLabel,/ACTIVAR CHAT DE VOZ/);
  const critical=errors.filter(e=>/TypeError|ReferenceError|SyntaxError|Cannot access|is not defined/i.test(e));
  assert.deepEqual(critical,[],'Critical UI errors '+critical.join('; '));
  await page.screenshot({path:mobile?'v538-mobile.png':'v538-desktop.png'});
  result.push({platform:mobile?'mobile':'desktop',singleRooms:true,notes,chatVisible:true,fullscreenInPause:true,voiceOptIn:true,pointsLowerRight:true,criticalErrors:0});
  await ctx.close();
 }
}finally{await browser.close()}
console.log('CLEAN HUD / LOBBY / ALL NEWS BROWSER TEST PASSED',JSON.stringify(result));
