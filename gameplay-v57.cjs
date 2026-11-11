'use strict';
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'index.html');
let h=fs.readFileSync(file,'utf8');
if(h.includes('DEAD_ZONE_PATCH_57')){console.log('v5.7 touch controls already installed')}else{
 function once(a,b,label){const n=h.split(a).length-1;if(n!==1)throw Error('v5.7 '+label+' anchor found '+n+' times');h=h.replace(a,b)}
 const begin=h.indexOf('let cameraFinger=-1,cameraFingerX=0;');
 const end=h.indexOf('function dodge(){',begin);
 if(begin<0||end<begin||end-begin>1400||h.indexOf('let cameraFinger=-1,cameraFingerX=0;',begin+1)!==-1)throw Error('v5.7 legacy camera handler not found/ambiguous');
 h=h.slice(0,begin)+'// v5.7: touch drag no longer changes cameraYaw. Tap gestures only aim and fire.\n'+h.slice(end);
 once("setupStick('movestick',touch.move);setupStick('aimstick',touch.aim);dzMobileButtons();",
      "setupStick('movestick',touch.move);dzMobileButtons();touch.aim.x=0;touch.aim.y=0;",
      'remove legacy right joystick');
 const oldAim="if(MOBILE_MODE&&Math.hypot(touch.aim.x,touch.aim.y)>.24){const aimAngle=Math.atan2(touch.aim.x,touch.aim.y)+cameraYaw;const diff=Math.atan2(Math.sin(aimAngle-player.angle),Math.cos(aimAngle-player.angle));player.angle+=diff*Math.min(1,dt*18)}else if(!MOBILE_MODE&&matchMedia('(pointer:fine)').matches)";
 once(oldAim,"if(!MOBILE_MODE&&matchMedia('(pointer:fine)').matches)",'remove right joystick turning');
 const fireCondition="if(trigger&&(weapon().fireMode!=='semi'||!triggerLatch)){shoot();if(weapon().fireMode==='semi')triggerLatch=true;}";
 once(fireCondition,"if(trigger&&(MOBILE_MODE||weapon().fireMode!=='semi'||!triggerLatch)){shoot();if(weapon().fireMode==='semi'&&!MOBILE_MODE)triggerLatch=true;}",'sustain held firing');
 once("dz52AimAt(e);touch.shoot=true;shoot();",
      "touch.aim.x=0;touch.aim.y=0;dz52AimAt(e);touch.shoot=true;shoot();",
      'point and fire immediately');
 once("e.preventDefault();dz52AimAt(e);\n  if(!allowed())dz52Stop(e);",
      "e.preventDefault();\n  // Holding continues to fire at the initial touched point; dragging does not rotate anything.\n  if(!allowed())dz52Stop(e);",
      'no turn on hold movement');
 once("function cameraTick(dt){const zoom=MOBILE_MODE?.73:",
      "function cameraTick(dt){if(MOBILE_MODE)cameraYaw=0;const zoom=MOBILE_MODE?.73:",
      'lock camera orbit on mobile');
 const style='<style id="dz57-mobile-input">'+
 '@media(pointer:coarse),(max-width:800px){'+
 'body.touch-mode #hud #aimstick,body.touch-mode #hud #fire{display:none!important;pointer-events:none!important}'+
 'body.touch-mode #hud .mobile{pointer-events:none!important}'+
 'body.touch-mode #hud #movestick,body.touch-mode #hud .tact,body.touch-mode #hud #pauseTouch{pointer-events:auto!important}'+
 'body.touch-mode #hud .hudtop,body.touch-mode #hud .bottombar,body.touch-mode #hud .hint,body.touch-mode #hud .versionStamp{pointer-events:none!important}'+
 'body.touch-mode #game canvas{touch-action:none!important}'+
 '}</style><!-- DEAD_ZONE_PATCH_57 -->';
 if(!h.includes('</head>'))throw Error('v5.7 head missing');
 h=h.replace('</head>',style+'</head>');
 fs.writeFileSync(file,h);
 console.log('DEAD ZONE v5.7: fixed mobile camera and touch-to-fire controls');
}
