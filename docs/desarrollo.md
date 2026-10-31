# Desarrollo local

```bash
npm install
cp .env.example .env.local   # completá OPENROUTER_API_KEY
npm run dev                  # http://localhost:3000
```

Otros scripts:

- `npm run build`: build de producción.
- `npm start`: `next start -p $PORT` (en local, `PORT=3000 npm start`).
- `npm run lint`: ESLint.
- `npm run images`: regenera `public/img/*.webp` desde `assets/img/*.jpeg`. Solo cambia el formato y el tamaño (máximo 1600 px; las cuadradas, 800 px). Los `.webp` ya están commiteados, así que solo hace falta correrlo si cambiás una imagen. `vacio-ofertas.jpeg` se publica como `gracias-lista-espera.webp`. No toca `logo.jpeg`.
- `npm run logo`: genera las variantes del logo desde `assets/img/logo.jpeg` (fondo blanco → transparente): `public/img/logo.webp`, `logo-blanco.webp` (para fondos oscuros), `logo-isotipo.webp`, y los favicons `src/app/icon.png`, `apple-icon.png` y `favicon.ico`. Si cambiás el logo y se mueve el dibujo, actualizá los recortes al principio de `scripts/generar-logo.mjs`.

## Variables de entorno

| Variable | Obligatoria | Por defecto | Para qué |
|---|---|---|---|
| `OPENROUTER_API_KEY` | Sí, para el tasador | — | Key de OpenRouter. Solo se usa en el servidor. |
| `OPENROUTER_MODELS` | Sí, para el tasador | — | IDs de modelos en orden de prioridad, separados por coma. |
| `TASACIONES_POR_HORA_IP` | No | `5` | Tasaciones por hora por IP. |
| `DAILY_TASACIONES_LIMIT` | No | `20` | Tope global diario de tasaciones. |
| `WAITLIST_WEBHOOK_URL` | No | vacía | URL del Apps Script. Vacía o con error: el envío se guarda en el CSV de respaldo. |
| `WAITLIST_CSV_PATH` | No | `data/waitlist.csv` | CSV de respaldo de la lista de espera. |
| `SITE_URL` | Recomendada | `http://localhost:3000` | URL pública, para Open Graph. **Se lee en el build.** |

### Modelos de OpenRouter

Se usa el campo `models` de OpenRouter para el fallback automático: si el primero falla, prueba el siguiente.

- **Testing (sin créditos):** `OPENROUTER_MODELS=nvidia/nemotron-3.5-super-vl:free`
- **Producción (con créditos):** `OPENROUTER_MODELS=google/gemini-3.5-flash-lite,nvidia/nemotron-3.5-super-vl:free`

> La app prueba los modelos **de a uno y en orden**. Si uno falla por cualquier motivo (sin saldo, cupo lleno, caído, timeout), pasa al siguiente. No usa el fallback `models` de OpenRouter porque manda la misma configuración a todos los modelos y no pasa al siguiente ante un 402. Por eso conviene que la lista de producción termine siempre con un modelo gratuito.
>
> El razonamiento se pide apagado para que responda rápido. Los modelos que no lo permiten (como `google/gemini-3.5-flash-lite`, que responde 400 "Reasoning is mandatory") se reintentan solos con esfuerzo mínimo, y la app lo recuerda hasta que se reinicia.

Verificá que los IDs sigan existiendo en https://openrouter.ai/models antes de la demo.

### Límites

- El tasador permite como máximo `TASACIONES_POR_HORA_IP` por IP y `DAILY_TASACIONES_LIMIT` por día en total. Cada tasación hace 2 pedidos a OpenRouter (analizar y estimar). El tope de 20 está pensado para la cuenta gratuita, que permite 50 pedidos por día.
- **En producción con créditos** podés subir `DAILY_TASACIONES_LIMIT=400` y `TASACIONES_POR_HORA_IP=10`.
- La waitlist acepta como máximo 5 envíos por hora por IP.
- Al pasar el límite, la API responde `429` con el header `Retry-After`, y el frontend ofrece anotarse en la lista de espera.
- El limitador vive en memoria (`src/server/services/rateLimit.ts`). Alcanza con un solo dyno, pero se reinicia cuando el dyno se reinicia.
