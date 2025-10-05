## Guia rápido – comandos e passo a passo

Este guia mostra como rodar o backend (OpenAQ proxy, AirNow, S5P) e testar o frontend.

### 1) Pré‑requisitos
- Node.js instalado
- (Opcional) Python ou um servidor estático para servir o site (Live Server, http-server, etc.)

### 2) Clonar/abrir o projeto
Abra a pasta do projeto no terminal (PowerShell no Windows).

### 3) Backend – instalar dependências
```bash
npm init -y
npm i express node-fetch
```

### 4) Backend – configurar chaves (PowerShell)
- Persistente (reabrir terminal depois):
```powershell
setx AIRNOW_API_KEY "SUA_CHAVE_AIRNOW"
setx WEKEO_TOKEN "SEU_TOKEN_WEKEO"
```
- Somente para a sessão atual:
```powershell
$env:AIRNOW_API_KEY="SUA_CHAVE_AIRNOW"
$env:WEKEO_TOKEN="SEU_TOKEN_WEKEO"
```

### 5) Backend – iniciar servidor
```bash
node server.js
```
O backend sobe em http://localhost:3000 com endpoints:
- GET /openaq → proxy OpenAQ (evita CORS)
- GET /airnow?bbox=west,south,east,north&datetime=YYYY-MM-DDTHH:MM → PM2.5/O3 (EUA)
- GET /s5p?west=&south=&east=&north=&hours=&vars=no2,o3,ch2o → placeholder S5P (retorna [])

### 6) Frontend – configurar URLs no index.html
Adicione antes de carregar `assets/js/main.js`:
```html
<script>
  window.OPENAQ_PROXY = 'http://localhost:3000/openaq';
  window.TEMPO_API_URL = 'http://localhost:3000/s5p';
  window.AIRNOW_URL = 'http://localhost:3000/airnow';
</script>
```

### 7) Servir o site (sem file://)
Opção A – Python:
```bash
python -m http.server 5173
```
Opção B – http-server (Node):
```bash
npx http-server -p 5173
```
Abra http://localhost:5173

### 8) Testar Ground (sensores terrestres)
- Selecione “Ground Sensors”.
- Marque PM2.5/NO₂/O₃/CH₂O.
- Mova/zoome o mapa para regiões com estações.
- Se der CORS, verifique se `window.OPENAQ_PROXY` está configurado e o backend está rodando.

### 9) Testar AirNow (opcional, EUA)
Valide no navegador:
```
http://localhost:3000/airnow?bbox=-125,24,-66,49&datetime=2025-10-05T12:00
```
Se retornar JSON com pontos, a chave está OK. Podemos ligar o uso do AirNow no mapa (em vez do OpenAQ) para bbox dos EUA, se desejar.

### 10) Testar Satélite (S5P substituindo TEMPO)
- Selecione “TEMPO (NASA)” (o frontend usa `window.TEMPO_API_URL`).
- Implemente no backend o `/s5p` para retornar `[{lat,lon,no2?,o3?,ch2o?,time?}]` (via WEkEO/CDSE/GEE). Assim que o endpoint retornar pontos, o mapa exibirá.

### 11) Troubleshooting
- CORS: chame sempre o backend (localhost:3000) a partir do frontend.
- Nada aparece: aumente zoom/mude região/ajuste Timeline; confira Console por erros; confirme backend rodando.
- Performance: implemente cache por bbox+intervalo no backend (opcional) para /s5p.



