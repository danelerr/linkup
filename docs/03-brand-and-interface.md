# Marca y sistema de interfaz

Versión: 1.1 para MVP  
Estado de la identidad: paleta, tipografías y logotipo tomados del tablero de marca de septiembre de 2026 (D-026). El símbolo en `public/marca/` es un redibujo fiel en vector; se reemplaza por el archivo maestro de diseño cuando exista (O-003).

## Encargo de diseño

**Producto:** directorio que conecta startups con sus oportunidades en una sola exploración.
**Audiencia principal:** talento emergente de 18 a 28 años y founders que necesitan contratar.  
**Trabajo único de la página principal:** permitir encontrar y abrir una startup u oportunidad en segundos.  
**Sensación:** clara, confiable, abierta, ambiciosa y humana; joven sin ser infantil; tecnológica sin parecer una plantilla SaaS.

## Núcleo de marca

### Propósito

Hacer que el punto de partida profesional dependa menos de contactos, información dispersa o credenciales previas.

### Promesa

Encuentra dónde empezar y convierte cada experiencia en una señal para la siguiente.

### Personalidad

- Clara.
- Cercana.
- Inquieta.
- Confiable.
- Optimista con los pies en la tierra.

### Tensiones que debe sostener

- Juventud y credibilidad.
- Accesibilidad y ambición.
- Tecnología y acompañamiento humano.
- Amplitud del directorio y simplicidad de uso.

## Nombre

La escritura canónica es **LinkUp**.

No usar:

- Link UP.
- Link - Up.
- LinkUP.
- LINKUP salvo en contextos técnicos o legales que exijan mayúsculas.

Antes de registrar o invertir en una expansión regional se requiere búsqueda de marca, dominio, redes y conflictos comerciales. El sistema visual puede avanzar, pero la disponibilidad del nombre continúa como riesgo de negocio.

## Auditoría de la identidad heredada

### Conservar

- El símbolo que combina eslabón y flecha ascendente.
- El recorrido cromático de azul hacia celeste y cian.
- La asociación con crecimiento y conexión.
- El tono de posibilidad y primera oportunidad.

### Refinado en la identidad 2026

- El símbolo pasó a ser un monograma `lU`: la `l` en azul oscuro con base diagonal y la `U` que termina en una flecha ascendente.
- Wordmark oficial `LinkUp`, con `Up` en celeste, y lema `CONNECT.GROW.SUCCEED`.
- Paleta cerrada de cuatro colores y dos familias tipográficas (Lato y Raleway).

### Retirar de la interfaz

- Redes de nodos como patrón de fondo repetido.
- Grandes superficies turquesa detrás de contenido.
- Serif en mayúsculas como titular del producto.
- Emojis como iconografía de navegación.
- Gradientes en botones, texto o múltiples componentes.

Esos recursos pueden permanecer en el archivo histórico de redes; no definen el producto nuevo.

## Logotipo

Archivos en `public/marca/`:

| Archivo | Uso |
|---|---|
| `simbolo.svg` | Símbolo a color sobre fondos claros; también favicon vectorial |
| `simbolo-blanco.svg` | Símbolo invertido para fondos azul oscuro |

El lockup horizontal es el símbolo seguido del wordmark en Raleway 800: `Link` en azul oscuro y `Up` en celeste intenso; sobre azul oscuro, `Link` en blanco y `Up` en cian. Lo arma `components/brand.tsx` con texto real, para que sea nítido y accesible. Derivados rasterizados: `public/favicon.png` (64 px), `public/apple-touch-icon.png` (180 px sobre celeste claro) y `public/og.png` (1200 × 630 sobre azul oscuro).

Reglas del MVP:

- El trazo de la `U` avanza de azul hacia celeste, en sentido ascendente; la flecha siempre apunta hacia arriba.
- No rotar, deformar, recolorear por campaña ni aplicar sombra.
- No colocar el logotipo a color sobre fotografías o colores de contraste impredecible; sobre azul oscuro se usa la versión blanca.
- En navegación se prefiere símbolo más wordmark; en favicon, solo el símbolo.
- El lema `Connect · Grow · Succeed` acompaña al logotipo en el pie y en piezas de difusión, no en la navegación.
- El símbolo no sustituye indiscriminadamente flechas, botones o viñetas.

