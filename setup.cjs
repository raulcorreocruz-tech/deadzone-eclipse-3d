/* Dead Zone v4.4 build: download game assets and the multiplayer server. */
const fs=require('node:fs');
const path=require('node:path');
const AdmZip=require('adm-zip');
const crypto=require('node:crypto');
const hashBuffer=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const URL='https://822d30f2-065e-4c8c-b3f9-5523c88f93ca.sandbox.floot.app/_cdn/static/deadzone-v3.8-aim-physics-coop.zip';
(async()=>{
 const r=await fetch(URL,{signal:AbortSignal.timeout(120000)});
 if(!r.ok)throw Error('No se puede descargar el juego: HTTP '+r.status);
 const data=Buffer.from(await r.arrayBuffer());
 const BASE_ZIP_SHA256='6f27e9ba2a435239c5b7e2015a805dc9a64aee0f44b5b87a7a4a253a1192fc74';
 if(hashBuffer(data)!==BASE_ZIP_SHA256)throw Error('El ZIP base ha cambiado sin una revisión explícita. Se cancela la compilación para preservar estabilidad.');
 const zip=new AdmZip(data);
 const entries=zip.getEntries();
 const dest=process.cwd();
 if(!entries.some(e=>e.entryName==='index.html')||!entries.some(e=>e.entryName==='server.js'))throw Error('Paquete incompleto');
 for(const e of entries) {
   const n=e.entryName;
   const target=path.resolve(dest,n);
   if(!target.startsWith(dest+path.sep) && target!==dest)throw Error('Ruta ZIP no permitida: '+n);
 }
 // Preserve the GitHub project's release metadata. The base ZIP contains an older
 // package.json (3.0.0) that must never replace our 4.3.0 release manifest.
 const packagePath=path.join(dest,'package.json');
 const packageLockPath=path.join(dest,'package-lock.json');
 const releasePackage=fs.readFileSync(packagePath);
 const releaseLock=fs.existsSync(packageLockPath)?fs.readFileSync(packageLockPath):null;
 const releaseVersion=JSON.parse(releasePackage.toString('utf8')).version;
 zip.extractAllTo(dest,true);
 fs.writeFileSync(packagePath,releasePackage);
 if(releaseLock)fs.writeFileSync(packageLockPath,releaseLock);
 else if(fs.existsSync(packageLockPath))fs.unlinkSync(packageLockPath);
 if(require('./package.json').version!==releaseVersion)throw Error('El ZIP ha sobrescrito la versión del proyecto');
 console.log('DEAD ZONE: manifiesto del repositorio preservado; versión',releaseVersion);
 // Apply tested additive gameplay patch before Render publishes the new game.
 require('./gameplay-v39.cjs');
 require('./gameplay-v40.cjs');
 require('./gameplay-v41.cjs');
 require('./gameplay-v42.cjs');
 require('./gameplay-v43.cjs');
 require('./gameplay-v44.cjs');
 require('./gameplay-v45.cjs');
 require('./gameplay-v46.cjs');
 require('./gameplay-v47.cjs');
 require('./gameplay-v48.cjs');
 require('./gameplay-v49.cjs');
 require('./gameplay-v50.cjs');
 require('./gameplay-v51.cjs');
 // Verify browser module syntax before deployment, not only that the build task completed.
 const compiledHtml=fs.readFileSync(path.join(dest,'index.html'),'utf8');
 const scriptStart=compiledHtml.indexOf('<script type="module">');
 const scriptEnd=compiledHtml.indexOf('</script>',scriptStart);
 const moduleScripts=scriptStart>=0&&scriptEnd>scriptStart?[[null,compiledHtml.slice(scriptStart+'<script type="module">'.length,scriptEnd)]]:[];
 if(!moduleScripts.length)throw Error('No 3D module script found');
 const {spawnSync}=require('node:child_process');
 for(const [,source] of moduleScripts){
  const result=spawnSync(process.execPath,['--check','--input-type=module'],{input:source,encoding:'utf8'});
  if(result.status!==0)throw Error('3D game JavaScript syntax invalid: '+result.stderr);
 }
 console.log('DEAD ZONE v5.0: browser module JavaScript syntax check passed');
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


 const version=require('./package.json').version;
 const sourceFiles=['package.json','setup.cjs','gameplay-v39.cjs','gameplay-v40.cjs','gameplay-v41.cjs','gameplay-v42.cjs','gameplay-v43.cjs','gameplay-v44.cjs','gameplay-v45.cjs','gameplay-v46.cjs','gameplay-v47.cjs','gameplay-v48.cjs','gameplay-v49.cjs','gameplay-v50.cjs','gameplay-v51.cjs','custom-hud-v45.js','custom-hud-v45.css'];
 const sourceHash=crypto.createHash('sha256');
 for(const name of sourceFiles){sourceHash.update(name);sourceHash.update(fs.readFileSync(path.join(dest,name)))}
 const buildId=version+'-'+sourceHash.digest('hex').slice(0,12);
 const gameFile=path.join(dest,'index.html');
 const originalHtml=fs.readFileSync(gameFile,'utf8');
 if(originalHtml.split('</head>').length!==2)throw Error('No se puede insertar la versión: head inválido');
 fs.writeFileSync(gameFile,originalHtml.replace('</head>','<meta name="deadzone-build" content="'+buildId+'"></head>'));
 console.log('DEAD ZONE BUILD ID',buildId);
 const allAssets=fs.readdirSync(path.join(dest,'assets')).filter(x=>x.endsWith('.glb')).sort();
 const manifest={
  gameVersion:version,
  buildId,
  sourceZipUrl:URL,
  sourceZipSha256:hashBuffer(data),
  sourceArchiveBytes:data.length,
  generatedAt:new Date().toISOString(),
  mainHtmlSha256:hashBuffer(fs.readFileSync(path.join(dest,'index.html'))),
  serverSha256:hashBuffer(fs.readFileSync(path.join(dest,'server.js'))),
  assets:Object.fromEntries(allAssets.map(name=>[name,hashBuffer(fs.readFileSync(path.join(dest,'assets',name)))]))
 };
 const expectedAssetsSha256='fd6cfc1ebd7d735f50585bd48a36f422e15794f12c4795b7c6e5afa75868c3c0';
 const actualAssetsSha256=hashBuffer(Buffer.from(JSON.stringify(manifest.assets)));
 if(actualAssetsSha256!==expectedAssetsSha256)throw Error('Los modelos 3D han cambiado respecto a la versión auditada; compilación detenida para impedir regresiones');
 console.log('DEAD ZONE audit asset-set SHA256:',actualAssetsSha256);
 fs.writeFileSync(path.join(dest,'build-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log('DEAD ZONE audit source ZIP SHA256:',manifest.sourceZipSha256,'GLB files:',allAssets.length);
 if(!fs.existsSync(path.join(dest,'assets','zombie_realista.glb')))throw Error('Falta modelo GLB');
 console.log('DEAD ZONE: descargados',data.byteLength,'bytes y extraídos',entries.length,'archivos');
})().catch(err=>{console.error(err);process.exit(1)});
