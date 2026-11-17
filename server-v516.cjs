'use strict';
const fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'server.js');let h=fs.readFileSync(file,'utf8');
if(!h.includes('DEAD_ZONE_SERVER_516')){
 const needle="'kimeramon']);",replacement="'kimeramon','palmera']);";
 if(h.split(needle).length!==2)throw Error('v5.16: server skin allowlist changed');
 h=h.replace(needle,replacement);
 h=h.replace("const validNum=(n,min,max)=>","// DEAD_ZONE_SERVER_516 — selectable tropical palm skin may join co-op rooms.\nconst validNum=(n,min,max)=>");
 fs.writeFileSync(file,h);
 console.log('DEAD ZONE 5.16 server: tropical palm skin accepted by multiplayer relay');
}
