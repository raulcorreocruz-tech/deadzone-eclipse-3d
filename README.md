# Dead Zone: Eclipse 3D

Juego 3D de supervivencia zombi con versiones web y móvil PWA sincronizadas desde una sola fuente de código.

## Publicación automática

Cada cambio fusionado en `main` ejecuta `.github/workflows/deploy.yml` para actualizar la web mediante GitHub Pages. Una PWA instalada desde esa web usa la misma versión y obtiene las mejoras al volver a abrirla con conexión.

**Configuración inicial del propietario (una sola vez):** entra en GitHub > Settings > Pages > Build and deployment > Source > **GitHub Actions**. Comprueba el resultado en la pestaña Actions.

La URL prevista, una vez se active Pages, es: https://raulcorreocruz-tech.github.io/deadzone-eclipse-3d/

En Chrome Android visita la web, abre el menú (⋮) y pulsa *Instalar aplicación* o *Añadir a pantalla de inicio*, según el navegador.

### Importante

- Esta instalación es una **PWA** (aplicación web), no un APK ni una app publicada en Google Play.
- Los contenidos externos como Three.js necesitan conexión, por lo que no se garantiza jugar sin internet.
- GitHub Pages solo sirve la web estática. El leaderboard global y multijugador que requieren servidor tienen que desplegarse por separado.
- Los nuevos cambios en los archivos descargados en ChatGPT no se publican por sí solos: para actualizar la web y la PWA, hay que guardar los cambios en este repositorio, rama `main`.

## Versión

2.5: editor de controles táctiles y mejoras previas del juego. Base inicial para publicación continua.
