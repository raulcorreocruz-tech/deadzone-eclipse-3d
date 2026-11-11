/* Dead Zone v4.3 build: download game assets and the multiplayer server. */
const fs=require('node:fs');
const path=require('node:path');
const AdmZip=require('adm-zip');
const URL='https://822d30f2-065e-4c8c-b3f9-5523c88f93ca.sandbox.floot.app/_cdn/static/deadzone-v3.8-aim-physics-coop.zip';
(async()=>{
 const r=await fetch(URL,{signal:AbortSignal.timeout(120000)});
 if(!r.ok)throw Error('No se puede descargar el juego: HTTP '+r.status);
 const data=Buffer.from(await r.arrayBuffer());
 const zip=new AdmZip(data);
 const entries=zip.getEntries();
 const dest=process.cwd();
 if(!entries.some(e=>e.entryName==='index.html')||!entries.some(e=>e.entryName==='server.js'))throw Error('Paquete incompleto');
 for(const e of entries) {
   const n=e.entryName;
   const target=path.resolve(dest,n);
   if(!target.startsWith(dest+path.sep) && target!==dest)throw Error('Ruta ZIP no permitida: '+n);
 }
 zip.extractAllTo(dest,true);
 // Apply tested additive gameplay patch before Render publishes the new game.
 require('./gameplay-v39.cjs');
 require('./gameplay-v40.cjs');
 require('./gameplay-v41.cjs');
 require('./gameplay-v42.cjs');
 require('./gameplay-v43.cjs');
 // Legally redistributable CC0 weapon models from petroulacl/fps-asset-kit,
 // based on OpenGameArt Flat Guns West by PCL. Downloaded at build time and
 // hosted locally, so the game never depends on hotlinking external models.
 const remote='https://raw.githubusercontent.com/petroulacl/fps-asset-kit/main/weapons/flat_guns_west/Flat%20Guns%20West/GLB/';
 const paths={
  pistol_compact:'Pistol_Compact_West',pistol_full:'Pistol_Full_West',
  smg_compact:'SMG_Compact_West',smg_full:'SMG_Full_West',
  assault_rifle:'Rifle_Assault_West',battle_rifle:'Rifle_Battle_West',
  shotgun_pump:'Shotgun_Pump_West',shotgun_auto:'Shotgun_Auto_West',
  sniper:'Sniper_Rifle_West',
  pistol_compact_east:'Pistol_Compact_East',pistol_full_east:'Pistol_Full_East',
  smg_compact_east:'SMG_Compact_East',smg_full_east:'SMG_Full_East',
  assault_rifle_east:'Rifle_Assault_East',battle_rifle_east:'Rifle_Battle_East',
  shotgun_pump_east:'Shotgun_Pump_East',shotgun_auto_east:'Shotgun_Auto_East',
  sniper_east:'Sniper_Rifle_East',
 };
 fs.mkdirSync(path.join(dest,'assets'),{recursive:true});
 let loaded=0;
 await Promise.all(Object.entries(paths).map(async([file,name])=>{
  const out=path.join(dest,'assets',file+'.glb');
  try{
   const url=file.endsWith('_east')?('https://raw.githubusercontent.com/petroulacl/fps-asset-kit/main/weapons/flat_guns_east/Flat%20Guns%20East/GLB/'+name+'.glb'):(remote+name+'.glb');
   const response=await fetch(url,{signal:AbortSignal.timeout(35000)});
   if(!response.ok)throw Error('HTTP '+response.status);
   const bin=Buffer.from(await response.arrayBuffer());
   if(bin.length<1000||bin.toString('utf8',0,4)!=='glTF')throw Error('GLB header invalid');
   fs.writeFileSync(out,bin);loaded++;
  }catch(err){console.warn('Model '+file+' unavailable (procedural fallback): '+err.message)}
 }));
 if(loaded<16)throw Error('Insufficient CC0 GLB weapons: '+loaded+'/18');
 console.log('DEAD ZONE v4.1: '+loaded+'/18 external weapon GLB models validated');
 // CC0 licensed melee models via Kenney collections redistributed in Hidencod/tge-assets.
 const meleeAssets={
  melee_sword:'packs/prototype-kit/weapon-sword.glb',
  melee_knife:'packs/food-kit/cooking-knife.glb',
  melee_blade:'packs/mini-dungeon/weapon-sword.glb'
 };
 let meleeLoaded=0;
 await Promise.all(Object.entries(meleeAssets).map(async([key,p])=>{
  try{
   const response=await fetch('https://raw.githubusercontent.com/Hidencod/tge-assets/main/'+p,{signal:AbortSignal.timeout(30000)});
   if(!response.ok)throw Error('HTTP '+response.status);
   const bytes=Buffer.from(await response.arrayBuffer());
   if(bytes.length<1000||bytes.toString('utf8',0,4)!=='glTF')throw Error('Invalid GLB');
   fs.writeFileSync(path.join(dest,'assets',key+'.glb'),bytes);meleeLoaded++;
  }catch(err){console.warn('Optional melee asset '+key+': '+err.message)}
 }));
 if(meleeLoaded<2)throw Error('Not enough CC0 melee models');
 console.log('DEAD ZONE v4.1: '+meleeLoaded+'/3 melee models verified');
 
// CC0 animated creature GLBs with separate rigged Idle, Walk, Run, Attack, Hit, Death clips.
// Verified public manifest: https://gobkit.com/api/free (human011 / human004).
const rigged={
 zombie_mummy:'https://gobkit.com/freebies/human011/TombMummy.glb',
 zombie_brute:'https://gobkit.com/freebies/human011/StitchedBrute.glb',
 zombie_witch:'https://gobkit.com/freebies/human011/NightWitch.glb',
 zombie_scarecrow:'https://gobkit.com/freebies/human011/PumpkinScarecrow.glb',
 zombie_werewolf:'https://gobkit.com/freebies/human011/WerewolfCaptain.glb',
 survivor_soldier:'https://gobkit.com/freebies/human004/Rifleman.glb',
 dog_kenney:'https://raw.githubusercontent.com/Hidencod/tge-assets/main/packs/prototype-kit/animal-dog.glb',
 car_kenney:'https://raw.githubusercontent.com/Hidencod/tge-assets/main/packs/prototype-kit/vehicle.glb'
};
let riggedLoaded=0;
await Promise.all(Object.entries(rigged).map(async([key,url])=>{
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw Error('HTTP '+response.status);
  const b=Buffer.from(await response.arrayBuffer());
  if(b.length<2048||b.toString('utf8',0,4)!=='glTF')throw Error('not a valid binary glTF');
  fs.writeFileSync(path.join(dest,'assets',key+'.glb'),b);
  riggedLoaded++;
 }catch(err){console.warn('Optional animated/prop model '+key+': '+err.message)}
}));
if(riggedLoaded<5)throw Error('Insufficient CC0 animated zombie/prop models: '+riggedLoaded+'/8');
console.log('DEAD ZONE v4.2: '+riggedLoaded+'/8 animated monsters and props verified');


 if(!fs.existsSync(path.join(dest,'assets','zombie_realista.glb')))throw Error('Falta modelo GLB');
 console.log('DEAD ZONE: descargados',data.byteLength,'bytes y extraídos',entries.length,'archivos');
})().catch(err=>{console.error(err);process.exit(1)});
