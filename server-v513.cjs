'use strict';
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'server.js');
let s=fs.readFileSync(file,'utf8');
if(!s.includes('DEAD_ZONE_SERVER_513')){
 const a="assets\\/[a-zA-Z0-9_.-]+\\.glb|assets\\/pbr";
 const b="assets\\/[a-zA-Z0-9_.-]+\\.(?:glb|png)|assets\\/pbr";
 const n=s.split(a).length-1;
 if(n!==1)throw Error('v5.13 PNG route expected once; got '+n);
 s=s.replace(a,b);
 s=s.replace("const server=http.createServer((req,res)=>{","// DEAD_ZONE_SERVER_513: expose the user-uploaded 2D Kimeramon PNG while preserving the static allowlist.\nconst server=http.createServer((req,res)=>{");
 fs.writeFileSync(file,s);
 console.log('DEAD ZONE v5.13: static server now serves user sprite assets/*.png with image/png MIME');
}
