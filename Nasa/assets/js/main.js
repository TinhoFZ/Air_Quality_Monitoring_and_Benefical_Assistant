const map = L.map('map', {worldCopyJump:true}).setView([20,0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

if(L.Control && L.Control.geocoder){
  L.Control.geocoder({defaultMarkGeocode:true, placeholder:'Search location'})
    .on('markgeocode', e=>{
      const bbox=e.geocode.bbox;
      const poly=L.polygon([
        bbox.getSouthEast(),bbox.getNorthEast(),
        bbox.getNorthWest(),bbox.getSouthWest()
      ]);
      map.fitBounds(poly.getBounds().pad(0.5));
    }).addTo(map);
}

const mapLayers = {
  pm25: L.layerGroup(),
  no2: L.layerGroup(),
  o3: L.layerGroup(),
  ch2o: L.layerGroup(),
  temp: L.layerGroup(),
  humidity: L.layerGroup(),
  wind: L.layerGroup()
};

Object.values(mapLayers).forEach(layer => layer.addTo(map));

const colors = {
  Good:'#2ecc71', Moderate:'#f1c40f', Sensitive:'#ff8c00',
  Unhealthy:'#e74c3c', Very:'#8e44ad', Hazardous:'#7f1d1d'
};

function getAQICategory(pm25) {
  if (pm25 <= 12) return { category: 'Good', color: colors.Good };
  if (pm25 <= 35) return { category: 'Moderate', color: colors.Moderate };
  if (pm25 <= 55) return { category: 'Sensitive', color: colors.Sensitive };
  if (pm25 <= 150) return { category: 'Unhealthy', color: colors.Unhealthy };
  if (pm25 <= 250) return { category: 'Very', color: colors.Very };
  return { category: 'Hazardous', color: colors.Hazardous };
}

const realCities = [
  // North America
  { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'USA' },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, country: 'USA' },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298, country: 'USA' },
  { name: 'Houston', lat: 29.7604, lon: -95.3698, country: 'USA' },
  { name: 'Phoenix', lat: 33.4484, lon: -112.0740, country: 'USA' },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832, country: 'Canada' },
  { name: 'Vancouver', lat: 49.2827, lon: -123.1207, country: 'Canada' },
  { name: 'Mexico City', lat: 19.4326, lon: -99.1332, country: 'Mexico' },
  
  // South America
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333, country: 'Brazil' },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, country: 'Brazil' },
  { name: 'Brasília', lat: -15.7801, lon: -47.9292, country: 'Brazil' },
  { name: 'Belo Horizonte', lat: -19.9167, lon: -43.9345, country: 'Brazil' },
  { name: 'Salvador', lat: -12.9714, lon: -38.5014, country: 'Brazil' },
  { name: 'Buenos Aires', lat: -34.6118, lon: -58.3960, country: 'Argentina' },
  { name: 'Santiago', lat: -33.4489, lon: -70.6693, country: 'Chile' },
  { name: 'Bogotá', lat: 4.7110, lon: -74.0721, country: 'Colombia' },
  
  // Europe
  { name: 'London', lat: 51.5074, lon: -0.1278, country: 'UK' },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France' },
  { name: 'Berlin', lat: 52.5200, lon: 13.4050, country: 'Germany' },
  { name: 'Madrid', lat: 40.4168, lon: -3.7038, country: 'Spain' },
  { name: 'Rome', lat: 41.9028, lon: 12.4964, country: 'Italy' },
  { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, country: 'Netherlands' },
  { name: 'Vienna', lat: 48.2082, lon: 16.3738, country: 'Austria' },
  { name: 'Warsaw', lat: 52.2297, lon: 21.0122, country: 'Poland' },
  { name: 'Moscow', lat: 55.7558, lon: 37.6176, country: 'Russia' },
  { name: 'Istanbul', lat: 41.0082, lon: 28.9784, country: 'Turkey' },
  
  // Asia
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'China' },
  { name: 'Shanghai', lat: 31.2304, lon: 121.4737, country: 'China' },
  { name: 'Delhi', lat: 28.7041, lon: 77.1025, country: 'India' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'India' },
  { name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'South Korea' },
  { name: 'Bangkok', lat: 13.7563, lon: 100.5018, country: 'Thailand' },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'Singapore' },
  { name: 'Jakarta', lat: -6.2088, lon: 106.8456, country: 'Indonesia' },
  { name: 'Manila', lat: 14.5995, lon: 120.9842, country: 'Philippines' },
  
  // Africa & Middle East
  { name: 'Cairo', lat: 30.0444, lon: 31.2357, country: 'Egypt' },
  { name: 'Lagos', lat: 6.5244, lon: 3.3792, country: 'Nigeria' },
  { name: 'Johannesburg', lat: -26.2041, lon: 28.0473, country: 'South Africa' },
  { name: 'Nairobi', lat: -1.2921, lon: 36.8219, country: 'Kenya' },
  { name: 'Casablanca', lat: 33.5731, lon: -7.5898, country: 'Morocco' },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'UAE' },
  { name: 'Riyadh', lat: 24.7136, lon: 46.6753, country: 'Saudi Arabia' },
  { name: 'Tel Aviv', lat: 32.0853, lon: 34.7818, country: 'Israel' },
  
  // Oceania
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia' },
  { name: 'Melbourne', lat: -37.8136, lon: 144.9631, country: 'Australia' },
  { name: 'Perth', lat: -31.9505, lon: 115.8605, country: 'Australia' },
  { name: 'Auckland', lat: -36.8485, lon: 174.7633, country: 'New Zealand' }
];

