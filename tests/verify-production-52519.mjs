import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base='https://deadzone-eclipse-coop.onrender.com';
const get=async path=>{
 const r=await fetch(base+path,{cache:'no-store',headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(25000)});
 if(!r.ok)throw Error(path+' HTTP '+r.status);
 return r;
};
const html=await(await get('/?verify_mobile_v52519=1')).text();
const build=html.match(/<meta\s+name="deadzone-build"\s+content="([^"]+)"/i)?.[1]||'';
assert.match(build,/^5\.25\.19-[0-9a-f]{12}$/,'Render still serves another build '+build);
for(const token of ['DEAD_ZONE_PATCH_539','DEAD_ZONE_PATCH_540','dz540AutoTarget','DZ539_MELEE'])assert(html.includes(token),'Missing '+token);
const health=await(await get('/health')).json();assert.equal(health.status,'ok');
const storage=await(await get('/api/storage-health')).json();
assert(storage.ready&&storage.healthy&&storage.configured,'Supabase not ready');
const rooms=await(await get('/api/live-rooms')).json();assert(Array.isArray(rooms.rooms));
const scores=await(await get('/api/matches')).json();assert(Array.isArray(scores.matches));
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});
const outcomes=[];
try{
 for(const mobile of [false,true]){
  const ctx=await browser.newContext({viewport:mobile?{width:915,height:412}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?browser_verify_52519=1',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#start').waitFor({timeout:30000});
  await page.locator('#start').click();
  await page.waitForFunction(()=>window.__DZ539_MELEE_STATUS?.().available===8&&window.__DZ540_STATUS?.()&&window.__DZ535_STATUS?.localGunVisible,null,{timeout:30000});
  await page.waitForTimeout(2500);
  const status=await page.evaluate(()=>({melee:window.__DZ539_MELEE_STATUS(),perf:window.__DZ540_STATUS(),gun:window.__DZ535_STATUS?.localGunVisible}));
  assert.equal(status.melee.available,8);
  assert.equal(status.gun,true);
  assert.equal(status.perf.mobile,mobile);
  if(mobile){assert(status.perf.pixelRatio>=.55&&status.perf.pixelRatio<=1.05,'Unexpected mobile DPR '+status.perf.pixelRatio)}
  assert.deepEqual(errors.filter(x=>/TypeError|ReferenceError|SyntaxError|is not defined/i.test(x)),[]);
  await page.screenshot({path:mobile?'production-52519-mobile.png':'production-52519-pc.png'});
  outcomes.push({device:mobile?'mobile':'pc',melee:status.melee.available,renderScale:status.perf.pixelRatio,autoResolution:status.perf.adaptive,gunVisible:true,criticalErrors:0});
  await ctx.close();
 }
}finally{await browser.close()}
console.log('PRODUCTION v5.25.19 VERIFIED',JSON.stringify({build,healthy:true,persistentDB:true,roomAPI:true,matchAPI:true,clients:outcomes}));
