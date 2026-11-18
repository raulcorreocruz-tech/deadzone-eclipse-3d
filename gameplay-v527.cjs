'use strict';
// DEAD_ZONE_PATCH_527: independent mobile finger input and right-stick aim without autofire.
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'index.html');
let h=fs.readFileSync(file,'utf8');
if(h.includes('DEAD_ZONE_PATCH_527')){console.log('Dead Zone v5.25.8 input already applied');}
else{
 const once=(before,after,label)=>{const n=h.split(before).length-1;if(n!==1)throw Error('v5.25.8 '+label+' anchor count '+n);h=h.replace(before,after)};
 once('function dz514AimRight(){dz515AimTick();}','function dz514AimRight(){dz527AimOnly();}','disable right-stick autofire');
 const oldFire="if(trigger&&(MOBILE_MODE||weapon().fireMode!=='semi'||!triggerLatch)){shoot();if(weapon().fireMode==='semi'&&!MOBILE_MODE)triggerLatch=true;}";
 const newFire="if(trigger&&(!MOBILE_MODE||DZ527.firePointer!==null)&&(weapon().fireMode!=='semi'||!triggerLatch)){shoot();if(weapon().fireMode==='semi')triggerLatch=true;}";
 once(oldFire,newFire,'only fire from actual fire button');
 const start=h.indexOf('let firePointer=null;');
 const end=h.indexOf('function scoreLocal(){',start);
 if(start<0||end<=start||end-start>2400)throw Error('v5.25.8 cannot locate native mobile button handlers');
 const input=String.raw`
 // DEAD_ZONE_PATCH_527: unique pointer ownership per interactive control.
 const DZ527={firePointer:null,actionFingers:new Map(),pressed:new Set()};
 const fireButton=$('fire');
 function dz527ReleaseFire(e){
  if(e&&DZ527.firePointer!==e.pointerId)return;
  DZ527.firePointer=null;touch.shoot=false;triggerLatch=false;
  fireButton.classList.remove('pressed');
 }
 fireButton.addEventListener('pointerdown',e=>{
  if(editingLayout||!playing||paused||DZ527.firePointer!==null)return;
  e.preventDefault();DZ527.firePointer=e.pointerId;
  try{fireButton.setPointerCapture(e.pointerId)}catch{}
  // The aim stick is the only source of direction. This control only fires.
  touch.shoot=true;triggerLatch=false;fireButton.classList.add('pressed');
  shoot();
  if(weapon().fireMode==='semi')triggerLatch=true;
 },{passive:false});
 for(const kind of ['pointerup','pointercancel','lostpointercapture'])
  fireButton.addEventListener(kind,dz527ReleaseFire);
 function dz527Action(id,callback){
  const button=$(id);if(!button)return;
  button.onclick=e=>{if(e.detail===0&&!editingLayout)callback();}; // keyboard accessibility
  button.addEventListener('pointerdown',e=>{
   if(editingLayout||!playing||paused)return;
   e.preventDefault();e.stopPropagation();
   if(DZ527.actionFingers.has(e.pointerId))return;
   DZ527.actionFingers.set(e.pointerId,id);
   button.classList.add('pressed');
   try{button.setPointerCapture(e.pointerId)}catch{}
   callback(); // fires immediately, even if a different finger holds MOVE
  },{passive:false});
  for(const kind of ['pointerup','pointercancel','lostpointercapture'])
   button.addEventListener(kind,e=>{
    if(DZ527.actionFingers.get(e.pointerId)!==id)return;
    DZ527.actionFingers.delete(e.pointerId);button.classList.remove('pressed');
   });
 }
 dz527Action('reload',reload);
 dz527Action('use',interact);
 dz527Action('swap',swap);
 dz527Action('shop',openShop);
 dz527Action('dodge',dodge);
 $('pauseTouch').onclick=()=>{if(playing&&!paused)pause()};
 window.addEventListener('blur',()=>{dz527ReleaseFire();DZ527.actionFingers.clear()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)dz527ReleaseFire()});
 `;
 h=h.slice(0,start)+input+h.slice(end);
 const aiming=String.raw`
 function dz527AimOnly(){
  if(!MOBILE_MODE)return;
  const x=touch.aim.x,y=touch.aim.y;
  if(!playing||paused||player.dead||Math.hypot(x,y)<.18){
   if(typeof dz515HideGuide==='function')dz515HideGuide();
   return;
  }
  const angle=Math.atan2(x,y);
  if(!Number.isFinite(angle))return;
  player.angle=angle;
  // No target magnetism: semi-automatic shots follow the player's direction.
  if(typeof dz515MakeGuide!=='function')return;
  dz515MakeGuide();
  const len=21,endX=player.x+Math.sin(angle)*len,endZ=player.z+Math.cos(angle)*len;
  const line=DZ515.line.geometry.getAttribute('position');
  line.setXYZ(0,player.x,.31,player.z);line.setXYZ(1,endX,.31,endZ);
  line.needsUpdate=true;
  DZ515.line.material.color.setHex(0x77efff);DZ515.line.visible=true;
  DZ515.arrow.position.set(endX,.31,endZ);DZ515.arrow.rotation.y=angle;DZ515.arrow.visible=true;
  DZ515.halo.visible=false;
 }
 `;
 once('function dzGun(){',aiming+'\nfunction dzGun(){','add view-only right-stick');
 const css=String.raw`<style id="dz527-mobile-input">
 @media(pointer:coarse),(max-width:800px){
 html body #hud #aimstick,html body.touch-mode #hud #aimstick{display:block!important;visibility:visible!important;pointer-events:auto!important;touch-action:none!important;z-index:13!important}
 html body #hud #fire,html body.touch-mode #hud #fire{display:block!important;visibility:visible!important;pointer-events:auto!important;touch-action:none!important;z-index:14!important}
 body.touch-mode #hud .mobile,body.touch-mode #hud .mobile .tact{touch-action:none!important}
 body.touch-mode #hud .mobile .tact.pressed{filter:brightness(1.5)}
 }
 </style><!-- DEAD_ZONE_PATCH_527 -->`;
 h=h.replace('</head>',css+'</head>');
 fs.writeFileSync(file,h);
 console.log('DEAD ZONE 5.25.8: independent multitouch actions, right-stick aim-only, fire button mandatory');
}
