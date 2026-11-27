'use strict';
const path=require('node:path'),os=require('node:os'),{DeadZoneCloud}=require('./cloud-store.cjs');
(async()=>{
 const vars=['DZ_SUPABASE_URL','DZ_SUPABASE_ANON_KEY','DZ_SUPABASE_PERSIST_SECRET'];
 const specified=vars.some(name=>!!process.env[name]);
 if(specified){
  if(!vars.every(name=>!!process.env[name]))throw Error('Supabase persistence partly configured: refusing volatile fallback');
  const dir=process.env.DZ_DATA_DIR||path.join(os.tmpdir(),'deadzone-cloud-persistent');
  process.env.DZ_DATA_DIR=dir;
  const cloud=new DeadZoneCloud({url:process.env.DZ_SUPABASE_URL,key:process.env.DZ_SUPABASE_ANON_KEY,secret:process.env.DZ_SUPABASE_PERSIST_SECRET,dir});
  // Keep the playable web client accessible if the remote durable DB is paused.
  // Never start the account/multiplayer server without confirmed Supabase data.
  let dzRecoveryServer=null;
  let state;
  while(true){
   try{state=await cloud.initialize();break}
   catch(err){
    console.error('DEAD ZONE remote persistence unavailable:',err.message,'— retrying without accepting account writes');
    if(!dzRecoveryServer)dzRecoveryServer=require('./degraded-server.cjs').startDegradedServer();
    await new Promise(resolve=>setTimeout(resolve,20000));
   }
  }
  globalThis.__deadZoneCloud=cloud;
  // Best-effort migration of publicly visible legacy top scores on first ever DB boot.
  // The old private user-password database cannot be exported via its public API.
  if(state.scores.data.length===0&&process.env.DZ_LEGACY_SCORES_IMPORT==='1'){
   try{
    const res=await fetch('https://deadzone-eclipse-coop.onrender.com/api/leaderboard',{signal:AbortSignal.timeout(5500)});
    if(res.ok){
     const data=await res.json();
     const scores=(data.scores||[]).filter(x=>typeof x.name==='string'&&Number.isInteger(x.round)&&Number.isInteger(x.points)).slice(0,20).map(x=>({id:require('node:crypto').randomUUID(),name:x.name.slice(0,18),round:x.round,points:x.points,date:x.date||new Date().toISOString(),mode:x.mode||'individual',source:'legacy-ranking-import'}));
     if(scores.length){
      cloud.stage('scores',scores);await cloud.flush('scores');
      require('node:fs').writeFileSync(path.join(dir,'leaderboard.json'),JSON.stringify(scores));
      console.log('Migrated legacy public top scores:',scores.length);
     }
    }
   }catch(err){console.warn('Legacy top-score import unavailable:',err.message)}
  }
  console.log('Dead Zone Supabase persistence READY',JSON.stringify({url:new URL(cloud.url).host,users:state.users.data.length,scores:state.scores.data.length,revisions:cloud.revisions}));
 }else if(process.env.NODE_ENV==='production')throw Error('Production requires durable Supabase persistence; refusing ephemeral account storage');
 else console.log('Development fallback: local volatile files; no Supabase configured');
 if(dzRecoveryServer){
  await new Promise(resolve=>{
   dzRecoveryServer.close(resolve);
   dzRecoveryServer.closeAllConnections();
  });
  console.log('DEAD ZONE durable cloud recovered; starting full accounts and multiplayer server');
 }
 require('./server.js');
})().catch(err=>{console.error('DEAD ZONE STORAGE START FAILED:',err.message);process.exitCode=1});
