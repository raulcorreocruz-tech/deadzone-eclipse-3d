'use strict';
const fs=require('node:fs'),path=require('node:path');
const index=path.join(__dirname,'index.html');let html=fs.readFileSync(index,'utf8');
if(!html.includes('DEAD_ZONE_PATCH_49')){
 if(!html.includes('id="dz45-runtime"'))throw Error('v4.9 custom HUD runtime not embedded');
 html=html.replace('</head>','<meta name="deadzone-mobile-hud" content="4.9" /><!-- DEAD_ZONE_PATCH_49 --></head>');
 fs.writeFileSync(index,html);
}
fs.writeFileSync(path.join(__dirname,'sw.js'),"/* Dead Zone v4.9: network-first HTML to prevent obsolete HUD/skins in Android WebView. */\nconst CACHE='deadzone-network-first-v49';\nself.addEventListener('install',()=>self.skipWaiting());\nself.addEventListener('activate',event=>event.waitUntil((async()=>{\n const names=await caches.keys();\n await Promise.all(names.filter(name=>name!==CACHE).map(name=>caches.delete(name)));\n await self.clients.claim();\n})()));\nself.addEventListener('fetch',event=>{\n const request=event.request;\n if(request.mode!=='navigate'||request.method!=='GET')return;\n event.respondWith((async()=>{\n  try{\n   const fresh=await fetch(request,{cache:'no-store'});\n   if(fresh.ok){const cache=await caches.open(CACHE);cache.put(request,fresh.clone()).catch(()=>{})}\n   return fresh;\n  }catch{const cached=await caches.match(request);return cached||Response.error()}\n })());\n});");
console.log('DEAD ZONE v4.9 network-first service worker: older cached HUD versions invalidated');