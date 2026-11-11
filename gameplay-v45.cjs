'use strict';
const fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'index.html');let html=fs.readFileSync(file,'utf8');
if(html.includes('DEAD_ZONE_PATCH_45_INLINE')){console.log('HUD inline already installed')}else{
 const js=fs.readFileSync(path.join(__dirname,'custom-hud-v45.js'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'custom-hud-v45.css'),'utf8');
 if(!html.includes('</head>')||!html.includes('</body>'))throw Error('Missing document anchors');
 // Inline both resources: server may serve only extracted/base files, never depend on static .js URLs.
 html=html.replace('</head>','<style id="dz45-style">'+css+'</style></head>');
 html=html.replace('</body>','<script id="dz45-runtime">'+js+'</script><!-- DEAD_ZONE_PATCH_45_INLINE --></body>');
 fs.writeFileSync(file,html);
 console.log('DEAD_ZONE_PATCH_45_INLINE editor and CSS embedded in game document');
}
