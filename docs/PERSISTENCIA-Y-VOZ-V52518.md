# Persistencia y publicación de Dead Zone v5.25.18

## Estado de producción
Render sirve actualmente la rama main desde un servicio web **Free**, sin disco persistente. Los archivos `deadzone-social.json` (usuarios, contraseñas derivadas con scrypt, sesiones, amistades e invitaciones) y `leaderboard.json` (partidas) se encuentran en su sistema de archivos efímero. **Los datos se pueden perder en cualquier despliegue o reinicio del servicio.** No prometer cuentas de por vida con ese plan.

## Preparación de v5.25.18
Se ha añadido `DZ_DATA_DIR` en el backend para poder migrar ambos archivos a un volumen duradero, sin introducir credenciales en el código. La prueba CI con `DZ_DATA_DIR` ha validado registro, inicio de sesión, amistades y cuatro partidas conservadas tras reiniciar el proceso con la misma carpeta. Esto NO prueba persistencia en Render Free ni en despliegues físicos.

## Implantar con almacenamiento duradero
1. Elegir un plan de Render compatible con disco persistente y evaluar su precio antes de actualizar. **No realizar upgrades ni activar costes sin aprobación expresa.**
2. Crear y montar un disco persistente (por ejemplo en `/var/data`) en el mismo servicio Render.
3. Configurar la variable de entorno `DZ_DATA_DIR=/var/data` en Render. No guardar contraseñas, hashes de sesión ni datos personales en el repositorio Git.
4. **Antes de redeplegar**, hacer una copia privada y completa de los datos actuales si es posible. El plan Free no ofrece disco; un despliegue podría borrar los datos anteriores. No activar nuevos despliegues sin considerar esta migración.
5. Una vez montado el disco, desplegar y crear dos cuentas de prueba, establecer una amistad y registrar puntuaciones de solo y cooperativo. Reiniciar el servicio (sin reemplazar ni reformatear el disco) y comprobar que los usuarios, amigos y puntos continúan disponibles. Habilitar copias de seguridad del volumen y un plan de restauración.

## Chat por voz
La voz es WebRTC punto a punto y nunca se activa sin consentimiento. Requiere HTTPS, micrófono permitido y que cada participante active `🎙 ACTIVAR CHAT DE VOZ` desde Pausa. La señalización se hace dentro de la sala con WebSocket y el chat del lobby está limitado a 280 caracteres. Los navegadores tras CG-NAT o redes restrictivas pueden requerir un servidor TURN para obtener audio estable; STUN por sí solo no garantiza conectividad.
