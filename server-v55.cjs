'use strict';
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'server.js');
let s=fs.readFileSync(file,'utf8');
if(s.includes('DEAD_ZONE_SERVER_55')){console.log('Server v5.5 already installed')}else{
function once(a,b,label){const n=s.split(a).length-1;if(n!==1)throw Error('v5.5 server '+label+' '+n);s=s.replace(a,b)}
once("const validNum=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;",
"// DEAD_ZONE_SERVER_55: authoritative co-op down/revive and skin relay.\nconst DZ55_SKINS=new Set(['soldado','panda','rapero','vaquero','boxeador','infectado','doraemon']);\nconst dz55Skin=value=>DZ55_SKINS.has(value)?value:'soldado';\nconst dz55Range=(a,b)=>a&&b&&Math.hypot(a.x-b.x,a.z-b.z)<=1.55;\nconst validNum=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;",'server helpers');
once("const members=room=>[...room.players.values()].map(p=>({id:p.id,name:p.name,character:p.character,host:p.id===room.host,ready:p.ready}));",
"const members=room=>[...room.players.values()].map(p=>({id:p.id,name:p.name,character:p.character,skin:p.skin,downed:p.downed,host:p.id===room.host,ready:p.ready}));",'lobby player skin');
once("const name=clean(m.name)||'SUPERVIVIENTE',character=['rapero','panda','tactico'].includes(m.character)?m.character:'panda';",
"const name=clean(m.name)||'SUPERVIVIENTE',character=dz55Skin(m.skin||m.character);",'join selected skin');
once("const p={ws,id,name,character,room:room.code,ready:false,lastAction:0};",
"const p={ws,id,name,character,skin:character,downed:false,reviveGraceUntil:0,reviveTracking:new Map(),lastState:null,room:room.code,ready:false,lastAction:0};",'lobby revive state');
once("if(m.type==='start'&&room.host===p.id&&!room.running){room.running=true;sendRoom(room,{type:'started',host:room.host,players:members(room)});return}",
"if(m.type==='start'&&room.host===p.id&&!room.running){room.running=true;for(const peer of room.players.values()){peer.downed=false;peer.reviveTracking.clear();peer.lastState=null;peer.reviveGraceUntil=0}sendRoom(room,{type:'started',host:room.host,players:members(room)});return}",'new match reset');
once("if(m.type==='state'&&room.running&&validNum(m.x,-57,57)&&validNum(m.z,-51,51)&&validNum(m.a,-7,7)){sendRoom(room,{type:'state',id:p.id,name:p.name,character:p.character,x:m.x,z:m.z,a:m.a,hp:validNum(m.hp,0,100)?m.hp:100,weapon:typeof m.weapon==='string'?m.weapon.slice(0,35):'',moving:!!m.moving},ws);return}",
"if(m.type==='state'&&room.running&&validNum(m.x,-57,57)&&validNum(m.z,-51,51)&&validNum(m.a,-7,7)){\n"+
" p.lastState={x:m.x,z:m.z,at:now};p.skin=dz55Skin(m.skin||p.skin);p.character=p.skin;\n"+
" if(m.downed&&now>=p.reviveGraceUntil)p.downed=true;\n"+
" for(const ally of room.players.values()){\n"+
"  if(ally.id===p.id)continue;\n"+
"  const standing=ally.downed&&!p.downed&&ally.lastState&&now-ally.lastState.at<950&&dz55Range(p.lastState,ally.lastState);\n"+
"  if(standing){if(!p.reviveTracking.has(ally.id))p.reviveTracking.set(ally.id,now)}\n"+
"  else p.reviveTracking.delete(ally.id);\n"+
"  const reverse=p.downed&&!ally.downed&&ally.lastState&&now-ally.lastState.at<950&&dz55Range(p.lastState,ally.lastState);\n"+
"  if(reverse){if(!ally.reviveTracking.has(p.id))ally.reviveTracking.set(p.id,now)}else ally.reviveTracking.delete(p.id);\n"+
" }\n"+
" sendRoom(room,{type:'state',id:p.id,name:p.name,character:p.skin,skin:p.skin,downed:p.downed,x:m.x,z:m.z,a:m.a,hp:p.downed?0:(validNum(m.hp,0,250)?m.hp:100),weapon:typeof m.weapon==='string'?m.weapon.slice(0,35):'',moving:!!m.moving&&!p.downed},ws);return}",'relay skin and authoritative downed state');
once("if(m.type==='fire'&&room.running&&room.host!==p.id",
"if(m.type==='revive'&&room.running&&typeof m.target==='string'&&!p.downed){\n"+
" const target=room.players.get(m.target),since=p.reviveTracking.get(m.target);\n"+
" if(target&&target.downed&&p.lastState&&target.lastState&&now-p.lastState.at<950&&now-target.lastState.at<950&&dz55Range(p.lastState,target.lastState)&&typeof since==='number'&&now-since>=3000){\n"+
"  target.downed=false;target.reviveGraceUntil=now+2200;target.reviveTracking.clear();if(target.lastState)target.lastState.at=now;\n"+
"  for(const other of room.players.values())other.reviveTracking.delete(target.id);\n"+
"  sendRoom(room,{type:'revived',id:target.id,by:p.id,hp:65});\n"+
" }return}\n"+
" if(m.type==='fire'&&room.running&&room.host!==p.id",'validate 3sec revive from server clock');
fs.writeFileSync(file,s);console.log('DEAD ZONE v5.5 server authoritative revive, skins and retained co-op room');
}