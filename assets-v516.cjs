'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assets=[
 ['war_elephant','969a3fa246c4cdfa583fc0db2fd002e49c957cebbe611a0a2304468b34fb31ef'],
 ['tropical_palm','22a04e6f9a0e7c920f9b65bbee974eb798288fd88fcae512731ddd2be3314108']
];
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
for(const [name,hash] of assets){
 const input=path.join(__dirname,'assets',name+'.png.b64');
 const out=path.join(__dirname,'assets',name+'.png');
 const encoded=fs.readFileSync(input,'utf8').trim();
 if(!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded))throw Error('Invalid embedded image asset '+name);
 let bytes=Buffer.from(encoded,'base64'),actual=digest(bytes);
 if(actual!==hash&&encoded.length%4===3){
  // The upload transport omitted a single base64 character. Recover only if the
  // result exactly matches the original user-supplied image's SHA256 checksum.
  // The correction is deterministic and cannot accept a different bitmap.
  const expected=encoded.length+1;let fixed=false;
  outer:for(let i=0;i<expected;i++){
   const head=encoded.slice(0,i),tail=encoded.slice(i);
   for(let k=0;k<64;k++){
    const candidate=Buffer.from(head+chars[k]+tail,'base64');
    if(candidate.length!==Number(name==='war_elephant'?4761:2013))continue;
    if(digest(candidate)===hash){
     console.log('PHASE2_BASE64_REPAIR',name,'insertionIndex',i,'character',chars[k]);
     bytes=candidate;actual=hash;fixed=true;break outer;
    }
   }
  }
  if(!fixed)console.error('One-character recovery failed for '+name);
 }
 if(actual!==hash||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Sprite integrity mismatch '+name+': '+actual);
 fs.writeFileSync(out,bytes);
 console.log('PHASE2 asset ready:',name+'.png',bytes.length,'bytes');
}
