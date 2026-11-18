import assert from 'node:assert/strict';
const url='https://deadzone-eclipse-coop.onrender.com/api/leaderboard';
const response=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});
assert(response.ok,'Legacy ranking HTTP '+response.status);
const json=await response.json();
const scores=Array.isArray(json.scores)?json.scores.filter(s=>typeof s?.name==='string'&&Number.isInteger(s?.round)&&Number.isInteger(s?.points)).slice(0,100):[];
console.log('LEGACY PUBLIC SCORE COUNT',scores.length);
console.log('LEGACY PUBLIC SCORES',JSON.stringify(scores));
