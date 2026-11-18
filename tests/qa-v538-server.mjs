import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'deadzone-v538-store-')),url='http://127.0.0.1:3000';
let server;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function start(){
 server=spawn('node',['server.js'],{env:{...process.env,DZ_DATA_DIR:dir,PORT:'3000'},stdio:['ignore','pipe','pipe']});
 let output='';server.stdout.on('data',x=>output+=x);server.stderr.on('data',x=>output+=x);
 for(let i=0;i<65;i++){
  if(server.exitCode!==null)throw Error('Server exited: '+output.slice(-1500));
  try{const r=await fetch(url+'/health',{signal:AbortSignal.timeout(2000)});if(r.ok)return}catch{}
  await sleep(250)
 }
 throw Error('Server did not start: '+output.slice(-1400));
}
async function stop(){
 if(!server)return;const proc=server;server=null;
 proc.kill('SIGTERM');await Promise.race([new Promise(r=>proc.once('exit',r)),sleep(2500)]);
 if(proc.exitCode===null)proc.kill('SIGKILL');await sleep(200);
}
async function request(action,params={}){
 const r=await fetch(url+'/api/social',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...params})});
 const data=await r.json();if(!r.ok)throw Error('Social '+action+' '+JSON.stringify(data));
 return data;
}
function socket(){
 const ws=new WebSocket('ws://127.0.0.1:3000/ws'),q=[],waiters=[];
 ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data);q.push(m);for(const x of [...waiters])x(m)});
 const open=new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
 const send=m=>ws.send(JSON.stringify(m));
 const recv=(type,check=()=>true,timeout=5000)=>new Promise((resolve,reject)=>{
  const found=q.find(m=>m.type===type&&check(m));if(found){resolve(found);return}
  const listener=m=>{if(m.type===type&&check(m)){clearTimeout(t);waiters.splice(waiters.indexOf(listener),1);resolve(m)}};
  waiters.push(listener);const t=setTimeout(()=>{waiters.splice(waiters.indexOf(listener),1);reject(Error('Missing '+type+' messages '+q.map(m=>m.type)))},timeout)
 });
 return {ws,open,send,recv,q};
}
let host,guest,outsider;
try{
 await start();
 let one=await request('register',{username:'testerOne',password:'long-test-password-one-38'});
 let two=await request('register',{username:'testerTwo',password:'long-test-password-two-47'});
 assert(one.token&&two.token,'Registration tokens missing');
 assert(!fs.readFileSync(path.join(dir,'deadzone-social.json'),'utf8').includes('long-test-password-one-38'),'Plaintext password leaked');
 await request('request',{token:one.token,username:'testerTwo'});
 await request('accept',{token:two.token,targetId:one.state.account.id});
 let friends=await request('sync',{token:one.token});assert.equal(friends.state.friends.length,1);
 for(const round of [2,4]){
  const r=await fetch(url+'/api/leaderboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'testerOne',round,points:round*250,date:new Date().toISOString()})});
  assert.equal(r.status,200);
 }
 host=socket();guest=socket();outsider=socket();await Promise.all([host.open,guest.open,outsider.open]);
 host.send({type:'create',name:'testerOne',skin:'soldado',socialToken:one.token});
 const a=await host.recv('welcome'),code=a.code;
 guest.send({type:'join',code,name:'testerTwo',skin:'panda',socialToken:two.token});
 const b=await guest.recv('welcome');
 await guest.recv('lobby',m=>m.players.length===2);
 host.send({type:'lobbyChat',text:'Hola equipo'});
 const received=await guest.recv('lobbyChat');assert.equal(received.text,'Hola equipo');
 guest.send({type:'lobbyChat',text:'<script>alert(1)</script>'});
 const escaped=await host.recv('lobbyChat',m=>m.id===b.id);assert.match(escaped.text,/script/); // browser must textContent
 outsider.send({type:'create',name:'OUTSIDER'});await outsider.recv('welcome');
 host.send({type:'start'});await guest.recv('started');
 host.send({type:'voiceReady',enabled:true});
 const voiceReady=await guest.recv('voiceReady',m=>m.from===a.id);assert.equal(voiceReady.enabled,true);
 host.send({type:'voiceSignal',to:b.id,description:{type:'offer',sdp:'v=0\r\nqa-test'}});
 const voice=await guest.recv('voiceSignal',m=>m.from===a.id);
 assert.equal(voice.description.type,'offer');
 outsider.send({type:'voiceSignal',to:b.id,description:{type:'offer',sdp:'v=0\r\nother-room'}});
 await sleep(350);
 assert(!guest.q.some(m=>m.type==='voiceSignal'&&m.description?.sdp==='v=0\r\nother-room'),'Cross-room signaling leak');
 host.send({type:'end'});await guest.recv('roomStopped');
 const gameHistory=await fetch(url+'/api/matches?limit=20').then(r=>r.json());
 assert(gameHistory.matches.filter(x=>x.mode==='individual').length>=2,'Same username match history got overwritten');
 assert(gameHistory.matches.filter(x=>x.mode==='cooperativo').length>=2,'Coop results not recorded');
 const scores=await fetch(url+'/api/leaderboard').then(r=>r.json());
 assert(scores.total>=4);
 for(const s of [host,guest,outsider])s.ws.close();
 await sleep(180);await stop();await start();
 const login=await request('login',{username:'testerOne',password:'long-test-password-one-38'});
 assert.equal(login.state.friends.length,1,'Friends lost between server restarts');
 const stored=await fetch(url+'/api/matches').then(r=>r.json());assert(stored.total>=4,'Leaderboard lost between server restarts');
 console.log('DURABLE-READY SOCIAL / CHAT / VOICE RELAY TEST PASSED',JSON.stringify({registered:2,friendPersisted:true,matchTotal:stored.total,lobbyChat:true,voiceSignaling:true,crossRoomBlocked:true,storedAcrossRestart:true,durableInProduction:false}));
}finally{
 for(const s of [host,guest,outsider])try{s?.ws.close()}catch{}
 await stop();fs.rmSync(dir,{recursive:true,force:true});
}
