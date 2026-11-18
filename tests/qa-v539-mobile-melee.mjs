import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,executablePath:process.env.DZ_CHROME_PATH||'/usr/bin/google-chrome',args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});
const reports=[];
try{
 for(const mobile of [false,true]){
  const ctx=await browser.newContext({viewport:mobile?{width:915,height:412}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
  const page=await ctx.newPage(),critical=[];
  page.on('pageerror',e=>critical.push(e.message));
  await page.goto('http://127.0.0.1:3000/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#start').waitFor({timeout:30000});
  await page.locator('#start').click();
  await page.waitForFunction(()=>window.__DZ539_QA&&window.__DZ540_STATUS&&window.__DZ535_STATUS?.localGunVisible,null,{timeout:35000});
  const melee=await page.evaluate(()=>window.__DZ539_QA.melee());
  assert.equal(melee.count,8);assert.equal(melee.after50,0);assert.equal(melee.refillCost,450);assert(melee.autoSafe&&melee.quickAttack);
  const perf=await page.evaluate(()=>window.__DZ539_QA.perf());
  if(mobile)assert(perf.blockedCallsNew<perf.blockedCallsOld*.6,JSON.stringify(perf));
  else assert.equal(perf.desktopNotThrottled,true);
  await page.evaluate(()=>window.__DZ539_QA.options());
  const toggle=page.locator('#dz540-adaptive');
  assert.equal(await toggle.count(),mobile?1:0);
  const criticalErrors=critical.filter(e=>/TypeError|ReferenceError|SyntaxError|is not defined|Cannot access/i.test(e));
  assert.deepEqual(criticalErrors,[],'JS critical errors '+criticalErrors.join('; '));
  await page.screenshot({path:mobile?'dz-52519-mobile.png':'dz-52519-pc.png'});
  reports.push({platform:mobile?'mobile':'pc',meleeCount:melee.count,uses:melee.charges,shopRefill:melee.refillCost,quickMelee:true,noAutoWaste:true,...perf,criticalErrors:0});
  await ctx.close();
 }
}finally{await browser.close()}
console.log('MOBILE PERFORMANCE / MELEE 50 QA PASSED',JSON.stringify(reports));
