'use strict';
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'index.html');
let h=fs.readFileSync(file,'utf8');
if(h.includes('DEAD_ZONE_PATCH_517'))console.log('v5.17 Phase 3.1 already applied');
else{
 function once(a,b,label){const n=h.split(a).length-1;if(n!==1)throw Error('Phase 3.1 '+label+' anchor '+n);h=h.replace(a,b)}
 once('function dzGun(){',"\n// DEAD_ZONE_PATCH_517 — Phase 3.1: reliable round restarts, bounded VFX GPU memory, optional performance overlay.\nconst DZ517={enabled:new URLSearchParams(location.search).get('diagnostico')==='1',label:null,start:0,frames:0,lastFps:0,fxDisposals:0};\nfunction dz517DisposeFx(root){\n if(!root)return;\n const geometries=new Set(),materials=new Set();\n root.traverse?.(obj=>{\n  if(obj.geometry)geometries.add(obj.geometry);\n  if(obj.material){const a=Array.isArray(obj.material)?obj.material:[obj.material];for(const m of a)if(m)materials.add(m)}\n });\n for(const g of geometries)g.dispose?.();\n for(const m of materials)m.dispose?.();\n DZ517.fxDisposals+=geometries.size+materials.size;\n}\nfunction dz517ResetEffects(){\n for(const storm of DZ516.twisters){scene.remove(storm.group);dz517DisposeFx(storm.group)}\n DZ516.twisters.length=0;\n for(const zombie of DZ516.chickens){\n  const c=zombie.dz516Chicken;if(!c)continue;\n  scene.remove(c.mesh);dz517DisposeFx(c.mesh);\n  zombie.t=c.original;\n  if(zombie.figure&&zombie.hp>0)zombie.figure.visible=true;\n  delete zombie.dz516Chicken;\n }\n DZ516.chickens.length=0;\n DZ516.bosses.clear();\n DZ516.heat=0;\n DZ516.heatLock=0;\n // Do not destroy textures shared with survivor and enemy avatars; those remain cached.\n if(typeof dz515HideGuide==='function')dz515HideGuide();\n if(typeof dz510Cancel==='function')dz510Cancel();\n if(typeof dz58Stop==='function')dz58Stop();\n touch.shoot=false;touch.aim.x=0;touch.aim.y=0;triggerLatch=false;\n if(typeof DZ515!=='undefined')DZ515.active=false;\n if(typeof DZ514!=='undefined')DZ514.aimEngaged=false;\n}\nfunction dz517Diagnostics(now){\n if(!DZ517.enabled)return;\n if(!DZ517.label){\n  const el=document.createElement('div');el.id='dz517-fps';\n  el.style.cssText='position:fixed;z-index:75;top:calc(env(safe-area-inset-top, 0px) + 62px);left:8px;pointer-events:none;user-select:none;background:#06151dcc;border:1px solid #5c8d9b;border-radius:7px;padding:7px 10px;color:#d4f8ff;font:11px/1.5 ui-monospace,monospace;white-space:pre;max-width:52vw';\n  document.body.appendChild(el);DZ517.label=el;\n }\n DZ517.label.style.display=playing?'block':'none';\n if(!playing){DZ517.start=0;DZ517.frames=0;return}\n if(!DZ517.start)DZ517.start=now;\n DZ517.frames++;\n if(now-DZ517.start<1000)return;\n DZ517.lastFps=Math.round(DZ517.frames*1000/Math.max(1,now-DZ517.start));\n DZ517.frames=0;DZ517.start=now;\n const info=renderer.info,rd=info?.render||{},mem=info?.memory||{};\n DZ517.label.textContent='DEAD ZONE · DIAGNÓSTICO\\n'+\n  'FPS '+DZ517.lastFps+' · ZOMBIS '+zombies.length+' · BALAS '+bullets.length+\n  '\\nPARTÍCULAS '+particles.length+' · VFX '+DZ516.twisters.length+\n  '\\nDRAW '+(rd.calls||0)+' · TRI '+(rd.triangles||0)+\n  '\\nGEO '+(mem.geometries||0)+' · TEX '+(mem.textures||0);\n}\n"+'\nfunction dzGun(){','install phase3 safeguards');
 once("scene.remove(t.group);t.group.traverse(o=>{if(o.isMesh)o.geometry?.dispose?.()});DZ516.twisters.splice(i,1)",
 "scene.remove(t.group);dz517DisposeFx(t.group);DZ516.twisters.splice(i,1)",
 'clean GPU cyclone effects');
 once("scene.remove(c.mesh);c.mesh.traverse(o=>o.geometry?.dispose?.());",
 "scene.remove(c.mesh);dz517DisposeFx(c.mesh);",
 'clean GPU chicken effects');
 once('mysteryMoveAt=6;relocateMystery();dz514ClearBox();DZ514.aimEngaged=false;barricadeLv=0;',
 'mysteryMoveAt=6;relocateMystery();dz514ClearBox();DZ514.aimEngaged=false;dz517ResetEffects();barricadeLv=0;',
 'reset old temporary effects and stuck inputs');
 once('lastMobileFrame=now;const dt=Math.min(.05,',
 'lastMobileFrame=now;dz517Diagnostics(now);const dt=Math.min(.05,',
 'real rendered-frame diagnostics');
 h=h.replace('</head>','<!-- DEAD_ZONE_PATCH_517: Phase 3.1 mobile stability, GPU effects disposal, clean restart and optional diagnostic FPS --></head>');
 fs.writeFileSync(file,h);
 console.log('DEAD ZONE PHASE 3.1: reliable effects cleanup, clean restart, real FPS and GPU diagnostic mode');
}
