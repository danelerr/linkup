# Marca e interfaz

Identidad tomada del tablero de marca de septiembre de 2026 (D-026). Los valores viven en `app/globals.css`; si cambian, se cambian primero aquí.

## Nombre y logotipo

Se escribe **LinkUp**. No `LinkUP`, `Link UP` ni `Link - Up`.

| Archivo | Uso |
|---|---|
| `public/marca/simbolo.svg` | Símbolo a color sobre fondos claros y favicon vectorial |
| `public/marca/simbolo-blanco.svg` | Símbolo sobre azul oscuro |

El lockup es el símbolo más el wordmark en Raleway 800, armado con texto real en `components/brand.tsx`: `Link` en azul oscuro y `Up` en celeste intenso (sobre azul oscuro: blanco y cian). Derivados: `public/favicon.png` (64 px), `public/apple-touch-icon.png` (180 px) y `public/og.png` (1200 × 630).

- La flecha de la `U` siempre apunta hacia arriba. No rotar, deformar, recolorear ni aplicar sombra.
- Sobre azul oscuro se usa la versión blanca.
- El lema `Connect · Grow · Succeed` va en el pie y en piezas de difusión, no en la navegación.
- El símbolo actual es un redibujo fiel; se reemplaza cuando llegue el vector original (O-003).

## Paleta

| Token | Valor | Uso |
|---|---:|---|
| `navy` | `#0F3151` | Texto principal, títulos, pie |
| `teal` | `#11909D` | `Up` del wordmark y elementos no textuales |
| `cyan` | `#47B9B2` | Final de la línea Link; texto solo sobre azul oscuro |
| `canvas` | `#F3F5F7` | Fondo |
| `action` | `#0D7680` | Botones, enlaces y foco |

`action` es el celeste intenso oscurecido: blanco sobre `teal` da 3,82:1 y no cumple AA. El resto de tokens (superficies, líneas, texto secundario, éxito, aviso, error) está en `globals.css`.

El degradado azul → celeste → cian se reserva al símbolo y a la línea Link. Nunca en botones, texto ni fondos de página.

## Tipografía

- **Raleway 600:** títulos de página, sección y detalle. Con cifras alineadas (`lnum`), porque las de Raleway son de estilo antiguo por defecto. 800 solo para el wordmark.
- **Lato 400/700:** cuerpo, controles, datos y metadatos. 900 solo en casos excepcionales.

El cuerpo no baja de 16 px en formularios.

## Layout y forma

- Contenedor de 1120 px con márgenes de 24 px (16 px en móvil). El directorio usa el ancho completo para alinearse con la cabecera. Formularios y textos largos van en una columna centrada más estrecha.
- Listas continuas con divisores de 1 px, no grillas de tarjetas.
- Radios: 10 px en controles y 16 px en paneles. Las filas del directorio no se redondean.
- Sin sombras en filas, botones ni paneles normales; solo en popovers y diálogos.
- Pills solo para filtros o estados cortos.
- Controles táctiles de al menos 44 × 44 px.

## Línea Link

Es el único gesto propio de la interfaz: una línea de 2 px que va de azul oscuro a cian y termina en una subida corta, como la `U` del logotipo. Conecta cada startup con sus oportunidades en el directorio y marca progreso. No separa secciones, no subraya enlaces y no aparece en más de un punto dominante por pantalla.

## Logos de startups

Un logo real se muestra en contenedor blanco neutro, sin recorte circular. Sin logo se muestran las iniciales sobre uno de cuatro tonos de la paleta, elegido a partir del nombre para que cada startup se distinga y conserve siempre el mismo.

## Movimiento

Transiciones de 120–160 ms; diálogos hasta 200 ms. Sin animaciones ambientales ni scroll reveal. Con `prefers-reduced-motion` se eliminan los desplazamientos.

## Voz

Español claro y latinoamericano, voz activa, frases cortas. Nada de grandilocuencia en la interfaz.

- Los títulos nombran la página o el estado ("Cómo verificamos", "Perfil"), sin punto final ni frases de póster.
- Sin etiquetas en mayúsculas sobre los títulos de páginas públicas. En áreas privadas sí, como contexto ("Mi LinkUp", "Operación").
- La interfaz no justifica cada decisión: dice qué pasa y qué hacer.

| Usar | Evitar |
|---|---|
| Buscar | Descubrir el futuro |
| Postular | Aplicar ahora mismo |
| Ver fuente oficial | Saber más |
| Crear alerta | Activar inteligencia |
| No encontramos resultados | Ups, parece que aquí no hay nada |

`Aplicar` se reserva a filtros; para una oportunidad se dice `Postular`. No usar `Verificada` sin decir qué se verificó.

## Contraste

| Par | Relación | Uso |
|---|---:|---|
| `ink` sobre `canvas` | 12,17:1 | Todo texto |
| `body` sobre `canvas` | 7,21:1 | Párrafos |
| `action` sobre `canvas` | 4,90:1 | Enlaces y texto normal |
| blanco sobre `action` | 5,36:1 | Botón principal |
| `muted` sobre `canvas` | 5,02:1 | Texto secundario |
| `muted` sobre `surface` | 4,69:1 | Texto secundario sobre superficies |
| `cyan` sobre `navy` | 5,61:1 | Lema y `Up` invertido |
| `on-navy-muted` sobre `navy` | 6,16:1 | Enlaces del pie |
| `teal` sobre `canvas` | 3,49:1 | Solo texto grande o no textual |
| `cyan` sobre `canvas` | 2,17:1 | Solo decorativo |

Ningún estado se comunica solo con color.
