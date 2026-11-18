# Persistencia y voz · Dead Zone v5.25.18

## Arquitectura de almacenamiento
- Proyecto Supabase independiente: `deadzone-eclipse-persistent` (`jqekjjejgmgpxjlfinxv`, región `eu-west-1`), organización Free con coste **0 €/mes** confirmado por Supabase al crearlo.
- `deadzone_private.store`: dos snapshots JSONB (`users` y `scores`) con revisionado CAS (compare-and-swap); RLS activo, sin políticas de acceso directo para roles públicos.
- `deadzone_private.credentials`: hash SHA-256 de un secreto de 384 bits. El secreto real **nunca se publica en GitHub ni en el navegador**.
- Funciones API `public.deadzone_cloud_read` y `public.deadzone_cloud_write`, ejecutables solo por el rol `anon` y con comprobación obligatoria de un secreto servidor de alta entropía. El asesor de seguridad de Supabase advierte de forma esperada sobre los SECURITY DEFINER accesibles a anon; la verificación del secreto es imprescindible. Revisar este diseño periódicamente.
- Las claves de Supabase se proporcionan únicamente mediante variables de entorno de Render. Se utiliza una clave **anon pública** (no service_role) más un secreto backend independiente.
- `cloud-start.cjs` lee la base antes de iniciar Node y **se niega a levantar producción** si la base configurada no responde. Esto evita que los reinicios creen una cuenta o marcador temporal vacío.
- `server-v539.cjs` sincroniza cada cambio de cuentas/amigos y partidas; las operaciones HTTP sociales se confirman tras recibir el OK de Supabase. Se conserva un archivo temporal local para compatibilidad con el motor existente. Al reiniciar se restaura desde Supabase.

## Variables de entorno en Render
`DZ_SUPABASE_URL`, `DZ_SUPABASE_ANON_KEY`, `DZ_SUPABASE_PERSIST_SECRET`.
No documentar ni compartir los valores secretos, nunca ponerlos en el código. `DZ_DATA_DIR` es opcional para el caché temporal.

## Migración de datos antiguos
Antes del despliegue se consultó el leaderboard público de Render: **0 puntuaciones recuperables**. El antiguo archivo privado `deadzone-social.json` (cuentas y amistades) no dispone de una exportación autenticada accesible con las herramientas actuales; no se deben prometer migraciones de cuentas preexistentes. Los jugadores cuyos usuarios no existan en la nueva base tendrán que registrarse nuevamente. A partir de v5.25.18 los registros quedarán en Supabase.
No se garantiza conservación ilimitada sin copias de seguridad ni mantenimiento del proyecto: Supabase Free dispone de cuotas, límites de actividad y políticas del servicio.

## Voz y chat
Lobby con chat de texto de máximo 280 caracteres, separación por sala y limitación de frecuencia. Durante la partida, voz opcional WebRTC P2P: micrófono solo con permiso explícito, señalización por WebSocket y no se almacenan grabaciones. En redes NAT restrictivas es necesario implementar TURN para conectividad fiable; el proyecto incluye STUN público. Las pruebas automáticas validan señalización y privacidad por sala, **no una llamada auditiva real entre dos dispositivos físicos**.

## Pruebas
- GitHub Actions comprueba persistencia (RPC simulada y reinicio), registro, sesiones, amigos, historial individual/cooperativo, señalización WebRTC, aislamiento entre salas, PC y móvil.
- En producción: consultar `/api/storage-health`, verificar versión 5.25.18, crear cuentas de prueba, consultar RPC en Supabase y verificar persistencia tras un nuevo despliegue.