## Paleta

### Identidad

| Token | Valor | Nombre en la marca | Uso |
|---|---:|---|---|
| `navy` | `#0F3151` | Azul oscuro | Texto principal, títulos, pie y fondos oscuros |
| `teal` | `#11909D` | Celeste intenso | `Up` del wordmark, acentos gráficos y anillos |
| `cyan` | `#47B9B2` | Cian | Final de la línea Link y texto sobre azul oscuro |
| `canvas` | `#F3F5F7` | Celeste claro | Fondo principal |

### Derivados funcionales

```css
--color-ink: #0F3151;            /* = navy */
--color-action: #0D7680;         /* celeste intenso oscurecido: botón, enlace y foco */
--color-action-hover: #0B6670;
--color-action-active: #09545C;
--color-paper: #FFFFFF;
--color-surface: #E9EEF2;
--color-line: #D6DEE4;
--color-line-strong: #BCC8D0;
--color-body: #3D5468;
--color-muted: #5B6B7A;
--color-on-navy-muted: #9FB3C4;
--color-success: #147A56;
--color-warning: #946200;
--color-danger: #B42318;
```

Reglas:

- `action` es el color de acción. El celeste intenso de la marca no alcanza 4,5:1 con texto blanco (3,82:1), así que la acción usa el mismo tono oscurecido hasta cumplir AA.
- `teal` sobre fondo claro solo se usa en el wordmark, en texto grande o en elementos no textuales; `cyan` no lleva texto sobre fondos claros.
- El degradado se reserva al símbolo y al elemento firma.
- Los estados de error, advertencia y éxito conservan significados propios; no se decide solo por color.
- El fondo habitual es celeste claro, con papel blanco para agrupar contenido.
- En modo oscuro futuro, no se invierten los colores automáticamente; se diseña una paleta separada.

### Degradado canónico

```css
linear-gradient(90deg, #0F3151 0%, #11909D 55%, #47B9B2 100%)
```

No utilizar el degradado como fondo completo de página.

## Tipografía

Las dos familias de la marca se cargan con `next/font` desde Google Fonts, sin peticiones externas en tiempo de ejecución.

### Títulos y marca: Raleway

Títulos de página, de sección y de detalle, además del wordmark y el lema. Sus capitales geométricas dan el carácter de la marca; se activan las cifras alineadas (`lnum`) porque las cifras por defecto de Raleway son de estilo antiguo.

Pesos permitidos:

- 600 para títulos.
- 600 para el lema, en versalitas espaciadas.
- 800 solo para el wordmark.

### Texto, controles y datos: Lato

Cuerpo, navegación, formularios, botones y metadatos factuales (fecha de publicación, última verificación, fuente, estado corto e identificadores internos). Es una humanista muy legible en tamaños pequeños, así que una sola familia basta para contenido y datos.

Pesos permitidos:

- 400 para texto.
- 700 para controles, énfasis corto y cifras.
- 900 solo para momentos excepcionales.

### Escala

| Rol | Tamaño / interlineado | Familia y peso |
|---|---|---|
| Título de página | 34–46 / 38–51 px | Raleway 600 |
| Título de detalle | 24 / 30 px | Raleway 600 |
| Título de fila | 17 / 23 px | Lato 700 |
| Cuerpo | 16 / 24 px | Lato 400 |
| Control | 15 / 20 px | Lato 700 |
| Secundario | 14 / 20 px | Lato 400 |
| Metadata | 12 / 17 px | Lato 700, versalitas espaciadas |

En móvil, el título de página puede bajar a 28 px. El cuerpo no baja de 16 px en formularios.

## Espaciado, geometría y profundidad

### Espaciado

Escala base de 4 px:

```text
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64
```

No se crean valores arbitrarios salvo corrección óptica documentada.

