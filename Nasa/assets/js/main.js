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

const colors = {
  Good:'#2ecc71', Moderate:'#f1c40f', Sensitive:'#ff8c00',
  Unhealthy:'#e74c3c', Very:'#8e44ad', Hazardous:'#7f1d1d'
};

const cities = [
  {n:'London',lat:51.50,lon:-0.12,cat:'Moderate'},
  {n:'New York',lat:40.71,lon:-74.00,cat:'Sensitive'},
  {n:'Delhi',lat:28.61,lon:77.20,cat:'Unhealthy'},
  {n:'Sydney',lat:-33.86,lon:151.20,cat:'Good'},
  {n:'Tokyo',lat:35.68,lon:139.69,cat:'Very'},
  {n:'Riyadh',lat:24.71,lon:46.67,cat:'Hazardous'}
];

cities.forEach(c=>{
  const color = colors[c.cat] || '#999';
  L.circleMarker([c.lat, c.lon],{
    radius:8, fillColor:color, color:'#00000030',
    fillOpacity:.9, weight:1
  }).bindTooltip(`${c.n}<br><small>${c.cat}</small>`)
    .addTo(map);
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
      .bindPopup('You are here.')
      .openPopup();
  }, ()=>alert('Unable to get your location.'));
};

document.getElementById('btn-info').onclick = () => {
  window.location.href = "graf.html";
};
document.getElementById('btn-bot').onclick = () => {
  window.location.href = "IA.html";
};
