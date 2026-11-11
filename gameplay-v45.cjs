'use strict';
const fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'index.html');let html=fs.readFileSync(file,'utf8');
if(html.includes('DEAD_ZONE_PATCH_45')){console.log('v4.5 already applied');}else{
 if(!html.includes('</head>')||!html.includes('</body>'))throw Error('v4.5 document anchors missing');
 html=html.replace('</head>','<link rel="stylesheet" href="/custom-hud-v45.css"></head>');
 html=html.replace('</body>','<script src="/custom-hud-v45.js" defer></script></body>');
 fs.writeFileSync(file,html);console.log('DEAD_ZONE_PATCH_45 independent mobile HUD editor installed');
}
