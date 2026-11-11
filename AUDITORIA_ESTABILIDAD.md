# Diagnóstico inicial — DEAD ZONE: ECLIPSE 3D
Fecha: 2026-11-11  
Rama aislada: `fix/auditoria-estabilidad-2026-11-11`  
Base (main al crear rama): `65745e7f055ce9b0d660b2171d463966aed7733f`

## 1. Arquitectura comprobada
- Motor 3D: Three.js en módulo dentro de `index.html`, generado desde un ZIP base remoto.
- Construcción: `setup.cjs` descarga el ZIP remoto, lo descomprime y ejecuta cinco parches `gameplay-v39.cjs` a `gameplay-v43.cjs`.
- Assets: 18 modelos de armas GLB, tres cuerpo a cuerpo y ocho personajes/props descargados de servidores externos durante cada build.
- Backend: `server.js` procede del ZIP, no está versionado independientemente en este repositorio. El frontend utiliza WebSocket en `/ws`.
- Android: WebView abre Render; `android-version.json` indica APK 3.8.0, mientras `package.json` indica juego 4.3.0.
- Accesos: skins de v4.3 se guardan localmente en `deadzone_skin_v43`. No hay prueba de sincronización de su apariencia en los cuatro clientes.

## 2. Hallazgos y riesgos
| Prioridad | Hallazgo | Evidencia | Acción |
|---|---|---|---|
| P0 | Builds dependientes de un ZIP remoto mutable y de parches de texto encadenados | `setup.cjs` | Congelar fuente base, registrar digest, aislar cambios |
| P0 | No se prueba tamaño 3D de enemigos tras animaciones | `verify-game-v4.yml` valida existencia de assets y sintaxis | Añadir prueba visual con límites de escala |
| P0 | `server.js` no es fuente versionada aquí | Construido al extraer ZIP | Incorporar fuente/versionado tras comparar con ZIP base |
| P1 | Motor de zombis tiene sistemas de movimiento solapados | `dzSteer`, campo de navegación v4.1 y wrappers de animación | Mantener una sola autoridad de movimiento y probar rutas |
| P1 | Los errores de assets pueden ocultarse tras modelo fallback | `dz42Load` y fallback | Registrar fallos y cubrir con checks de red |
| P1 | Las acciones cooperativas dependen del anfitrión; no hay prueba de reconciliación ni reconexión | `coopTick`, snapshots y prueba de 4 conexiones | Separar arquitectura requerida de la actual |
| P1 | Inconsistencia de versiones APK/web y cachés | `android-version.json`, `package.json` | Añadir version endpoint, encabezados cache para HTML |
| P2 | Menús skins y novedades son añadidos al HTML por parches de texto | `gameplay-v43.cjs` | Separar componentes y preparar pruebas de interfaz |
| P2 | Los modelos 3D originales pueden ser estilizados pese a llamarse 3D | Catálogo CC0 | No prometer fotorrealismo |
| P2 | No hay prueba FPS real en Xiaomi 13T Pro | Flujos CI Chromium | Medir en dispositivo real antes de garantizar FPS |

## 3. Primera ronda de correcciones
- Añadir pruebas de regresión de altura de actor, skins y menú, y red multijugador.
- Mejorar visibilidad de errores, versionado de compilación y distinción entre fallos de CI/prod.
- Mantener cambios en esta rama; no despliegue automático ni sobrescritura de `main`.

## 4. Criterios de aprobación antes de fusionar
- Construcción reproducible de base y recursos o fallo explícito con trazabilidad.
- Prueba 3D in-browser: escalas de zombis normales/especiales razonables en spawn y después de animaciones.
- Prueba de skins con persistencia después de recarga y sin errores de consola.
- Cuatro clientes WebSocket: sala, inicio, snapshots, desconexión, sin datos falsificados.
- Confirmar calidad y estabilidad de render en móvil mediante prueba física cuando esté disponible.

## 5. Lo no probado todavía
- Navegación real de todos los zombis alrededor de puertas y esquinas.
- Ragdoll verdadero con articulaciones.
- Reconexión y revivir cooperativo; servidor plenamente autoritativo.
- FPS 30/60 en hardware físico.