### Radios

```css
--radius-control: 10px;
--radius-panel: 16px;
--radius-pill: 999px;
```

- Las filas del directorio no se convierten en tarjetas redondeadas.
- Los pills solo representan filtros o estados compactos.

### Bordes y sombras

- Separadores: 1 px `line`.
- Controles: 1 px; 2 px en foco visible.
- No se usan sombras en filas, botones o paneles normales.
- Popovers y diálogos pueden usar una sola sombra: `0 16px 40px rgb(15 49 81 / .16)`.

## Layout

- Ancho máximo general: 1120 px.
- Canal principal del listado: máximo 1000 px.
- Padding lateral: 24 px en escritorio, 16 px en móvil.
- Encabezado: 68 px en escritorio, 56 px en móvil.
- La búsqueda es el elemento más ancho y dominante de la página inicial.
- La densidad proviene de filas bien espaciadas, no de cuadrículas de tarjetas.

## Firma visual

El único gesto expresivo del producto es la **línea Link**: una línea de 2 px que avanza de azul oscuro a celeste y cian, y termina en una inclinación ascendente breve.

Usos permitidos:

- Conector entre una startup y sus oportunidades dentro de la lista unificada.
- Progreso de una postulación.
- Confirmación de evidencia verificada.
- Loader principal, respetando reducción de movimiento.

Usos prohibidos:

- Separar todas las secciones.
- Subrayar todos los enlaces.
- Dibujar redes decorativas de nodos.
- Aparecer simultáneamente en más de un punto dominante de una pantalla.

Este gesto deriva directamente de la `U` con flecha del logotipo y evita que una interfaz blanca y tipográfica sea intercambiable con cualquier directorio.

## Movimiento

- Transiciones de control: 120-160 ms.
- Apertura de panel o diálogo: máximo 200 ms.
- No hay animación ambiental o scroll reveal.
- Hover desplaza como máximo 1-2 px un icono, nunca la fila completa.
- Con `prefers-reduced-motion`, se eliminan desplazamientos y el loader usa cambio de opacidad.

## Iconografía e imágenes

- Iconos lineales de 1.75-2 px, formas simples y puntas suaves.
- Tamaños habituales: 16, 20 y 24 px.
- No mezclar familias de iconos.
- Los logotipos de startups se muestran en contenedor neutro, sin forzar recortes circulares.
- Las fotografías se usan en historias o contenido editorial futuro, no para decorar el buscador.
- No generar imágenes abstractas de personas conectadas por redes.

## Voz

### Registro

- Español claro y latinoamericano.
- Voz activa.
- Frases cortas.
- Verbos reconocibles.
- Cero grandilocuencia dentro de la interfaz.

### Vocabulario canónico

| Usar | Evitar |
|---|---|
| Buscar | Descubrir el futuro |
| Guardar | Añadir a favoritos mágicos |
| Postular | Aplicar ahora mismo |
| Ver fuente oficial | Saber más |
| Crear alerta | Activar inteligencia |
| Cerrar oportunidad | Dar de baja la oferta laboral |
| No encontramos resultados | Ups, parece que aquí no hay nada |

`Aplicar` se reserva a filtros o cambios técnicos; para una oportunidad se usa `Postular`.

### Mensajes

- Éxito: `Postulación enviada.`
- Error accionable: `No pudimos adjuntar el archivo. Usa PDF de hasta el límite indicado.`
- Oportunidad vencida: `Esta oportunidad cerró el 18 de agosto. Puedes ver otras similares.`
- Sin resultados: `No encontramos oportunidades con estos filtros. Quita uno o crea una alerta.`
- Fuente: `Comprobada en la fuente oficial hace 2 días.`

## Componentes esenciales

### Botones y enlaces

