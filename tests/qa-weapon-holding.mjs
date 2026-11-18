import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,executablePath:process.env.DZ_CHROME_PATH||'/usr/bin/google-chrome',args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});
const results=[];
try{
 for(const spec of [{label:'pc-3d',mobile:false,skin:'soldado'},{label:'android-pixel',mobile:true,skin:'shin_chan'},{label:'pc-pixel',mobile:false,skin:'peter_griffin'}]){
  const ctx=await browser.newContext({viewport:spec.mobile?{width:915,height:412}:{width:1280,height:720},isMobile:spec.mobile,hasTouch:spec.mobile,deviceScaleFactor:spec.mobile?2:1});
  await ctx.addInitScript(skin=>{localStorage.setItem('deadzone_skin_v43',skin)},spec.skin);
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3000/',{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('#start').waitFor({timeout:25000});
  await page.locator('#start').click();
  await page.waitForFunction(spec=>window.__DZ535_STATUS?.localMode===(spec.skin==='soldado'?'3d':'sprite'),spec,{timeout:22000});
  await page.waitForTimeout(1000);
  const state=await page.evaluate(()=>({holding:window.__DZ535_STATUS,mask:window.__DZ531_VISUAL_DEBUG,arsenal:window.__DZ534_STATUS}));
  if(!state.holding?.localGunVisible)throw Error(spec.label+' gun invisible '+JSON.stringify(state));
  if(spec.skin==='soldado'&&state.holding.gripSegments!==4)throw Error('Hands not holding weapon '+JSON.stringify(state));
  if(spec.skin!=='soldado'&&state.holding.pixelHeldMeshes<1)throw Error('Pixel character has no equipped gun '+JSON.stringify(state));
  if(spec.skin!=='soldado'&&state.mask?.visibleLegacyMeshes>0)throw Error('Soldier accidentally visible over sprite '+JSON.stringify(state));
  if(spec.skin==='shin_chan'){
   await page.evaluate(()=>{
    const a=buildActor(mats.player,1,'player');a.position.set(-22,0,-30);scene.add(a);
    a.userData.dz55Skin='shin_chan';a.userData.dz535Weapon='MP7';allies.set('qa-held-weapon',a);
   });
   await page.waitForFunction(()=>window.__DZ535_STATUS?.remotePixelWeapons>=1,null,{timeout:12000});
   const remote=await page.evaluate(()=>{
    const a=allies.get('qa-held-weapon'),r=DZ535.actors.get(a);
    return {remote:window.__DZ535_STATUS?.remoteWeapons,skinVisible:!!dz531PixelSprite(a),weaponName:r?.weapon,mesh:r?.kind,meshCount:r?.mount.children.length}
   });
   if(remote.weaponName!=='MP7'||remote.meshCount<1)throw Error('Remote player did not equip his weapon '+JSON.stringify(remote));
   state.remote=remote;
   await page.evaluate(()=>{const a=allies.get('qa-held-weapon');a?.parent?.remove(a);allies.delete('qa-held-weapon')});
  }
  const critical=errors.filter(e=>/ReferenceError|TypeError|SyntaxError|Cannot access|not defined/i.test(e));
  if(critical.length)throw Error(spec.label+' JavaScript '+critical.join('; ').slice(0,600));
  await page.screenshot({path:'weapons-held-'+spec.label+'.png'});
  results.push({test:spec.label,status:'OK',weapon:state.holding.weapon,mode:state.holding.localMode,glb:state.arsenal?.activeModel,remote:state.remote||null,criticalErrors:0});
  await ctx.close();
 }
}finally{await browser.close()}
console.log('WEAPON HOLDING TESTS PASSED',JSON.stringify(results));
