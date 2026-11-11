'use strict';
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'index.html');
let html=fs.readFileSync(file,'utf8');
if(html.includes('DEAD_ZONE_PATCH_47')){console.log('v4.7 already applied')}else{
function once(a,b,label){const n=html.split(a).length-1;if(n!==1)throw Error('v4.7 '+label+' '+n);html=html.replace(a,b)}
const code=String.raw