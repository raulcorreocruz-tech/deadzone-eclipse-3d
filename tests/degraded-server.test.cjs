'use strict';
const assert=require('node:assert/strict');
const {once}=require('node:events');
const {startDegradedServer}=require('../degraded-server.cjs');
(async()=>{
 const server=startDegradedServer(0);
 await once(server,'listening');
 const url='http://127.0.0.1:'+server.address().port;
 try{
  const health=await fetch(url+'/health');assert.equal(health.status,200);assert.equal((await health.json()).mode,'solo_degradado');
  const storage=await fetch(url+'/api/storage-health');assert.equal(storage.status,503);assert.equal((await storage.json()).ready,false);
  for(const [route,method] of [['/api/account/login','POST'],['/api/leaderboard','GET'],['/api/social/login','POST']]){
   const res=await fetch(url+route,{method});assert.equal(res.status,503,'Database mutation/API must fail closed: '+route);
  }
  const main=await fetch(url+'/');assert.equal(main.status,200);assert.match(main.headers.get('content-type'),/text\/html/);assert.match(await main.text(),/DEAD ZONE/);
  const indexHead=await fetch(url+'/index.html',{method:'HEAD'});assert.equal(indexHead.status,200);
  const assets=await fetch(url+'/assets/deadzone_playables_6x4.png');assert.equal(assets.status,200);assert.match(assets.headers.get('content-type'),/image\/png/);
  for(const route of ['/cloud-start.cjs','/setup.cjs','/.env','/cloud-store.cjs','/assets/../../cloud-store.cjs','/api/../../cloud-store.cjs']){
   const res=await fetch(url+route);assert.ok(res.status>=400,'No source or secrets should be served: '+route);
  }
  console.log('DEAD ZONE RECOVERY MODE TESTS PASSED: solo static, API 503, secrets inaccessible');
 }finally{
  await new Promise(resolve=>{server.close(resolve);server.closeAllConnections()});
 }
})().catch(err=>{console.error(err);process.exitCode=1});
