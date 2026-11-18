'use strict';
const fs=require('node:fs'),path=require('node:path'),target=path.join(__dirname,'server.js');
let s=fs.readFileSync(target,'utf8');
if(s.includes('DEAD_ZONE_SERVER_539'))console.log('v539 cloud durability already patched');
else{
 const once=(a,b,label)=>{const n=s.split(a).length-1;if(n!==1)throw Error('v539 '+label+': expected 1 anchor, found '+n);s=s.replace(a,b)};
 once('dz523Fs.renameSync(tmp,dz523File);',"dz523Fs.renameSync(tmp,dz523File);if(globalThis.__deadZoneCloud)globalThis.__deadZoneCloud.stage('users',DZ523.users);",'persist account and friendships snapshot after atomic write');
 once('fs.renameSync(target,scorePath);',"fs.renameSync(target,scorePath);if(globalThis.__deadZoneCloud)globalThis.__deadZoneCloud.stage('scores',scores);",'persist match ledger snapshot after atomic write');
 once('dz523Respond(res,200,response);',"if(globalThis.__deadZoneCloud)globalThis.__deadZoneCloud.flush('users').then(()=>dz523Respond(res,200,response),err=>dz523Respond(res,503,{error:'La base de datos no ha confirmado el guardado. Reinténtalo.'}));else dz523Respond(res,200,response);",'do not confirm account/friend mutation until durable cloud write succeeded');
 const status='\n// DEAD_ZONE_SERVER_539 — production runs with loaded remote durable storage.\n';
 once('const server=http.createServer((req,res)=>{',status+"const server=http.createServer((req,res)=>{if(req.url?.split('?')[0]==='/api/storage-health'){const state=globalThis.__deadZoneCloud?.status()||{configured:false,ready:false,healthy:false};res.writeHead(state.healthy?200:503,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify(state));return;}",'production persistent-state status');
 fs.writeFileSync(target,s);console.log('DEAD ZONE 5.25.18 cloud accounts and all match results synchronized to secure Supabase database');
}
