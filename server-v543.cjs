'use strict';
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'server.js');
let s=fs.readFileSync(file,'utf8');
if(s.includes('DEAD_ZONE_SERVER_543'))console.log('v543 armory prices already installed');
else{
 const old="const DZ520_ARMORY_PRICES=Object.freeze({cross:5500,chicken:5400,omni:7200,football:4200,whip:3900});";
 const updated="const DZ520_ARMORY_PRICES=Object.freeze({cross:5500,chicken:5400,omni:7200,football:4200,whip:3900,slippers:2600,fumaweed:4500,rickportal:3700,ghoul:4100,pokeballs:3100});";
 if(s.split(old).length!==2)throw Error('v543 server checkout price anchor missing or duplicated');
 s=s.replace(old,updated);
 s += '\n// DEAD_ZONE_SERVER_543: server validates all five new Arsenal-only weapons.\n';
 fs.writeFileSync(file,s);console.log('Dead Zone v5.25.22: five new Arsenal prices validated server-side for invited players');
}