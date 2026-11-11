# DEAD ZONE: ECLIPSE 3D

Juego 3D de supervivencia zombi con móvil Android y navegador compartiendo servidor.

## Jugar

**Web y juego online:** https://deadzone-eclipse-coop.onrender.com/

**APK nativa:** https://github.com/raulcorreocruz-tech/deadzone-eclipse-3d/releases/download/android-v3.8.0/DeadZone-Eclipse-Android-v3.8.apk

La APK contiene un WebView que abre la URL de Render, por lo que las actualizaciones web desplegadas llegan a la aplicación sin recompilar la APK. La versión del contenedor Android sigue siendo 3.8; el juego web tiene versión 4.3. Esto no garantiza actualizaciones automáticas del APK nativo.

## Versión 4.3

- Corrección de modelos de zombi demasiado pequeños: normalización de altura y retorno al modelo de reserva si hay medidas inválidas.
- Nuevo menú **SELECCIONAR SKIN** con seis atuendos persistentes en el dispositivo.
- Nuevo menú **NOVEDADES** con cambios de las últimas versiones; indicador visible de versión.
- Prueba de navegador móvil en Chromium para verificar la interacción con ambas pantallas.

### Contenido de la versión 4.2

- 18 modelos GLB para categorías de armas de fuego y 3 modelos GLB para armas cuerpo a cuerpo (CC0).
- Balas con geometría lathe de latón y punta cobriza, sin fogonazos gigantes en su trayectoria.
- Rutas de movimiento mediante campo de distancias con puertas y evasión local de obstáculos.
- Enemigos con física cinemática de caída, retroceso y desaparición controlada de cadáveres.
- Cinco modelos animados de criaturas con esqueleto y clips Idle / Walk / Run / Attack / Hit / Death.
- Nuevos modelos GLB para perros y coche.
- Caja aleatoria, granadas, melee, mejoras Pack-a-Punch y rachas conservadas.
- Hasta cuatro clientes cooperativos por WebSocket (servidor anfitrión de oleadas, no arquitectura plenamente autoritativa).

### Rendimiento móvil

Para móviles Android como Xiaomi 13T Pro se aplican presupuestos: dos enemigos riggeados en calidad automática, cinco en Alta y cero en Baja. El resto emplea geometría ligera; cadáveres visibles: máximo cinco. En PC se permiten hasta 15 enemigos riggeados y 12 cadáveres. La calidad se ajusta desde el menú del juego.

### Limitaciones conocidas

- Los modelos son estilizados y CC0, no réplicas fotorrealistas individuales de todas las armas comerciales.
- Caídas con física cinemática y clip de muerte, **no ragdoll físico por articulación**.
- No se ha realizado prueba física de FPS ni renderizado en un Xiaomi 13T Pro.
- La prueba automatizada de cuatro clientes WebSocket no sustituye una partida de cuatro personas desde dispositivos reales.
- La publicación de Render debe comprobarse por separado de la compilación del repositorio.

## Desarrollo y construcción

`npm install` y `npm run build` descargan y extraen el juego base, aplican los parches v3.9–v4.2 e incorporan los modelos 3D CC0. Después, `npm start` sirve el juego y `/ws`.

`.github/workflows/verify-game-v4.yml` valida los 29 GLB, sintaxis JavaScript, arranque del servidor y sesiones WebSocket simuladas de cuatro clientes. `.github/workflows/check-live-v4.yml` comprueba que el entorno público sirva la versión nueva.

Licencias y fuentes de los modelos: [ASSET-LICENSES-v4.md](./ASSET-LICENSES-v4.md).
