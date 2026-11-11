 'use strict';
const fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'index.html');let html=fs.readFileSync(file,'utf8');
if(html.includes('DEAD_ZONE_PATCH_45')){console.log('Already patched 4.5')}else{
function change(a,b,name){const n=html.split(a).length-1;if(n!==1)throw Error('v4.5 '+name+' anchor='+n);html=html.replace(a,b)}
html=html.replaceAll('norm(value.size,.65,1.8,1)','norm(value.size,.5,2.2,1)');
html=html.replaceAll('norm(data.size,.65,1.8,1)','norm(data.size,.5,2.2,1)');
change('min="65" max="180" step="5" value="100"','min="50" max="220" step="5" value="100"','range');
change("if(DZ44.button)DZ44.button.hidden=!playing||player.dead","if(DZ44.button)DZ44.button.hidden=!playing||player.dead||document.body.classList.contains('layout-editing')",'pause visibility');
const extra = [
'// DEAD_ZONE_PATCH_45 mobile ergonomics and preset editor',
'(function(){',
' if(!touchDevice)return;',
' const panel=$(\'controlsEditor\').querySelector(\'.layoutTools\');',
' const buttons=document.createElement(\'div\');buttons.className=\'dz45-presets\';',
' const caption=document.createElement(\'strong\');caption.textContent=\'DISTRIBUCIÓN: \';buttons.append(caption);',
' const presets=[[\'comfortable\',\'CÓMODO\'],[\'compact\',\'COMPACTO\'],[\'left\',\'ZURDOS\']];',
' function preset(mode){',
'  if(!editingLayout||!draftPreferences)return;',
'  const wide=getOrientation()===\'landscape\', left=mode===\'left\', compact=mode===\'compact\';',
'  const mirror=x=>left?1-x:x, side=getOrientation();',
'  const data={movestick:[.13,wide?.81:.83,compact?1:1.32],aimstick:[.86,wide?.81:.83,compact?1:1.28],fire:[.9,wide?.45:.61,compact?1.15:1.50],reload:[.75,wide?.35:.48,1.10],use:[.72,wide?.64:.71,1.10],swap:[.60,wide?.83:.82,1.04],shop:[.32,wide?.83:.86,1],dodge:[.33,wide?.59:.63,1.15],pauseTouch:[.5,wide?.09:.17,1]};',
'  for(const [id,values] of Object.entries(data)){const [x,y,size]=values;draftPreferences[side][id]={x:id===\'pauseTouch\'?x:mirror(x),y,size,opacity:id===\'fire\'?.95:.85,visible:true}}',
'  selectedControl=\'fire\';drawTouchLayout();populateEditor();',
' }',
' for(const [id,name] of presets){const b=document.createElement(\'button\');b.type=\'button\';b.textContent=name;b.addEventListener(\'click\',()=>preset(id));buttons.append(b)}',
' panel.insertBefore(buttons,panel.querySelector(\'.layoutInputs\'));',
' const note=document.createElement(\'p\');note.textContent=\'Arrastra con el dedo. Puedes mover, escalar, ocultar y ajustar la opacidad. Se guardan diseños diferentes para móvil vertical y horizontal.\';panel.append(note);',
' const menu=$(\'editControlsMenu\'),pauseButton=$(\'editControlsPause\');',
' for(const item of [menu,pauseButton]){item.classList.remove(\'touchOption\');item.style.display=\'inline-flex\';item.style.minHeight=\'48px\'}',
' menu.textContent=\'🎮 PERSONALIZAR CONTROLES\';',
' pauseButton.textContent=\'🎮 PERSONALIZAR CONTROLES\';',
' const quick=document.createElement(\'button\');quick.id=\'dz45-edit\';quick.type=\'button\';quick.textContent=\'⚙ HUD\';quick.setAttribute(\'aria-label\',\'Editar HUD móvil\');',
' quick.addEventListener(\'pointerdown\',e=>{e.preventDefault();e.stopPropagation();if(playing&&!editingLayout){pauseGameForEditor()}});',
' document.body.appendChild(quick);',
' function pauseGameForEditor(){if($(\'pauseModal\').classList.contains(\'hidden\')){pause();}openControlsEditor()}',
' function refresh(){quick.hidden=!playing||player.dead||editingLayout||!$(\'pauseModal\').classList.contains(\'hidden\')}',
' const observer=new MutationObserver(refresh);for(const id of [\'hud\',\'pauseModal\',\'controlsEditor\'])observer.observe($(id),{attributes:true,attributeFilter:[\'class\']});',
' window.addEventListener(\'resize\',refresh,{passive:true});',
' document.addEventListener(\'visibilitychange\',()=>{if(document.hidden)resetTouchInputs()});refresh();',
'})();'
].join('\n');
change("let firePointer=null;",extra+"\nlet firePointer=null;",'editor injection');
const css = [
'/* DEAD_ZONE_PATCH_45 */',
'@media (pointer:coarse),(max-width:800px){',
' body.touch-mode #hud{--joy:clamp(99px,26dvh,140px);--tap:clamp(52px,14dvh,68px);--fire-size:clamp(76px,21dvh,104px)}',
' body.touch-mode #hud .stick{border:2px solid #cfe6f18a;background:#173447a0}',
' body.touch-mode #hud .tact{font-size:clamp(11px,2.7dvh,14px);font-weight:900;border:2px solid #b5d9ee7a}',
' body.touch-mode #hud .tact.fire{font-size:clamp(12px,3dvh,16px);box-shadow:0 0 0 5px #dd49342c,0 5px 18px #0009}',
' #dz45-edit{position:fixed;z-index:54;top:calc(env(safe-area-inset-top,0px) + 8px);left:calc(50% + 60px);min-height:44px;min-width:60px;background:#142838e8;border:1px solid #82a6b9;color:#fff;border-radius:9px;font:800 12px system-ui;touch-action:manipulation}',
' #dz45-edit[hidden]{display:none!important}',
' body.touch-mode #controlsEditor{z-index:100}',
' body.touch-mode #controlsEditor .layoutTools{width:min(690px,calc(100vw - 24px));max-height:76dvh;top:calc(env(safe-area-inset-top,0px) + 2px);padding:10px}',
' body.touch-mode #controlsEditor .layoutButtons .btn{min-height:44px;font-size:12px}',
' body.touch-mode #controlsEditor .layoutInputs label{font-size:12px}',
' body.touch-mode #controlsEditor .layoutInputs select{min-height:44px}',
' body.touch-mode #controlsEditor .layoutInputs input[type=range]{height:35px}',
' .dz45-presets{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:8px 0}',
' .dz45-presets strong{font-size:11px}',
' .dz45-presets button{min-height:40px;padding:7px 11px;border:1px solid #52748a;border-radius:8px;background:#1a384a;color:#fff;font:800 11px system-ui}',
'}',
'@media (pointer:coarse) and (orientation:portrait){body.touch-mode #hud{--joy:clamp(99px,27vw,135px);--tap:clamp(52px,14vw,65px);--fire-size:clamp(76px,20vw,96px)}body.touch-mode #controlsEditor .layoutTools{max-height:49dvh}#dz45-edit{top:calc(env(safe-area-inset-top,0px) + 48px)}}'
].join('\n');
change('</style><link rel="manifest"',css+'</style><link rel="manifest"','css');
html=html.replace('<title>DEAD ZONE · ECLIPSE 3D v4.4</title>','<title>DEAD ZONE · ECLIPSE 3D v4.5</title>');
fs.writeFileSync(file,html);console.log('DEAD ZONE v4.5 HUD controls and mobile ergonomics applied');
}
