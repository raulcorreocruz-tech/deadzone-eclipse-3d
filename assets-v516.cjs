'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assets=[
 ['war_elephant','969a3fa246c4cdfa583fc0db2fd002e49c957cebbe611a0a2304468b34fb31ef'],
 ['tropical_palm','22a04e6f9a0e7c920f9b65bbee974eb798288fd88fcae512731ddd2be3314108']
];
for(const [name,hash] of assets){
 const input=path.join(__dirname,'assets',name+'.png.b64');
 const out=path.join(__dirname,'assets',name+'.png');
 const encoded=fs.readFileSync(input,'utf8').trim();
 if(!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded))throw Error('Invalid embedded image asset '+name);
 const bytes=Buffer.from(encoded,'base64');
 const actual=crypto.createHash('sha256').update(bytes).digest('hex');
 if(actual!==hash||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Sprite integrity mismatch '+name+': '+actual);
 fs.writeFileSync(out,bytes);
 console.log('PHASE2 asset ready:',name+'.png',bytes.length,'bytes');
}
