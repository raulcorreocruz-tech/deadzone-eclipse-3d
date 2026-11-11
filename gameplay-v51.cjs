'use strict';
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'index.html');
let html=fs.readFileSync(file,'utf8');
if(html.includes('DEAD_ZONE_PATCH_51')){console.log('v5.1 cache hygiene already installed')}else{
const original='<script>if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"}).then(reg=>{reg.update().catch(()=>{});}).catch(()=>{}));}</script>';
// The packaged game and GitHub source use different worker registration markup.
// Missing legacy markup is a supported case, never a build failure.
const replacement='<script id="dz51-cache-repair">/* DEAD_ZONE_PATCH_51 */if("serviceWorker" in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.getRegistrations().then(regs=>Promise.all(regs.filter(r=>{try{return new URL(r.scope).origin===location.origin}catch{return false}}).map(r=>r.unregister()))).catch(()=>{});if(window.caches)caches.keys().then(names=>Promise.all(names.filter(n=>/deadzone|eclipse|zombie/i.test(n)).map(n=>caches.delete(n)))).catch(()=>{});});}</script>';
if(html.includes(original))html=html.replace(original,replacement);
else html=html.replace('</body>',replacement+'</body>');
fs.writeFileSync(file,html);console.log('DEAD ZONE v5.1 stale PWA cache unregistered; no missing sw.js requests');
}
