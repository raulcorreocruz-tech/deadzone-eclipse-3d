import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const read=n=>fs.readFileSync(n);
const manifest=JSON.parse(read('build-manifest.json'));
const html=read('index.html').toString('utf8');
const pkg=JSON.parse(read('package.json'));
const sourceFiles=['package.json','setup.cjs','gameplay-v39.cjs','gameplay-v40.cjs','gameplay-v41.cjs','gameplay-v42.cjs','gameplay-v43.cjs'];
const hash=crypto.createHash('sha256');
for(const n of sourceFiles){hash.update(n);hash.update(read(n))}
const expected=pkg.version+'-'+hash.digest('hex').slice(0,12);
assert.equal(manifest.buildId,expected,'Manifest build ID differs from current source');
assert.equal(manifest.gameVersion,pkg.version);
assert.ok(html.includes('<meta name="deadzone-build" content="'+expected+'">'),'Build ID not present in HTML');
assert.equal(manifest.mainHtmlSha256,crypto.createHash('sha256').update(read('index.html')).digest('hex'));
assert.match(manifest.sourceZipSha256,/^[a-f0-9]{64}$/);
const entries=Object.keys(manifest.assets);
assert.ok(entries.length>=29,'Too few GLB models');
for(const name of entries)assert.equal(manifest.assets[name],crypto.createHash('sha256').update(read('assets/'+name)).digest('hex'),'Mismatch in '+name);
for(const marker of ['DEAD_ZONE_PATCH_43','DZ42','dz43Init'])assert.ok(html.includes(marker),'Missing '+marker);
console.log(JSON.stringify({status:'PASS',buildId:expected,glbFiles:entries.length,sourceZipSha256:manifest.sourceZipSha256},null,2));
