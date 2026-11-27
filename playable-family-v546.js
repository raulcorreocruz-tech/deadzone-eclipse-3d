
// DEAD_ZONE_PATCH_546: playable brother, proper 8-way turning for both photo characters,
// and weapon firing independent from skin-specific visual animation.
const DZ546_ID='hermano_personal',DZ546_ATLAS='/assets/hermano_playable_48c.png';
DZ43.skins.push({id:DZ546_ID,name:'Hermano · Personaje propio',description:'Gorra, barba y tatuajes · 8 direcciones, 9 animaciones',color:0x41444a,accent:0xb8a08d,hat:'none'});
if(typeof DZ544!=='undefined')DZ544.skinIDs.add(DZ546_ID);
const DZ546={atlas:null,loading:false,failed:false,local:null,remote:new WeakMap(),remotes:new Set(),
 lastFace:null,lastRuboFace:null,shotUntil:0,meleeUntil:0,useUntil:0,hurtUntil:0,remoteShots:new Map(),
 verifiedShots:0,shotErrors:0,lastShot:null};
function dz546Load(){
 if(DZ546.atlas||DZ546.loading||DZ546.failed)return;
 DZ546.loading=true;
 new THREE.TextureLoader().load(DZ546_ATLAS,texture=>{
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;
  texture.generateMipmaps=false;texture.needsUpdate=true;
  DZ546.atlas=texture;DZ546.loading=false;
 },undefined,error=>{DZ546.failed=true;DZ546.loading=false;console.warn('Brother pixel-art atlas load failed',error)});
}
function dz546Sprite(actor){
 if(!DZ546.atlas||!actor)return null;
 const texture=DZ546.atlas.clone();texture.repeat.set(1/24,1/9);
 texture.offset.set(0,8/9);texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;
 texture.wrapS=THREE.ClampToEdgeWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;
 texture.generateMipmaps=false;texture.needsUpdate=true;
 const material=new THREE.SpriteMaterial({map:texture,transparent:true,alphaTest:.08,depthTest:true,depthWrite:false,color:0xffffff});
 const sprite=new THREE.Sprite(material);
 sprite.position.set(0,1.42,0);sprite.scale.set(1.95,2.85,1);sprite.renderOrder=5;
 sprite.userData.dz545Action=-1;sprite.userData.dz545Tile=-1;sprite.userData.dz546=true;
 actor.add(sprite);return sprite;
}
function dz546Facing(previous){
 const moving=Math.hypot(physics.vx,physics.vz)>.32;
 const aiming=!!((touch.shoot||keys.KeyJ||mouse.down)||Math.hypot(touch.aim.x,touch.aim.y)>.15);
 // Aim wins while firing; otherwise direction follows actual movement.
 if(aiming)return player.angle;
 if(moving)return Math.atan2(physics.vx,physics.vz);
 return Number.isFinite(previous)?previous:player.angle;
}
function dz546Action(shotUntil,meleeUntil,useUntil,hurtUntil){
 if(player.dead||DZ55.downed)return 8;
 if(gameTime<hurtUntil)return 7;
 if(gameTime<meleeUntil)return 5;
 if(gameTime<useUntil)return 6;
 if(player.reload>0)return 4;
 if(gameTime<shotUntil||touch.shoot||keys.KeyJ||mouse.down)return 3;
 // player.vel is a normalized 0..1 quantity, so .7 is run, not 4.5.
 return player.vel>.7?2:player.vel>.12?1:0;
}
function dz546Tick(){
 const selected=DZ43.skin===DZ546_ID;
 if(selected||[...allies.values()].some(a=>a.userData?.dz55Skin===DZ546_ID))dz546Load();
 if(selected&&DZ546.atlas&&!DZ546.local)DZ546.local=dz546Sprite(hero);
 if(DZ546.local){
  DZ546.local.visible=selected;
  if(selected){
   const face=dz546Facing(DZ546.lastFace);DZ546.lastFace=face;
   dz545Animate(DZ546.local,dz546Action(DZ546.shotUntil,DZ546.meleeUntil,DZ546.useUntil,DZ546.hurtUntil),face,gameTime);
   dz531MaskLegacy(hero,true);
  }
 }
 // Rubo now turns the same way: left/right profiles, back when walking up,
 // and front while walking down. Fix the old, unreachable running threshold too.
 if(DZ43.skin===DZ545_ID&&DZ545.local?.visible){
  const face=dz546Facing(DZ546.lastRuboFace);DZ546.lastRuboFace=face;
  dz545Animate(DZ545.local,dz546Action(DZ545.shotUntil,DZ545.meleeUntil,DZ545.useUntil,DZ545.hurtUntil),face,gameTime);
 }
 for(const ally of allies.values()){
  const isBrother=ally.userData?.dz55Skin===DZ546_ID;
  let state=DZ546.remote.get(ally);
  if(isBrother&&DZ546.atlas&&!state){
   const sprite=dz546Sprite(ally);
   if(sprite){state={sprite,lastX:ally.position.x,lastZ:ally.position.z,lastMove:-10,heading:ally.rotation.y};DZ546.remote.set(ally,state);DZ546.remotes.add(ally)}
  }
  if(!state)continue;
  state.sprite.visible=isBrother;
  if(isBrother){
   const x=ally.position.x,z=ally.position.z,dx=x-state.lastX,dz=z-state.lastZ;
   if(Math.hypot(dx,dz)>.01){state.lastMove=gameTime;state.heading=Math.atan2(dx,dz)}
   state.lastX=x;state.lastZ=z;
   const fired=gameTime<(DZ546.remoteShots.get(ally.userData.dz55Id)||0);
   const action=ally.userData.dz55Downed?8:fired?3:gameTime-state.lastMove<.22?1:0;
   dz545Animate(state.sprite,action,fired?ally.rotation.y:state.heading,gameTime);
   dz531MaskLegacy(ally,true);
  }
 }
 for(const actor of DZ546.remotes){
  if([...allies.values()].includes(actor))continue;
  const state=DZ546.remote.get(actor);
  if(state){actor.remove(state.sprite);state.sprite.material.map.dispose();state.sprite.material.dispose()}
  DZ546.remote.delete(actor);DZ546.remotes.delete(actor);
 }
 window.__DZ546_STATUS={version:'5.25.26',skin:DZ43.skin,atlas:!!DZ546.atlas,
  selected,visible:!!(selected&&DZ546.local?.visible),
  action:selected?DZ546.local?.userData.dz545Action??-1:null,
  tile:selected?DZ546.local?.userData.dz545Tile??-1:null,
  ruboAction:DZ545.local?.userData.dz545Action??-1,
  remoteVisible:[...allies.values()].filter(a=>DZ546.remote.get(a)?.sprite.visible).length,
  shots:DZ546.verifiedShots,shotErrors:DZ546.shotErrors,lastShot:DZ546.lastShot};
}
const dz546OldMask=dz531EnsurePixelOnly;
dz531EnsurePixelOnly=function(){const r=dz546OldMask();dz546Tick();return r};
// The working core engine is dz544OldShoot. Call it first, without making
// firearm behaviour depend on pixel-art sprite effects or animation wrappers.
const dz546CoreShot=typeof dz544OldShoot==='function'?dz544OldShoot:shoot;
shoot=function(...args){
 let id,w,before;
 try{id=weaponId();w=weapon();before={mag:ammoFor(id)?.mag,cool:player.cool,bullets:bullets.length}}
 catch(e){DZ546.shotErrors++;console.warn('Shot preparation warning',e)}
 let result;
 try{result=dz546CoreShot(...args)}
 catch(error){DZ546.shotErrors++;console.error('Core shoot error',error);throw error}
 const after={mag:id!==undefined?ammoFor(id)?.mag:null,cool:player.cool,bullets:bullets.length};
 const fired=!!before&&(after.bullets>before.bullets||after.mag<before.mag||after.cool>before.cool+.001);
 DZ546.lastShot={fired,before,after,weapon:w?.name||'',at:gameTime};
 if(fired){
  DZ546.verifiedShots++;
  if(DZ43.skin===DZ545_ID)DZ545.shotUntil=gameTime+.26;
  if(DZ43.skin===DZ546_ID)DZ546.shotUntil=gameTime+.26;
  // A rendering failure must never prevent an actual bullet from leaving the gun.
  try{
   dz544VisualShot(player.x,player.z,player.angle,w?.name||'Pistola',false);
   dz544SendFx('shot',player.x,player.z,player.angle,w?.name||'Pistola');
  }catch(e){DZ546.shotErrors++;console.warn('Optional muzzle effect failed',e)}
 }
 return result;
};
const dz546OldMelee=dzMelee;
dzMelee=function(...args){
 const ret=dz546OldMelee(...args);
 if(DZ43.skin===DZ546_ID)DZ546.meleeUntil=gameTime+.43;return ret;
};
const dz546OldInteract=interact;
interact=function(...args){
 const ret=dz546OldInteract(...args);
 if(DZ43.skin===DZ546_ID)DZ546.useUntil=gameTime+.38;return ret;
};
const dz546OldHurt=hurt;
hurt=function(...args){
 const prev=player.ifr,ret=dz546OldHurt(...args);
 if(player.ifr>prev&&DZ43.skin===DZ546_ID)DZ546.hurtUntil=gameTime+.44;
 return ret;
};
const dz546OldConnect=dz544Connect;
dz544Connect=function(ws){
 dz546OldConnect(ws);
 if(!ws||ws.dz546ListenerInstalled)return;
 ws.dz546ListenerInstalled=true;
 ws.addEventListener('message',event=>{
  let msg;try{msg=JSON.parse(event.data)}catch{return}
  if(msg.type==='dz544Fx'&&msg.kind==='shot'&&msg.id!==coop.id)DZ546.remoteShots.set(msg.id,gameTime+.27);
  if(msg.type==='state'&&msg.id){
   const ally=allies.get(msg.id);
   if(ally)ally.userData.dz55Id=msg.id;
  }
 });
};
queueMicrotask(()=>{
 const panel=document.getElementById('dz43SkinsPanel');
 const card=[...(panel?.querySelectorAll('button')||[])].find(el=>el.querySelector('strong')?.textContent==='Hermano · Personaje propio');
 if(card){
  card.dataset.playableCharacter='hermano';
  const thumbnail=card.querySelector('div');
  if(thumbnail){
   thumbnail.style.cssText+=';width:64px;height:80px;margin:0 auto 9px;border-radius:4px;background-color:#17232a;background-image:url('+DZ546_ATLAS+');background-repeat:no-repeat;background-size:2400% 900%;background-position:0 0;image-rendering:pixelated';
  }
 }
});
queueMicrotask(dz546Load);
window.addEventListener('dz546-test-fire',()=>{
 if(!new URLSearchParams(location.search).has('smoke')||!playing||paused)return;
 player.cool=0;player.reload=0;
 const ammo=ammoFor(weaponId());if(ammo&&ammo.mag<=0)ammo.mag=weaponStats(weapon(),weaponId()).mag;
 shoot();
 window.__DZ546_TEST_SHOT=DZ546.lastShot;
});
