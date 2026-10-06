# Retromanía Studio Web — Historial de cambios

## Puka-ready v6 — Hero independiente y footer social
- Inicio toma el Hero únicamente de la noticia reciente marcada con `hero: true`.
- `destacada: true` queda independiente y sirve para priorizar esa noticia en el bloque Novedades.
- El Hero sigue reutilizando la misma imagen, título, contenido y enlace de la noticia; no requiere activos adicionales.
- Se mantiene compatibilidad con `principal: true` para JSON publicados por versiones anteriores de Puka.
- Los botones de redes sociales del footer usan fondo blanco, borde discreto y mejor contraste sobre el footer oscuro.
- Los dos accesos de Facebook se mantienen porque corresponden a destinos distintos: Página y Grupo.

## Puka-ready v5 — precios y variantes de coleccionables
- Las colecciones con venta por **SET** muestran versiones disponibles y precio a nivel de colección.
- Las colecciones con **venta individual** muestran productos y sus variantes/precios dentro de cada integrante.
- Una colección con ambos modos puede mostrar ambos bloques simultáneamente.
- Solo se renderizan variantes marcadas como disponibles por Puka.
- Se agrega diseño responsivo para las filas de acabado, disponibilidad y precio.
- No se incluyen ni reemplazan los JSON de datos del sitio: Puka los regenera mediante `COLECCIONES → LOCAL`.

## Puka-ready v3
- Hero de Inicio compactado para funcionar como destacado y no como portada de pantalla completa.
- Altura máxima reducida en escritorio y móvil.
- Tipografía del título reducida para evitar cortes excesivos en nombres largos como HORRORWAVE 1.
- Menor padding y separación vertical en descripción y acciones.


## 2026-10-05 — Integración Puka Hero / Agenda
- El Hero puede salir directamente de la noticia reciente marcada con `principal: true`.
- Si Puka publica el campo `principal` y ninguna noticia está marcada, no se reutiliza un Hero antiguo de `sitio.json`.
- Se mantienen los datos de `sitio.json` como compatibilidad para publicaciones anteriores.
- Agenda consume `calendario.json` y ahora soporta `tipo`, `estado`, `enlace`, `imagen`, fecha inicial y fecha final.
- La portada muestra hasta tres entradas de Agenda.
- La navegación pública cambia de “PRÓXIMAMENTE” a “AGENDA”, conservando `#proximamente` para no romper enlaces existentes.
- Se elimina Checklist de la distribución pública: vista, servicio, JSON e imagen.

## 2026-10-05 — Inicio simplificado
- Se eliminó el bloque de bienvenida redundante de la página de Inicio.
- Agenda dejó de ser una opción de navegación/página independiente.
- Agenda permanece como sección de la página de Inicio alimentada por `data/calendario.json`.
- Se eliminó el enlace “VER AGENDA” del bloque de Agenda.

## v6.1 - 2026-10-06
- Corregido el Hero de Inicio para usar la imagen de la noticia mediante un elemento `<img>` real, igual que las tarjetas de noticias.
- Se elimina la dependencia de una variable CSS con `url(...)` para la imagen del Hero.
- La ruta `./img/noticias/...` se interpreta ahora por el navegador exactamente como en Novedades.

## Puka-ready v6.2 — Legibilidad del Hero
- La imagen reutilizada desde la noticia se mantiene como fondo del Hero, sin crear un segundo activo.
- Se aplica difuminado suave, reducción de brillo y saturación moderada únicamente dentro del Hero.
- Se refuerza el degradado oscuro de izquierda a derecha para priorizar título, extracto y botón sin ocultar por completo la imagen.
- Las imágenes de las noticias fuera del Hero no cambian.
