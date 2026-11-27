'use strict';
// SAFE RECOVERY MODE: Serve the offline-capable solo client only when Supabase
// cannot be reached. NEVER load server.js or accept writes in this state.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname);
const MIME={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',json:'application/json; charset=utf-8',webmanifest:'application/manifest+json',css:'text/css; charset=utf-8',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',svg:'image/svg+xml',ico:'image/x-icon',glb:'model/gltf-binary',gltf:'model/gltf+json',bin:'application/octet-stream',ogg:'audio/ogg',mp3:'audio/mpeg',wav:'audio/wav',woff2:'font/woff2'};
const EXACT=new Set(['/index.html','/sw.js','/manifest.webmanifest','/manifest.json','/release-notes.json','/favicon.ico','/favicon.png','/robots.txt']);
function json(res,status,body,head){
  const payload=JSON.stringify(body);
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':Buffer.byteLength(payload),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(head?'':payload);
}
function startDegradedServer(port=process.env.PORT||10000){
 const server=http.createServer((req,res)=>{
  let url;
  try{url=new URL(req.url,'http://localhost')}catch{json(res,400,{error:'Solicitud incorrecta'});return}
  const pathname=url.pathname;
  const head=req.method==='HEAD';
  if(pathname==='/health'){json(res,200,{ok:true,mode:'solo_degradado',storage:'unavailable'},head);return}
  if(pathname==='/api/storage-health'){json(res,503,{configured:true,ready:false,healthy:false,message:'Persistencia no disponible'},head);return}
  if(pathname==='/api'||pathname.startsWith('/api/')){json(res,503,{error:'Servicios de cuenta y red temporalmente no disponibles. Modo individual solamente.'},head);return}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD','Cache-Control':'no-store'});res.end();return}
  const publicPath=pathname==='/'?'/index.html':pathname;
  const nested=/^\/(?:assets|vendor)\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*\.(?:js|json|css|png|jpg|jpeg|webp|gif|svg|ico|glb|gltf|bin|ogg|mp3|wav|woff2)$/i.test(publicPath);
  if(!EXACT.has(publicPath)&&!nested){res.writeHead(404,{'Cache-Control':'no-store'});res.end();return}
  const target=path.resolve(ROOT,'.'+publicPath);
  if(!target.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return}
  fs.stat(target,(err,st)=>{
   if(err||!st.isFile()){res.writeHead(404,{'Cache-Control':'no-store'});res.end();return}
   const ext=path.extname(target).slice(1).toLowerCase();
   const headers={'Content-Type':MIME[ext]||'application/octet-stream','Content-Length':st.size,
    'X-Content-Type-Options':'nosniff','Cache-Control':publicPath==='/index.html'||publicPath==='/sw.js'?'no-cache, no-store':'public, max-age=60'};
   res.writeHead(200,headers);
   if(head)res.end();else fs.createReadStream(target).pipe(res);
  });
 });
 server.on('upgrade',(_,socket)=>socket.destroy()); // no multiplayer without persistence
 server.listen(Number(port),'0.0.0.0',()=>console.warn('DEAD ZONE: modo individual de recuperación activo; cuentas y cooperativo bloqueados hasta restaurar Supabase'));
 return server;
}
module.exports={startDegradedServer};
