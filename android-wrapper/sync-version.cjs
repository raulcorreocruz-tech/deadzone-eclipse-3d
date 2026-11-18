'use strict';
// Sync Android's installable version with the current Dead Zone web release.
// The incrementing versionCode is required for later Android/Play Store upgrades.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
const match=/^(\d+)\.(\d+)\.(\d+)$/.exec(version);
if(!match)throw Error('Invalid game semantic version: '+version);
const major=Number(match[1]),minor=Number(match[2]),patch=Number(match[3]);
if(major>1999||minor>999||patch>999)throw Error('Game version over Android versionCode range');
const versionCode=major*1000000+minor*1000+patch;
const file=path.join(__dirname,'app','build.gradle');
let gradle=fs.readFileSync(file,'utf8');
if(!/versionCode \d+/.test(gradle)||!/versionName '[^']*'/.test(gradle))throw Error('Android Gradle version anchor changed');
gradle=gradle.replace(/versionCode \d+/,'versionCode '+versionCode);
gradle=gradle.replace(/versionName '[^']*'/,"versionName '"+version+"'");
fs.writeFileSync(file,gradle);
console.log('Dead Zone Android APK version '+version+' · versionCode '+versionCode);
