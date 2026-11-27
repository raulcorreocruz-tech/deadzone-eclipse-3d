'use strict';
/*
 * DEAD ZONE recovery gateway. The source Floot ZIP was lost; the existing live
 * Render installation still has the audited, playable compiled client/server.
 * Serve a patched copy of that client while proxying the original account,
 * room and match protocols to the original running backend. Never copy or
 * reinitialize the original user database.
 */
const http=require('node:http');
const {Readable}=require('node:stream');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {WebSocketServer,WebSocket}=require('ws');

const HOST=String(process.env.UPSTREAM_URL||'https://deadzone-eclipse-coop.onrender.com').replace(/\/$/,'');
const VERSION='5.25.24';
const PORT=Number(process.env.PORT||10000);
const VALID_SKINS=new Set(['soldado','panda','rapero','vaquero','boxeador','infectado','doraemon','kimeramon','peter_griffin','mewtwo','timmy_turner','raphael_tmnt','agunimon','cleft','shin_chan','palmera']);
const FX_TYPES=new Set(['shot','turret','blast','storm','grenade','chicken','beam','explosion','special']);
const ARMORY={cross:5500,chicken:5400,omni:7200,football:4200,whip:3900,slippers:2600,fumaweed:4500,rickportal:3700,ghoul:4100,pokeballs:3100};
const clients=new Set();
const turrets=new Map();
let clientHtml=null,clientAt=0,loading=null,lastBaseStatus='unknown';
const baseSource=fs.readFileSync(path.join(__dirname,'gameplay-v544.cjs'),'utf8');
const start=baseSource.indexOf(' const runtime='),end=baseSource.indexOf(';\n h=h.replace(anchor,',start);
if(start<0||end<=start)throw Error('Missing 5.25.24 client patch runtime');
const v544=JSON.parse(baseSource.slice(start+' const runtime='.length,end));
const safeJson=(s)=>{try{return JSON.parse(s)}catch{return null}};
const goodCoord=n=>typeof n==='number'&&Number.isFinite(n)&&n>=-100&&n<=100;
function patchClient(html){
 if(!html.includes('function dzGun(){')||!html.includes('dz531EnsurePixelOnly')||!html.includes('new WebSocket'))
  throw Error('Remote compiled engine integrity check failed');
 if(!html.includes('DEAD_ZONE_PATCH_544')){
  const index=html.indexOf('function dzGun(){');
  html=html.slice(0,index)+v544+'\n'+html.slice(index);
 }
 const notes={version:VERSION,date:'27 nov 2026',title:'COOPERATIVO RECUPERADO: SKINS, DISPAROS, TORRETAS Y PUNTOS',detail:'Vuelve a funcionar el motor en PC y móvil, con skins pixel-art sin soldados superpuestos, tres huecos de armas, efectos de disparos y torretas para ambos jugadores, Rayo de pollos con quemadura y transferencia de puntos entre compañeros. Conexión con cuentas y cooperativo del servidor original.'};
 if(html.includes('const DZ538_RELEASES=[')&&!html.includes('"version":"'+VERSION+'","date":"27 nov 2026"')){
  html=html.replace('const DZ538_RELEASES=[','const DZ538_RELEASES=['+JSON.stringify(notes)+',');
 }
 html=html.replace(/(<meta name="deadzone-build" content=")[^"]+(")/,'$1'+VERSION+'-recovered$2');
 html=html.replace('</head>','<meta name="deadzone-recovery" content="relay-v2"><!-- DEAD_ZONE_RECOVERY_GATEWAY_544 --></head>');
 return html;
}
async function gameHtml(){
 const now=Date.now();
 if(clientHtml&&now-clientAt<300000)return clientHtml;
 if(loading)return loading;
 loading=(async()=>{
  const response=await fetch(HOST+'/',{signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error('Original engine inaccessible: HTTP '+response.status);
  const source=await response.text();
  if(source.length<100000||source.length>1500000)throw Error('Original engine has unexpected size '+source.length);
  const patched=patchClient(source);
  clientHtml=Buffer.from(patched,'utf8');clientAt=now;lastBaseStatus='ok';
  console.log('DEAD ZONE RECOVERED',VERSION,'bytes',clientHtml.length,'source',source.length);
  return clientHtml;
 })().catch(err=>{
  lastBaseStatus=err.message;
  if(clientHtml)return clientHtml;throw err
 }).finally(()=>{loading=null});
 return loading;
}
function json(res,status,body){
 const data=Buffer.from(JSON.stringify(body));
 res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','content-length':data.length,'access-control-allow-origin':'*'});
 res.end(data);
}
function send(ws,msg){if(ws?.readyState===WebSocket.OPEN){try{ws.send(JSON.stringify(msg))}catch{}}}
function balance(p){return Math.max(0,Math.floor((p.backendBalance??750)+(p.walletDelta??0)))}
function roomPeers(p){return [...clients].filter(other=>other!==p&&other.room&&other.room===p.room&&other.browser.readyState===WebSocket.OPEN)}
function emitPeers(p,msg){for(const other of roomPeers(p))send(other.browser,msg)}
function skinBroadcast(p){if(!p.room||!p.id)return;emitPeers(p,{type:'dz544Skin',id:p.id,skin:p.skin})}
function receiveFromBrowser(p,raw){
 const m=safeJson(String(raw));
 if(!m||typeof m.type!=='string')return;
 if(m.type==='dz544Skin'){
  if(VALID_SKINS.has(m.skin)){p.skin=m.skin;skinBroadcast(p)}
  return;
 }
 if(m.type==='dz544Fx'){
  if(!p.room||!p.id||!p.running||!FX_TYPES.has(m.kind)||!goodCoord(m.x)||!goodCoord(m.z)||!Number.isFinite(m.a)||Math.abs(m.a)>7)return;
  const now=Date.now();
  if(now-p.fxWindowAt>1000){p.fxWindowAt=now;p.fxCount=0}
  if(++p.fxCount>25)return;
  const msg={type:'dz544Fx',id:p.id,kind:m.kind,x:m.x,z:m.z,a:m.a,
   seq:Number.isSafeInteger(m.seq)?Math.max(0,m.seq):0,weapon:typeof m.weapon==='string'?m.weapon.slice(0,40):''};
  emitPeers(p,msg);
  if(m.kind==='turret'){
   const t=turrets.get(p.room)||[];t.push({msg,at:now});
   turrets.set(p.room,t.filter(t=>now-t.at<90000).slice(-12));
  }
  return;
 }
 if(m.type==='dz544HostBalance'){
  if(p.isHost&&Number.isSafeInteger(m.balance)&&m.balance>=0&&m.balance<=10000000)
   p.backendBalance=m.balance-p.walletDelta;
  return;
 }
 if(m.type==='dz544Cash'){
  const dest=[...clients].find(c=>c.id===m.to&&c.room===p.room);
  const amount=m.amount,now=Date.now();
  const valid=p.running&&dest?.running&&p.id!==dest.id&&
   Number.isSafeInteger(amount)&&amount>=100&&amount<=5000&&
   amount<=balance(p)&&balance(dest)+amount<=10000000&&now-p.lastCash>=700;
  if(!valid){send(p.browser,{type:'dz544CashResult',ok:false,balance:balance(p),reason:'SALDO, DESTINATARIO O IMPORTE INVÁLIDO'});return}
  p.lastCash=now;p.walletDelta-=amount;dest.walletDelta+=amount;
  send(p.browser,{type:'dz544CashResult',ok:true,to:dest.id,amount,balance:balance(p)});
  send(dest.browser,{type:'dz544CashReceived',from:p.id,fromName:p.name,amount,balance:balance(dest)});
  return;
 }
 if(m.type==='join'||m.type==='create'){
  if(VALID_SKINS.has(m.skin||m.character))p.skin=m.skin||m.character;
  if(typeof m.code==='string')p.pendingRoom=m.code;
  if(typeof m.name==='string')p.name=m.name.slice(0,24);
 }
 if(m.type==='state'&&VALID_SKINS.has(m.skin)&&p.skin!==m.skin){p.skin=m.skin;skinBroadcast(p)}
 if(m.type==='armoryBuy'&&p.running){
  const cost=ARMORY[m.weaponKey];
  if(cost&&balance(p)<cost){send(p.browser,{type:'armoryRejected',weaponKey:m.weaponKey,balance:balance(p),reason:'PUNTOS INSUFICIENTES'});return}
  if(cost&&balance(p)>=cost&&p.upstreamBalance<cost){
   // Gateway-authorized purchase funded with teammate transfers.
   p.walletDelta-=cost;
   send(p.browser,{type:'armoryPurchased',weaponKey:m.weaponKey,balance:balance(p)});
   return;
  }
 }
 if(p.upstream?.readyState===WebSocket.OPEN)p.upstream.send(String(raw));
 else if(p.pendingPackets.length<25)p.pendingPackets.push(String(raw));
}
function receiveFromUpstream(p,raw){
 const m=safeJson(String(raw));
 if(!m){sendRaw(p.browser,raw);return}
 if(m.type==='welcome'){
  p.id=m.id;p.room=m.code||p.pendingRoom;
  if(m.host)p.isHost=m.host===p.id;
  for(const other of roomPeers(p)){send(p.browser,{type:'dz544Skin',id:other.id,skin:other.skin});skinBroadcast(p)}
  for(const t of turrets.get(p.room)||[])if(Date.now()-t.at<90000)send(p.browser,t.msg);
 }
 if(m.type==='lobby'||m.type==='started'){
  if(m.host&&p.id)p.isHost=m.host===p.id;
  if(m.type==='started')p.running=true;
  if(m.type==='lobby')p.running=!!m.running;
  if(Array.isArray(m.players)){
   for(const item of m.players){
    const c=[...clients].find(c=>c.id===item.id&&c.room===p.room);
    if(c){item.skin=c.skin;item.character=c.skin;c.name=item.name||c.name;c.isHost=!!item.host}
   }
  }
 }
 if(m.type==='state'){
  const other=[...clients].find(c=>c.id===m.id&&c.room===p.room);
  if(other){m.skin=other.skin;m.character=other.skin}
 }
 if(m.type==='award'){
  const award=Number(m.points)||0;
  if(award>=0&&award<=6000)p.backendBalance+=award;
 }
 if(m.type==='armoryPurchased'&&Number.isFinite(m.balance)){
  p.backendBalance=m.balance;m.balance=balance(p);
 }
 if(m.type==='armoryRejected'&&Number.isFinite(m.balance))m.balance=balance(p);
 if(m.type==='perkPurchased'&&Number.isFinite(m.balance)){
  p.backendBalance=m.balance;m.balance=balance(p);
 }
 send(p.browser,m);
}
function sendRaw(ws,raw){if(ws.readyState===WebSocket.OPEN){try{ws.send(raw)}catch{}}}
const wss=new WebSocketServer({noServer:true,maxPayload:64*1024,perMessageDeflate:false});
wss.on('connection',ws=>{console.log('GATEWAY WS connected to bridge');
 const p={browser:ws,upstream:null,id:null,room:'',pendingRoom:'',skin:'soldado',name:'SURVIVIENTE',
  running:false,isHost:false,backendBalance:750,upstreamBalance:750,walletDelta:0,
  lastCash:0,fxWindowAt:0,fxCount:0,pendingPackets:[]};
 clients.add(p);
 const upstream=new WebSocket(HOST.replace(/^https:/,'wss:').replace(/^http:/,'ws:')+'/ws',{perMessageDeflate:false,handshakeTimeout:60000});
 p.upstream=upstream;
 upstream.on('open',()=>{console.log('GATEWAY upstream WS ready, pending packets:',p.pendingPackets.length);for(const pending of p.pendingPackets)upstream.send(pending);p.pendingPackets=[]});
 upstream.on('message',raw=>{const m=safeJson(String(raw));if(m?.type==='welcome'||m?.type==='error')console.log('GATEWAY upstream WS event',m.type);receiveFromUpstream(p,raw)});
 ws.on('message',raw=>receiveFromBrowser(p,raw));
 upstream.on('close',(code,reason)=>{if(ws.readyState===WebSocket.OPEN)ws.close(1011,'Servidor original desconectado')});
 upstream.on('error',e=>{console.warn('Upstream WS error',e.message);if(ws.readyState===WebSocket.OPEN)ws.close(1011,'No disponible')});
 ws.on('close',()=>{clients.delete(p);if(upstream.readyState===WebSocket.OPEN||upstream.readyState===WebSocket.CONNECTING)upstream.close()});
 ws.on('error',()=>{clients.delete(p);try{upstream.close()}catch{}});
});
async function proxyHttp(req,res){
 const u=new URL(req.url,HOST);
 const headers={};
 for(const h of ['content-type','authorization','cookie','accept','range','user-agent'])if(req.headers[h])headers[h]=req.headers[h];
 let payload;
 if(!['GET','HEAD'].includes(req.method)){
  const chunks=[];let total=0;
  for await (const chunk of req){total+=chunk.length;if(total>2*1024*1024){json(res,413,{error:'Solicitud demasiado grande'});return}chunks.push(chunk)}
  payload=Buffer.concat(chunks);
 }
 const upstream=await fetch(u,{method:req.method,headers,body:payload,redirect:'manual',signal:AbortSignal.timeout(45000)});
 const h={'cache-control':u.pathname.startsWith('/assets/')||u.pathname.startsWith('/vendor/')?'public, max-age=3600':'no-store'};
 for(const name of ['content-type','etag','last-modified','accept-ranges','content-range','location','set-cookie'])if(upstream.headers.has(name))h[name]=upstream.headers.get(name);
 res.writeHead(upstream.status,h);
 if(!upstream.body||req.method==='HEAD'){res.end();return}
 Readable.fromWeb(upstream.body).on('error',()=>res.destroy()).pipe(res);
}
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,'http://local.invalid').pathname;
  if(pathname==='/health'){json(res,200,{ok:!!clientHtml,mode:'recovered-live-relay',version:VERSION,upstream:lastBaseStatus,connectedPlayers:clients.size});return}
  if(pathname==='/api/release-info'){json(res,200,{version:VERSION,title:'RECUPERACIÓN COOPERATIVA: SKINS, 3 RANURAS Y EFECTOS',date:'27 nov 2026'});return}
  if(pathname==='/release-notes.json'){res.writeHead(200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(fs.readFileSync(path.join(__dirname,'release-notes.json')));return}
  if(pathname==='/sw.js'){
   res.writeHead(200,{'content-type':'application/javascript; charset=utf-8','cache-control':'no-store'});
   res.end('self.addEventListener("install",e=>self.skipWaiting());self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));');return;
  }
  if(pathname==='/'||pathname==='/index.html'){
   const html=await gameHtml();res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','content-length':html.length});res.end(html);return;
  }
  await proxyHttp(req,res);
 }catch(e){console.error('Gateway HTTP',req.url,e.message);if(!res.headersSent)json(res,502,{error:'Motor original temporalmente inaccesible',detail:e.message});else res.destroy()}
});
server.on('upgrade',(req,socket,head)=>{
 const pathname=new URL(req.url,'http://local.invalid').pathname;
 if(pathname!=='/ws'){socket.destroy();return}
 wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));
});
server.listen(PORT,'0.0.0.0',()=>console.log('DEAD ZONE RESTORE GATEWAY running on',PORT,'upstream',HOST));
gameHtml().catch(e=>console.warn('Initial game recovery deferred:',e.message));