async function fetchRealAirQualityData() {
  const bounds = map.getBounds();
  const west = bounds.getWest();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const north = bounds.getNorth();
  const hours = parseInt(document.getElementById('timeline').value) || 0;
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  const wanted = [];
  if (document.getElementById('pm25').checked) wanted.push('pm25');
  if (document.getElementById('no2').checked) wanted.push('no2');
  if (document.getElementById('o3').checked) wanted.push('o3');
  if (document.getElementById('ch2o')?.checked) wanted.push('hcho');

  // Se nada marcado, não busca
  if (wanted.length === 0) return [];

  // Buscar por parâmetro e mesclar por local (lat/lon+station)
  const byKey = new Map();
  const OPENAQ_PROXY = window.OPENAQ_PROXY || '';
  for (const parameter of wanted) {
    const qs = `date_from=${encodeURIComponent(since)}&parameter=${parameter}&limit=1000&sort=desc&order_by=datetime&bbox=${west},${south},${east},${north}`;
    const url = OPENAQ_PROXY
      ? `${OPENAQ_PROXY}?${qs}`
      : `https://api.openaq.org/v2/measurements?${qs}`;
    const res = await fetch(url);
    if (!res.ok) continue;
    const js = await res.json();
    (js.results || []).forEach(r => {
      if (!r.coordinates) return;
      const key = `${r.location}|${r.coordinates.latitude.toFixed(4)},${r.coordinates.longitude.toFixed(4)}`;
      const existing = byKey.get(key) || {
        lat: r.coordinates.latitude,
        lon: r.coordinates.longitude,
        pm25: null,
        no2: null,
        o3: null,
        ch2o: null,
        source: 'OpenAQ Sensors',
        station: r.location,
        city: r.city || 'Unknown',
        country: r.country || 'Unknown',
        timestamp: new Date(r.date.utc)
      };
      if (r.parameter === 'pm25') existing.pm25 = r.value;
      if (r.parameter === 'no2') existing.no2 = r.value;
      if (r.parameter === 'o3') existing.o3 = r.value;
      if (r.parameter === 'hcho') existing.ch2o = r.value;
      byKey.set(key, existing);
    });
  }
  return Array.from(byKey.values());
}

// Coletor TEMPO real (configurável): defina window.TEMPO_API_URL para um endpoint que aceite bbox e horas
// Ex.: window.TEMPO_API_URL = 'https://seu-proxy/tempo';
async function fetchTEMPOPoints(hoursAgo = 0) {
  const bounds = map.getBounds();
  const query = new URLSearchParams({
    west: String(bounds.getWest()),
    south: String(bounds.getSouth()),
    east: String(bounds.getEast()),
    north: String(bounds.getNorth()),
    hours: String(hoursAgo)
  });
  const base = window.TEMPO_API_URL;
  if (!base) return [];
  const url = `${base}?${query.toString()}`;
  const res = await fetch(url, { credentials: 'omit' });
  if (!res.ok) return [];
  const data = await res.json();
  // Espera-se um array de objetos: {lat, lon, pm25?, no2?, o3?, ch2o?, site?, time?}
  if (!Array.isArray(data)) return [];
  return data.map(r => ({
    lat: r.lat,
    lon: r.lon,
    pm25: r.pm25 ?? null,
    no2: r.no2 ?? null,
    o3: r.o3 ?? null,
    ch2o: r.ch2o ?? r.hcho ?? null,
    source: 'NASA TEMPO',
    station: r.site || 'TEMPO',
    city: r.city || null,
    country: r.country || null,
    timestamp: r.time ? new Date(r.time) : new Date()
  }));
}

