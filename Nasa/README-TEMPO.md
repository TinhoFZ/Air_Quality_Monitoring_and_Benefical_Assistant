## Integração de gases via satélite (substituindo TEMPO) e PM2.5

Este projeto foi ajustado para operar sem Earthdata/TEMPO, usando fontes alternativas:
- Sentinel‑5P TROPOMI (S5P) para NO₂, O₃ e CH₂O (formaldeído)
- OpenAQ (global) e AirNow (EUA) para PM2.5 e O₃ em estações terrestres

### O que você vai obter
- NO₂ (nitrogênio dióxido) – L2
- O₃ (ozônio) – L2
- CH₂O/HCHO (formaldeído) – L2

Observação: PM2.5 não é um produto direto do TEMPO; costuma ser inferido via modelos/fusão de dados. Se seu caso exigir PM2.5 do TEMPO, você precisará de um serviço adicional que faça essa derivação (não coberto aqui). O frontend já aceita `pm25` caso seu backend forneça.

---

## Como acessar os dados do TEMPO

Existem duas peças:
1) Descoberta de coleções e granúlos no catálogo NASA (CMR/ASDC)
2) Requisição de subsetting/formatação com Harmony (quando disponível) e posterior conversão para pontos geoespaciais no seu backend

### Como obter dados sem Earthdata

Você tem três rotas principais para os gases NO₂/O₃/CH₂O:

1) Copernicus Data Space Ecosystem (CDSE)
- Cadastro gratuito
- Pesquisa e download de granúlos S5P via STAC/OData
- Baixe NetCDF/HDF5 e processe no backend

2) WEkEO (EUMETSAT)
- Cadastro gratuito
- Harmonized API para subsetting/reformatação
- Baixe recortes e processe no backend

3) Google Earth Engine (GEE)
- Acesse coleções públicas S5P (NO2/O3/HCHO)
- Crie uma função (Cloud Function/Apps Script/App Engine) que amostre a área/bbox e retorne pontos JSON

### 4) Converter para pontos no backend
Seu backend deve ler o arquivo (NetCDF/HDF5), extrair as variáveis (ex.: colunas de latitude/longitude e o campo de concentração para NO₂/O₃/CH₂O) e devolver ao frontend uma lista de pontos:
```json
[
  {"lat": -23.55, "lon": -46.63, "no2": 28.3, "o3": null, "ch2o": null, "site": "TEMPO swath", "time": "2025-10-05T12:15:00Z"},
  {"lat": -23.65, "lon": -46.55, "no2": 30.1, "o3": null, "ch2o": null, "site": "TEMPO swath", "time": "2025-10-05T12:15:00Z"}
]
```

Exemplo simples (Node + Python auxiliar) – arquitetura sugerida:
- Node Express recebe a requisição `GET /tempo?west=..&south=..&east=..&north=..&hours=..`
- Node chama Harmony/CMR, baixa o NetCDF temporário
- Node executa um script Python com `xarray`/`netCDF4` para ler o arquivo e emitir JSON de pontos
- Node devolve o JSON para o frontend

Script Python (parse NetCDF de S5P para pontos – exemplo conceitual):
```python
# parse_tempo.py
import sys, json
import xarray as xr

path = sys.argv[1]
ds = xr.open_dataset(path)
# Ajuste nomes das variáveis conforme o produto (ex.: lat, lon, no2_column)
lat = ds['latitude'].values
lon = ds['longitude'].values
no2 = ds['no2_column'].values  # exemplo; ver nome real no dataset
time = str(ds['time'].values[0]) if 'time' in ds else None

points = []
for i in range(lat.shape[0]):
    val = float(no2[i]) if no2[i] is not None else None
    if val is None:
        continue
    points.append({
        'lat': float(lat[i]),
        'lon': float(lon[i]),
        'no2': val,
        'o3': None,
        'ch2o': None,
        'site': 'TEMPO swath',
        'time': time
    })

print(json.dumps(points))
```

Endpoint Node (sketch):
```js
// GET /tempo?west=..&south=..&east=..&north=..&hours=..
// 1) Resolve coleção/tempo/bbox (CMR) e solicita subsetting (Harmony)
// 2) Baixa o NetCDF
// 3) Chama "python parse_tempo.py <arquivo>" e retorna o JSON
```

---

