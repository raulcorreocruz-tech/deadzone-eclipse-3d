'use strict';
/**
 * DEAD ZONE 5.25.14 — arsenal visual / audio para las 49 armas.
 * No redistribuye archivos de Sketchfab/Pixabay. Mantiene los GLB CC0 locales,
 * añade firmas visuales por arma y efectos Web Audio originales.
 * Los archivos externos exactos se incorporarán solo si se obtienen con licencia compatible.
 */
const fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'index.html');
let h=fs.readFileSync(file,'utf8');
if(h.includes('DEAD_ZONE_PATCH_531')) {
 console.log('DEAD ZONE arsenal 49 ya instalado');
} else {
 function once(a,b,label){
  const n=h.split(a).length-1;
  if(n!==1)throw Error('Arsenal 49: ancla '+label+'='+n);
  h=h.replace(a,b);
 }
 const names=[
 'M1911','MP7','PDW-57','Vector K10','MSMC','Chicom CQB','Skorpion EVO','Peacekeeper',
 'MTAR','Type 25','SWAT-556','M27','SCAR-H','SMR','M8A1','AN-94','FAL OSW',
 'R-870 MCS','S12','KSG','M1216','MK 48','LSAT','QBB LSW','HAMR',
 'Tirachinas','Rayos eléctricos','Lanzallamas','Arma de hielo','Cañón de gravedad',
 'Lanzaperiódicos','Invocación de perros','Helicóptero artillado',
 'Huracán Eléctrico','Transmutador de Gallinas','Crucifijos explosivos',
 'Rayo de pollos','Omnitrix','Balonazos de fútbol','Latigazos de Cristo',
 'Katana','Bate eléctrico','Motosierra','Cuchillo mejorable','Garras de Wolverine',
 'Tres espadas de Zoro','Espadas del Caos de Kratos','Cuchillo jamonero','Reliquia del Eclipse'
 ];
 if(names.length!==49||new Set(names).size!==49)throw Error('Se requieren 49 armas únicas');
 const runtime=String.raw`
// DEAD_ZONE_PATCH_531 — perfiles de los 49 nombres y sustitución opcional de recursos licenciados.
const DZ533_NAMES=${JSON.stringify(names)};
const DZ533_SET=new Set(DZ533_NAMES);
const DZ533={loaded:false,overrides:{},sfx:new Map(),loading:new Set(),failed:new Set(),lastSound:0,activeName:''};
function dz533Slug(name){return String(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function dz533Seed(name){let h=2166136261;for(const c of name){h=Math.imul(h^c.charCodeAt(0),16777619)>>>0}return h>>>0}
function dz533Family(w){return dz48Family(w)}
function dz533Material(color,emissive=0){
 return new THREE.MeshStandardMaterial({color,metalness:.58,roughness:.39,emissive,emissiveIntensity:emissive?.40:0});
}
function dz533Visual(parent,w,lv){
 if(!parent||!w||!DZ533_SET.has(w.name))return;
 const previous=parent.getObjectByName('dz533-individual');
 if(previous){parent.remove(previous);previous.traverse(o=>{if(o.isMesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];for(const mat of mats)mat.dispose()}})}
 const group=new THREE.Group();group.name='dz533-individual';group.userData.dz533Owned=true;
 const seed=dz533Seed(w.name),f=dz533Family(w),n=w.name;
 const special=f==='special',melee=f==='melee';
 const metal=dz533Material(0x253238),detail=dz533Material(0x91a3ab);
 const accentColors=[0x5bd8df,0xf1b96e,0x8ac4f3,0xf18a79,0xbd9bf1,0xa0df98];
 const accent=dz533Material(accentColors[seed%accentColors.length],special?accentColors[seed%accentColors.length]:0);
 const black=dz533Material(0x171b22),gold=dz533Material(0xd2b467,lv>0?0x553b13:0);
 function box(x,y,z,sx,sy,sz,mat=metal){
  const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat.clone());m.position.set(x,y,z);group.add(m);return m
 }
 function cyl(x,y,z,top,bot,len,mat=detail){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(top,bot,len,8),mat.clone());m.position.set(x,y,z);group.add(m);return m
 }
 function torus(x,y,z,rad,mat=accent){
  const m=new THREE.Mesh(new THREE.TorusGeometry(rad,.025,7,14),mat.clone());m.position.set(x,y,z);m.rotation.y=Math.PI/2;group.add(m);return m
 }
 const v=seed%4;
 if(!melee&&!special){
  // Los modelos GLB CC0 subyacentes se conservan; cada arma recibe piezas únicas.
  const barrel=f==='shotgun'?.84:f==='lmg'?.86:f==='smg'?.52:f==='pistol'?.24:.72;
  box(0,.14,.18+barrel*.55,.04,.045,barrel,detail);
  box(0,.24,.33,.14,.065,.18,accent);
  if(f!=='pistol'){
   box(0,-.19,.24+(v%2)*.10,.15,.30+v*.035,.14,black); // cargador
   box(-.17,.12,.29,.06,.08,.34,metal);
  }
  if(f==='lmg'){cyl(.14,-.23,.24,.21,.21,.23,metal).rotation.z=Math.PI/2;box(-.16,-.16,.50,.045,.30,.04,detail)}
  if(f==='shotgun'){box(0,-.06,.48,.22,.13,.30,black);for(const x of [-.10,.10])box(x,.02,.49,.025,.04,.27,detail)}
  if(f==='smg'){box(0,-.05,.83,.13,.085,.15,accent);if(v===0)box(.13,.02,.09,.035,.15,.20,detail)}
  if(f==='rifle'){box(0,.22,.55,.08,.065,.23,black);if(v>1)torus(0,.24,.54,.11)}
  if(f==='pistol'){box(0,-.13,.24,.11,.21,.16,black);box(0,.18,.37,.09,.035,.13,accent)}
  if(f==='lmg'||f==='rifle'||f==='smg')for(let i=0;i<1+v;i++)box((i-(v/2))*.085,.12,.61,.03,.032,.16,black);
 }
 if(melee){
  // Perfil distinto para katana, tres espadas, garras, motosierra, jamonero, etc.
  if(/Motosierra/i.test(n)){box(0,0,.70,.24,.27,.95,metal);for(let i=0;i<6;i++)box(0,.12,.35+i*.14,.29,.05,.07,detail);box(0,-.20,.10,.19,.30,.28,black)}
  else if(/Bate/i.test(n)){cyl(0,0,.58,.09,.045,1.15,accent).rotation.x=Math.PI/2;torus(0,.03,1.02,.15)}
  else if(/Garras/i.test(n)){for(const x of [-.14,0,.14])box(x,0,.8,.035,.055,1.05,detail)}
  else {const count=/Tres espadas/i.test(n)?3:/Espadas del Caos/i.test(n)?2:1;
   for(let i=0;i<count;i++){const x=(i-(count-1)/2)*.21;box(x,0,.75,.045,.075,/jamonero/i.test(n)?1.24:.89,detail);box(x,-.03,.18,.15,.07,.26,black)}
  }
  if(/eléctrico|Caos/i.test(n))for(const x of [-.16,.16])torus(x,.04,.69,.13);
 }else if(special){
  const is=(q)=>n.toLocaleLowerCase('es').includes(q);
  box(0,-.025,.34,.25,.25,.66,metal);
  if(is('tirachinas')){box(-.17,.15,.68,.09,.55,.11,detail);box(.17,.15,.68,.09,.55,.11,detail)}
  else if(is('lanzallamas')){cyl(.21,-.16,.30,.17,.17,.40,accent);cyl(0,.03,.82,.15,.15,.49,black).rotation.x=Math.PI/2}
  else if(is('balonazos')){const ball=new THREE.Mesh(new THREE.SphereGeometry(.27,12,9),detail.clone());ball.position.set(0,.09,.90);group.add(ball)}
  else if(is('latigazos')){for(let i=0;i<5;i++)torus(.05*i,.06,.38+i*.20,.12,detail)}
  else if(is('omnitrix')){cyl(0,.14,.43,.27,.27,.20,black);torus(0,.23,.43,.22,accent)}
  else if(is('crucifijos')){box(0,.08,.89,.10,.58,.10,gold);box(0,.22,.89,.42,.10,.09,gold)}
  else if(is('invocación')||is('helicóptero')){cyl(0,.23,.43,.29,.29,.13,accent);torus(0,.33,.44,.25)}
  else if(is('lanzaperiódicos')){box(0,.02,.89,.45,.025,.25,detail);box(0,.045,.93,.41,.02,.20,accent)}
  else if(is('gallinas')||is('pollos')){const beak=new THREE.Mesh(new THREE.ConeGeometry(.16,.32,6),gold.clone());beak.rotation.x=Math.PI/2;beak.position.set(0,.08,.93);group.add(beak)}
  else {for(let i=0;i<3;i++)torus(0,.04,.48+i*.17,.19+i*.02,accent)}
 }else if(/Reliquia del Eclipse/i.test(n)){box(0,.02,.64,.36,.30,.95,metal);for(let i=0;i<4;i++)torus(0,0,.35+i*.22,.23,gold)}
 // El acento identifica el arma sin alterar hitboxes ni estadísticas.
 if(lv>0)torus(0,.07,.25,.12,gold);
 parent.add(group);DZ533.activeName=n;
}
function dz533AudioContext(){
 try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();return audio}catch{return null}
}
function dz533Noise(ctx,t,len,cut,volume,filterType='lowpass'){
 const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
 source.buffer=dz48Noise(ctx);filter.type=filterType;filter.frequency.value=cut;
 gain.gain.setValueAtTime(.0001,t);
 gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.005);
 gain.gain.exponentialRampToValueAtTime(.0001,t+len);
 source.connect(filter).connect(gain).connect(ctx.destination);
 source.start(t);source.stop(t+len+.015);
}
function dz533Tone(ctx,t,freq,duration,volume,shape='triangle',down=.36){
 const osc=ctx.createOscillator(),gain=ctx.createGain();
 osc.type=shape;osc.frequency.setValueAtTime(Math.max(35,freq),t);
 osc.frequency.exponentialRampToValueAtTime(Math.max(32,freq*down),t+duration);
 gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+.005);
 gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
 osc.connect(gain).connect(ctx.destination);osc.start(t);osc.stop(t+duration+.015);
}
function dz533Synth(w,action='shot'){
 if(!w||!DZ533_SET.has(w.name))return;
 const ctx=dz533AudioContext();if(!ctx)return;
 const seed=dz533Seed(w.name),family=dz533Family(w),t=ctx.currentTime+.004,off=(seed%113)/113;
 if(action==='reloadStart'||action==='reloadEnd'||action==='equip'){
  const base=action==='reloadStart'?510:action==='reloadEnd'?810:360;
  dz533Noise(ctx,t,.038+(seed%7)*.003,1100+seed%1500,.012,'highpass');
  dz533Tone(ctx,t+.028,base+off*340,.08,.015,'triangle',.75);
  if(action==='reloadEnd')dz533Tone(ctx,t+.103,950+off*240,.055,.011,'sine',.64);
  return;
 }
 const f=family;
 const props={pistol:[.12,1420,.043,165],smg:[.075,1800,.027,230],rifle:[.17,1220,.051,145],shotgun:[.32,760,.09,92],lmg:[.21,920,.065,108],melee:[.16,240,.041,135],special:[.26,1600,.049,400],sniper:[.30,740,.075,77]};
 let [len,cut,vol,freq]=props[f]||props.special;
 len*=.85+off*.3;cut*=.78+off*.47;freq*=.74+off*.5;
 if(f==='melee'){
  dz533Noise(ctx,t,len,1200+seed%2400,vol,'bandpass');
  if(/Motosierra/i.test(w.name))dz533Tone(ctx,t,105,.22,.055,'sawtooth',.74);
  else if(/eléctrico|Caos/i.test(w.name))dz533Tone(ctx,t+.03,480+seed%600,.11,.025,'square',.42);
 }else if(f==='special'||/Reliquia/.test(w.name)){
  dz533Noise(ctx,t,len,cut,vol,'bandpass');
  const n=w.name;
  const electric=/Rayos|Eléctrico|Huracán|Rayo|Omnitrix|Reliquia/i.test(n);
  const low=/Cañón de gravedad|Lanzallamas|Helicóptero/i.test(n);
  dz533Tone(ctx,t,low?95:electric?650+seed%450:freq,len,vol*.60,low?'sawtooth':'sine',electric?.16:.46);
  if(/Gallinas|pollos|Balonazos|Tirachinas/i.test(n))dz533Tone(ctx,t+.065,390+seed%200,.14,.023,'triangle',1.5);
 }else{
  dz533Noise(ctx,t,len,cut,vol);
  dz533Tone(ctx,t,freq,len*.76,vol*.6,'sawtooth',.32);
  if(f==='shotgun'||f==='lmg')dz533Noise(ctx,t+.024,len*.72,cut*.59,vol*.40);
 }
}
function dz533Play(w,action){
 // El audio siempre tiene respaldo local: nunca se hotlinkan vistas previas de terceros.
 if(action==='shot'){const now=performance.now();if(now-DZ533.lastSound<43)return;DZ533.lastSound=now}
 dz533Synth(w,action);
}
const dz533PreviousShot=dz512Sound;
dz512Sound=function(w){if(DZ533_SET.has(w?.name)){dz533Play(w,'shot');return}return dz533PreviousShot(w)};
const dz533PreviousReload=dz48Reload;
dz48Reload=function(){if(DZ533_SET.has(weapon()?.name)){dz533Play(weapon(),'reloadEnd');return}return dz533PreviousReload()};
const dz533PreviousEquip=dz48Equip;
dz48Equip=function(){if(DZ533_SET.has(weapon()?.name)){dz533Play(weapon(),'equip');return}return dz533PreviousEquip()};
const dz533PreviousReloadStart=reload;
reload=function(...args){
 const before=player.reload;const result=dz533PreviousReloadStart(...args);
 if(before<=0&&player.reload>0)dz533Play(weapon(),'reloadStart');return result;
};
const dz533PreviousWeaponFile=dz40WeaponFile;
dz40WeaponFile=function(w){if(w?.category==='Armas especiales'||w?.category==='Arma legendaria')return null;return dz533PreviousWeaponFile(w)};
const dz533PreviousLoadGun=dz40LoadGun;
dz40LoadGun=function(parent,w,lv){dz533PreviousLoadGun(parent,w,lv);dz533Visual(parent,w,lv)};
const dz533PreviousFinishGun=dz40FinishGun;
dz40FinishGun=function(parent,source,lv){
 dz533PreviousFinishGun(parent,source,lv);
 if(parent===DZ39.visualGun)dz533Visual(parent,weapon(),lv);
};
window.__DZ533_STATUS={total:DZ533_NAMES.length,missing:weapons.filter(w=>!DZ533_SET.has(w.name)).map(w=>w.name),assets:'21 GLB CC0 compartidos + detalles 3D por arma',audio:'Web Audio original por arma',exactSketchfabFiles:0};
`;
 once('function dzGun(){',runtime+'\nfunction dzGun(){','runtime');
 // Añadir identificador estático visible al diagnóstico de compilación.
 h=h.replace('</head>','<!-- DEAD_ZONE_PATCH_531: 49 armas diferenciadas, GLB CC0 + geometría, sonido original sin hotlinks --></head>');
 fs.writeFileSync(file,h);
 console.log('DEAD ZONE 49 armas: visuales diferenciados y sonidos Web Audio originales');
}
