'use strict';
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'server.js');
let s=fs.readFileSync(file,'utf8');
if(s.includes('DEAD_ZONE_SERVER_536'))console.log('v536 live room server already integrated');
else{
 function once(a,b,label){const n=s.split(a).length-1;if(n!==1)throw Error('v536 '+label+' anchor count '+n);s=s.replace(a,b)}
 once("if(room.running){safeSend(ws,{type:'error',message:'La partida ya ha comenzado. Espera a la siguiente.'});return}",'','accept joining active match');
 const oldJoin="room.players.set(id,p);clients.set(ws,p);safeSend(ws,{type:'welcome',id,code:room.code,host:room.host});sendRoom(room,{type:'lobby',code:room.code,host:room.host,running:room.running,players:members(room)});return";
 const newJoin="room.players.set(id,p);clients.set(ws,p);safeSend(ws,{type:'welcome',id,code:room.code,host:room.host});sendRoom(room,{type:'lobby',code:room.code,host:room.host,running:room.running,players:members(room)});if(room.running){safeSend(ws,{type:'started',host:room.host,players:members(room),late:true,wave:room.lastWave||1});if(room.snapshot)safeSend(ws,room.snapshot);for(const peer of room.players.values()){if(peer.id===p.id||!peer.lastBroadcast)continue;safeSend(ws,peer.lastBroadcast)}}return";
 once(oldJoin,newJoin,'welcome/start/snapshot replay for late joins');
 const oldSnap="sendRoom(room,{type:'snapshot',wave:validNum(m.wave,0,999)?m.wave:0,spawn:validNum(m.spawn,0,300)?m.spawn:0,zombies:m.zombies.slice(0,55).filter(z=>validNum(z.x,-100,100)&&validNum(z.z,-100,100)),gates:Array.isArray(m.gates)?m.gates.slice(0,25):[],boss:!!m.boss},ws);return";
 const newSnap="room.snapshot={type:'snapshot',wave:validNum(m.wave,0,999)?m.wave:0,spawn:validNum(m.spawn,0,300)?m.spawn:0,zombies:m.zombies.slice(0,55).filter(z=>validNum(z.x,-100,100)&&validNum(z.z,-100,100)),gates:Array.isArray(m.gates)?m.gates.slice(0,25):[],boss:!!m.boss};sendRoom(room,room.snapshot,ws);return";
 once(oldSnap,newSnap,'cache validated snapshot');
 const oldState="sendRoom(room,{type:'state',id:p.id,name:p.name,character:p.skin,skin:p.skin,downed:p.downed,x:m.x,z:m.z,a:m.a,hp:p.downed?0:(validNum(m.hp,0,250)?m.hp:100),weapon:typeof m.weapon==='string'?m.weapon.slice(0,35):'',moving:!!m.moving&&!p.downed},ws);";
 const newState="p.lastBroadcast={type:'state',id:p.id,name:p.name,character:p.skin,skin:p.skin,downed:p.downed,x:m.x,z:m.z,a:m.a,hp:p.downed?0:(validNum(m.hp,0,250)?m.hp:100),weapon:typeof m.weapon==='string'?m.weapon.slice(0,35):'',moving:!!m.moving&&!p.downed};sendRoom(room,p.lastBroadcast,ws);";
 once(oldState,newState,'remember last player state for late join');
 // No sensitive data: public directory returns only session status and optional public nicknames.
 const hook='const server=http.createServer((req,res)=>{';
 const middleware="\n// DEAD_ZONE_SERVER_536 — public, short-lived room directory (server is authoritative).\nfunction dz536ServeRooms(req,res){\n let pathname;try{pathname=new URL(req.url,'https://game.invalid').pathname}catch{return false}\n if(pathname!=='/api/live-rooms')return false;\n if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return true}\n const roomList=[...rooms.values()].filter(room=>room.players.size>0&&room.players.size<=maxPlayers).slice(0,100).map(room=>({\n  code:room.code,players:room.players.size,capacity:maxPlayers,\n  state:room.running?'playing':'lobby',wave:room.running?(room.lastWave||1):0,\n  host:room.players.get(room.host)?.name||'SUPERVIVIENTE',\n  joining:room.players.size<maxPlayers\n }));\n const body=JSON.stringify({rooms:roomList,online:clients.size,limit:maxPlayers,updatedAt:Date.now()});\n res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','Content-Length':Buffer.byteLength(body),'X-Content-Type-Options':'nosniff'});\n res.end(req.method==='HEAD'?'':body);return true;\n}\n";
 once(hook,middleware+'\n'+hook+'if(dz536ServeRooms(req,res))return;','room-listing endpoint');
 fs.writeFileSync(file,s);
 console.log('Dead Zone v536: public live directory; instant joins with validated snapshot');
}