## Como plugar no frontend deste projeto
1. Suba seu backend com o endpoint `GET /s5p` (substituto de TEMPO) que retorna `[{lat, lon, pm25?, no2?, o3?, ch2o?, site?, time?}]`.
2. Em `index.html`, antes de carregar `assets/js/main.js`, configure:
```html
<script>
  window.TEMPO_API_URL = 'http://localhost:3000/s5p';
  window.OPENAQ_PROXY = 'http://localhost:3000/openaq';
  // OPENAQ_PROXY é recomendado para evitar CORS no OpenAQ
  // TEMPO_API_URL agora aponta para seu endpoint S5P (substitui TEMPO)
  // Ambos podem apontar para o mesmo servidor Node.
  // O frontend automaticamente enviará bbox e horas atuais.
  // Certifique-se de responder rápido (subsetting pode ser pesado).
  // Dica: cache por bbox/tempo para acelerar.
</script>
```

No frontend, `assets/js/main.js` já chama `window.TEMPO_API_URL` via `fetchTEMPOPoints()` e desenha camadas para NO₂, O₃ e CH₂O.

---

## Perguntas frequentes
- Posso chamar S5P direto do navegador?
  - Em geral, não. Os dados são arquivos científicos grandes (NetCDF/HDF5) e exigem processamento/recorte. Faça via backend ou via serviço (GEE/WEkEO) e exponha como API.

- Onde encontro a documentação oficial?
  - Catálogo e APIs CMR/Harmony do NASA Earthdata/ASDC (procure por “CMR collections/granules API” e “Harmony subsetting”).

- Como ativar PM2.5 do satélite?
  - Precisa de inferência (AOD + met + química). Se já tiver uma fonte derivada, devolva `pm25` no JSON que o frontend exibirá.

---

## Checklist rápido
- [ ] Conta Earthdata criada e token gerado
- [ ] Coleção TEMPO (NO₂/O₃/CH₂O) identificada (concept-id)
- [ ] Fluxo CMR + Harmony testado para bbox e intervalo de tempo
- [ ] Backend convertendo NetCDF/HDF5 em pontos JSON
- [ ] `window.TEMPO_API_URL` configurado no `index.html`
- [ ] Camada TEMPO exibindo pontos no mapa

---

## Passo a passo para testar rapidamente

1) Instalar e iniciar o backend
```bash
npm init -y
npm i express node-fetch
# (Opcional AirNow) No Windows PowerShell: setx AIRNOW_API_KEY "SUA_CHAVE_AIRNOW" e reabra o terminal
node server.js
# Backend em http://localhost:3000 com /openaq, /airnow, /s5p
```

2) Configurar o frontend (`index.html`), antes de carregar `assets/js/main.js`:
```html
<script>
  // Proxy OpenAQ para evitar CORS (ground)
  window.OPENAQ_PROXY = 'http://localhost:3000/openaq';
  // Substituto do TEMPO via S5P (satélite) – implemente /s5p no backend
  window.TEMPO_API_URL = 'http://localhost:3000/s5p';
  // (Opcional) AirNow nos EUA para PM2.5/O3 via backend
  window.AIRNOW_URL = 'http://localhost:3000/airnow';
  // Observação: o frontend já usa OPENAQ_PROXY e TEMPO_API_URL.
  // Se quiser ligar AirNow no lugar do OpenAQ em bbox nos EUA, peça para habilitarmos no main.js.
</script>
```

3) Rodar o site localmente (sem file://):
- Use Live Server (VS Code) ou:
```bash
# Python
python -m http.server 5173
# Ou Node
npx http-server -p 5173
```
Abra `http://localhost:5173`.

4) Testar Ground (sensores terrestres – OpenAQ)
- Selecione “Ground Sensors”.
- Marque PM2.5/NO₂/O₃/CH₂O conforme desejar.
- Mova/zoome o mapa para capitais/áreas com estações.
- Deve aparecer pontos; se não, verifique o Console (CORS/erro de rede) e se `OPENAQ_PROXY` está setado.

5) Testar Satélite (substituindo TEMPO por S5P)
- Selecione “TEMPO (NASA)” (o frontend usa `window.TEMPO_API_URL`).
- Implemente o endpoint `/s5p` do seu backend para retornar `[{lat,lon,no2?,o3?,ch2o?,time?}]` com base em CDSE/WEkEO/GEE.
- Ao retornar pontos, o mapa exibirá NO₂/O₃/CH₂O.

6) Testar AirNow (opcional, EUA)
- Com a chave em `AIRNOW_API_KEY`, acesse `http://localhost:3000/airnow?bbox=-125,24,-66,49&datetime=2025-10-05T12:00` no navegador para validar JSON.
- Para usar no mapa, podemos alternar o ground para `AIRNOW_URL` nos EUA (solicite ativação no `main.js`).

7) Dicas e troubleshooting
- CORS: sempre use os endpoints do backend no frontend; evite chamar domínios externos direto.
- Vazios: se não aparecer pontos, tente outra região/horário (Timeline) ou aumente o zoom.
- Performance: implemente cache por bbox+tempo no backend para /s5p.


