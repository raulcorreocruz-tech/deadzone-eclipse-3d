import fs from 'node:fs';
const url='ws://127.0.0.1:3000/ws';
const findings=[];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function connect(){const w=new WebSocket(url);await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('connection timeout')),3500);w.addEventListener('open',()=>{clearTimeout(t);resolve()},{once:true});w.addEventListener('error',()=>{clearTimeout(t);reject(new Error('socket error'))},{once:true})});return w}
function collect(w){const messages=[];w.addEventListener('message',e=>{try{messages.push(JSON.parse(e.data))}catch{messages.push({type:'unparseable'})}});return messages}
async function until(fn,limit=3500){const start=Date.now();while(Date.now()-start<limit){const val=fn();if(val)return val;await delay(40)}throw Error('timeout waiting for message')}
const sockets=[];
try{
 const host=await connect();sockets.push(host);
 const hm=collect(host);
 host.send(JSON.stringify({type:'create',name:'AUDIT_HOST',character:'panda'}));
 const welcome=await until(()=>hm.find(m=>m.type==='welcome'));
 if(!welcome.code)throw Error('room code absent');
 const code=welcome.code;
 const guest=await connect();sockets.push(guest);const gm=collect(guest);
 guest.send(JSON.stringify({type:'join',name:'AUDIT_GUEST',code,character:'rapero'}));
 await until(()=>gm.find(m=>m.type==='welcome'));
 const watcher=await connect();sockets.push(watcher);const wm=collect(watcher);
 watcher.send(JSON.stringify({type:'join',name:'AUDIT_OBSERVER',code,character:'panda'}));
 await until(()=>wm.find(m=>m.type==='welcome'));
 host.send(JSON.stringify({type:'start'}));
 await until(()=>gm.find(m=>m.type==='started'));
 findings.push({check:'create/join/start',result:'pass'});
 // Unauthorized snapshots must not be trusted when sent by non-host clients.
 const malicious={type:'snapshot',wave:99999,spawn:999,zombies:[{id:'forged-zombie',x:0,z:0,kind:'final'}],gates:[],boss:true};
 guest.send(JSON.stringify(malicious));
 await delay(420);
 const forged=hm.some(m=>m.type==='snapshot'&&m.wave===99999);
 findings.push({check:'guest snapshot forgery',result:forged?'vulnerable':'not_observed',detail:'non-host snapshot relayed to host: '+forged});
 // Invalid JSON must not crash the server or kill the healthy host.
 const rogue=await connect();sockets.push(rogue);rogue.send('{ intentionally invalid json');
 await delay(300);
 findings.push({check:'malformed JSON resilience',result:host.readyState===WebSocket.OPEN?'pass':'host_disconnected'});
 // A host snapshot should be received by its guest.
 host.send(JSON.stringify({type:'snapshot',wave:1,spawn:3,zombies:[{id:'legit-zombie',kind:'normal',x:0,z:0}],gates:[],boss:false}));
 await until(()=>gm.find(m=>m.type==='snapshot'&&m.wave===1));
 findings.push({check:'host snapshot delivery',result:'pass'});
 // Clients should not be able to change someone else's health or money unilaterally.
 guest.send(JSON.stringify({type:'damage',id:'AUDIT_OBSERVER',amount:999999}));
 await delay(300);
 const unverified=wm.some(m=>m.type==='damage'&&m.amount===999999);
 findings.push({check:'guest damage injection',result:unverified?'requires_server_validation':'not_observed'});
} catch(e){findings.push({check:'test execution',result:'error',detail:String(e)})}
finally{for(const w of sockets)try{w.close()}catch{}}
const report={date:new Date().toISOString(),findings,limitations:['No long-duration stress test','No authoritative server penetration test','No real-device gameplay validation']};
fs.writeFileSync('coop-security-report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(findings.some(f=>f.check==='test execution'&&f.result==='error'))process.exitCode=1;
