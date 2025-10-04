const chat = document.getElementById('chat');
const msg  = document.getElementById('msg');
const send = document.getElementById('send');

function appendBubble(text, me=false){
  const b = document.createElement('div');
  b.className = 'bubble' + (me ? ' me':'' );
  b.textContent = text;
  chat.appendChild(b);
  b.scrollIntoView({behavior:'smooth', block:'end'});
}

send.addEventListener('click', ()=>{
  const t = msg.value.trim();
  if(!t) return;
  appendBubble(t, true);
  msg.value='';
  setTimeout(()=>appendBubble('Beleza! Posso usar sua localização ou você pode informar a cidade.'), 350);
});
msg.addEventListener('keydown', e=>{
  if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send.click(); }
});

document.getElementById('rb-locate').addEventListener('click', ()=>{
  if(!navigator.geolocation){
    appendBubble('Geolocalização indisponível no seu navegador.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const {latitude, longitude} = pos.coords;
      appendBubble(`Localização detectada: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}.`);
    },
    () => appendBubble('Não consegui obter sua localização. Verifique as permissões.')
  );
});

document.getElementById('rb-info').addEventListener('click', ()=>{
  appendBubble('Faixas AQI (EPA): 0–50 Good · 51–100 Moderate · 101–150 USG · 151–200 Unhealthy · 201–300 Very · 301+ Hazardous.');
});

document.getElementById('rb-bot').addEventListener('click', ()=>{
  appendBubble('👋 Olá! Sou o assistente Air QMBA. Diga sua cidade ou toque no botão de localização.');
});

document.getElementById('rb-locate').onclick = () => {
  window.location.href = "index.html";
};

document.getElementById('rb-info').onclick = () => {
  window.location.href = "graf.html";
};

document.getElementById('rb-bot').onclick = () => {
  window.location.href = "IA.html";
};
