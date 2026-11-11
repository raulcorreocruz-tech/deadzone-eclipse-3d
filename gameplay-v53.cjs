'use strict';
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'index.html');
let html=fs.readFileSync(file,'utf8');
if(html.includes('DEAD_ZONE_PATCH_53')){console.log('v5.3 installed')}else{
function once(a,b,label){const n=html.split(a).length-1;if(n!==1)throw Error('v5.3 '+label+' anchor '+n);html=html.replace(a,b)}
once('const cap=MOBILE_MODE?(qualityMode===\'low\'?1:2):4;',"const cap=MOBILE_MODE?(qualityMode==='low'?3:6):14;",'real humanoid zombie count');
once('const actor=gltf.scene.clone(true);\n  const bound=',"const actor=dz42SkeletonClone(gltf.scene);\n  const bound=",'preserve skinned zombie skeleton');
once("for(const kind of ['runner','gritona','trepador','toxico','invocador'])DZ42.kindFile[kind]='zombie_mummy';",
"for(const kind of ['normal','runner','gritona','trepador','toxico','invocador','coloso','final'])DZ42.kindFile[kind]='zombie_realista';",'replace fantasy monster models with humanoid zombies');
once("gun.rotation.z+=(family==='shotgun'?.17:family==='sniper'?.10:family==='pistol'?.14:.045)*Math.sin(t*1.8)*.15;",
"gun.rotation.z=(DZ46.equip>0?.14:0)+(family==='shotgun'?.17:family==='sniper'?.10:family==='pistol'?.14:.045)*Math.sin(t*1.8)*.15-(reload>0?Math.sin(reload*Math.PI)*.21:0);",'stop cumulative weapon rotation drift');
once("gun.rotation.x-=kick*(family==='shotgun'?.5:family==='sniper'?.45:family==='pistol'?.22:.12);",
"gun.rotation.x-=Math.min(.38,kick)*(family==='shotgun'?.5:family==='sniper'?.45:family==='pistol'?.22:.12);",'bounded recoil');
once("gun.position.y-=Math.abs(action)*(family==='shotgun'?.20:.11);",
"gun.position.y-=Math.abs(action)*(family==='shotgun'?.20:family==='sniper'?.16:family==='lmg'?.09:.11);",'family-specific reload movement');
once("if(e.pointerType==='mouse'||!allowed()||DZ52.aimPointer!==null)return;",
"if(e.pointerType==='mouse'||!allowed()||DZ52.aimPointer!==null||e.isPrimary===false&&e.pointerType!=='touch')return;",'touch pointer guard');
html=html.replace('</head>','<meta name="deadzone-mobile-controls" content="joystick-left-tap-hold-to-aim-fire" /><!-- DEAD_ZONE_PATCH_53 --></head>');
fs.writeFileSync(file,html);console.log('DEAD ZONE v5.3 compact HUD, tap/hold aim and fire, humanoid zombie rig and stable weapon motion');
}
