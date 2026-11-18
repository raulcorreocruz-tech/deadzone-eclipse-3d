'use strict';
const fs=require('node:fs');const s=fs.readFileSync('index.html','utf8');
for(const q of ['function frame(now){','function tick(dt){','function applyQuality(','function preferredScale(){','function dz531EnsurePixelOnly(){','function dz535Frame(){','function dz536ZombieFrame(){','function dz536AutoTarget(){','for(const mixer of activeMixers)','for(const mx of activeMixers)','activeMixers.forEach','function dz524FrameInfo(now){','function dz524ApplyGraphics(){','function dz52RealZombie(z){']){
 const p=s.indexOf(q);console.log('\n==== '+q+' '+p+' ====\n'+(p>=0?s.slice(p,p+(q.includes('frame(')?4900:3400)):'NOT_FOUND'));
}
