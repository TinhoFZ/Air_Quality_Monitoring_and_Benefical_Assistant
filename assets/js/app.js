const map = L.map('map', { worldCopyJump:true }).setView([ -14.2, -51.9 ], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'© OpenStreetMap' }).addTo(map);

if (L.Control && L.Control.geocoder) {
  L.Control.geocoder({ defaultMarkGeocode:true, placeholder:'Buscar local...' })
    .on('markgeocode', (e) => map.fitBounds(e.geocode.bbox))
    .addTo(map);
}

const layers = {
  pm25: L.layerGroup().addTo(map),
  no2: L.layerGroup(),
  o3: L.layerGroup()
};

function aqiColorPM25(val){
  if (val == null) return '#9ca3af';
  if (val <= 12) return '#22c55e';
  if (val <= 35.4) return '#84cc16';
  if (val <= 55.4) return '#f59e0b';
  if (val <= 150.4) return '#ef4444';
  if (val <= 250.4) return '#8b5cf6';
  return '#6b7280';
}

function addCircle(lat, lon, value, label){
  const color = aqiColorPM25(value);
  const circle = L.circleMarker([lat, lon], {
    radius: 6, color, weight: 1, fillColor: color, fillOpacity: .7
  }).bindPopup(label);
  return circle;
}

async function fetchOpenAQ(bbox, parameter, hours=0){
  const south = bbox.getSouth();
  const west  = bbox.getWest();
  const north = bbox.getNorth();
  const east  = bbox.getEast();

  const now = new Date();
  const start = new Date(now.getTime() - hours*3600*1000).toISOString();
  const url = `https://api.openaq.org/v2/measurements?date_from=${encodeURIComponent(start)}&parameter=${parameter}&limit=200&page=1&offset=0&sort=desc&order_by=datetime&bbox=${west},${south},${east},${north}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('OpenAQ falhou');
  const js = await res.json();
  return js.results || [];
}

async function fetchTEMPO(){ return []; }

async function updateLayers(){
  const hours = parseInt(document.querySelector('#timeline').value,10) || 0;
  document.querySelector('#tlv').textContent = hours + 'h';
  const source = document.querySelector('input[name="src"]:checked')?.value || 'openaq';
  document.querySelector('#sourceLabel').textContent =
    source === 'openaq' ? 'OpenAQ (provisório)' : 'NASA TEMPO';

  Object.values(layers).forEach(l => l.clearLayers());

  const bbox = map.getBounds();
  const activeParams = Array.from(document.querySelectorAll('.layer:checked')).map(el=>el.value);

  for (const p of activeParams){
    let points = [];
    if (source === 'openaq'){
      const paramName = p === 'pm25' ? 'pm25' : (p === 'no2' ? 'no2' : 'o3');
      points = await fetchOpenAQ(bbox, paramName, hours);
      points.forEach(r => {
        const val = r.value;
        const site = r.location || r.station || 'OpenAQ';
        const popup = `<b>${site}</b><br>${p.toUpperCase()}: ${val} ${r.unit || ''}<br>${new Date(r.date.utc).toLocaleString()}`;
        addCircle(r.coordinates.latitude, r.coordinates.longitude, p==='pm25'?val:null, popup).addTo(layers[p]);
      });
    } else {
      const tempo = await fetchTEMPO(bbox, p, hours);
      tempo.forEach(r => {
        const popup = `<b>${r.site||'TEMPO'}</b><br>${p.toUpperCase()}: ${r.value} (est.)<br>${r.time||''}`;
        addCircle(r.lat, r.lon, p==='pm25'?r.value:null, popup).addTo(layers[p]);
      });
    }
    if (!map.hasLayer(layers[p])) layers[p].addTo(map);
  }
}

map.whenReady(updateLayers);
map.on('moveend', updateLayers);
document.getElementById('timeline').addEventListener('input', updateLayers);
document.querySelectorAll('.layer').forEach(cb => cb.addEventListener('change', updateLayers));
document.querySelectorAll('input[name="src"]').forEach(rb => rb.addEventListener('change', updateLayers));
document.getElementById('btn-reload').addEventListener('click', updateLayers);

document.getElementById('btn-map').onclick = ()=> location.href = 'index.html';
document.getElementById('btn-dashboard').onclick = ()=> location.href = 'graf.html';
document.getElementById('btn-ai').onclick = ()=> location.href = 'IA.html';
document.getElementById('btn-community').onclick = ()=> location.href = 'comunidade.html';
document.getElementById('btn-history').onclick = ()=> location.href = 'historico.html';
