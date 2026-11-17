'use strict';
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'server.js');
let s=fs.readFileSync(file,'utf8');
if(s.includes('DEAD_ZONE_SERVER_511')){console.log('v5.11 server already applied')}else{
function once(a,b,label){const n=s.split(a).length-1;if(n!==1)throw Error('v5.11 server '+label+' anchor '+n);s=s.replace(a,b)}
once("const DZ55_SKINS=new Set(['soldado','panda','rapero','vaquero','boxeador','infectado','doraemon']);",
"// DEAD_ZONE_SERVER_511: end the run only when every surviving connected player is down, and authorize guest perks.\nconst DZ55_SKINS=new Set(['soldado','panda','rapero','vaquero','boxeador','infectado','doraemon','kimeramon']);\nconst DZ511_PERK_COSTS={salud:1800,recarga:1800,velocidad:1800,doble:2400,revivir:2500};",
'register uploaded playable sprite');
once("const p={ws,id,name,character,skin:character,downed:false,reviveGraceUntil:0,reviveTracking:new Map(),lastState:null,room:room.code,ready:false,lastAction:0};",
"const p={ws,id,name,character,skin:character,downed:false,reviveGraceUntil:0,reviveTracking:new Map(),lastState:null,points:750,perks:new Set(),room:room.code,ready:false,lastAction:0};",
'individual points/perks authoritative');
once("peer.downed=false;peer.reviveTracking.clear();peer.lastState=null;peer.reviveGraceUntil=0}",
"peer.downed=false;peer.reviveTracking.clear();peer.lastState=null;peer.reviveGraceUntil=0;peer.points=750;peer.perks.clear()}",
'new game reset');
once("if(m.type==='snapshot'&&room.host===p.id&&room.running&&Array.isArray(m.zombies)&&m.zombies.length<=55){sendRoom(room,{type:'snapshot'",
"if(m.type==='snapshot'&&room.host===p.id&&room.running&&Array.isArray(m.zombies)&&m.zombies.length<=55){room.lastWave=validNum(m.wave,0,999)?m.wave:0;sendRoom(room,{type:'snapshot'",
'remember round');
const stateEnd="sendRoom(room,{type:'state',id:p.id,name:p.name,character:p.skin,skin:p.skin,downed:p.downed,x:m.x,z:m.z,a:m.a,hp:p.downed?0:(validNum(m.hp,0,250)?m.hp:100),weapon:typeof m.weapon==='string'?m.weapon.slice(0,35):'',moving:!!m.moving&&!p.downed},ws);return}";
once(stateEnd,
"sendRoom(room,{type:'state',id:p.id,name:p.name,character:p.skin,skin:p.skin,downed:p.downed,x:m.x,z:m.z,a:m.a,hp:p.downed?0:(validNum(m.hp,0,250)?m.hp:100),weapon:typeof m.weapon==='string'?m.weapon.slice(0,35):'',moving:!!m.moving&&!p.downed},ws);\n"+
" if(room.running&&p.downed&&room.players.size>0&&[...room.players.values()].every(peer=>peer.downed)){\n"+
"  room.running=false;\n"+
"  sendRoom(room,{type:'matchOver',reason:'Todos los supervivientes han caído',wave:room.lastWave||1,players:members(room)});\n"+
"  sendRoom(room,{type:'lobby',code:room.code,host:room.host,running:false,players:members(room)});\n"+
" }return}",
'game over only when every connected player is down');
const perksHandler=" if(m.type==='revive'&&room.running&&typeof m.target==='string'&&!p.downed){";
once(perksHandler,
" if(m.type==='perkBuy'&&room.running&&typeof m.perk==='string'){\n"+
"  const cost=DZ511_PERK_COSTS[m.perk];\n"+
"  if(!cost||p.downed||p.perks.has(m.perk)||p.points<cost){safeSend(ws,{type:'perkRejected',perk:m.perk,balance:p.points,reason:!cost?'VENTAJA DESCONOCIDA':p.downed?'ESTÁS ABATIDO':p.perks.has(m.perk)?'VENTAJA YA COMPRADA':'PUNTOS INSUFICIENTES'});return}\n"+
"  p.points-=cost;p.perks.add(m.perk);\n"+
"  sendRoom(room,{type:'perkPurchased',id:p.id,perk:m.perk,balance:p.points});return\n"+
" }\n"+
 perksHandler,
 'server validates guest perk transactions');
once("safeSend(host.ws,{type:'remoteFire',id:p.id,x:m.x,z:m.z,a:m.a,weaponId:Number.isInteger(m.weaponId)?m.weaponId:0});return}",
"safeSend(host.ws,{type:'remoteFire',id:p.id,x:m.x,z:m.z,a:m.a,weaponId:Number.isInteger(m.weaponId)?m.weaponId:0,perks:[...p.perks]});return}",
'pass remote perks to authoritative host');
once("if(m.type==='award'&&room.running&&room.host===p.id&&typeof m.id==='string'){const dest=room.players.get(m.id);if(dest)safeSend(dest.ws,{type:'award',points:validNum(m.points,0,200)?m.points:10});return}",
"if(m.type==='award'&&room.running&&room.host===p.id&&typeof m.id==='string'){const dest=room.players.get(m.id);if(dest){const bonus=validNum(m.points,0,6000)?Math.floor(m.points):10;dest.points=Math.min(10000000,dest.points+bonus);safeSend(dest.ws,{type:'award',points:bonus,balance:dest.points})}return}",
'guest gets kills and points for purchases');
fs.writeFileSync(file,s);console.log('DEAD ZONE v5.11 server: all-downed defeat, authenticated perk purchases, synced remote bonuses and skins');
}
