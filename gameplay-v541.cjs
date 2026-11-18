'use strict';
const fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'index.html');
let h=fs.readFileSync(file,'utf8');
if(h.includes('DEAD_ZONE_PATCH_541')){console.log('v541 already installed');}
else{
 const anchor='function dzGun(){';
 if(h.split(anchor).length!==2)throw Error('v541: runtime anchor not unique');
 const runtime=String.raw\`
// DEAD_ZONE_PATCH_541 — guest fire delivery, Monopoly playable area and Android load scaling.
const DZ541={sentFire:0,recoveredFire:0,shots:0,world:null,open:false,lastPortal:-99,
  collected:new Set(),round:-1,visuals:[],qualitySamples:0,qualitySeconds:0,qualityLast:0};
const dz541PreviousSend=netSend;
netSend=function(message,...rest){
 if(message?.type==='fire')DZ541.sentFire++;
 return dz541PreviousSend(message,...rest);
};
const dz541PreviousShoot=shoot;
shoot=function(...args){
 const guest=!!(coop?.active&&coop.guest);
 const beforeFire=DZ541.sentFire,beforeCool=player.cool;
 const id=weaponId(),w=weapon(),beforeAmmo=ammoFor(id).mag;
 const output=dz541PreviousShoot(...args);
 if(!guest||!playing||paused||player.dead||DZ55.downed)return output;
 // Recover a valid guest shot only when the original firing pipeline failed to relay it.
 // Do not duplicate packets sent by the legacy handler; the host remains authoritative.
 const started=player.cool>beforeCool+.00001||
   (w.category!=='Cuerpo a cuerpo'&&ammoFor(id).mag<beforeAmmo);
 if(started){
  DZ541.shots++;
  if(DZ541.sentFire===beforeFire&&coop.ws?.readyState===WebSocket.OPEN){
   netSend({type:'fire',x:player.x,z:player.z,a:player.angle,weaponId:id});
   DZ541.recoveredFire++;
  }
 }
 return output;
};
function dz541Square(parent,x,z,color,label){
 const plate=new THREE.Mesh(new THREE.BoxGeometry(2.85,.11,2.85),
   new THREE.MeshLambertMaterial({color}));
 plate.position.set(x,.105,z);plate.receiveShadow=false;parent.add(plate);
 const inner=new THREE.Mesh(new THREE.BoxGeometry(2.38,.016,2.38),
   new THREE.MeshBasicMaterial({color:0x101a2b}));inner.position.set(x,.17,z);parent.add(inner);
 if(label){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=70;
  const ctx=canvas.getContext('2d');if(ctx){ctx.fillStyle='#fff';ctx.font='bold 27px sans-serif';ctx.textAlign='center';ctx.fillText(label,128,47);
   const map=new THREE.CanvasTexture(canvas);const mat=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,side:THREE.DoubleSide});
   const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.35,.65),mat);sign.rotation.x=-Math.PI/2;sign.position.set(x,.189,z);parent.add(sign);
  }
 }
}
function dz541Portal(x,z,title){
 const g=new THREE.Group();g.position.set(x,0,z);
 const blue=new THREE.MeshBasicMaterial({color:0x4adaed});
 const dark=new THREE.MeshLambertMaterial({color:0x133653});
 for(const side of [-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.23,3.2,.24),dark);p.position.set(side*1.3,1.6,0);g.add(p)}
 const top=new THREE.Mesh(new THREE.BoxGeometry(2.85,.25,.25),dark);top.position.y=3.15;g.add(top);
 const gate=new THREE.Mesh(new THREE.PlaneGeometry(2.35,2.65),new THREE.MeshBasicMaterial({color:0x4adaed,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false}));
 gate.position.y=1.45;g.add(gate);
 const label=document.createElement('canvas');label.width=512;label.height=90;
 const c=label.getContext('2d');if(c){c.fillStyle='#f7e6a2';c.font='bold 31px sans-serif';c.textAlign='center';c.fillText(title,256,57)}
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(4.2,.73),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(label),transparent:true,side:THREE.DoubleSide,depthWrite:false}));
 sign.position.y=3.65;g.add(sign);scene.add(g);return g;
}
function dz541World(){
 if(DZ541.world)return;
 const group=new THREE.Group();scene.add(group);DZ541.world=group;
 const base=new THREE.Mesh(new THREE.BoxGeometry(17,.17,17),new THREE.MeshLambertMaterial({color:0xd8d9cc}));
 base.position.set(44,-.02,32);base.receiveShadow=false;group.add(base);
 const colors=[0xe46348,0x3c9cce,0xe3b842,0x7b69c4,0x5db685,0xc775b1,0xb3a0df,0xe66c54,0xe6cd66,0x6bbaa2,0x5d96d4,0xc76cb4];
 let n=0;
 for(let i=0;i<4;i++)for(let j=0;j<4;j++){
  if(i!==0&&i!==3&&j!==0&&j!==3)continue;
  const x=38.7+j*3.5,z=26.7+i*3.5;
  dz541Square(group,x,z,colors[n%colors.length],['SALIDA','CALLE','SUERTE','ESTACIÓN','IMPUESTO','CAJA','AVENIDA','BONUS','PARKING','BANCO','HOTEL','PREMIO'][n]);
  const marker=new THREE.Mesh(new THREE.BoxGeometry(.5,.35,.5),new THREE.MeshLambertMaterial({color:0xf4df81}));
  marker.position.set(x,.44,z);group.add(marker);
  DZ541.visuals.push({x,z,marker,id:n});
  n++;
 }
 const board=new THREE.Mesh(new THREE.BoxGeometry(5,.02,5),new THREE.MeshLambertMaterial({color:0x287344}));
 board.position.set(44,.18,32);group.add(board);
 for(const [x,z,col] of [[42.5,31,0xe64b43],[45.2,31.4,0x4ab3db],[43.3,33.7,0xf1d76c]]){
  const house=new THREE.Mesh(new THREE.BoxGeometry(.95,.9,.95),new THREE.MeshLambertMaterial({color:col}));house.position.set(x,.65,z);group.add(house);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(.83,.45,4),new THREE.MeshLambertMaterial({color:0x252b37}));roof.position.set(x,1.32,z);roof.rotation.y=Math.PI/4;group.add(roof);
 }
 dz541Portal(-35,36,'MONOPOLY · 1800 PTS');
 dz541Portal(44,25,'VOLVER AL MAPA');
}
function dz541Near(x,z,r=2.8){const dx=player.x-x,dz=player.z-z;return dx*dx+dz*dz<=r*r}
const dz541OldInteract=interact;
interact=function(...args){
 if(playing&&!paused&&gameTime-DZ541.lastPortal>1.5){
  if(dz541Near(-35,36)){
   if(!DZ541.open){
    if(player.points<1800){notify('MONOPOLY · NECESITAS 1800 PUNTOS',2);return}
    player.points-=1800;DZ541.open=true;
   }
   player.x=44;player.z=28.5;DZ541.lastPortal=gameTime;
   hero.position.set(player.x,0,player.z);
   notify('MONOPOLY · RECOGE RECOMPENSAS POR EL TABLERO',3);updateHud();return;
  }
  if(dz541Near(44,25)){
   player.x=-35;player.z=33;DZ541.lastPortal=gameTime;
   hero.position.set(player.x,0,player.z);notify('REGRESO AL MAPA',1.5);return;
  }
 }
 return dz541OldInteract(...args);
};
const dz541PreviousReset=reset;
reset=function(...args){
 const ret=dz541PreviousReset(...args);
 DZ541.open=false;DZ541.round=-1;DZ541.collected.clear();DZ541.lastPortal=-99;
 for(const p of DZ541.visuals)p.marker.visible=true;
 return ret;
};
function dz541Tick(dt){
 if(!playing||paused)return;
 if(!DZ541.world)dz541World();
 if(DZ541.round!==wave){DZ541.round=wave;DZ541.collected.clear();for(const m of DZ541.visuals)m.marker.visible=true}
 if(player.x>36&&player.x<53&&player.z>24&&player.z<42){
  for(const item of DZ541.visuals){
   if(DZ541.collected.has(item.id))continue;
   if(dz541Near(item.x,item.z,1.18)){
    DZ541.collected.add(item.id);item.marker.visible=false;player.points+=120;
    notify('MONOPOLY · CASILLA +120 PTS',.7);updateHud();
   }
  }
 }
 // Adapt to actual mobile load without overriding custom graphics settings.
 if(!MOBILE_MODE||qualityMode!=='auto'||!DZ540.autoScale||!DZ524)return;
 DZ541.qualitySeconds+=dt;
 if(DZ541.qualitySeconds<3)return;
 DZ541.qualitySeconds=0;
 const enemies=zombies.length;
 if(enemies>=28&&DZ540.fps>0&&DZ540.fps<42&&renderScale>.60)
  dz540SetResolution(Math.max(.60,renderScale-.06));
}
const dz541OldTick=dz540FrameMonitor;
dz540FrameMonitor=function(now,dt){dz541OldTick(now,dt);dz541Tick(dt)};
queueMicrotask(()=>{try{dz541World()}catch(e){console.warn('Monopoly region',e)}});
window.__DZ541_STATUS=()=>({guest:!!coop?.guest,connected:coop.ws?.readyState===1,shots:DZ541.shots,fireMessages:DZ541.sentFire,recovered:DZ541.recoveredFire,
 monopolyOpen:DZ541.open,collected:DZ541.collected.size,zoneReady:!!DZ541.world,mobileScale:renderScale});
\`;
 h=h.replace(anchor,runtime+'\n'+anchor);
 h=h.replace('</head>','<!-- DEAD_ZONE_PATCH_541: guest shooting recovery, interactive Monopoly sector, mobile load control --></head>');
 fs.writeFileSync(file,h);console.log('DEAD ZONE v5.25.20: guest fire relay recovery, Monopoly portal + playable tile rewards, Android scaling');
}
