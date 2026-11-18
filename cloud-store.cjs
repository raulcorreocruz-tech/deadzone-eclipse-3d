'use strict';
const fs=require('node:fs');
const path=require('node:path');
class DeadZoneCloud{
 constructor({url,key,secret,dir}){
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url))throw Error('Supabase URL invalid');
  if(!key||!secret||secret.length<40)throw Error('Database credentials missing');
  this.url=url.replace(/\/$/,'');
  this.key=key;this.secret=secret;this.dir=dir;
  this.revisions={};this.pending={};this.active={};this.timers={};this.lastSaved={};
  this.lastError=null;this.ready=false;
 }
 async rpc(name,fields){
  const response=await fetch(this.url+'/rest/v1/rpc/'+name,{
   method:'POST',
   headers:{'apikey':this.key,'Authorization':'Bearer '+this.key,'Content-Type':'application/json','Accept':'application/json'},
   body:JSON.stringify({p_secret:this.secret,...fields}),
   signal:AbortSignal.timeout(18000)
  });
  const raw=await response.text();
  if(!response.ok)throw Error('Supabase RPC '+name+' HTTP '+response.status+' '+raw.slice(0,250));
  try{return JSON.parse(raw)}catch{throw Error('Supabase RPC returned invalid JSON')}
 }
 async initialize(){
  const data=await this.rpc('deadzone_cloud_read',{});
  if(!data||!['users','scores'].every(k=>Number.isInteger(data[k]?.revision)&&Array.isArray(data[k]?.data)))
   throw Error('Invalid Supabase data, refusing to start without persistence');
  fs.mkdirSync(this.dir,{recursive:true,mode:0o700});
  for(const [scope,filename] of [['users','deadzone-social.json'],['scores','leaderboard.json']]){
   this.revisions[scope]=data[scope].revision;
   const body=scope==='users'?{version:1,users:data[scope].data}:data[scope].data;
   const target=path.join(this.dir,filename);
   fs.writeFileSync(target,JSON.stringify(body),{mode:0o600});
  }
  this.ready=true;return data;
 }
 stage(scope,value){
  if(!this.ready||!['users','scores'].includes(scope))return;
  this.pending[scope]=JSON.parse(JSON.stringify(value));
  if(this.timers[scope])clearTimeout(this.timers[scope]);
  this.timers[scope]=setTimeout(()=>{this.flush(scope).catch(err=>console.error('Cloud flush delayed:',err.message))},250);
 }
 async flush(scope){
  if(!['users','scores'].includes(scope))throw Error('Invalid scope');
  if(this.timers[scope]){clearTimeout(this.timers[scope]);this.timers[scope]=null}
  if(this.active[scope]){await this.active[scope];if(this.pending[scope])return this.flush(scope);return}
  if(!this.pending[scope])return;
  const write=async()=>{
   while(this.pending[scope]){
    const data=this.pending[scope];this.pending[scope]=null;
    try{
     const rev=await this.rpc('deadzone_cloud_write',{p_scope:scope,p_data:data,p_revision:this.revisions[scope]});
     if(!Number.isInteger(rev)||rev<=this.revisions[scope])throw Error('Supabase revision was not incremented');
     this.revisions[scope]=rev;this.lastSaved[scope]=Date.now();this.lastError=null;
    }catch(err){
     if(!this.pending[scope])this.pending[scope]=data;
     this.lastError=err.message;
     throw err;
    }
   }
  };
  const p=write();this.active[scope]=p;
  try{await p}finally{
   if(this.active[scope]===p)this.active[scope]=null;
   if(this.pending[scope]&&!this.timers[scope])this.timers[scope]=setTimeout(()=>{this.flush(scope).catch(err=>console.error('Cloud flush retry:',err.message))},3500);
  }
 }
 async drain(){await Promise.all(['users','scores'].map(s=>this.flush(s)))}
 status(){return {configured:true,ready:this.ready,revisions:this.revisions,pending:Object.keys(this.pending).filter(k=>!!this.pending[k]),lastSaved:this.lastSaved,healthy:this.ready&&!this.lastError}}
}
module.exports={DeadZoneCloud};
