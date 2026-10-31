# Puntos de descarte

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
