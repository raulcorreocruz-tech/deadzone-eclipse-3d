/* Dead Zone v4.0 build: download game assets and the multiplayer server. */
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
 // Legally redistributable CC0 weapon models from petroulacl/fps-asset-kit,
 // based on OpenGameArt Flat Guns West by PCL. Downloaded at build time and
 // hosted locally, so the game never depends on hotlinking external models.
 const remote='https://raw.githubusercontent.com/petroulacl/fps-asset-kit/main/weapons/flat_guns_west/Flat%20Guns%20West/GLB/';
 const paths={
  pistol_compact:'Pistol_Compact_West',pistol_full:'Pistol_Full_West',
  smg_compact:'SMG_Compact_West',smg_full:'SMG_Full_West',
  assault_rifle:'Rifle_Assault_West',battle_rifle:'Rifle_Battle_West',
  shotgun_pump:'Shotgun_Pump_West',shotgun_auto:'Shotgun_Auto_West',
  sniper:'Sniper_Rifle_West'
 };
 fs.mkdirSync(path.join(dest,'assets'),{recursive:true});
 let loaded=0;
 await Promise.all(Object.entries(paths).map(async([file,name])=>{
  const out=path.join(dest,'assets',file+'.glb');
  try{
   const response=await fetch(remote+name+'.glb',{signal:AbortSignal.timeout(35000)});
   if(!response.ok)throw Error('HTTP '+response.status);
   const bin=Buffer.from(await response.arrayBuffer());
   if(bin.length<1000||bin.toString('utf8',0,4)!=='glTF')throw Error('GLB header invalid');
   fs.writeFileSync(out,bin);loaded++;
  }catch(err){console.warn('Model '+file+' unavailable (procedural fallback): '+err.message)}
 }));
 if(loaded<5)throw Error('Insufficient CC0 GLB weapons: '+loaded+'/9');
 console.log('DEAD ZONE v4: '+loaded+'/9 external weapon GLB models validated');

 if(!fs.existsSync(path.join(dest,'assets','zombie_realista.glb')))throw Error('Falta modelo GLB');
 console.log('DEAD ZONE: descargados',data.byteLength,'bytes y extraídos',entries.length,'archivos');
})().catch(err=>{console.error(err);process.exit(1)});
