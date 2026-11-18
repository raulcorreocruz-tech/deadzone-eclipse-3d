# Dead Zone: Eclipse 3D — Android (Fase 4.3)

Esta es una **APK de prueba / debug** para Android. Incluye una actividad WebView a pantalla completa que abre la versión web publicada de Dead Zone: Eclipse 3D.

- **Juego cargado:** https://deadzone-eclipse-coop.onrender.com/?android=1
- **No es una versión sin conexión**: tanto el juego como el cooperativo necesitan Internet.
- **Orientación:** horizontal; pantalla completa inmersiva.
- **Controles:** los dos joysticks táctiles, el HUD configurable y el resto de funciones proceden directamente de la web existente.
- **Volver de Android:** simula la tecla Escape del juego para abrir o cerrar la pausa.
- **Seguridad:** HTTPS obligatorio, solo el dominio del juego permanece dentro de la app; los enlaces a otros sitios se abren en el navegador del móvil. Sin acceso a archivos locales ni permisos de cámara/micrófono.
- **Contenido:** se actualiza desde el despliegue web; esta APK no incorpora recursos GLB ni audios para jugar sin conexión.


## Actualizaciones desde Dead Zone v5.25

Hay **dos tipos de actualización**:

1. **Contenido del juego (automático):** la APK usa una WebView con el juego hospedado en Render. Al abrirla, carga la web y el servidor de Three.js actualizados. Mientras esté abierta, comprueba en segundo plano el endpoint \`/api/release-info\` cada 90 segundos. Si aparece una nueva versión durante una partida, avisa y espera; si el usuario está en el menú principal, actualiza la página sin reinstalar la aplicación.
2. **Archivo APK nativo (generación automática, instalación manual):** GitHub Actions se ejecuta cuando cambian los parches del juego, el manifiesto, las notas de versión o el proyecto Android. \`sync-version.cjs\` alinea \`versionName\` y \`versionCode\` con \`package.json\` antes de compilar y conserva el resultado en **Actions > Artifacts**.

**Importante:** Android no permite reemplazar silenciosamente la APK instalada sin un canal de actualizaciones confiable y una firma estable. Cada compilación de debug de GitHub Actions puede firmarse con una clave diferente, por lo que al instalar otra APK de debug podría ser necesario desinstalar primero la anterior (con posible pérdida de datos locales). Para actualizaciones binaras en el mismo dispositivo sin perder datos, es necesario configurar una clave de firma persistente mediante secretos de GitHub y un sistema como Google Play In-App Updates (con confirmación del usuario).

Las novedades de cada versión residen en \`release-notes.json\`; el proceso de despliegue no permite publicar una versión sin sus notas correspondientes.

## Obtener el APK desde GitHub Actions

1. Abre la pestaña **Actions** del repositorio.
2. Abre **Build Dead Zone Android APK** y selecciona la ejecución correcta.
3. En **Artifacts**, descarga **DeadZone-Eclipse-Android-debug-APK**.
4. Extrae el ZIP para obtener \`app-debug.apk\`.
5. Instala el APK en tu dispositivo Android tras aceptar la instalación de esa procedencia, solo si confías en este repositorio.

Un APK con firma **debug** está destinado a pruebas, no a Google Play ni a distribución pública. Para una publicación posterior hay que crear una clave de firma de publicación, comprobar la política de permisos y validar rendimiento, orientación, audio y cooperativo en hardware real.

## Compilar en Android Studio

Abre la carpeta \`android-wrapper/\` como proyecto de Android Studio y ejecuta \`Build > Build APK(s)\`, con JDK 17, Android SDK 35 y conexión a Internet para descargar las dependencias.

Alternativa sin Android Studio, si tienes Java 17, Android SDK 35 y Gradle 8.9:

\`\`\`sh
gradle -p android-wrapper :app:assembleDebug
\`\`\`

El archivo se genera en \`android-wrapper/app/build/outputs/apk/debug/app-debug.apk\`.

## Verificación que falta (no dar la fase por terminada sin ella)

- [ ] Instalación y arranque en el Xiaomi 13T Pro
- [ ] Sin botones recortados en horizontal y con la pantalla completa
- [ ] Joystick izquierdo: movimiento continuo
- [ ] Joystick derecho: apuntado y disparo 360°
- [ ] Armería: compras de las cinco armas exclusivas
- [ ] Cinco golpes para caer; regeneración tras 10 s
- [ ] Rendimiento de FPS en rondas avanzadas
- [ ] Audio de armas y eventos
- [ ] Partida cooperativa entre dos móviles y reanimación
- [ ] Gestión de pérdida de conexión y retorno a la app

Este wrapper no cambia el motor de juego ni el servidor de Render.
