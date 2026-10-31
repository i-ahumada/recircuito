# ReCircuito

Landing y MVP de ReCircuito, un marketplace que conecta a quienes tienen dispositivos electrónicos en desuso con compradores verificados: técnicos, reparadores y recuperadores.

En Argentina se generan unas 465.000 toneladas de residuos electrónicos por año, y solo entre el 3 % y el 4 % se recupera por canales formales. Mientras tanto, muchos de esos equipos siguen guardados en un cajón y todavía tienen valor. ReCircuito busca que cada uno encuentre su mejor destino: reventa, reparación o recuperación de componentes.

## Qué hace

- **Tasador con IA.** Subís una foto (o la sacás con el celular), la IA identifica el dispositivo y te hace 2 o 3 preguntas sobre su estado. El servidor calcula un rango de precio con reglas fijas a partir de una tabla de precios de mercado. La IA no pone precios: solo reconoce el equipo y redacta los textos.
- **Borrador de publicación.** Con el resultado se arma un borrador editable: título, descripción, categoría, estado y un precio que elige la persona. Arranca en el medio del rango estimado.
- **Mapa de descarte.** Si el objeto no tiene valor de reventa (o son pilas y baterías), muestra los Puntos Verdes de la Ciudad de Buenos Aires que lo reciben. Se ordenan por cercanía y cada uno tiene un link para abrir la ruta en Google Maps.
- **Lista de espera.** Como el marketplace todavía no existe, la landing capta interesados. Las inscripciones se guardan en una hoja de Google Sheets a través de un Apps Script, con el dispositivo tasado, el rango y el precio elegido. Si el Apps Script no está configurado o falla, quedan en un CSV en el servidor.
- **Landing como pitch.** La página va del problema (cifras de residuos electrónicos en Argentina) a la solución (cómo funciona, compradores verificados) y cierra con el tasador.

## Cómo se calcula el precio

Cada dispositivo tiene un precio de referencia: el de un equipo **usado y funcionando**, sacado de publicaciones reales de Mercado Libre y Facebook Marketplace (la mediana, sin los extremos). Sobre ese valor, las respuestas de la persona definen el rango:

| Estado | % del precio de referencia |
|---|---|
| Funciona perfecto | 80% – 100% |
| Detalles estéticos | 60% – 80% |
| Pantalla rota o falla parcial | 30% – 45% |
| No enciende (repuestos) | 10% – 20% |
| Pilas, baterías o sin valor | Sin valor de reventa → mapa |

Manda la peor condición informada. Cada "No sé" baja el mínimo 10 puntos y deja el máximo igual, así que amplía el rango en vez de correrlo. Si falta un accesorio, se restan 5 puntos en ambos extremos. Las reglas están en `src/server/services/pricingRules.ts`.

Todas las respuestas de la IA se validan con zod. Si no cumplen el schema se reintenta una vez, y si vuelve a fallar se muestra un error amigable. Hay límites de tasaciones por IP y por día para cuidar el cupo de OpenRouter.

## Stack

- Next.js 16 (App Router), React 19 y TypeScript. Las páginas son Server Components; solo son Client Components el tasador, el mapa, los formularios y el menú mobile.
- zod para validar todas las entradas y salidas de la API.
- OpenRouter para la IA (endpoint compatible con OpenAI, salida estructurada con `json_schema`), con varios modelos en fallback.
- Leaflet + react-leaflet con tiles de OpenStreetMap.
- GSAP para el hilo animado que recorre la landing.
- browser-image-compression para comprimir las fotos en el navegador.
- CSS Modules y tokens en `src/app/globals.css`. La tipografía es Outfit, cargada con `next/font`.
- Google Apps Script + Google Sheets para la lista de espera.

## Estructura

```
src/
  app/
    page.tsx                         Arma las secciones (server)
    layout.tsx                       Fuente, metadata, lang="es-AR"
    not-found.tsx                    404
    api/tasacion/analizar/route.ts   POST: imagen → dispositivo + preguntas
    api/tasacion/estimar/route.ts    POST: análisis + respuestas → rango + textos
    api/waitlist/route.ts            POST: email → Apps Script (o CSV)
  views/                             Secciones y componentes de vista
    tasador/                         Flujo del tasador (client)
    mapa/                            Mapa de descarte (client, dynamic ssr:false)
  hooks/                             useTasacion, useImageUpload, useWaitlist, useGeolocation, useEsTactil
  services/                          Únicos que hacen fetch a nuestra API
  server/services/                   OpenRouter, prompts, reglas de precio, rate limit, waitlist
  lib/schemas.ts                     Schemas zod compartidos
  data/precios-referencia.json       Tabla de precios de referencia
  data/puntos-descarte.json          Puntos del mapa
scripts/
  calcular-precios.mjs               Genera precios-referencia.json desde las muestras
  importar-puntos-verdes.mjs         Genera puntos-descarte.json desde el dataset de la Ciudad
  convert-images.mjs                 Convierte assets/img/*.jpeg a public/img/*.webp
docs/                                Guías de desarrollo, datos y deploy
```

Capas: en el frontend, views → hooks → services; en el backend, route handler → server/services. No hay base de datos. Las imágenes se procesan en memoria y se descartan; lo único que se escribe en disco es el CSV de respaldo de la lista de espera.

## Datos

- **Precios:** publicaciones de usados en Mercado Libre y Facebook Marketplace, más muestras cargadas a mano. Lo publicado en dólares se pasa a pesos con el dólar blue. La app trabaja solo en pesos.
- **Puntos de descarte:** los Puntos Verdes con atención del dataset "Puntos verdes" de [data.buenosaires.gob.ar](https://data.buenosaires.gob.ar/).
- **Cifras de residuos electrónicos:** [Manual de Gestión Integral de RAEE](https://www.argentina.gob.ar/ambiente/control/manual-raee) (Ministerio de Ambiente y OIT, 2020), [RAEE y empleo en la Argentina](https://www.ilo.org/es/media/401831/download) (OIT, 2020) y la [página de RAEE del Gobierno de la Ciudad](https://buenosaires.gob.ar/gcaba_historico/vicejefatura/ambiente/residuos-especiales/residuos-de-aparatos-electricos-y-electronicos-raee).

## Documentación

- [Desarrollo local y variables de entorno](docs/desarrollo.md)
- [Precios de referencia](docs/precios.md)
- [Puntos de descarte](docs/puntos-descarte.md)
- [Lista de espera con Google Sheets](docs/waitlist-apps-script.md)
- [Deploy en Heroku](docs/deploy-heroku.md)