- Botón primario: fondo `action`, texto blanco, mínimo 44 px de alto; hover `action-hover`, activo `action-active`.
- Botón secundario: fondo blanco, borde `line`, texto `ink`; hover usa `surface`.
- Botón silencioso: sin contenedor permanente; aparece fondo `surface` en hover/foco.
- Disabled: superficie `disabled-surface`, texto `muted`, cursor y semántica deshabilitados; no se comunica el estado solo por opacidad.
- Enlaces dentro de texto: `action`; se subrayan en hover y foco. Nunca se usa el degradado como color de texto.
- Foco: anillo de 2 px `focus` con 2 px de separación respecto al control.

### Encabezado

- Logotipo a la izquierda.
- Acceso o avatar a la derecha.
- Sin barra de navegación extensa en la raíz.
- En móvil, las áreas privadas se abren desde menú; la exploración pública continúa siendo una sola lista.

### Búsqueda

- Campo único, botón implícito con Enter y botón de limpiar visible cuando contiene texto.
- Placeholder único: `Busca una startup, industria o rol`.
- Autocompletado mezcla nombres, industrias, áreas y roles sin obligar a escoger una categoría primero.

### Lista unificada

- La startup es la unidad principal de descubrimiento.
- Sus oportunidades activas aparecen anidadas en la misma fila mediante la línea Link.
- Área, tipo, modalidad y estado de contratación son filtros, no rutas de navegación competidoras.

### Filtros

- En escritorio, se abren en panel compacto o columna solo cuando la complejidad lo requiere.
- En móvil, hoja inferior con `Ver resultados` y `Limpiar`.
- La cantidad de filtros activos aparece como texto o número, no como punto sin etiqueta.

### Fila del directorio

- Logotipo opcional.
- Nombre.
- Descripción de una línea.
- Máximo tres metadatos visibles.
- Oportunidades activas enlazadas inmediatamente debajo, con cargo, tipo y modalidad.
- El nombre y `Ver startup` abren el perfil; cada rol abre su propio detalle. No se anidan enlaces interactivos.

En el detalle, la acción principal dice `Postular en el sitio oficial` con indicador de salida para modo externo y `Postular` para modo nativo. El enlace externo abre una nueva pestaña, lo anuncia en su nombre accesible y usa aislamiento seguro. La insignia `Gestionada por LinkUp` es independiente del modo nativo.

### Badges

- `Organización reclamada`.
- `Fuente comprobada`.
- `Gestionada por LinkUp`.
- `Compensación publicada`.

No utilizar `Verificada` sin explicar qué se verificó.

`Compensación publicada` aparece solo cuando existe monto o rango. En los demás casos la fila dice literalmente `Pagada · monto no informado`, `No pagada`, `Condición no informada` o `No aplica`; nunca deja el espacio vacío.

## Wireframes

### Inicio de escritorio

```text
┌───────────────────────────────────────────────────────────────┐
│ LinkUp                                                Ingresar │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Descubre quién está construyendo y dónde puedes sumarte.      │
│ [ Busca una startup, industria o rol                   × ]     │
│                                                               │
│ Con oportunidades                               Filtros        │
│                                                               │
│ ◇  Menta                                                    › │
│    Sistema clínico con IA                                      │
│    Healthtech · Pre-seed · Híbrida                            │
│    ┃ Product intern                    Pasantía · Híbrido    › │
│ ───────────────────────────────────────────────────────────── │
│ ◇  Loop3                                                    › │
│    Datos y automatización para inversión                        │
│    Data · 11-50 · Remota                      Contratando      │
└───────────────────────────────────────────────────────────────┘
```

### Inicio móvil

```text
┌────────────────────────────┐
│ LinkUp                  ○  │
│                            │
│ [ Buscar startup o rol   ] │
│                            │
│ Con oportunidades      ☷   │
│                            │
│ Menta                    › │
│ Sistema clínico con IA     │
│ Pre-seed · Híbrida         │
│ ┃ Product intern         › │
│ ────────────────────────── │
│ Loop3                    › │
│ Datos para inversión       │
│ Remota · 11-50             │
└────────────────────────────┘
```

### Detalle de oportunidad

