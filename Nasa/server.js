const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const app = express();

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

// OpenAQ proxy to avoid CORS
app.get('/openaq', async (req, res) => {
  try {
    const qs = new URLSearchParams(req.query).toString();
    const r = await fetch('https://api.openaq.org/v2/measurements?' + qs);
    const body = await r.text();
    res.status(r.status).type(r.headers.get('content-type') || 'application/json').send(body);
  } catch (e) {
    res.status(500).json({ error: 'OpenAQ proxy failed', detail: String(e) });
  }
});

// AirNow proxy (requires API key)
// Set AIRNOW_API_KEY env var. Endpoint: /airnow?bbox=west,south,east,north&datetime=YYYY-MM-DDThh:mm
app.get('/airnow', async (req, res) => {
  const key = process.env.AIRNOW_API_KEY;
  if (!key) return res.status(500).json({ error: 'Missing AIRNOW_API_KEY' });
  try {
    const { bbox, datetime } = req.query;
    const url = new URL('https://www.airnowapi.org/aq/data/');
    // AirNow Data endpoint params
    // Parameters: startDate, endDate, parameters=PM25,OZONE, dataType=A,B, format=application/json, bbox, API_KEY
    const start = datetime || new Date().toISOString().slice(0, 16);
    const end = start;
    url.searchParams.set('startDate', start);
    url.searchParams.set('endDate', end);
    url.searchParams.set('parameters', 'PM25,OZONE');
    url.searchParams.set('dataType', 'A');
    url.searchParams.set('format', 'application/json');
    if (bbox) url.searchParams.set('BBOX', bbox);
    url.searchParams.set('API_KEY', key);
    const r = await fetch(url.toString());
    const data = await r.json();
    // Normalize to points
    const points = (Array.isArray(data) ? data : []).map(d => ({
      lat: d.Latitude,
      lon: d.Longitude,
      pm25: d.Parameter === 'PM25' ? d.Value : null,
      o3: d.Parameter === 'OZONE' ? d.Value : null,
      station: d.SiteName || 'AirNow',
      source: 'AirNow',
      time: d.UTC || d.DateObserved
    }));
    res.json(points);
  } catch (e) {
    res.status(500).json({ error: 'AirNow failed', detail: String(e) });
  }
});

// Sentinel-5P (S5P) placeholder endpoint
// Implement with your chosen provider (CDSE/WEkEO/GEE). Expect: /s5p?west=&south=&east=&north=&hours=&vars=no2,o3,ch2o
app.get('/s5p', async (req, res) => {
  // TODO: Implement provider integration. For now, return empty array to keep frontend working.
  res.json([]);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend on http://localhost:${port}`));


