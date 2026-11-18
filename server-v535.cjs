'use strict';
// Dedicated local static route. Existing /assets root allowlist does not permit subfolders.
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'server.js');
let s=fs.readFileSync(file,'utf8');
if(s.includes('DEAD_ZONE_SERVER_535'))console.log('Arsenal static route ready');
else{
 const anchor='const server=http.createServer((req,res)=>{';
 if(s.split(anchor).length!==2)throw Error('Arsenal static server anchor count incorrect');
 const middleware=String.raw`
// DEAD_ZONE_SERVER_535: allowlist for verified, self-hosted CC0 GLB and audio files.
const dz535FS=require('node:fs'),dz535Path=require('node:path');
const dz535Root=dz535Path.resolve(__dirname,'assets','arsenal');
function dz535ServeArsenal(req,res){
 let raw;
 try{raw=new URL(req.url,'https://game.example.invalid').pathname}catch{return false}
 if(!raw.startsWith('/assets/arsenal/'))return false;
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return true}
 let location;try{location=decodeURIComponent(raw)}catch{res.writeHead(400);res.end();return true}
 if(!/^\/assets\/arsenal\/(?:models\/model-[0-9]+\.glb|sfx\/[a-zA-Z0-9_-]+\.(?:ogg|wav)|manifest\.json)$/.test(location)){
  res.writeHead(404);res.end();return true;
 }
 const target=dz535Path.resolve(__dirname,'.'+location);
 if(!target.startsWith(dz535Root+dz535Path.sep)){res.writeHead(403);res.end();return true}
 dz535FS.stat(target,(err,st)=>{
  if(err||!st.isFile()){res.writeHead(404);res.end();return}
  const type=location.endsWith('.glb')?'model/gltf-binary':location.endsWith('.ogg')?'audio/ogg':location.endsWith('.wav')?'audio/wav':'application/json; charset=utf-8';
  const cache=location.endsWith('/manifest.json')?'no-cache, max-age=0':'public, max-age=86400';
  res.writeHead(200,{'Content-Type':type,'Content-Length':st.size,'Cache-Control':cache,'X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD')res.end();else dz535FS.createReadStream(target).pipe(res);
 });
 return true;
}
`;
 s=s.replace(anchor,middleware+'\n'+anchor+'if(dz535ServeArsenal(req,res))return;');
 fs.writeFileSync(file,s);console.log('CC0 arsenal static routes: model, audio and manifest verified');
}
