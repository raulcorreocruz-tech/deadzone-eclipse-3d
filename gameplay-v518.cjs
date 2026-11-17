'use strict';
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'index.html');
let h=fs.readFileSync(file,'utf8');
if(h.includes('DEAD_ZONE_PATCH_518')){console.log('v5.18 phase 3.2 already applied')}else{
function once(a,b,name){const found=h.split(a).length-1;if(found!==1)throw Error('Phase 3.2 '+name+' expected once, found '+found);h=h.replace(a,b)}
once('function dzGun(){',"\n// DEAD_ZONE_PATCH_518 — Phase 3.2: material-aware projectile feedback, controlled knockback and damped hit/death reactions.\nconst DZ518={hits:0,impactFx:0,knockbacks:0};\nfunction dz518Impact(b,z){\n if(!z?.figure||z.hp<=0||!playing)return;\n const now=gameTime;\n // Shotgun pellets, flamethrower jets and rapid automatic weapons may hit within the same animation frame.\n // Do not create another particle cloud for every pellet.\n if(now-(z.dz518LastImpact??-10)<(MOBILE_MODE?.085:.055))return;\n z.dz518LastImpact=now;\n const dx=Number.isFinite(b.dx)?b.dx:0,dz=Number.isFinite(b.dz)?b.dz:0,dist=Math.hypot(dx,dz)||1;\n const ux=dx/dist,uz=dz/dist;\n const kind=String(b.kind||''),boss=z.kind==='elefante'||z.kind==='final',mass=Math.max(.8,(z.size||1)**2);\n const heavyweight=/Cañón de gravedad|Lanzaperiódicos|Tirachinas/i.test(kind);\n const force=boss?0:Math.min(1.6,(heavyweight?1.2:.48)/mass);\n if(!coop.guest&&force>0){\n  z.kx=Math.max(-9,Math.min(9,(z.kx||0)+ux*force));\n  z.kz=Math.max(-9,Math.min(9,(z.kz||0)+uz*force));\n  DZ518.knockbacks++;\n }\n // Lean is VISUAL ONLY; collider position and hitboxes stay unchanged.\n const side=Math.sin(Math.atan2(ux,uz)-(z.figure.rotation.y||0));\n z.dz518Lean=(Math.abs(side)>.12?Math.sign(side):ux>=0?1:-1)*Math.min(.16,(heavyweight?.145:.082)/Math.max(.9,z.size||1));\n z.dz518HitTime=.24;\n DZ518.hits++;\n const cap=MOBILE_MODE?65:155;if(particles.length>=cap)return;\n // Debris color and intensity vary per physical / elemental shot. Shared particle pool avoids new meshes.\n const elemental=/Lanzallamas|Rayos eléctricos|Arma de hielo|Cañón de gravedad/i.test(kind);\n const news=/Lanzaperiódicos/i.test(kind),ice=/Arma de hielo/i.test(kind),lightning=/Rayos eléctricos/i.test(kind),fire=/Lanzallamas/i.test(kind);\n const color=ice?0x9deeff:lightning?0xc4f7ff:fire?0xffa047:news?0xdcd0a4:elemental?0xb9a5ef:0xa83d43;\n const num=MOBILE_MODE?(elemental?1:2):(elemental?2:4);\n for(let i=0;i<num&&particles.length<cap;i++){\n  particle(z.x+ux*.23+rnd(-.12,.12),1.15+rnd(-.28,.32),z.z+uz*.23+rnd(-.12,.12),color,.045+rnd(0,.055),.13+rnd(0,.18),1.25+rnd(0,1.6));\n  DZ518.impactFx++;\n }\n}\nfunction dz518ZombiePose(z,dt){\n if(!z?.figure)return;\n const remaining=Math.max(0,(z.dz518HitTime||0)-dt);z.dz518HitTime=remaining;\n const target=remaining>0?(z.dz518Lean||0)*Math.sin(Math.PI*remaining/.24):0;\n z.figure.rotation.z+=(target-z.figure.rotation.z)*Math.min(1,dt*(remaining>0?17:9));\n if(remaining===0&&Math.abs(z.figure.rotation.z)<.003)z.figure.rotation.z=0;\n}\nfunction dz518CorpseBounce(c){\n // One small, fast-damped rebound before the corpse settles; never alter zombie scales or collisions.\n const impulse=Math.min(1,Math.hypot(c.vx||0,c.vz||0)/3);\n return Math.sin(c.t*16)*Math.exp(-c.t*7)*(.045+.07*impulse);\n}\n"+'\nfunction dzGun(){','install physics and animation runtime');
once('dz56ImpactFx(b,z);if(!coop.guest)hitEnemy(z,b.damage);',
     'dz56ImpactFx(b,z);dz518Impact(b,z);if(!coop.guest)hitEnemy(z,b.damage);',
     'connect every bullet impact to feedback');
once('if(z.hit>0)z.figure.rotation.x=-Math.min(.18,z.hit*.7);',
     'if(z.hit>0)z.figure.rotation.x=-Math.min(.18,z.hit*.7);dz518ZombiePose(z,dt);',
     'visual hit pose while maintaining stable model scales');
once('c.mesh.rotation.x=fall*1.12;c.mesh.rotation.z=fall*c.side*.68;',
     'c.mesh.rotation.x=fall*1.12;c.mesh.rotation.z=fall*c.side*.68;',
     'preserve existing corpse tumbling');
once('c.mesh.position.set(c.x,.05+fall*.27,c.z);',
     'c.mesh.position.set(c.x,.05+fall*.27+dz518CorpseBounce(c),c.z);',
     'give corpses a gentle collision landing');
h=h.replace('</head>','<!-- DEAD_ZONE_PATCH_518: Phase 3.2 impacts, directional knockback, hit reactions and death settling --></head>');
fs.writeFileSync(file,h);
console.log('DEAD ZONE 5.18 Phase 3.2: projectile material feedback, safe kinetic hit reactions and corpse settling');
}
