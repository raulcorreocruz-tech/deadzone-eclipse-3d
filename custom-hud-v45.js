/* DEAD_ZONE_PATCH_45: independent mobile control editor, compatible with v3.8-v4.4. */
(() => {
'use strict';
const ids=['movestick','aimstick','fire','reload','use','swap','shop','dodge','dz39-melee','dz39-grenade','dz44-pause','pauseTouch'];
const names={movestick:'Movimiento',aimstick:'Apuntar',fire:'Disparar',reload:'Recargar',use:'Interactuar',swap:'Cambiar arma',shop:'Tienda',dodge:'Esquivar','dz39-melee':'Golpe','dz39-grenade':'Granada','dz44-pause':'Pausa',pauseTouch:'Pausa'};
const key='deadzone_touch_layout_v45';
const oldKey='deadzone_touch_layout_v25';
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const mobile=()=>matchMedia('(pointer:coarse)').matches || navigator.maxTouchPoints>0 || /Android|iPhone|iPad/i.test(navigator.userAgent);
const orient=()=>innerWidth>=innerHeight?'landscape':'portrait';
const side=()=>saved[orient()]||(saved[orient()]={});
let saved={landscape:{},portrait:{}},draft=null,editing=false,selected='fire',drag=null,startedInMenu=false,shownHud=false,oldPauseDisplay=null;
function parse(raw){try{const v=JSON.parse(raw);return v&&typeof v==='object'?v:null}catch{return null}}
try {
 const previous=parse(localStorage.getItem(key))||parse(localStorage.getItem(oldKey));
 if(previous)for(const o of ['portrait','landscape'])for(const [id,v] of Object.entries(previous[o]||{})){
  if(!v||typeof v!=='object'||!ids.includes(id))continue;
  saved[o][id]={x:clamp(Number(v.x)||.5,0,1),y:clamp(Number(v.y)||.5,0,1),size:clamp(Number(v.size)||1,.5,2.2),opacity:clamp(Number(v.opacity)||1,.1,1),visible:v.visible!==false};
 }
}catch{}
const isControl=el=>el&&ids.includes(el.id);
function all(){return ids.map($).filter(Boolean)}
function normalBox(el){const p=el.style.cssText;el.style.removeProperty('left');el.style.removeProperty('top');el.classList.remove('dz45-positioned');const r=el.getBoundingClientRect();el.style.cssText=p;return r}
function dataFor(el,from){const d=(from||saved)[orient()]||{};return d[el.id]}
function currentSize(el){return el.id.includes('stick')?112:el.id==='fire'?86:el.id.includes('pause')?54:68}
function apply(){
 for(const el of all()){
  const d=dataFor(el,editing?draft:saved);
  el.classList.toggle('dz45-positioned',!!d);
  el.classList.toggle('dz45-selected',editing&&el.id===selected);
  el.classList.toggle('dz45-ghost',editing);
  el.classList.toggle('dz45-hide',!editing&&d?.visible===false&&!el.id.includes('stick')&&!el.id.includes('pause'));
  if(d){
   const size=clamp(currentSize(el)*(Number(d.size)||1),35,230);
   const hx=size/(2*Math.max(1,innerWidth)),hy=size/(2*Math.max(1,innerHeight));
   el.style.setProperty('--dz45-x',(clamp(d.x,hx,1-hx)*100)+'vw');
   el.style.setProperty('--dz45-y',(clamp(d.y,hy,1-hy)*100)+'dvh');
   el.style.setProperty('--dz45-size',size+'px');
   el.style.setProperty('--dz45-opacity',String(d.opacity));
  }else for(const prop of ['--dz45-x','--dz45-y','--dz45-size','--dz45-opacity'])el.style.removeProperty(prop);
 }
}
function fillMissing(){
 const o=orient();draft[o]||={};
 for(const el of all())if(!draft[o][el.id]){
  const r=el.getBoundingClientRect(),x=clamp((r.left+r.width/2)/innerWidth,.05,.95),y=clamp((r.top+r.height/2)/innerHeight,.05,.95);
  draft[o][el.id]={x,y,size:1,opacity:.9,visible:true};
 }
}
function preset(mode){
 const left=mode==='left',compact=mode==='compact',wide=orient()==='landscape',mirror=x=>left?1-x:x;
 const values={movestick:[.14,.79,compact?1:1.25],aimstick:[.85,.79,compact?1:1.25],fire:[.9,wide?.43:.55,compact?1:1.5],reload:[.72,wide?.38:.47,1.1],use:[.69,.65,1.05],swap:[.6,.82,1.0],shop:[.32,.83,1],dodge:[.34,.6,1.1],'dz39-melee':[.78,.25,1],'dz39-grenade':[.65,.28,1],'dz44-pause':[.5,.09,1],pauseTouch:[.5,.09,1]};
 for(const [id,[x,y,size]] of Object.entries(values))if($(id))draft[orient()][id]={x:id.includes('pause')?.5:mirror(x),y,size,opacity:id==='fire'?.95:.84,visible:true};
 selected='fire';apply();sync();
}
function layoutPanel(){
 const root=document.createElement('div');root.id='dz45-editor';root.hidden=true;
 root.innerHTML='<div class="dz45-panel"><header><strong>🎮 EDITAR CONTROLES</strong><span id="dz45-orientation"></span></header><p>Arrastra los botones para moverlos. Selecciona uno para cambiar tamaño, opacidad y visibilidad.</p><div class="dz45-presets"><button data-preset="comfort">CÓMODO</button><button data-preset="compact">COMPACTO</button><button data-preset="left">ZURDOS</button></div><label>Control<select id="dz45-control"></select></label><label>Tamaño <output id="dz45-size-val">100%</output><input id="dz45-size" type="range" min="50" max="220" step="5" value="100"></label><label>Opacidad <output id="dz45-opacity-val">90%</output><input id="dz45-opacity" type="range" min="10" max="100" step="5" value="90"></label><label class="dz45-checkbox"><input id="dz45-visible" type="checkbox" checked> Mostrar control</label><footer><button id="dz45-reset">RESTAURAR</button><button id="dz45-cancel">CANCELAR</button><button id="dz45-save">✓ GUARDAR</button></footer></div>';
 document.body.append(root);
 const select=$('dz45-control');for(const el of all()){const opt=document.createElement('option');opt.value=el.id;opt.textContent=names[el.id]||el.id;select.append(opt)}
 root.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{fillMissing();preset(b.dataset.preset)}));
 select.addEventListener('change',()=>{selected=select.value;sync();apply()});
 $('dz45-size').addEventListener('input',e=>{const d=draft[orient()]?.[selected];if(d){d.size=Number(e.target.value)/100;$('dz45-size-val').textContent=e.target.value+'%';apply()}});
 $('dz45-opacity').addEventListener('input',e=>{const d=draft[orient()]?.[selected];if(d){d.opacity=Number(e.target.value)/100;$('dz45-opacity-val').textContent=e.target.value+'%';apply()}});
 $('dz45-visible').addEventListener('change',e=>{const d=draft[orient()]?.[selected];if(d){d.visible=e.target.checked;apply()}});
 $('dz45-reset').addEventListener('click',()=>{draft[orient()]={};apply();fillMissing();apply();sync()});
 $('dz45-cancel').addEventListener('click',()=>close(false));
 $('dz45-save').addEventListener('click',()=>close(true));
}
function sync(){
 const el=$(selected);if(!el)return;const d=draft[orient()]?.[selected];if(!d)return;
 $('dz45-control').value=selected;$('dz45-size').value=String(Math.round(d.size*20)*5);$('dz45-size-val').textContent=Math.round(d.size*100)+'%';
 $('dz45-opacity').value=String(Math.round(d.opacity*100));$('dz45-opacity-val').textContent=Math.round(d.opacity*100)+'%';
 $('dz45-visible').checked=d.visible!==false;$('dz45-visible').disabled=el.id.includes('stick')||el.id.includes('pause');
 $('dz45-orientation').textContent=orient()==='landscape'?'HORIZONTAL':'VERTICAL';
}
function open(){
 if(editing||!mobile())return;
 startedInMenu=!!($('mainMenu')&&!$('mainMenu').classList.contains('hidden'));
 if(startedInMenu){$('mainMenu').classList.add('hidden');const hud=$('hud');shownHud=!!hud?.classList.contains('hidden');hud?.classList.remove('hidden')}
 else if($('pauseModal')){$('pauseModal').classList.add('hidden')}
 draft=structuredClone(saved);editing=true;document.body.classList.add('dz45-editing');
 $('dz45-editor').hidden=false;
 apply();fillMissing();apply();selected=$('fire')?'fire':all()[0]?.id;sync();
}
function close(save){
 if(!editing)return;
 if(save){saved=structuredClone(draft);try{localStorage.setItem(key,JSON.stringify(saved))}catch{}}
 editing=false;drag=null;draft=null;document.body.classList.remove('dz45-editing');$('dz45-editor').hidden=true;
 if(startedInMenu){if(shownHud)$('hud')?.classList.add('hidden');$('mainMenu')?.classList.remove('hidden')}
 else $('pauseModal')?.classList.remove('hidden');
 apply();
}
function stop(e){e.preventDefault();e.stopImmediatePropagation()}
document.addEventListener('pointerdown',e=>{
 if(!editing)return;const el=e.target.closest('#movestick,#aimstick,#fire,#reload,#use,#swap,#shop,#dodge,#dz39-melee,#dz39-grenade,#dz44-pause,#pauseTouch');
 if(!el)return;
 stop(e);selected=el.id;const d=draft[orient()]?.[selected];if(!d)return;
 const r=el.getBoundingClientRect();drag={pid:e.pointerId,id:el.id,dx:e.clientX-(r.left+r.width/2),dy:e.clientY-(r.top+r.height/2)};
 el.setPointerCapture?.(e.pointerId);sync();apply();
},true);
document.addEventListener('pointermove',e=>{
 if(!editing||!drag||e.pointerId!==drag.pid)return;stop(e);const d=draft[orient()]?.[drag.id];if(!d)return;
 const el=$(drag.id),size=currentSize(el)*(d.size||1),hx=size/(2*innerWidth),hy=size/(2*innerHeight);
 d.x=clamp((e.clientX-drag.dx)/innerWidth,hx,1-hx);d.y=clamp((e.clientY-drag.dy)/innerHeight,hy,1-hy);apply();
},true);
function end(e){if(editing&&drag&&e.pointerId===drag.pid){stop(e);drag=null}}
document.addEventListener('pointerup',end,true);document.addEventListener('pointercancel',end,true);
document.addEventListener('click',e=>{if(editing&&e.target.closest('#hud .stick,#hud .tact,#dz39-melee,#dz39-grenade,#dz44-pause,#pauseTouch'))stop(e)},true);
function ensureButton(parent,id,label){
 if(!parent||$(id))return;const b=document.createElement('button');b.type='button';b.id=id;b.className='btn dz45-launch';b.textContent=label;b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open()});parent.append(b);
}
function init(){
 if(!mobile())return;
 layoutPanel();
 const menu=$('mainMenu')?.querySelector('.buttons')||$('mainMenu'),pause=$('pauseModal')?.querySelector('.buttons')||$('pauseModal');
 ensureButton(menu,'dz45-menu','🎮 PERSONALIZAR HUD');
 ensureButton(pause,'dz45-pause-menu','🎮 EDITAR CONTROLES');
 // Reuse existing controls editor buttons if they exist.
 for(const id of ['editControlsMenu','editControlsPause'])if($(id)){
  $(id).classList.remove('touchOption');$(id).style.setProperty('display','inline-flex','important');
  $(id).addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();open()},true);
 }
 const quick=document.createElement('button');quick.id='dz45-quick';quick.textContent='⚙ HUD';quick.hidden=true;
 quick.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const pause=$('dz44-pause')||$('pauseTouch');pause?.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:999}));open()});
 document.body.append(quick);
 function refresh(){quick.hidden=editing||!$('hud')||$('hud').classList.contains('hidden')||!$('pauseModal')?.classList.contains('hidden');apply()}
 const obs=new MutationObserver(refresh);for(const id of ['hud','pauseModal'])if($(id))obs.observe($(id),{attributes:true,attributeFilter:['class']});
 window.addEventListener('resize',()=>{if(editing){drag=null;fillMissing();sync()}refresh()},{passive:true});
 window.addEventListener('orientationchange',()=>setTimeout(refresh,200));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)drag=null});
 refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();