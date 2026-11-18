import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{DeadZoneCloud}=require('../cloud-store.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dzcloud-qa-')),remote={
 users:{revision:0,data:[]},scores:{revision:0,data:[]}
};
const prev=global.fetch,secret='a'.repeat(50),key='test-anon-key';let apiCalls=0;
global.fetch=async(url,options)=>{
 assert(url.startsWith('https://dummy.supabase.co/rest/v1/rpc/'));
 assert.equal(options.headers.apikey,key);
 const body=JSON.parse(options.body);
 assert.equal(body.p_secret,secret);
 apiCalls++;
 if(url.endsWith('/deadzone_cloud_read'))return new Response(JSON.stringify(remote),{status:200});
 if(url.endsWith('/deadzone_cloud_write')){
  const rec=remote[body.p_scope];if(body.p_revision!==rec.revision)return new Response(JSON.stringify({message:'conflict'}),{status:409});
  rec.revision++;rec.data=structuredClone(body.p_data);
  return new Response(JSON.stringify(rec.revision),{status:200});
 }
 return new Response('missing',{status:404});
};
try{
 const cloud=new DeadZoneCloud({url:'https://dummy.supabase.co',key,secret,dir});
 await cloud.initialize();
 assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'deadzone-social.json'),'utf8')).users.length,0);
 cloud.stage('users',[{username:'alpha',friends:['beta'],passHash:'hash-not-password',sessions:[]}]);
 cloud.stage('scores',[{name:'alpha',round:9,points:3150,mode:'solo'}]);
 await cloud.drain();
 assert.equal(remote.users.revision,1);assert.equal(remote.scores.revision,1);
 const restored=new DeadZoneCloud({url:'https://dummy.supabase.co',key,secret,dir});
 await restored.initialize();
 assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'deadzone-social.json'),'utf8')).users[0].friends[0],'beta');
 assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'leaderboard.json'),'utf8'))[0].round,9);
 restored.stage('scores',[{name:'alpha',round:10,points:3600,mode:'solo'},{name:'alpha',round:9,points:3150,mode:'solo'}]);
 await restored.flush('scores');
 assert.equal(remote.scores.revision,2);
 assert.equal(remote.scores.data.length,2);
 console.log('CLOUD STATE TEST PASSED',JSON.stringify({restarted:true,usersPersist:true,scoresPersist:true,revisions:[remote.users.revision,remote.scores.revision],httpRequests:apiCalls}));
}finally{
 global.fetch=prev;fs.rmSync(dir,{recursive:true,force:true});
}
