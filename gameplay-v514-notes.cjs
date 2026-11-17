'use strict';
const fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'index.html');
let h=fs.readFileSync(file,'utf8');
if(h.includes('DEAD_ZONE_PATCH_514_NOTES')){console.log('Phase1 notes already injected')}else{
const {releases}=JSON.parse(fs.readFileSync(path.join(__dirname,'release-notes.json'),'utf8'));
const version=require('./package.json').version;
if(!Array.isArray(releases)||!releases.length||releases[0]?.version!==version)throw Error('Public release '+version+' requires an entry at top of release-notes.json; publication blocked until novelties are documented.');
for(const entry of releases)if(typeof entry?.version!=='string'||typeof entry.title!=='string'||typeof entry.date!=='string'||typeof entry.detail!=='string')throw Error('Invalid release notes entry');
const item=releases.map(x=>({version:'v'+x.version+' — '+x.title,date:x.date,detail:x.detail}));
const insert='const updates=[';
if(h.split(insert).length!==2)throw Error('updates array anchor missing: '+(h.split(insert).length-1));
h=h.replace(insert,'// DEAD_ZONE_PATCH_514_NOTES: generated from required versioned release-notes.json\n'+insert+'\n'+item.map(x=>JSON.stringify(x)+',').join('\n')+'\n');
fs.writeFileSync(file,h);
console.log('DEAD ZONE changelog: '+releases.length+' recent releases documented, current '+version+' first; subsequent builds must update release-notes.json');
}
