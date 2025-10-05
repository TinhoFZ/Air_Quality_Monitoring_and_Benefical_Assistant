## Backend rápido (OpenAQ, AirNow, S5P)

### Instalação
```bash
npm init -y
npm i express node-fetch
```

Crie `.env` (opcional) e exporte a variável `AIRNOW_API_KEY` no shell se for usar AirNow.

### Executar
```bash
node server.js
```

### Endpoints
- `GET /openaq` – proxy para measurements da OpenAQ (evita CORS)
- `GET /airnow?bbox=west,south,east,north&datetime=YYYY-MM-DDTHH:MM` – pontos PM2.5/O3 do AirNow (USA)
- `GET /s5p?west=&south=&east=&north=&hours=&vars=no2,o3,ch2o` – placeholder para Sentinel-5P

### Frontend
No `index.html`, antes de carregar `assets/js/main.js`:
```html
<script>
  window.OPENAQ_PROXY = 'http://localhost:3000/openaq';
  window.TEMPO_API_URL = 'http://localhost:3000/s5p';
  // Opcional: criar também window.AIRNOW_URL para consumir AirNow no frontend
</script>
```

Integre a resposta do AirNow/S5P retornando uma lista de pontos no formato:
`[{lat, lon, pm25?, no2?, o3?, ch2o?, site?, time?}]`.


