'use strict';
const fs=require('node:fs');
const file='index.html',html=fs.readFileSync(file,'utf8'),needle='function dzGun(){';
if(html.split(needle).length!==2)throw Error('Game runtime injection anchor missing');
const script=String.raw`
window.__DZ536_QA={
 openSettings(){dz524OpenGraphics()},
 empty(){
  for(const z of [...zombies]){retireActor(z.figure);scene.remove(z.figure);removeObject(zombies,z)}
  spawnCount=0;between=999;player.heli=0;player.cool=0;player.reload=0;
  touch.aim.x=touch.aim.y=0;return {count:zombies.length,mode:DZ536.mode}
 },
 prepare(){
  this.empty();
  for(const distance of [3,4,5,6])for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]){
   const x=player.x+Math.sin(angle)*distance,z=player.z+Math.cos(angle)*distance;
   if(blocked(x,z,.5))continue;
   let ok=true;for(let i=1;i<distance;i++)if(blocked(player.x+Math.sin(angle)*i,player.z+Math.cos(angle)*i,.12))ok=false;
   if(!ok)continue;
   const enemy=spawnZombie('normal',x,z);enemy.hp=999999;enemy.maxHp=999999;enemy.t.damage=0;
   return {angle,enemy:enemy.netId||enemy.kind,x,z}
  }
  throw Error('Cannot place reachable enemy near player');
 },
 testLineNoTarget(){
  dz536SetMode('line');
  for(const z of [...zombies]){retireActor(z.figure);scene.remove(z.figure);removeObject(zombies,z)}
  player.cool=0;player.reload=0;touch.aim.set?.(0,1);
  touch.aim.x=0;touch.aim.y=1;
  DZ536.shots=0;dz536FireTick();return DZ536.shots;
 },
 testLineWithTarget(){
  const target=this.prepare();dz536SetMode('line');
  touch.aim.x=Math.sin(target.angle);touch.aim.y=Math.cos(target.angle);
  player.cool=0;player.reload=0;DZ536.shots=0;dz536FireTick();
  return {shots:DZ536.shots,hasTarget:!!DZ536.lastTarget,angle:target.angle}
 },
 testAuto(){
  this.prepare();dz536SetMode('auto');DZ536.shots=0;player.cool=0;player.reload=0;
  touch.aim.x=0;touch.aim.y=0;dz536FireTick();
  return {shots:DZ536.shots,hasTarget:!!DZ536.lastTarget}
 },
 walk(){
  this.prepare();const e=zombies[0];const x=e.x,z=e.z;
  e.x=x+.17;e.z=z+.11;DZ536.lastRender=gameTime-.04;dz536ZombieFrame();
  return {walking:DZ536.zombieWalk,animated:DZ536.animatedWalk}
 },
 heli(){
  this.prepare();dz536SetMode('manual');
  player.cool=500;player.heli=1.25;DZ536.heliNext=0;DZ536.heliBursts=0;
  return {started:player.heli>0}
 }
};
`;
fs.writeFileSync(file,html.replace(needle,script+'\n'+needle));
