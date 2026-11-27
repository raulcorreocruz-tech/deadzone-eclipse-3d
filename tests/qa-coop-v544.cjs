'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function getRuntime(file){
 const content=fs.readFileSync(path.join(root,file),'utf8');
 const start=content.indexOf(' const runtime='),end=content.indexOf(';\n ',start);
 assert(start>=0&&end>start,'No generated runtime in '+file);
 const code=JSON.parse(content.slice(start+' const runtime='.length,end));
 new vm.Script(code,{filename:file+'.browser-or-server-runtime'});
 return code;
}
const client=getRuntime('gameplay-v544.cjs');
const server=getRuntime('server-v544.cjs');
for(const feature of [
 'dz544VisualShot','dz544CreateReplicaTurret','dz544MaskSprites','dz544RefreshAppearance',
 'dz544SendCash','dz544UpdateCashPanel','dz544DrawSlots','dz544BurnTick','dz544ChickenGhost',
 "dz544SendFx('shot'","dz544SendFx('chicken'"
])assert(client.includes(feature),'Client missing '+feature);
assert(!client.includes('eval('),'Client code must not use eval');
const messages=[];
const sendRoom=(room,event,except)=>{for(const p of room.players.values())if(p.ws!==except)messages.push({target:p.id,event})};
const safeSend=(ws,event)=>messages.push({target:ws.id,event});
const context=vm.createContext({DZ55_SKINS:new Set(['soldado','panda']),sendRoom,safeSend,
 validNum:(n,a,b)=>typeof n==='number'&&Number.isFinite(n)&&n>=a&&n<=b,
 Date,Math,Number,Set,String,Map});
vm.runInContext(server,context);
const handler=context.dz544ServerEvent;
assert.equal(typeof handler,'function');
const a={id:'host',name:'Host',skin:'soldado',character:'soldado',ws:{id:'host'},
 points:2000,downed:false,lastState:{x:1,z:1,at:Date.now()}};
const b={id:'guest',name:'Guest',skin:'panda',character:'panda',ws:{id:'guest'},
 points:900,downed:false,lastState:{x:2,z:2,at:Date.now()}};
const room={running:true,host:'host',players:new Map([[a.id,a],[b.id,b]])};
assert(handler(b,room,{type:'dz544Skin',skin:'shin_chan'},b.ws));
assert.equal(b.skin,'shin_chan','New sprite skin must not revert to soldier');
assert(messages.some(x=>x.target==='host'&&x.event.type==='dz544Skin'));
messages.length=0;
handler(b,room,{type:'dz544Skin',skin:'../../unsafe'},b.ws);
assert.equal(b.skin,'shin_chan','Unexpected skin must be rejected');
assert(handler(b,room,{type:'dz544Fx',kind:'shot',x:2,z:2,a:0,weapon:'M1911',seq:7},b.ws));
assert(messages.some(x=>x.target==='host'&&x.event.kind==='shot'));
assert(!messages.some(x=>x.target==='guest'&&x.event.kind==='shot'),'Echoed its own shot');
messages.length=0;
handler(b,room,{type:'dz544Fx',kind:'shot',x:Infinity,z:2,a:0,weapon:'X'},b.ws);
assert.equal(messages.length,0,'Rejected invalid coordinates');
handler(b,room,{type:'dz544Fx',kind:'script',x:2,z:2,a:0},b.ws);
assert.equal(messages.length,0,'Rejected unapproved FX');
handler(b,room,{type:'dz544HostBalance',balance:9000000},b.ws);
assert.equal(b.points,900,'Guest must never mint credits');
handler(a,room,{type:'dz544HostBalance',balance:1400},a.ws);
assert.equal(a.points,1400,'Host simulation balance update');
handler(a,room,{type:'dz544Cash',to:'guest',amount:500},a.ws);
assert.equal(a.points,900);assert.equal(b.points,1400);
assert(messages.some(x=>x.target==='host'&&x.event.type==='dz544CashResult'&&x.event.ok));
assert(messages.some(x=>x.target==='guest'&&x.event.type==='dz544CashReceived'&&x.event.amount===500));
messages.length=0;
handler(b,room,{type:'dz544Cash',to:'host',amount:5000},b.ws);
assert.equal(a.points,900);assert.equal(b.points,1400);
assert(messages.some(x=>x.target==='guest'&&x.event.ok===false),'Overdraw should fail');
messages.length=0;
handler(b,room,{type:'dz544Cash',to:'guest',amount:100},b.ws);
assert.equal(a.points,900);assert.equal(b.points,1400);
assert(messages.some(x=>x.target==='guest'&&x.event.ok===false),'Self-transfer should fail');
messages.length=0;
handler(a,room,{type:'dz544Fx',kind:'turret',x:1,z:1,a:0},a.ws);
assert.equal(room.dz544Turrets.length,1,'Late-join turret snapshot');
assert(messages.some(x=>x.target==='guest'&&x.event.kind==='turret'));
assert(server.includes('room.dz544Turrets'),'Turret replay not implemented');
console.log('DEAD ZONE 5.25.24 COOP UNIT TESTS PASSED: skins, FX relay, turrets, 3 slots, cash validation and chicken effects');