function generateBackupRealData() {
  const points = [];
  
  // Data based on approximate real measurements from different cities
  const realAirQualityData = {
    // North America
    'New York': { pm25: 18, no2: 32, o3: 25, temp: 15, humidity: 55 },
    'Los Angeles': { pm25: 35, no2: 55, o3: 42, temp: 22, humidity: 45 },
    'Chicago': { pm25: 22, no2: 38, o3: 28, temp: 12, humidity: 60 },
    'Houston': { pm25: 28, no2: 42, o3: 35, temp: 25, humidity: 70 },
    'Phoenix': { pm25: 32, no2: 45, o3: 38, temp: 30, humidity: 35 },
    'Toronto': { pm25: 15, no2: 28, o3: 20, temp: 8, humidity: 65 },
    'Vancouver': { pm25: 12, no2: 25, o3: 18, temp: 15, humidity: 75 },
    'Mexico City': { pm25: 55, no2: 70, o3: 48, temp: 25, humidity: 50 },
    
    // South America
    'São Paulo': { pm25: 28, no2: 45, o3: 35, temp: 24, humidity: 68 },
    'Rio de Janeiro': { pm25: 22, no2: 38, o3: 28, temp: 26, humidity: 72 },
    'Brasília': { pm25: 15, no2: 25, o3: 20, temp: 28, humidity: 45 },
    'Belo Horizonte': { pm25: 20, no2: 35, o3: 25, temp: 26, humidity: 60 },
    'Salvador': { pm25: 18, no2: 30, o3: 22, temp: 28, humidity: 75 },
    'Buenos Aires': { pm25: 25, no2: 40, o3: 30, temp: 20, humidity: 55 },
    'Santiago': { pm25: 30, no2: 45, o3: 35, temp: 22, humidity: 40 },
    'Bogotá': { pm25: 35, no2: 48, o3: 40, temp: 18, humidity: 65 },
    
    // Europe
    'London': { pm25: 12, no2: 28, o3: 18, temp: 10, humidity: 75 },
    'Paris': { pm25: 16, no2: 35, o3: 22, temp: 12, humidity: 70 },
    'Berlin': { pm25: 14, no2: 30, o3: 20, temp: 8, humidity: 65 },
    'Madrid': { pm25: 18, no2: 38, o3: 25, temp: 15, humidity: 55 },
    'Rome': { pm25: 22, no2: 40, o3: 28, temp: 18, humidity: 60 },
    'Amsterdam': { pm25: 15, no2: 32, o3: 22, temp: 10, humidity: 70 },
    'Vienna': { pm25: 16, no2: 35, o3: 24, temp: 12, humidity: 65 },
    'Warsaw': { pm25: 20, no2: 38, o3: 26, temp: 8, humidity: 60 },
    'Moscow': { pm25: 18, no2: 35, o3: 25, temp: 5, humidity: 60 },
    'Istanbul': { pm25: 35, no2: 55, o3: 42, temp: 18, humidity: 65 },
    
    // Asia
    'Tokyo': { pm25: 20, no2: 40, o3: 30, temp: 18, humidity: 60 },
    'Beijing': { pm25: 65, no2: 80, o3: 55, temp: 20, humidity: 35 },
    'Shanghai': { pm25: 45, no2: 60, o3: 40, temp: 22, humidity: 70 },
    'Delhi': { pm25: 85, no2: 95, o3: 70, temp: 30, humidity: 40 },
    'Mumbai': { pm25: 75, no2: 85, o3: 60, temp: 32, humidity: 75 },
    'Seoul': { pm25: 35, no2: 50, o3: 38, temp: 15, humidity: 55 },
    'Bangkok': { pm25: 42, no2: 58, o3: 38, temp: 35, humidity: 80 },
    'Singapore': { pm25: 25, no2: 35, o3: 28, temp: 30, humidity: 85 },
    'Jakarta': { pm25: 55, no2: 65, o3: 45, temp: 32, humidity: 80 },
    'Manila': { pm25: 48, no2: 60, o3: 42, temp: 32, humidity: 75 },
    
    // Africa & Middle East
    'Cairo': { pm25: 45, no2: 60, o3: 40, temp: 32, humidity: 25 },
    'Lagos': { pm25: 65, no2: 75, o3: 55, temp: 30, humidity: 80 },
    'Johannesburg': { pm25: 35, no2: 45, o3: 32, temp: 22, humidity: 50 },
    'Nairobi': { pm25: 38, no2: 48, o3: 35, temp: 25, humidity: 60 },
    'Casablanca': { pm25: 42, no2: 55, o3: 38, temp: 20, humidity: 65 },
    'Dubai': { pm25: 55, no2: 70, o3: 48, temp: 35, humidity: 45 },
    'Riyadh': { pm25: 65, no2: 80, o3: 55, temp: 38, humidity: 30 },
    'Tel Aviv': { pm25: 32, no2: 45, o3: 35, temp: 25, humidity: 60 },
    
    // Oceania
    'Sydney': { pm25: 8, no2: 15, o3: 12, temp: 22, humidity: 55 },
    'Melbourne': { pm25: 12, no2: 22, o3: 18, temp: 18, humidity: 65 },
    'Perth': { pm25: 10, no2: 18, o3: 15, temp: 25, humidity: 45 },
    'Auckland': { pm25: 8, no2: 15, o3: 12, temp: 20, humidity: 70 }
  };
  
  realCities.forEach(city => {
    const data = realAirQualityData[city.name] || { 
      pm25: 20 + Math.random() * 30, 
      no2: 25 + Math.random() * 25, 
      o3: 15 + Math.random() * 20,
      temp: 20 + Math.random() * 15,
      humidity: 40 + Math.random() * 40
    };
    
    points.push({
      lat: city.lat,
      lon: city.lon,
      pm25: Math.round(data.pm25),
      no2: Math.round(data.no2),
      o3: Math.round(data.o3),
      temp: Math.round(data.temp),
      humidity: Math.round(data.humidity),
      windSpeed: Math.round(Math.random() * 15 + 5),
      source: 'Real Data',
      station: `${city.name} Station`,
      city: city.name,
      country: city.country,
      timestamp: new Date()
    });
  });

  // Add pollution hotspots (traffic, industrial, fires, dust)
  const hotspots = [
    // Traffic hotspots
    { lat: 40.7589, lon: -73.9851, type: 'traffic', name: 'Times Square', city: 'New York', intensity: 'high' },
    { lat: 34.0522, lon: -118.2437, type: 'traffic', name: 'Hollywood Blvd', city: 'Los Angeles', intensity: 'high' },
    { lat: 51.5074, lon: -0.1278, type: 'traffic', name: 'Oxford Street', city: 'London', intensity: 'medium' },
    { lat: 48.8566, lon: 2.3522, type: 'traffic', name: 'Champs-Élysées', city: 'Paris', intensity: 'medium' },
    { lat: 35.6762, lon: 139.6503, type: 'traffic', name: 'Shibuya Crossing', city: 'Tokyo', intensity: 'high' },
    
    // Industrial areas
    { lat: 40.7128, lon: -74.0060, type: 'industrial', name: 'Industrial Zone', city: 'New York', intensity: 'high' },
    { lat: 39.9042, lon: 116.4074, type: 'industrial', name: 'Steel Plant', city: 'Beijing', intensity: 'very_high' },
    { lat: 28.7041, lon: 77.1025, type: 'industrial', name: 'Manufacturing Hub', city: 'Delhi', intensity: 'very_high' },
    { lat: -23.5505, lon: -46.6333, type: 'industrial', name: 'Industrial District', city: 'São Paulo', intensity: 'high' },
    
    // Fire hotspots (simulated)
    { lat: 34.0522, lon: -118.5000, type: 'fire', name: 'Wildfire Zone', city: 'Los Angeles', intensity: 'very_high' },
    { lat: 38.5816, lon: -121.4944, type: 'fire', name: 'Forest Fire', city: 'Sacramento', intensity: 'high' },
    { lat: -33.8688, lon: 151.2093, type: 'fire', name: 'Bushfire Area', city: 'Sydney', intensity: 'medium' },
    
    // Dust/sandstorm areas
    { lat: 30.0444, lon: 31.2357, type: 'dust', name: 'Sahara Dust', city: 'Cairo', intensity: 'high' },
    { lat: 25.2048, lon: 55.2708, type: 'dust', name: 'Sandstorm Zone', city: 'Dubai', intensity: 'medium' },
    { lat: 24.7136, lon: 46.6753, type: 'dust', name: 'Desert Dust', city: 'Riyadh', intensity: 'high' }
  ];

  hotspots.forEach(hotspot => {
    const intensityMultiplier = {
      'low': 1.2,
      'medium': 1.5,
      'high': 2.0,
      'very_high': 2.5
    }[hotspot.intensity] || 1.0;

    points.push({
      lat: hotspot.lat + (Math.random() - 0.5) * 0.1,
      lon: hotspot.lon + (Math.random() - 0.5) * 0.1,
      pm25: Math.round(30 + Math.random() * 50 * intensityMultiplier),
      no2: Math.round(40 + Math.random() * 40 * intensityMultiplier),
      o3: Math.round(25 + Math.random() * 30 * intensityMultiplier),
      temp: Math.round(20 + Math.random() * 20),
      humidity: Math.round(30 + Math.random() * 50),
      windSpeed: Math.round(Math.random() * 20 + 5),
      source: 'Pollution Hotspot',
      station: `${hotspot.name} (${hotspot.type})`,
      city: hotspot.city,
      country: 'Various',
      type: hotspot.type,
      intensity: hotspot.intensity,
      timestamp: new Date()
    });
  });
  
  return points;
}

