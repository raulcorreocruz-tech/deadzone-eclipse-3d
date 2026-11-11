'use strict';
/** DEAD ZONE v3.9 Gameplay upgrade. Runs after unpacking the v3.8 game. */
const fs=require('node:fs');
const path=require('node:path');
const file=path.join(__dirname,'index.html');
let html=fs.readFileSync(file,'utf8');
const changed=[];
function once(find,repl,name,required=true){
 const pos=html.indexOf(find);
 if(pos<0){if(required)throw Error('v3.9: missing anchor '+name);console.warn('v3.9 optional missing:',name);return false}
 if(html.indexOf(find,pos+find.length)>=0)console.warn('v3.9 multiple matches:',name);
 html=html.slice(0,pos)+(typeof repl==='function'?repl(find):repl)+html.slice(pos+find.length);
 changed.push(name);return true;
}
if(html.includes('DEAD_ZONE_PATCH_39')){console.log('v3.9 already patched');process.exit(0)}
const extra=String.raw`
// DEAD_ZONE_PATCH_39 — gameplay additions, deliberately lightweight on mobile.
const DZ39={grenades:[],grenadeCount:3,streak:null,carModel:null,heliModel:null,towerModel:null,visualGun:null,visualGunId:-1,visualGunLevel:-1,spawnIndex:0};
function dzGun(){
 const id=weaponId(),lv=level(id);if(DZ39.visualGunId===id&&DZ39.visualGunLevel===lv)return;
 DZ39.visualGunId=id;DZ39.visualGunLevel=lv;
 if(DZ39.visualGun){hero.remove(DZ39.visualGun);DZ39.visualGun.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose()}})}
 const w=weapon(),cat=w.category||'',g=new THREE.Group();g.position.set(.43,1.44,.53);
 const hash=[...w.name].reduce((a,c)=>a+c.charCodeAt(0),0);const tint=lv>=3?0xe2ae3c:lv===2?0x8c62db:lv===1?0x368fd7:0x343d43;
 const metal=new THREE.MeshStandardMaterial({color:tint,roughness:lv?.27:.49,metalness:.72,emissive:lv?0x15304b:0,emissiveIntensity:lv*.22});
 const dark=new THREE.MeshStandardMaterial({color:0x11181c,roughness:.62,metalness:.55});
 const steel=new THREE.MeshStandardMaterial({color:0x69747a,roughness:.35,metalness:.83});
 function box(mat,x,y,z,wid,hei,dep){const m=new THREE.Mesh(new THREE.BoxGeometry(wid,hei,dep),mat.clone());m.position.set(x,y,z);m.castShadow=!MOBILE_MODE;g.add(m);return m}
 function barrel(x,y,z,len,r=.046){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,8),steel.clone());m.rotation.x=Math.PI/2;m.position.set(x,y,z);m.castShadow=!MOBILE_MODE;g.add(m)}
 const melee=cat==='Cuerpo a cuerpo',smg=cat==='Subfusiles',shotgun=cat==='Escopetas',lmg=cat==='Ametralladoras ligeras',pistol=cat==='Pistola';
 if(melee){const long=/Katana|espada|Caos|Zoro/i.test(w.name);box(dark,0,-.12,-.12,.12,.14,.42);box(steel,0,-.01,long?.67:.36,.075,.07,long?1.18:.68);if(/motosierra/i.test(w.name))box(metal,0,-.05,.35,.23,.25,.55)}
 else{const len=pistol?.46:smg?.68:shotgun?1.22:lmg?1.34:1.04;box(metal,0,0,.08,.2+(hash%4)*.016,.23,len);box(dark,0,-.25,-.12,.15,.36,.22);box(dark,0,.15,.02,.12,.1,len*.58);barrel(0,0,len*.68+.16,shotgun?.88:lmg?.81:smg?.35:.6,shotgun?.075:.047);box(dark,0,-.17,.15,.13,lmg?.47:.36,.22);if(lmg)box(metal,.12,-.24,.12,.25,.3,.43);if(shotgun)barrel(0,-.11,len*.69,.77,.027);if(hash%3===0)box(steel,0,.22,.17,.13,.08,.25);}
 if(lv){const glow=new THREE.PointLight(lv>=3?0xf3c76b:0x539bfa,Math.min(.65,.16*lv),3);glow.position.set(0,.06,.6);g.add(glow)}
 hero.add(g);DZ39.visualGun=g;
 if(typeof weaponDisplay!=='undefined')weaponDisplay.visible=false;
}
function dzTracer(x,z,dx,dz,color=0xffc46b,len=1.3){
 if(!playing||MOBILE_MODE&&particles.length>55)return;
 const m=new THREE.Mesh(new THREE.CylinderGeometry(.035,.052,len,6),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9,depthWrite:false}));
 m.rotation.x=Math.PI/2;m.rotation.y=Math.atan2(dx,dz);m.position.set(x,1.44,z);scene.add(m);DZ39.grenades.push({visual:true,mesh:m,ttl:.07});
}
function dzExplosion(x,z,r=5.6,damage=260){
 const shock=new THREE.Mesh(new THREE.RingGeometry(.2,r,28),new THREE.MeshBasicMaterial({color:0xffac51,transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false}));shock.rotation.x=-Math.PI/2;shock.position.set(x,.15,z);scene.add(shock);DZ39.grenades.push({visual:true,mesh:shock,ttl:.25});
 tone(70,.33,'sawtooth',.12);for(let i=0;i<(MOBILE_MODE?9:19);i++)particle(x,.4,z, i%2?0xff7a29:0xffd986,.24,.55,5);
 if(coop.active&&coop.guest)netSend({type:'fire',x,z,a:player.angle,weaponId:-2});
 if(!coop.guest)for(const zed of [...zombies]){const dist=D({x,z},zed);if(dist<r)hitEnemy(zed,damage*(1-dist/r)*1.25)}
 if(Math.hypot(player.x-x,player.z-z)<2.3)hurt(9);
}
function dzGrenade(){if(!playing||paused||player.dead)return;if(DZ39.grenadeCount<=0){notify('SIN GRANADAS · NUEVAS EN LA SIGUIENTE RONDA');return}
 DZ39.grenadeCount--;const a=player.angle,m=new THREE.Mesh(new THREE.SphereGeometry(.17,10,8),new THREE.MeshStandardMaterial({color:0x444e40,roughness:.7,metalness:.35}));m.position.set(player.x,1.8,player.z);scene.add(m);
 DZ39.grenades.push({mesh:m,x:player.x,z:player.z,y:1.8,vx:Math.sin(a)*13,vz:Math.cos(a)*13,vy:6,ttl:2.15,bounces:0});tone(380,.05,'triangle',.025);notify('GRANADA · '+DZ39.grenadeCount+' RESTANTES',.8);
}
function dzMelee(){if(!playing||paused||player.dead||player.cool>0)return;player.cool=.54;const id=weaponId(),w=weapon(),isMelee=w.category==='Cuerpo a cuerpo',radius=isMelee?3.25:2.05,damage=isMelee?weaponStats(w,id).damage*2.3:82;
 let hits=0;for(const z of [...zombies]){const dx=z.x-player.x,dz=z.z-player.z,dist=Math.hypot(dx,dz),diff=Math.atan2(Math.sin(Math.atan2(dx,dz)-player.angle),Math.cos(Math.atan2(dx,dz)-player.angle));if(dist<radius&&Math.abs(diff)<.9){if(!coop.guest)hitEnemy(z,damage);hits++}}
 if(coop.active&&coop.guest)netSend({type:'fire',x:player.x,z:player.z,a:player.angle,weaponId:-3});tone(hits?115:180,.13,'sawtooth',.055);weaponKick=.22;if(hits)notify('¡GOLPE CUERPO A CUERPO!',.55);
}
function dzFireStreak(){if(player.cool>0)return;const a=player.angle,dx=Math.sin(a),dz=Math.cos(a),target=zombies.filter(z=>{const vx=z.x-player.x,vz=z.z-player.z,dist=Math.hypot(vx,vz);return dist<45&&dist>0&&Math.abs(Math.atan2(Math.sin(Math.atan2(vx,vz)-a),Math.cos(Math.atan2(vx,vz)-a)))<.15}).sort((a,b)=>D(player,a)-D(player,b))[0];
 const airborne=player.heli>0;player.cool=airborne?.085:.65;dzTracer(player.x+dx*2,player.z+dz*2,dx,dz,airborne?0xffd165:0x80d5ff,airborne?2:3);
 if(coop.active&&coop.guest)netSend({type:'fire',x:player.x,z:player.z,a:player.angle,weaponId:airborne?-4:-5});if(target&&!coop.guest)hitEnemy(target,airborne?105:580);tone(airborne?105:65,airborne?.085:.3,'sawtooth',airborne?.07:.12);weaponKick=.2;
}
function dzStreakShop(){
 const tabs=$('tabs'),list=$('weaponList');tabs.innerHTML='';list.innerHTML='';
 const items=[['heli','🚁 HELICÓPTERO ARTILLADO',6500,'10 s · apunta y dispara con FUEGO; no recibe daño'],['car','🚗 COCHE ANTIZOMBIS',4600,'18 s · atropella zombis, 5 impactos antes de romperse'],['tower','🏙️ FRANCOTIRADOR ELEVADO',7500,'16 s · disparos precisos y letales, sin recibir daño'],['dogs','🐕 PERROS DE APOYO',3000,'3 perros durante 30 s · puedes seguir usando tu arma'],['turret','⚙️ TORRETA DEFENSIVA',2600,'Apoyo automático de 90 s']];
 const title=document.createElement('div');title.textContent='CENTRAL DE RACHAS · ARMAS ÚNICAMENTE EN CAJA ALEATORIA';title.className='notice';list.appendChild(title);
 for(const [key,name,cost,desc] of items){const card=document.createElement('div');card.className='weapon';const b=document.createElement('b');b.textContent=name;const info=document.createElement('small');info.textContent=desc;const btn=document.createElement('button');btn.className='btn slim';btn.textContent=cost.toLocaleString('es-ES')+' PTS';btn.onclick=()=>{if(player.points<cost){notify('NECESITAS '+cost+' PUNTOS');return;}if((player.heli>0||player.car>0||player.tower>0)&&['heli','car','tower'].includes(key)){notify('YA TIENES UNA RACHA ACTIVA');return}player.points-=cost;
 if(key==='heli')player.heli=10;
 if(key==='car'){player.car=18;player.carHits=0}
 if(key==='tower')player.tower=16;
 if(key==='dogs'){player.dogs=30;for(let i=0;i<3;i++)spawnDog(i)}
 if(key==='turret')makeTurret();
 paused=false;$('shopModal').classList.add('hidden');notify(name+' ACTIVADO',2);updateHud();};card.append(b,info,btn);list.appendChild(card)}
}
function dzSteer(z,angle,move,dt){
 const r=Math.max(.25,z.size*.3);if(z.aiSide===undefined)z.aiSide=Math.random()<.5?-1:1;
 const distance=D(player,z);let bias=distance>4.5?Math.min(.33,distance*.015)*z.aiSide:0;
 const desired=angle+bias;const sides=[0,.4,-.4,.8,-.8,1.2,-1.2,1.65,-1.65,2.3,-2.3,Math.PI];
 if((z.wallTime||0)>0){z.wallTime-=dt;sides.unshift(z.wallAngle-angle)}
 let best=null,bestScore=-Infinity;
 for(let i=0;i<sides.length;i++){
 const theta=desired+sides[i],vx=Math.sin(theta),vz=Math.cos(theta),nx=z.x+vx*move,nz=z.z+vz*move;
 if(blocked(nx,z.z,r)||blocked(nx,nz,r))continue;
 let crowd=0;for(const o of zombies){if(o===z)continue;const dist=Math.hypot(nx-o.x,nz-o.z);if(dist<r+o.size*.32+.35)crowd+=(r+o.size*.32+.35-dist)*1.8}
 const progress=(z.x-player.x)**2+(z.z-player.z)**2-((nx-player.x)**2+(nz-player.z)**2);
 const score=progress*.75-Math.abs(sides[i])*.25-crowd+(z.wallTime>0&&i===0?1:0);
 if(score>bestScore){bestScore=score;best={nx,nz,theta,i}}
 }
 if(best){const px=z.x,pz=z.z;z.x=best.nx;z.z=best.nz;if(best.i>0){z.wallAngle=best.theta;z.wallTime=.5+Math.random()*.35}z.stuck=Math.hypot(z.x-px,z.z-pz)<.002?(z.stuck||0)+dt:0}else z.stuck=(z.stuck||0)+dt;
 if(z.stuck>1){z.aiSide*=-1;z.wallTime=0;z.stuck=0}
}
function dzTick(dt){
 for(const gr of [...DZ39.grenades]){
  if(gr.visual){gr.ttl-=dt;gr.mesh.material.opacity=Math.max(0,gr.ttl/.25);if(gr.ttl<=0){scene.remove(gr.mesh);gr.mesh.geometry.dispose();gr.mesh.material.dispose();DZ39.grenades.splice(DZ39.grenades.indexOf(gr),1)}continue}
  gr.ttl-=dt;gr.vy-=12*dt;const nx=gr.x+gr.vx*dt,nz=gr.z+gr.vz*dt;
  if(blocked(nx,nz,.18)){gr.vx*=-.45;gr.vz*=-.45}else{gr.x=nx;gr.z=nz}
  gr.y+=gr.vy*dt;if(gr.y<.2){gr.y=.2;gr.vy=Math.abs(gr.vy)*.4;gr.vx*=.72;gr.vz*=.72;gr.bounces++}
  gr.mesh.position.set(gr.x,gr.y,gr.z);
  if(gr.ttl<=0||gr.bounces>3){dzExplosion(gr.x,gr.z);scene.remove(gr.mesh);gr.mesh.geometry.dispose();gr.mesh.material.dispose();DZ39.grenades.splice(DZ39.grenades.indexOf(gr),1)}
 }
 if(player.car>0){player.car=Math.max(0,player.car-dt);for(const z of [...zombies])if(D(player,z)<1.8){if(!coop.guest)hitEnemy(z,430*dt);if((z.carCD||0)<=0){z.carCD=1;player.carHits++;if(player.carHits>=5){player.car=0;notify('COCHE DESTROZADO',2)}}}for(const z of zombies)z.carCD=Math.max(0,(z.carCD||0)-dt)}
 if(player.tower>0)player.tower=Math.max(0,player.tower-dt);
 if(DZ39.visualGun){DZ39.visualGun.position.z=.53-weaponKick*.15}
 dzGun();if(typeof weaponDisplay!=='undefined')weaponDisplay.visible=false;
}
function dzMobileButtons(){
 if(!MOBILE_MODE||document.getElementById('dz39-melee'))return;
 for(const [id,label,bottom,right,fn] of [['dz39-melee','MELEE','21%','19%',dzMelee],['dz39-grenade','GRANADA','38%','19%',dzGrenade]]){
 const b=document.createElement('button');b.id=id;b.type='button';b.textContent=label;b.className='dz39-action';b.style.bottom=bottom;b.style.right=right;
 b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();fn()});document.body.appendChild(b);
 }
}
function dzModelTick(){
 const nowHeli=player.heli>0,nowCar=player.car>0,nowTower=player.tower>0;
 if(nowHeli&&!DZ39.heliModel){const g=new THREE.Group(),mat=new THREE.MeshStandardMaterial({color:0x344a52,metalness:.55,roughness:.46});const fus=new THREE.Mesh(new THREE.BoxGeometry(2.2,.9,3.3),mat);g.add(fus);const rotor=new THREE.Mesh(new THREE.BoxGeometry(7,.05,.17),mat);rotor.position.y=.85;g.add(rotor);g.userData.rotor=rotor;scene.add(g);DZ39.heliModel=g}
 if(DZ39.heliModel){DZ39.heliModel.visible=nowHeli;DZ39.heliModel.position.set(player.x,7,player.z);DZ39.heliModel.rotation.y=player.angle;DZ39.heliModel.userData.rotor.rotation.y+=.65}
 if(nowCar&&!DZ39.carModel){const g=new THREE.Group(),bodyMat=new THREE.MeshStandardMaterial({color:0x6a292a,metalness:.72,roughness:.35}),tire=new THREE.MeshStandardMaterial({color:0x101112,roughness:1});const car=new THREE.Mesh(new THREE.BoxGeometry(2.5,.9,3.8),bodyMat);car.position.y=.75;g.add(car);const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.95,.65,1.9),bodyMat);cabin.position.set(0,1.35,-.2);g.add(cabin);for(const x of [-1.15,1.15])for(const z of [-1.15,1.15]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.46,.46,.22,10),tire);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.45,z);g.add(wheel)}scene.add(g);DZ39.carModel=g}
 if(DZ39.carModel){DZ39.carModel.visible=nowCar;DZ39.carModel.position.set(player.x,0,player.z);DZ39.carModel.rotation.y=player.angle}
 if(nowTower&&!DZ39.towerModel){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:0x505c61,metalness:.75,roughness:.45});const col=new THREE.Mesh(new THREE.BoxGeometry(1.5,12,1.5),m);col.position.y=6;g.add(col);const top=new THREE.Mesh(new THREE.BoxGeometry(4,.5,4),m);top.position.y=12;g.add(top);scene.add(g);DZ39.towerModel=g}
 if(DZ39.towerModel){DZ39.towerModel.visible=nowTower;DZ39.towerModel.position.set(player.x,0,player.z)}
 if(nowHeli||nowTower)hero.position.y=nowHeli?7:12.4;
 if(nowCar)hero.visible=false;
}
`;
once('function shoot(){',extra+'\nfunction shoot(){','inject combat and visuals');
once('function shoot(){if(!playing||paused||player.dead||player.reload>0||player.cool>0||player.heli>0)return;',"function shoot(){if(!playing||paused||player.dead||player.reload>0||player.cool>0)return;if(player.heli>0||player.tower>0){dzFireStreak();return}",'streak fire manual');
once('if(pl===\'Invocación de perros\'){if(player.dogs>0)return;',"if(pl==='Invocación de perros'){if(player.dogs>0)return;",'dog retains firing ability',false);
once('bmesh.castShadow=false;bullets.push',"bmesh.scale.set(.34,.34,shotgun?2:3.4);bmesh.rotation.y=a2;bmesh.castShadow=false;bullets.push",'bullet tracer silhouettes',false);
once('player.upgrades[id]=lv+1;',"player.upgrades[id]=lv+1;DZ39.visualGunLevel=-1;dzGun();",'pack gun appearance');
once("function openShop(){paused=true;$('shopModal').classList.remove('hidden');drawShop()}","function openShop(){paused=true;$('shopModal').classList.remove('hidden');dzStreakShop()}",'only streak shop');
once("if(e.code==='KeyR')reload();","if(e.code==='KeyG')dzGrenade();if(e.code==='KeyV')dzMelee();if(e.code==='KeyR')reload();",'keyboard grenade and melee');
once("setupStick('movestick',touch.move);setupStick('aimstick',touch.aim);","setupStick('movestick',touch.move);setupStick('aimstick',touch.aim);dzMobileButtons();",'touch melee grenade');
once("const speed=z.t.speed*(1+Math.min(wave,40)*.012)*(z.freeze>0||freezeUntil>gameTime?.18:1);","const speed=z.t.speed*(1+Math.min(wave,40)*.012)*(z.freeze>0||freezeUntil>gameTime?.18:1)*(z.crawler?.39:1);",'crawlers slow',false);
once('if(d>z.size*.35+.45){const nx=z.x+Math.sin(angle)*move,nz=z.z+Math.cos(angle)*move;if(!blocked(nx,z.z,z.size*.3))z.x=nx;if(!blocked(z.x,nz,z.size*.3))z.z=nz}else if(z.attack<=0)',
'if(d>z.size*.35+.45){dzSteer(z,angle,move,dt)}else if(z.attack<=0)','steering and flanking',false);
once('z.figure.position.x=z.x;z.figure.position.z=z.z;','z.figure.position.x=z.x;z.figure.position.z=z.z;z.figure.rotation.x=z.crawler?-1.12:0;','crawler pose',false);
once('z.hp-=dmg;z.hit=.16;','z.hp-=dmg;z.hit=.16;if(z.hp>0&&z.hp<z.maxHp*.3&&z.kind===\'normal\'&&!z.crawler&&Math.random()<.4){z.crawler=true;notify(\'¡ZOMBI ARRASTRÁNDOSE!\',.8)}','crawler injury');
once('const a=rnd(0,TAU),rad=rnd(10,18);','const a=(DZ39.spawnIndex++%12)*(TAU/12)+rnd(-.2,.2),rad=rnd(10,18);','surrounding spawns',false);
once('const shots=shotgun?(s.pellets||6):1;',"if(level(id)>0)tone(130+level(id)*70,.18,'sawtooth',.04);const shots=shotgun?(s.pellets||6):1;",'upgraded gun firing tone');
once("if(player.heli>0){player.heli-=dt;player.cool-=dt;const target=zombies.reduce((best,z)=>!best||D(player,z)<D(player,best)?z:best,null);if(target&&player.cool<=0){hitEnemy(target,140);particle(target.x,2,target.z,0xffd780,.22,.25);player.cool=.08}if(player.heli<=0)notify('HELICÓPTERO FINALIZADO')}","if(player.heli>0){player.heli=Math.max(0,player.heli-dt);if(player.heli<=0)notify('HELICÓPTERO FINALIZADO')}",'helicopter fires on demand',false);
once('function hurt(n,source=null){if(player.ifr>0||player.dead)return;',"function hurt(n,source=null){if(player.ifr>0||player.dead||player.heli>0||player.tower>0)return;",'streak safety',false);
once("if(m.type==='remoteFire'&&!coop.guest){","if(m.type==='remoteFire'&&!coop.guest){if(m.weaponId===-2){dzExplosion(m.x,m.z);return}if(m.weaponId===-3){for(const z of [...zombies]){const dx=z.x-m.x,dz=z.z-m.z;if(Math.hypot(dx,dz)<3&&Math.abs(Math.atan2(Math.sin(Math.atan2(dx,dz)-m.a),Math.cos(Math.atan2(dx,dz)-m.a)))<1)hitEnemy(z,150)}return}if(m.weaponId===-4||m.weaponId===-5){const target=zombies.filter(z=>Math.hypot(z.x-m.x,z.z-m.z)<45&&Math.abs(Math.atan2(Math.sin(Math.atan2(z.x-m.x,z.z-m.z)-m.a),Math.cos(Math.atan2(z.x-m.x,z.z-m.z)-m.a)))<.17).sort((a,b)=>D(m,a)-D(m,b))[0];if(target)hitEnemy(target,m.weaponId===-4?105:620);return}",'remote cooperative melee grenade streaks',false);
once('const sp=(player.moto>0?11:player.roll>0?13:6.2)',"const sp=(player.car>0?14:player.moto>0?11:player.roll>0?13:6.2)",'car physics',false);
once('Object.assign(physics,{vx:0,vz:0,impactX:0,impactZ:0});',"for(const gr of DZ39.grenades){scene.remove(gr.mesh);gr.mesh.geometry.dispose();gr.mesh.material.dispose()}DZ39.grenades.length=0;DZ39.grenadeCount=3;DZ39.visualGunId=-1;DZ39.visualGunLevel=-1;Object.assign(physics,{vx:0,vz:0,impactX:0,impactZ:0});",'reset grenades and gun',false);
once('function startRound(){if(player.dead)return;wave++;',"function startRound(){if(player.dead)return;wave++;DZ39.grenadeCount=Math.min(5,DZ39.grenadeCount+2);",'grenade resupply');
once('const controlsNodes=Object.fromEntries(controlDefs.map(([id])=>[id,$(id)]));',"if(MOBILE_MODE)controlDefs.push(['dz39-melee','Cuerpo a cuerpo',true],['dz39-grenade','Granada',true]);const controlsNodes=Object.fromEntries(controlDefs.map(([id])=>[id,$(id)]));",'customizable new touch buttons',false);
once('function tick(dt){gameTime+=dt;',"function tick(dt){gameTime+=dt;dzTick(dt);",'step grenade and streak physics');
once('camera.lookAt(player.x,0,player.z-1);','camera.lookAt(player.x,player.tower>0?7:player.heli>0?4:0,player.z-1);','streak camera height',false);
once("hero.visible=true;setActorAnimation(hero,l>.18?'run':'idle');","hero.visible=true;setActorAnimation(hero,l>.18?'run':'idle');dzModelTick();",'visible streak models',false);
// As a fallback, a streak model runs every frame even if actor animation APIs change.
once('const trigger=!!((!MOBILE_MODE&&mouse.down)||touch.shoot||keys.KeyJ);',"const trigger=!!((!MOBILE_MODE&&mouse.down)||touch.shoot||keys.KeyJ);",'ensure manual fire remains',false);
const style=String.raw`
.dz39-action{position:fixed;z-index:3003;width:clamp(47px,8.4vw,72px);height:clamp(47px,8.4vw,72px);border:2px solid rgba(216,233,236,.65);border-radius:50%;background:rgba(15,28,38,.47);color:#f4f1e9;font-family:system-ui,sans-serif;font-size:clamp(9px,1.5vw,12px);font-weight:800;touch-action:none;user-select:none;box-shadow:0 0 12px #0008}
body:not(:has(#hud:not(.hidden))) .dz39-action{display:none}
@media(pointer:fine){.dz39-action{display:none}}
`;
once('</style>',style+'</style>','mobile action styles');
html=html.replace(/<title>([^<]*?)v3\.8([^<]*)<\/title>/i,'<title>$1v3.9$2</title>');
fs.writeFileSync(file,html);
console.log('DEAD ZONE v3.9 patched:',changed.join(', '));