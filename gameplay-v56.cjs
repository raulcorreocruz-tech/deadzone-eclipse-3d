'use strict';const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'index.html');
let h=fs.readFileSync(file,'utf8');
if(h.includes('DEAD_ZONE_PATCH_56')){console.log('v5.6 already installed')}else{
function once(a,b,label){const n=h.split(a).length-1;if(n!==1)throw Error('v5.6 '+label+' anchor '+n);h=h.replace(a,b)}
once('function dzGun(){',"\n// DEAD_ZONE_PATCH_56: lightweight impact material cues and ballistic arc for paper/stone.\nconst DZ56={lastImpact:0};\nfunction dz56ImpactFx(b,z){\n if(!z?.figure||!playing)return;\n const now=gameTime;\n if(now-(z.userDataImpactAt||0)<(MOBILE_MODE?.13:.075))return;\n z.userDataImpactAt=now;\n const p=b.kind;\n const color=p==='Lanzaperiódicos'?0xded4aa:p==='Lanzallamas'?0xff8522:p==='Rayos eléctricos'?0x92e9ff:p==='Arma de hielo'?0x9cecff:p==='Cañón de gravedad'?0xb49dfa:0x9e6250;\n const count=MOBILE_MODE?2:4;\n if(p==='Lanzaperiódicos'||p==='Lanzallamas'||p==='Rayos eléctricos'||p==='Arma de hielo'||p==='Cañón de gravedad'){\n  if(particles.length>(MOBILE_MODE?70:180))return;\n  for(let i=0;i<count;i++)particle(z.x+rnd(-.16,.16),1.2+rnd(-.35,.35),z.z+rnd(-.16,.16),color,.055+rnd(0,.07),.15+rnd(0,.23),1.7+rnd(0,1.5));\n }\n if(!coop.guest&&z.hp>0&&(p==='Cañón de gravedad'||p==='Lanzaperiódicos')){\n  const mass=Math.max(.8,z.size*z.size);\n  const force=Math.min(8,(p==='Cañón de gravedad'?6:2.5)/mass);\n  z.kx=(z.kx||0)+b.dx*force;z.kz=(z.kz||0)+b.dz*force;\n }\n}\n\nfunction dzGun(){",'impact effects runtime');
once('b.ttl-=dt;b.x+=b.dx*dz54BulletSpeed(b)*dt;','b.ttl-=dt;b.dz56Age=(b.dz56Age||0)+dt;b.x+=b.dx*dz54BulletSpeed(b)*dt;','ballistic age');
once('b.mesh.position.set(b.x,1.48,b.z);dz54BulletStep(b,dt);',
"b.mesh.position.set(b.x,Math.max(.16,1.48-(b.kind==='Lanzaperiódicos'?.7:b.kind==='Tirachinas'?1.1:0)*b.dz56Age*b.dz56Age*9),b.z);dz54BulletStep(b,dt);",'paper/stone gravity');
once('if(D(b,z)<.55*z.size+.25){if(!coop.guest)hitEnemy(z,b.damage);',
"if(D(b,z)<.55*z.size+.25){dz56ImpactFx(b,z);if(!coop.guest)hitEnemy(z,b.damage);",'material specific hit feedback');
h=h.replace('</head>','<!-- DEAD_ZONE_PATCH_56 --></head>');
fs.writeFileSync(file,h);console.log('DEAD ZONE v5.6 visual impact material, subtle projectile gravity and body impulse');
}
