'use strict';
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'index.html');
let html=fs.readFileSync(file,'utf8');
if(html.includes('DEAD_ZONE_PATCH_59')){console.log('v5.9 installed')}else{
 function once(a,b,label){const n=html.split(a).length-1;if(n!==1)throw Error('v5.9 '+label+' anchor '+n);html=html.replace(a,b)}
 // Previous patches erroneously referenced touchDevice, a variable the base game never defines.
 // It broke the requestAnimationFrame tick because dz58Tick -> dz58Ready threw ReferenceError.
 once('function dz52TouchInstall(){\n if(!touchDevice)return;',
 'function dz52TouchInstall(){\n if(!MOBILE_MODE)return;',
 'legacy canvas touch handler startup');
 once("function dz58Ready(){\n if(!touchDevice||!MOBILE_MODE||!playing||paused||player.dead||DZ55.downed)return false;",
 "function dz58Ready(){\n if(!MOBILE_MODE||!playing||paused||player.dead||DZ55.downed)return false;",
 'critical per-frame undefined variable');
 once('function dz58Install(){\n if(!touchDevice||DZ58.layer)return;',
 'function dz58Install(){\n if(!MOBILE_MODE||DZ58.layer)return;',
 'gesture initialization undefined variable');
 if(/\btouchDevice\b/.test(html))throw Error('v5.9 undefined touchDevice reference remains');
 // A null canvas modal element cannot prevent normal game interaction.
 once("if(document.querySelector('.modalshade:not(.hidden)'))return false;",
 "if(document.querySelector('.modalshade:not(.hidden)'))return false;",
 'modal safety check');
 html=html.replace('</head>','<!-- DEAD_ZONE_PATCH_59: mobile touch startup and uninterrupted gameplay restored --></head>');
 fs.writeFileSync(file,html);
 console.log('DEAD ZONE v5.9 fixed undefined touchDevice in every-frame controls, preserving 360 degree aim/fire');
}
