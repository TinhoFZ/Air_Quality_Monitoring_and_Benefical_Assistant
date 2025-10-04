const map = L.map('map').setView([-15, -47], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const mapLayers = {
  pm25: L.layerGroup(),
  no2: L.layerGroup(),
  o3: L.layerGroup(),
  temp: L.layerGroup(),
  humidity: L.layerGroup(),
  wind: L.layerGroup()
};

const layerControl = L.control.layers(null, null, { collapsed: false }).addTo(map);
Object.keys(mapLayers).forEach(k => {
  layerControl.addOverlay(mapLayers[k], k.toUpperCase());
});

const timelineControl = L.control({ position: 'topright' });
timelineControl.onAdd = function () {
  const div = L.DomUtil.create('div', 'timeline');
  div.innerHTML = `
    <input id="tline" type="range" min="0" max="24" value="0">
    <span id="tlabel">Agora</span>
  `;
  return div;
};
timelineControl.addTo(map);

document.getElementById('tline').addEventListener('input', e => {
  const h = e.target.value;
  document.getElementById('tlabel').textContent = h == 0 ? 'Agora' : `${h}h atrás`;
  updateAllLayers(parseInt(h, 10));
});

function generateRandomPoints(center, count, rangeKm = 300) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const latOffset = (Math.random() - 0.5) * (rangeKm / 100);
    const lonOffset = (Math.random() - 0.5) * (rangeKm / 100);
    points.push({
      lat: center.lat + latOffset,
      lon: center.lng + lonOffset,
      pm25: Math.floor(Math.random() * 200),
      no2: Math.floor(Math.random() * 100),
      o3: Math.floor(Math.random() * 150),
      site: "Sensor " + (i + 1)
    });
  }
  return points;
}

function getColorByPM(v) {
  if (v <= 12) return '#2ecc71';
  if (v <= 35) return '#f1c40f';
  if (v <= 55) return '#ff8c00';
  if (v <= 150) return '#e74c3c';
  if (v <= 250) return '#8e44ad';
  return '#7f1d1d';
}

async function updateAllLayers(hoursAgo = 0) {
  Object.values(mapLayers).forEach(l => l.clearLayers());
  const center = map.getCenter();

  const fakeSensors = generateRandomPoints(center, 20);
  fakeSensors.forEach(s => {
    const color = getColorByPM(s.pm25);
    const marker = L.circleMarker([s.lat, s.lon], {
      radius: 8,
      fillColor: color,
      color: '#000',
      weight: 0.5,
      fillOpacity: 0.9
    }).bindPopup(`
      <b>${s.site}</b><br>
      PM2.5: ${s.pm25} µg/m³<br>
      NO₂: ${s.no2} ppb<br>
      O₃: ${s.o3} ppb
    `);
    mapLayers.pm25.addLayer(marker);
  });

  mapLayers.pm25.addTo(map);
}

map.whenReady(() => updateAllLayers(0));
map.on('moveend', () => updateAllLayers());
