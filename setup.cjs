/* Dead Zone v3.9 build: download game assets and the multiplayer server. */
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
 if(!fs.existsSync(path.join(dest,'assets','zombie_realista.glb')))throw Error('Falta modelo GLB');
 console.log('DEAD ZONE: descargados',data.byteLength,'bytes y extraídos',entries.length,'archivos');
})().catch(err=>{console.error(err);process.exit(1)});