```text
Volver a oportunidades

Product Intern
Menta

Pasantía · Híbrida · Santa Cruz
Compensación publicada · Cierra 18 sep

[ Postular ]    Guardar

Qué harás
Requisitos indispensables
Lo que suma
Condiciones
Proceso
Fuente y última verificación
```

## Responsive

- `320-639 px`: una columna, hoja de filtros, acciones inferiores cuando corresponda.
- `640-959 px`: una columna ancha con metadatos en dos líneas.
- `960 px o más`: canal central y panel de filtros opcional.
- No se diseña una versión desktop y se comprime; cada componente define su reflujo.

## Accesibilidad

- Navegación completa por teclado.
- Foco visible de 2 px con separación suficiente.
- Controles táctiles de al menos 44 por 44 px.
- Etiquetas persistentes en formularios; placeholder no sustituye label.
- Contraste verificado en todos los pares y estados.
- Mensajes de error asociados al campo y anunciados a tecnologías de asistencia.
- Orden semántico igual al orden visual.
- No usar solo color para vigencia, verificación o estado.
- Logotipos decorativos llevan texto alternativo vacío cuando el nombre ya aparece.

Contraste base calculado con WCAG:

| Par | Relación | Uso permitido |
|---|---:|---|
| `ink` sobre `canvas` | 12,17:1 | Todo texto |
| `ink` sobre `paper` | 13,30:1 | Todo texto |
| `body` sobre `canvas` | 7,21:1 | Párrafos |
| `action` sobre `canvas` | 4,90:1 | Enlaces y texto normal |
| blanco sobre `action` | 5,36:1 | Botón principal |
| `teal` sobre `canvas` | 3,49:1 | Wordmark, texto grande o elementos no textuales |
| blanco sobre `teal` | 3,82:1 | No usar; por eso existe `action` |
| `muted` sobre `canvas` | 5,02:1 | Texto secundario normal |
| `muted` sobre `surface` | 4,69:1 | Texto secundario sobre superficies |
| blanco sobre `navy` | 13,30:1 | Pie y piezas oscuras |
| `cyan` sobre `navy` | 5,61:1 | Lema y `Up` invertido |
| `on-navy-muted` sobre `navy` | 6,16:1 | Enlaces del pie |
| `cyan` sobre `canvas` | 2,17:1 | Solo decorativo |
| blanco sobre `success` | 5,32:1 | Estado sólido |
| blanco sobre `warning` | 5,24:1 | Estado sólido |
| blanco sobre `danger` | 6,57:1 | Estado sólido |

No usar texto blanco sobre `teal` ni texto `cyan` sobre fondos claros. Estos valores validan pares planos; hover, foco, disabled, transparencias, degradado y renderizado con la fuente real se vuelven a probar en componentes.

## Revisión crítica de la dirección

Una primera interpretación de "minimalista y tecnológica" produciría fondo blanco, azul, tarjetas redondeadas y una sans neutra: una solución correcta pero indistinguible de cientos de SaaS.

La dirección se corrigió con cuatro elecciones específicas de LinkUp:

- Listados continuos en lugar de tarjetas.
- Títulos en Raleway y datos en Lato para separar voz de marca y contenido sin introducir una estética de código.
- Línea Link derivada de la `U` con flecha como único gesto distintivo.
- Gradiente restringido al símbolo y a esa línea, no utilizado como decoración.

El riesgo deliberado es que la interfaz sea más silenciosa que otras plataformas juveniles. Se justifica porque la oferta y los logos de las startups ya aportan variedad; la marca debe ordenar y transmitir confianza.

## Entregables visuales pendientes antes del código final

- Archivo SVG maestro del símbolo entregado por diseño, para reemplazar el redibujo actual.
- Lockup vertical.
- Prueba de favicon a 16, 24 y 32 px en navegadores reales.
- Prueba visual de contraste en todos los estados y transparencias de componentes.
- Pantalla principal desktop y móvil en alta fidelidad.
- Detalle de startup y oportunidad.
- Flujo de postulación nativa.
- Componentes en estados normal, hover, foco, deshabilitado, carga, vacío y error.
