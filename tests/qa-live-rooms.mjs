import assert from 'node:assert/strict';
const URL='ws://127.0.0.1:3000/ws',HTTP='http://127.0.0.1:3000';
function makeClient(){
 const ws=new WebSocket(URL),messages=[],waiters=[];
 ws.addEventListener('message',e=>{
  const data=JSON.parse(e.data);messages.push(data);
  for(const fn of [...waiters])fn(data);
 });
 const ready=new Promise((resolve,reject)=>{
  ws.addEventListener('open',resolve,{once:true});
  ws.addEventListener('error',reject,{once:true});
 });
 const send=data=>ws.send(JSON.stringify(data));
 const until=(type,pred=()=>true,timeout=10000)=>new Promise((resolve,reject)=>{
  const known=messages.find(m=>m.type===type&&pred(m));if(known){resolve(known);return}
  let timer;
  const handle=m=>{if(m.type===type&&pred(m)){clearTimeout(timer);waiters.splice(waiters.indexOf(handle),1);resolve(m)}};
  waiters.push(handle);
  timer=setTimeout(()=>{waiters.splice(waiters.indexOf(handle),1);reject(new Error('Waiting '+type+'; got '+JSON.stringify(messages.map(m=>m.type))))},timeout);
 });
 return {ws,messages,send,until,ready};
}
let host,guest,third;
try{
 host=makeClient();await host.ready;
 host.send({type:'create',name:'HOSTQA',skin:'soldado'});
 const welcome=await host.until('welcome');assert.match(welcome.code,/^[A-Z2-9]{6}$/);
 await host.until('lobby',m=>m.players.length===1);
 const directory=await fetch(HTTP+'/api/live-rooms').then(r=>r.json());
 assert(directory.rooms.some(r=>r.code===welcome.code&&r.state==='lobby'&&r.joining));
 host.send({type:'start'});await host.until('started');
 host.send({type:'snapshot',wave:8,spawn:7,zombies:[{id:'z123',kind:'normal',x:-23,z:-30}],gates:['ABRIR ESCALERAS'],boss:false});
 host.send({type:'state',x:-23,z:-30,a:1.1,hp:100,weapon:'MP7',moving:true,skin:'soldado'});
 await new Promise(r=>setTimeout(r,250));
 const publicRooms=await fetch(HTTP+'/api/live-rooms').then(r=>r.json());
 assert(publicRooms.rooms.some(r=>r.code===welcome.code&&r.state==='playing'&&r.wave===8));
 guest=makeClient();await guest.ready;
 guest.send({type:'join',code:welcome.code,name:'GUESTQA',skin:'panda'});
 await guest.until('welcome');
 const started=await guest.until('started');assert.equal(started.late,true);assert.equal(started.wave,8);
 const snapshot=await guest.until('snapshot');
 assert.equal(snapshot.wave,8);assert.equal(snapshot.zombies[0].id,'z123');
 assert(snapshot.gates.includes('ABRIR ESCALERAS'));
 const playerState=await guest.until('state',m=>m.name==='HOSTQA');
 assert.equal(playerState.weapon,'MP7');
 assert.equal(playerState.x,-23);
 await host.until('lobby',m=>m.players.length===2&&m.running);
 third=makeClient();await third.ready;
 third.send({type:'join',code:'QQQQQQ',name:'FAILQA'});
 const invalid=await third.until('error');assert.match(invalid.message,/Sala inexistente/);
 const getResponse=await fetch(HTTP+'/api/live-rooms');
 assert.equal(getResponse.status,200);assert.match(getResponse.headers.get('cache-control'),/no-store/);
 console.log('LIVE ROOMS TEST PASSED',JSON.stringify({code:welcome.code,players:2,lateJoin:true,wave:snapshot.wave,snapshotRestored:true,existingPlayersReplayed:true,publicDiscovery:true,invalidRoomRejected:true}));
}finally{
 for(const client of [host,guest,third])if(client?.ws)client.ws.close();
}
