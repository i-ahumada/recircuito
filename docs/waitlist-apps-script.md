# Lista de espera en Google Sheets (Apps Script)

La API (`POST /api/waitlist`) manda cada inscripción a un Apps Script que la escribe en una hoja de cálculo. Si `WAITLIST_WEBHOOK_URL` está vacía, o si el Apps Script falla, el envío se guarda en `data/waitlist.csv` en el servidor.

El JSON que recibe el script (todos los valores son texto):

```json
{
  "fecha": "2026-10-31T12:00:00.000Z",
  "email": "vos@mail.com",
  "origen": "tasador",
  "dispositivo": "Celular Apple iPhone 13",
  "rango": "$320.000 – $400.000",
  "precio": "360000"
}
```

## 1. Código

Copiá todo esto en `Código.gs`:

```js
const HOJA = "Waitlist";
const COLUMNAS = ["fecha", "email", "origen", "dispositivo", "rango", "precio"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const datos = JSON.parse(e.postData.contents);
    if (!datos.email) throw new Error("falta el email");

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = ss.getSheetByName(HOJA) || ss.insertSheet(HOJA);
    const encabezados = asegurarEncabezados(hoja);

    // Cada valor va a la columna con su nombre, así podés reordenar las columnas de la hoja.
    hoja.appendRow(encabezados.map((col) => texto(datos[col])));
    return responder({ ok: true });
  } catch (err) {
    return responder({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Crea la fila de encabezados o le suma las columnas que falten (por ejemplo "precio"). */
function asegurarEncabezados(hoja) {
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(COLUMNAS);
    hoja.setFrozenRows(1);
    return COLUMNAS.slice();
  }
  const actuales = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
  const faltan = COLUMNAS.filter((c) => !actuales.includes(c));
  if (faltan.length) hoja.getRange(1, actuales.length + 1, 1, faltan.length).setValues([faltan]);
  return actuales.concat(faltan);
}

/** Pasa a texto y evita que Sheets ejecute algo que empiece con = + - @ como fórmula. */
function texto(valor) {
  const s = valor === undefined || valor === null ? "" : String(valor);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
```

## 2. Publicarlo

1. Creá una hoja de cálculo nueva en Google Sheets (por ejemplo, "ReCircuito · Lista de espera").
2. Andá a **Extensiones › Apps Script**.
3. Borrá lo que tenga `Código.gs`, pegá el código de arriba y guardá (Ctrl + S).
4. Hacé clic en **Implementar › Nueva implementación**.
5. En el engranaje de **Seleccionar tipo**, elegí **Aplicación web**.
6. En **Ejecutar como**, elegí **Yo**. En **Quién tiene acceso**, elegí **Cualquier usuario**.
7. Hacé clic en **Implementar** y autorizá con tu cuenta. Si aparece "Google no verificó esta app", entrá en **Configuración avanzada › Ir a … (no seguro)**: es tu propio script.
8. Copiá la **URL de la aplicación web**, la que termina en `/exec`.

## 3. Conectarlo a la app

En desarrollo, agregala a `.env.local` y reiniciá `npm run dev`:

```bash
WAITLIST_WEBHOOK_URL=https://script.google.com/macros/s/XXXXXXXX/exec
```

En Heroku:

```bash
heroku config:set WAITLIST_WEBHOOK_URL=https://script.google.com/macros/s/XXXXXXXX/exec
```

## 4. Probarlo

```bash
curl -L "https://script.google.com/macros/s/XXXXXXXX/exec" \
  -H "Content-Type: application/json" \
  -d '{"fecha":"2026-10-31T12:00:00.000Z","email":"prueba@mail.com","origen":"tasador","precio":"360000"}'
```

No le agregues `-X POST`: Google responde con una redirección, y con `-X POST` curl la sigue como POST y recibe un 405 ("No se encontró la página"). Con `-d` solo, manda POST y sigue la redirección con GET, como hace la app.

Tiene que responder `{"ok":true}` y aparecer una fila nueva en la pestaña **Waitlist**. Si responde `{"ok":false,"error":"..."}`, el error dice qué falló.

## Si cambiás el código

Andá a **Implementar › Gestionar implementaciones › ✏️ Editar › Versión: Nueva versión › Implementar**. Si no lo hacés, la URL sigue corriendo la versión anterior. La URL no cambia.

Si ya tenías la hoja con un script viejo (sin `precio`), el nuevo agrega la columna solo en el primer envío.

## Respaldo en CSV

- Sin `WAITLIST_WEBHOOK_URL`, o si el script falla, cada envío se agrega a `data/waitlist.csv`. La ruta se cambia con `WAITLIST_CSV_PATH`.
- `data/` está en `.gitignore` porque tiene emails.
- En Heroku el disco se borra cada vez que el dyno reinicia (al menos una vez por día). Ahí el CSV es solo un respaldo temporal; en producción configurá el Apps Script.