async function fetchWeatherData(lat, lon) {
  try {
    // Usando OpenWeatherMap API (requer chave API)
    // Para demo, vamos usar dados simulados baseados na localização
    const weatherData = {
      temp: Math.round(20 + Math.random() * 20),
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(Math.random() * 15 + 5),
      pressure: Math.round(1000 + Math.random() * 50)
    };
    
    return weatherData;
  } catch (error) {
    console.log('Weather API not available, using simulated data');
    return {
      temp: Math.round(20 + Math.random() * 20),
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(Math.random() * 15 + 5),
      pressure: Math.round(1000 + Math.random() * 50)
    };
  }
}

async function updateMapLayers(source = 'tempo', hoursAgo = 0) {
  Object.values(mapLayers).forEach(layer => layer.clearLayers());
  const center = map.getCenter();
  
  // Show loading indicator
  const loadingMarker = L.marker([center.lat, center.lng], {
    icon: L.divIcon({
      html: '<div style="background: #3498db; color: white; padding: 8px; border-radius: 50%; font-size: 12px;">Loading...</div>',
      className: 'loading-marker',
      iconSize: [60, 60]
    })
  }).addTo(map);
  
  let points = [];
  try {
    if (source === 'ground') {
      points = await fetchRealAirQualityData();
    } else if (source === 'tempo') {
      points = await fetchTEMPOPoints(hoursAgo);
    } else if (source === 'combined') {
      const [g, t] = await Promise.all([
        fetchRealAirQualityData(),
        fetchTEMPOPoints(hoursAgo)
      ]);
      points = g.concat(t);
    } else {
      points = await fetchRealAirQualityData();
    }
    console.log(`Loaded ${points.length} real data points from ${source}`);
  } catch (error) {
    console.log('Error loading data:', error);
    points = [];
  }
  
  // Remove loading indicator
  map.removeLayer(loadingMarker);
  
  const activeLayers = [];
  if (document.getElementById('pm25').checked) activeLayers.push('pm25');
  if (document.getElementById('no2').checked) activeLayers.push('no2');
  if (document.getElementById('o3').checked) activeLayers.push('o3');
  if (document.getElementById('temp').checked) activeLayers.push('temp');
  if (document.getElementById('humidity').checked) activeLayers.push('humidity');
  if (document.getElementById('wind').checked) activeLayers.push('wind');
  if (document.getElementById('ch2o').checked) activeLayers.push('ch2o');
  
  points.forEach(point => {
    if (activeLayers.includes('pm25') && point.pm25) {
      const aqi = getAQICategory(point.pm25);
      const marker = L.circleMarker([point.lat, point.lon], {
        radius: Math.max(6, Math.min(15, point.pm25 / 5)), // Tamanho baseado na poluição
        fillColor: aqi.color,
        color: '#000',
        weight: 0.5,
        fillOpacity: 0.8
      }).bindPopup(`
      <div style="min-width: 220px;">
        <h4 style="margin: 0 0 8px; color: #2c3e50;">${point.city || 'Unknown City'}</h4>
        <div style="margin-bottom: 8px;">
          <strong>📍 ${point.station}</strong><br>
          <small style="color: #7f8c8d;">${point.country} • ${point.source}</small>
          ${point.type ? `<br><span style="background: ${point.type === 'traffic' ? '#ff6b6b' : point.type === 'industrial' ? '#ffa726' : point.type === 'fire' ? '#ef5350' : '#8d6e63'}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${point.type.toUpperCase()} HOTSPOT</span>` : ''}
        </div>
        <div style="background: ${aqi.color}20; padding: 8px; border-radius: 6px; margin: 8px 0;">
          <strong>PM2.5:</strong> ${point.pm25} µg/m³<br>
          <strong>Category:</strong> ${aqi.category}
        </div>
        ${point.no2 ? `<strong>NO₂:</strong> ${point.no2} µg/m³<br>` : ''}
        ${point.o3 ? `<strong>O₃:</strong> ${point.o3} µg/m³<br>` : ''}
        ${point.ch2o ? `<strong>CH₂O:</strong> ${point.ch2o} µg/m³<br>` : ''}
        ${point.intensity ? `<strong>🔥 Intensity:</strong> ${point.intensity}<br>` : ''}
        <small style="color: #95a5a6; margin-top: 8px; display: block;">
          Updated: ${point.timestamp ? point.timestamp.toLocaleString() : 'Now'}
        </small>
      </div>
      `);
      mapLayers.pm25.addLayer(marker);
    }
    
    if (activeLayers.includes('no2') && point.no2) {
      const no2Color = point.no2 > 50 ? '#e74c3c' : point.no2 > 30 ? '#f39c12' : '#3498db';
      const marker = L.circleMarker([point.lat, point.lon], {
        radius: Math.max(4, Math.min(10, point.no2 / 8)),
        fillColor: no2Color,
        color: '#2980b9',
        weight: 1,
        fillOpacity: 0.7
      }).bindPopup(`
        <div style="min-width: 180px;">
          <h4 style="margin: 0 0 8px;">${point.city || 'Unknown City'}</h4>
          <strong>NO₂:</strong> ${point.no2} µg/m³<br>
          <small>${point.station}</small>
        </div>
      `);
      mapLayers.no2.addLayer(marker);
    }
    
    if (activeLayers.includes('o3') && point.o3) {
      const o3Color = point.o3 > 60 ? '#e74c3c' : point.o3 > 40 ? '#f39c12' : '#27ae60';
      const marker = L.circleMarker([point.lat, point.lon], {
        radius: Math.max(4, Math.min(10, point.o3 / 10)),
        fillColor: o3Color,
        color: '#e67e22',
        weight: 1,
        fillOpacity: 0.7
      }).bindPopup(`
        <div style="min-width: 180px;">
          <h4 style="margin: 0 0 8px;">${point.city || 'Unknown City'}</h4>
          <strong>O₃:</strong> ${point.o3} µg/m³<br>
          <small>${point.station}</small>
        </div>
      `);
      mapLayers.o3.addLayer(marker);
    }
    
    if (activeLayers.includes('ch2o') && point.ch2o) {
      const hchoColor = point.ch2o > 10 ? '#e74c3c' : point.ch2o > 5 ? '#f39c12' : '#27ae60';
      const marker = L.circleMarker([point.lat, point.lon], {
        radius: Math.max(4, Math.min(10, point.ch2o / 2)),
        fillColor: hchoColor,
        color: '#16a085',
        weight: 1,
        fillOpacity: 0.7
      }).bindPopup(`
        <div style="min-width: 180px;">
          <h4 style="margin: 0 0 8px;">${point.city || 'Unknown City'}</h4>
          <strong>CH₂O:</strong> ${point.ch2o} µg/m³<br>
          <small>${point.station}</small>
        </div>
      `);
      mapLayers.ch2o.addLayer(marker);
    }
    
    if (activeLayers.includes('temp') && point.temp) {
      const tempColor = point.temp > 35 ? '#e74c3c' : point.temp > 25 ? '#f39c12' : point.temp > 15 ? '#27ae60' : '#3498db';
      const marker = L.circleMarker([point.lat, point.lon], {
        radius: 5,
        fillColor: tempColor,
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8
      }).bindPopup(`
        <div style="min-width: 160px;">
          <h4 style="margin: 0 0 8px;">${point.city || 'Unknown City'}</h4>
          <strong>🌡️ Temperature:</strong> ${point.temp}°C<br>
          <small>${point.station}</small>
        </div>
      `);
      mapLayers.temp.addLayer(marker);
    }
    
    if (activeLayers.includes('humidity') && point.humidity) {
      const humidityColor = point.humidity > 80 ? '#3498db' : point.humidity > 60 ? '#27ae60' : '#f39c12';
      const marker = L.circleMarker([point.lat, point.lon], {
        radius: 4,
        fillColor: humidityColor,
        color: '#8e44ad',
        weight: 1,
        fillOpacity: 0.7
      }).bindPopup(`
        <div style="min-width: 160px;">
          <h4 style="margin: 0 0 8px;">${point.city || 'Unknown City'}</h4>
          <strong>💧 Humidity:</strong> ${point.humidity}%<br>
          <small>${point.station}</small>
        </div>
      `);
      mapLayers.humidity.addLayer(marker);
    }
    
    if (activeLayers.includes('wind') && point.windSpeed) {
      const windColor = point.windSpeed > 15 ? '#e74c3c' : point.windSpeed > 10 ? '#f39c12' : '#27ae60';
      const marker = L.circleMarker([point.lat, point.lon], {
        radius: 4,
        fillColor: windColor,
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8
      }).bindPopup(`
        <div style="min-width: 160px;">
          <h4 style="margin: 0 0 8px;">${point.city || 'Unknown City'}</h4>
          <strong>💨 Wind:</strong> ${point.windSpeed} km/h<br>
          <small>${point.station}</small>
        </div>
      `);
      mapLayers.wind.addLayer(marker);
    }
  });
}

document.getElementById('timeline').addEventListener('input', async e => {
  const hours = parseInt(e.target.value);
  const label = hours === 0 ? 'Now' : `${hours}h ago`;
  document.getElementById('timeline-label').textContent = label;
  
  const source = document.querySelector('input[name="source"]:checked').value;
  await updateMapLayers(source, hours);
});

document.querySelectorAll('input[name="source"]').forEach(radio => {
  radio.addEventListener('change', async () => {
    const hours = parseInt(document.getElementById('timeline').value);
    await updateMapLayers(radio.value, hours);
  });
});

document.querySelectorAll('#pm25, #no2, #o3, #temp, #humidity, #wind').forEach(checkbox => {
  checkbox.addEventListener('change', async () => {
    const hours = parseInt(document.getElementById('timeline').value);
    const source = document.querySelector('input[name="source"]:checked').value;
    await updateMapLayers(source, hours);
  });
});

document.getElementById('btn-locate').onclick = () => {
  if(!navigator.geolocation){
    alert('Geolocation not supported by your browser.');
    return;
  }
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude, longitude} = pos.coords;
    map.setView([latitude, longitude], 12);
    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup('Você está aqui.')
      .openPopup();
  }, ()=>alert('Unable to get your location.'));
};

const btnMap = document.getElementById('btn-map');
if (btnMap) btnMap.onclick = () => { window.location.href = "index.html"; };
const btnDash = document.getElementById('btn-dashboard');
if (btnDash) btnDash.onclick = () => { window.location.href = "graf.html"; };
const btnAI = document.getElementById('btn-ai');
if (btnAI) btnAI.onclick = () => { window.location.href = "IA.html"; };
const btnHist = document.getElementById('btn-history');
if (btnHist) btnHist.onclick = () => { window.location.href = "historico.html"; };
const btnComm = document.getElementById('btn-community');
if (btnComm) btnComm.onclick = () => { window.location.href = "comunidade.html"; };

map.whenReady(async () => {
  await updateMapLayers('tempo', 0);
});

map.on('moveend', async () => {
  const hours = parseInt(document.getElementById('timeline').value);
  const source = document.querySelector('input[name="source"]:checked').value;
  await updateMapLayers(source, hours);
});