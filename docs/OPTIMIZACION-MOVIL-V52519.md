# Dead Zone Eclipse 3D · v5.25.19 · Optimización móvil y 50 usos de armas cuerpo a cuerpo

## Combate y equilibrio
- Las **8 armas cuerpo a cuerpo** empiezan con **50 golpes útiles en total** por carga; reserva **0**.
- Cada ataque del arma cuerpo a cuerpo consume 1 golpe, incluso si no hay un zombi al alcance cuando se dispara manualmente.
- El botón de ataque cuerpo a cuerpo también consume 1 uso cuando se lleva equipada un arma de esa categoría.
- Con los modos de disparo automático no se consumen usos cuando no hay objetivos dentro del alcance real de golpe.
- Se impide recargar cuerpo a cuerpo con R para eludir el límite de 50.
- En la Tienda, para armas cuerpo a cuerpo ya poseídas con munición incompleta, aparece **Reponer 50 usos por 450 puntos**, sin acumulación por encima de 50.
- Pack-a-Punch puede restaurar hasta 50 al mejorar el arma, pero no crea reserva adicional; el daño de las mejoras sigue aplicándose.

## Fluidez / cargas GPU
- Mobile + calidad Automática: densidad de píxeles dinámica 0,55–1,05; desciende ante caída sostenida de FPS y aumenta solo tras estabilidad prolongada. La opción se puede desactivar desde Opciones.
- En calidad manual Baja/Media/Alta/Ultra se mantiene la configuración elegida.
- Animaciones GLB de zombis a distancias medias/largas se actualizan con menor frecuencia, pero la IA, colisiones, persecución y daños siguen su frecuencia normal.
- Se limitan los pasos de animación procedural de zombis lejanos, conservando el movimiento de piernas y brazos de los cercanos.
- Puntería automática móvil: búsqueda ordenada por distancia y comprobaciones de visibilidad únicamente sobre candidatos útiles, con caché de objetivo de 90 ms. Los otros dos modos mantienen su lógica anterior.
- Los sprites no se procesan en fotogramas descartados por el limitador; se reusan vectores temporales de brazos y manos para reducir recolecciones de basura.
- Las torretas eligen su objetivo cercano sin crear ni ordenar una lista de zombis en cada fotograma. El código de compañeros caninos existente se conserva donde su selector ya fue sustituido.

## Verificación
Pruebas CI en Chromium de escritorio y emulación móvil: 8 armas; 50 golpes exactos; 51.º golpe bloqueado; reposición por 450; botón cuerpo a cuerpo; no gasto automático fuera de alcance; selector adaptativo y límites de resolución; comparación de invocaciones a la comprobación de obstáculos; arranque 3D y ausencia de excepciones críticas.

En una escena sintética de 36 enemigos, las llamadas a comprobación de obstáculos de la puntería automática se redujeron de **716 a 3**. **Esto no es una medición del FPS real**: el rendimiento depende de GPU, memoria, calor del teléfono, navegador y cantidad de enemigos.

## Pasos para reproducir
1. En móvil, abrir Opciones -> Calidad Automática -> **Estabilización de FPS móvil** activa. Elegir límite 60 FPS y habilitar Mostrar FPS.
2. Comparar durante 4-6 rondas. Si el móvil se calienta o continúa con caídas, activar calidad Baja o Media y limitar a 30 FPS.
3. Para comparar rendimiento con versiones previas, utilizar mismo teléfono, modo de disparo, ronda y estado de batería. No comparar únicamente FPS en menú.
