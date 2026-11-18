# Dead Zone: Eclipse — amigos y presencia (v5.23)

## Qué está implementado

- Cuentas separadas del nombre visible del superviviente: usuario 3–16 caracteres, contraseña ≥10 caracteres; hashing con scrypt y sal aleatoria.
- Sesiones con tokens aleatorios, validados en el servidor. El token está en almacenamiento local del navegador para permitir iniciar sesión automáticamente.
- Solicitudes de amistad por nombre exacto, aceptación/rechazo y eliminación.
- Presencia online por latido cada 18 segundos, con expiración aproximada a los 49 segundos sin actividad. Última conexión registrada por el reloj del servidor.
- Invitaciones entre amigos aceptados, con un clic para unirse al código de la sala existente. Solo el anfitrión que autenticó su sesión contra el servidor puede enviar invitaciones; caducan a los 15 minutos.
- Historial de partidas que termina en derrota completa del equipo online (servidor) o en fin de partida en solitario (datos comunicados por el dispositivo y **no certificados**).
- El panel está disponible desde el menú principal y de pausa.

## Advertencia crucial de persistencia

En este MVP, la información se guarda en `deadzone-social.json` en el filesystem del servidor, **no** en una base de datos duradera. El despliegue web actual de Render utiliza el plan free y su sistema de archivos es **efímero**: reinicios, cambios de instancia o nuevos despliegues pueden borrar usuarios, amigos, invitaciones y el historial.

**No se debe presentar esta versión como un sistema de cuentas permanente.** Antes de uso real, hay que contratar/habilitar una persistencia independiente y probar que se recuperan perfiles tras un despliegue. La variable `DZ_SOCIAL_STORE` permite apuntar el almacén JSON a una ruta de disco persistente, por ejemplo `/var/data/deadzone-social.json`, siempre que ese disco esté montado en el servicio. **Solo cambiar esta variable sin montar un disco no da persistencia.**

Alternativamente se debe migrar el almacén a una base de datos (por ejemplo, un nuevo proyecto Supabase dedicado únicamente a Dead Zone) y añadir acceso del backend por variables de entorno privadas. No reutilizar una base de datos de otros proyectos sin autorización expresa.

## Seguridad y privacidad

- Las contraseñas no se envían a los amigos ni se incluyen en las respuestas de la API. El hash y su sal solo están en el almacén del servidor.
- No se confía en nombres de personaje o puntos de partida como identidad.
- La lista de amigos y los historiales se sirven exclusivamente a la cuenta solicitante tras comprobar la sesión. Solo los amigos confirmados pueden acceder a los últimos registros compartidos.
- Comunicación HTTPS mismo origen, límite básico de peticiones, peticiones JSON acotadas y validación de acciones.
- No hay recuperación de contraseñas por correo, verificación de email ni controles de bloqueo completos: es una **versión de pruebas**, no un sistema de identidad final.

## Pruebas necesarias en dos navegadores/dispositivos

1. Registrar dos perfiles distintos e iniciar sesión.
2. Enviar solicitud de amistad, aceptarla y comprobar presencia y última conexión.
3. Crear una sala cooperativa con una de las cuentas autenticadas.
4. Usar el botón INVITAR A PARTIDA. Confirmar que la otra cuenta recibe la invitación y puede pulsar UNIRME sin introducir el código manualmente.
5. Jugar una ronda, acabar la partida y verificar el registro de historia en ambos perfiles.
6. Cerrar sesión y comprobar la última conexión desde el otro perfil.
7. Probar un reinicio o despliegue tras configurar un almacén **realmente persistente**. Sin ese paso, no dar el sistema por terminado.
8. Confirmar la interacción con controles táctiles y el cooperativo en dos móviles Android.
