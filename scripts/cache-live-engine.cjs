'use strict';
// Capture immutable, audited game assets. The original Floot ZIP is no longer available,
// so Render must never depend on an upstream download when starting a cold instance.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=path.join(__dirname,'..','snapshot');
const HOST='https://deadzone-eclipse-coop.onrender.com';
const REQUIRED=['/','/vendor/three/build/three.module.js',
 '/vendor/three/examples/jsm/loaders/GLTFLoader.js',
 '/vendor/three/examples/jsm/utils/BufferGeometryUtils.js',
 '/assets/deadzone_playables_6x4.png',
 '/assets/kimeramon_sprite_atlas.png',
 '/assets/peter_griffin_atlas.png',
 '/assets/rayquaza_boss_atlas.png',
 '/assets/war_elephant.png',
 '/assets/tropical_palm.png',
 '/assets/arsenal/manifest.json'];
const OPTIONAL=['/assets/zombie_realista.glb','/assets/survivor.glb','/assets/zombie.glb',
 '/assets/soldier.glb','/assets/doraemon_custom.glb','/assets/arsenal/models/model-33296.glb'];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function fetchReliable(relative,{optional=false}={}){
 let failure;
 for(let attempt=0;attempt<(optional?3:12);attempt++){
  try{
   const url=HOST+relative;
   const response=await fetch(url,{headers:{'user-agent':'DeadZoneEngineSnapshot/1.0','accept':'*/*'},signal:AbortSignal.timeout(45000)});
   if(!response.ok){
    if(optional&&[403,404].includes(response.status))return null;
    throw Error('HTTP '+response.status);
   }
   const data=Buffer.from(await response.arrayBuffer());
   if(!data.length)throw Error('Empty response');
   console.log('Fetched',relative,data.length,'bytes','attempt',attempt+1);
   return data;
  }catch(e){failure=e;console.warn('Retry',relative,attempt+1,e.message);await sleep(2500+attempt*1600)}
 }
 if(optional){console.warn('Skipping optional asset',relative,failure?.message);return null}
 throw Error('Required game snapshot failed '+relative+': '+failure?.message);
}
(async()=>{
 fs.mkdirSync(ROOT,{recursive:true});
 const manifest={createdAt:new Date().toISOString(),source:HOST,files:{}};
 const resources=[...REQUIRED,...OPTIONAL];
 for(const item of resources){
  const data=await fetchReliable(item,{optional:OPTIONAL.includes(item)});
  if(!data)continue;
  const file=path.join(ROOT,item==='/'?'index.html':item.slice(1));
  fs.mkdirSync(path.dirname(file),{recursive:true});
  if(item==='/'){
   const html=data.toString('utf8');
   if(html.length<400000||html.length>1500000||!html.includes('function dzGun(){')||!html.includes('DEAD_ZONE_PATCH_543'))throw Error('Remote build does not match audited 5.25.22 motor');
  }
  fs.writeFileSync(file,data);
  manifest.files[item]={sha256:crypto.createHash('sha256').update(data).digest('hex'),bytes:data.length};
 }
 fs.writeFileSync(path.join(ROOT,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log('REQUIRED SNAPSHOT SUCCEEDED',Object.keys(manifest.files).length,'assets');
})().catch(err=>{console.error(err);process.exit(1)});
