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
