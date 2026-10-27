# Mi ruta hacia la libertad: sitio web

Página informativa sobre el tratamiento penitenciario, la redención de pena y los beneficios por fracción de la condena (1/3, 3/5 y 4/5) en Colombia. Proyecto académico del Consultorio Jurídico, Universidad Católica de Colombia.

No necesita instalación ni compilación: es HTML, CSS y JavaScript puro.

## Estructura

```
sitio-web/
├── index.html      Contenido y estructura de la página
├── css/
│   └── styles.css  Estilos, paleta y versión móvil
├── js/
│   └── main.js     Selector de fracciones y menú móvil
└── README.md
```

## Cómo verla

Abra `index.html` en el navegador.

## Cómo publicarla con GitHub Pages

1. Cree un repositorio en GitHub y suba esta carpeta.
2. En el repositorio: Settings, Pages, "Deploy from a branch", rama `main`, carpeta `/ (root)`.
3. GitHub publicará la página en `https://<usuario>.github.io/<repositorio>/`.
4. Con esa dirección se puede generar el código QR de la infografía.

## Dónde editar

- Textos de las secciones: `index.html`.
- Contenido de cada fracción (1/3, 3/5, 4/5): objeto `FRACCIONES` al inicio de `js/main.js`.
- Colores: variables al inicio de `css/styles.css`.

## Pendientes de verificación jurídica

Los textos marcados con `[Por confirmar]` y la sección de jurisprudencia deben revisarse contra las fuentes antes de la entrega final. También conviene confirmar las fases del tratamiento (artículo 144 de la Ley 65 de 1993) y la vigencia de los artículos 147, 147A y 148.

Contenido informativo. No constituye asesoría jurídica ni garantiza la concesión de ningún beneficio.
