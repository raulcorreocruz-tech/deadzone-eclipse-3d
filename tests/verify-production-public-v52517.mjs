import assert from 'node:assert/strict';
const base='https://deadzone-eclipse-coop.onrender.com';
const get=async (path,method='GET')=>{
 const r=await fetch(base+path,{method,cache:'no-store',signal:AbortSignal.timeout(25000),headers:{'Cache-Control':'no-cache','User-Agent':'DeadZone-production-verifier/1.0'}});
 assert.equal(r.status,200,path+' HTTP '+r.status);
 return r;
};
const html=await (await get('/?verification=20261118-v52517')).text();
const match=html.match(/<meta\s+name="deadzone-build"\s+content="([^"]+)"/i);
assert(match,'Falta marca de compilación en la web');
assert.match(match[1],/^5\.25\.17-[a-f0-9]{12}$/,'Render sirve otra versión: '+match[1]);
for(const token of ['DEAD_ZONE_PATCH_536','DEAD_ZONE_PATCH_537','dz536-shot-mode','dz536-live-rooms','dz536HeliFire','dz536ZombieFrame']){
 assert(html.includes(token),'Falta módulo de v5.25.17: '+token);
}
const health=await (await get('/health')).json();
assert.equal(health.status,'ok','Health check unhealthy');
const {rooms,limit}=await (await get('/api/live-rooms')).json();
assert(Array.isArray(rooms)&&limit===4,'Live rooms endpoint missing');
const manifest=await (await get('/assets/arsenal/manifest.json')).json();
assert(manifest.stats?.mappedGLB>=40,'Arsenal GLB real incompleto');
assert(manifest.stats?.realAudioSamples>=20,'Muestras audio incompletas');
const model=await (await get('/assets/arsenal/models/model-33296.glb')).arrayBuffer();
assert.equal(Buffer.from(model).toString('ascii',0,4),'glTF','Modelo GLB no válido');
await get('/assets/arsenal/sfx/pistol.wav','HEAD');
const url=base.replace('https:','wss:')+'/ws';
await new Promise((resolve,reject)=>{
 const sock=new WebSocket(url);let ended=false;
 const timeout=setTimeout(()=>{if(!ended){ended=true;sock.close();reject(new Error('WebSocket handshake timeout'))}},12000);
 sock.addEventListener('open',()=>{if(ended)return;ended=true;clearTimeout(timeout);sock.close();resolve()},{once:true});
 sock.addEventListener('error',()=>{if(ended)return;ended=true;clearTimeout(timeout);reject(new Error('WebSocket handshake error'))},{once:true});
});
console.log('PRODUCTION HTTP VERIFIED',JSON.stringify({buildId:match[1],status:health.status,rooms:rooms.length,maxPlayers:limit,modelBytes:model.byteLength,glb:manifest.stats.mappedGLB,sfx:manifest.stats.realAudioSamples,websocket:'open',features:['3 modos disparo','helicoptero','salas en vivo','caminata zombie']}));
