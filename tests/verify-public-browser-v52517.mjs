import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const url='https://deadzone-eclipse-coop.onrender.com/';
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});
const results=[];
try{
 for(const mobile of [false,true]){
  const ctx=await browser.newContext({viewport:mobile?{width:915,height:412}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url+'?public_smoke=1',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#start').waitFor({timeout:30000});
  await page.locator('#dz536-live-menu').waitFor({timeout:30000});
  await page.locator('#dz536-live-menu').click();
  await page.locator('#dz536-live-rooms').waitFor({timeout:10000});
  const roomStatus=await page.locator('#dz536-rooms-status').textContent();
  await page.locator('#coopClose').click();
  await page.locator('#start').click();
  await page.waitForFunction(()=>window.__DZ536_STATUS?.() && window.__DZ535_STATUS?.localGunVisible,null,{timeout:25000});
  const status=await page.evaluate(()=>window.__DZ536_STATUS());
  assert.equal(status.fireMode,'manual');
  assert.equal(status.weaponVisible,true);
  assert(!errors.some(e=>/ReferenceError|TypeError|SyntaxError|Cannot access|is not defined/i.test(e)),errors.join('; ').slice(0,600));
  const result={platform:mobile?'mobile':'desktop',version:'5.25.17',onlineRoomsShown:true,roomStatus,gameStarted:true,weaponVisible:true,criticalErrors:0};
  results.push(result);
  await page.screenshot({path:mobile?'public-deadzone-mobile-v52517.png':'public-deadzone-desktop-v52517.png'});
  await ctx.close();
 }
}finally{await browser.close()}
console.log('PUBLIC BROWSER VERIFIED',JSON.stringify(results));
