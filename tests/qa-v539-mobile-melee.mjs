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
  await page.waitForFunction(()=>window.__DZ539_MELEE_STATUS&&window.__DZ540_STATUS&&window.__DZ535_STATUS?.localGunVisible,null,{timeout:35000});
  const state=await page.evaluate(()=>{
   if(!playing)throw Error('Game did not start');
   const melee=weapons.map((w,i)=>({w,i})).filter(x=>x.w.category==='Cuerpo a cuerpo');
   const names=melee.map(x=>x.w.name);
   if(melee.length!==8)throw Error('Expected 8 melee weapons '+names);
   for(const x of melee){
    if(x.w.mag!==50||x.w.reserve!==0)throw Error('Melee weapon not initialized 50/0 '+x.w.name+' '+x.w.mag+'/'+x.w.reserve);
    const initial=ammoFor(x.i);
    if(initial.mag!==50||initial.reserve!==0)throw Error('Melee initial ammo invalid '+x.w.name);
   }
   const id=melee[0].i;
   player.slots=[0,id];player.active=1;player.cool=0;player.reload=0;player.dead=false;player.heli=0;paused=false;dz536SetMode('manual');
   const a=ammoFor(id);
   for(let i=0;i<50;i++){player.cool=0;shoot()}
   const after=a.mag;if(after!==0)throw Error('50 melee swings consumed '+(50-after));
   player.cool=0;shoot();if(a.mag!==0)throw Error('51st melee fired');
   player.points=1000;cat='Cuerpo a cuerpo';drawShop();
   const reloadButton=$('weaponList').querySelector('.dz539-refill');
   if(!reloadButton)throw Error('No melee refill option in weapon shop');
   reloadButton.click();if(a.mag!==50||a.reserve!==0||player.points!==550)throw Error('Refill failed '+JSON.stringify(a)+' pts '+player.points);
   a.mag=50;player.cool=0;dzMelee();if(a.mag!==49)throw Error('Melee quick attack did not consume a charge: '+a.mag);
   a.mag=25;dz536SetMode('auto');
   // An automatic melee attack does not spend charges on a target outside melee radius.
   const oldEnemies=zombies.splice(0);
   try{player.cool=0;shoot();if(a.mag!==25)throw Error('Auto melee wasted a charge while no zombies are nearby')}finally{zombies.push(...oldEnemies)}
   dz536SetMode('manual');
   updateHud();
   const result={
    meleeCount:melee.length,names,startingCharges:50,chargesAfter50Attacks:after,
    refillPrice:450,quickMeleeUsesCharges:true,autoNoWaste:true,
    hud:[$('ammo').textContent,$('reserve').textContent],
    version:(document.querySelector('meta[name="deadzone-build"]')?.content||'').split('-')[0]
   };
   // Restore default weapon for screenshot and subsequent game frame.
   player.active=0;player.cool=0;return result;
  });
  assert.equal(state.version,'5.25.19');
  const perf=await page.evaluate(async mobile=>{
   if(mobile){
    qualityMode='auto';DZ540.autoScale=true;
    dz540SetResolution(.94);
    DZ540.lastAt=0;DZ540.qualityTime=0;DZ540.slowTime=0;DZ540.fastTime=0;DZ540.samples=0;
    let fakeTime=1000;
    for(let i=0;i<210;i++)dz540FrameMonitor(fakeTime+=50,.05);
    const reduced=renderScale;
    if(!(reduced<.94))throw Error('Quality did not reduce on sustained low FPS: '+reduced);
    const down= DZ540.stepDown;
    for(let i=0;i<800;i++)dz540FrameMonitor(fakeTime+=16,.016);
    const recovered=renderScale;
    if(!(DZ540.stepUp>0)||recovered>1.05)throw Error('Quality recovery out of bounds: '+recovered);
    // Compare old quadratic auto aim to optimized distance-sorted visibility.
    const original=zombies.splice(0),origBlocked=blocked;
    let oldCalls=0,newCalls=0,oldTarget,newTarget;
    try{
     for(let i=0;i<36;i++)zombies.push({hp:100,x:player.x+3+(i%6)*1.5,z:player.z+3+Math.floor(i/6)*1.5,kind:'normal'});
     blocked=function(){oldCalls++;return false};
     oldTarget=dz540OldAutoTarget();
     blocked=function(){newCalls++;return false};
     DZ540.autoCacheUntil=0;
     newTarget=dz536AutoTarget();
    }finally{blocked=origBlocked;zombies.splice(0,zombies.length,...original)}
    if(!oldTarget||!newTarget||oldTarget!==newTarget||!(newCalls<oldCalls*.6))throw Error('Auto target optimization incorrect: '+JSON.stringify({oldCalls,newCalls,same:oldTarget===newTarget}));
    const status=window.__DZ540_STATUS();
    return {autoResolutionDown:reduced,autoResolutionRecovered:recovered,stepDowns:down,stepUps:status.upsteps,oldBlockedCalls:oldCalls,newBlockedCalls:newCalls,optimized:true};
   }
   return {mobileOptimizationNotForcedOnDesktop:window.__DZ540_STATUS().mobile===false};
  },mobile);
  await page.evaluate(()=>dz524OpenGraphics());
  const opt=page.locator('#dz540-adaptive');
  if(mobile)assert.equal(await opt.count(),1,'Mobile stabilization toggle missing');
  else assert.equal(await opt.count(),0,'Desktop should not show mobile auto tuner');
  const bad=critical.filter(e=>/ReferenceError|TypeError|SyntaxError|is not defined|Cannot access/i.test(e));
  assert.deepEqual(bad,[],'Critical errors '+bad.join('; ').slice(0,900));
  await page.screenshot({path:mobile?'dz-52519-mobile.png':'dz-52519-pc.png'});
  reports.push({platform:mobile?'mobile':'pc',melee:state.meleeCount,ammo:state.startingCharges,chargesAfter50:state.chargesAfter50Attacks,shopRefill:state.refillPrice,autoNoWaste:state.autoNoWaste,...perf,criticalErrors:0});
  await ctx.close();
 }
}finally{await browser.close()}
console.log('MOBILE PERFORMANCE / MELEE 50 QA PASSED',JSON.stringify(reports));
