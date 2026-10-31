# Precios de referencia

`src/data/precios-referencia.json` tiene entradas con esta forma:

```json
{ "id": "iphone-11-128", "categoria": "celular", "nombre": "iPhone 11 128 GB",
  "palabrasClave": ["iphone 11", "apple"], "precioReferenciaARS": 330000,
  "muestras": 0, "actualizado": "2026-10-31", "verificar": true }
```

El precio de referencia es siempre el de un **equipo usado y funcionando**.

**De dónde salen los precios:** `scripts/calcular-precios.mjs` los calcula a partir de dos fuentes locales:

- `src/data/precios/listings-todos.json`: publicaciones extraídas de Mercado Libre y Facebook Marketplace. Se descartan las de precio inválido, las de equipos nuevos o para repuestos, y las que tienen alertas de estafa o de precio irreal. Un modelo puntual necesita al menos 2 publicaciones.
- `src/data/precios/muestras.csv`: muestras cargadas a mano, con columnas `grupo,dispositivo,estado,precio_publicado,moneda,fuente,nota`. Solo cuentan las filas con estado `funcionando`; las `calib-*` (equipos rotos) quedan para revisar las bandas. Lo que está en USD se pasa a pesos con el dólar blue venta guardado en `DOLAR_BLUE_ARS`. Alcanza con una muestra.

En los dos casos el script calcula el precio por unidad y, si hay 5 o más, saca los extremos y toma la mediana, redondeada a $500. Las entradas con menos de 5 muestras quedan con `"verificar": true`. Las que tienen `"muestras": 0` (tablets, PS4, accesorios, audio, MacBook Air M1, iPhone 11 128 GB) son valores de ejemplo, y la interfaz lo aclara.

`src/data/precios/` y `src/data/ba_residuos/` son datos crudos locales y están en `.gitignore`. Solo se versionan los JSON que usa la app. Para recalcular: `node scripts/calcular-precios.mjs`.

Método para cargar precios a mano:

1. Buscá el dispositivo **usado** en Mercado Libre (filtro "Usado").
2. Anotá entre 5 y 10 precios de publicaciones de equipos que funcionen.
3. Descartá los extremos (el más caro y el más barato, o cualquier valor absurdo).
4. Usá la **mediana** de lo que queda como `precioReferenciaARS`.
5. Poné en `muestras` cuántos precios usaste, en `actualizado` la fecha (AAAA-MM-DD) y `"verificar": false`.

Podés agregar entradas nuevas; el modelo recibe automáticamente la lista de ids y nombres.
