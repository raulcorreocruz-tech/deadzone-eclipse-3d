import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:process.env.DZ_CHROME_PATH||'/usr/bin/google-chrome',args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});
const results=[];
try{
 for(const spec of [{name:'android',mobile:true},{name:'desktop',mobile:false}]){
  const ctx=await browser.newContext({viewport:spec.mobile?{width:915,height:412}:{width:1280,height:720},deviceScaleFactor:spec.mobile?2:1,isMobile:spec.mobile,hasTouch:spec.mobile});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.goto('http://127.0.0.1:3000/',{waitUntil:'domcontentloaded',timeout:50000});
  await page.locator('#start').waitFor({timeout:30000});
  await page.evaluate(()=>window.__DZ536_QA.openSettings());
  const select=page.locator('#dz536-shot-mode');
  await select.waitFor({timeout:10000});
  assert.equal(await select.inputValue(),'manual');
  await select.selectOption('line');
  assert.equal(await page.evaluate(()=>localStorage.getItem('dz536_shooting_mode')),'line');
  await page.locator('#dz524-graphics button').filter({hasText:'APLICAR Y VOLVER'}).first().click();
  assert.equal(await page.locator('#dz536-live-menu').count(),1);
  assert.equal(await page.locator('#dz536-live-rooms').count(),1);
  await page.locator('#start').click();
  await page.waitForFunction(()=>window.__DZ536_STATUS?.()&&window.__DZ535_STATUS?.localGunVisible,{timeout:18000});
  const start=await page.evaluate(()=>window.__DZ536_QA.empty());
  if(spec.mobile){
   const noTarget=await page.evaluate(()=>window.__DZ536_QA.testLineNoTarget());
   assert.equal(noTarget,0,'Line fires without zombie');
   const line=await page.evaluate(()=>window.__DZ536_QA.testLineWithTarget());
   assert(line.shots>0,'Joystick line did not shoot with visible enemy '+JSON.stringify(line));
  }
  const auto=await page.evaluate(()=>window.__DZ536_QA.testAuto());
  assert(auto.shots>0,'Automatic shooting did not fire '+JSON.stringify(auto));
  const walk=await page.evaluate(()=>window.__DZ536_QA.walk());
  assert(walk.walking>0,'Zombie feet are not walking '+JSON.stringify(walk));
  const helicopter=await page.evaluate(()=>window.__DZ536_QA.heli());
  assert.equal(helicopter.started,true);
  await page.waitForFunction(()=>window.__DZ536_STATUS?.().heliBursts>0,{timeout:15000});
  await page.waitForFunction(()=>window.__DZ536_STATUS?.().heliActive===false,null,{timeout:15000});
  const finish=await page.evaluate(()=>window.__DZ536_STATUS());
  assert(finish.heliBursts>0&&finish.weaponVisible,'Helicopter fired no bullets or failed to restore weapon '+JSON.stringify(finish));
  const critical=errors.filter(x=>/TypeError|ReferenceError|SyntaxError|cannot read|undefined is not|is not defined/i.test(x));
  assert.deepEqual(critical,[],spec.name+' JS errors: '+critical.join('; '));
  results.push({platform:spec.name,options:true,manual:true,laser:spec.mobile,auto:true,zombieWalk:walk.walking,heliBursts:finish.heliBursts,gunRestored:true,errors:0});
  await page.screenshot({path:'dz536-'+spec.name+'.png'});
  await ctx.close();
 }
}finally{await browser.close()}
console.log('SHOOTING HELICOPTER WALKING TESTS PASSED',JSON.stringify(results));
