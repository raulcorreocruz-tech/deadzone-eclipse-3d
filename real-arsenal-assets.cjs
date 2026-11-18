'use strict';
// Build-time, license-controlled downloader: public immutable GLB CC0 pack + CC0 audio.
// Never fetches Sketchfab embed streams or bypasses authentication/download licenses.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=__dirname;
const library=require('./arsenal-49-source-map.json');
const output=path.join(root,'assets','arsenal');
const modelDir=path.join(output,'models');
const audioDir=path.join(output,'sfx');
const PACK='https://3dassets.dev/api/v1/packs/mega-weapon-pack';
const GUN_SHA='a19b7458a593598211c95ec46ef4eb4b6d1f94d7';
const KENNEY_SHA='9662dc1bed3b06ae753045915f9accfac044c7ce';
const GUN='https://raw.githubusercontent.com/petroulacl/fps-asset-kit/'+GUN_SHA+'/sfx/firearm_sfx/Prepared%20SFX%20Library/';
const KENNEY='https://raw.githubusercontent.com/GeorgeQLe/assets-sfx-combat/'+KENNEY_SHA+'/assets/kenney/';
const sources={
 pistol:[GUN+'1911/A_34P.wav','wav'],
 smg:[GUN+'PPSh/P_16P.wav','wav'],
 smg2:[GUN+'PPSh/P_22P.wav','wav'],
 rifle:[GUN+'AK-47/C_27P.wav','wav'],
 rifle2:[GUN+'AR-15/D_24P.wav','wav'],
 shotgun:[GUN+'Model%2012/K_17P.wav','wav'],
 shotgun2:[GUN+'Mossberg/N_26P.wav','wav'],
 lmg:[GUN+'AK-47/C_29P.wav','wav'],
 electric:[KENNEY+'sci-fi-sounds/Audio/laserLarge_000.ogg','ogg'],
 flame:[KENNEY+'sci-fi-sounds/Audio/thrusterFire_000.ogg','ogg'],
 ice:[KENNEY+'sci-fi-sounds/Audio/forceField_000.ogg','ogg'],
 gravity:[KENNEY+'sci-fi-sounds/Audio/lowFrequency_explosion_000.ogg','ogg'],
 special:[KENNEY+'sci-fi-sounds/Audio/laserSmall_000.ogg','ogg'],
 magic:[KENNEY+'sci-fi-sounds/Audio/laserRetro_000.ogg','ogg'],
 explosion:[KENNEY+'sci-fi-sounds/Audio/explosionCrunch_000.ogg','ogg'],
 laser:[KENNEY+'sci-fi-sounds/Audio/laserSmall_002.ogg','ogg'],
 melee:[KENNEY+'sci-fi-sounds/Audio/impactMetal_000.ogg','ogg'],
 blade:[KENNEY+'rpg-audio/Audio/knifeSlice.ogg','ogg'],
 saw:[KENNEY+'sci-fi-sounds/Audio/engineCircular_000.ogg','ogg'],
 reloadStart:[KENNEY+'rpg-audio/Audio/metalClick.ogg','ogg'],
 reloadEnd:[KENNEY+'rpg-audio/Audio/metalLatch.ogg','ogg'],
 equip:[KENNEY+'rpg-audio/Audio/drawKnife1.ogg','ogg']
};
function validGLB(b){return b.length>=4096&&b.toString('ascii',0,4)==='glTF'&&b.readUInt32LE(8)===b.length}
async function getBytes(url,limit){
 if(!/^https:\/\//.test(url))throw Error('Only HTTPS');
 const res=await fetch(url,{headers:{'User-Agent':'DeadZone-CC0-Asset-Builder/1.0'},signal:AbortSignal.timeout(45000)});
 if(!res.ok)throw Error('HTTP '+res.status+' '+url);
 const advertised=Number(res.headers.get('content-length')||0);
 if(advertised>limit)throw Error('Asset over size limit '+advertised);
 const b=Buffer.from(await res.arrayBuffer());
 if(b.length>limit)throw Error('Downloaded asset over size limit '+b.length);
 return b;
}
async function getWithRetry(url,limit){
 let err;
 for(let attempt=0;attempt<2;attempt++)try{return await getBytes(url,limit)}catch(e){err=e}
 throw err;
}
function slug(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function wavToClip(bytes){
 // CC0 firearm recordings are WAV. Extract one transitory hit and convert to a
 // short mono 22.05kHz PCM WAV, suitable for low-memory Android web audio.
 let fmt=null,data=null,off=12;
 if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE')throw Error('Expected RIFF WAVE');
 while(off+8<=bytes.length){
  const id=bytes.toString('ascii',off,off+4),size=bytes.readUInt32LE(off+4),start=off+8;
  if(start+size>bytes.length)break;
  if(id==='fmt '){fmt={type:bytes.readUInt16LE(start),channels:bytes.readUInt16LE(start+2),hz:bytes.readUInt32LE(start+4),bits:bytes.readUInt16LE(start+14)}}
  if(id==='data')data=bytes.subarray(start,start+size);
  off=start+size+(size&1);
 }
 if(!fmt||!data||![1,3].includes(fmt.type)||![8,16,24,32].includes(fmt.bits)||fmt.channels<1||fmt.channels>8||fmt.hz<8000)throw Error('Unsupported recorded WAV format');
 const sampleSize=fmt.bits/8,frameSize=sampleSize*fmt.channels,total=Math.floor(data.length/frameSize);
 if(total<fmt.hz*.08)throw Error('Recording too short');
 function v(frame,ch){
  const p=frame*frameSize+ch*sampleSize;
  if(fmt.type===3&&fmt.bits===32)return data.readFloatLE(p);
  if(fmt.bits===8)return (data.readUInt8(p)-128)/128;
  if(fmt.bits===16)return data.readInt16LE(p)/32768;
  if(fmt.bits===24)return data.readIntLE(p,3)/8388608;
  if(fmt.bits===32)return data.readInt32LE(p)/2147483648;
  return 0
 }
 // Find transient; work across the recording rather than assuming the shot is at t=0.
 const scanStep=Math.max(1,Math.floor(fmt.hz/250));let loud=0,loudAt=0,first=-1;
 for(let i=0;i<total;i+=scanStep){
  const a=Math.abs(v(i,0));
  if(a>loud){loud=a;loudAt=i}
  if(first<0&&a>.11)first=i;
 }
 if(loud<.008)throw Error('Recording unexpectedly quiet');
 const onset=first>=0?first:loudAt;
 const start=Math.max(0,onset-Math.floor(fmt.hz*.045));
 const outHz=22050,duration=1.05;
 const frames=Math.min(Math.floor(outHz*duration),Math.floor((total-start)*outHz/fmt.hz));
 if(frames<3000)throw Error('Not enough audio after transient');
 const samples=new Float32Array(frames);
 let peak=0;
 for(let i=0;i<frames;i++){
  const frame=Math.min(total-1,start+Math.floor(i*fmt.hz/outHz));
  let sum=0;for(let c=0;c<fmt.channels;c++)sum+=v(frame,c);
  let n=sum/fmt.channels;if(!Number.isFinite(n))n=0;
  samples[i]=n;peak=Math.max(peak,Math.abs(n));
 }
 const wav=Buffer.alloc(44+frames*2),gain=Math.min(6,.91/Math.max(.001,peak));
 wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);
 wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);
 wav.writeUInt32LE(outHz,24);wav.writeUInt32LE(outHz*2,28);wav.writeUInt16LE(2,32);
 wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(frames*2,40);
 for(let i=0;i<frames;i++){
  const fadeStart=Math.min(1,i/Math.max(1,outHz*.006));
  const end=Math.min(1,(frames-1-i)/Math.max(1,outHz*.10));
  const n=Math.max(-1,Math.min(1,samples[i]*gain*Math.max(0,fadeStart)*Math.max(0,end)));
  wav.writeInt16LE(Math.round(n*32760),44+i*2);
 }
 return wav;
}
async function pool(jobs,parallel=5){
 const result=new Array(jobs.length);let index=0;
 await Promise.all(Array.from({length:Math.min(parallel,jobs.length)},async()=>{
  while(index<jobs.length){const i=index++;try{result[i]=await jobs[i]()}catch(e){result[i]={error:String(e?.message||e)}}}
 }));
 return result;
}
async function build(){
 fs.mkdirSync(modelDir,{recursive:true});fs.mkdirSync(audioDir,{recursive:true});
 const manifest={version:2,pack:PACK,license:'CC0 1.0 Universal',attributionRequired:false,models:{},sounds:{},soundProfiles:Object.fromEntries(library.weapons.map(w=>[w.name,w.sound])),failures:[],generatedAt:new Date().toISOString()};
 const json=JSON.parse((await getWithRetry(PACK,16_000_000)).toString('utf8'));
 const pack=json.data;
 if(pack?.licenseLabel!=='CC0 1.0 Universal'||!Array.isArray(pack.assets))throw Error('CC0 pack manifest not validated');
 const byTitle=new Map(pack.assets.filter(a=>a.license?.slug==='cc0-1.0').map(a=>[a.title.replace(/\s*\(Mega Weapon Pack\)$/,'').toLowerCase(),a]));
 const targets=library.weapons.map(row=>{
  if(!row.model){manifest.models[row.name]=null;return null}
  const asset=byTitle.get(row.model.toLowerCase());
  if(!asset||!/^https:\/\/cdn\.3dassets\.dev\/assets\/\d+\/v\d+\/model\.glb$/.test(asset.cdnUrl)||asset.stats?.hasDraco||asset.stats?.hasMeshopt){
   manifest.models[row.name]=null;manifest.failures.push('Modelo no disponible en pack CC0: '+row.name+' ('+row.model+')');return null
  }
  return {name:row.name,model:row.model,asset};
 }).filter(Boolean);
 // One download per unique CC0 GLB. Keep each weapon's own mapping, load on demand in browser.
 const used=[...new Map(targets.map(t=>[t.asset.id,t.asset])).values()];
 const results=await pool(used.map(asset=>async()=>{
  const filename='model-'+asset.id+'.glb',p=path.join(modelDir,filename);
  if(!fs.existsSync(p)||!validGLB(fs.readFileSync(p))){
   const bytes=await getWithRetry(asset.cdnUrl,3_300_000);
   if(!validGLB(bytes))throw Error('GLB header/length invalid '+asset.id);
   fs.writeFileSync(p,bytes);
  }
  return {id:asset.id,filename,size:fs.statSync(p).size}
 }),5);
 const found=new Map();
 results.forEach((x,i)=>{if(x?.id)found.set(String(x.id),x);else manifest.failures.push('GLB '+used[i].title+': '+(x?.error||'unknown'))});
 for(const row of targets){
  const file=found.get(String(row.asset.id));
  manifest.models[row.name]=file?{
   path:'./assets/arsenal/models/'+file.filename,
   file:file.filename,
   title:row.asset.title,
   cdnUrl:row.asset.cdnUrl,
   source:row.asset.url,
   size:file.size,
   license:'CC0-1.0',
   exact:false
  }:null;
 }
 const keys=[...new Set(library.weapons.map(w=>w.sound)),'reloadStart','reloadEnd','equip'];
 const audioResult=await pool(keys.map(key=>async()=>{
  const source=sources[key];if(!source)return {error:'unknown profile '+key};
  const [url,ext]=source;
  const filename=key+(ext==='wav'?'.wav':'.ogg');
  const file=path.join(audioDir,filename);
  if(!fs.existsSync(file)||fs.statSync(file).size<1500){
   const body=await getWithRetry(url,22_000_000);
   const usable=ext==='wav'?wavToClip(body):body;
   if(usable.length<1500)throw Error('Audio invalid '+filename);
   if(ext==='ogg'&&usable.toString('ascii',0,4)!=='OggS')throw Error('OGG header invalid');
   fs.writeFileSync(file,usable);
  }
  return {key,path:'./assets/arsenal/sfx/'+filename,file:filename,source:url,size:fs.statSync(file).size,license:'CC0-1.0'};
 }),5);
 for(let i=0;i<keys.length;i++){
  const item=audioResult[i];if(item?.path)manifest.sounds[keys[i]]=item;else manifest.failures.push('Audio '+keys[i]+': '+(item?.error||'unknown'));
 }
 manifest.stats={
  intendedWeapons:library.weapons.length,
  mappedGLB:Object.values(manifest.models).filter(Boolean).length,
  uniqueGLB:found.size,
  realAudioSamples:Object.keys(manifest.sounds).length,
  errors:manifest.failures.length
 };
 fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log('ARSENAL CC0 ASSETS:',JSON.stringify(manifest.stats),'failures',manifest.failures.slice(0,8));
 if(manifest.stats.mappedGLB<30||manifest.stats.realAudioSamples<12)throw Error('Insufficient downloaded real assets: '+JSON.stringify(manifest.stats));
 return manifest;
}
module.exports=build;
