'use strict';
const fs=require('node:fs'),file='index.html',html=fs.readFileSync(file,'utf8'),anchor='function dzGun(){';
if(html.split(anchor).length!==2)throw Error('Game injection point missing');
const runtime=String.raw`
window.__DZ539_QA={
 melee(){
  if(!playing)throw Error('Game did not start');
  const melee=weapons.map((w,i)=>({w,i})).filter(x=>x.w.category==='Cuerpo a cuerpo');
  if(melee.length!==8)throw Error('Expected 8 melee weapons: '+melee.map(x=>x.w.name));
  for(const x of melee){
   if(x.w.mag!==50||x.w.reserve!==0)throw Error('Melee weapon not initialized 50/0: '+x.w.name);
   const initial=ammoFor(x.i);
   if(initial.mag!==50||initial.reserve!==0)throw Error('Initial melee ammo invalid: '+x.w.name);
  }
  const id=melee[0].i;
  const oldSlots=[...player.slots],oldActive=player.active,oldPoints=player.points;
  const oldEnemies=zombies.splice(0);
  try{
   player.slots=[0,id];player.active=1;player.cool=0;player.reload=0;player.dead=false;player.heli=0;paused=false;dz536SetMode('manual');
   const a=ammoFor(id);
   for(let i=0;i<50;i++){player.cool=0;shoot()}
   const after=a.mag;if(after!==0)throw Error('50 melee swings consumed '+(50-after));
   player.cool=0;shoot();if(a.mag!==0)throw Error('51st melee fired');
   player.points=1000;cat='Cuerpo a cuerpo';drawShop();
   const refillButton=$('weaponList').querySelector('.dz539-refill');
   if(!refillButton)throw Error('No melee refill button in shop');
   refillButton.click();
   if(a.mag!==50||a.reserve!==0||player.points!==550)throw Error('Refill failed: '+JSON.stringify(a));
   player.cool=0;dzMelee();if(a.mag!==49)throw Error('Quick melee does not consume 1 charge: '+a.mag);
   a.mag=25;dz536SetMode('auto');player.cool=0;shoot();
   if(a.mag!==25)throw Error('Automatic melee wasted charge when no zombie in range');
   dz536SetMode('manual');updateHud();
   return {count:melee.length,names:melee.map(x=>x.w.name),charges:50,after50:after,refillCost:450,quickAttack:true,autoSafe:true};
  }finally{
   player.slots=oldSlots;player.active=oldActive;player.points=oldPoints;player.cool=0;dz536SetMode('manual');
   zombies.push(...oldEnemies);dzGun();updateHud();
  }
 },
 perf(){
  if(!MOBILE_MODE)return {desktopNotThrottled:window.__DZ540_STATUS().mobile===false};
  qualityMode='auto';DZ540.autoScale=true;dz540SetResolution(.94);
  DZ540.lastAt=0;DZ540.qualityTime=0;DZ540.slowTime=0;DZ540.fastTime=0;DZ540.samples=0;
  let t=1000;for(let i=0;i<210;i++)dz540FrameMonitor(t+=50,.05);
  const reduced=renderScale;
  if(!(reduced<.94))throw Error('Did not reduce mobile resolution at low FPS: '+reduced);
  const down=DZ540.stepDown;
  for(let i=0;i<800;i++)dz540FrameMonitor(t+=16,.016);
  const recovered=renderScale;
  if(!(DZ540.stepUp>0)||recovered>1.05)throw Error('Quality recovery out of bounds: '+recovered);
  const saved=zombies.splice(0),originalBlocked=blocked;
  let oldCalls=0,newCalls=0,oldTarget,newTarget;
  try{
   for(let i=0;i<36;i++)zombies.push({hp:100,x:player.x+3+(i%6)*1.5,z:player.z+3+Math.floor(i/6)*1.5,kind:'normal'});
   blocked=function(){oldCalls++;return false};
   oldTarget=dz540OldAutoTarget();
   blocked=function(){newCalls++;return false};
   DZ540.autoCacheUntil=0;
   newTarget=dz536AutoTarget();
  }finally{
   blocked=originalBlocked;zombies.splice(0,zombies.length,...saved);
  }
  if(!oldTarget||!newTarget||oldTarget!==newTarget||!(newCalls<oldCalls*.6))throw Error('Auto target not optimized: '+JSON.stringify({oldCalls,newCalls,same:oldTarget===newTarget}));
  return {resolutionDown:reduced,resolutionRecovered:recovered,stepDown:down,stepUp:DZ540.stepUp,blockedCallsOld:oldCalls,blockedCallsNew:newCalls};
 },
 options(){dz524OpenGraphics()}
};
`;
fs.writeFileSync(file,html.replace(anchor,runtime+'\n'+anchor));
console.log('QA instrumented hot loops and melee rules (CI only)');
