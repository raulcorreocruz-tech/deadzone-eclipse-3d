# DEAD ZONE: ECLIPSE — Android
La app Android carga siempre el juego actualizado desde https://deadzone-eclipse-coop.onrender.com. Los cambios del juego, el mapa, los controles y el servidor se ven al reabrir la app, SIN descargar una nueva APK.

## Primera instalación
En GitHub, abre **Actions → Build DEAD ZONE Android APK → último run exitoso → Artifacts → DeadZone-Eclipse-Android-v1.0**. Descarga ZIP, extrae `app-debug.apk` e instálalo en Android. Permite instalar APK del navegador/gestor de archivos cuando lo solicite. No es Play Store.

## Actualizaciones
1. **Juego web**: automáticas al abrir la app, puesto que el cliente carga directamente Render con URL anti-caché.
2. **Instalador Android**: el cliente consulta `android-version.json` en GitHub. Si `versionCode` es superior al instalado y `apkUrl` apunta a una descarga HTTPS, muestra un aviso y abre la descarga. Android solicitará permiso del usuario; NO se pueden instalar actualizaciones en silencio.
3. **Firma**: este primer prototipo usa la firma DEBUG creada por GitHub Actions. Para publicar APK nativas sucesivas instalables encima de la anterior sin desinstalar, hay que configurar una firma de release persistente y privada. No publiques el keystore ni claves en un repositorio público. Si se cambian firmas, Android exigirá desinstalar la versión anterior (con pérdida de datos locales si no se exportan).
4. La APK necesita **Internet**, **Android 8+** y WebView actualizado.

## Detalles
- App: com.deadzone.eclipse, versión 1.0.0, versión de Android 26–35
- Orientación horizontal e inmersiva, WebGL acelerado
- Reconexión táctil si falla el servidor
- No recopila permisos de cámara, micrófono ni almacenamiento
- Servidor online: Render (puede tardar en arrancar en modo gratuito)

## Cómo generar una release firmada más adelante
Crea una clave de firma en almacenamiento privado y configúrala como secreto de CI (no dentro del repo). Distribuye únicamente APK firmadas con ESA MISMA clave en todas las actualizaciones. Al subir un APK compatible a una URL HTTPS, actualiza versionCode, apkUrl y message en `android-version.json`.
