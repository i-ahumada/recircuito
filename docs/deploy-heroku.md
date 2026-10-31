# Deploy en Heroku

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
- El filesystem de Heroku es efímero: el CSV de respaldo de la lista de espera (`data/waitlist.csv`) se borra cuando el dyno reinicia. Configurá `WAITLIST_WEBHOOK_URL` para no perder inscripciones.
- Usá un solo dyno web: el rate limit vive en memoria.
