
// DEAD_ZONE_PATCH_545: user-photo character Rubo — 8 directions x 9 actions x 3 frames.
const DZ545_ID='rubo_personal';
const DZ545_ATLAS='/assets/rubo_playable_48c.png';
DZ43.skins.push({id:DZ545_ID,name:'Rubo · Personaje propio',description:'Tu rostro en pixel art · 8 direcciones y 9 animaciones',color:0x292d31,accent:0xb39c89,hat:'none'});
if(typeof DZ544!=='undefined')DZ544.skinIDs.add(DZ545_ID);
const DZ545={texture:null,loading:false,failed:false,local:null,remote:new WeakMap(),remotes:new Set(),
 shotUntil:0,meleeUntil:0,useUntil:0,hurtUntil:0,remoteShots:new Map(),errors:0};
function dz545Load(){
 if(DZ545.texture||DZ545.loading||DZ545.failed)return;
 DZ545.loading=true;
 new THREE.TextureLoader().load(DZ545_ATLAS,t=>{
  t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;
  t.generateMipmaps=false;t.needsUpdate=true;
  DZ545.texture=t;DZ545.loading=false;
 },undefined,e=>{DZ545.failed=true;DZ545.loading=false;DZ545.errors++;console.warn('Rubo sprite atlas unavailable',e)});
}
function dz545Sprite(root){
 if(!DZ545.texture||!root)return null;
 const t=DZ545.texture.clone();t.repeat.set(1/24,1/9);t.offset.set(0,8/9);
 t.wrapS=THREE.ClampToEdgeWrapping;t.wrapT=THREE.ClampToEdgeWrapping;
 t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;
 const mat=new THREE.SpriteMaterial({map:t,transparent:true,alphaTest:.05,depthWrite:false,depthTest:true,color:0xffffff});
 const sprite=new THREE.Sprite(mat);
 sprite.position.set(0,1.43,0);sprite.scale.set(1.95,2.85,1);sprite.renderOrder=5;
 sprite.userData.dz545Sprite=true;sprite.userData.dz545Action=-1;sprite.userData.dz545Tile=-1;
 root.add(sprite);return sprite;
}
function dz545Direction(angle){
 if(!Number.isFinite(angle))return 0;
 return ((-Math.round(angle/(Math.PI/4))%8)+8)%8;
}
function dz545Animate(sp,action,angle,stamp){
 if(!sp)return;
 action=Math.max(0,Math.min(8,action|0));
 if(sp.userData.dz545Action!==action){
  sp.userData.dz545Action=action;sp.userData.dz545Since=stamp;
 }
 const age=Math.max(0,stamp-sp.userData.dz545Since);
 const fps=action===1?8:action===2?11:action===3?14:action===4?8:action===5?12:action===6?8:action===7?8:action===8?5:3.5;
 const frame=action===8?Math.min(2,Math.floor(age*fps)):Math.floor(age*fps)%3;
 const col=dz545Direction(angle)*3+frame;
 const tile=action*24+col;
 if(sp.userData.dz545Tile!==tile){
  sp.userData.dz545Tile=tile;
  sp.material.map.offset.set(col/24,1-(action+1)/9);
 }
}
function dz545Remove(root,sp){
 if(!sp)return;
 root.remove(sp);sp.material.map?.dispose();sp.material.dispose();
}
function dz545Tick(){
 const selected=DZ43.skin===DZ545_ID;
 const remoteHas=[...allies.values()].some(a=>a.userData?.dz55Skin===DZ545_ID);
 if(selected||remoteHas)dz545Load();
 if(selected&&DZ545.texture&&!DZ545.local)DZ545.local=dz545Sprite(hero);
 if(DZ545.local){
  DZ545.local.visible=selected;
  if(selected){
   const action=player.dead||DZ55.downed?8:player.ifr>.25||gameTime<DZ545.hurtUntil?7:
    gameTime<DZ545.meleeUntil?5:gameTime<DZ545.useUntil?6:
    player.reload>0?4:gameTime<DZ545.shotUntil||touch.shoot||mouse.down?3:
    player.vel>4.5?2:player.vel>.12?1:0;
   dz545Animate(DZ545.local,action,player.angle,gameTime);
  }
 }
 for(const ally of allies.values()){
  const isRubo=ally.userData?.dz55Skin===DZ545_ID;
  let state=DZ545.remote.get(ally);
  if(isRubo&&DZ545.texture&&!state){
   const sprite=dz545Sprite(ally);
   if(sprite){state={sprite,lastX:ally.position.x,lastZ:ally.position.z,lastMove:-20};DZ545.remote.set(ally,state);DZ545.remotes.add(ally)}
  }
  if(!state)continue;
  state.sprite.visible=isRubo;
  if(isRubo){
   const x=ally.position.x,z=ally.position.z;
   if(Math.hypot(x-state.lastX,z-state.lastZ)>.01)state.lastMove=gameTime;
   state.lastX=x;state.lastZ=z;
   const lastShot=DZ545.remoteShots.get(ally.userData.dz55Id)||0;
   const action=ally.userData.dz55Downed?8:gameTime<lastShot?3:
    gameTime-state.lastMove<.22?1:0;
   dz545Animate(state.sprite,action,ally.rotation.y,gameTime);
  }
 }
 for(const old of DZ545.remotes){
  if(alliesHasActor(old))continue;
  const state=DZ545.remote.get(old);if(state)dz545Remove(old,state.sprite);
  DZ545.remotes.delete(old);DZ545.remote.delete(old);
 }
 window.__DZ545_STATUS={id:DZ545_ID,atlas:!!DZ545.texture,loading:DZ545.loading,failed:DZ545.failed,
  selected,localVisible:!!(selected&&DZ545.local?.visible),localAction:DZ545.local?.userData.dz545Action??-1,
  localFrame:DZ545.local?.userData.dz545Tile??-1,remoteVisible:[...allies.values()].filter(a=>DZ545.remote.get(a)?.sprite.visible).length};
}
function alliesHasActor(actor){for(const a of allies.values())if(a===actor)return true;return false}
const dz545PriorMask=dz531EnsurePixelOnly;
dz531EnsurePixelOnly=function(){dz545Tick();return dz545PriorMask()};
const dz545PriorShoot=shoot;
shoot=function(...args){
 const before=player.cool,mag=ammoFor(weaponId())?.mag;
 const result=dz545PriorShoot(...args);
 if(playing&&!paused&&DZ43.skin===DZ545_ID&&(player.cool>before+.001||ammoFor(weaponId())?.mag<mag))DZ545.shotUntil=gameTime+.24;
 return result;
};
const dz545PriorMelee=dzMelee;
dzMelee=function(...args){const result=dz545PriorMelee(...args);if(DZ43.skin===DZ545_ID)DZ545.meleeUntil=gameTime+.43;return result};
const dz545PriorInteract=interact;
interact=function(...args){const result=dz545PriorInteract(...args);if(DZ43.skin===DZ545_ID)DZ545.useUntil=gameTime+.38;return result};
const dz545PriorHurt=hurt;
hurt=function(...args){const before=player.ifr,r=dz545PriorHurt(...args);if(player.ifr>before&&DZ43.skin===DZ545_ID)DZ545.hurtUntil=gameTime+.44;return r};
const dz545PriorConnect=dz544Connect;
dz544Connect=function(ws){
 dz545PriorConnect(ws);
 if(!ws||ws.dz545ListenerInstalled)return;
 ws.dz545ListenerInstalled=true;
 ws.addEventListener('message',event=>{
  let m;try{m=JSON.parse(event.data)}catch{return}
  if(m.type==='dz544Fx'&&m.kind==='shot'&&m.id!==coop.id)DZ545.remoteShots.set(m.id,gameTime+.27);
  if(m.type==='state'&&m.id&&typeof m.skin==='string'&&m.skin===DZ545_ID){
   const actor=allies.get(m.id);if(actor)actor.userData.dz55Id=m.id;
  }
 });
};
queueMicrotask(()=>{
 const panel=document.getElementById('dz43SkinsPanel');
 const card=[...(panel?.querySelectorAll('button')||[])].find(el=>el.querySelector('strong')?.textContent==='Rubo · Personaje propio');
 if(card){
  const swatch=card.querySelector('div');
  if(swatch){
   swatch.style.cssText+=';width:64px;height:88px;margin:0 auto 9px;border-radius:4px;background-color:#17232a;background-image:url('+DZ545_ATLAS+');background-repeat:no-repeat;background-size:2400% 900%;background-position:0 0;image-rendering:pixelated';
  }
  card.setAttribute('data-playable-character','rubo');
 }
});
queueMicrotask(dz545Load);
