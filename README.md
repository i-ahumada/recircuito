# ReCircuito

Landing y MVP de ReCircuito, un marketplace que conecta a quienes quieren sacarse de encima dispositivos electrónicos en desuso con compradores validados (técnicos, empresas y particulares).

El centro de la landing es un **tasador con IA**. Subís una foto, la IA identifica el dispositivo y te hace 2 o 3 preguntas. Con eso, el servidor calcula un rango de precio con reglas fijas. Si el objeto no tiene valor de reventa, te muestra un mapa con puntos de descarte. Como el marketplace todavía no existe, la landing capta interesados con una **lista de espera**.

## Stack

- Next.js 16 (App Router), React 19 y TypeScript. Las páginas son Server Components; solo son Client Components el tasador, el mapa, los formularios y el menú mobile.
- zod para validar todas las entradas y salidas de la API.
- OpenRouter para la IA (endpoint compatible con OpenAI, salida estructurada con `json_schema`).
- Leaflet + react-leaflet con tiles de OpenStreetMap (sin API key).
- browser-image-compression para comprimir las fotos en el navegador.
- CSS Modules y tokens en `src/app/globals.css`. La tipografía es Outfit, cargada con `next/font`.

## Estructura

```
src/
  app/
    page.tsx                         Arma las secciones (server)
    layout.tsx                       Fuente, metadata, lang="es-AR"
    not-found.tsx                    404
    api/tasacion/analizar/route.ts   POST: imagen → dispositivo + preguntas
    api/tasacion/estimar/route.ts    POST: análisis + respuestas → rango + textos
    api/waitlist/route.ts            POST: email → Apps Script
  views/                             Secciones y componentes de vista
    tasador/                         Flujo del tasador (client)
    mapa/                            Mapa de descarte (client, dynamic ssr:false)
  hooks/                             useTasacion, useImageUpload, useWaitlist, useGeolocation, useEsTactil
  services/                          Únicos que hacen fetch a nuestra API
  server/services/                   OpenRouter, prompts, reglas de precio, rate limit, waitlist
  lib/schemas.ts                     Schemas zod compartidos
  data/precios-referencia.json       Tabla de precios de referencia
  data/puntos-descarte.json          Puntos del mapa
scripts/convert-images.mjs           Convierte assets/img/*.jpeg a public/img/*.webp
```

