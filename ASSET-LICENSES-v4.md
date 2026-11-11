# Modelos 3D externos incorporados en DEAD ZONE v4.0

Los nueve modelos GLB de las armas provienen de **FPS Asset Kit** de petroulacl, que redistribuye **Flat Guns West** (OpenGameArt, PCL) bajo licencia **CC0 1.0**.

- Repositorio de origen: https://github.com/petroulacl/fps-asset-kit
- Fuente original: https://opengameart.org/content/cc0-flat-guns-west
- Licencia: https://creativecommons.org/publicdomain/zero/1.0/
- Formato: GLB.
- Modelos: Pistol Compact, Pistol Full, SMG Compact, SMG Full, Rifle Assault, Rifle Battle, Shotgun Pump, Shotgun Auto, Sniper Rifle.
- Descarga en compilación: `setup.cjs` desde archivos GLB de origen; se copian a `assets/xxx.glb` durante el despliegue.
- Para una versión estable, los binarios se conservan en el servidor de juego mientras esté desplegado; si el origen dejase de estar disponible, la compilación avisa y conserva modelos alternativos.

**Nota:** son modelos 3D reales de terceros, estilizados y reutilizables, no representaciones fotorrealistas exactas de las armas comerciales. Los nombres originales de las armas se utilizan únicamente como estadísticas y etiquetas del juego.

Para dispositivos móviles, se cargan únicamente los GLB usados por el jugador en cada partida.

## v4.1 — arsenal ampliado (18 + 3)

- Otros nueve modelos de **Flat Guns East** de PCL (CC0) desde `petroulacl/fps-asset-kit`.
- Tres modelos de cuchillos/espadas de los packs Kenney distribuidos bajo CC0 en `Hidencod/tge-assets`.
- Los nombres de las armas comerciales del juego no equivalen a una réplica fotorrealista licenciada de cada modelo; diferentes armas pueden compartir un GLB base.

## v4.2 — enemigos animados y vehículos (8 GLB)

**Fuente:** [Gobkit, modelo CC0 rigged](https://gobkit.com/api/free) — en el manifiesto público se declaran animaciones independientes `Idle`, `Walk`, `Run`, `Attack`, `Hit`, `Death`, y licencia CC0 1.0.

- `zombie_mummy` → TombMummy (normal)
- `zombie_werewolf` → WerewolfCaptain (corredor / trepador)
- `zombie_brute` → StitchedBrute (coloso / jefe)
- `zombie_witch` → NightWitch (gritona / invocador)
- `zombie_scarecrow` → PumpkinScarecrow (tóxico)
- `survivor_soldier` → Rifleman (reserva para personajes)
- `dog_kenney` → Animal dog de Kenney Prototype Kit (CC0), vía Hidencod
- `car_kenney` → Vehicle de Kenney Prototype Kit (CC0), vía Hidencod

Las mallas se clonan mediante SkeletonUtils para conservar los esqueletos. En Android se limitan a 2 enemigos animados simultáneos en modo automático, 5 en calidad Alta y ninguno en calidad Baja. En PC, 15. Los demás siguen utilizando un modelo de respaldo ligero para mantener el rendimiento.

**Físicas de muerte:** son un sistema cinemático de desplome y deslizamiento (hasta cinco cuerpos temporales en móvil), con clip `Death` cuando el modelo lo trae. No se trata de un ragdoll articulado de físicas completas.

Este contenido es gratuito bajo las licencias referidas. La apariencia es estilizada; no son modelos AAA fotorrealistas.
