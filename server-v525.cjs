'use strict';
// DEAD_ZONE_SERVER_525: only allow first-party versioned Three.js modules.
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'server.js');let s=fs.readFileSync(file,'utf8');
if(s.includes('DEAD_ZONE_SERVER_525'))console.log('Dead Zone 5.25 Three.js static route already installed');
else{
 const anchor="const server=http.createServer((req,res)=>{if(dz523HandleHTTP(req,res))return;";
 const middleware="\n// DEAD_ZONE_SERVER_525 — the browser always imports Three.js from our HTTPS domain.\nconst dz525FS=require('node:fs'),dz525PATH=require('node:path');\nconst dz525VendorRoot=dz525PATH.resolve(__dirname,'vendor','three');\nfunction dz525ServeThree(req,res){\n let pathname;\n try{pathname=new URL(req.url,'https://game.example.invalid').pathname}catch{return false}\n if(!pathname.startsWith('/vendor/three/'))return false;\n if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return true}\n let decoded;\n try{decoded=decodeURIComponent(pathname)}catch{res.writeHead(400);res.end();return true}\n if(!/^\\/vendor\\/three\\/(?:build\\/three\\.module\\.js|examples\\/jsm\\/[a-zA-Z0-9_/-]+\\.js)$/.test(decoded)){res.writeHead(404);res.end();return true}\n const target=dz525PATH.resolve(__dirname,'.'+decoded);\n if(!target.startsWith(dz525VendorRoot+dz525PATH.sep)){res.writeHead(403);res.end();return true}\n dz525FS.stat(target,(error,stat)=>{\n  if(error||!stat.isFile()){res.writeHead(404);res.end();return}\n  res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'});\n  if(req.method==='HEAD')res.end();else dz525FS.createReadStream(target).pipe(res)\n });\n return true\n}\n";
 const n=s.split(anchor).length-1;
 if(n!==1)throw Error('v5.25 server route anchor count '+n);
 s=s.replace(anchor,middleware+'\n'+anchor.replace('if(dz523HandleHTTP(req,res))return;','if(dz523HandleHTTP(req,res))return;if(dz525ServeThree(req,res))return;'));
 fs.writeFileSync(file,s);console.log('DEAD ZONE 5.25: immutable first-party Three.js ESM routes and strict path confinement');
}
