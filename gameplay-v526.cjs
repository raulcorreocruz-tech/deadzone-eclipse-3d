'use strict';
// DEAD_ZONE_PATCH_526: graphics settings are available before the 3D module can load.
const fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'index.html');
let html=fs.readFileSync(file,'utf8');
if(html.includes('DEAD_ZONE_PATCH_526')){console.log('Dead Zone pregame settings already present');}
else{
 const preflight=String.raw`<script id="dz526-preboot">
(function(){
'use strict';
window.__dz526LastError='';
function logError(message){
 const value=String(message||'Error desconocido').replace(/\s+/g,' ').slice(0,230);
 window.__dz526LastError=value;
}
window.addEventListener('error',function(e){if(e.message)logError(e.message);},true);
window.addEventListener('unhandledrejection',function(e){logError(e.reason&&e.reason.message?e.reason.message:e.reason);},true);
function boot(){
 const menu=document.getElementById('mainMenu');
 const actions=menu&&menu.querySelector('.buttons');
 if(!actions||document.getElementById('dz526-prestart-graphics'))return;
 const nativeMenuButton=document.getElementById('dz524-graphics-menu');
 if(nativeMenuButton)nativeMenuButton.style.display='none';
 const btn=document.createElement('button');btn.type='button';btn.className='btn';btn.id='dz526-prestart-graphics';
 btn.textContent='⚙ AJUSTES GRÁFICOS · ANTES DE JUGAR';
 actions.insertBefore(btn,document.getElementById('start'));
 const overlay=document.createElement('div');overlay.id='dz526-settings';overlay.className='dz526-overlay';overlay.hidden=true;
 const content=document.createElement('section');content.className='dz526-card';content.setAttribute('role','dialog');content.setAttribute('aria-modal','true');content.setAttribute('aria-label','Ajustes gráficos antes de iniciar');
 const heading=document.createElement('h2');heading.textContent='⚙ AJUSTES GRÁFICOS';
 const intro=document.createElement('p');intro.textContent='Configura el rendimiento antes de iniciar la partida. Los ajustes se guardan en este dispositivo y se aplican al recargar el juego.';
 content.append(heading,intro);
 let saved={};try{saved=JSON.parse(localStorage.getItem('dz524_video_settings')||'{}')}catch{}
 function getStorage(key,fallback){try{return localStorage.getItem(key)||fallback}catch{return fallback}}
 function optionRow(labelText,control,hint){
  const label=document.createElement('label');label.className='dz526-row';
  const span=document.createElement('span');span.textContent=labelText;label.append(span,control);
  if(hint){const small=document.createElement('small');small.textContent=hint;label.append(small)}
  content.append(label);return control;
 }
 function createSelect(items,current){
  const sel=document.createElement('select');sel.className='dz526-input';
  items.forEach(([value,label])=>{const opt=document.createElement('option');opt.value=value;opt.textContent=label;sel.append(opt)});
  if([...sel.options].some(o=>o.value===String(current)))sel.value=String(current);
  return sel;
 }
 const quality=optionRow('Calidad gráfica',createSelect([['auto','Automática'],['low','Baja · más fluidez'],['medium','Media'],['high','Alta'],['ultra','Ultra · exigente']],getStorage('dz_quality','auto')),'Para diagnosticar fallos en Android, prueba Baja.');
 const fps=optionRow('Límite de FPS',createSelect([['30','30 FPS'],['60','60 FPS'],['120','120 FPS'],['144','144 FPS']],saved.frameCap||60));
 const scale=document.createElement('input');scale.type='range';scale.min='50';scale.max='160';scale.step='5';scale.value=String(saved.resolution||100);
 const scaleStatus=document.createElement('output');scaleStatus.textContent=scale.value+' %';scale.addEventListener('input',()=>scaleStatus.textContent=scale.value+' %');
 const scaleBox=document.createElement('div');scaleBox.className='dz526-scale';scaleBox.append(scale,scaleStatus);
 optionRow('Resolución de renderizado',scaleBox,'Reduce a 50–75 % si el móvil va justo.');
 const shadows=optionRow('Sombras',createSelect([['auto','Automáticas'],['off','Desactivadas'],['on','Activadas']],saved.shadows||'auto'));
 const showFps=document.createElement('input');showFps.type='checkbox';showFps.checked=!!saved.showFps;optionRow('Mostrar contador de FPS',showFps);
 const safe=document.createElement('input');safe.type='checkbox';safe.checked=getStorage('dz_safe_gpu','1')!=='0';optionRow('Modo GPU estable',safe,'Recomendado si tienes problemas para iniciar en móvil.');
 const footer=document.createElement('div');footer.className='dz526-actions';
 const close=document.createElement('button');close.className='btn';close.type='button';close.textContent='CANCELAR';
 const save=document.createElement('button');save.className='btn main';save.type='button';save.textContent='GUARDAR Y APLICAR';
 footer.append(close,save);content.append(footer);overlay.append(content);document.body.append(overlay);
 const nativeObserver=new MutationObserver(()=>{const other=document.getElementById('dz524-graphics-menu');if(other&&other.style.display!=='none')other.style.display='none'});
 nativeObserver.observe(actions,{childList:true});
 function hide(){overlay.hidden=true}function show(){overlay.hidden=false}
 close.addEventListener('click',hide);
 overlay.addEventListener('click',e=>{if(e.target===overlay)hide()});
 btn.addEventListener('click',show);
 save.addEventListener('click',()=>{
  try{
   localStorage.setItem('dz_quality',quality.value);
   localStorage.setItem('dz_safe_gpu',safe.checked?'1':'0');
   localStorage.setItem('dz524_video_settings',JSON.stringify({frameCap:Number(fps.value),showFps:showFps.checked,resolution:Number(scale.value),shadows:shadows.value}));
  }catch(err){console.warn('No se han podido guardar los ajustes',err)}
  hide();window.location.reload();
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
</script>`;
 const css=String.raw`<style id="dz526-css">
.dz526-overlay[hidden]{display:none!important}.dz526-overlay{position:fixed;inset:0;z-index:100000;background:#06111de8;display:flex;align-items:center;justify-content:center;padding:14px;overflow:auto;box-sizing:border-box}
.dz526-card{box-sizing:border-box;width:min(620px,96vw);max-height:92dvh;overflow:auto;background:#142634;color:#f0f7ff;border:1px solid #587c97;border-radius:14px;padding:18px;box-shadow:0 18px 55px #000b;font:14px/1.45 system-ui}
.dz526-card h2{font-size:clamp(19px,4vw,24px);margin:0 0 8px}.dz526-card p{color:#bfd0de;font-size:12px;margin:0 0 12px}
.dz526-row{display:grid;grid-template-columns:minmax(145px,1fr) minmax(120px,180px);gap:8px;align-items:center;padding:9px 0;border-bottom:1px solid #315169}.dz526-row small{grid-column:1/-1;color:#a6c3da;font-size:11px}
.dz526-input{min-height:40px;border:1px solid #567c96;border-radius:7px;background:#0c1c2a;color:#fff;padding:7px;max-width:100%}.dz526-scale{display:flex;gap:8px;align-items:center}.dz526-scale input{min-width:80px;width:115px;max-width:100%}.dz526-scale output{color:#d3eefa;white-space:nowrap}.dz526-actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end;margin-top:15px}
#dz526-prestart-graphics{border-color:#97c3cf;background:#1a3d4b}
@media(max-width:550px){.dz526-row{grid-template-columns:1fr}.dz526-card{padding:12px}}
</style>`;
 const current="feedback('No se ha iniciado. Consulta el diagnóstico del motor y vuelve a pulsar Iniciar; si falla, utiliza Calidad BAJA y recarga.',true);";
 const improved="feedback(window.__dz526LastError?'Error del motor: '+window.__dz526LastError:'No se ha iniciado. Abre Ajustes gráficos, elige BAJA y reinicia; si continúa, revisa el error técnico.',true);";
 if(html.split(current).length!==2)throw Error('Expected prior delayed-start diagnostic from v5.25 exactly once');
 html=html.replace(current,improved);
 // A patch may add this alias near dzGun(), after initial mobile settings read it.
 // Desktop short-circuits the reference; Android throws a TDZ ReferenceError.
 // Move its one declaration immediately after Three.js import, before any mobile setup.
 const tag='<script type="module">';
 const moduleStart=html.indexOf(tag);
 const moduleEnd=html.indexOf('</script>',moduleStart);
 if(moduleStart<0||moduleEnd<=moduleStart)throw Error('Cannot locate game module for lowMemory repair');
 let moduleCode=html.slice(moduleStart+tag.length,moduleEnd);
 const memoryDefs=[...moduleCode.matchAll(/\b(?:const|let|var)\s+lowMemory\s*=\s*[^;\n]+;/g)];
 if(memoryDefs.length!==1)throw Error('Expected exactly one lowMemory declaration, got '+memoryDefs.length);
 const declaration=memoryDefs[0][0];
 moduleCode=moduleCode.replace(declaration,'');
 const import3d=/import\s+\*\s+as\s+THREE\s+from\s+['"][^'"]+['"];\s*/.exec(moduleCode);
 if(!import3d)throw Error('Cannot insert early lowMemory declaration: 3D import missing');
 moduleCode=moduleCode.replace(import3d[0],import3d[0]+'\n'+declaration+'\n');
 const firstMemory=moduleCode.indexOf('lowMemory');
 const earlyMemory=/\b(?:const|let|var)\s+lowMemory\s*=/.exec(moduleCode);
 if(!earlyMemory||firstMemory!==earlyMemory.index+earlyMemory[0].indexOf('lowMemory'))
  throw Error('lowMemory is still accessed before initialization');
 html=html.slice(0,moduleStart+tag.length)+moduleCode+html.slice(moduleEnd);
 if(html.split('</head>').length!==2)throw Error('Missing head location for preboot settings');
 html=html.replace('</head>',preflight+css+'<!-- DEAD_ZONE_PATCH_526 --></head>');
 fs.writeFileSync(file,html);
 console.log('DEAD ZONE v5.25.6: graphics menu works independently of WebGL; startup errors retained instead of generic alert');
}