Capas: en el frontend, views → hooks → services; en el backend, route handler → server/services. No hay base de datos y no se escribe nada en disco. Las imágenes se procesan en memoria y se descartan.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completá OPENROUTER_API_KEY
npm run dev                  # http://localhost:3000
```

Otros scripts:

- `npm run build`: build de producción.
- `npm start`: `next start -p $PORT` (en local, `PORT=3000 npm start`).
- `npm run lint`: ESLint.
- `npm run images`: regenera `public/img/*.webp` desde `assets/img/*.jpeg`. Solo cambia el formato y el tamaño (máximo 1600 px; las cuadradas, 800 px). Los `.webp` ya están commiteados, así que solo hace falta correrlo si cambiás una imagen. `vacio-ofertas.jpeg` se publica como `gracias-lista-espera.webp`.

## Variables de entorno

| Variable | Obligatoria | Por defecto | Para qué |
|---|---|---|---|
| `OPENROUTER_API_KEY` | Sí, para el tasador | — | Key de OpenRouter. Solo se usa en el servidor. |
| `OPENROUTER_MODELS` | Sí, para el tasador | — | IDs de modelos en orden de prioridad, separados por coma. |
| `TASACIONES_POR_HORA_IP` | No | `5` | Tasaciones por hora por IP. |
| `DAILY_TASACIONES_LIMIT` | No | `20` | Tope global diario de tasaciones. |
| `WAITLIST_WEBHOOK_URL` | No | vacía | URL del Apps Script. Vacía: se loguea en consola y responde éxito. |
| `SITE_URL` | Recomendada | `http://localhost:3000` | URL pública, para Open Graph. **Se lee en el build.** |

### Modelos de OpenRouter

Se usa el campo `models` de OpenRouter para el fallback automático: si el primero falla, prueba el siguiente.

- **Testing (sin créditos):** `OPENROUTER_MODELS=nvidia/nemotron-3.5-super-vl:free`
- **Producción (con créditos):** `OPENROUTER_MODELS=google/gemini-3.5-flash-lite,nvidia/nemotron-3.5-super-vl:free`

> ⚠️ **En testing no incluyas modelos pagos en la lista.** Sin saldo, OpenRouter devuelve un **error 402** en lugar de pasar al siguiente modelo, y la tasación falla.

Verificá que los IDs sigan existiendo en https://openrouter.ai/models antes de la demo.

### Límites

- El tasador permite como máximo `TASACIONES_POR_HORA_IP` por IP y `DAILY_TASACIONES_LIMIT` por día en total. Cada tasación hace 2 pedidos a OpenRouter (analizar y estimar). El tope de 20 está pensado para la cuenta gratuita, que permite 50 pedidos por día.
- **En producción con créditos** podés subir `DAILY_TASACIONES_LIMIT=400` y `TASACIONES_POR_HORA_IP=10`.
- La waitlist acepta como máximo 5 envíos por hora por IP.
- Al pasar el límite, la API responde `429` con el header `Retry-After`, y el frontend ofrece anotarse en la lista de espera.
- El limitador vive en memoria (`src/server/services/rateLimit.ts`). Alcanza con un solo dyno, pero se reinicia cuando el dyno se reinicia.

## Cómo funciona el tasador

1. **Imagen (navegador).** Acepta JPG, PNG y WEBP; con HEIC muestra un mensaje que pide otro formato. Comprime a 1024 px y 1 MB en JPEG. En dispositivos táctiles aparece además "Sacar foto" (`capture="environment"`), sin pedir permisos de cámara.
2. **`POST /api/tasacion/analizar`.** Manda la imagen a OpenRouter con la lista de ids de `precios-referencia.json`. Devuelve el tipo de dispositivo, la marca y el modelo, una descripción, el `referenciaId` (o `sin_referencia`) y entre 2 y 3 preguntas. Cada opción declara qué condición implica para el precio, y siempre hay un "No sé".
3. **`POST /api/tasacion/estimar`.** **La IA no pone precios.** `src/server/services/pricingRules.ts` calcula el rango:

   | Estado | % del precio de referencia |
   |---|---|
   | Funciona perfecto | 80% – 100% |
   | Detalles estéticos | 60% – 80% |
   | Pantalla rota o falla parcial | 30% – 45% |
   | No enciende (repuestos) | 10% – 20% |
   | Pilas, baterías o sin valor | Sin valor de reventa → mapa |

   Manda la peor condición informada. Cada "No sé" baja el mínimo 10 puntos y deja el máximo igual: amplía el rango en vez de correrlo. Si falta un accesorio, se restan 5 puntos en ambos extremos. Todo está en constantes al principio del archivo.
   Con los números ya calculados, el modelo redacta solo los textos: el resumen, el título y la descripción de la publicación, la explicación de los ajustes y los factores de variabilidad.

Las respuestas de la IA se validan con zod. Si no cumplen el schema, se reintenta una vez y después se devuelve un error amigable. Cada llamada tiene un timeout de 25 s, y el reintento solo corre si entra antes del corte de 30 s de Heroku. Los errores 429 (OpenRouter saturado) y 402 (sin saldo) tienen mensajes distintos.

## Precios de referencia

`src/data/precios-referencia.json` tiene entradas con esta forma:

```json
{ "id": "iphone-11-128", "categoria": "celular", "nombre": "iPhone 11 128 GB",
  "palabrasClave": ["iphone 11", "apple"], "precioReferenciaARS": 330000,
  "muestras": 0, "actualizado": "2026-10-31", "verificar": true }
```

El precio de referencia es siempre el de un **equipo usado y funcionando**.

**Origen de los datos actuales:**
- Las entradas de celulares (genéricos de gama baja y media, básicos de teclas, Galaxy A04 y A55) se calculan con `scripts/calcular-precios.mjs` a partir de `src/data/precios/listings-todos.json` (publicaciones extraídas de Mercado Libre y Facebook Marketplace). El script descarta las publicaciones con precio inválido, las de equipos nuevos o para repuestos, y las que tienen alertas de estafa o de precio irreal. Calcula el precio por unidad y, si hay 5 o más, saca los extremos y toma la mediana. Las entradas con menos de 5 publicaciones quedan con `"verificar": true`.
- El resto (iPhone, notebooks, tablets, PS4, accesorios, audio) siguen siendo **valores de ejemplo** (`"muestras": 0`). Mientras `muestras` sea 0, la interfaz dice que es un valor de ejemplo.

`src/data/precios/` y `src/data/ba_residuos/` son datos crudos locales y están en `.gitignore`. Solo se versionan los JSON que usa la app. Para recalcular: `node scripts/calcular-precios.mjs`.

Método para cargar precios a mano:

1. Buscá el dispositivo **usado** en Mercado Libre (filtro "Usado").
2. Anotá entre 5 y 10 precios de publicaciones de equipos que funcionen.
3. Descartá los extremos (el más caro y el más barato, o cualquier valor absurdo).
4. Usá la **mediana** de lo que queda como `precioReferenciaARS`.
5. Poné en `muestras` cuántos precios usaste, en `actualizado` la fecha (AAAA-MM-DD) y `"verificar": false`.

Podés agregar entradas nuevas; el modelo recibe automáticamente la lista de ids y nombres.

## Puntos de descarte

`src/data/puntos-descarte.json`:

```json
{ "id": "punto-01", "nombre": "…", "direccion": "…", "lat": -34.6, "lng": -58.4,
  "tipos": ["raee", "pilas"], "horario": "Lun a vie 10 a 18 h", "verificar": false }
```

Los 17 puntos actuales son los **Puntos Verdes con atención** de la Ciudad de Buenos Aires (dataset "Puntos verdes" de data.buenosaires.gob.ar). Todos reciben pilas y RAEE. Se generan con:

```bash
node scripts/importar-puntos-verdes.mjs src/data/ba_residuos/puntos_verdes.csv
```

Si algún punto queda con `"verificar": true`, el mapa muestra el aviso "Puntos de ejemplo".

## Lista de espera con Google Sheets

`POST /api/waitlist` valida el email con zod y reenvía este JSON a `WAITLIST_WEBHOOK_URL`:

```json
{ "email": "vos@mail.com", "origen": "hero | tasador | footer",
  "dispositivo": "Celular Apple iPhone 11", "rango": "$264.000 – $330.000",
  "fecha": "2026-10-31T12:00:00.000Z" }
```

### Apps Script de ejemplo

1. Creá una hoja de cálculo nueva en Google Sheets.
2. Andá a **Extensiones › Apps Script** y pegá este código:

```js
const HOJA = "Waitlist";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = ss.getSheetByName(HOJA) || ss.insertSheet(HOJA);
    if (hoja.getLastRow() === 0) {
      hoja.appendRow(["fecha", "email", "origen", "dispositivo", "rango"]);
    }
    const datos = JSON.parse(e.postData.contents);
    hoja.appendRow([
      datos.fecha || new Date().toISOString(),
      String(datos.email || ""),
      String(datos.origen || ""),
      String(datos.dispositivo || ""),
      String(datos.rango || ""),
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

3. Hacé clic en **Implementar › Nueva implementación**.
4. En tipo, elegí **Aplicación web**.
5. En **Ejecutar como**, elegí "Yo". En **Quién tiene acceso**, elegí "Cualquier usuario".
6. Hacé clic en **Implementar**, autorizá los permisos y copiá la URL que termina en `/exec`.
7. Pegala en `WAITLIST_WEBHOOK_URL`.

Si cambiás el código, tenés que hacer **Implementar › Gestionar implementaciones › Editar › Nueva versión**; si no, sigue corriendo la versión anterior.

## Deploy en Heroku

```bash
heroku create recircuito
heroku config:set OPENROUTER_API_KEY=sk-or-... \
  OPENROUTER_MODELS=nvidia/nemotron-3.5-super-vl:free \
  TASACIONES_POR_HORA_IP=5 DAILY_TASACIONES_LIMIT=20 \
  WAITLIST_WEBHOOK_URL=https://script.google.com/macros/s/.../exec \
  SITE_URL=https://recircuito-xxxx.herokuapp.com
git push heroku main
```

- `package.json` declara `engines.node` y el script `start` es `next start -p $PORT`.
- Heroku corre `npm run build` automáticamente al hacer push.
- `SITE_URL` se usa en el build (metadata de Open Graph). Si la cambiás, volvé a deployar.
- El filesystem de Heroku es efímero; la app no escribe nada en disco.
- Usá un solo dyno web: el rate limit vive en memoria.
