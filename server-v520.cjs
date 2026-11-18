'use strict';
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'server.js');
let s=fs.readFileSync(file,'utf8');
if(s.includes('DEAD_ZONE_SERVER_520'))console.log('Dead Zone 5.20 multiplayer armory already installed');
else{
 function once(a,b,name){const n=s.split(a).length-1;if(n!==1)throw Error('v5.20 server '+name+' expected once, got '+n);s=s.replace(a,b)}
 const prices="const DZ520_ARMORY_PRICES=Object.freeze({cross:5500,chicken:5400,omni:7200,football:4200,whip:3900});";
 once('const DZ511_PERK_COSTS=',"// DEAD_ZONE_SERVER_520: authoritative purchase pricing, independent of guest-submitted points.\n"+prices+"\nconst DZ511_PERK_COSTS=",'fixed server-side price registry');
 const hook="if(m.type==='perkBuy'&&room.running&&typeof m.perk==='string'){";
 const handler=
 "if(m.type==='armoryBuy'){\n"+
 "  const key=typeof m.weaponKey==='string'?m.weaponKey:'',cost=DZ520_ARMORY_PRICES[key];\n"+
 "  const authorized=room.running&&!p.downed&&Number.isInteger(cost)&&Number.isFinite(p.points)&&p.points>=cost;\n"+
 "  if(!authorized){safeSend(ws,{type:'armoryRejected',weaponKey:key,balance:p.points,reason:!room.running?'PARTIDA NO INICIADA':p.downed?'JUGADOR ABATIDO':!cost?'ARMA DESCONOCIDA':'PUNTOS INSUFICIENTES'});return}\n"+
 "  if(p.dz520LastPurchase&&Date.now()-p.dz520LastPurchase<250){safeSend(ws,{type:'armoryRejected',weaponKey:key,balance:p.points,reason:'COMPRA DUPLICADA'});return}\n"+
 "  p.dz520LastPurchase=Date.now();p.points-=cost;\n"+
 "  safeSend(ws,{type:'armoryPurchased',weaponKey:key,balance:p.points});return\n"+
 " }\n "+hook;
 once(hook,handler,'server checkout before perks');
 fs.writeFileSync(file,s);
 console.log('DEAD ZONE 5.20 server: fixed-price, downed-aware, balance-validated guest armory purchases');
}
