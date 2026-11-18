'use strict';
const fs=require('node:fs');
function report(file,needles,before=330,after=2000){
 const s=fs.readFileSync(file,'utf8');
 console.log('\n\n***********',file,'SIZE',s.length,'***********');
 for(const needle of needles){
  let p=-1,count=0;
  while((p=s.indexOf(needle,p+1))!==-1 && count<3){
   console.log('\n----',needle,count+1,'AT',p,'----\n',s.slice(Math.max(0,p-before),Math.min(s.length,p+after)));count++;
  }
 }
}
report('server.js',["const rooms=","rooms=new Map","function members(","m.type==='join'","m.type==='create'","m.type==='start'","m.type==='snapshot'","m.type==='state'","m.type==='room","m.type==='ready'","const server=http.createServer","const wss=","new WebSocket.Server","new WebSocketServer","if(room.running)","room.running","room.players.set(","room.players.delete(","function safeSend","function sendRoom"],200,1750);
report('index.html',["function dzFireStreak(){","function dz515Assist(","function dz527AimOnly(){","const DZ527=","function dz524","function dz42Tick","function dz42Play","function dzModelTick(){","m.type==='joined'","m.type==='start'","m.type==='snapshot'","m.type==='lobby'","function joinRoom","function startGame","function netSend","const coop=","const allies=","function dz531MaskLegacy","function dz519HeliTick","function dz535Frame","const touch=","function shoot(){","function dz527Install()"],100,1500);
