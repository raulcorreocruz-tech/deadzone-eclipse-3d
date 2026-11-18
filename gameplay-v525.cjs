'use strict';
// DEAD_ZONE_PATCH_525: Android startup recovery, local Three.js modules, reliable initial graphics, always-visible release notices.
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'index.html');
let h=fs.readFileSync(file,'utf8');
if(h.includes('DEAD_ZONE_PATCH_525'))console.log('Dead Zone 5.25 already patched');
else{
 function once(a,b,label){const count=h.split(a).length-1;if(count!==1)throw Error('v5.25 '+label+' expected once, found '+count);h=h.replace(a,b)}
 const vendor='vendor/three';
 const localBuild='./'+vendor+'/build/three.module.js';
 const localAddons='./'+vendor+'/examples/jsm/';
 // All module imports originate from the same first-party domain: mobile filters cannot block jsDelivr selectively.
 const remoteDomains=[
  ['https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js',localBuild],
  ['https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/',localAddons],
  ['https://unpkg.com/three@0.160.1/build/three.module.js',localBuild],
  ['https://unpkg.com/three@0.160.1/examples/jsm/',localAddons],
 ];
 let importsPatched=0;
 for(const [remote,local] of remoteDomains){
  const count=h.split(remote).length-1;
  if(count){h=h.split(remote).join(local);importsPatched+=count}
 }
 if(!importsPatched)throw Error('v5.25 local Three.js imports: source no longer contains expected CDN mapping');
 // Defer start feedback. A two-frame check often races the orientation/fullscreen transition on mobile.
 once("requestAnimationFrame(()=>requestAnimationFrame(checkStarted))","setTimeout(checkStarted,MOBILE_MODE?8000:3000)",'remove premature mobile startup error');
 once("feedback('La partida no ha arrancado. Prueba a recargar; si persiste, consulta el aviso del motor.',true);",
      "feedback('No se ha iniciado. Consulta el diagnóstico del motor y vuelve a pulsar Iniciar; si falla, utiliza Calidad BAJA y recarga.',true);",
      'helpful delayed startup feedback');
 // Mobile WebGL may fail to allocate an antialiased, high-precision context at high DPR.
 once("new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',precision:'highp'})",
      "new THREE.WebGLRenderer({antialias:!MOBILE_MODE,powerPreference:'high-performance',precision:MOBILE_MODE?'mediump':'highp'})",
      'safe Android WebGL context');
 once("renderScale=preferredScale();\nconst body=$('game');",
      "renderScale=MOBILE_MODE?Math.min(1,preferredScale()):preferredScale();\nconst body=$('game');",
      'first 3D frame safe pixel ratio');
 // Distinct signs are optional decoration, not a critical dependency that should block gameplay.
 once("queueMicrotask(()=>{dz524InitGraphics();dz524DecorateWorld()});",
      "queueMicrotask(()=>{try{dz524InitGraphics()}catch(err){console.error('Dead Zone gráficos:',err)}try{dz524DecorateWorld()}catch(err){console.error('Dead Zone escenario:',err)}});",
      'graphics module isolate non-critical startup');
 once("if(!DZ524.visualReady)dz524DecorateWorld();\n if(!DZ524.settingsReady)dz524InitGraphics();",
      "if(!DZ524.visualReady)try{dz524DecorateWorld()}catch(err){console.warn('World decorations:',err);DZ524.visualReady=true}\n if(!DZ524.settingsReady)try{dz524InitGraphics()}catch(err){console.warn('Graphics options:',err);DZ524.settingsReady=true}",
      'nonfatal graphics tick');
 // Harden the start button against a missing/unavailable WebAudio API, preserving all game reset code.
 const audioCall="audio??=new (window.AudioContext||window.webkitAudioContext)();";
 if(h.includes(audioCall)){
  h=h.replace(audioCall,"try{const AudioCtor=window.AudioContext||window.webkitAudioContext;if(!audio&&AudioCtor)audio=new AudioCtor()}catch(err){console.warn('Audio no disponible, continuamos sin sonido:',err)}");
 }else{
  const pos=h.indexOf("$('start').onclick=");
  console.log('DEAD ZONE v5.25 existing start handler:',pos<0?'start handler assigned differently':h.slice(pos,pos+470));
 }
 const updates="\n// DEAD_ZONE_PATCH_525 — release alert, generated from release-notes.json by the build.\nconst DZ525={activeVersion:'',notified:false,remoteVersion:'',lastNotice:0};\nfunction dz525ReleaseAlert(){\n if(DZ525.notified)return;\n const v=document.querySelector('meta[name=\"deadzone-build\"]')?.content?.split('-')[0]||'';\n if(!v)return;\n DZ525.activeVersion=v;\n const key='dz525_read_release';\n let seen=null;try{seen=localStorage.getItem(key)}catch{}\n const btn=$('dz43NewsButton')||$('updatesBtn')||$('updates')||$('newsBtn');\n if(!btn)return;\n const originalText='📰 NOVEDADES · v'+v;\n btn.dataset.dz525Original=originalText;\n btn.textContent=originalText;\n if(seen!==v){\n  btn.textContent='🆕 NOVEDADES · v'+v;\n  btn.classList.add('dz525-new-update');\n }\n window.addEventListener('click',(event)=>{if(!btn.contains(event.target))return;\n  try{localStorage.setItem(key,v)}catch{}\n  btn.textContent=originalText;\n  btn.classList.remove('dz525-new-update');\n },true);\n DZ525.notified=true;\n}\n\nasync function dz525CheckForUpdates(){\n if(document.hidden)return;\n try{\n  const response=await fetch('/api/release-info',{cache:'no-store',credentials:'same-origin'});\n  if(!response.ok)return;\n  const info=await response.json();\n  if(!/^\\d+\\.\\d+\\.\\d+$/.test(info.version||''))return;\n  const runningVersion=DZ525.activeVersion||document.querySelector('meta[name=\"deadzone-build\"]')?.content?.split('-')[0];\n  if(!runningVersion||runningVersion===info.version)return;\n  DZ525.remoteVersion=info.version;\n  const menu=$('mainMenu');\n  const inMenu=menu&&!menu.classList.contains('hidden');\n  if(inMenu&&!playing){\n   const next=new URL(location.href);\n   next.searchParams.set('v',info.version);\n   next.searchParams.set('refresh',String(Date.now()));\n   location.replace(next.href);\n  }else if(gameTime-DZ525.lastNotice>90){\n   DZ525.lastNotice=gameTime;\n   notify('🆕 NUEVA VERSIÓN '+info.version+' · VUELVE AL MENÚ PARA ACTUALIZAR',4);\n  }\n }catch(err){console.debug('No hay actualización de Dead Zone disponible',err?.message||err)}\n}\nwindow.dz525CheckForUpdates=dz525CheckForUpdates;\nqueueMicrotask(()=>{try{dz525ReleaseAlert()}catch(e){console.warn('Release alert',e)}});\nsetInterval(()=>{dz525ReleaseAlert();dz525CheckForUpdates()},90000);\n\n";
 // Patch adds a one-time visible new-version indicator, not a destructive overhaul of the existing Novelties dialog.
 once('function dzGun(){',updates+'\nfunction dzGun(){','new version badge runtime');
 const banner=".dz525-new-update{border:2px solid #ffc678!important;box-shadow:0 0 14px #e49c6460!important;animation:dz525-news-pulse 2.6s ease-in-out 3}\n@keyframes dz525-news-pulse{50%{box-shadow:0 0 21px #ffbc906b}}\n@media(prefers-reduced-motion:reduce){.dz525-new-update{animation:none}}";
 h=h.replace('</head>','<script type="importmap">{"imports":{"three":"/vendor/three/build/three.module.js","three/addons/":"/vendor/three/examples/jsm/"}}</script><style id="dz525-stability-style">'+banner+'</style><!-- DEAD_ZONE_PATCH_525 --></head>');
 if(/https:\/\/(?:cdn\.jsdelivr\.net|unpkg\.com)\/npm\/three@0\.160\.1/.test(h))throw Error('v5.25 legacy Three.js remote module import remains');
 fs.writeFileSync(file,h);
 console.log('DEAD ZONE 5.25: '+importsPatched+' external Three.js links self-hosted; Android startup guarded, release alerts auto-updated');
}
