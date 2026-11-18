# Verificación de publicación · Dead Zone v5.25.18

Fecha: 18 de noviembre de 2026.

- Render: servicio deadzone-eclipse-coop, despliegue automático de la rama main, plan Free sin incrementos de coste.
- Supabase: proyecto independiente deadzone-eclipse-persistent (eu-west-1), organización Free. Coste de creación confirmado: 0 €/mes.
- Código: v5.25.18, HUD reducido, salas en vivo, historial de 34 versiones, chat lobby y señalización de voz.
- Producción: build 5.25.18-5d49f4e19733; navegador PC y móvil, OK (GitHub Actions 44343164485).
- Producción: dos altas de prueba, amistad confirmada, inicio de sesión, API de historial y estado de almacenamiento en Supabase, OK.
- Se realiza un nuevo despliegue documental para confirmar restauración de usuarios desde la base de datos tras un reinicio.
- Límites: algunas conexiones de voz precisarán TURN; no se ha probado una llamada real entre dos móviles físicos. La modalidad gratuita de Supabase puede aplicar límites de capacidad e inactividad. No se garantiza conservación ilimitada sin copias de seguridad.
- No se almacenan secretos, contraseñas ni claves de servicio en este archivo.
